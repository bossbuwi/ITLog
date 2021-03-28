import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { User } from "../../model/user";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  //the REST address of the server for login
  private loginUrl = 'https://my-json-server.typicode.com/bossbuwi/fakejson/users';
  //the REST address of the server for admin status
  private adminUrl = 'https://my-json-server.typicode.com/bossbuwi/fakejson/admins';
  private currentUser: User; //the property that stores the user's credentials and status

  private loginErrors: number; //field for login errors
  private loginCompleted: boolean; //flag for completed login process

  private userStatusChange: Subject<boolean>; //used for transmitting changes on user's online status
  private userRankChange: Subject<boolean>; //used for transmitting changes on user's rank status
  private usernameChange: Subject<string>; //used for transmitting changes on user's id
  private loginErrorChange: Subject<number>; //used for transmitting errors on login
  private loginProcessCompletion: Subject<boolean>; //used for transmitting errors on login

  constructor(private http: HttpClient) {
    //initiates the subjects that would be used to transmit changes to the components
    this.userStatusChange = new Subject<boolean>();
    this.userRankChange = new Subject<boolean>();
    this.usernameChange = new Subject<string>();
    this.loginErrorChange = new Subject<number>();
    this.loginProcessCompletion = new Subject<boolean>();
    //initiates the user object that will hold the user's details
    this.currentUser = new User();
    //subscribes to the previously initiated subjects to listen
    //for changes and update the correponding user's details
    this.userStatusChange.subscribe((status) => {
      this.currentUser.isLoggedIn = status;
      if (this.currentUser.isLoggedIn) {
        this.checkAdminStatus(this.currentUser.username);
      }
    });
    this.userRankChange.subscribe((rank) => {
      this.currentUser.isAdmin = rank;
    });
    this.usernameChange.subscribe((username) => {
      this.currentUser.username = username;
    });
    this.loginErrorChange.subscribe((loginErrors) => {
      this.loginErrors = loginErrors;
    });
    this.loginProcessCompletion.subscribe((loginCompletion) => {
      this.loginCompleted = loginCompletion;
    });
  }

  /**
   * Checks the login status of the user.
   * @returns boolean True if the user is still logged in, false if otherwise.
   */
  getUserStatus(): Observable<boolean> {
    return this.userStatusChange.asObservable();
  }

  getUserRank(): Observable<boolean> {
    return this.userRankChange.asObservable();
  }

  getUsername(): Observable<string> {
    return this.usernameChange.asObservable();
  }

  checkLoginErrors(): Observable<number> {
    return this.loginErrorChange.asObservable();
  }

  isLoginCompleted(): Observable<boolean> {
    return this.loginProcessCompletion.asObservable();
  }

  /**
   * Connects to the REST server to verify the validity of the user's credentials.
   * @param username The user's id.
   * @param password The user's password.
   * @returns boolean True if the user's credentials are valid, false if otherwise.
   */
  validateUserLDAP(username: string, password: string): void {
    console.log("LoginService: validateUserLDAP(): Connecting to the REST server.")
    console.log("LoginService: validateUserLDAP(): REST query: " + this.loginUrl + '?username=' + username + '&password=' + password);
    this.loginProcessCompletion.next(false);
    this.http.get(this.loginUrl + '?username=' + username + '&password=' + password).subscribe(
      (data) => {
        console.log("LoginService: validateUserLDAP(): Connected to the REST server.")
        console.log(data);
        if (Object.keys(data).length > 0) {
          for (var key in data) {
            console.log("LoginService: validateUserLDAP(): Executing data checks.")
            if (data.hasOwnProperty(key)) {
              console.log("LoginService: validateUserLDAP(): Valid credentials.")
              this.currentUser.username = username;
              this.currentUser.password = password;
              this.userStatusChange.next(true);
              console.log("LoginService: validateUserLDAP(): User is now online.")
            } else {
              console.log("LoginService: validateUserLDAP(): Something is wrong with the application.")
              console.log("LoginService: validateUserLDAP(): Please contact an administrator.")
              this.throwErrors(999);
            }
          }
        } else {
          console.log("LoginService: validateUserLDAP(): Received empty data from query.")
          this.throwErrors(1);
        }
      },
      (error) => {
        console.log("LoginService: validateUserLDAP(): The REST server replied with errors.")
        console.log(error);
        this.throwErrors(2);
        this.loginProcessCompletion.next(true);
      },
      () => {
        console.log("LoginService: validateUserLDAP(): The login process is now done.")
        this.loginProcessCompletion.next(true);
      });
  }

  /**
   * Checks if the user is an admin. This must be called immediately
   * after the user has successfully logged in. This must
   * not be called on its own or on any other circumstance.
   * @param username The user's id.
   */
  private checkAdminStatus(username: string): void {
    console.log("LoginService: checkAdminStatus(): Checking for admin rank for user with id: " + username + ".");
    this.http.get(this.adminUrl + '?username=' + username).subscribe(
      data => {
        if (Object.keys(data).length > 0) {
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              console.log("LoginService: checkAdminStatus(): User with id: " + username + " is an admin.");
              console.log("LoginService: checkAdminStatus(): Updating admin status.");
              this.userRankChange.next(true);
            } else {
              this.throwErrors(999);
            }
          }
        } else {
          console.log("LoginService: checkAdminStatus(): User with id: " + username + " is not an admin.");
        }
      }, (error) => {
        console.log("LoginService: checkAdminStatus(): The REST server replied with errors.")
        console.log(error);
        this.throwErrors(3);
      }, () => {
        console.log("LoginService: checkAdminStatus(): Admin rank checking completed.")
      });
  }

  private throwErrors(errorType: number): void {
    this.loginErrorChange.next(errorType);
  }

  logOutUser(): void {
    console.log("LoginService: logOutUser(): Logging out user with id: " + this.currentUser.username + ".");
    console.log("LoginService: logOutUser(): Cleaning up fields and resetting flags.")
    this.currentUser.password = '';
    this.userRankChange.next(false);
    this.usernameChange.next('');
    this.loginErrorChange.next(0);
    this.loginProcessCompletion.next(false);
    this.userStatusChange.next(false);
    console.log("LoginService: logOutUser(): The user has been completely logged out from the system.")
  }
}
