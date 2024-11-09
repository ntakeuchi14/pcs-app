export const SIGN = {
  STATUS: {
    NOT_ENTERD: 0,
    TEMPORARY_SAVED: 1,
    SAVED: 9,
  },
  DASHBOARD_MAX_COUNT: 4,
  NORMAL_INDEX_MAX_COUNT: 100,
  ADMIN_INDEX_PER_PAGE: 10,
}

export const INFORMATION = {
  DASHBOARD_MAX_COUNT: 4,
  NORMAL_INDEX_MAX_COUNT: 100,
  STATUS: {
    PRIVATE: 0,
    PUBLIC: 1,
    END: 9
  },
  ADMIN_INDEX_PER_PAGE: 10,
}

export const ANSWER = {
  DASHBOARD_MAX_COUNT: 4,
  NORMAL_INDEX_MAX_COUNT: 100,
  STATUS: {
    NOT_ENTERD: 0,
    TEMPORARY_SAVED: 1,
    END: 9,
  },
  ADMIN_INDEX_PER_PAGE: 10,
}

export const DATE = {
  FORMAT: 'YYYY/MM/DD',
  FORMAT_D: 'YYYYMMDD',
  PICKER_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'YYYY/MM/DD HH:mm:ss',
}
export const FORM = {
   MAX_LENGTH: 50,
   COMPANY_CODE_LENGTH: 10,
   DATE_MAX_LENGTH: 10,
   CONTENTS_MAX_LENGTH: 400,
   MAIL_MAX_LENGTH: 128,
   FILENAME_MAX_LENGTH: 200,
}
export const CSV = {
  USERS_PER_PAGE: 50,
  COMPANYS_PER_PAGE: 50,
  SIGNS_PER_PAGE: 100,
  INFOS_PER_PAGE: 500,
  ANSWERS_PER_PAGE: 1000,
}

export const EXCEL_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const ALL_MIME_TYPE = "application/octet-stream";
export const BASE64_HEADER = `data:${EXCEL_MIME_TYPE};base64,`;
export const BASE64_HEADER_All = `data:${ALL_MIME_TYPE};base64,`;

export const CHECK_INJECTION_PATTERN = /^(=|\+|-|@).*$/
export const CHECK_FILENAME_PATTERN = /[/:*?"<>|\\¥]/
export const COOKIE = {
  LANG: { 
    key: 'languageDetection',
    expireTimes: 10 * 24 * 60 * 60,
    path: '',
    domain: '',
    langs: [
      { 
        key: 'ja',
        text: 'Japanese'
      },
      { 
        key: 'en',
        text: 'English'
      },
    ],
  }
}

export const CODE_KEYS = {
  USER_TYPE: 'user_type',
}
export const SEGMENTSIZE = 1024 * 3000