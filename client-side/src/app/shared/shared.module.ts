import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './components/change-password/change-password.component'; // Often needed

@NgModule({
  declarations: [
    // Shared components, directives, pipes will be declared AND exported here
  
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // Import if you use template-driven forms
    ReactiveFormsModule // Import if you use reactive forms
  ],
  exports: [
    // Export shared components, directives, pipes, AND common Angular modules like FormsModule
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChangePasswordComponent
    // (And then also export your shared components, directives, pipes once created)
  ]
})
export class SharedModule { }