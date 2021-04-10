import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { User } from 'src/app/model/user';
import { RestUrls } from 'src/app/model/constants/properties';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  userFetch: Subject<boolean>;
  userUpdate: Subject<boolean>;
  users: User[];


  constructor(private http: HttpClient) {
    this.initializeService();
  }

  initializeService(): void {
    this.userFetch = new Subject<boolean>();
    this.userUpdate = new Subject<boolean>();
    this.users = [];
  }

  subscribeUsersFetch(): Observable<boolean> {
    return this.userFetch.asObservable();
  }

  subscribeUsersUpdate(): Observable<boolean> {
    return this.userUpdate.asObservable();
  }

  fetchUsers(): void {
    this.userFetch.next(false);
    this.http.get<User[]>(RestUrls.REST_GET_USERS).subscribe(users => {
      console.log(users);
      this.users = users;
    }, error => {

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
      console.log(data);
    }, error => {
      console.log(error);
    }, () => {
      this.userUpdate.next(true);
    });
  }
}
