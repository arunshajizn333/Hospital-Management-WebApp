import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardLayoutComponent } from './components/admin-dashboard-layout/admin-dashboard-layout.component';
import { AdminDashboardHomeComponent } from './components/admin-dashboard-home/admin-dashboard-home.component';
import { AdminManageDoctorsComponent } from './components/admin-manage-doctors/admin-manage-doctors.component';
import { AdminManageDepartmentsComponent } from './components/admin-manage-departments/admin-manage-departments.component';
import { AdminViewPatientsComponent } from './components/admin-view-patients/admin-view-patients.component';
import { AdminViewAppointmentsComponent } from './components/admin-view-appointments/admin-view-appointments.component';
import { AdminCallbackRequestsComponent } from './components/admin-callback-requests/admin-callback-requests.component';
import { AdminContactInquiriesComponent } from './components/admin-contact-inquiries/admin-contact-inquiries.component';
import { AdminHospitalSettingsComponent } from './components/admin-hospital-settings/admin-hospital-settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
@NgModule({
  declarations: [
  
    AdminDashboardLayoutComponent,
       AdminDashboardHomeComponent,
       AdminManageDoctorsComponent,
       AdminManageDepartmentsComponent,
       AdminViewPatientsComponent,
       AdminViewAppointmentsComponent,
       AdminCallbackRequestsComponent,
       AdminContactInquiriesComponent,
       AdminHospitalSettingsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule
  ]
})
export class AdminModule { }
