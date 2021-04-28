import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';

import { ConfigNames, RestUrls, ErrorCodes, LoginPersistence } from "../../models/constants/properties";
import { Configuration } from "../../models/configuration";
import { System } from "../../models/system";
import { Rule } from "../../models/rule";

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
  private fetchConfigsComplete: Subject<boolean>;
  private fetchSystemsComplete: Subject<boolean>;
  private fetchRulesComplete: Subject<boolean>;
  private checkUserComplete: Subject<boolean>;

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
    this.fetchConfigsComplete = new Subject<boolean>();
    this.fetchSystemsComplete = new Subject<boolean>();
    this.fetchRulesComplete = new Subject<boolean>();
    this.checkUserComplete = new Subject<boolean>();
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
      this.fetchDataFromServer();
      this.startUpComplete.subscribe(status => {
        this.startupStatus = status;
        if (status > 0) {
          console.debug('Application startup failed.');
        } else {
          console.debug('Application startup complete.');
          console.debug('Loading app components, creating models and waking services.');
        }
        resolve(true);
      })

    });
  }

  fetchDataFromServer(): void {
    this.fetchConfigs();
    var config: Subscription = this.fetchConfigsComplete.subscribe(status => {
      if (status)
      this.fetchSystems();
    })
    var system: Subscription = this.fetchSystemsComplete.subscribe(status => {
      if (status)
      this.fetchRules();
    })
    var rules: Subscription = this.fetchRulesComplete.subscribe(status => {
      if (status) {
        this.decodeStoredKey();
      }
    })
    var user: Subscription = this.checkUserComplete.subscribe(status => {
      if (status){
        this.startUpComplete.next(ErrorCodes.NO_ERRORS)
      }
    })
    this.startUpComplete.subscribe(status => {
      if (status == 0) {
        config.unsubscribe();
        system.unsubscribe();
        rules.unsubscribe();
        user.unsubscribe();
      }
    })
  }

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
      this.fetchConfigsComplete.next(true);
    });
  }

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
      this.fetchSystemsComplete.next(true);
    });
  }

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
      this.fetchRulesComplete.next(true);
    });
  }

  fetchUserInfo(username: string): void {
    console.debug('Attempting to fetch information for user with id: ' + username + '.');
    const params: HttpParams = new HttpParams()
      .set('username', username);
    this.http.get<boolean>(RestUrls.REST_GET_ADMIN, { params }).subscribe(admin => {
      console.debug('User information received.');
      console.debug('Saving information in temporary keys.');
      localStorage.setItem(LoginPersistence.KEY_USERNAME, username);
      localStorage.setItem(LoginPersistence.KEY_ADMIN, String(admin));
    }, error => {
      console.log(error);
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
  getConfigValue(configName: string, secured: boolean = false): string {
    var locale: string = 'en-US';
    var date:string = formatDate(new Date, "yyyy-MMM-dd HH:mm:ss", locale);
    var configValue: string = this.configs.find(x => x.name == configName).value;
    var logEvent: string = '[' + date + '] ' + this.className + '.' + 'getConfig' + '(): ' +
      'Configuration: ' + configName + ' = ' + configValue;
    if (secured === false)
    console.debug(logEvent);
    return configValue;
  }

  subscribeConfigsComplete():  Observable<boolean> {
    return this.fetchConfigsComplete.asObservable();
  }

  subscribeSystemsComplete():  Observable<boolean> {
    return this.fetchSystemsComplete.asObservable();
  }

  subscribeRulesComplete():  Observable<boolean> {
    return this.fetchRulesComplete.asObservable();
  }

  encodeUser(username: string): void {
    console.debug('Encoding user data.');
    var seed = parseInt(this.getConfigValue(ConfigNames.CONF_SEED, true));
    var key: string = this.getConfigValue(ConfigNames.CONF_KEY, true);
    //create an array that will hold the individual characters
    var result: string[] = [];
    //get the string that will be used to encode the username
    var characters: string = LoginPersistence.ENCODING_STREAM;
    var charactersLength = characters.length;
    //get the username's length
    var usernameLength = username.length;
    //encode the username into a fixed random string
    for (var x = 0; x < usernameLength; x++) {
      //generate random chars with a specific length
      for ( var i = 0; i < seed; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
      }
      //add a character from the username after a number of random chars
      result.push(username.substr(x,1));
    }
    //generate another set of random string after the
    // last character of the username
    for ( var i = 0; i < seed; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    //add the key
    result.push(key);
    //add another set of random string after the key
    for ( var i = 0; i < seed; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    console.debug('Encoding complete.');
    //store the resulting string as key value pair
    localStorage.setItem(LoginPersistence.KEY_STORAGE, result.join(''));
  }

  private decodeStoredKey(): void {
    console.debug('Checking if a user is logged in.');
    //get the stored code if there is any
    var code: string = localStorage.getItem(LoginPersistence.KEY_STORAGE);
    //check if the stored code is existing
    if (code == null) {
      console.debug('No trace of an existing user was found.');
      this.checkUserComplete.next(true);
    } else {
      console.debug('A login code was found.');
      console.debug('Initiating decoding sequence.');
      //get the length of the code
      var codeLength: number = code.length;
      //get required information to decode the string
      var seed: number = parseInt(this.getConfigValue(ConfigNames.CONF_SEED, true));
      var key: string = this.getConfigValue(ConfigNames.CONF_KEY, true);
      //given the seed, key length and code length, it is possible to get the
      //length of the code that contains the actual information needed
      var infoLength: number = codeLength - seed - key.length;
      //extract the key from the code and compare it with the key from the database
      var embeddedKey: string = code.substr(infoLength, key.length);
      if (embeddedKey === key) {
        console.debug("The encoded information matched with the server's key.");
        //if the embedded key is the same as that provided by the server
        //execute the decoding process
        //start the process by removing the useless trailing characters
        var encodedInfo = code.substr(0, infoLength);
        //remove the useless preceeding characters
        encodedInfo = encodedInfo.substr(seed);
        //calculate the length of the username stored within the code
        var usernameLength: number = (infoLength - seed) / (seed + 1);
        //create an array the will hold the username's characters
        var username: string[] = [];
        //iterate through the string for x times depending
        //on the assumed length of the username stored on the code
        for (var i = 0; i < usernameLength; i++) {
          //calculate where the current character of the username should be
          var pointer: number = (i * seed) + i;
          //push the character to the username array
          username.push(encodedInfo.substr(pointer, 1))
        }
        var decodedUser: string = username.join('');
        console.debug('User with id: ' + decodedUser + ' found.');
        console.debug('Communicating with server for authentication.');
        this.fetchUserInfo(decodedUser);
      } else {
        console.debug('The encoded information does not match with the key from the server.');
        console.debug('Deleting residual data.');
        localStorage.removeItem(LoginPersistence.KEY_STORAGE);
        this.checkUserComplete.next(true);
      }
    }
  }
}
