import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

import { Event } from "../../model/event";
import { System } from "../../model/system";
import { EventTypes, EventTypesREST, FormMode } from "../../model/constants/properties";

import { EventsService } from "../../services/events/events.service";
import { LoginService } from "../../services/login/login.service";
import { LoggerService } from "../../services/logger/logger.service";
import { CoreService } from 'src/app/services/core/core.service';
import { NavService } from 'src/app/services/nav/nav.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  private className: string = 'ReservationComponent';
  private username: string;
  eventModel: Event;
  systems: System[];
  selectedSystem: System;
  zones: any[];
  isInsert: boolean; //flag to signify that form is in insert mode
  isEdit: boolean; //flag to signify that form is in edit mode
  isConfirm: boolean; //flag to signify that form is in confirm mode
  eventForm: FormGroup; //the event formgroup object
  eventTypes: any[]; //array to hold the options for the event types select element
  isLoggedIn: boolean; //flag to indicate if user is logged in
  isAdmin: boolean; //flag to indicate if user is admin
  hasErrors: boolean; //flag to indicate that form has errors

  constructor(private log: LoggerService, private loginService: LoginService,
    private builder: FormBuilder, private eventServ: EventsService,
    private core: CoreService, private nav: NavService) { }

  ngOnInit(): void {
    this.nav.setActiveTab(3);
    this.systems = [];
    this.selectedSystem = new System();
    this.systems = this.core.getSystems();
    this.zones = [];
    //create a new event model where form values would be mapped
    this.eventModel = new Event();
    this.log.logVerbose(this.className, 'ngOnInit', 'Initiating ' + this.className + '.');
    //get status of the login and admin flags and the user's id
    //this is important because the reservation is created
    //normally after the user has logged in so the reservation component
    //is not yet existing when the login service broadcasted the change
    //in status for the login and admin flags and for the user's id
    this.log.logVerbose(this.className, 'ngOnInit', 'Getting information from LoginService.');
    this.isLoggedIn = this.loginService.getLoginStatus();
    this.isAdmin = this.loginService.getAdminStatus();
    this.username = this.loginService.getUsername();
    //sets the form mode into the default insert mode
    this.setFormMode(FormMode.FORM_INSERT);
    //subscribe to the login service's broadcasts
    //this is important to be up to date with any changes and of course
    //to be able to update properly for those users that directly
    //went to the reservation page without logging in
    this.log.logVerbose(this.className, 'ngOnInit', "Subscribing to LoginService's broadcasts.");
    this.loginService.subscribeUserStatus().subscribe(status => {
      //broadcasted changes in online status is also saved locally
      //form must be initialized afterwards to be able to be seen
      //because only online users could see the form and the user's
      //rank would also affect some of the elements' contents
      //the username must also be updated from the login service
      this.isLoggedIn = status;
      this.isAdmin = this.loginService.getAdminStatus();
      this.username = this.loginService.getUsername();
      this.initializeForm();
    });
    //creates the actual form after all of the core dependencies are fetched
    this.eventForm = this.createEventForm();
    //finally, initialize the form
    this.initializeForm();
    //these are subscriptions to the events service's broadcasts
    this.eventServ.subscribeInsertEventCompletion().subscribe(insert => {
      //this subscription would receive data after a successful insert
      //this should send the form into confirm mode to be able
      //to show the user one last time what the inserted data is
      this.setFormMode(FormMode.FORM_CONFIRM);
      //save the object from the event service
      this.eventModel = insert;
      //initialize the form to update the values with the
      //values received from the server
      this.initializeForm();
    });
    this.eventServ.subscribeGetEventEditCompletion().subscribe(editStart => {
      //this subscription would receive data if the event service
      //has finished fetching the data of the event to be edited from the server
      //if this received a data, it means that the form should be in edit mode
      this.setFormMode(FormMode.FORM_EDIT);
      //save the object from the event service
      this.eventModel = editStart;
      //initialize the form to update the values with the
      //values received from the server
      this.initializeForm();
    });
    this.eventServ.subscribeEditEventCompletion().subscribe(editDone => {
      //this subscription would receive data if the event edited
      //has been sent and processed by the REST server
      //this should send the form into confirm mode
      this.setFormMode(FormMode.FORM_CONFIRM);
      //save the object from the event service
      this.eventModel = editDone;
      //initialize the form to update and display the new values from the server
      this.initializeForm();
    });
  }

  /**
   * Creates the reservation form using a form builder.
   * Also sets the validators for required fields.
   * @returns The reservation form group.
   */
  private createEventForm(): FormGroup {
    this.log.logVerbose(this.className, 'createEventForm', 'Generating event reservation form.');
    return this.builder.group({
      user: [],
      system: ['',[Validators.required]],
      zone: ['',[Validators.required]],
      type: ['',[Validators.required]],
      jiraCase: [],
      startDate: ['',[Validators.required]],
      endDate: ['',[Validators.required]],
      featureOn: [],
      featureOff: [],
      apiUsed: [],
      compiledSources: []
    });
  }

  /**
   *
   */
  private initializeForm(): void {
    //this must be streamlined because it is messy and inefficient
    //change the event type select element's contents depending on user's rank
    this.eventTypes = this.getEventTypes(this.isAdmin);
    //sets the default values for the fields if the form is in edit mode or confirm mode
    if (this.isEdit || this.isConfirm) {
      this.log.logVerbose(this.className, 'initializeForm', 'Mapping the event object into the form.');
      this.eventForm.controls['system'].setValue(this.eventModel.system);
      this.onSystemChange(this.eventModel.system);
      this.eventForm.controls['zone'].setValue(this.eventModel.zone);
      //event type select element's contents must be translated first
      //because the REST server has different values from the select options
      this.eventForm.controls['type'].setValue(this.translateRESTValues(this.eventModel.type));
      this.eventForm.controls['jiraCase'].setValue(this.eventModel.jiraCase);
      //translates the dates from the REST server because the datepicker element could only
      //recognize a specific format and that is yyyy-MM-dd
      this.eventForm.controls['startDate'].setValue(this.formatForDatepicker(this.eventModel.startDate));
      this.eventForm.controls['endDate'].setValue(this.formatForDatepicker(this.eventModel.endDate));
      this.eventForm.controls['featureOn'].setValue(this.eventModel.featureOn);
      this.eventForm.controls['featureOff'].setValue(this.eventModel.featureOff);
      this.eventForm.controls['apiUsed'].setValue(this.eventModel.apiUsed);
      this.eventForm.controls['compiledSources'].setValue(this.eventModel.compiledSources);
    }
    //disables the start date field if the form is in edit mode
    if (this.isEdit) {
      this.eventForm.controls['startDate'].disable();
    } else if (this.isConfirm) {
      //else if form is in confirm mode, disable it fully
      this.eventForm.disable();
    } else if (this.isInsert) {
      //else if form is in insert mode, enable all fields
      this.eventForm.enable();
    }
    //sets the default values for the username field
    this.eventForm.controls['user'].setValue(this.username);
    //disables the username field
    //this is done by default, whatever mode the form is in
    this.eventForm.controls['user'].disable();
  }

  /**
   * Sets the reservation form's current mode. This will change
   * the component's mode flags depending on the input.
   * @param mode The current mode that the reservation form is in.
   * The input must be from the properties file for consistency.
   */
  private setFormMode(mode: string): void {
    switch (mode) {
      case FormMode.FORM_INSERT:
        this.isInsert = true;
        this.isEdit = false;
        this.isConfirm = false;
        break;
      case FormMode.FORM_EDIT:
        this.isInsert = false;
        this.isEdit = true;
        this.isConfirm = false;
        break;
      case FormMode.FORM_CONFIRM:
        this.isInsert = false;
        this.isEdit = false;
        this.isConfirm = true;
        break;
      default:

        break;
    }
  }

  /**
   *
   */
  onSubmit(): void {
    console.log(this.eventForm.controls['system']);
    console.log(this.eventForm.controls['zone']);
    //this is executed when the user clicks the submit button
    //be aware that the submit button is present both when form is in
    //insert mode and on edit mode so the codes must be robust enough
    //to accomodate both modes on a single method
    //create a variable that will hold the  result of the date checking
    //this must be done to ensure that the end date is not earlier than the start date
    var compareResult: any = this.compareDates(this.eventForm.controls['startDate'].value, this.eventForm.controls['endDate'].value);
    //if start date is later than end date, send out an error and mark the form as invalid
    //also set the hasErrors flag to display any errors on the page
    if (compareResult ==  this.eventForm.controls['startDate'].value) {
      this.log.logVerbose(this.className, 'onSubmit', 'End date is earlier than Start date.');
      this.log.logVerbose(this.className, 'onSubmit', 'Setting errors flag.');
      this.hasErrors = true;
      this.eventForm.invalid
    } else {
      //else mark the form as valid and clear the hasErrors flag to remove any displayed errors
      this.hasErrors = false;
      this.eventForm.valid;
      //temporarily enable the username and system fields to be able to get their values
      this.eventForm.controls['user'].enable();
      this.eventForm.controls['system'].enable();
      //this is where the conditions would branch out because the flow would now differ
      //when the form is in edit mode versus when it is in insert mode
      if (this.isInsert) {
        //call the event service and submit the whole form
        this.eventServ.submitEvent(this.eventForm);
        //disable the user and system fields again
        //this may be redundant because the whole form would be disabled after a successful insert
        //and that includes the username and system fields
        //however, the time between the submit action and the REST server processing the data could be long
        //that would leave the user and system fields enabled for that time span
        this.eventForm.controls['user'].disable();
        this.eventForm.controls['system'].disable();
      } else if (this.isEdit) {
        //if the form is in edit mode, the start date is also disabled
        //so it must be temporarily enabled for its value to be read
        this.eventForm.controls['startDate'].enable();
        //call the event service and submit the whole form
        //but this time, another parameter is also sent to the event service
        //that is the id property of the event being edited
        this.eventServ.editEvent(this.eventForm, this.eventModel._id);
        //disable back the user and system fields for the same reason as that on insert mode
        this.eventForm.controls['user'].disable();
        this.eventForm.controls['system'].disable();
        //also return the start date field into disabled state
        this.eventForm.controls['startDate'].disable();
      }
    }
  }

  /**
   *
   */
  resetForm(): void {
    this.setFormMode(FormMode.FORM_INSERT);
    this.eventForm.reset();
    this.eventForm.enable();
    this.initializeForm();
  }

  /**
   *
   * @returns
   */
  private setZones(): any[] {
    if(Object.keys(this.selectedSystem).length > 0) {
      var zones: any[] = [this.selectedSystem.zone1Prefix,
        this.selectedSystem.zone2Prefix,
        this.selectedSystem.zone1Prefix + '-' + this.selectedSystem.zone2Prefix,];
      return zones;
    } else {
      var zones: any[] = [];
      return zones;
    }
  }

  /**
   *
   * @param $event
   */
  private onSystemChange($event: any) {
    this.selectedSystem = this.systems.find(x => x.globalPrefix == $event);
    this.eventForm.controls['zone'].setValue('');
    this.zones = this.setZones();
  }

  /**
   *
   * @param date
   * @returns
   */
  private formatForDatepicker(date: string): NgbDate {
    var dateArr: string[] = date.split('-',3);
    var year: number = parseInt(dateArr[0], 10);
    var month: number = parseInt(dateArr[1], 10);
    var day: number = parseInt(dateArr[2], 10);
    return new NgbDate(year, month, day);
  }

  /**
   *
   * @param startDate
   * @param endDate
   * @returns
   */
  private compareDates(startDate: any, endDate: any): any {
    var dStartDate: Date = new Date(startDate.year, startDate.month-1, startDate.day);
    var dEndDate: Date = new Date(endDate.year, endDate.month-1, endDate.day);
    if (dStartDate > dEndDate) {
      return startDate;
    } else {
      return endDate;
    }
  }

  /**
   *
   * @param adminStatus
   * @returns
   */
  private getEventTypes(adminStatus: boolean): any[] {
    var adminList: any[] = [EventTypes.IC, EventTypes.COB,
      EventTypes.IC_COB, EventTypes.MAINTENANCE, EventTypes.SYS_UPGRADE];
    var normalList: any[] = [EventTypes.IC, EventTypes.COB,
      EventTypes.IC_COB];
    if (adminStatus) {
      return adminList;
    } else {
      return normalList;
    }
  }

  /**
   *
   * @param value
   * @returns
   */
  private translateRESTValues(value: any): string {
    switch (value) {
      case EventTypesREST.IC:
        return EventTypes.IC;
      case EventTypesREST.COB:
        return EventTypes.COB;
      case EventTypesREST.IC_COB:
        return EventTypes.IC_COB;
      case EventTypesREST.MAINTENANCE:
        return EventTypes.MAINTENANCE;
      case EventTypesREST.SYS_UPGRADE:
        return EventTypes.SYS_UPGRADE;
      default:
        return EventTypes.IC;
    }
  }

  //sample custom validator
  // ageRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
  //   if (control.value !== undefined && (isNaN(control.value) || control.value < 18 || control.value > 45)) {
  //       return { 'ageRange': true };
  //   }
  //   return null;
  // }
}
