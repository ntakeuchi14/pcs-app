module.exports = {

  // ユーザ追加時の初期パスワード
  INITIAL_PASSWORD: "abcd1234",
  
  // InvokeするRDSfunctionのARN
  INVOKE_FUNC_ARN: "arn:aws:lambda:ap-northeast-1:193473838513:function:RDSfunction-test",

  // ユーザ検索タイプのcognito属性
  SEARCH_TYPE: {
    name: "name",
    email: "email",
    userStatus: "cognito:user_status",
    status: "status",
    userType: "given_name",
  },

  // 会社コードのcognito属性
  COMPANY_CODE: "preferred_username",
  
  // ユーザ情報の最終更新者のcognito属性
  LAST_UPDATED_USER: "custom:updatedUser",
  
  // 備考欄属性
  USER_NOTE: "custom:note",
  

  // レスポンスするロール名
  ROLE_NAME: {
    ADMIN: "ADMIN",
    NORMAL: "",
  },

  // Cognitoの管理者グループ名
  ADMIN_GROUP_NAME: "Admin",

  // レスポンスヘッダ
  HEADERS: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  },

  // レスポンスコード（使用するもののみ)
  RESULT_CODE: {
    SUCCESS: 200,
    APP_ERROR: 400,
    ACCESS_DENIED: 403,
    CONFLICT: 409,
    SERVER_ERROR: 500,
    NOT_IMPL: 501,
    SERVICE_ERROR: 503,
  },
};
