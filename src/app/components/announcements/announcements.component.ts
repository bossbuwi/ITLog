import { Component, OnInit } from '@angular/core';

import { Rule } from "../../model/rule";
import { RulesService } from "../../services/rules.service";

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnInit {
  rules: Rule[];

  images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);

  constructor(private ruleService: RulesService) { }

  ngOnInit(): void {
    this.displayRules();
  }

  displayRules(): void {
    this.rules = this.ruleService.getRules();
  }

}
