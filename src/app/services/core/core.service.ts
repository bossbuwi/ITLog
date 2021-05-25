import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';

import { SettingsFiles, ConfigNames, ErrorCodes } from "src/app/constants/properties";
import { LoginPersistence, RestUrls} from "src/app/constants/usersettings";
import { Configuration } from "src/app/models/configuration";
import { System } from "src/app/models/system";
import { Rule } from "src/app/models/rule";
import { EventType } from "src/app/models/eventtype";
import { Setting } from "src/app/models/setting";

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  private className: string = 'CoreService';
  private systems: System[];
  private rules: Rule[];
  private configs: Configuration[];
  private eventTypes: EventType[];
  private userSettings: Setting[];
  private startUpComplete: Subject<number>;
  private startupStatus: number;
  private startupError: string;
  private fetchConfigsComplete: Subject<boolean>;
  private fetchSystemsComplete: Subject<boolean>;
  private fetchRulesComplete: Subject<boolean>;
  private fetchEventTypesComplete: Subject<boolean>;
  private checkUserComplete: Subject<boolean>;
  private readUserSettingsComplete: Subject<boolean>;

  constructor(private http: HttpClient) {
    this.initializeService();
  }

  /**
   * Initializes the core service. This method prevents arrays
   * and subjects from being undefined.
   */
  initializeService(): void {
    this.logger('initializeService', 'Initializing CoreService.');
    this.logger('initializeService', 'Initializing arrays and subjects.');
    this.systems = [];
    this.rules = [];
    this.configs = [];
    this.eventTypes = [];
    this.startUpComplete = new Subject<number>();
    this.fetchConfigsComplete = new Subject<boolean>();
    this.fetchSystemsComplete = new Subject<boolean>();
    this.fetchRulesComplete = new Subject<boolean>();
    this.fetchEventTypesComplete = new Subject<boolean>();
    this.checkUserComplete = new Subject<boolean>();
    this.readUserSettingsComplete = new Subject<boolean>();
    this.logger('initializeService', 'CoreService has no access to LoggerService to avoid circular dependencies.');
    this.logger('initializeService', 'CoreService will use default logging and will bypass any logging level set.');
  }

  /**
   *
   * @param methodName
   * @param message
   */
  private logger(methodName: string, message: string):void {
    let locale: string = 'en-US';
    let date:string = formatDate(new Date, "yyyy-MMM-dd HH:mm:ss.SSS", locale);
    let logEvent: string = '[' + date + '] ' + this.className + '.' + methodName + '(): ' +
      message;
    console.debug(logEvent);
  }

  /**
   * Starts the app's bootup process.
   * It returns a promise just to satify Angular's requirements
   * but the actual results of the startup are broadcasted using
   * the startUpComplete subject.
   * @returns {Promise<boolean>} new Promise -
   * A promise indicating that the startup
   * process has finished its execution. Note that the
   * promise would still be returned even if the app's
   * startup encountered an error and did not finish correctly.
   */
  startup():Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.logger('startup', 'Preparing to fetch data from the server.');
      this.fetchDataFromServer();
      this.startUpComplete.subscribe(status => {
        this.startupStatus = status;
        if (status > 0) {
          this.logger('startup', 'Application startup failed.');
        } else {
          this.logger('startup', 'Application startup complete.');
          this.logger('startup', 'Loading app components, creating models and waking services.');
        }
        resolve(true);
      })

    });
  }

  /**
   * Manages the chain of methods that executes during startup.
   * Each method is virtually independent of each other. Their status
   * is managed through a matching subscription. Each individual method
   * has a matching Subject that broadcasts the status of the method
   * and any error that it may have encountered.
   */
  fetchDataFromServer(): void {
    this.logger('fetchDataFromServer', 'Initiating the startup chain.');
    this.readUserSettings();
    let setting: Subscription = this.readUserSettingsComplete.subscribe(status => {
      if (status)
      this.fetchConfigs();
    });
    let config: Subscription = this.fetchConfigsComplete.subscribe(status => {
      if (status)
      this.fetchSystems();
    });
    let system: Subscription = this.fetchSystemsComplete.subscribe(status => {
      if (status)
      this.fetchRules();
    });
    let rules: Subscription = this.fetchRulesComplete.subscribe(status => {
      if (status) {
        this.fetchEventTypes();
      }
    });
    let eventTypes: Subscription = this.fetchEventTypesComplete.subscribe(status => {
      if (status){
        this.decodeStoredKey();
      }
    });
    let user: Subscription = this.checkUserComplete.subscribe(status => {
      if (status){
        this.startUpComplete.next(ErrorCodes.NO_ERRORS)
      }
    });
    this.startUpComplete.subscribe(status => {
      this.logger('fetchDataFromServer', 'Startup chain finished.');
      this.logger('fetchDataFromServer', 'Deleting subscriptions.');
      if (status == 0) {
        setting.unsubscribe();
        config.unsubscribe();
        system.unsubscribe();
        rules.unsubscribe();
        eventTypes.unsubscribe();
        user.unsubscribe();
      }
    })
  }

  readUserSettings(): void {
    this.logger('readUserSettings', 'Searching for the user configured JSON file.');
    this.http.get<Setting[]>(SettingsFiles.JSON_DATA).subscribe(data => {
      if (data.length > 0) {
        this.logger('readUserSettings', 'JSON file found.');
        this.logger('readUserSettings', 'Reading the user defined settings.');
        this.userSettings = data;
      }
    }, error => {
      this.logger('readUserSettings', 'There is an error reading the user defined settings.');
      this.logger('readUserSettings', 'The JSON file may be corrupted or missing.');
      console.log(error);
      this.startupError = 'User settings file is either missing or corrupted.';
      this.startUpComplete.next(ErrorCodes.FATAL_ERROR);
    }, () => {
      this.readUserSettingsComplete.next(true);
    })
  }

  /**
   *
   */
  fetchConfigs(): void {
    this.logger('fetchConfigs', 'Attempting to fetch configuration from server.');
    this.http.get<Configuration[]>(this.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GET_CONFIG)).subscribe(configs => {
      if (configs.length > 0) {
        this.logger('fetchConfigs', 'Configuration received.');
        this.configs = configs;
      }
    }, error => {
      this.logger('fetchConfigs', 'There is an error fetching the configuration.');
      console.log(error);
      this.startupError = 'Cannot fetch configuration from server.';
      this.startUpComplete.next(ErrorCodes.FATAL_ERROR);
    }, () => {
      this.fetchConfigsComplete.next(true);
    });
  }

  /**
   *
   */
  fetchSystems(): void {
    this.logger('fetchSystems', 'Attempting to fetch systems from server.');
    this.http.get<System[]>(this.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GET_SYSTEMS)).subscribe(systems => {
      if (systems.length > 0) {
        this.logger('fetchSystems', 'Systems received.');
        this.systems = systems;
      }
    }, error => {
      this.logger('fetchSystems', 'There is an error fetching the systems.');
      console.log(error);
      this.startupError = 'Cannot fetch systems from server.';
      this.startUpComplete.next(ErrorCodes.FATAL_ERROR);
    }, () => {
      this.fetchSystemsComplete.next(true);
    });
  }

  /**
   *
   */
  fetchRules(): void {
    this.logger('fetchRules', 'Attempting to fetch rules from server.');
    this.http.get<Rule[]>(this.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GET_RULES)).subscribe(rules => {
      if (rules.length > 0) {
        this.logger('fetchRules', 'Rules received.');
        this.rules = rules;
      }
    }, error => {
      this.logger('fetchRules', 'There is an error fetching the rules.');
      console.log(error);
      this.startupError = 'Cannot fetch rules from server.';
      this.startUpComplete.next(ErrorCodes.FATAL_ERROR);
    }, () => {
      this.fetchRulesComplete.next(true);
    });
  }

  /**
   *
   */
  fetchEventTypes(): void {
    this.logger('fetchEventTypes', 'Attempting to fetch event types from server.');
    this.http.get<EventType[]>(this.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GET_EVENT_TYPES)).subscribe(eventTypes => {
      if (eventTypes.length > 0) {
        this.logger('fetchEventTypes', 'Event types received.');
        this.eventTypes = eventTypes;
      }
    }, error => {
      this.logger('fetchEventTypes', 'There is an error fetching the event types.');
      console.log(error);
      this.startupError = 'Cannot fetch event types from server.';
      this.startUpComplete.next(ErrorCodes.FATAL_ERROR);
    }, () => {
      this.fetchEventTypesComplete.next(true);
    });
  }

  /**
   *
   * @param username
   */
  fetchUserInfo(username: string): void {
    this.logger('fetchUserInfo', 'Attempting to fetch information for user with id: ' + username + '.');
    const params: HttpParams = new HttpParams()
      .set('username', username);
    this.http.get<boolean>(this.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GET_ADMIN), { params }).subscribe(admin => {
      this.logger('fetchUserInfo', 'User information received.');
      this.logger('fetchUserInfo', 'Saving information in temporary keys.');
      localStorage.setItem(this.getSettingsValue(LoginPersistence.SETTING_GROUP, LoginPersistence.KEY_USERNAME), username);
      localStorage.setItem(this.getSettingsValue(LoginPersistence.SETTING_GROUP, LoginPersistence.KEY_ADMIN), String(admin));
    }, error => {
      this.logger('fetchUserInfo', 'There is an error fetching the user data.');
      console.log(error);
      this.startupError = 'Cannot fetch user data from server.';
      this.startUpComplete.next(ErrorCodes.FATAL_ERROR);
    }, () => {
      this.checkUserComplete.next(true);
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
   *
   * @returns
   */
  getEventTypes(): EventType[] {
    return this.eventTypes;
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
   *
   * @returns
   */
  getStartupError(): string {
    if (this.startupStatus == ErrorCodes.FATAL_ERROR) {
      return this.startupError;
    } else {
      return 'No startup error reported.';
    }
  }

  /**
   *
   * @param configName
   * @param secured
   * @returns
   */
  getConfigValue(configName: string, secured: boolean = false): string {
    let logLevel: string = this.configs.find(x => x.name == ConfigNames.CONF_LOGGING_LEVEL).value;
    let configValue: string = this.configs.find(x => x.name == configName).value;
    if (logLevel !== 'N') {
      if (secured === false) {
        this.logger('getConfigValue', 'Configuration: ' + configName + ' = ' + configValue);
      }
    }
    return configValue;
  }

  getSettingsValue(groupName: string, settingKey: string): string {
    // let settingsValue: string = this.userSettings.find(x => x.groupName == groupName).details[settingKey];
    let settingsValue: string;
    switch (groupName) {
      case RestUrls.SETTING_GROUP:
        let serverAddress: string = this.userSettings.find(x => x.groupName == groupName).details[RestUrls.REST_SERVER];
        let restEndpoint: string = this.userSettings.find(x => x.groupName == groupName).details[settingKey];
        settingsValue = serverAddress + restEndpoint;
        break;
      default:
        settingsValue = this.userSettings.find(x => x.groupName == groupName).details[settingKey];
        break;
    }
    return settingsValue;
  }

  /**
   *
   * @returns
   */
  subscribeConfigsComplete():  Observable<boolean> {
    return this.fetchConfigsComplete.asObservable();
  }

  /**
   *
   * @returns
   */
  subscribeSystemsComplete():  Observable<boolean> {
    return this.fetchSystemsComplete.asObservable();
  }

  /**
   *
   * @returns
   */
  subscribeRulesComplete():  Observable<boolean> {
    return this.fetchRulesComplete.asObservable();
  }

  subscribeReadUserSettingsComplete(): Observable<boolean> {
    return this.readUserSettingsComplete.asObservable();
  }

  /**
   *
   * @param username
   */
  encodeUser(username: string): void {
    this.logger('encodeUser', 'Encoding user data.');
    let seed = parseInt(this.getConfigValue(ConfigNames.CONF_SEED, true));
    let key: string = this.getConfigValue(ConfigNames.CONF_KEY, true);
    //create an array that will hold the individual characters
    let result: string[] = [];
    //get the string that will be used to encode the username
    let characters: string = this.getSettingsValue(LoginPersistence.SETTING_GROUP, LoginPersistence.ENCODING_STREAM);
    let charactersLength = characters.length;
    //get the username's length
    let usernameLength = username.length;
    //encode the username into a fixed random string
    for (let x = 0; x < usernameLength; x++) {
      //generate random chars with a specific length
      for ( let i = 0; i < seed; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
      }
      //add a character from the username after a number of random chars
      result.push(username.substr(x,1));
    }
    //generate another set of random string after the
    // last character of the username
    for ( let i = 0; i < seed; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    //add the key
    result.push(key);
    //add another set of random string after the key
    for ( let i = 0; i < seed; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    this.logger('encodeUser', 'Encoding complete.');
    //store the resulting string as key value pair
    localStorage.setItem(this.getSettingsValue(LoginPersistence.SETTING_GROUP, LoginPersistence.KEY_STORAGE), result.join(''));
  }

  /**
   *
   */
  private decodeStoredKey(): void {
    this.logger('decodeStoredKey', 'Checking if a user is logged in.');
    //get the stored code if there is any
    let code: string = localStorage.getItem(this.getSettingsValue(LoginPersistence.SETTING_GROUP, LoginPersistence.KEY_STORAGE));
    //check if the stored code is existing
    if (code == null) {
      this.logger('decodeStoredKey', 'No trace of an existing user was found.');
      this.checkUserComplete.next(true);
    } else {
      this.logger('decodeStoredKey', 'A login code was found.');
      this.logger('decodeStoredKey', 'Initiating decoding sequence.');
      //get the length of the code
      let codeLength: number = code.length;
      //get required information to decode the string
      let seed: number = parseInt(this.getConfigValue(ConfigNames.CONF_SEED, true));
      let key: string = this.getConfigValue(ConfigNames.CONF_KEY, true);
      //given the seed, key length and code length, it is possible to get the
      //length of the code that contains the actual information needed
      let infoLength: number = codeLength - seed - key.length;
      //extract the key from the code and compare it with the key from the database
      let embeddedKey: string = code.substr(infoLength, key.length);
      if (embeddedKey === key) {
        this.logger('decodeStoredKey', "The encoded information matched with the server's key.");
        //if the embedded key is the same as that provided by the server
        //execute the decoding process
        //start the process by removing the useless trailing characters
        let encodedInfo = code.substr(0, infoLength);
        //remove the useless preceeding characters
        encodedInfo = encodedInfo.substr(seed);
        //calculate the length of the username stored within the code
        let usernameLength: number = (infoLength - seed) / (seed + 1);
        //create an array the will hold the username's characters
        let username: string[] = [];
        //iterate through the string for x times depending
        //on the assumed length of the username stored on the code
        for (let i = 0; i < usernameLength; i++) {
          //calculate where the current character of the username should be
          let pointer: number = (i * seed) + i;
          //push the character to the username array
          username.push(encodedInfo.substr(pointer, 1))
        }
        let decodedUser: string = username.join('');
        this.logger('decodeStoredKey', 'User with id: ' + decodedUser + ' found.');
        this.logger('decodeStoredKey', 'Communicating with server for authentication.');
        this.fetchUserInfo(decodedUser);
      } else {
        this.logger('decodeStoredKey', 'The encoded information does not match with the key from the server.');
        this.logger('decodeStoredKey', 'Deleting any residual data.');
        localStorage.removeItem(this.getSettingsValue(LoginPersistence.SETTING_GROUP, LoginPersistence.KEY_STORAGE));
        this.checkUserComplete.next(true);
      }
    }
  }
}
