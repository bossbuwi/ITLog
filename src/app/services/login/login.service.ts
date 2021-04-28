import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { LoggerService } from "../../services/logger/logger.service";
import { CoreService } from "../core/core.service";

import { User } from "../../models/user";
import { RestUrls, ErrorCodes, ConfigNames, LoginPersistence } from "../../models/constants/properties";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private className: string = LoginService.name;
  private currentUser: User; //the property that stores the user's credentials and status
  private loginErrors: number; //field for login errors

  private userStatusChange: Subject<boolean>; //used for transmitting changes on user's online status
  private userRankChange: Subject<boolean>; //used for transmitting changes on user's rank status
  private usernameChange: Subject<string>; //used for transmitting changes on user's id
  private loginErrorChange: Subject<number>; //used for transmitting errors on login

  private isUserOnline: boolean; //stores the user's last online status

  constructor(private http: HttpClient, private log: LoggerService,
    private core: CoreService) {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {

    } else {
      this.initializeService();
    }
  }

  /**
   *
   */
  private initializeService(): void {
    this.log.logVerbose(this.className, 'initializeService', 'Initiating ' + this.className + '.');
    //initiates the subjects that would be used to transmit changes to the components
    this.userStatusChange = new Subject<boolean>();
    this.userRankChange = new Subject<boolean>();
    this.usernameChange = new Subject<string>();
    this.loginErrorChange = new Subject<number>();
    //initiates the user object that will hold the user's details
    this.currentUser = new User();
    //subscribes to the previously initiated subjects to listen for changes
    //also updates the local properties to the subscriptions' current state
    this.userStatusChange.subscribe((status) => {
      this.isUserOnline = status;
    });
    this.userRankChange.subscribe((rank) => {
      this.currentUser.admin = rank;
    });
    this.usernameChange.subscribe((username) => {
      this.currentUser.username = username;
      this.core.encodeUser(username);
    });
    this.loginErrorChange.subscribe((loginErrors) => {
      this.loginErrors = loginErrors;
    });
    //sends a wake up data to the subscriptions
    // this.log.logVerbose(this.className, 'initializeService', 'Initiating subscriptions.');
    // this.userStatusChange.next(false);
    // this.userRankChange.next(false);
    // this.usernameChange.next('');
    this.loginErrorChange.next(ErrorCodes.NO_ERRORS);
    this.autoLogin();
  }

  subscribeUserStatus(): Observable<boolean> {
    return this.userStatusChange.asObservable();
  }

  subscribeUserRank(): Observable<boolean> {
    return this.userRankChange.asObservable();
  }

  subscribeUsername(): Observable<string> {
    return this.usernameChange.asObservable();
  }

  subscribeLoginErrors(): Observable<number> {
    return this.loginErrorChange.asObservable();
  }

  getLoginStatus(): boolean {
    return this.isUserOnline;
  }

  getAdminStatus(): boolean {
    return this.currentUser.admin;
  }

  getUsername(): string {
    return this.currentUser.username;
  }

  /**
   *
   * @param errorType
   */
  private throwErrors(errorType: number): void {
    this.loginErrorChange.next(errorType);
  }

  /**
   *
   */
  logOutUser(): void {
    this.log.logVerbose(this.className, 'logOutUser', 'Logging out user with id: ' + this.currentUser.username + '.');
    this.log.logVerbose(this.className, 'logOutUser', 'Cleaning up fields and resetting flags.');
    this.currentUser.password = '';
    this.userRankChange.next(false);
    this.usernameChange.next('');
    this.loginErrorChange.next(ErrorCodes.NO_ERRORS);
    this.userStatusChange.next(false);
    localStorage.removeItem(LoginPersistence.KEY_STORAGE);
    localStorage.removeItem(LoginPersistence.KEY_USERNAME);
    localStorage.removeItem(LoginPersistence.KEY_ADMIN);
    this.log.logVerbose(this.className, 'logOutUser', 'The user has been completely logged out from the system.');
  }

  /**
   *
   * @param username
   * @param password
   */
  validateUserLDAP(username: string, password: string): void {
    this.log.logVerbose(this.className, 'validateUserLDAP', 'Generating REST login query.');
    this.log.logVerbose(this.className, 'validateUserLDAP', RestUrls.REST_LDAP_URL);
    const params: HttpParams = new HttpParams()
      .set('username', username)
      .set('password', password);
    this.log.logVerbose(this.className, 'validateUserLDAP', 'Connecting to the REST server.');
    this.http.post<User>(RestUrls.REST_LDAP_URL, params).subscribe(
      result => {
        if (result.username === username) {
          this.log.logVerbose(this.className, 'validateUserLDAP', 'Valid credentials. Updating user object.');
          this.currentUser.password = password;
          this.usernameChange.next(username);
          this.userRankChange.next(result.admin);
          this.userStatusChange.next(true);
          this.log.logVerbose(this.className, 'validateUserLDAP', 'User with id: ' + this.currentUser.username + ' is now online.');
        } else {
          this.log.logVerbose(this.className, 'validateUserLDAP', 'Data mismatch with server.');
          this.log.logVerbose(this.className, 'validateUserLDAP', 'Credentials may be incorrect.');
          this.throwErrors(ErrorCodes.INCORRECT_CREDENTIALS);
        }
    }, error => {
      this.log.logVerbose(this.className, 'validateUserLDAP', 'There is an error connecting to the REST server.');
      this.log.logVerbose(this.className, 'validateUserLDAP', error);
      this.throwErrors(ErrorCodes.SERVER_ERROR);
    }, () => {

    });
  }

  private autoLogin(): void {
    this.log.logVerbose(this.className, 'autoLogin', 'Initiating autologin process.');
    if (localStorage.getItem(LoginPersistence.KEY_USERNAME) == null
      || localStorage.getItem(LoginPersistence.KEY_ADMIN) == null) {
      this.log.logVerbose(this.className, 'autoLogin', 'There are no saved user information found.');
    } else {
      this.log.logVerbose(this.className, 'autoLogin', 'A saved user information is found.');
      this.log.logVerbose(this.className, 'autoLogin', 'Logging in user with id: ' + localStorage.getItem(LoginPersistence.KEY_USERNAME) + '.');
      this.usernameChange.next(localStorage.getItem(LoginPersistence.KEY_USERNAME));
      if (localStorage.getItem(LoginPersistence.KEY_ADMIN) == 'true') {
        this.userRankChange.next(true);
      } else {
        this.userRankChange.next(false);
      }
      this.userStatusChange.next(true);
      this.log.logVerbose(this.className, 'autoLogin', 'Removing any persistent information.');
      localStorage.removeItem(LoginPersistence.KEY_USERNAME);
      localStorage.removeItem(LoginPersistence.KEY_ADMIN);
    }
    this.log.logVerbose(this.className, 'autoLogin', 'Autologin process complete.');
  }
}
