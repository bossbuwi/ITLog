import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';

import { CoreService } from "src/app/services/core/core.service";

import { ConfigNames, LoggingLevel, ErrorCodes } from "src/app/constants/properties";

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private loggingLevel: string;

  constructor(private core: CoreService) {
    if (this.core.getStartUpStatus() == ErrorCodes.NO_ERRORS) {
      this.loggingLevel = core.getConfigValue(ConfigNames.CONF_LOGGING_LEVEL);
    } else {
      this.loggingLevel = LoggingLevel.VERBOSE;
    }
  }

  private shouldLog(level: LoggingLevel) {
    if (this.loggingLevel === LoggingLevel.NONE) {
      return false;
    } else if (this.loggingLevel === LoggingLevel.ERRORS) {
      return level === LoggingLevel.ERRORS;
    } else if (this.loggingLevel === LoggingLevel.WARNINGS) {
      return level === LoggingLevel.ERRORS || level === LoggingLevel.WARNINGS;
    } else if (this.loggingLevel === LoggingLevel.INFO) {
      return level === LoggingLevel.ERRORS || level === LoggingLevel.WARNINGS || level === LoggingLevel.INFO;
    } else {
      return true;
    }
  }

  private log(className: string, methodName: string, message: any, level = LoggingLevel.VERBOSE) {
    let locale: string = 'en-US';
    let date:string = formatDate(new Date, "yyyy-MMM-dd HH:mm:ss.SSS", locale);
    let logEvent: string = '[' + date + '] ' + className + '.' + methodName + '(): ' + message;
    if (this.shouldLog(level)) {
      switch (level) {
        case LoggingLevel.ERRORS:
          console.error(logEvent);
          break;
        case LoggingLevel.WARNINGS:
          console.warn(logEvent);
          break;
        case LoggingLevel.INFO:
          console.info(logEvent);
          break;
        default:
          console.debug(logEvent);
      }
    }
  }

  logError(className: string, methodName: string, message: any) {
    if (typeof message !== 'object') {
      this.log(className, methodName, message, LoggingLevel.ERRORS);
    } else {
      let info: string = 'Object logged.'
      this.log(className, methodName, info, LoggingLevel.ERRORS);
      console.error(message);
    }
  }

  logWarning(className: string, methodName: string, message: any) {
    if (typeof message !== 'object') {
      this.log(className, methodName, message, LoggingLevel.WARNINGS);
    } else {
      let info: string = 'Object logged.'
      this.log(className, methodName, info, LoggingLevel.WARNINGS);
      console.warn(message);
    }
  }

  logInfo(className: string, methodName: string, message: any) {
    if (typeof message !== 'object') {
      this.log(className, methodName, message, LoggingLevel.INFO);
    } else {
      let info: string = 'Object logged.'
      this.log(className, methodName, info, LoggingLevel.INFO);
      console.info(message);
    }
  }

  logVerbose(className: string, methodName: string, message: any) {
    if (typeof message !== 'object') {
      this.log(className, methodName, message, LoggingLevel.VERBOSE);
    } else {
      let info: string = 'Object logged.'
      this.log(className, methodName, info, LoggingLevel.VERBOSE);
      console.debug(message);
    }
  }
}
