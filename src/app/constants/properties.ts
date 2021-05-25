export class ConfigNames {
  public static CONF_LOGGING_LEVEL: string = 'loglevel';
  public static CONF_SEED: string = 'primaryseed';
  public static CONF_KEY: string = 'keycode';
  public static CONF_DISPLAY_AUTHOR: string = 'displayauthor';
  public static CONF_NAVTAB_DESIGN: string = 'navtabsdesign';
  public static CONF_OPEN_REPORTS: string = 'openreports';
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

export class FormMode {
  public static FORM_INSERT: string = 'insert';
  public static FORM_EDIT: string = 'edit';
  public static FORM_CONFIRM: string = 'confirm';
}

export class SettingsFiles {
  public static JSON_DATA:string = 'assets/properties/data.json';
}
