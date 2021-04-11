import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EventsService } from "../../services/events/events.service";
import { Event } from "../../model/event";
import { NavService } from 'src/app/services/nav/nav.service';
import { LoginService } from 'src/app/services/login/login.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string;
  reportForm: FormGroup;
  eventResults: Event[];

  constructor(private builder: FormBuilder, private eventServ: EventsService,
    private nav: NavService, private login: LoginService) { }

  ngOnInit(): void {
    this.nav.setActiveTab(4);
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
    this.eventResults = [];
    this.reportForm = this.createEventForm();
    this.eventServ.subscribeGetEventResults().subscribe(data => {
      this.eventResults = data;
    })
  }

  /**
   *
   * @returns
   */
  private createEventForm(): FormGroup {
    return this.builder.group({
      zone: [''],
      type: [''],
      startDate: [''],
      endDate: [''],
      cursysver: [''],
      requestReport: ['']
    });
  }

  /**
   *
   * @param $event
   */
  onSubmit($event: any): void {
    console.log($event.submitter.id);
    if ($event.submitter.id == 'search') {
      this.reportForm.controls['requestReport'].setValue(false);
      this.eventServ.requestReport(this.reportForm);
    } else if ($event.submitter.id == 'generate') {
      this.reportForm.controls['requestReport'].setValue(true);
      this.eventServ.requestReport(this.reportForm);
    }
  }

  /**
   *
   */
  onCheckboxChange(): void {
    if (this.reportForm.controls['cursysver'].value) {
      this.reportForm.controls['startDate'].disable();
      this.reportForm.controls['endDate'].disable();
    } else {
      this.reportForm.controls['startDate'].enable();
      this.reportForm.controls['endDate'].enable();
    }
  }
}
