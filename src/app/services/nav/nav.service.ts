import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavService {
  private tabChange: Subject<number>;
  private activeTab: number;

  constructor() {
    this.tabChange = new Subject();
    this.tabChange.subscribe(tab => {
      this.activeTab = tab;
    });
  }

  setActiveTab(tab: number) {
    this.tabChange.next(tab);
  }

  subscribeActiveTab(): Observable<number> {
    return this.tabChange.asObservable();
  }

}
