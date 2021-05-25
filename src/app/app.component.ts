import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

import { WebProperties } from 'src/app/constants/usersettings';
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  private appName: string;

  constructor (private title: Title, private router: Router,
    private activatedRoute: ActivatedRoute, private core: CoreService) {

  }

  ngOnInit() {
    this.appName = this.core.getSettingsValue(WebProperties.SETTING_GROUP, WebProperties.APP_TITLE);
    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
      ).subscribe(() => {
        const route = this.getChild(this.activatedRoute);
        route.data.subscribe((data: any) => {
          this.title.setTitle(this.appName + ' — ' + data.title);
        });
      });
  }

  /**
   *
   * @param activatedRoute
   * @returns
   */
  getChild(activatedRoute: ActivatedRoute) {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }

  }
}
