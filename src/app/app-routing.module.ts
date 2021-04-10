import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AnnouncementsComponent } from "./components/announcements/announcements.component";
import { MainCalendarComponent } from "./components/main-calendar/main-calendar.component";
import { ReservationComponent } from "./components/reservation/reservation.component";
import { ReportsComponent } from "./components/reports/reports.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

const routes: Routes = [
  { path: 'rules', component: AnnouncementsComponent },
  { path: 'calendar', component: MainCalendarComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '',   redirectTo: '/rules', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
