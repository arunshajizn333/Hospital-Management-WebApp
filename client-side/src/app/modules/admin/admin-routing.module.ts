// src/app/modules/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardLayoutComponent } from './components/admin-dashboard-layout/admin-dashboard-layout.component';

// Import Guards
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

// Import the new admin dashboard components
import { AdminDashboardHomeComponent } from './components/admin-dashboard-home/admin-dashboard-home.component';
import { AdminManageDoctorsComponent } from './components/admin-manage-doctors/admin-manage-doctors.component';
import { AdminManageDepartmentsComponent } from './components/admin-manage-departments/admin-manage-departments.component';
import { AdminViewPatientsComponent } from './components/admin-view-patients/admin-view-patients.component';
import { AdminViewAppointmentsComponent } from './components/admin-view-appointments/admin-view-appointments.component';
import { AdminCallbackRequestsComponent } from './components/admin-callback-requests/admin-callback-requests.component';
import { AdminContactInquiriesComponent } from './components/admin-contact-inquiries/admin-contact-inquiries.component';
import { AdminHospitalSettingsComponent } from './components/admin-hospital-settings/admin-hospital-settings.component';

const routes: Routes = [
  {
    path: '', // Relative to '/admin' (defined in app-routing.module.ts)
    component: AdminDashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' }, // Default child route
      { path: 'overview', component: AdminDashboardHomeComponent },
      { path: 'manage-doctors', component: AdminManageDoctorsComponent },
      { path: 'manage-departments', component: AdminManageDepartmentsComponent },
      { path: 'view-patients', component: AdminViewPatientsComponent },
      { path: 'view-appointments', component: AdminViewAppointmentsComponent },
      { path: 'manage-callbacks', component: AdminCallbackRequestsComponent },
      { path: 'manage-inquiries', component: AdminContactInquiriesComponent },
      { path: 'hospital-settings', component: AdminHospitalSettingsComponent },
      // Add more admin-specific child routes here
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }