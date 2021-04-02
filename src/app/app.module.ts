import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';
import { GeneralWorkspaceComponent } from './components/general-workspace/general-workspace.component';
import { MainCalendarComponent } from './components/main-calendar/main-calendar.component';
import { ReservationComponent } from './components/reservation/reservation.component';
//import models
import { ConfigNames, RestUrls } from './model/constants/properties';
import { Configuration } from './model/configuration';
//import services
import { LoginService } from './services/login/login.service';
import { LoggerService } from './services/logger/logger.service';
import { ConfigurationService } from './services/configuration/configuration.service';
import { ReportsComponent } from './components/reports/reports.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AnnouncementsComponent,
    GeneralWorkspaceComponent,
    MainCalendarComponent,
    ReservationComponent,
    ReportsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
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
            sessionStorage.clear();
            for (var key in data) {
              if (data.hasOwnProperty(key)) {
                var config: Configuration = new Configuration;
                config = data[key];
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
