import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

import { ConfigNames, LoggingLevel } from "../../model/constants/properties";

import { ConfigurationService } from "../configuration/configuration.service";

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private loggingLevel: string;

  constructor(private configService: ConfigurationService) {
    this.loggingLevel = LoggingLevel.VERBOSE;
    if (this.configService.isConfigServerOnline) {
      this.loggingLevel = configService.getConfig(ConfigNames.CONF_LOGGING_LEVEL);
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
    var locale: string = 'en-US';
    var date:string = formatDate(new Date, "yyyy-MMM-dd HH:mm:ss", locale);
    var logEvent: string = '[' + date + '] ' + className + '.' + methodName + '(): ' + message;
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
      var info: string = 'Object logged.'
      this.log(className, methodName, info, LoggingLevel.ERRORS);
      console.error(message);
    }
  }

  logWarning(className: string, methodName: string, message: any) {
    if (typeof message !== 'object') {
      this.log(className, methodName, message, LoggingLevel.WARNINGS);
    } else {
      var info: string = 'Object logged.'
      this.log(className, methodName, info, LoggingLevel.WARNINGS);
      console.warn(message);
    }
  }

  logInfo(className: string, methodName: string, message: any) {
    if (typeof message !== 'object') {
      this.log(className, methodName, message, LoggingLevel.INFO);
    } else {
      var info: string = 'Object logged.'
      this.log(className, methodName, info, LoggingLevel.INFO);
      console.info(message);
    }
  }

  logVerbose(className: string, methodName: string, message: any) {
    if (typeof message !== 'object') {
      this.log(className, methodName, message, LoggingLevel.VERBOSE);
    } else {
      var info: string = 'Object logged.'
      this.log(className, methodName, info, LoggingLevel.VERBOSE);
      console.debug(message);
    }
  }
}
