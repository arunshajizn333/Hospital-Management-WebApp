import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorRoutingModule } from './doctor-routing.module';
import { DoctorDashboardLayoutComponent } from './components/doctor-dashboard-layout/doctor-dashboard-layout.component';
import { DoctorDashboardHomeComponent } from './components/doctor-dashboard-home/doctor-dashboard-home.component';
import { DoctorProfileComponent } from './components/doctor-profile/doctor-profile.component';
import { DoctorAvailabilityManagementComponent } from './components/doctor-availability-management/doctor-availability-management.component';
import { DoctorAppointmentsComponent } from './components/doctor-appointments/doctor-appointments.component';
import { DoctorPatientListComponent } from './components/doctor-patient-list/doctor-patient-list.component';
import { DoctorPatientRecordComponent } from './components/doctor-patient-record/doctor-patient-record.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    
  
    DoctorDashboardLayoutComponent,
             DoctorDashboardHomeComponent,
             DoctorProfileComponent,
             DoctorAvailabilityManagementComponent,
             DoctorAppointmentsComponent,
             DoctorPatientListComponent,
             DoctorPatientRecordComponent
  ],
  imports: [
    CommonModule,
    DoctorRoutingModule,
    ReactiveFormsModule ,
    FormsModule
  ]
})
export class DoctorModule { }
