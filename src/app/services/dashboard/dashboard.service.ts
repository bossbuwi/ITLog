import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { User } from 'src/app/models/user';
import { RestUrls } from 'src/app/constants/usersettings';
import { System } from 'src/app/models/system';
import { Rule } from 'src/app/models/rule';
import { Configuration } from 'src/app/models/configuration';

import { CoreService } from 'src/app/services/core/core.service';
import { LoggerService } from 'src/app/services/logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private className = 'DashboardService';
  userFetch: Subject<boolean>;
  userUpdate: Subject<boolean>;
  users: User[];
  systemsUpdate: Subject<boolean>;
  rulesUpdate: Subject<boolean>;
  configsUpdate: Subject<boolean>;

  constructor(private http: HttpClient, private core: CoreService,
    private log: LoggerService) {
    this.initializeService();
  }

  initializeService(): void {
    this.log.logVerbose(this.className, 'initializeService', 'Initializing ' + this.className +'.');
    this.userFetch = new Subject<boolean>();
    this.userUpdate = new Subject<boolean>();
    this.systemsUpdate = new Subject<boolean>();
    this.rulesUpdate = new Subject<boolean>();
    this.configsUpdate = new Subject<boolean>();
    this.users = [];
  }

  subscribeUsersFetch(): Observable<boolean> {
    return this.userFetch.asObservable();
  }

  subscribeUsersUpdate(): Observable<boolean> {
    return this.userUpdate.asObservable();
  }

  subscribeSystemsUpdate(): Observable<boolean> {
    return this.systemsUpdate.asObservable();
  }

  subscribeRulesUpdate(): Observable<boolean> {
    return this.rulesUpdate.asObservable();
  }

  subscribeConfigsUpdate(): Observable<boolean> {
    return this.configsUpdate.asObservable();
  }

  fetchUsers(): void {
    this.log.logVerbose(this.className, 'fetchUsers', 'Fetching users from the server.');
    this.userFetch.next(false);
    this.http.get<User[]>(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_GET_USERS)).subscribe(users => {
      this.log.logVerbose(this.className, 'fetchUsers', 'Users received.');
      this.users = users;
    }, error => {
      this.log.logVerbose(this.className, 'fetchUsers', 'Users received.');
      this.log.logVerbose(this.className, 'fetchUsers', error);
    }, () => {
      this.userFetch.next(true);
    })
  }

  getUsers(): User[] {
    return this.users;
  }

  updateUsers(users: User[]) {
    this.log.logVerbose(this.className, 'updateUsers', 'Syncing changes with the server.');
    this.userUpdate.next(false);
    this.http.put(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_PUT_USERS), { users }).subscribe(data => {
      this.log.logVerbose(this.className, 'updateUsers', 'Changes saved.');
    }, error => {
      this.log.logVerbose(this.className, 'updateUsers', 'There is an error saving the changes.');
      this.log.logVerbose(this.className, 'updateUsers', error);
    }, () => {
      this.userUpdate.next(true);
    });
  }

  updateSystems(systems: System[]): void {
    this.log.logVerbose(this.className, 'updateSystems', 'Syncing changes with the server.');
    this.systemsUpdate.next(false);
    this.http.post(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_POST_SYSTEMS), systems).subscribe(data => {
      this.log.logVerbose(this.className, 'updateSystems', 'Changes saved.');
    }, error => {
      this.log.logVerbose(this.className, 'updateSystems', 'There is an error saving the changes.');
      this.log.logVerbose(this.className, 'updateSystems', error);
    }, () => {
      this.systemsUpdate.next(true);
    })
  }

  updateRules(rules: Rule[]): void {
    this.log.logVerbose(this.className, 'updateRules', 'Syncing changes with the server.');
    this.rulesUpdate.next(false);
    this.http.post(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_POST_RULES), rules).subscribe(data => {
      this.log.logVerbose(this.className, 'updateRules', 'Changes saved.');
    }, error => {
      this.log.logVerbose(this.className, 'updateRules', 'There is an error saving the changes.');
      this.log.logVerbose(this.className, 'updateRules', error);
    }, () => {
      this.rulesUpdate.next(true);
    })
  }

  updateConfigs(configs: Configuration[]): void {
    this.log.logVerbose(this.className, 'updateConfigs', 'Syncing changes with the server.');
    this.configsUpdate.next(false);
    this.http.post(this.core.getSettingsValue(RestUrls.SETTING_GROUP, RestUrls.REST_POST_CONFIG), configs).subscribe(data => {
      this.log.logVerbose(this.className, 'updateConfigs', 'Changes saved.');
    }, error => {
      this.log.logVerbose(this.className, 'updateConfigs', 'There is an error saving the changes.');
      this.log.logVerbose(this.className, 'updateConfigs', error);
    }, () => {
      this.configsUpdate.next(true);
    })
  }
}
