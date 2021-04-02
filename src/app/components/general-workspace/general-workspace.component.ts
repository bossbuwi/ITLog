import { Component, OnInit } from '@angular/core';

import { LoginService } from "../../services/login/login.service";

@Component({
  selector: 'app-general-workspace',
  templateUrl: './general-workspace.component.html',
  styleUrls: ['./general-workspace.component.css']
})
export class GeneralWorkspaceComponent implements OnInit {
  active = 1;
  isLoggedIn: boolean;
  isAdmin: boolean;

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.loginService.subscribeUserStatus().subscribe(status => {
      this.isLoggedIn = status;
    });
    this.loginService.subscribeUserRank().subscribe(rank => {
      this.isAdmin = rank;
    });
  }

}
