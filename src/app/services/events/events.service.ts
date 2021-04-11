import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { CoreService } from "../core/core.service";
import { LoggerService } from "../logger/logger.service";

import { Event } from "../../model/event";
import { Query } from "../../model/query";
import { RestUrls, ErrorCodes, EventTypes, EventTypesREST } from "../../model/constants/properties";

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private className: string = 'EventsService';

  private eventInsertSuccess: Subject<Event>; //subject to broadcast if event insert is finished
  private eventFetchedForEdit: Subject<Event>; //subject to broadcast if event insert is finished
  private eventEditSuccess: Subject<Event>; //subject to broadcast if event insert is finished
  private eventResults: Subject<Event[]>; //subject to broadcast the query results from the server
  private eventsForTheDay: Subject<Event[]>; //subject to broadcast the events for the selected day

  constructor(private http: HttpClient, private log: LoggerService, private configService: CoreService) {
    this.initializeService();
  }

  /**
   * Initializes the events service. This creates the subjects that the service's
   * subscribers are listening to.
   */
  private initializeService(): void {
    this.log.logVerbose(this.className, 'initializeService', 'Initiating ' + this.className + '.');
    this.log.logVerbose(this.className, 'initializeService', 'Initiating subjects.');
    this.eventInsertSuccess = new Subject<Event>();
    this.eventFetchedForEdit = new Subject<Event>();
    this.eventEditSuccess = new Subject<Event>();
    this.eventResults = new Subject<Event[]>();
    this.eventsForTheDay = new Subject<Event[]>();
  }

  /**
   *
   * @returns
   */
  subscribeInsertEventCompletion(): Observable<Event> {
    this.log.logVerbose(this.className, 'subscribeInsertEventCompletion', 'A new subscriber is detected.');
    return this.eventInsertSuccess.asObservable();
  }

  /**
   *
   * @returns
   */
  subscribeEditEventCompletion(): Observable<Event> {
    this.log.logVerbose(this.className, 'subscribeEditEventCompletion', 'A new subscriber is detected.');
    return this.eventEditSuccess.asObservable();
  }

  /**
   *
   * @returns
   */
  subscribeGetEventEditCompletion(): Observable<Event> {
    this.log.logVerbose(this.className, 'subscribeGetEventEditCompletion', 'A new subscriber is detected.');
    return this.eventFetchedForEdit.asObservable();
  }

  /**
   *
   * @returns
   */
  subscribeGetEventResults(): Observable<Event[]> {
    this.log.logVerbose(this.className, 'subscribeGetEventResults', 'A new subscriber is detected.');
    return this.eventResults.asObservable();
  }

  /**
   *
   * @returns
   */
  subscribeEventsForTheDay(): Observable<Event[]> {
    this.log.logVerbose(this.className, 'subscribeEventsForTheDay', 'A new subscriber is detected.');
    return this.eventsForTheDay.asObservable();
  }

  /**
   *
   * @param date
   */
  getEventsForTheDay(date: Date): void {
    var pipe: DatePipe = new DatePipe('en-US');
    var fDate: string = pipe.transform(date, 'yyyy-MM-dd');
    const params: HttpParams = new HttpParams()
      .set('selectedDay', fDate)
      this.http.get<Event[]>(RestUrls.REST_GET_EVENT, { params: params }).subscribe(
        data => {
          if (Object.keys(data).length > 0) {
            this.eventsForTheDay.next(data)
          } else {
            this.eventsForTheDay.next([]);
          }
        }, error => {

        }, () => {

        }
      );
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
    event.type = this.translateFormValues(form.controls['type'].value);
    event.startDate = this.getStringDate(form.controls['startDate'].value);
    event.endDate = this.getStringDate(form.controls['endDate'].value);
    this.log.logVerbose(this.className, 'submitEvent', "Logging the event object's properties.");
    this.log.logVerbose(this.className, 'submitEvent', event);
    this.log.logVerbose(this.className, 'submitEvent', 'Connecting to the REST server.');
    //send the event object to the REST server
    this.http.post<Event>(RestUrls.REST_POST_EVENT, { params: event }).subscribe(
      data => {
        //based on the REST server's specs, the server would reply with the object inserted
        //check if the reply contains an object
        if (data) {
          //if an object is present, send it back to the reservation component
          this.log.logVerbose(this.className, 'submitEvent', 'Server replied with a confirmation object.');
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

  /**
   *
   * @param id
   */
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

  /**
   *
   * @param form
   * @param id
   */
  editEvent(form: FormGroup, id: number): void {
    this.log.logVerbose(this.className, 'editEvent', 'Trying to get event with id: ' + id + ' from REST server.');
    this.log.logVerbose(this.className, 'editEvent', 'Setting parameters for http request.');
    var evnt = new Event();
    evnt = form.value;
    evnt._id = id;
    evnt.type = this.translateFormValues(form.controls['type'].value);
    evnt.startDate = this.getStringDate(form.controls['startDate'].value);
    evnt.endDate = this.getStringDate(form.controls['endDate'].value);
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
   *
   * @param form
   */
  requestReport(form: FormGroup): void {
    var query: Query = new Query();
    query = form.value;
    if (form.controls['startDate'].valid) {
      query.startDate = this.getStringDate(form.controls['startDate'].value);
    }
    if (form.controls['endDate'].valid) {
      query.endDate = this.getStringDate(form.controls['endDate'].value);
    }
    if (form.controls['type'].value == 'All'
      || form.controls['type'].value == '') {
      query.type = 'All';
    } else {
      query.type = this.translateFormValues(form.controls['type'].value);
    }
    if (form.controls['system'].value == '') {
      query.system = 'All';
    }
    if (form.controls['zone'].value == '') {
      query.zone = 'All';
    }
    if (form.controls['cursysver'].value == '') {
      query.cursysver = false;
    }
    if (form.controls['requestReport'].value == '') {
      query.requestReport = false;
    }
    console.log(query);
    let params = new HttpParams();
    Object.keys(query).forEach(key => {
      params = params.append(key, query[key]);
    });
    if (query.requestReport) {
      this.http.get(RestUrls.REST_GENERATE_REPORT, {params: params, responseType: 'blob'}).subscribe(
        data => {
          var file: Blob = new Blob([data],{ type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
          const dataFile = window.URL.createObjectURL(file);
          window.open(dataFile);
        }, error => {
          console.log(error);
        }, () => {

        }
      );
    } else {
      this.http.get<Event[]>(RestUrls.REST_GENERATE_REPORT, {params: params}).subscribe(
        data => {
          console.log(data);
          this.eventResults.next(data);
        }, error => {
          console.log(error);
        }, () => {

        }
      );
    }
  }

  /**
   *
   * @param datepicker
   * @returns
   */
  private getStringDate(datepicker: any): string {
    var pipe: DatePipe = new DatePipe('en-US');
    var wDate: Date = new Date(datepicker.year, datepicker.month-1, datepicker.day);
    return pipe.transform(wDate, 'yyyy-MM-dd');
  }

  /**
   *
   * @param value
   * @returns
   */
  private translateFormValues(value: string): string {
    switch (value) {
      case EventTypes.IC:
        return EventTypesREST.IC
      case EventTypes.COB:
        return EventTypesREST.COB;
      case EventTypes.IC_COB:
        return EventTypesREST.IC_COB;
      case EventTypes.MAINTENANCE:
        return EventTypesREST.MAINTENANCE;
      case EventTypes.SYS_UPGRADE:
        return EventTypesREST.SYS_UPGRADE;
      default:
        return EventTypesREST.IC;
    }
  }
}
