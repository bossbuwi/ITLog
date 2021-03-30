export class ConfigNames {
    public static CONF_LOGGING_LEVEL: string = 'loglevel';
    public static CONF_DEVMODE: string = 'devmode';
}

export class RestUrls {
    public static REST_CONFIG_URL: string = 'https://my-json-server.typicode.com/bossbuwi/fakejson/configuration';
    public static REST_RULES_URL: string = 'https://my-json-server.typicode.com/bossbuwi/fakejson/rules';
    public static REST_DEV_LOGIN_URL: string = 'https://my-json-server.typicode.com/bossbuwi/fakejson/users';
    public static REST_LDAP_URL: string = 'http://127.0.0.1:8000/api/login/';
    public static REST_ADMIN_URL: string = 'https://my-json-server.typicode.com/bossbuwi/fakejson/admins';
}

export class ErrorCodes {
  public static NO_ERRORS: number = 0;
  public static INCORRECT_CREDENTIALS: number = 1;
  public static SERVER_ERROR: number = 2;
  public static FATAL_ERROR: number = 999;
}

export class LoggingLevel {
    public static NONE: string = 'N';
    public static VERBOSE: string = 'V';
    public static INFO: string = 'I';
    public static WARNINGS: string = 'W';
    public static ERRORS: string = 'E';
}
