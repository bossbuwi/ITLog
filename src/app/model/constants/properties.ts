export class ConfigNames {
  public static CONF_LOGGING_LEVEL: string = 'loglevel';
}

export class RestUrls {
  private static REST_SERVER: string = 'http://mancswcbman0278:8080/api';
  public static REST_GET_CONFIG: string = RestUrls.REST_SERVER + '/config';
  public static REST_GET_RULES: string = RestUrls.REST_SERVER + '/rules';
  public static REST_LDAP_URL: string = RestUrls.REST_SERVER + '/login/';
  public static REST_GET_EVENT: string = RestUrls.REST_SERVER + '/event';
  public static REST_POST_EVENT: string = RestUrls.REST_SERVER + '/reserve';
  public static REST_GENERATE_REPORT: string = RestUrls.REST_SERVER + '/report';
  public static REST_GET_SYSTEMS: string = RestUrls.REST_SERVER + '/systems';
  public static REST_GET_USERS: string = RestUrls.REST_SERVER + '/users';
  public static REST_PUT_USERS: string = RestUrls.REST_SERVER + '/users';
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
