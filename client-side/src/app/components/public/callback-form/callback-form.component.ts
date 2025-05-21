// src/app/components/public/callback-form/callback-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CallbackRequestData } from '../../../shared/models/callback-request.model'; // Adjust path
import { PublicDataService } from '../../../core/services/public-data.service';

@Component({
  selector: 'app-callback-form',
  standalone: false,
  templateUrl: './callback-form.component.html',
  styleUrl: './callback-form.component.css'
})
export class CallbackFormComponent implements OnInit {
  callbackForm!: FormGroup; // Use definite assignment assertion
  isSubmitting = false;
  submitSuccessMessage: string | null = null;
  submitErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private publicDataService: PublicDataService
  ) { }

  ngOnInit(): void {
    this.callbackForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{7,20}$/)]], // Basic phone pattern
      preferredTime: ['', [Validators.maxLength(50)]],
      reason: ['', [Validators.maxLength(500)]]
    });
  }

  // Getter for easy access to form controls in the template
  get f() { return this.callbackForm.controls; }

  onSubmit(): void {
    this.submitSuccessMessage = null;
    this.submitErrorMessage = null;

    if (this.callbackForm.invalid) {
      this.callbackForm.markAllAsTouched(); // Mark all fields as touched to display errors
      return;
    }

    this.isSubmitting = true;
    const formData: CallbackRequestData = this.callbackForm.value;

    this.publicDataService.submitCallbackRequest(formData).subscribe({
      next: (response) => {
        this.submitSuccessMessage = response.message;
        this.isSubmitting = false;
        this.callbackForm.reset();
        // Optionally, you can clear validators or reset form state further if needed
        // Object.keys(this.callbackForm.controls).forEach(key => {
        //   this.callbackForm.get(key)?.setErrors(null) ;
        // });
      },
      error: (error) => {
        console.error('Error submitting callback request:', error);
        this.submitErrorMessage = error.message || 'Failed to submit callback request. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
