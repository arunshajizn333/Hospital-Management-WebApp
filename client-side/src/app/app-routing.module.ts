// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import the components we've created
import { HomeComponent } from './components/public/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { PatientRegisterComponent } from './components/auth/patient-register/patient-register.component';
import { DepartmentListPageComponent } from './components/public/department-list-page/department-list-page.component';
// We'll create and import a NotFoundComponent later for 404 pages
// import { NotFoundComponent } from './components/layout/not-found/not-found.component';

const routes: Routes = [
  // Publicly accessible routes
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full' // Ensures this route matches only the exact empty path
  },
  {
    path: 'home', // Optional explicit route to home
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register/patient', // Specific registration path for patients
    component: PatientRegisterComponent
  },

  // TODO: Add routes for departments, find-doctor, about-us, contact-us public pages later
  // Example:
  { path: 'departments', component: DepartmentListPageComponent },

  // TODO: Add authenticated routes for patient, doctor, and admin dashboards later
  // These will be protected by route guards.
  // Example for patient dashboard (will require PatientDashboardLayoutComponent and other child components):
  // {
  //   path: 'patient',
  //   // loadChildren: () => import('./modules/patient/patient.module').then(m => m.PatientModule), // If using feature modules
  //   // component: PatientDashboardLayoutComponent, // If not using feature modules for layout yet
  //   // canActivate: [AuthGuard, RoleGuard], data: { role: 'patient' }
  // },

  // Wildcard route for 404 Not Found - must be the last route
  // { path: '**', component: NotFoundComponent } // We'll create NotFoundComponent later
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }