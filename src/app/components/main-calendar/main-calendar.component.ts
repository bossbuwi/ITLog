import { Component, OnInit } from '@angular/core';
import {NgbDateStruct, NgbCalendar, NgbDate} from '@ng-bootstrap/ng-bootstrap';

import { Event } from "../../model/event";

import { LoggerService } from "../../services/logger/logger.service";
import { EventsService } from "../../services/events/events.service";

@Component({
  selector: 'app-main-calendar',
  templateUrl: './main-calendar.component.html',
  styleUrls: ['./main-calendar.component.css']
})
export class MainCalendarComponent implements OnInit {
  private className: string = MainCalendarComponent.name;
  events: Event[];
  eventsEmpty: boolean;
  eventDetail: Event;
  calendar: NgbDateStruct;
  date: {year: number, month: number};

  constructor(private log: LoggerService, private eventServ: EventsService, private cal: NgbCalendar) { }

  ngOnInit(): void {
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
    this.eventServ.returnedEmptyEvents().subscribe(status => {
      this.eventsEmpty = status;
    });
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

}
