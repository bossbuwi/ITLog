import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { formatDate } from '@angular/common';
//import components
import { AppComponent } from 'src/app/app.component';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { AnnouncementsComponent } from 'src/app/components/announcements/announcements.component';
import { GeneralWorkspaceComponent } from 'src/app/components/general-workspace/general-workspace.component';
import { MainCalendarComponent } from 'src/app/components/main-calendar/main-calendar.component';
import { ReservationComponent } from 'src/app/components/reservation/reservation.component';
import { ReportsComponent } from 'src/app/components/reports/reports.component';
import { AdminMenuComponent } from 'src/app/components/dashboard/admin-menu/admin-menu.component';
import { SystemMenuComponent } from 'src/app/components/dashboard/system-menu/system-menu.component';
import { RuleMenuComponent } from 'src/app/components/dashboard/rule-menu/rule-menu.component';
import { ConfigMenuComponent } from 'src/app/components/dashboard/config-menu/config-menu.component';
import { PageNotFoundComponent } from 'src/app/components/page-not-found/page-not-found.component';
import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';
//import services
import { LoginService } from 'src/app/services/login/login.service';
import { LoggerService } from 'src/app/services/logger/logger.service';
import { CoreService } from 'src/app/services/core/core.service';
import { EventsService } from 'src/app/services/events/events.service';
import { NavService } from 'src/app/services/nav/nav.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AnnouncementsComponent,
    GeneralWorkspaceComponent,
    MainCalendarComponent,
    ReservationComponent,
    ReportsComponent,
    DashboardComponent,
    AdminMenuComponent,
    SystemMenuComponent,
    RuleMenuComponent,
    ConfigMenuComponent,
    PageNotFoundComponent
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
      deps: [ CoreService ]
    },
    Title,
    CoreService,
    LoggerService,
    LoginService,
    NavService,
    EventsService,
    DashboardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

/**
 * Executes during the app's bootstrap process. This has a
 * dependency on the CoreService. This has a design flaw in
 * that it returns a promise even if the startup process has
 * failed. The "true" result is stored by the CoreService from
 * where it could be accessed by other components and services.
 *
 * @param coreService The app's CoreService. It connects to the
 * backend server during startup, ensuring that the server is online
 * and pre-fetching important details for easy access later on.
 * @returns A promise.
 */
export function initializeApp(coreService: CoreService) {
  logger('initializeApp', 'Executing APP_INITIALIZER.');
  logger('initializeApp', 'Delegating startup to CoreService.');
  let promise: Promise<boolean> = coreService.startup();
  return () => promise;
}

function logger(methodName: string, message: string):void {
  let locale: string = 'en-US';
  let date:string = formatDate(new Date, "yyyy-MMM-dd HH:mm:ss.SSS", locale);
  let logEvent: string = '[' + date + '] ' + 'AppModule' + '.' + methodName + '(): ' +
    message;
  console.debug(logEvent);
}
