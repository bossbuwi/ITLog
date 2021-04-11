import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';

import { ConfigNames, RestUrls, ErrorCodes } from "../../model/constants/properties";
import { Configuration } from "../../model/configuration";
import { System } from "../../model/system";
import { Rule } from "../../model/rule";

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  private className: string = 'CoreService';
  private systems: System[];
  private rules: Rule[];
  private configs: Configuration[];
  private startUpComplete: Subject<number>;
  private startupStatus: number;

  constructor(private http: HttpClient) {
    this.initializeService();
  }

  /**
   * Initializes the core service. This method prevents arrays
   * and subjects from being undefined.
   */
  initializeService(): void {
    console.debug('Initializing CoreService.');
    console.debug('Initializing arrays and subjects.');
    this.systems = [];
    this.rules = [];
    this.configs = [];
    this.startUpComplete = new Subject<number>();
  }

  /**
   * Starts the app's bootup process. This method is the
   * first of a chain of methods that executes during startup.
   * It returns a promise just to satify Angular's requirements
   * but the actual results of the startup are broadcasted using
   * the startUpComplete subject.
   * @returns A promise indicating that the startup
   * process has finished its execution. Note that the
   * promise would still be returned even if the app's
   * startup encountered an error and did not finish correctly.
   */
  startup():Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      console.debug('Preparing to fetch data from the server.');
      this.fetchConfigs();
      this.startUpComplete.subscribe(status => {
        this.startupStatus = status;
        console.debug('Application startup complete.');
        console.debug('Loading app components, creating models and waking services.');
        resolve(true);
      })

    });
  }

  /**
   * Fetches the configuration from the backend server and stores
   * them locally. It is called by the startup method and calls
   * the fetchSystems method after a successful run.
   */
  fetchConfigs(): void {
    console.debug('Attempting to fetch saved configuration.');
    this.http.get<Configuration[]>(RestUrls.REST_GET_CONFIG).subscribe(configs => {
      if (configs.length > 0) {
        console.debug('Configuration received.');
        console.debug('Saving configuration into local storage.');
        this.configs = configs;
      }
    }, error => {
      console.log(error);
      this.startUpComplete.next(ErrorCodes.FATAL_ERROR);
    }, () => {
      this.fetchSystems();
    });
  }

  /**
   * Fetches the details of the systems from the backend server
   * and stores them locally. It is called by the fetchConfigs method
   * and calls the fetchRules method after a successful run.
   */
  fetchSystems(): void {
    console.debug('Attempting to fetch saved systems.');
    this.http.get<System[]>(RestUrls.REST_GET_SYSTEMS).subscribe(systems => {
      if (systems.length > 0) {
        console.debug('Systems received.');
        console.debug('Saving systems into local storage.');
        this.systems = systems;
      }
    }, error => {
      console.log(error);
      this.startUpComplete.next(ErrorCodes.FATAL_ERROR);
    }, () => {
      this.fetchRules();
    });
  }

  /**
   * Fetches the details of the systems from the backend server
   * and stores them locally. It is called by the fetchSystems method.
   * It is currently the last method in the chain of methods executed
   * during the app's boot process. It broadcasts the result of the
   * boot process back to the startup method to signal the completion
   * of the startup process.
   */
  fetchRules(): void {
    console.debug('Attempting to fetch saved rules.');
    this.http.get<Rule[]>(RestUrls.REST_GET_RULES).subscribe(rules => {
      if (rules.length > 0) {
        console.debug('Rules received.');
        console.debug('Saving rules into local storage.');
        this.rules = rules;
      }
    }, error => {
      console.log(error);
      this.startUpComplete.next(ErrorCodes.FATAL_ERROR);
    }, () => {
      this.startUpComplete.next(ErrorCodes.NO_ERRORS);
    });
  }

  /**
   * Gets the systems fetched from the backend server
   * during the boot process. The data returned by this method
   * is not automatically updated after it is fetched.
   * @returns An array of system objects stored in memory.
   */
  getSystems(): System[] {
    return this.systems;
  }

  /**
   * Gets the rules fetched from the backend server
   * during the boot process. The data returned by this method
   * is not automatically updated after it is fetched.
   * @returns An array of rule objects stored in memory.
   */
  getRules(): Rule[] {
    return this.rules;
  }

  /**
   * Gets the configuration fetched from the backend server
   * during the boot process. The data returned by this method
   * is not automatically updated after it is fetched.
   * @returns An array of configuration objects stored in memory.
   */
  getConfigs(): Configuration[] {
    return this.configs;
  }

  /**
   * Gets the result of the boot process. The numeric constant
   * returned by this method is described on the properties file.
   * @returns The startup status in form of numeric constant.
   */
  getStartUpStatus(): number {
    return this.startupStatus;
  }

  /**
   * Gets the value
   * @param configName
   * @returns
   */
  getConfigValue(configName: string): string {
    var locale: string = 'en-US';
    var date:string = formatDate(new Date, "yyyy-MMM-dd HH:mm:ss", locale);
    var configValue: string = this.configs.find(x => x.name == configName).value;
    var logEvent: string = '[' + date + '] ' + this.className + '.' + 'getConfig' + '(): ' +
      'Configuration: ' + configName + ' = ' + configValue;
    console.debug(logEvent);
    return configValue;
  }
}
