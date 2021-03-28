import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { LoginService } from "../../services/login/login.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  //fields used for the subscriptions
  isLoggedIn: boolean; //flag to check if user is logged in
  isAdmin: boolean; //flag to check if user is admin
  username: string; //property to hold the user's username
  loginErrors: number; //field to display login errors
  loginCompleted: boolean; //flag to denote completed login process

  loginForm: FormGroup; //group for login form
  private password: string; //property to hold the user's password
  hasErrors: boolean; //flag to display errors on template

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.loginCompleted = false;
    this.loginErrors = 0;
    this.hasErrors = false;
    //creates the login formgroup object
    this.loginForm = this.createLoginFormGroup();
    //subscribes to the user login status from the loginservice
    this.loginService.getUserStatus().subscribe(status => {
      this.isLoggedIn = status;
    });
    //subscribes to the user login rank from the loginservice
    this.loginService.getUserRank().subscribe(rank => {
      this.isAdmin = rank;
    });
    //subscribes to the username status from the loginservice
    this.loginService.getUsername().subscribe(username => {
      this.username = username;
    });
    this.loginService.checkLoginErrors().subscribe(loginErrors => {
      this.loginErrors = loginErrors;
    });
    this.loginService.isLoginCompleted().subscribe(loginCompleted => {
      if (loginCompleted) {
        this.loginCompleted = loginCompleted;
        this.processResults();
      }
    });
  }

  /**
   * Creates the login form group.
   * @returns FormGroup The login form group.
   */
  createLoginFormGroup(): FormGroup {
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
    console.log("NavbarComponent: onSubmit(): User clicked submit.")
    console.log("NavbarComponent: onSubmit(): Username input: " + this.loginForm.get('username').value);
    console.log("NavbarComponent: onSubmit(): Password input: " + this.loginForm.get('password').value);
    //assigns the values of the form's input fields to their corresponding property
    this.username = this.loginForm.get('username').value;
    this.password = this.loginForm.get('password').value;
    console.log("NavbarComponent: onSubmit(): Resetting error code to 0.")
    this.loginErrors = 0;
    //checks for null or blank values in either of the login input fields
    if (this.username == null || this.password == null) {
      console.log("NavbarComponent: onSubmit(): One or more input fields have null values.")
    } else if (this.username === '' || this.password === '') {
      console.log("NavbarComponent: onSubmit(): One or more input fields have blank values.")
    } else {
      //if the input field values are not null or blank
      //the values are sent to the login service for processing
      //the loginservice will then automatically update the user's login status
      //because the service has been subscribed on to when the component is initiated
      console.log("NavbarComponent: onSubmit(): Input values are valid.")
      console.log("NavbarComponent: onSubmit(): Coordinating with LoginService.")
      this.loginService.validateUserLDAP(this.username, this.password);
    }
  }

  /**
   * This method is responsible for displaying errors
   * on the login form when a user fails to login. This
   * must always be called only when the form is submitted.
   * This must not be called on its own.
   */
  private processResults(): void {
    switch (this.loginErrors) {
      case 0: {
        console.log("NavbarComponent: processResults(): No logins errors.")
        break;
      }
      case 1: {
        console.log("NavbarComponent: processResults(): Username or password may be incorrect.")
        this.hasErrors = true;
        break;
      }
      default: {
        console.log("NavbarComponent: processResults(): Unidentified error (Error code: " + this.loginErrors + " ) from LoginService.")
        console.log("NavbarComponent: processResults(): Please contact an admin or check logs for further details.")
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
    console.log("NavbarComponent: logOut(): Trying to log out user.")
    this.loginService.logOutUser();
    //checks if the user's login status has been changed to false
    if (!this.isLoggedIn) {
      //if user's login status is false, it means that the user
      //has been logged out by the service
      //this will reset the form, clearing any previously entered
      //information that were stored locally and
      //resetting any flags that have been changed
      this.loginForm.reset();
      this.username = null;
      this.password = null;
      this.isAdmin = false;
      console.log("NavbarComponent: logOut(): Username: " + this.username);
      console.log("NavbarComponent: logOut(): Password: " + this.password);
      console.log("NavbarComponent: logOut(): Admin flag: " + this.isAdmin);
      console.log("NavbarComponent: logOut(): Online flag: " + this.isLoggedIn);
      console.log("NavbarComponent: logOut(): User logged out successfully.")
    }
  }
}
