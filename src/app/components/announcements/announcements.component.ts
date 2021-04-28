import { Component, OnInit } from '@angular/core';

import { Rule } from "../../models/rule";
import { System } from "../../models/system";
import { CoreService } from 'src/app/services/core/core.service';
import { ErrorCodes } from 'src/app/models/constants/properties';
import { NavService } from 'src/app/services/nav/nav.service';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnInit {
  rules: Rule[];
  systems: System[];
  selectedSystem: System;
  FATALERROR: boolean;

  constructor(private core: CoreService, private nav: NavService) { }

  ngOnInit(): void {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {
      this.FATALERROR = true;
    }
    this.nav.setActiveTab(1);
    this.systems = [];
    this.rules = [];
    this.systems = this.core.getSystems();
    this.rules = this.core.getRules();
    this.selectedSystem = this.systems[0];
  }

  onChange($event: any): void {
    this.selectedSystem = this.systems.find(x => x.globalPrefix == $event);
  }

}
