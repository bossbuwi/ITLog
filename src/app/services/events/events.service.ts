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
  private eventInsertSuccess: Subject<Event>; //subject to broadcast if event insert is finished
  private eventFetchedForEdit: Subject<Event>; //subject to broadcast if event insert is finished
  private eventEditSuccess: Subject<Event>; //subject to broadcast if event insert is finished

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
    this.eventInsertSuccess = new Subject<Event>();
    this.eventFetchedForEdit = new Subject<Event>();
    this.eventEditSuccess = new Subject<Event>();
    this.log.logVerbose(this.className, 'initializeService', 'Initiating event arrays.');
    this.eventsForMonth = [];
    this.eventsForDay= [];
  }

  /**
   *
   * @returns
   */
  insertEventCompleted(): Observable<Event> {
    this.log.logVerbose(this.className, 'insertEventCompleted', 'Inserting events to REST server complete.');
    this.log.logVerbose(this.className, 'insertEventCompleted', 'Returning inserted object back to the calling component.');
    return this.eventInsertSuccess.asObservable();
  }

  editEventCompleted(): Observable<Event> {
    this.log.logVerbose(this.className, 'insertEventCompleted', 'Inserting events to REST server complete.');
    this.log.logVerbose(this.className, 'insertEventCompleted', 'Returning inserted object back to the calling component.');
    return this.eventEditSuccess.asObservable();
  }

  /**
   *
   * @returns
   */
  getEventsCompleted(): Observable<boolean> {
    this.log.logVerbose(this.className, 'getEventsCompleted', 'Communication with events REST server complete.');
    return this.eventChange.asObservable();
  }

  getEventForEditCompleted(): Observable<Event> {
    return this.eventFetchedForEdit.asObservable();
  }

  getEventsForDay(date: Date): Event[] {
    this.eventChange.next(false);
    this.eventsForDay = [];
    var pipe: DatePipe = new DatePipe('en-US');
    var fDate: string = pipe.transform(date, 'yyyy-MM-dd');
    const params: HttpParams = new HttpParams()
      .set('selectedDay', fDate)
    this.http.get(RestUrls.REST_GET_EVENT, { params: params }).subscribe(
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
    this.http.get(RestUrls.REST_GET_EVENT, { params: params }).subscribe(
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
    //create a new event object
    //this would be sent to the REST server as a parameter
    this.log.logVerbose(this.className, 'submitEvent', 'Creating a new event object.');
    var event = new Event();
    //copy the value of the form's fields into the new event object
    this.log.logVerbose(this.className, 'submitEvent', "Translating the form's values into the event object's properties.");
    event = form.value;
    this.log.logVerbose(this.className, 'submitEvent', "Logging the event object's properties.");
    this.log.logVerbose(this.className, 'submitEvent', event);
    this.log.logVerbose(this.className, 'submitEvent', 'Connecting to the REST server.');
    //send the event object to the REST server
    console.log('submit event');
    console.log(event);
    this.http.post<Event>(RestUrls.REST_POST_EVENT, { params: event }).subscribe(
      data => {
        //based on the REST server's specs, the server would reply with the object inserted
        //check if the reply contains an object
        if (data) {
          //if an object is present, send it back to the reservation component
          this.log.logVerbose(this.className, 'submitEvent', 'Server replied with a confirmation object.');
          console.log('received from server')
          console.log(data)
          this.eventInsertSuccess.next(data);
        } else {
          //this is weird scenario because the server must reply either with an object or an error
          //if the server replied with a blank data, something is wrong
          //log it for now
          this.log.logError(this.className, 'submitEvent', 'Server replied with blank data.');
        }
      }, error => {
        this.log.logError(this.className, 'submitEvent', 'Server replied with errors.');
        this.log.logError(this.className, 'submitEvent', error);
      }, () => {

      }
    );
  }

  fetchEvent(id: string): void {
    const params: HttpParams = new HttpParams()
      .set('_id', id);
    this.http.get<Event>(RestUrls.REST_GET_EVENT, {params: params}).subscribe(
      data => {
        var evnt = new Event();
        evnt = data;
        this.eventFetchedForEdit.next(evnt);
      }, error => {
        console.log(error);
      }, () => {

      }
    );
  }

  editEvent(form: FormGroup, id: number): void {
    this.log.logVerbose(this.className, 'editEvent', 'Trying to get event with id: ' + id + ' from REST server.');
    this.log.logVerbose(this.className, 'editEvent', 'Setting parameters for http request.');
    var evnt = new Event();
    evnt = form.value;
    evnt._id = id;
    this.http.put<Event>(RestUrls.REST_POST_EVENT, { params: evnt }).subscribe(
      data => {
        var evnt: Event = new Event();
        evnt = data;
        console.log(evnt);
        this.eventEditSuccess.next(evnt);
      }, error => {
        console.log(error);
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
  // private getStringDate(datepicker: any): string {
  //   var pipe: DatePipe = new DatePipe('en-US');
  //   var wDate: Date = new Date(datepicker.year, datepicker.month-1, datepicker.day);
  //   return pipe.transform(wDate, 'yyyy-MM-dd');
  // }
}
