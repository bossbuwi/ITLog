export class RestUrls {
  public static SETTING_GROUP: string = 'resturls';
  public static REST_SERVER: string = 'REST_SERVER';
  public static REST_GET_CONFIG: string = 'REST_GET_CONFIG';
  public static REST_POST_CONFIG: string = 'REST_POST_CONFIG';
  public static REST_GET_RULES: string = 'REST_GET_RULES';
  public static REST_POST_RULES: string = 'REST_POST_RULES';
  public static REST_LDAP_URL: string = 'REST_LDAP_URL';
  public static REST_GET_EVENT: string = 'REST_GET_EVENT';
  public static REST_POST_EVENT: string = 'REST_POST_EVENT';
  public static REST_GENERATE_REPORT: string = 'REST_GENERATE_REPORT';
  public static REST_GET_SYSTEMS: string = 'REST_GET_SYSTEMS';
  public static REST_GET_SYSTEM_VERSION: string = 'REST_GET_SYSTEM_VERSION';
  public static REST_POST_SYSTEMS: string = 'REST_POST_SYSTEMS';
  public static REST_GET_USERS: string = 'REST_GET_USERS';
  public static REST_GET_ADMIN: string = 'REST_GET_ADMIN';
  public static REST_PUT_USERS: string = 'REST_PUT_USERS';
  public static REST_GET_EVENT_TYPES: string = 'REST_GET_EVENT_TYPES';
  public static REST_GET_EVENT_HISTORY: string = 'REST_GET_EVENT_HISTORY';

  public static CHILD_NAMES: string[] = [
    'REST_SERVER', 'REST_GET_CONFIG', 'REST_POST_CONFIG',
    'REST_GET_RULES', 'REST_POST_RULES', 'REST_LDAP_URL',
    'REST_GET_EVENT', 'REST_POST_EVENT', 'REST_GENERATE_REPORT',
    'REST_GET_SYSTEMS', 'REST_GET_SYSTEM_VERSION', 'REST_POST_SYSTEMS',
    'REST_GET_USERS', 'REST_GET_ADMIN', 'REST_PUT_USERS',
    'REST_GET_EVENT_TYPES', 'REST_GET_EVENT_HISTORY'
  ];
}

export class LoginPersistence {
  public static SETTING_GROUP: string = 'loginpersistence';
  public static KEY_STORAGE: string = 'KEY_STORAGE';
  public static ENCODING_STREAM = 'ENCODING_STREAM';
  public static KEY_USERNAME: string = 'KEY_USERNAME';
  public static KEY_ADMIN: string = 'KEY_ADMIN';

  public static CHILD_NAMES: string[] = [
    'KEY_STORAGE', 'ENCODING_STREAM', 'KEY_USERNAME',
    'KEY_ADMIN'
  ]
}

export class WebProperties {
  public static SETTING_GROUP: string = 'webproperties';
  public static APP_TITLE: string = 'APP_TITLE';
  public static APP_DESCRIPTION: string = 'APP_DESCRIPTION';
  public static APP_DEVELOPER: string = 'APP_DEVELOPER';
  public static APP_FRONTEND: string = 'APP_FRONTEND';
  public static APP_FRONTEND_VERSION = 'APP_FRONTEND_VERSION';
  public static APP_BACKEND_PROVIDER: string = 'APP_BACKEND_PROVIDER';
  public static APP_BACKEND_VERSION = 'APP_BACKEND_VERSION';
  public static APP_FOOTER = 'APP_FOOTER';

  public static CHILD_NAMES: string[] = [
    'APP_TITLE', 'APP_DESCRIPTION', 'APP_DEVELOPER',
    'APP_FRONTEND', 'APP_FRONTEND_VERSION', 'APP_BACKEND_PROVIDER',
    'APP_BACKEND_VERSION', 'APP_FOOTER'
  ]
}
