import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Often needed

@NgModule({
  declarations: [
    // Shared components, directives, pipes will be declared AND exported here
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
    ReactiveFormsModule
    // (And then also export your shared components, directives, pipes once created)
  ]
})
export class SharedModule { }