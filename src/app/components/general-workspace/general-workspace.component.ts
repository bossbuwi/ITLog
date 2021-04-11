import { Component, OnInit } from '@angular/core';

import { ErrorCodes } from 'src/app/model/constants/properties';

import { LoginService } from "../../services/login/login.service";
import { NavService } from "../../services/nav/nav.service";
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-general-workspace',
  templateUrl: './general-workspace.component.html',
  styleUrls: ['./general-workspace.component.css']
})
export class GeneralWorkspaceComponent implements OnInit {
  private className: string = 'GeneralWorkspaceComponent';
  active = 1;
  isLoggedIn: boolean;
  isAdmin: boolean;
  FATALERROR: boolean;

  constructor(private loginService: LoginService, private nav: NavService,
    private core: CoreService) {}

  ngOnInit(): void {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {
      this.FATALERROR = true;
    }
    this.loginService.subscribeUserStatus().subscribe(status => {
      this.isLoggedIn = status;
      this.isAdmin = this.loginService.getAdminStatus();
    });
    this.nav.subscribeActiveTab().subscribe(tab => {
      this.active = tab;
    })
  }
}
