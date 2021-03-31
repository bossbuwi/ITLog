import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AnnouncementsComponent } from "./components/announcements/announcements.component";
import { MainCalendarComponent } from "./components/main-calendar/main-calendar.component";
import { ReservationComponent } from "./components/reservation/reservation.component";

const routes: Routes = [
  { path: 'announcement', component: AnnouncementsComponent },
  { path: 'calendar', component: MainCalendarComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: '',   redirectTo: '/announcement', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
