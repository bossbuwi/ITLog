import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { LoggerService } from "../logger/logger.service";
import { ConfigurationService } from "../configuration/configuration.service";

import { Rule } from "../../model/rule";
import { RestUrls } from "../../model/constants/properties";

@Injectable({
  providedIn: 'root'
})
export class RulesService {
  private className: string = RulesService.name;
  private rulesFullyLoaded: boolean;
  // rules: Rule[] = [];
  rules: Rule[];

  constructor(private http: HttpClient, private log: LoggerService, private confService: ConfigurationService) {
    this.initiateRulesService();
  }

  initiateRulesService(): void {
    this.rulesFullyLoaded = false;
    this.rules = [];
    if (!this.confService.isConfigServerOnline) {
      this.rulesFullyLoaded = true;
    }
  }

  getRules(): Rule[] {
    this.log.logVerbose(this.className, 'getRules', 'Checking rules status.');
    if (!this.rulesFullyLoaded) {
      this.log.logVerbose(this.className, 'getRules', 'Rules not yet fetched.');
      this.log.logVerbose(this.className, 'getRules', 'Fetching rules from REST server.');
      this.http.get(RestUrls.REST_RULES_URL).toPromise().then(data => {
        this.log.logVerbose(this.className, 'getRules', data);
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            this.rules.push(data[key]);
          }
        }
        this.log.logVerbose(this.className, 'getRules', 'All rules completely fetched from REST server.');
        this.rulesFullyLoaded = true;
      });
    } else {
      this.log.logVerbose(this.className, 'getRules', 'Rules have been fetched previously.');
      this.log.logVerbose(this.className, 'getRules', 'No connection to server needed.');
    }
    return this.rules;
  }
}
