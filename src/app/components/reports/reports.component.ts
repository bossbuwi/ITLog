import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EventsService } from "../../services/events/events.service";
import { Event } from "../../models/event";
import { NavService } from 'src/app/services/nav/nav.service';
import { LoginService } from 'src/app/services/login/login.service';
import { System } from 'src/app/models/system';
import { CoreService } from 'src/app/services/core/core.service';
import { ConfigNames } from 'src/app/models/constants/properties';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string;
  openReports: boolean;
  isCollapsed = true;
  reportForm: FormGroup;
  eventResults: Event[];
  systems: System[];
  selectedSystem: System;
  systemList: any[];
  zones: any[];

  constructor(private builder: FormBuilder, private eventServ: EventsService,
    private nav: NavService, private login: LoginService,
    private core: CoreService) { }

  ngOnInit(): void {
    this.nav.setActiveTab(4);
    this.systems = [];
    this.selectedSystem = new System();
    this.systemList = [];
    this.zones = [];
    this.populateSystems();
    this.isLoggedIn = this.login.getLoginStatus();
    this.isAdmin = this.login.getAdminStatus();
    this.username = this.login.getUsername();
    this.checkOpenReports();
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
    this.initializeForm();
    this.eventResults = [];
    this.eventServ.subscribeGetEventResults().subscribe(data => {
      this.eventResults = data;
    })
  }

  private initializeForm(): void {
    this.reportForm = this.createEventForm();
    this.reportForm.controls['cursysver'].disable();
  }

  /**
   *
   * @returns
   */
  private createEventForm(): FormGroup {
    return this.builder.group({
      system: [''],
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
  private onCheckboxChange(): void {
    if (this.reportForm.controls['cursysver'].value) {
      this.reportForm.controls['startDate'].disable();
      this.reportForm.controls['endDate'].disable();
    } else {
      this.reportForm.controls['startDate'].enable();
      this.reportForm.controls['endDate'].enable();
    }
  }

  private populateSystems(): void {
    this.systems = this.core.getSystems();
    var arr: any[] = [];
    this.systems.forEach(element => {
      arr.push(element.globalPrefix);
    })
    arr.unshift('All');
    this.systemList = arr;
  }

  private onSystemChange($event: any) {
    if ($event == 'All') {
      this.reportForm.controls['zone'].disable();
      this.reportForm.controls['zone'].setValue('');
      this.reportForm.controls['cursysver'].disable();
      this.reportForm.controls['cursysver'].setValue(false);
    } else {
      this.reportForm.controls['startDate'].enable();
      this.reportForm.controls['endDate'].enable();
      this.reportForm.controls['zone'].enable();
      this.reportForm.controls['cursysver'].enable();
      this.selectedSystem = this.systems.find(x => x.globalPrefix == $event);
      this.reportForm.controls['zone'].setValue('');
      this.zones = this.setZones();
    }
  }

  private setZones(): any[] {
    if(Object.keys(this.selectedSystem).length > 0) {
      var zones: any[] = ['All',
        this.selectedSystem.zone1Prefix,
        this.selectedSystem.zone2Prefix];
      return zones;
    } else {
      var zones: any[] = [];
      return zones;
    }
  }

  private checkOpenReports(): void {
    if (this.core.getConfigValue(ConfigNames.CONF_OPEN_REPORTS) == 'Y') {
      this.openReports = true;
    } else {
      this.openReports = false;
    }
  }
}
