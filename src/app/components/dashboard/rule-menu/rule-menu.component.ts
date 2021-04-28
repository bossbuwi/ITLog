import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Rule } from "../../../models/rule";
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-rule-menu',
  templateUrl: './rule-menu.component.html',
  styleUrls: ['./rule-menu.component.css']
})
export class RuleMenuComponent implements OnInit {
  ruleForm: FormGroup;
  rulesArr: Rule[];
  updateComplete: boolean;

  constructor(private builder: FormBuilder, private dashboard: DashboardService,
    private core: CoreService) { }

  ngOnInit(): void {
    this.createForm();
    this.rulesArr = [];
    this.core.fetchRules();
    this.core.subscribeRulesComplete().subscribe(status => {
      if (status) {
        this.rulesArr = this.core.getRules();
        for (let item in this.rulesArr) {
          this.addRule(this.rulesArr[item]);
        }
      }
    });
    this.dashboard.subscribeRulesUpdate().subscribe(status => {
      this.updateComplete = status;
    });
    this.ruleForm.valueChanges.subscribe(status => {
      if (status)
      this.updateComplete = false;
    });
  }

  createForm(): void {
    this.ruleForm = this.builder.group({
      rules: this.builder.array([])
    });
  }

  get rules(): FormArray {
    return this.ruleForm.get('rules') as FormArray;
  }

  addRule(rule?: Rule) {
    if (rule !== undefined && Object.keys(rule).length > 0) {
      this.rules.push(this.newRule(rule));
    } else {
      this.rules.push(this.newRule());
    }
  }

  newRule(rule?: Rule): FormGroup {
    var ruleGroup: FormGroup;
    if (rule !== undefined && Object.keys(rule).length > 0) {
      ruleGroup = this.builder.group({
        id: [rule.id],
        statement: [rule.statement, Validators.required]
      });
    } else {
      var newRule: Rule = new Rule();
      ruleGroup = this.builder.group({
        id: [newRule.id],
        statement: [newRule.statement, Validators.required]
      });
    }

    return ruleGroup;
  }

  onSubmit(): void {
    for (let index in this.rules.controls) {
      this.rulesArr[index] = this.rules.controls[index].value;
    }
    this.dashboard.updateRules(this.rulesArr);
  }

  addNewRuleField(): void {
    this.addRule();
  }
}
