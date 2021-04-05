export class ConfigNames {
    public static CONF_LOGGING_LEVEL: string = 'loglevel';
    public static CONF_DEVMODE: string = 'devmode';
}

export class RestUrls {
    public static REST_CONFIG_URL: string = 'http://localhost:8080/bilog/public/api/config';
    public static REST_RULES_URL: string = 'http://localhost:8080/bilog/public/api/rules';
    public static REST_DEV_LOGIN_URL: string = 'https://my-json-server.typicode.com/bossbuwi/fakejson/users';
    public static REST_LDAP_URL: string = 'http://localhost:8080/bilog/public/api/login/';
    public static REST_ADMIN_URL: string = 'https://my-json-server.typicode.com/bossbuwi/fakejson/admins';
    public static REST_GET_EVENT: string = 'http://localhost:8080/bilog/public/api/event';
    public static REST_POST_EVENT: string = 'http://localhost:8080/bilog/public/api/reserve';
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

export class EventTypes {
  public static IC: string = 'Input Cycle';
  public static COB: string = 'Close of Business';
  public static IC_COB: string = 'Input Cycle -> Close of Business';
  public static MAINTENANCE: string = 'Maintenance';
  public static SYS_UPGRADE: string = 'System Upgrade';
}

export class EventTypesREST {
  public static IC: string = 'IC';
  public static COB: string = 'COB';
  public static IC_COB: string = 'IC-COB';
  public static MAINTENANCE: string = 'MAINT';
  public static SYS_UPGRADE: string = 'SYSUP';
}

export class FormMode {
  public static FORM_INSERT: string = 'insert';
  public static FORM_EDIT: string = 'edit';
  public static FORM_CONFIRM: string = 'confirm';
}
