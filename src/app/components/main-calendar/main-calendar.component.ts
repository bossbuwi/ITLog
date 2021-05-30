import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgbDateStruct, NgbCalendar, NgbDate, NgbModal} from '@ng-bootstrap/ng-bootstrap';

import { Event } from "src/app/models/event";
import { ConfigNames, ErrorCodes } from 'src/app/constants/properties';

import { LoggerService } from "src/app/services/logger/logger.service";
import { EventsService } from "src/app/services/events/events.service";
import { LoginService } from "src/app/services/login/login.service";
import { NavService } from "src/app/services/nav/nav.service";
import { CoreService } from "src/app/services/core/core.service";

@Component({
  selector: 'app-main-calendar',
  templateUrl: './main-calendar.component.html',
  styleUrls: ['./main-calendar.component.css']
})
export class MainCalendarComponent implements OnInit {
  private className: string = 'MainCalendarComponent';
  FATALERROR: boolean;
  isOnline: boolean; //flag to indicate if a user is logged in
  isAdmin: boolean; //flag to indicate if the user logged in is an admin
  hasEvents: boolean; //flag to indicate that the selected day has events
  events: Event[]; //object to hold the events for the day
  eventDetail: Event; //object to hold the selected event from the events table
  calendar: NgbDateStruct; //the calendar model used by the html template
  history: Event[];
  hasHistory: boolean;
  calendarView: boolean;
  calendarHistory: boolean;
  openEventHistory: boolean;

  constructor(private log: LoggerService, private router: Router,
    private eventServ: EventsService, private login:LoginService,
    private cal: NgbCalendar, private nav: NavService,
    private core: CoreService, private modalPopUp: NgbModal) {

  }

  ngOnInit(): void {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {
      this.FATALERROR = true;
    } else {
      this.initializeComponent();
    }
  }

  private initializeComponent() {
    this.log.logVerbose(this.className, 'initializeComponent', 'Initializing ' + this.className + '.');
    //sets the active tab to the calendar tab upon loading
    //for those users who bookmarked the url
    this.nav.setActiveTab(2);
    //initiate the value of the events array
    this.events = [];
    //initiate the event detail object
    this.eventDetail = new Event();
    this.history = [];
    this.calendarView = true;
    this.calendarHistory = false;
    //gets the current online and admin status of the user
    this.isOnline = this.login.getLoginStatus();
    this.isAdmin = this.login.getAdminStatus();
    //subscribe to the login service to be notified of any change in the
    //user's online status or rank change
    this.login.subscribeUserStatus().subscribe(status => {
      this.isOnline = status;
      this.isAdmin = this.login.getAdminStatus();
    });
    //create a date object that holds the current date
    let today: Date = new Date();
    //select the current date on the calendar
    this.selectToday();
    //call events service to fetch the events for the current day
    //from the REST server
    this.eventServ.getEventsForTheDay(today);
    //subcribe on the broadcast of events service to be notified if
    //the events for the day has been fetched from the REST server
    this.eventServ.subscribeEventsForTheDay().subscribe(events => {
      //if a broadcast was received, save the events to the local events array
      //it will do this even if the received broadcast has an empty array
      this.events = events;
      //check if the received array is empty
      if (events.length > 0) {
        //if not empty, set the first item of the array to the event detail object
        //also set the hasEvents flag to true to display the events table on the html
        this.eventDetail = events[0];
        this.hasEvents = true;
      } else {
        //if the received array is empty, set the hasEvents flag to false to
        //hide the events table on the html
        this.hasEvents = false;
      }
    });
    this.eventServ.subscribeEventHistoryFetched().subscribe(history => {
      if (history.length > 0) {
        this.history = history;
        this.hasHistory = true;
      } else {
        this.hasHistory = false;
      }
    });
    if (this.core.getConfigValue(ConfigNames.CONF_OPEN_EVENT_HIST) == 'Y') {
      this.openEventHistory = true;
    } else {
      this.openEventHistory = false;
    }
  }

  /**
   * Called directly by the calendar html template's datepicker element
   * when a date is clicked.
   * @param date Sent by the datepicker element to indicate which date
   * has been clicked. It is of type NgbDate (Angular Bootstrap Date).
   */
  onDateSelection(date: NgbDate): void {
    //create a new object of type Date and supply the object's parameters
    //from the received NgbDate object
    let nDate: Date = new Date(date.year, date.month-1, date.day);
    //call events service to get the method for the provided date
    // this.events = this.eventServ.getEventsForDay(nDate);
    this.eventServ.getEventsForTheDay(nDate);
  }

  /**
   * Selects the current date on the calendar. Note that the method used
   * to get the current day is a built in method from Angular Bootstrap's
   * Datepicker. This could create a conflict if another method of getting
   * the current day is used on another part of the component.
   */
  selectToday(): void {
    this.calendar = this.cal.getToday();
  }

  /**
   *  Gets the details of a clicked event from the table
   * @param id The _id property of the clicked event.
   */
  rowClicked(_id: string): void {
    //finds the event with the corresponding _id property
    //and saves it into the eventDetail object which would
    //then be referenced by the html template
    this.eventDetail = this.events.find(x => x._id == parseInt(_id));
  }

  createEvent(): void {
    //send a request to the navigation bar to change the active tab
    this.nav.setActiveTab(3);
    //call Angular's router to redirect the user to the reservation page
    this.router.navigate(['/event']);
  }

  /**
   * Initiates the editing of a selected event from the
   * events table on the calendar tab.
   * @param id The _id property of the event selected for editing.
   */
  editEvent(id: string): void {
    //calls the events service to fetch the event with the
    //corresponding id from the REST server
    this.eventServ.fetchEvent(id);
    //send a request to the navigation bar to change the active tab
    this.nav.setActiveTab(3);
    //call Angular's router to redirect the user to the reservation page
    this.router.navigate(['/event']);
  }

  /**
   * Initiates the deletion of a selected event from the
   * events table on the calendar tab. This is currently unused
   * because the app does not support deletion of events.
   * @param id The _id property of the event to be deleted.
   */
  deleteEvent(id: string): void { }

  eventHistory(id: string): void {
    this.calendarView = false;
    this.calendarHistory = true;
    this.history = [];
    this.eventServ.getEventHistory(id);
  }

  closeHistory(): void {
    this.calendarView = true;
    this.calendarHistory = false;
  }
}
