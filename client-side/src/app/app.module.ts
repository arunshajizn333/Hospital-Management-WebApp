import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { PublicNavbarComponent } from './components/layout/public-navbar/public-navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { LoginComponent } from './components/auth/login/login.component';
import { PatientRegisterComponent } from './components/auth/patient-register/patient-register.component';
import { HomeComponent } from './components/public/home/home.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CallbackFormComponent } from './components/public/callback-form/callback-form.component'; // Import this
import { ReactiveFormsModule } from '@angular/forms';
import { ContactInfoComponent } from './components/public/contact-info/contact-info.component';
import { TestimonialsComponent } from './components/public/testimonials/testimonials.component';
import { DepartmentListPageComponent } from './components/public/department-list-page/department-list-page.component';

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
   
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    ReactiveFormsModule
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
