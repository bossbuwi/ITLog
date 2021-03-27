import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { User } from "../model/user";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  //the REST address of the server for login
  private loginUrl = 'https://my-json-server.typicode.com/bossbuwi/fakejson/users';
  private currentUser: User;
  private userStatusChange: Subject<boolean>;
  private userRankChange: Subject<boolean>;
  private usernameChange: Subject<string>;

  constructor(private http: HttpClient) {
    this.userStatusChange = new Subject<boolean>();
    this.userRankChange = new Subject<boolean>();
    this.usernameChange = new Subject<string>();
    this.currentUser = new User();
    this.userStatusChange.subscribe((status) => {
      this.currentUser.isLoggedIn = status;
    });
    this.userRankChange.subscribe((rank) => {
      this.currentUser.isAdmin = rank;
    });
    this.usernameChange.subscribe((username) => {
      this.currentUser.username = username;
    });
  }

  /**
   * Checks the login status of the user.
   * @returns boolean True if the user is still logged in, false if otherwise.
   */
  getUserStatus(): Observable<boolean> {
    return this.userStatusChange.asObservable();
    // return this.currentUser.isLoggedIn;
  }

  getUserRank(): Observable<boolean> {
    return this.userRankChange.asObservable();
  }

  getUsername(): Observable<string> {
    return this.usernameChange.asObservable();
  }

  /**
   * Connects to the REST server to verify the validity of the user's credentials.
   * @param username The user's id.
   * @param password The user's password.
   * @returns boolean True if the user's credentials are valid, false if otherwise.
   */
  validateUserLDAP(username: string, password: string): boolean {
    console.log("LoginService: validateUserLDAP(): Connecting to the REST server.")
    // this.http.get(this.loginUrl).subscribe(data => {console.log(data)});
    //delete this code after the REST server has been finished.
    if (username === 'a') {
      console.log("LoginService: validateUserLDAP(): Invalid credentials.")
      this.userStatusChange.next(false);
    } else {
      console.log("LoginService: validateUserLDAP(): Valid credentials.")
      this.userStatusChange.next(true);
      this.currentUser.username = username;
      this.currentUser.password = password;
      console.log("LoginService: validateUserLDAP(): User successfully logged in.")
      if (this.currentUser.username === 'admin') {
        this.userRankChange.next(true);
      }
    }
    //put codes for REST server connection here.

    return this.currentUser.isLoggedIn;
  }

  logOutUser(): boolean {
    this.userStatusChange.next(false);
    return this.currentUser.isLoggedIn;
  }
}
