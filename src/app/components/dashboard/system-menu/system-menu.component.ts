import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { ErrorCodes } from 'src/app/constants/properties';
import { System } from 'src/app/models/system';
import { CoreService } from 'src/app/services/core/core.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { LoggerService } from 'src/app/services/logger/logger.service';

@Component({
  selector: 'app-system-menu',
  templateUrl: './system-menu.component.html',
  styleUrls: ['./system-menu.component.css']
})
export class SystemMenuComponent implements OnInit {
  private className: string = 'SystemMenuComponent';
  FATALERROR: boolean;
  systemForm: FormGroup;
  systemArr: System[];
  updateComplete: boolean;

  constructor(private core: CoreService, private builder: FormBuilder,
    private dashboard: DashboardService, private log: LoggerService) { }

  ngOnInit(): void {
    if (this.core.getStartUpStatus() == ErrorCodes.FATAL_ERROR) {
      this.FATALERROR = true;
    } else {
      this.initializeComponent();
    }
  }

  private initializeComponent(): void {
    this.log.logVerbose(this.className, 'initializeComponent', 'Initializing ' + this.className + '.');
    this.systemForm = this.createForm();
    this.systemArr = [];
    this.core.fetchSystems();
    this.core.subscribeSystemsComplete().subscribe(status => {
      if (status) {
        this.systemArr = this.core.getSystems();
        for (let item in this.systemArr) {
          this.addSystem(this.systemArr[item]);
        }
      }
    });
    this.dashboard.subscribeSystemsUpdate().subscribe(status => {
      this.updateComplete = status;
    });
    this.systemForm.valueChanges.subscribe(status => {
      if (status)
      this.updateComplete = false;
    });
  }

  private createForm(): FormGroup {
    this.log.logVerbose(this.className, 'createForm', 'Creating form.');
    return this.builder.group({
      systems: this.builder.array([])
    });
  }

  get systems(): FormArray {
    return this.systemForm.get('systems') as FormArray;
  }

  addSystem(system?: System) {
    if (system !== undefined && Object.keys(system).length > 0) {
      this.systems.push(this.newSystem(system));
    } else {
      this.systems.push(this.newSystem());
    }

  }

  newSystem(system?: System): FormGroup {
    let systemGroup: FormGroup;
    if (system !== undefined && Object.keys(system).length > 0) {
      systemGroup = this.builder.group({
        id: [system.id],
        globalPrefix: [system.globalPrefix, Validators.required],
        machine: [system.machine, Validators.required],
        zone1Prefix: [system.zone1Prefix, Validators.required],
        zone1Name: [system.zone1Name, Validators.required],
        zone2Prefix: [system.zone2Prefix, Validators.required],
        zone2Name: [system.zone2Name, Validators.required],
        loginNames: [system.loginNames, Validators.required],
        systemAdmin: [system.systemAdmin, Validators.required],
        systemUrl: [system.systemUrl, Validators.required],
      });
    } else {
      let newSystem: System = new System();
      systemGroup = this.builder.group({
        globalPrefix: [newSystem.globalPrefix, Validators.required],
        machine: [newSystem.machine, Validators.required],
        zone1Prefix: [newSystem.zone1Prefix, Validators.required],
        zone1Name: [newSystem.zone1Name, Validators.required],
        zone2Prefix: [newSystem.zone2Prefix, Validators.required],
        zone2Name: [newSystem.zone2Name, Validators.required],
        loginNames: [newSystem.loginNames, Validators.required],
        systemAdmin: [newSystem.systemAdmin, Validators.required],
        systemUrl: [newSystem.systemUrl, Validators.required],
      });
    }
    return systemGroup;
  }

  onSubmit(): void {
    this.log.logVerbose(this.className, 'onSubmit', 'Preparing form for submission.');
    for (let index in this.systems.controls) {
      this.systemArr[index] = this.systems.controls[index].value;
    }
    this.dashboard.updateSystems(this.systemArr);
  }

  addNewSystemFields(): void {
    this.addSystem();
    this.updateComplete = false;
  }
}
