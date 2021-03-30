import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

import { Configuration } from "../../model/configuration";

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private className: string = ConfigurationService.name;

  constructor() {}

  /**
   *
   * @param config
   */
  writeConfiguration(config: Configuration): void {
    sessionStorage.setItem(config.name, config.value);
  }

  /**
   *
   * @returns
   */
  isConfigServerOnline(): boolean {
    if (sessionStorage.getItem('offline') === 'N') {
      return true;
    } else {
      return false;
    }
  }

  /**
   *
   * @param configName
   * @returns
   */
  getConfig(configName: string): string {
    var locale: string = 'en-US';
    var date:string = formatDate(new Date, "yyyy-MMM-dd HH:mm:ss", locale);
    var configValue: string = sessionStorage.getItem(configName);
    var logEvent: string = '[' + date + '] ' + this.className + '.' + 'getConfig' + '(): ' +
      'Configuration: ' + configName + ' = ' + configValue;
    console.debug(logEvent);
    return configValue;
  }
}
