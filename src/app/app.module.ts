import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
//import components
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';
import { GeneralWorkspaceComponent } from './components/general-workspace/general-workspace.component';
import { MainCalendarComponent } from './components/main-calendar/main-calendar.component';
import { ReservationComponent } from './components/reservation/reservation.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AdminMenuComponent } from './components/dashboard/admin-menu/admin-menu.component';
import { SystemMenuComponent } from './components/dashboard/system-menu/system-menu.component';
import { RuleMenuComponent } from './components/dashboard/rule-menu/rule-menu.component';
import { ConfigMenuComponent } from './components/dashboard/config-menu/config-menu.component';
//import services
import { LoginService } from './services/login/login.service';
import { LoggerService } from './services/logger/logger.service';
import { CoreService } from './services/core/core.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EventsService } from './services/events/events.service';
import { NavService } from './services/nav/nav.service';

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
    ConfigMenuComponent
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
    LoginService,
    NavService,
    LoggerService,
    EventsService,
    CoreService
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
  console.debug('Executing APP_INITIALIZER.');
  console.debug('Calling CoreService.');
  var promise: Promise<boolean> = coreService.startup();
  return () => promise;
}
