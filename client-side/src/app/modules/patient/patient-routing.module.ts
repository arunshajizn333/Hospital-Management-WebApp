import { NgModule } from '@angular/core'; // ENSURE THIS IMPORT IS PRESENT
import { RouterModule, Routes } from '@angular/router';

import { PatientDashboardLayoutComponent } from './components/patient-dashboard-layout/patient-dashboard-layout.component';
import { PatientDashboardHomeComponent } from './components/patient-dashboard-home/patient-dashboard-home.component';
import { PatientProfileComponent } from './components/patient-profile/patient-profile.component';
import { PatientAppointmentsComponent } from './components/patient-appointments/patient-appointments.component';
import { PatientBookAppointmentComponent } from './components/patient-book-appointment/patient-book-appointment.component';
import { PatientMedicalRecordsComponent } from './components/patient-medical-records/patient-medical-records.component';

import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { ChangePasswordComponent } from '../../shared/components/change-password/change-password.component';

const routes: Routes = [
  {
    path: '', // This path is relative to '/patient' from app-routing.module.ts
    component: PatientDashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard], // Protects this whole section
    data: { role: 'patient' },          // Specifies that only 'patient' role can access
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' }, // Default to overview
      { path: 'overview', component: PatientDashboardHomeComponent },
      { path: 'profile', component: PatientProfileComponent },
      { path: 'appointments', component: PatientAppointmentsComponent },
      { path: 'book-appointment', component: PatientBookAppointmentComponent },
      { path: 'medical-records', component: PatientMedicalRecordsComponent },
      { path: 'change-password', component: ChangePasswordComponent }
      // Add other patient-specific child routes here
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }