const AWS = require("aws-sdk");
const cognitoFunction = require("./cognitoFunction.js");
const userFunction = require("./userFunction.js");
const {
  INVOKE_FUNC_ARN,
  HEADERS,
  SEARCH_TYPE,
  COMPANY_CODE,
  ADMIN_GROUP_NAME,
  RESULT_CODE,
  ROLE_NAME,
} = require("./const.js");
exports.handler = async (event) => {
  // APIGatewayが付与するパラメータからユーザプールIDとユーザ名を取得
  const params = event.requestContext.identity.cognitoAuthenticationProvider
    .split("/")[2]
    .split(":");
  const poolId = params[0];
  const username = params[2];

  // Cognitoからユーザ情報を取得
  let userInfo = undefined;
  try {
    userInfo = await cognitoFunction.getUser(poolId, username);
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

  // ユーザ情報抽出
  const email = userInfo.UserAttributes.filter(
    (_) => _.Name === SEARCH_TYPE.email
  );
  const companyCode = userInfo.UserAttributes.filter(
    (_) => _.Name === COMPANY_CODE
  );
  const name = userInfo.UserAttributes.filter(
    (_) => _.Name === SEARCH_TYPE.name
  );

  // ユーザ情報チェック
  //- 必須パラメータチェック
  if (0 === email.length || 0 === name.length) {
    return {
      statusCode: RESULT_CODE.APP_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.APP_ERROR,
        message: "access user required email and name",
      }),
    };
  }
  //- 一般ユーザは会社コードが必須
  if (0 === userInfo.groups.length && 0 === companyCode.length) {
    return {
      statusCode: RESULT_CODE.APP_ERROR,
      headers: HEADERS,
      body: JSON.stringify({
        code: RESULT_CODE.APP_ERROR,
        message: "access user required companyCode",
      }),
    };
  }

  // 共通パラメータとしてユーザ情報を設定
  event["commonParams"] = {
    email: email[0].Value,
    name: name[0].Value,
    companyCode: companyCode.length > 0 ? companyCode[0].Value : undefined,
    role:
      userInfo.groups.length > 0 &&
      userInfo.groups.filter((_) => _ === ADMIN_GROUP_NAME).length > 0
        ? ROLE_NAME.ADMIN
        : ROLE_NAME.NORMAL,
  };

  if ("/user" === event.path) {
    // 念のためロールチェック
    if (ROLE_NAME.ADMIN !== event.commonParams.role && "GET" !== event.httpMethod && "PATCH" !== event.httpMethod) {
      return {
        statusCode: RESULT_CODE.ACCESS_DENIED,
        headers: HEADERS,
        body: JSON.stringify({
          code: RESULT_CODE.ACCESS_DENIED,
          message: "access denied",
        }),
      };
    }

    // ユーザ関連処理呼び出し
    try {
      return await userFunction.main(
        event.commonParams,
        event.httpMethod,
        event.queryStringParameters,
        event.body ? JSON.parse(event.body): undefined,
        poolId
      );
    } catch (e) {
      return {
        statusCode: RESULT_CODE.SERVICE_ERROR,
        headers: HEADERS,
        body: JSON.stringify({
          code: RESULT_CODE.SERVICE_ERROR,
          message: e.message,
        }),
      };
    }
  } else {
    // ユーザ関連処理以外はRDSFunctionを呼び出す
    const lambda = new AWS.Lambda({ apiVersion: "2015-03-31" });
    const body = JSON.parse(event.body);
    const rs = await lambda
      .invoke({
        FunctionName: INVOKE_FUNC_ARN,
        InvocationType: "RequestResponse",
        Payload: JSON.stringify({
          path: event.path,
          method: event.httpMethod,
          queryParams: event.queryStringParameters,
          multiValueQueryParams: event.multiValueQueryStringParameters,
          bodyParams: body,
          commonParams: event.commonParams,
          stage: event['requestContext'] ? event['requestContext'].stage : undefined,
        }),
      })
      .promise();
    return JSON.parse(rs.Payload);
  }
};
