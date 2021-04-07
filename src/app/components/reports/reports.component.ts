import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EventsService } from "../../services/events/events.service";
import { Event } from "../../model/event";

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reportForm: FormGroup;
  eventResults: Event[];

  constructor(private builder: FormBuilder, private eventServ: EventsService) { }

  ngOnInit(): void {
    this.eventResults = [];
    this.reportForm = this.createEventForm();
    this.eventServ.getEventResults().subscribe(data => {
      this.eventResults = data;
    })
  }

  private createEventForm(): FormGroup {
    return this.builder.group({
      zone: [''],
      type: [''],
      startDate: [''],
      endDate: [''],
      cursysver: [''],
      requestReport: ['']
    });
  }

  onSubmit($event: any): void {
    console.log($event.submitter.id);
    if ($event.submitter.id == 'search') {
      this.reportForm.controls['requestReport'].setValue(false);
      this.eventServ.requestReport(this.reportForm);
    } else if ($event.submitter.id == 'generate') {
      this.reportForm.controls['requestReport'].setValue(true);
      this.eventServ.requestReport(this.reportForm);
    }
  }

  onCheckboxChange(): void {
    if (this.reportForm.controls['cursysver'].value) {
      this.reportForm.controls['startDate'].disable();
      this.reportForm.controls['endDate'].disable();
    } else {
      this.reportForm.controls['startDate'].enable();
      this.reportForm.controls['endDate'].enable();
    }
  }
}
