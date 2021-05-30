import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import { CoreService } from "src/app/services/core/core.service";
import { LoggerService } from "src/app/services/logger/logger.service";

import { Event } from "src/app/models/event";
import { Query } from "src/app/models/query";
import { RestUrls } from "src/app/constants/usersettings";

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
  private systemVersionFetched: Subject<string>;
  private eventHistoryFetched: Subject<Event[]>;

  constructor(private http: HttpClient, private log: LoggerService,
    private core: CoreService) {
    this.initializeService();
  }

  /**
   * Initializes the events service. This creates the subjects that the service's
   * subscribers are listening to.
   */
  private initializeService(): void {
    this.log.logVerbose(this.className, 'initializeService', 'Initializing ' + this.className +'.');
    this.eventInsertSuccess = new Subject<Event>();
    this.eventFetchedForEdit = new Subject<Event>();
    this.eventEditSuccess = new Subject<Event>();
    this.eventResults = new Subject<Event[]>();
    this.eventsForTheDay = new Subject<Event[]>();
    this.systemVersionFetched = new Subject<string>();
    this.eventHistoryFetched = new Subject<Event[]>();
  }

  /**
   *
   * @returns
   */
  subscribeInsertEventCompletion(): Observable<Event> {
    return this.eventInsertSuccess.asObservable();
  }

  /**
   *
   * @returns
   */
  subscribeEditEventCompletion(): Observable<Event> {
    return this.eventEditSuccess.asObservable();
  }

  /**
   *
   * @returns
   */
  subscribeGetEventEditCompletion(): Observable<Event> {
    return this.eventFetchedForEdit.asObservable();
  }

  /**
   *
   * @returns
   */
  subscribeGetEventResults(): Observable<Event[]> {
    return this.eventResults.asObservable();
  }

  /**
   *
   * @returns
   */
  subscribeEventsForTheDay(): Observable<Event[]> {
    return this.eventsForTheDay.asObservable();
  }

  subscribesystemVersionFetched(): Observable<string> {
    return this.systemVersionFetched.asObservable();
  }

  subscribeEventHistoryFetched(): Observable<Event[]> {
    return this.eventHistoryFetched.asObservable();
  }

  /**
   *
   * @param date
   */
  getEventsForTheDay(date: Date): void {
    let pipe: DatePipe = new DatePipe('en-US');
    let fDate: string = pipe.transform(date, 'yyyy-MM-dd');
    const params: HttpParams = new HttpParams()
      .set('selectedDay', fDate);
      this.http.get<Event[]>(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GET_EVENT), { params: params }).subscribe(
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
    let event = new Event();
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
    this.http.post<Event>(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_POST_EVENT), {event}).subscribe(
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
    this.http.get<Event>(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GET_EVENT), {params: params}).subscribe(
      data => {
        let event = new Event();
        event = data;
        this.eventFetchedForEdit.next(event);
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
    let event = new Event();
    event = form.value;
    event._id = id;
    event.type = this.translateFormValues(form.controls['type'].value);
    event.startDate = this.getStringDate(form.controls['startDate'].value);
    event.endDate = this.getStringDate(form.controls['endDate'].value);
    this.http.put<Event>(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_POST_EVENT), {event}).subscribe(
      data => {
        let event: Event = new Event();
        event = data;
        this.eventEditSuccess.next(event);
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
    let query: Query = new Query();
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
    if (form.controls['curSysVer'].value == '') {
      query.curSysVer = false;
    }
    if (form.controls['requestReport'].value == '') {
      query.requestReport = false;
    }
    let params = new HttpParams();
    Object.keys(query).forEach(key => {
      params = params.append(key, query[key]);
    });
    if (query.requestReport) {
      this.http.get<Blob>(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GENERATE_REPORT), {observe: 'response', params: params, responseType: 'blob' as 'json'}).subscribe(
        (data: HttpResponse<Blob>) => {
          let filename = 'file.xlsx';
          let headers = data.headers.get('Content-Disposition');
          const regex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = regex.exec(headers);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
          let file: Blob = new Blob([data.body],{ type: data.headers.get('Content-Type') });
          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(file);
          downloadLink.setAttribute('download', filename);
          document.body.appendChild(downloadLink);
          downloadLink.click();
        }, error => {
          console.log(error);
        }, () => {

        }
      );
    } else {
      this.http.get<Event[]>(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GENERATE_REPORT), {params: params}).subscribe(
        data => {
          this.eventResults.next(data);
        }, error => {
          console.log(error);
        }, () => {

        }
      );
    }
  }

  getSystemVersion(globalPrefix: string) {
    this.systemVersionFetched.next('false');
    let params = new HttpParams()
      .set('globalPrefix', globalPrefix);
    this.http.get(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GET_SYSTEM_VERSION), { observe: 'response', params }).subscribe(
      (data: HttpResponse<Event>) => {
        if (data) {
          this.systemVersionFetched.next(data.body.apiUsed);
        } else {
          this.systemVersionFetched.next('Error!');
        }
      }, error => {
        if (error.status == 404) {
          this.log.logError(this.className, 'getSystemVersion', 'System version not found.');
          this.systemVersionFetched.next('Not provided.');
        } else {
          this.log.logError(this.className, 'getSystemVersion', 'Server replied with errors.');
          this.log.logError(this.className, 'getSystemVersion', error);
          this.systemVersionFetched.next('Error!');
        }
      }, () => {

      }
    );
  }

  getEventHistory(id: string) {
    const url: string = this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GET_EVENT_HISTORY) + '/' + id;
    this.http.get<Event[]>(url).subscribe(data => {
      if (data) {
        this.eventHistoryFetched.next(data);
      }
    }, error => {

    }, () => {

    });
  }

  /**
   *
   * @param datepicker
   * @returns
   */
  private getStringDate(datepicker: any): string {
    let pipe: DatePipe = new DatePipe('en-US');
    let wDate: Date = new Date(datepicker.year, datepicker.month-1, datepicker.day);
    return pipe.transform(wDate, 'yyyy-MM-dd');
  }

  /**
   *
   * @param value
   * @returns
   */
  private translateFormValues(value: string): string {
    let eventType = this.core.getEventTypes().find(x => x.name == value);
    if (eventType) {
      return eventType.eventCode;
    }
  }
}
