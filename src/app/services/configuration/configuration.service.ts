import { Injectable } from '@angular/core';

import { Configuration } from "../../model/configuration";
import { LoggingLevel } from "../../model/constants/properties";

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor() {}

  writeConfiguration(config: Configuration): void {
    localStorage.setItem(config.name, config.value);
  }

  checkConfigServer(): boolean {
    if (localStorage.getItem('offline') === 'Y') {
      return true;
    } else {
      return false;
    }
  }
}
