import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { LoginService } from "../../services/login.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean; //flag to check if user is logged in
  isAdmin: boolean; //flag to check if user is admin
  hasLoginErrors: boolean; //flag to display login errors
  loginForm: FormGroup; //group for login form
  username: string; //property to hold the user's username
  
  private password: string; //property to hold the user's password

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.loginForm = this.createLoginFormGroup();
    this.loginService.getUserStatus().subscribe(status => {
      this.isLoggedIn = status;
    });
    this.loginService.getUserRank().subscribe(rank => {
      this.isAdmin = rank;
    });
    this.loginService.getUsername().subscribe(username => {
      this.username = username;
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
    this.username = this.loginForm.get('username').value;
    this.password = this.loginForm.get('password').value;
    if (this.username == null || this.password == null) {
      console.log("NavbarComponent: onSubmit(): One or more input fields have null values.")
    } else if (this.username === '' || this.password === '') {
      console.log("NavbarComponent: onSubmit(): One or more input fields have blank values.")
    } else {
      console.log("NavbarComponent: onSubmit(): Input values are valid.")
      console.log("NavbarComponent: onSubmit(): Coordinating with LoginService.")
      this.loginService.validateUserLDAP(this.username, this.password);
      this.processResults();
    }
  }

  private processResults(): void {
    if (!this.isLoggedIn) {
      //display errors on login form here
    }
  }

  /**
   * Executed when the Logout link is clicked.
   * Coordinates with the LoginService to ensure proper log out.
   */
  logOut(): void {
    console.log("NavbarComponent: logOut(): Trying to log out user.")
    this.loginService.logOutUser();
    if (!this.isLoggedIn) {
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
