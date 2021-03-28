import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { Rule } from "../../model/rule";

@Injectable({
  providedIn: 'root'
})
export class RulesService {
  private rulesUrl = 'https://my-json-server.typicode.com/bossbuwi/fakejson/rules';
  private rulesFullyLoaded: boolean;
  rules: Rule[] = [];

  constructor(private http: HttpClient) {
    this.rulesFullyLoaded = false;
  }

  getRules(): Rule[] {
    console.log('RuleService: getRules(): Checking rule status.')
    if (!this.rulesFullyLoaded) {
      console.log('RuleService: getRules(): Rules not yet fetched.')
      console.log('RuleService: getRules(): Fetching rules from REST server.')
      this.http.get(this.rulesUrl).toPromise().then(data =>{
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            this.rules.push(data[key]);
          }
        }
        console.log('RuleService: getRules(): All rules completely fetched from REST server.')
        this.rulesFullyLoaded = true;
      });
    } else {
      console.log('RuleService: getRules(): Rules have been fetched previously.')
      console.log('RuleService: getRules(): No connection to server needed.')
    }
    return this.rules;
  }
}
