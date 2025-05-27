// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import necessary components for eager-loaded routes
import { HomeComponent } from './components/public/home/home.component';
import { DepartmentListPageComponent } from './components/public/department-list-page/department-list-page.component';
import { DoctorLoginComponent } from './components/auth/doctor-login/doctor-login.component';
import { AdminLoginComponent } from './components/auth/admin-login/admin-login.component';

// import { NotFoundComponent } from './components/layout/not-found/not-found.component';

// Define separate login page routes for Doctor and Admin
// import { DoctorLoginComponent } from './components/auth/doctor-login/doctor-login.component'; // Create this
// import { AdminLoginComponent } from './components/auth/admin-login/admin-login.component';   // Create this


const routes: Routes = [
  // Publicly accessible routes
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'departments', // Page listing all departments
    component: DepartmentListPageComponent
  },
  // Add other public page routes like /find-doctor, /about-us, /contact-us when components are ready

  // Authentication routes (Patient login/register are modals, these are for Doctor/Admin dedicated pages)
  // { path: 'doctor-login', component: DoctorLoginComponent },   // Create DoctorLoginComponent
  // { path: 'admin-login', component: AdminLoginComponent },     // Create AdminLoginComponent

  // Lazy-loaded feature modules for authenticated users
  {
    path: 'patient', // Base path for patient dashboard
    loadChildren: () => import('./modules/patient/patient.module').then(m => m.PatientModule)
    // AuthGuard and RoleGuard will be applied inside PatientRoutingModule or on this level if preferred
  },
   { path: 'doctor-login', component: DoctorLoginComponent },
   { path: 'admin-login', component: AdminLoginComponent },
  { path: 'doctor', loadChildren: () => import('./modules/doctor/doctor.module').then(m => m.DoctorModule) },
  { path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },
  // {
  //   path: 'doctor', // Base path for doctor dashboard
  //   loadChildren: () => import('./modules/doctor/doctor.module').then(m => m.DoctorModule) // Create DoctorModule later
  //   // canActivate: [AuthGuard, RoleGuard], data: { role: 'doctor' }
  // },
  // {
  //   path: 'admin', // Base path for admin dashboard
  //   loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) // Create AdminModule later
  //   // canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' }
  // },


  // Wildcard route for 404 Not Found - must be the last route
  // { path: '**', component: NotFoundComponent } // We'll create NotFoundComponent later
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }