import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { LoginService } from "../../services/login.service";
import { User } from "../../model/user";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  //assigns the initial active tab
  active = 1;
  loggedIn: boolean;
  loginForm: FormGroup;

  constructor(private loginService: LoginService) {

  }

  ngOnInit(): void {
    this.loggedIn = this.loginService.checkUserStatus();
    this.loginForm = this.createLoginFormGroup();
  }

  createLoginFormGroup(): FormGroup {
    return new FormGroup({
      username: new FormControl(),
      password: new FormControl()
    });
  }

  onSubmit(): void {
    console.log("User clicked submit.")
    const result: User = Object.assign({}, this.loginForm.value);
    console.log(result);
    this.loggedIn = this.loginService.logUserIn(result.username, result.password);
  }

  logOut(): void {
    this.loginForm.reset();
    this.loggedIn = this.loginService.logUserOut();
  }
}
