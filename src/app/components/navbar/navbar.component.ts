import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LoggerService } from 'src/app/services/logger/logger.service';
import { LoginService } from "../../services/login/login.service";

import { ErrorCodes } from "../../model/constants/properties";
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private className: string = NavbarComponent.name;
  //fields used by the template
  isLoggedIn: boolean; //flag to check if user is logged in
  isAdmin: boolean; //flag to check if user is admin
  username: string; //property to hold the user's username
  hasErrors: boolean; //flag to display errors on template
  loginForm: FormGroup; //group for login form
  FATALERROR: boolean;

  private password: string; //property to hold the user's password

  constructor(private loginService: LoginService, private log: LoggerService,
    private modalPopUp: NgbModal, private core: CoreService) {}

  ngOnInit(): void {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {
      this.FATALERROR = true;
    }
    this.log.logVerbose(this.className, 'ngOnInit', 'Initiating ' + this.className + '.');
    //creates the login formgroup object
    this.loginForm = this.createLoginFormGroup();
    //subscribes to the user login status from the loginservice
    this.loginService.subscribeUserStatus().subscribe(status => {
      this.isLoggedIn = status;
      this.isAdmin = this.loginService.getAdminStatus();
      this.username = this.loginService.getUsername();
    });
    this.loginService.subscribeLoginErrors().subscribe(loginErrors => {
      this.checkErrors(loginErrors);
    });
  }

  /**
   * Creates the login form group.
   * @returns FormGroup The login form group.
   */
  private createLoginFormGroup(): FormGroup {
    return new FormGroup({
      username: new FormControl(),
      password: new FormControl()
    });
  }

  /**
   * Executes when the Login button is clicked.
   * Validates the input for any invalid values and
   * then sends it to the LoginService for processing.
   * If the service deems the login to be successful,
   * this sets the logged in flag. If the user is also
   * an admin, this also sets the admin flag.
   */
  onSubmit(): void {
    //assigns the values of the form's input fields to their corresponding property
    this.username = this.loginForm.get('username').value;
    this.password = this.loginForm.get('password').value;
    this.log.logVerbose(this.className, 'onSubmit', 'A user is trying to login.');
    //checks for null or blank values in either of the login input fields
    if (this.username == null || this.password == null) {
      this.log.logError(this.className, 'onSubmit', 'One or more input fields have null values.');
      this.hasErrors = true;
    } else if (this.username === '' || this.password === '') {
      this.log.logError(this.className, 'onSubmit', 'One or more input fields have blank values.');
      this.hasErrors = true;
    } else {
      //if the input field values are not null or blank
      //the values are sent to the login service for processing
      //the loginservice will then automatically update the user's login status
      //because the service has been subscribed on to when the component is initiated
      this.log.logVerbose(this.className, 'onSubmit', 'Data entered on the input fields are valid.');
      this.log.logVerbose(this.className, 'onSubmit', 'Coordinating with LoginService to initiate the login process.');
      this.loginService.validateUserLDAP(this.username, this.password);
    }
  }

  /**
   *
   * @param loginErrors
   */
  private checkErrors(loginErrors: number): void {
    switch (loginErrors) {
      case ErrorCodes.NO_ERRORS: {
        this.log.logVerbose(this.className, 'checkErrors', 'No errors on login.');
        this.hasErrors = false;
        break;
      }
      case ErrorCodes.INCORRECT_CREDENTIALS: {
        this.log.logError(this.className, 'checkErrors', 'Username or password may be incorrect.');
        this.hasErrors = true;
        break;
      }
      default: {
        this.log.logError(this.className, 'checkErrors', 'An unknown error occured.');
        this.log.logError(this.className, 'checkErrors', 'Please contact an administrator.');
        this.hasErrors = true;
        break;
      }
    }
  }

  /**
   * Executed when the Logout link is clicked.
   * Coordinates with the LoginService to ensure proper log out.
   */
  logOut(): void {
    //calls the login service to try to logout the user
    //the loginservice will then automatically update the user's login status
    //because the service has been subscribed on to when the component is initiated
    this.log.logVerbose(this.className, 'logOut', 'User with id: ' + this.username + ' is trying to logout.');
    this.loginService.logOutUser();
    //checks if the user's login status has been changed to false
    if (!this.isLoggedIn) {
      //if user's login status is false, it means that the user
      //has been logged out by the service
      //this will reset the form, clearing any previously entered
      //information that were stored locally and
      //resetting any flags that have been changed
      this.log.logVerbose(this.className, 'logOut', 'Cleaning up any debris.');
      this.loginForm.reset();
      this.password = null;
      this.log.logVerbose(this.className, 'logOut', 'User has logged out successfully.');
    }
  }

  displayAbout(modal: any): void {
    this.modalPopUp.open(modal, { scrollable: true, size: 'lg' });
  }

  displayAdminRank(modal: any) {
    this.modalPopUp.open(modal, { centered: true, size: 'sm' });
  }

  displayNormalRank(modal: any) {
    this.modalPopUp.open(modal, { centered: true, size: 'sm' });
  }
}
