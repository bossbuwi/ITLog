import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { ConfigurationService } from "../configuration/configuration.service";
import { LoggerService } from "../logger/logger.service";

import { Event } from "../../model/event";
import { RestUrls, ErrorCodes } from "../../model/constants/properties";

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private className: string = EventsService.name;
  eventsForMonth: Event[]; //holds the events for the whole month
  eventsForDay: Event[]; //holds the events for the selected day

  private eventChange: Subject<boolean>; //subject to broadcast if event fetching is finished
  private eventFetchEmpty: Subject<boolean>; //subject to broadcast if event insert is finished
  private eventInsertSuccess: Subject<boolean>; //subject to broadcast if event insert is finished

  constructor(private http: HttpClient, private log: LoggerService, private configService: ConfigurationService) {
    this.initializeService();
  }

  /**
   *
   */
  private initializeService(): void {
    this.log.logVerbose(this.className, 'initializeService', 'Initiating ' + this.className + '.');
    this.log.logVerbose(this.className, 'initializeService', 'Initiating subjects.');
    this.eventChange = new Subject<boolean>();
    this.eventFetchEmpty = new Subject<boolean>();
    this.eventInsertSuccess = new Subject<boolean>();
    this.log.logVerbose(this.className, 'initializeService', 'Initiating event arrays.');
    this.eventsForMonth = [];
    this.eventsForDay= [];
  }

  /**
   *
   * @returns
   */
  insertEventCompleted(): Observable<boolean> {
    this.log.logVerbose(this.className, 'insertEventCompleted', 'Inserting events to REST server complete.');
    return this.eventInsertSuccess.asObservable();
  }

  /**
   *
   * @returns
   */
  getEventsCompleted(): Observable<boolean> {
    this.log.logVerbose(this.className, 'getEventsCompleted', 'Communication with events REST server complete.');
    return this.eventChange.asObservable();
  }

  returnedEmptyEvents(): Observable<boolean> {
    return this.eventFetchEmpty.asObservable();
  }

  getEventsForDay(date: Date): Event[] {
    this.eventFetchEmpty.next(true);
    this.eventChange.next(false);
    this.eventsForDay = [];
    var pipe: DatePipe = new DatePipe('en-US');
    var fDate: string = pipe.transform(date, 'yyyy-MM-dd');
    const params: HttpParams = new HttpParams()
      .set('selectedDay', fDate)
    this.http.get(RestUrls.REST_EVENTS_TODAY_URL, { params: params }).subscribe(
      data => {
        console.log(data)
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            var evnt: Event = new Event();
            evnt = data[key];
            this.eventsForDay.push(evnt);
          }
        }
        if (this.eventsForDay.length == 0) {
          this.eventFetchEmpty.next(false);
          var evnt: Event = new Event();
          evnt._id = null;
          evnt.user = '';
          evnt.zone = '';
          evnt.type = '';
          evnt.jiraCase = '';
          evnt.startDate = null;
          evnt.endDate = null
          evnt.apiUsed = '';
          evnt.featureOn = '';
          evnt.featureOff = '';
          this.eventsForDay.push(evnt);
        }
        this.eventChange.next(true);
      },
      error => {
        console.error(error);
      },
      () => {

    });
    return this.eventsForDay;
  }

  getEventsForMonth(date: Date): Event[] {
    var pipe: DatePipe = new DatePipe('en-US');
    var dateS: string = pipe.transform(date, 'yyyy-MM-dd');
    const params: HttpParams = new HttpParams()
      .set('selectedDay', dateS);
    this.http.get(RestUrls.REST_EVENTS_TODAY_URL, { params: params }).subscribe(
      data => {
        console.log(data);
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            var evnt: Event = new Event();
            evnt = data[key];
            this.eventsForMonth.push(evnt);
          }
        }
      }, error => {
        console.error(error);
      }, () => {

      }
    );
    return this.eventsForMonth;
  }

  /**
   * Submits an event object to the REST server.
   * @param form The form group containing the details of the event to be submitted.
   */
  submitEvent(form: FormGroup): void {
    this.log.logVerbose(this.className, 'submitEvent', 'Formatting dates.');
    //modify the event's start and end dates to a format recognizable by the REST server
    form.controls['startDate'].setValue(this.getStringDate(form.controls['startDate'].value));
    form.controls['endDate'].setValue(this.getStringDate(form.controls['endDate'].value));
    this.log.logVerbose(this.className, 'submitEvent', 'Creating a new event object.');
    //create a new event object
    var event = new Event();
    this.log.logVerbose(this.className, 'submitEvent', "Translating the form's values into the event object's properties.");
    //copy the value of the form's fields into the new event object
    event = form.value;
    this.log.logVerbose(this.className, 'submitEvent', "Logging the event object's properties.");
    this.log.logVerbose(this.className, 'submitEvent', event);
    this.log.logVerbose(this.className, 'submitEvent', 'Connecting to the REST server.');
    this.http.post(RestUrls.REST_EVENT_POST_URL, { params: event }).subscribe(
      data => {
        if (data) {
          this.log.logVerbose(this.className, 'submitEvent', 'Server replied with a confirmation object.');
          this.eventInsertSuccess.next(true);
        } else {
          this.log.logError(this.className, 'submitEvent', 'Server replied with blank data.');
        }
      }, error => {
        this.log.logError(this.className, 'submitEvent', 'Server replied with errors.');
        this.log.logError(this.className, 'submitEvent', error);
      }, () => {

      }
    );
  }

  /**
   * Converts the date from the Bootstrap datepicker
   * into a string.
   * @param datepicker The date to be converted, preferrably a NgbDate object
   * @returns Date converted to a string and formatted as yyyy-MM-dd
   */
  private getStringDate(datepicker: any): string {
    var pipe: DatePipe = new DatePipe('en-US');
    var wDate: Date = new Date(datepicker.year, datepicker.month-1, datepicker.day);
    return pipe.transform(wDate, 'yyyy-MM-dd');
  }
}
