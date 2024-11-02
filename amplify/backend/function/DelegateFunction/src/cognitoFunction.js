const AWS = require("aws-sdk");
const cognitoidp = new AWS.CognitoIdentityServiceProvider();
const {
  ADMIN_GROUP_NAME,
  INITIAL_PASSWORD,
  SEARCH_TYPE,
  COMPANY_CODE,
  USER_NOTE,
} = require("./const.js");

const adminListGroupsForUser = async (poolId, username, next = undefined) => {
  const d = await cognitoidp
    .adminListGroupsForUser({
      Username: username,
      UserPoolId: poolId,
      NextToken: next,
    })
    .promise();
  const data = d.Groups.map((e) => e.GroupName);
  if (d.NextToken) {
    const tmp = await adminListGroupsForUser(poolId, username, d.NextToken);
    tmp.Users.forEach((e) => data.push(e.GroupName));
  }
  return data;
};
const getUser = async (poolId, username) => {
  const userInfo = await cognitoidp
    .adminGetUser({
      Username: username,
      UserPoolId: poolId,
    })
    .promise();
  userInfo["groups"] = [];
  let next = undefined;
  while (true) {
    const g = await cognitoidp
      .adminListGroupsForUser({
        Username: username,
        UserPoolId: poolId,
        NextToken: next,
      })
      .promise();
    g.Groups.forEach((_) => {
      userInfo["groups"].push(_.GroupName);
    });
    if (g.NextToken) {
      next = g.NextToken;
    } else {
      break;
    }
  }
  return userInfo;
};
const listAdminUsers = async (poolId, next = undefined) => {
  const d = await cognitoidp
    .listUsersInGroup({
      GroupName: ADMIN_GROUP_NAME,
      UserPoolId: poolId,
      NextToken: next,
    })
    .promise();
  const data = d.Users.map((e) => e.Username);
  if (d.NextToken) {
    const tmp = await listAdminUsers(poolId, d.NextToken);
    tmp.Users.forEach((e) => data.push(e.Username));
  }
  return data;
};
const listAllActiveUsers = async (
  poolId,
  limit,
  paginationToken,
  att,
  keyword
) => {
  const data = await cognitoidp
    .listUsers({
      UserPoolId: poolId,
      Limit: limit,
      Filter: att && keyword ? att + '^="' + keyword + '"' : undefined,
      PaginationToken: paginationToken,
    })
    .promise();
  return data;
};
const addUser = async (poolId, info) => {
  const attrs = [
    {
      Name: SEARCH_TYPE.name,
      Value: info.username,
    },
    {
      Name: 'email',
      Value: info.email
    },
    {
      Name: 'email_verified',
      Value: 'true'
    }
  ];
  if (info.companyCode) {
    attrs.push({
      Name: COMPANY_CODE,
      Value: info.companyCode,
    });
  }
  if (info.type) {
    attrs.push({
      Name: SEARCH_TYPE.userType,
      Value: info.type,
    });
  }
  if (info.note) {
    attrs.push({
      Name: USER_NOTE,
      Value: info.note,
    });
  }
  await cognitoidp.adminCreateUser({
      UserPoolId: poolId,
      Username: info.email,
      UserAttributes: attrs,
      MessageAction: 'SUPPRESS'
    }).promise();
  await cognitoidp
    .adminSetUserPassword({
      UserPoolId: poolId,
      Username: info.email,
      Password: INITIAL_PASSWORD,
      Permanent: true,
    })
    .promise();
  await cognitoidp.adminResetUserPassword({
      UserPoolId: poolId,
      Username: info.email
    })
    .promise();
};
const delUser = async (poolId, username) => {
  await cognitoidp
    .adminDeleteUser({
      UserPoolId: poolId,
      Username: username,
    })
    .promise();
};
const changeUserStatus = async (poolId, username, enabled) => {
  if( enabled ) {
    await cognitoidp
      .adminEnableUser({
        UserPoolId: poolId,
        Username: username,
      }).promise();
  } else {
    await cognitoidp
      .adminDisableUser({
        UserPoolId: poolId,
        Username: username,
      }).promise();
  }
};
const updateUserAttributes = async (poolId, username, attrs) => {
  await cognitoidp
    .adminUpdateUserAttributes({
      UserPoolId: poolId,
      Username: username,
      UserAttributes: attrs,
    }).promise();
};
const deleteUserAttributes = async (poolId, username, attrs) => {
  await cognitoidp
    .adminDeleteUserAttributes({
      UserPoolId: poolId,
      Username: username,
      UserAttributeNames: attrs,
    }).promise();
};

const adminListUserAuthEvents = async(poolId, username, next) => {
  const data = await cognitoidp
    .adminListUserAuthEvents({
      UserPoolId: poolId,
      Username: username,
      NextToken: next,
    }).promise();
  return data
};

exports.getUser = getUser;
exports.listAdminUsers = listAdminUsers;
exports.listAllActiveUsers = listAllActiveUsers;
exports.addUser = addUser;
exports.delUser = delUser;
exports.changeUserStatus = changeUserStatus;
exports.updateUserAttributes = updateUserAttributes;
exports.deleteUserAttributes = deleteUserAttributes;
exports.adminListUserAuthEvents = adminListUserAuthEvents;
