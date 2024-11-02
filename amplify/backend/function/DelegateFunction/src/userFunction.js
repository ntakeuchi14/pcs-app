const cognitoFunction = require("./cognitoFunction.js");
const {
  SEARCH_TYPE,
  HEADERS,
  COMPANY_CODE,
  RESULT_CODE,
  ROLE_NAME,
  LAST_UPDATED_USER,
  USER_NOTE,
} = require("./const.js");
exports.main = async (
  commonParams,
  method,
  queryParams,
  bodyParams,
  poolId
) => {
  switch (method) {
    case "GET":
      return await listUsers(commonParams, queryParams, poolId);
    case "POST":
      return await addUser(bodyParams, poolId);
    case "PUT":
      return await editUser(commonParams, bodyParams, poolId);
    case "PATCH":
      return await changeUserStatus(commonParams, bodyParams, poolId);
    case "DELETE":
      return await deleteUser(commonParams, bodyParams, poolId);
    default:
      return {
        statusCode: RESULT_CODE.NOT_IMPL,
        headers: HEADERS,
        body: JSON.stringify({
          code: RESULT_CODE.NOT_IMPL,
          message: "Not Implemented",
        }),
      };
  }
};

const listUsers = async (commonParams, params, poolId) => {
  if (params.searchType && !SEARCH_TYPE[params.searchType]) {
    return {
      statusCode: RESULT_CODE.APP_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.APP_ERROR,
        message: "invalid search params",
      }),
    };
  }
  const adminUsers = await cognitoFunction.listAdminUsers(poolId);
  let attr = params.searchType && params.keyword ? SEARCH_TYPE[params.searchType] : undefined
  let keyword = params.keyword
  if( params.companyCode ) {
    attr = COMPANY_CODE
    keyword = params.companyCode
  }
  if( commonParams.role !== ROLE_NAME.ADMIN ) {
    attr = COMPANY_CODE
    keyword = commonParams.companyCode
  }
  
  let users = {}
  if( commonParams.role == ROLE_NAME.ADMIN && params.withAuthEvents && params.searchType===SEARCH_TYPE.email && params.keyword ) {
    const userInfo = await cognitoFunction.getUser(poolId, params.keyword);
    users = {
      Users: [{
        Username: userInfo.Username,
        UserCreateDate: userInfo.UserCreateDate,
        UserLastModifiedDate: userInfo.UserLastModifiedDate,
        UserStatus: userInfo.UserStatus,
        Enabled: userInfo.Enabled,
        Attributes: userInfo.UserAttributes
      }]
    }
  } else {
    users = await cognitoFunction.listAllActiveUsers(
      poolId,
      params.limit,
      params.nextToken,
      attr,
      keyword
    );
    if( commonParams.role == ROLE_NAME.ADMIN ) {
      if( params.companyCode && params.searchType && params.keyword ) {
        users.Users = users.Users.filter(u=>{
          if( SEARCH_TYPE[params.searchType] === SEARCH_TYPE.status) {
            return u.Enabled === (params.keyword === 'Enabled')
          } else if( SEARCH_TYPE[params.searchType] === SEARCH_TYPE.userStatus) {
            return u.UserStatus === params.keyword
          } else {
            const values = u.Attributes.filter((_) => _.Name === SEARCH_TYPE[params.searchType]);
            return values.length > 0 && values[0].Value.startsWith(params.keyword)
          }
        })
      }
    } else {
      users.Users = users.Users.filter(u=>u.Enabled )
    }
  }
  
  let authEvents = []
  if( commonParams.role == ROLE_NAME.ADMIN && params.withAuthEvents ) {
    try {
      for( const u of users.Users) {
        const email = u.Attributes.filter((_) => _.Name === SEARCH_TYPE.email);
        const evs = []
        let next = undefined
        do {
          const aes = await cognitoFunction.adminListUserAuthEvents(poolId, email[0].Value, next)
          next = aes.NextToken
          for( const a of aes.AuthEvents) {
            evs.push(a)
            if( evs.length === 10) {
              next = undefined
              break
            }
          }
        } while(next)
        authEvents[email[0].Value] = evs
      }
    } catch {
      authEvents = []
    }
  }
  return {
    statusCode: RESULT_CODE.SUCCESS,
    headers: HEADERS,
    body: JSON.stringify({
      nextToken: users.PaginationToken,
      data: users.Users.map((u) => {
        const name = u.Attributes.filter((_) => _.Name === SEARCH_TYPE.name);
        const email = u.Attributes.filter((_) => _.Name === SEARCH_TYPE.email);
        const companyCode = u.Attributes.filter((_) => _.Name === COMPANY_CODE);
        const lastUpdatedUser = u.Attributes.filter((_) => _.Name === LAST_UPDATED_USER);
        const type = commonParams.role == ROLE_NAME.ADMIN ? u.Attributes.filter((_) => _.Name === SEARCH_TYPE.userType) : [];
        const note = commonParams.role == ROLE_NAME.ADMIN ? u.Attributes.filter((_) => _.Name === USER_NOTE) : [];
        return {
          companyCode:
            companyCode.length > 0 ? companyCode[0].Value : undefined,
          username: name.length > 0 ? name[0].Value : undefined,
          email: email.length > 0 ? email[0].Value : undefined,
          userStatus: u.UserStatus,
          enabled: u.Enabled,
          role:
            adminUsers.filter((_) => _ === u.Username).length > 0
              ? ROLE_NAME.ADMIN
              : ROLE_NAME.NORMAL,
          updatedAt: u.UserLastModifiedDate,
          lastUpdatedUser: lastUpdatedUser.length > 0 ? lastUpdatedUser[0].Value : undefined,
          authEvents: authEvents[email[0].Value],
          type: type.length > 0 ? type[0].Value : undefined,
          note: note.length > 0 ? note[0].Value : undefined,
        };
      }),
    }),
  };
};
const addUser = async (params, poolId) => {
  if (
    !params.username ||
    !params.email ||
    ("admin" !== params.role && !params.companyCode)
  ) {
    return {
      statusCode: RESULT_CODE.APP_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.APP_ERROR,
        message: "invalid addUser params",
      }),
    };
  }
  try {
    await cognitoFunction.addUser(poolId, params);
  } catch (e) {
    if (400 === e.statusCode) {
      if ("UsernameExistsException" === e.code) {
        return {
          statusCode: RESULT_CODE.CONFLICT,
          headers: HEADERS,
          body: JSON.stringify({
            code: RESULT_CODE.CONFLICT,
            message: "email exists",
          }),
        };
      } else {
        return {
          statusCode: RESULT_CODE.APP_ERROR,
          headers: HEADERS,
          body: JSON.stringify({
            code: RESULT_CODE.APP_ERROR,
            message: e.message,
          }),
        };
      }
    }
    throw e;
  }
  return {
    statusCode: RESULT_CODE.SUCCESS,
    headers: HEADERS,
  };
};
const editUser = async (commonParams, params, poolId) => {
  if (
    !params.username ||
    !params.email ||
    ("admin" !== params.role && !params.companyCode)
  ) {
    return {
      statusCode: RESULT_CODE.APP_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.APP_ERROR,
        message: "invalid editUser params",
      }),
    };
  }
  const attrs = [
    {
      Name: SEARCH_TYPE.name,
      Value: params.username
    },
    {
      Name: LAST_UPDATED_USER, 
      Value: commonParams.email
    },
  ]
  const deleteAttrs = []
  if (params.type) {
    attrs.push({
      Name: SEARCH_TYPE.userType,
      Value: params.type,
    });
  } else {
    deleteAttrs.push(SEARCH_TYPE.userType)
  }
  if (params.note) {
    attrs.push({
      Name: USER_NOTE,
      Value: params.note,
    });
  } else {
    deleteAttrs.push(USER_NOTE)
  }
  await cognitoFunction.updateUserAttributes(poolId, params.email, attrs);
  await cognitoFunction.deleteUserAttributes(poolId, params.email, deleteAttrs);
  return {
    statusCode: RESULT_CODE.SUCCESS,
    headers: HEADERS,
  };
};
const deleteUser = async (commonParams, params, poolId) => {
  if (!params.email) {
    return {
      statusCode: RESULT_CODE.APP_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.APP_ERROR,
        message: "invalid deleteUser params",
      }),
    };
  }
  if (commonParams.email === params.email) {
    return {
      statusCode: RESULT_CODE.APP_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.APP_ERROR,
        message: "can't delete current user",
      }),
    };
  }
  await cognitoFunction.delUser(poolId, params.email);
  return {
    statusCode: RESULT_CODE.SUCCESS,
    headers: HEADERS,
  };
};
const changeUserStatus = async (commonParams, params, poolId) => {
  if (!params.email
    || params.enabled === undefined) {
    return {
      statusCode: RESULT_CODE.APP_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.APP_ERROR,
        message: "invalid changeUserStatus params",
      }),
    };
  }
  if (commonParams.email === params.email) {
    return {
      statusCode: RESULT_CODE.APP_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.APP_ERROR,
        message: "can't operated current user",
      }),
    };
  }
  
  if( commonParams.role !== ROLE_NAME.ADMIN  ) {
      if( params.enabled) {
        return {
          statusCode: RESULT_CODE.ACCESS_DENIED,
          headers: HEADERS,
          body: JSON.stringify({
            code: RESULT_CODE.ACCESS_DENIED,
            message: "User cannot be activated",
          }),
        };
      }
  }

  // Cognitoからユーザ情報を取得
  let userInfo = undefined;
  try {
    userInfo = await cognitoFunction.getUser(poolId, params.email);
  } catch (e) {
    return {
      statusCode: RESULT_CODE.SERVER_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.SERVER_ERROR,
        message: e.message,
      }),
    };
  }
  
  if( commonParams.role !== ROLE_NAME.ADMIN  ) {
      const companyCodes = userInfo.UserAttributes.filter(e=>e.Name === COMPANY_CODE);
      if( companyCodes.length === 0 || companyCodes[0].Value !== commonParams.companyCode ) {
        return {
          statusCode: RESULT_CODE.ACCESS_DENIED,
          headers: HEADERS,
          body: JSON.stringify({
            code: RESULT_CODE.ACCESS_DENIED,
            message: "Cannot be changed by users of other companies",
          }),
        };
      }
  }

  if (userInfo.Enabled === params.enabled) {
    return {
      statusCode: RESULT_CODE.APP_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.APP_ERROR,
        message: "user already been updated",
      }),
    };
  }

  try {
    await cognitoFunction.changeUserStatus(poolId, params.email, params.enabled)
    await cognitoFunction.updateUserAttributes(poolId, params.email,[{
      "Name": LAST_UPDATED_USER, 
      "Value": commonParams.email
    }]);
    
  } catch(e) {
    switch (e.statusCode) {
      case 400:
        return {
          statusCode: RESULT_CODE.APP_ERROR,
          headers: HEADERS,
          body: JSON.stringify({
            code: RESULT_CODE.APP_ERROR,
            message: e.message,
          }),
        };
      case 500:
        return {
          statusCode: RESULT_CODE.SERVER_ERROR,
          headers: HEADERS,
          body: JSON.stringify({
            code: RESULT_CODE.SERVER_ERROR,
            message: e.message,
          }),
        };
      default:
        throw e;
    }
  }
  return {
    statusCode: RESULT_CODE.SUCCESS,
    headers: HEADERS,
  };
};
