import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Event } from "src/app/models/event";
import { System } from 'src/app/models/system';
import { ConfigNames, ErrorCodes } from 'src/app/constants/properties';
import { EventType } from 'src/app/models/eventtype';

import { NavService } from 'src/app/services/nav/nav.service';
import { LoginService } from 'src/app/services/login/login.service';
import { EventsService } from "../../services/events/events.service";
import { CoreService } from 'src/app/services/core/core.service';
import { LoggerService } from 'src/app/services/logger/logger.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  private className: string = 'ReportsComponent';
  FATALERROR: boolean;
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
  eventTypes: EventType[];
  eventTypeNames: string[];

  constructor(private builder: FormBuilder, private eventServ: EventsService,
    private nav: NavService, private login: LoginService,
    private core: CoreService, private log: LoggerService) { }

  ngOnInit(): void {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {
      this.FATALERROR = true;
    } else {
      this.initializeComponent();
    }
  }

  private initializeComponent(): void {
    this.log.logVerbose(this.className, 'initializeComponent', 'Initializing ' + this.className + '.');
    this.nav.setActiveTab(4);
    this.systems = [];
    this.selectedSystem = new System();
    this.systemList = [];
    this.zones = [];
    this.eventTypes =[];
    this.eventTypeNames = [];
    this.eventResults = [];
    this.isLoggedIn = this.login.getLoginStatus();
    this.isAdmin = this.login.getAdminStatus();
    this.username = this.login.getUsername();
    this.checkOpenReports();
    this.populateSystems();
    this.setEventTypes();
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
    this.eventServ.subscribeGetEventResults().subscribe(data => {
      this.eventResults = data;
    });
  }

  private initializeForm(): void {
    this.reportForm = this.createEventForm();
    this.reportForm.controls['curSysVer'].disable();
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
      curSysVer: [''],
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
    if (this.reportForm.controls['curSysVer'].value) {
      this.reportForm.controls['startDate'].disable();
      this.reportForm.controls['endDate'].disable();
    } else {
      this.reportForm.controls['startDate'].enable();
      this.reportForm.controls['endDate'].enable();
    }
  }

  private populateSystems(): void {
    this.systems = this.core.getSystems();
    let arr: any[] = [];
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
      this.reportForm.controls['curSysVer'].disable();
      this.reportForm.controls['curSysVer'].setValue(false);
    } else {
      this.reportForm.controls['startDate'].enable();
      this.reportForm.controls['endDate'].enable();
      this.reportForm.controls['zone'].enable();
      this.reportForm.controls['curSysVer'].enable();
      this.selectedSystem = this.systems.find(x => x.globalPrefix == $event);
      this.reportForm.controls['zone'].setValue('');
      this.zones = this.setZones();
    }
  }

  private setZones(): any[] {
    if(Object.keys(this.selectedSystem).length > 0) {
      let zones: any[] = ['All',
        this.selectedSystem.zone1Prefix,
        this.selectedSystem.zone2Prefix];
      return zones;
    } else {
      let zones: any[] = [];
      return zones;
    }
  }

  private setEventTypes(): void {
    this.eventTypes = this.core.getEventTypes();
    this.eventTypes.forEach(element => {
      this.eventTypeNames.push(element.name);
    });
  }

  private checkOpenReports(): void {
    if (this.core.getConfigValue(ConfigNames.CONF_OPEN_REPORTS) == 'Y') {
      this.openReports = true;
    } else {
      this.openReports = false;
    }
  }
}
