import { Component, OnInit } from '@angular/core';

import { LoginService } from "../../services/login/login.service";
import { NavService } from "../../services/nav/nav.service";

@Component({
  selector: 'app-general-workspace',
  templateUrl: './general-workspace.component.html',
  styleUrls: ['./general-workspace.component.css']
})
export class GeneralWorkspaceComponent implements OnInit {
  active = 1;
  isLoggedIn: boolean;
  isAdmin: boolean;

  constructor(private loginService: LoginService, private nav: NavService) {}

  ngOnInit(): void {
    this.loginService.subscribeUserStatus().subscribe(status => {
      this.isLoggedIn = status;
      this.isAdmin = this.loginService.getAdminStatus();
    });
    // this.loginService.subscribeUserRank().subscribe(rank => {
    //   this.isAdmin = rank;
    // });
    this.nav.getActiveTab().subscribe(tab => {
      this.active = tab;
    })
  }
}
