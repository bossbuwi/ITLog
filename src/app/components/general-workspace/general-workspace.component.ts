import { Component, OnInit } from '@angular/core';

import { LoginService } from "../../services/login.service";

@Component({
  selector: 'app-general-workspace',
  templateUrl: './general-workspace.component.html',
  styleUrls: ['./general-workspace.component.css']
})
export class GeneralWorkspaceComponent implements OnInit {
  active = 1;
  isLoggedIn: boolean;

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.loginService.getUserStatus().subscribe(status => {
      this.isLoggedIn = status;
    });
  }

}
