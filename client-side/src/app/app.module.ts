import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay  } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { PublicNavbarComponent } from './components/layout/public-navbar/public-navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { LoginComponent } from './components/auth/login/login.component';
import { PatientRegisterComponent } from './components/auth/patient-register/patient-register.component';
import { HomeComponent } from './components/public/home/home.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi  } from '@angular/common/http';
import { CallbackFormComponent } from './components/public/callback-form/callback-form.component'; // Import this
import { ReactiveFormsModule } from '@angular/forms';
import { ContactInfoComponent } from './components/public/contact-info/contact-info.component';
import { TestimonialsComponent } from './components/public/testimonials/testimonials.component';
import { DepartmentListPageComponent } from './components/public/department-list-page/department-list-page.component';
import { FeaturedDoctorsComponent } from './components/public/featured-doctors/featured-doctors.component';
import { HospitalInfoSnippetComponent } from './components/public/hospital-info-snippet/hospital-info-snippet.component';
import { DoctorLoginComponent } from './components/auth/doctor-login/doctor-login.component';
import { AdminLoginComponent } from './components/auth/admin-login/admin-login.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { CommonModule } from '@angular/common';
import { HttpLoadingInterceptor } from './core/interceptors/http-loading.interceptor';
import { DelayInterceptor } from './core/interceptors/delay.interceptor';


@NgModule({
  declarations: [
    AppComponent,
    PublicNavbarComponent,
    FooterComponent,
    LoginComponent,
    PatientRegisterComponent,
    HomeComponent,
    CallbackFormComponent,
    ContactInfoComponent,
    TestimonialsComponent,
    DepartmentListPageComponent,
    FeaturedDoctorsComponent,
    HospitalInfoSnippetComponent,
    DoctorLoginComponent,
    AdminLoginComponent,
  ],
  imports: [
   CommonModule,
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    ReactiveFormsModule,
   
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    // Provide the AuthInterceptor,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpLoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: DelayInterceptor, multi: true }

   
  ],
  
  bootstrap: [AppComponent]
})
export class AppModule { }
