import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { LoggerService } from "../../services/logger/logger.service";
import { ConfigurationService } from "../../services/configuration/configuration.service";

import { User } from "../../model/user";
import { RestUrls, ErrorCodes, ConfigNames } from "../../model/constants/properties";

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

  constructor(private http: HttpClient, private log: LoggerService, private confService: ConfigurationService) {
    this.initializeService();
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
    //subscribes to the previously initiated subjects to listen
    //for changes and update the correponding user's details
    this.userStatusChange.subscribe((status) => {
      this.currentUser.isLoggedIn = status;
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
    //sends a wake up data to the subscriptions
    this.log.logVerbose(this.className, 'initializeService', 'Initiating subscriptions.');
    this.userStatusChange.next(false);
    this.userRankChange.next(false);
    this.usernameChange.next('');
    this.loginErrorChange.next(ErrorCodes.NO_ERRORS);
  }

  /**
   * Checks the login status of the user.
   * @returns boolean True if the user is still logged in, false if otherwise.
   */
  getUserStatus(): Observable<boolean> {
    return this.userStatusChange.asObservable();
  }

  /**
   *
   * @returns
   */
  getUserRank(): Observable<boolean> {
    return this.userRankChange.asObservable();
  }

  /**
   *
   * @returns
   */
  getUsername(): Observable<string> {
    return this.usernameChange.asObservable();
  }

  /**
   *
   * @returns
   */
  checkLoginErrors(): Observable<number> {
    return this.loginErrorChange.asObservable();
  }

  /**
   * Connects to the REST server to verify the validity of the user's credentials.
   * @param username The user's id.
   * @param password The user's password.
   * @returns boolean True if the user's credentials are valid, false if otherwise.
   */
  loginUser(username: string, password: string): void {
    this.log.logVerbose(this.className, 'loginUser', 'Generating REST login query.');
    this.log.logVerbose(this.className, 'loginUser', RestUrls.REST_DEV_LOGIN_URL + '?username=' + username + '&password=password');
    var restQuery: string = RestUrls.REST_DEV_LOGIN_URL + '?username=' + username + '&password=' + password;

    this.log.logVerbose(this.className, 'loginUser', 'Connecting to the development REST server.');
    this.http.get(restQuery).subscribe(
      data => {
        if (Object.keys(data).length > 0) {
          this.log.logVerbose(this.className, 'loginUser', 'Connection to the development REST server established.');
          for (var key in data) {
            this.log.logVerbose(this.className, 'loginUser', 'Data received. Executing data checks.');
            if (data.hasOwnProperty(key)) {
              this.log.logVerbose(this.className, 'loginUser', 'Valid credentials. Updating user object.');
              this.usernameChange.next(username);
              this.currentUser.password = password;
              this.userStatusChange.next(true);
              // this.checkAdminStatus(username);
              this.log.logVerbose(this.className, 'loginUser', 'User with id: ' + this.currentUser.username + ' is now online.');
            } else {
              this.log.logError(this.className, 'loginUser', 'There is something wrong with either the application or the REST server.');
              this.log.logError(this.className, 'loginUser', 'Please contact an administrator immediately.');
              this.throwErrors(ErrorCodes.FATAL_ERROR);
            }
          }
        } else {
          this.log.logVerbose(this.className, 'loginUser', 'Received empty data from REST server.');
          this.log.logVerbose(this.className, 'loginUser', 'Credentials may be incorrect.');
          this.throwErrors(ErrorCodes.INCORRECT_CREDENTIALS);
        }
      }, error => {
        this.log.logVerbose(this.className, 'loginUser', 'There is an error connecting to the REST server.');
        this.log.logVerbose(this.className, 'loginUser', error);
        this.throwErrors(ErrorCodes.SERVER_ERROR);
      }, () => {
        if (this.loginErrors === ErrorCodes.NO_ERRORS) {
          this.log.logVerbose(this.className, 'loginUser', 'Initiating admin rank check for user with id: ' + this.currentUser.username + '.');
          this.checkAdminStatus(this.currentUser.username);
        }
      });
  }

  /**
   * Checks if the user is an admin. This must be called immediately
   * after the user has successfully logged in. This must
   * not be called on its own or on any other circumstance.
   * @param username The user's id.
   */
  private checkAdminStatus(username: string): void {
    this.log.logVerbose(this.className, 'checkAdminStatus', 'Generating REST admin query.');
    this.log.logVerbose(this.className, 'checkAdminStatus', RestUrls.REST_ADMIN_URL + '?username=' + username);
    var restQuery: string = RestUrls.REST_ADMIN_URL + '?username=' + username;

    this.log.logVerbose(this.className, 'checkAdminStatus', 'Connecting to the REST server.');
    this.http.get(restQuery).subscribe(
      data => {
        if (Object.keys(data).length > 0) {
          this.log.logVerbose(this.className, 'checkAdminStatus', 'Connection to the REST server established.');
          for (var key in data) {
            this.log.logVerbose(this.className, 'checkAdminStatus', 'Data received. Executing data checks.');
            if (data.hasOwnProperty(key)) {
              this.log.logVerbose(this.className, 'checkAdminStatus', 'User with id: ' + username + ' is an admin.');
              this.log.logVerbose(this.className, 'checkAdminStatus', "Updating user's admin status.");
              this.userRankChange.next(true);
            } else {
              this.log.logError(this.className, 'checkAdminStatus', 'There is something wrong with either the application or the REST server.');
              this.log.logError(this.className, 'checkAdminStatus', 'Please contact an administrator immediately.');
              this.throwErrors(ErrorCodes.FATAL_ERROR);
            }
          }
        } else {
          this.log.logVerbose(this.className, 'checkAdminStatus', 'User with id: ' + username + ' is not an admin.');
        }
      }, (error) => {
        this.log.logVerbose(this.className, 'checkAdminStatus', 'There is an error connecting to the REST server.');
        this.log.logVerbose(this.className, 'checkAdminStatus', error);
        this.throwErrors(ErrorCodes.SERVER_ERROR);
      }, () => {
        this.log.logVerbose(this.className, 'checkAdminStatus', 'Admin rank checking completed.');
        this.log.logVerbose(this.className, 'checkAdminStatus', 'Login process complete.');
      });
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
    this.http.post(RestUrls.REST_LDAP_URL,{'username': username, 'password': password}).subscribe(
      result => {
        if (result == true) {
          this.log.logVerbose(this.className, 'validateUserLDAP', 'Valid credentials. Updating user object.');
          this.usernameChange.next(username);
          this.currentUser.password = password;
          this.userStatusChange.next(true);
          // this.checkAdminStatus(username);
          this.log.logVerbose(this.className, 'validateUserLDAP', 'User with id: ' + this.currentUser.username + ' is now online.');
        } else {
          this.log.logVerbose(this.className, 'validateUserLDAP', 'Received empty data from REST server.');
          this.log.logVerbose(this.className, 'validateUserLDAP', 'Credentials may be incorrect.');
          this.throwErrors(ErrorCodes.INCORRECT_CREDENTIALS);
        }
    }, error => {
      this.log.logVerbose(this.className, 'validateUserLDAP', 'There is an error connecting to the REST server.');
      this.log.logVerbose(this.className, 'validateUserLDAP', error);
      if (this.confService.getConfig(ConfigNames.CONF_DEVMODE) === 'Y') {
        this.log.logVerbose(this.className, 'validateUserLDAP', 'Application is running in developer mode.');
        this.log.logVerbose(this.className, 'validateUserLDAP', 'Connecting to the development REST login server.');
        this.loginUser(username, password);
      } else {
        this.throwErrors(ErrorCodes.SERVER_ERROR);
      }
    }, () => {
      if (this.loginErrors === ErrorCodes.NO_ERRORS) {
        this.log.logVerbose(this.className, 'validateUserLDAP', 'Initiating admin rank check for user with id: ' + this.currentUser.username + '.');
        this.checkAdminStatus(this.currentUser.username);
      }
    });
  }
}
