import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { Rule } from "../model/rule";

@Injectable({
  providedIn: 'root'
})
export class RulesService {
  private rulesUrl = 'https://my-json-server.typicode.com/bossbuwi/fakejson/rules';
  rules: Rule[] = [];

  constructor(private http: HttpClient) { }

  getRules(): Rule[] {
    // this.http.get(this.rulesUrl).subscribe(data => {console.log(data)});
    this.http.get(this.rulesUrl).toPromise().then(data =>{
      console.log(data);

      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          this.rules.push(data[key]);
        }
      }
      console.log("Push completed.")
      console.log(this.rules);
    });

    return this.rules;
  }
}
