// src/app/modules/doctor/doctor-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorDashboardLayoutComponent } from './components/doctor-dashboard-layout/doctor-dashboard-layout.component';

// Import Guards
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

// Import the new doctor dashboard components
import { DoctorDashboardHomeComponent } from './components/doctor-dashboard-home/doctor-dashboard-home.component';
import { DoctorProfileComponent } from './components/doctor-profile/doctor-profile.component';
import { DoctorAvailabilityManagementComponent } from './components/doctor-availability-management/doctor-availability-management.component';
import { DoctorAppointmentsComponent } from './components/doctor-appointments/doctor-appointments.component';
import { DoctorPatientListComponent } from './components/doctor-patient-list/doctor-patient-list.component';
import { DoctorPatientRecordComponent } from './components/doctor-patient-record/doctor-patient-record.component';


const routes: Routes = [
  {
    path: '', // Relative to '/doctor' (defined in app-routing.module.ts)
    component: DoctorDashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'doctor' },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' }, // Default child route
      { path: 'overview', component: DoctorDashboardHomeComponent },
      { path: 'profile', component: DoctorProfileComponent },
      { path: 'availability', component: DoctorAvailabilityManagementComponent },
      { path: 'appointments', component: DoctorAppointmentsComponent }, // Manages doctor's own appointments
      { path: 'my-patients', component: DoctorPatientListComponent }, // List/search patients
      // Route for viewing/editing a specific patient's record, often a child of my-patients or needs an ID
      { path: 'my-patients/:patientId/records', component: DoctorPatientRecordComponent },
      // Add more child routes as needed
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorRoutingModule { }