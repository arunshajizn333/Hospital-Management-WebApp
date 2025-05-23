import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // Import forms modules if needed by components

import { PatientRoutingModule } from './patient-routing.module';
import { SharedModule } from '../../shared/shared.module'; // Often useful for shared components/pipes/directives

// Import all components that belong to this module and are used in its routes or templates
import { PatientDashboardLayoutComponent } from './components/patient-dashboard-layout/patient-dashboard-layout.component';
import { PatientDashboardHomeComponent } from './components/patient-dashboard-home/patient-dashboard-home.component';
import { PatientProfileComponent } from './components/patient-profile/patient-profile.component';
import { PatientAppointmentsComponent } from './components/patient-appointments/patient-appointments.component';
import { PatientBookAppointmentComponent } from './components/patient-book-appointment/patient-book-appointment.component';
import { PatientMedicalRecordsComponent } from './components/patient-medical-records/patient-medical-records.component';

@NgModule({
  declarations: [
    // List all components that are part of this PatientModule
    PatientDashboardLayoutComponent,
    PatientDashboardHomeComponent,
    PatientProfileComponent,
    PatientAppointmentsComponent,
    PatientBookAppointmentComponent,
    PatientMedicalRecordsComponent
  ],
  imports: [
    CommonModule,
    PatientRoutingModule,
    ReactiveFormsModule, // Add if your patient components use reactive forms
    FormsModule,         // Add if your patient components use template-driven forms
    SharedModule         // Import SharedModule if it provides common elements used here
  ]
  // No need to export components if they are only used within this module's routing
})
export class PatientModule { }