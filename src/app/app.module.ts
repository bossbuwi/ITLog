import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

import { LoginService } from './services//login/login.service';
import { LoggerService } from './services/logger/logger.service';
import { ConfigurationService } from './services/configuration/configuration.service';

import { ConfigNames, RestUrls, LoggingLevel } from './model/constants/properties';
import { Configuration } from './model/configuration';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';
import { GeneralWorkspaceComponent } from './components/general-workspace/general-workspace.component';
import { MainCalendarComponent } from './components/main-calendar/main-calendar.component';
import { ReservationComponent } from './components/reservation/reservation.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AnnouncementsComponent,
    GeneralWorkspaceComponent,
    MainCalendarComponent,
    ReservationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [
        HttpClient,
        ConfigurationService
      ]
    },
    LoginService,
    LoggerService,
    ConfigurationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

/**
 *
 * @param http
 * @param configService
 * @returns
 */
export function initializeApp(http: HttpClient, configService: ConfigurationService): (() => Promise<boolean>) {
  return (): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      http.get(RestUrls.REST_CONFIG_URL)
        .pipe(
          map((data: any) => {
            console.log(data);
            sessionStorage.clear();
            for (var key in data) {
              if (data.hasOwnProperty(key)) {
                var config: Configuration = new Configuration;
                config = data[key];
                console.log(config);
                configService.writeConfiguration(config);
              }
            }
            resolve(true);
          }),
          catchError(() => {
            sessionStorage.setItem('offline', 'Y');
            resolve(true);
            return of({});
          })
        ).subscribe();
    });
  };
}
