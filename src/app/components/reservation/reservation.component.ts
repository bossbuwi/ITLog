import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EventsService } from "../../services/events/events.service";
import { LoginService } from "../../services/login/login.service";
import { LoggerService } from "../../services/logger/logger.service";

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  private className: string = ReservationComponent.name;
  private username: string;
  private dStartDate: any;
  private dEndDate: any;
  isLoggedIn: boolean; //flag to indicate if user is logged in
  hasErrors: boolean; //flag to indicate that form has errors
  eventForm: FormGroup; //the event formgroup object
  eventSuccess: boolean; //flag to indicate that the event has been successfully inserted

  constructor(private log: LoggerService, private loginService: LoginService, private builder: FormBuilder, private eventServ: EventsService) { }

  ngOnInit(): void {
    this.log.logVerbose(this.className, 'ngOnInit', 'Initiating ' + this.className + '.');
    this.log.logVerbose(this.className, 'ngOnInit', 'Getting information from LoginService.');
    this.isLoggedIn = this.loginService.getLoginStatus();
    this.username = this.loginService.getUsername();
    this.log.logVerbose(this.className, 'ngOnInit', "Subscribing to LoginService's subjects.");
    this.loginService.subscribeUserStatus().subscribe(status => {
      this.isLoggedIn = status;
      this.initializeForm();
    });
    this.loginService.subscribeUsername().subscribe(username => {
      this.username = username;
      this.initializeForm();
    });
    this.eventServ.insertEventCompleted().subscribe(complete => {
      this.eventSuccess = complete;
      this.eventForm.disable();
      this.eventForm.controls['startDate'].setValue(this.dStartDate);
      this.eventForm.controls['endDate'].setValue(this.dEndDate);
    });
    this.eventForm = this.createEventForm();
    this.initializeForm();
  }

  private createEventForm(): FormGroup {
    this.log.logVerbose(this.className, 'createEventForm', 'Generating event reservation form.');
    return this.builder.group({
      user: [],
      system: [],
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

  private initializeForm(): void {
    this.log.logVerbose(this.className, 'initializeForm', 'Initializing form and setting default values.');
    this.eventForm.controls['user'].setValue(this.username);
    this.eventForm.controls['user'].disable();
    this.eventForm.controls['system'].setValue('OS');
    this.eventForm.controls['system'].disable();
  }

  onSubmit(): void {
    this.log.logVerbose(this.className, 'onSubmit', 'User is trying to submit the event reservation form.');
    this.log.logVerbose(this.className, 'onSubmit', 'Temporarily enabling all fields to extract values.');
    this.eventForm.controls['user'].enable();
    this.eventForm.controls['system'].enable();
    this.log.logVerbose(this.className, 'onSubmit', 'Formatting date inputs and executing date checks.');
    var rStartDate = this.eventForm.controls['startDate'].value;
    var startDate: Date = new Date(rStartDate.year, rStartDate.month-1, rStartDate.day);
    var rEndDate = this.eventForm.controls['endDate'].value;
    var endDate: Date = new Date(rEndDate.year, rEndDate.month-1, rEndDate.day);
    if (endDate < startDate) {
      this.log.logVerbose(this.className, 'onSubmit', 'End date is earlier than Start date.');
      this.log.logVerbose(this.className, 'onSubmit', 'Setting errors flag.');
      this.hasErrors = true;
      this.eventForm.invalid
    } else {
      this.hasErrors = false;
      this.eventForm.valid
      this.dStartDate = rStartDate;
      this.dEndDate = rEndDate;
      this.eventServ.submitEvent(this.eventForm);
      this.eventForm.controls['user'].disable();
      this.eventForm.controls['system'].disable();
    }
  }

  resetForm(): void {
    this.eventSuccess = false;
    this.eventForm.reset();
    this.eventForm.enable();
    this.initializeForm();
  }

  //sample custom validator
  // ageRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
  //   if (control.value !== undefined && (isNaN(control.value) || control.value < 18 || control.value > 45)) {
  //       return { 'ageRange': true };
  //   }
  //   return null;
  // }
}
