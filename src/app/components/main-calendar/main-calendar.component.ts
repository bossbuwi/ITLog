import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgbDateStruct, NgbCalendar, NgbDate} from '@ng-bootstrap/ng-bootstrap';

import { Event } from "../../model/event";

import { LoggerService } from "../../services/logger/logger.service";
import { EventsService } from "../../services/events/events.service";
import { LoginService } from 'src/app/services/login/login.service';

@Component({
  selector: 'app-main-calendar',
  templateUrl: './main-calendar.component.html',
  styleUrls: ['./main-calendar.component.css']
})
export class MainCalendarComponent implements OnInit {
  private className: string = MainCalendarComponent.name;
  isOnline: boolean;
  isAdmin: boolean;
  events: Event[];
  eventDetail: Event;
  calendar: NgbDateStruct;
  date: {year: number, month: number};

  constructor(private log: LoggerService, private router: Router, private eventServ: EventsService, private login:LoginService, private cal: NgbCalendar) { }

  ngOnInit(): void {
    this.isOnline = this.login.getLoginStatus();
    this.isAdmin = this.login.getAdminStatus();
    this.log.logVerbose(this.className, 'ngOnInit', 'Initiating ' + this.className + '.');
    this.eventDetail = new Event();
    var today = new Date();
    this.selectToday();
    this.events = this.eventServ.getEventsForDay(today);
    this.eventServ.getEventsCompleted().subscribe(status => {
      if (status == true) {
        this.eventDetail = this.events[0];
      }
    });
    this.login.subscribeUserStatus().subscribe(status => {
      this.isOnline = status;
    });
    this.login.subscribeUserRank().subscribe(rank => {
      this.isAdmin = rank;
    })
  }

  onDateSelection(date: NgbDate): void {
    var nDate: Date = new Date(date.year, date.month-1, date.day);
    this.events = [];
    this.events = this.eventServ.getEventsForDay(nDate);
  }

  selectToday(): void {
    this.calendar = this.cal.getToday();
  }

  setDetail(): void {
    //empty soul
  }

  rowClicked(id: string): void {
    this.eventDetail = this.events.find(x => x._id == parseInt(id));
  }

  editEvent(id: string): void {
    console.log('Edit: ' + id);
    this.eventServ.fetchEvent(id);
    this.router.navigate(['/reservation']);
  }

  deleteEvent(id: string): void {
    console.log('Delete: ' + id);
    this.router.navigate(['/reservation']);
  }
}
