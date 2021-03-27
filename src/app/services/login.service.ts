import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { User } from "../model/user";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginUrl = 'https://my-json-server.typicode.com/bossbuwi/fakejson/users';
  isLoggedin: boolean = false;
  username: string;
  password: string;

  constructor(private http: HttpClient) { }

  logUserIn(username: string, password: string): boolean {
    if (username == null || password == null) {
      console.log("Received null values.")
      this.isLoggedin = false;
      return this.isLoggedin;
    } else if (username === "" || password === "") {
      console.log("Received blank values.")
      this.isLoggedin = false;
      return this.isLoggedin;
    } else {
      console.log(this.getUser());
      this.isLoggedin = true;
      return this.isLoggedin;
    }
  }

  logUserOut(): boolean {
    this.isLoggedin = false;
    return this.isLoggedin;
  }

  checkUserStatus(): boolean {
    return this.isLoggedin;
  }

  getUser() {
    return this.http.get(this.loginUrl).subscribe(data => {console.log(data)});
  }

}
