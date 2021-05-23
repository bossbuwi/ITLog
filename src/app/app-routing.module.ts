import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AnnouncementsComponent } from "src/app/components/announcements/announcements.component";
import { MainCalendarComponent } from "src/app/components/main-calendar/main-calendar.component";
import { ReservationComponent } from "src/app/components/reservation/reservation.component";
import { ReportsComponent } from "src/app/components/reports/reports.component";
import { DashboardComponent } from "src/app/components/dashboard/dashboard.component";
import { PageNotFoundComponent } from 'src/app/components/page-not-found/page-not-found.component';
import { LoginGuard } from 'src/app/guards/login.guard';
import { AdminGuard } from 'src/app/guards/admin.guard';

const routes: Routes = [
  { path: 'rules', component: AnnouncementsComponent, data: {title: 'Home'} },
  { path: 'calendar', component: MainCalendarComponent, data: {title: 'Calendar'} },
  { path: 'event', component: ReservationComponent, data: {title: 'Event'} },
  { path: 'reports', component: ReportsComponent, data: {title: 'Reports'}, canActivate: [LoginGuard, AdminGuard] },
  { path: 'dashboard', component: DashboardComponent, data: {title: 'Dashboard'}, canActivate: [LoginGuard, AdminGuard] },
  { path: '',   redirectTo: '/rules', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent, data: {title: 'Page Not Found'}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
