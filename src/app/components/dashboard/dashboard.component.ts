import { Component, OnInit } from '@angular/core';

import { ErrorCodes } from 'src/app/constants/properties';
import { CoreService } from 'src/app/services/core/core.service';
import { LoggerService } from 'src/app/services/logger/logger.service';
import { LoginService } from 'src/app/services/login/login.service';
import { NavService } from 'src/app/services/nav/nav.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private className: string = 'DashboardComponent';
  FATALERROR: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string;
  active: number = 1;

  constructor(private login: LoginService, private nav: NavService,
    private core: CoreService, private log: LoggerService) {

  }

  ngOnInit(): void {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {
      this.FATALERROR = true;
    } else {
      this.initializeComponent();
    }
  }

  private initializeComponent(): void {
    this.log.logVerbose(this.className, 'initializeComponent', 'Initializing ' + this.className + '.');
    this.nav.setActiveTab(5);
    this.isLoggedIn = this.login.getLoginStatus();
    this.isAdmin = this.login.getAdminStatus();
    this.username = this.login.getUsername();
    this.login.subscribeUserStatus().subscribe(status => {
      //broadcasted changes in online status is also saved locally
      //form must be initialized afterwards to be able to be seen
      //because only online users could see the form and the user's
      //rank would also affect some of the elements' contents
      //the username must also be updated from the login service
      this.isLoggedIn = status;
      this.isAdmin = this.login.getAdminStatus();
      this.username = this.login.getUsername();
    });
  }
}
