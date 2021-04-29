import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AnnouncementsComponent } from "./components/announcements/announcements.component";
import { MainCalendarComponent } from "./components/main-calendar/main-calendar.component";
import { ReservationComponent } from "./components/reservation/reservation.component";
import { ReportsComponent } from "./components/reports/reports.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { LoginGuard } from './guards/login.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: 'rules', component: AnnouncementsComponent },
  { path: 'calendar', component: MainCalendarComponent },
  { path: 'event', component: ReservationComponent },
  { path: 'reports', component: ReportsComponent, canActivate: [LoginGuard, AdminGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [LoginGuard, AdminGuard] },
  { path: '',   redirectTo: '/calendar', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
