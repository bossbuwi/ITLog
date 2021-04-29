import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { User } from 'src/app/models/user';
import { ConfigNames, RestUrls } from 'src/app/models/constants/properties';
import { System } from 'src/app/models/system';
import { Rule } from 'src/app/models/rule';
import { Config } from 'protractor';
import { CoreService } from '../core/core.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  userFetch: Subject<boolean>;
  userUpdate: Subject<boolean>;
  users: User[];
  systemsUpdate: Subject<boolean>;
  rulesUpdate: Subject<boolean>;
  configsUpdate: Subject<boolean>;


  constructor(private http: HttpClient, private core: CoreService) {
    this.initializeService();
  }

  initializeService(): void {
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
    this.userFetch.next(false);
    this.http.get<User[]>(RestUrls.REST_GET_USERS).subscribe(users => {
      this.users = users;
    }, error => {
      console.log(error);
    }, () => {
      this.userFetch.next(true);
    })
  }

  getUsers(): User[] {
    return this.users;
  }

  updateUsers(users: User[]) {
    this.userUpdate.next(false);
    this.http.put(RestUrls.REST_PUT_USERS, { users }).subscribe(data => {
    }, error => {
      console.log(error);
    }, () => {
      this.userUpdate.next(true);
    });
  }

  updateSystems(systems: System[]): void {
    this.systemsUpdate.next(false);
    this.http.post(RestUrls.REST_POST_SYSTEMS, systems).subscribe(data => {
    }, error => {
      console.log(error);
    }, () => {
      this.systemsUpdate.next(true);
    })
  }

  updateRules(rules: Rule[]): void {
    this.rulesUpdate.next(false);
    this.http.post(RestUrls.REST_POST_RULES, rules).subscribe(data => {
    }, error => {
      console.log(error);
    }, () => {
      this.rulesUpdate.next(true);
    })
  }

  updateConfigs(configs: Config[]): void {
    this.configsUpdate.next(false);
    this.http.post(RestUrls.REST_POST_CONFIG, configs).subscribe(data => {
    }, error => {
      console.log(error);
    }, () => {
      this.configsUpdate.next(true);
    })
  }
}
