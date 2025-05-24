import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { DoctorService, DoctorAvailabilityResponse, UpdateDoctorAvailabilityPayload } from '../../services/doctor.service'; // Adjust path
import { DailyAvailability, DateOverride, BreakTime, } from '../../../../shared/models/doctor.model'; // Adjust path

type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
@Component({
  selector: 'app-doctor-availability-management',
  standalone: false,
  templateUrl: './doctor-availability-management.component.html',
  styleUrl: './doctor-availability-management.component.css'
})
export class DoctorAvailabilityManagementComponent implements OnInit {
  availabilityForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

daysOfWeek: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadDoctorAvailability();
  }
  // ...

  initForm(data?: DoctorAvailabilityResponse): void {
    this.availabilityForm = this.fb.group({
      availabilitySchedule: this.fb.array(
        this.daysOfWeek.map(day => this.createDailyAvailabilityGroup( // 'day' is now correctly typed
          data?.availabilitySchedule.find(s => s.dayOfWeek === day) || { dayOfWeek: day, isAvailable: false }
        ))
      ),
      availabilityOverrides: this.fb.array(
        (data?.availabilityOverrides || []).map(override => this.createDateOverrideGroup(override))
      )
    });

    // Add listeners to isAvailable checkboxes to enable/disable time fields
    this.availabilitySchedule.controls.forEach(dayGroup => {
      const isAvailableControl = dayGroup.get('isAvailable');
      isAvailableControl?.valueChanges.subscribe(isAvailable => {
        this.toggleTimeFields(dayGroup as FormGroup, isAvailable);
      });
      this.toggleTimeFields(dayGroup as FormGroup, isAvailableControl?.value); // Initial state
    });

    (this.availabilityOverrides.controls as FormGroup[]).forEach(overrideGroup => {
        const isAvailableControl = overrideGroup.get('isAvailable');
        isAvailableControl?.valueChanges.subscribe(isAvailable => {
            this.toggleTimeFields(overrideGroup, isAvailable);
        });
        this.toggleTimeFields(overrideGroup, isAvailableControl?.value); // Initial state
    });

  }

  // --- FormArray Getters ---
  get availabilitySchedule(): FormArray {
    return this.availabilityForm.get('availabilitySchedule') as FormArray;
  }

  get availabilityOverrides(): FormArray {
    return this.availabilityForm.get('availabilityOverrides') as FormArray;
  }

  // --- Create Form Groups ---
  createDailyAvailabilityGroup(daySchedule?: Partial<DailyAvailability>): FormGroup {
    return this.fb.group({
      dayOfWeek: [daySchedule?.dayOfWeek || '', Validators.required],
      isAvailable: [daySchedule?.isAvailable || false],
      startTime: [daySchedule?.startTime || '', this.timeFormatValidator],
      endTime: [daySchedule?.endTime || '', this.timeFormatValidator],
      slotDurationMinutes: [daySchedule?.slotDurationMinutes || null, Validators.min(1)],
      breakTimes: this.fb.array((daySchedule?.breakTimes || []).map(bt => this.createBreakTimeGroup(bt)))
    }, { validator: this.endTimeAfterStartTimeValidator });
  }

  createBreakTimeGroup(breakTime?: Partial<BreakTime>): FormGroup {
    return this.fb.group({
      breakStart: [breakTime?.breakStart || '', [Validators.required, this.timeFormatValidator]],
      breakEnd: [breakTime?.breakEnd || '', [Validators.required, this.timeFormatValidator]]
    }, { validator: this.endTimeAfterStartTimeValidator('breakStart', 'breakEnd') });
  }

  createDateOverrideGroup(override?: Partial<DateOverride>): FormGroup {
    const overrideFormGroup = this.fb.group({
      date: [override?.date ? new Date(override.date).toISOString().split('T')[0] : '', Validators.required],
      isAvailable: [override?.isAvailable !== undefined ? override.isAvailable : true], // Default to true for a new override
      startTime: [override?.startTime || '', this.timeFormatValidator],
      endTime: [override?.endTime || '', this.timeFormatValidator],
      slotDurationMinutes: [override?.slotDurationMinutes || null, Validators.min(1)],
      breakTimes: this.fb.array((override?.breakTimes || []).map(bt => this.createBreakTimeGroup(bt)))
    }, { validator: this.endTimeAfterStartTimeValidator });

    // Add listener for isAvailable on this new override group
    const isAvailableControl = overrideFormGroup.get('isAvailable');
    isAvailableControl?.valueChanges.subscribe(isAvailable => {
        this.toggleTimeFields(overrideFormGroup, isAvailable);
    });
    this.toggleTimeFields(overrideFormGroup, isAvailableControl?.value); // Initial state

    return overrideFormGroup;
  }

  // --- FormArray Manipulation for BreakTimes ---
  getBreakTimes(scheduleGroup: AbstractControl): FormArray {
    return scheduleGroup.get('breakTimes') as FormArray;
  }

  addBreakTime(scheduleGroup: AbstractControl): void {
    this.getBreakTimes(scheduleGroup).push(this.createBreakTimeGroup());
  }

  removeBreakTime(scheduleGroup: AbstractControl, index: number): void {
    this.getBreakTimes(scheduleGroup).removeAt(index);
  }

  // --- FormArray Manipulation for DateOverrides ---
  addDateOverride(): void {
    this.availabilityOverrides.push(this.createDateOverrideGroup());
  }

  removeDateOverride(index: number): void {
    this.availabilityOverrides.removeAt(index);
  }

  // --- Load Initial Data ---
  loadDoctorAvailability(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.doctorService.getMyAvailability().subscribe({
      next: (data) => {
        this.initForm(data); // Re-initialize form with fetched data
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Could not load your availability.';
        this.isLoading = false;
      }
    });
  }

  // --- Form Submission ---
  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.availabilityForm.invalid) {
      this.availabilityForm.markAllAsTouched();
      // It's good to scroll to the first invalid field or provide a summary of errors
      console.error("Form is invalid:", this.availabilityForm.errors, this.availabilityForm.value);
      this.errorMessage = "Please correct the errors in the form.";
      return;
    }

    this.isSubmitting = true;
    const payload: UpdateDoctorAvailabilityPayload = {
      availabilitySchedule: this.availabilityForm.value.availabilitySchedule.map((day: DailyAvailability) => ({
        ...day,
        // Conditionally include time fields only if isAvailable is true
        startTime: day.isAvailable ? day.startTime : undefined,
        endTime: day.isAvailable ? day.endTime : undefined,
        slotDurationMinutes: day.isAvailable ? day.slotDurationMinutes : undefined,
        breakTimes: day.isAvailable ? (day.breakTimes || []) : []
      })),
      availabilityOverrides: this.availabilityForm.value.availabilityOverrides.map((override: DateOverride) => ({
        ...override,
        date: new Date(override.date).toISOString(), // Ensure date is sent in a consistent format
        startTime: override.isAvailable ? override.startTime : undefined,
        endTime: override.isAvailable ? override.endTime : undefined,
        slotDurationMinutes: override.isAvailable ? override.slotDurationMinutes : undefined,
        breakTimes: override.isAvailable ? (override.breakTimes || []) : []
      }))
    };

    this.doctorService.updateMyAvailability(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Availability updated successfully!';
        // Re-initialize form with the potentially modified/cleaned data from backend (if service returns it)
        // Or simply mark as pristine if backend confirms the save of what was sent.
        this.initForm(response); // Assuming response is DoctorAvailabilityResponse
        this.availabilityForm.markAsPristine();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to update availability.';
        this.isSubmitting = false;
      }
    });
  }

  // --- Custom Validators ---
  timeFormatValidator(control: AbstractControl): { [key: string]: any } | null {
    if (control.parent && !control.parent.get('isAvailable')?.value && !control.value) {
        return null; // Not required if not available and empty
    }
    if (control.parent && control.parent.get('isAvailable')?.value && !control.value) {
        return { 'requiredIfAvailable': true }; // Required if available
    }
    if (control.value && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(control.value)) {
      return { 'invalidTimeFormat': true };
    }
    return null;
  }

  endTimeAfterStartTimeValidator(startTimeField: string = 'startTime', endTimeField: string = 'endTime') {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const startControl = group.get(startTimeField);
      const endControl = group.get(endTimeField);

      if (!startControl || !endControl || !startControl.value || !endControl.value) {
        return null; // Don't validate if either is missing (other validators will catch this)
      }
      
      // Only validate if isAvailable is true (for weekly schedule and overrides)
      const isAvailableControl = group.get('isAvailable');
      if (isAvailableControl && !isAvailableControl.value) {
          // Clear errors from time fields if not available
          startControl.setErrors(null);
          endControl.setErrors(null);
          // Also clear slotDurationMinutes if it exists
          group.get('slotDurationMinutes')?.setErrors(null);
          return null;
      }


      const startMinutes = this.timeStringToMinutes(startControl.value);
      const endMinutes = this.timeStringToMinutes(endControl.value);

      if (endMinutes <= startMinutes) {
        endControl.setErrors({ 'endTimeBeforeStartTime': true }); // Set error on end time control
        return { 'endTimeBeforeStartTime': true };
      }
      // Clear error if valid (important if error was set previously)
      if(endControl.hasError('endTimeBeforeStartTime')) {
        endControl.setErrors(null);
      }
      return null;
    };
  }

  // Helper to convert HH:MM to minutes for validation
  private timeStringToMinutes(timeStr: string): number {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return NaN;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper to enable/disable time/slot fields based on isAvailable
  toggleTimeFields(group: FormGroup, isAvailable: boolean): void {
    const fieldsToToggle = ['startTime', 'endTime', 'slotDurationMinutes'];
    fieldsToToggle.forEach(fieldName => {
      const control = group.get(fieldName);
      if (control) {
        if (isAvailable) {
          control.enable();
          // Add required validator if it's now available and it's a required field like startTime
          if (fieldName === 'startTime' || fieldName === 'endTime' || fieldName === 'slotDurationMinutes') {
              control.setValidators([Validators.required, this.timeFormatValidator]); // Add more validators as needed
              if(fieldName === 'slotDurationMinutes') control.setValidators([Validators.required, Validators.min(1)]);
          }
        } else {
          control.disable();
          control.reset(''); // Reset value when disabling
          control.clearValidators(); // Clear validators when not available
        }
        control.updateValueAndValidity();
      }
    });

    const breakTimesArray = group.get('breakTimes') as FormArray;
    if (breakTimesArray) {
        if(isAvailable) {
            breakTimesArray.enable();
        } else {
            breakTimesArray.disable();
            // breakTimesArray.clear(); // Optionally clear all breaks
        }
    }

  }
}