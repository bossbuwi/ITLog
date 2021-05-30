import { Component, OnInit } from '@angular/core';

import { Rule } from "src/app/models/rule";
import { System } from "src/app/models/system";
import { CoreService } from 'src/app/services/core/core.service';
import { ErrorCodes } from 'src/app/constants/properties';
import { NavService } from 'src/app/services/nav/nav.service';
import { EventsService } from 'src/app/services/events/events.service';
import { LoggerService } from 'src/app/services/logger/logger.service';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnInit {
  private className: string = 'AnnouncementsComponent';
  FATALERROR: boolean;
  rules: Rule[];
  systems: System[];
  selectedSystem: System;
  selectedSystemVersion: string;

  constructor(private core: CoreService, private nav: NavService,
    private event: EventsService, private log: LoggerService) {

  }

  ngOnInit(): void {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {
      this.FATALERROR = true;
    } else {
      this.initializeComponent();
    }
  }

  /**
   *
   */
  private initializeComponent(): void {
    this.log.logVerbose(this.className, 'initializeComponent', 'Initializing ' + this.className + '.');
    this.nav.setActiveTab(1);
    this.systems = [];
    this.rules = [];
    this.systems = this.core.getSystems();
    this.rules = this.core.getRules();
    this.selectedSystem = this.systems[0];
    this.selectedSystemVersion = 'false';
    this.event.getSystemVersion(this.selectedSystem.globalPrefix);
    this.event.subscribesystemVersionFetched().subscribe(data => {
      this.selectedSystemVersion = data;
    });
    this.log.logVerbose(this.className, 'initializeComponent', 'Initialization completed.');
  }

  /**
   *
   * @param $event
   */
  onChange($event: any): void {
    this.log.logVerbose(this.className, 'onChange', 'System: ' + $event + ' selected.');
    this.selectedSystem = this.systems.find(x => x.globalPrefix == $event);
    this.event.getSystemVersion($event);
  }
}
