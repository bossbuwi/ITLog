import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Config } from 'protractor';
import { CoreService } from 'src/app/services/core/core.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { LoginService } from 'src/app/services/login/login.service';

@Component({
  selector: 'app-config-menu',
  templateUrl: './config-menu.component.html',
  styleUrls: ['./config-menu.component.css']
})
export class ConfigMenuComponent implements OnInit {
  configForm: FormGroup;
  configArr: Config[];
  updateComplete: boolean;

  constructor(private core: CoreService, private builder: FormBuilder,
    private dashboard: DashboardService, private login: LoginService) { }

  ngOnInit(): void {
    this.configForm = this.createForm();
    this.configArr = [];
    this.core.fetchConfigs();
    this.core.subscribeConfigsComplete().subscribe(status => {
      if (status) {
        this.configArr = this.core.getConfigs();
        for (let item in this.configArr) {
          this.addConfig(this.configArr[item]);
        }
      }
    });
    this.dashboard.subscribeConfigsUpdate().subscribe(status => {
      this.updateComplete = status;
    });
    this.configForm.valueChanges.subscribe(status => {
      if (status)
      this.updateComplete = false;
    });
  }

  private createForm(): FormGroup {
    return this.builder.group({
      configs: this.builder.array([])
    });
  }

  get configs(): FormArray {
    return this.configForm.get('configs') as FormArray;
  }

  addConfig(config: Config) {
    this.configs.push(this.newConfig(config));
  }

  newConfig(config: Config): FormGroup {
    var configFormGroup = this.builder.group({
      id: [config.id],
      name: [config.name],
      value: [config.value, Validators.required],
      length: [config.length],
      description: [config.description],
      validValues: [config.validValues],
      defaultValue: [config.defaultValue],
      lastModifiedBy: [config.lastModifiedBy],
    });
    configFormGroup.get('length').disable();
    configFormGroup.get('description').disable();
    configFormGroup.get('validValues').disable();
    configFormGroup.get('defaultValue').disable();
    return configFormGroup;
  }

  onSubmit(): void {
    for (let index in this.configs.controls) {
      if (this.configs.controls[index].dirty) {
        this.configs.controls[index].get('lastModifiedBy').setValue(this.login.getUsername());
      }
      this.configArr[index] = this.configs.controls[index].value;
    }
    this.dashboard.updateConfigs(this.configArr);
  }
}
