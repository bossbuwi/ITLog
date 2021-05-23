import { Component, OnInit } from '@angular/core';

import { ConfigNames, ErrorCodes } from 'src/app/constants/properties';

import { LoginService } from "src/app/services/login/login.service";
import { NavService } from "src/app/services/nav/nav.service";
import { CoreService } from 'src/app/services/core/core.service';
import { LoggerService } from 'src/app/services/logger/logger.service';

@Component({
  selector: 'app-general-workspace',
  templateUrl: './general-workspace.component.html',
  styleUrls: ['./general-workspace.component.css']
})
export class GeneralWorkspaceComponent implements OnInit {
  private className: string = 'GeneralWorkspaceComponent';
  FATALERROR: boolean;
  active = 1;
  isLoggedIn: boolean;
  isAdmin: boolean;
  openReports: boolean;
  navTabsDesign: string;

  constructor(private loginService: LoginService, private nav: NavService,
    private core: CoreService, private log: LoggerService) {}

  ngOnInit(): void {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {
      this.FATALERROR = true;
    } else {
      this.initializeComponent();
    }
  }

  private initializeComponent(): void {
    this.log.logVerbose(this.className, 'initializeComponent', 'Initializing ' + this.className + '.');
    this.loginService.subscribeUserStatus().subscribe(status => {
      this.isLoggedIn = status;
      this.isAdmin = this.loginService.getAdminStatus();
    });
    this.nav.subscribeActiveTab().subscribe(tab => {
      this.active = tab;
    })
    this.isLoggedIn = this.loginService.getLoginStatus();
    this.isAdmin = this.loginService.getAdminStatus();
    this.checkOpenReports();
    this.checkNavTabsDesign();
  }

  private checkOpenReports(): void {
    this.log.logVerbose(this.className, 'checkOpenReports', 'Checking for openreports configuration.');
    if (this.core.getConfigValue(ConfigNames.CONF_OPEN_REPORTS) == 'Y') {
      this.openReports = true;
    } else {
      this.openReports = false;
    }
  }

  private checkNavTabsDesign(): void {
    this.log.logVerbose(this.className, 'checkNavTabsDesign', 'Checking for the configured navdesign.');
    this.navTabsDesign = this.core.getConfigValue(ConfigNames.CONF_NAVTAB_DESIGN);
  }
}
