import { Component, OnInit } from '@angular/core'; // Make sure Component is imported
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { PublicDataService } from '../../../../core/services/public-data.service';
import { Doctor, DoctorsApiResponse, DailyAvailability, BreakTime, DateOverride, AdminDoctorPayload, DayOfWeek } from '../../../../shared/models/doctor.model'; // Import all
import { Department } from '../../../../shared/models/department.model';
import { Observable } from 'rxjs'; // <<< ADD THIS

@Component({
  selector: 'app-admin-manage-doctors',
  standalone: false,
  templateUrl: './admin-manage-doctors.component.html',
  styleUrl: './admin-manage-doctors.component.css'
})
export class AdminManageDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  departments: Department[] = [];

  isLoadingDoctors = true;
  isLoadingDepartments = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  doctorForm!: FormGroup;
  isEditMode = false;
  editingDoctorId: string | null = null;
  showDoctorForm = false;
  isSubmitting = false; // Added missing property

  currentPage = 1;
  itemsPerPage = 10;
  totalDoctors = 0;
  totalPages = 0;

  filterForm!: FormGroup;
  daysOfWeek: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private publicDataService: PublicDataService
  ) { }

  ngOnInit(): void {
    this.initFilterForm();
    this.initDoctorForm(); // Initialize an empty form structure
    this.loadDoctors();
    this.loadDepartmentsForDropdown();

    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadDoctors();
    });
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      name: [''],
      specialization: [''],
      departmentId: ['']
    });
  }

  initDoctorForm(doctor?: Doctor | null): void {
    this.isEditMode = !!doctor; // Set edit mode based on if doctor data is passed
    this.editingDoctorId = doctor?._id || null;

    this.doctorForm = this.fb.group({
      name: [doctor?.name || '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: [doctor?.email || '', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]], // Required only on create
      specialization: [doctor?.specialization || '', [Validators.required, Validators.maxLength(100)]],
      department: [doctor?.department ? (typeof doctor.department === 'object' ? doctor.department._id : doctor.department) : null, [Validators.required]],
      phone: [doctor?.phone || '', [Validators.pattern(/^\+?[0-9\s\-()]{7,20}$/)]],
      photoUrl: [doctor?.photoUrl || ''],
      publicBio: [doctor?.publicBio || '', [Validators.maxLength(1000)]],
      isFeatured: [doctor?.isFeatured || false],
      role: [doctor?.role || 'doctor', Validators.required],
      availabilitySchedule: this.fb.array(
        this.daysOfWeek.map(day => {
          const sched = doctor?.availabilitySchedule?.find(s => s.dayOfWeek === day);
          return this.createDailyAvailabilityGroup(sched || { dayOfWeek: day, isAvailable: false });
        })
      ),
      availabilityOverrides: this.fb.array(
        (doctor?.availabilityOverrides || []).map(override => this.createDateOverrideGroup(override))
      )
    });

    // Initial setup for dynamic fields based on isAvailable
    this.doctorFormAvailabilitySchedule.controls.forEach(dayGroup => {
        const isAvailableControl = dayGroup.get('isAvailable');
        this.toggleTimeFields(dayGroup as FormGroup, isAvailableControl?.value); // Initial setup
        isAvailableControl?.valueChanges.subscribe(isAvailable => {
            this.toggleTimeFields(dayGroup as FormGroup, isAvailable);
        });
    });
    (this.doctorFormAvailabilityOverrides.controls as FormGroup[]).forEach(overrideGroup => {
        const isAvailableControl = overrideGroup.get('isAvailable');
        this.toggleTimeFields(overrideGroup, isAvailableControl?.value); // Initial setup
        isAvailableControl?.valueChanges.subscribe(isAvailable => {
            this.toggleTimeFields(overrideGroup, isAvailable);
        });
    });
  }

  get doctorFormAvailabilitySchedule(): FormArray {
    return this.doctorForm.get('availabilitySchedule') as FormArray;
  }
  get doctorFormAvailabilityOverrides(): FormArray {
    return this.doctorForm.get('availabilityOverrides') as FormArray;
  }

  createDailyAvailabilityGroup(daySchedule?: Partial<DailyAvailability>): FormGroup {
    return this.fb.group({
      dayOfWeek: [daySchedule?.dayOfWeek || '', Validators.required],
      isAvailable: [daySchedule?.isAvailable || false],
      startTime: [daySchedule?.startTime || '', this.timeFormatValidatorIfAvailable],
      endTime: [daySchedule?.endTime || '', this.timeFormatValidatorIfAvailable],
      slotDurationMinutes: [daySchedule?.slotDurationMinutes || null, [Validators.min(1)]],
      breakTimes: this.fb.array((daySchedule?.breakTimes || []).map((bt: Partial<BreakTime>) => this.createBreakTimeGroup(bt)))
    }, { validator: this.endTimeAfterStartTimeValidator('startTime', 'endTime') });
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
      isAvailable: [override?.isAvailable !== undefined ? override.isAvailable : true],
      startTime: [override?.startTime || '', this.timeFormatValidatorIfAvailable],
      endTime: [override?.endTime || '', this.timeFormatValidatorIfAvailable],
      slotDurationMinutes: [override?.slotDurationMinutes || null, [Validators.min(1)]],
      breakTimes: this.fb.array((override?.breakTimes || []).map((bt: Partial<BreakTime>) => this.createBreakTimeGroup(bt)))
    }, { validator: this.endTimeAfterStartTimeValidator('startTime', 'endTime') });

    const isAvailableControl = overrideFormGroup.get('isAvailable');
    // Ensure toggle is set up after control is part of a form group
    setTimeout(() => { // Defer to ensure controls are established
      this.toggleTimeFields(overrideFormGroup, isAvailableControl?.value);
      isAvailableControl?.valueChanges.subscribe(isAvailable => {
          this.toggleTimeFields(overrideFormGroup, isAvailable);
      });
    });
    return overrideFormGroup;
  }

  getDoctorFormBreakTimes(scheduleGroup: AbstractControl): FormArray { return scheduleGroup.get('breakTimes') as FormArray; }
  addDoctorFormBreakTime(scheduleGroup: AbstractControl): void { this.getDoctorFormBreakTimes(scheduleGroup).push(this.createBreakTimeGroup()); }
  removeDoctorFormBreakTime(scheduleGroup: AbstractControl, index: number): void { this.getDoctorFormBreakTimes(scheduleGroup).removeAt(index); }
  addDoctorFormDateOverride(): void { this.doctorFormAvailabilityOverrides.push(this.createDateOverrideGroup()); }
  removeDoctorFormDateOverride(index: number): void { this.doctorFormAvailabilityOverrides.removeAt(index); }

  loadDoctors(): void {
    this.isLoadingDoctors = true;
    this.errorMessage = null;
    const filters = this.filterForm.value;
    this.adminService.getDoctors(this.currentPage, this.itemsPerPage, filters.name, filters.specialization, filters.departmentId)
      .subscribe({
        next: (response: DoctorsApiResponse) => {
          this.doctors = response.doctors || [];
          this.totalDoctors = response.total || 0;
          this.totalPages = response.totalPages || 0;
          this.isLoadingDoctors = false;
        },
        error: (err: Error) => {
          this.errorMessage = err.message || "Could not load doctors.";
          this.isLoadingDoctors = false;
        }
      });
  }

  loadDepartmentsForDropdown(): void {
    this.isLoadingDepartments = true;
    this.publicDataService.getDepartments().subscribe({
      next: (data: Department[]) => {
        this.departments = data;
        this.isLoadingDepartments = false;
      },
      error: (err: Error) => {
        console.error('Error fetching departments for form:', err);
        this.isLoadingDepartments = false;
      }
    });
  }

  openAddDoctorModal(): void {
    this.isEditMode = false;
    this.editingDoctorId = null;
    this.initDoctorForm();
    this.doctorForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.doctorForm.get('password')?.updateValueAndValidity();
    this.successMessage = null;
    this.errorMessage = null; // Clear form-specific error
    this.showDoctorForm = true;
  }

  openEditDoctorModal(doctor: Doctor): void {
    this.isEditMode = true;
    this.editingDoctorId = doctor._id;
    this.initDoctorForm(doctor);
    this.doctorForm.get('password')?.clearValidators(); // Password not edited here
    this.doctorForm.get('password')?.setValue(''); // Clear password field for edit mode
    this.doctorForm.get('password')?.updateValueAndValidity();
    this.successMessage = null;
    this.errorMessage = null; // Clear form-specific error
    this.showDoctorForm = true;
  }

  closeDoctorFormModal(): void {
    this.showDoctorForm = false;
    this.editingDoctorId = null;
    this.isEditMode = false;
  }

  onDoctorFormSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      this.errorMessage = "Please correct the errors in the form.";
      console.log("Doctor Form Invalid:", this.doctorForm.value);
      console.log("Doctor Form Errors:", this.doctorForm.errors);
      // Log errors for each control
      Object.keys(this.doctorForm.controls).forEach(key => {
        const controlErrors = this.doctorForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('Key control: ' + key + ', errors: ' + JSON.stringify(controlErrors));
        }
      });
      return;
    }

     this.isSubmitting = true;
    const formValues = this.doctorForm.getRawValue(); 

    const payload: AdminDoctorPayload = { // Ensure AdminDoctorPayload interface matches all these fields
      name: formValues.name,
      email: formValues.email, // Make sure backend doesn't try to change this if it's unique and not meant to be updated
      specialization: formValues.specialization,
      phone: formValues.phone,
      department: formValues.department, // This should be the departmentId string
      photoUrl: formValues.photoUrl,
      publicBio: formValues.publicBio,
      isFeatured: formValues.isFeatured,
      role: formValues.role,
      availabilitySchedule: formValues.availabilitySchedule.map((day: DailyAvailability) => ({
        ...day,
        // Ensure undefined is handled by backend if isAvailable is false
        startTime: day.isAvailable ? day.startTime : undefined,
        endTime: day.isAvailable ? day.endTime : undefined,
        slotDurationMinutes: day.isAvailable ? day.slotDurationMinutes : undefined,
        breakTimes: day.isAvailable ? (day.breakTimes || []) : []
      })),
      availabilityOverrides: formValues.availabilityOverrides.map((override: DateOverride) => ({
        ...override,
        date: new Date(override.date).toISOString(), // Good: ensure ISO string
        startTime: override.isAvailable ? override.startTime : undefined,
        endTime: override.isAvailable ? override.endTime : undefined,
        slotDurationMinutes: override.isAvailable ? override.slotDurationMinutes : undefined,
        breakTimes: override.isAvailable ? (override.breakTimes || []) : []
      }))
    };
    if (!this.isEditMode && formValues.password) {
      payload.password = formValues.password;
    }

    const operation: Observable<Doctor> = this.isEditMode && this.editingDoctorId
      ? this.adminService.updateDoctor(this.editingDoctorId, payload)
      : this.adminService.createDoctor(payload);

    operation.subscribe({
      next: (responseDoctor: Doctor) => {
        this.isSubmitting = false;
        this.successMessage = `Doctor ${this.isEditMode ? 'updated' : 'created'} successfully!`;
        this.closeDoctorFormModal();
        this.loadDoctors();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err: Error) => {
        this.errorMessage = err.message || `Failed to ${this.isEditMode ? 'update' : 'create'} doctor.`;
        this.isSubmitting = false;
      }
    });
  }

  confirmDeleteDoctor(doctorId: string): void {
    if (confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      this.deleteDoctor(doctorId);
    }
  }

  deleteDoctor(doctorId: string): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.adminService.deleteDoctor(doctorId).subscribe({
      next: () => {
        this.successMessage = 'Doctor deleted successfully.';
        this.loadDoctors();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'Failed to delete doctor.';
      }
    });
  }

  // Added missing methods for template
  onSearch(): void {
    this.currentPage = 1;
    this.loadDoctors();
  }
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDoctors();
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadDoctors();
    }
  }
  getDepartmentName(department: Department | string | undefined): string {
    if (department && typeof department === 'object' && department.name) {
      return department.name;
    }
    return 'N/A';
  }

  timeFormatValidatorIfAvailable(control: AbstractControl): { [key: string]: any } | null {
    const parentGroup = control.parent as FormGroup;
    if (parentGroup && !parentGroup.get('isAvailable')?.value && !control.value) {
        return null;
    }
    if (parentGroup && parentGroup.get('isAvailable')?.value) {
      if (!control.value && (parentGroup.get('startTime') === control || parentGroup.get('endTime') === control || parentGroup.get('slotDurationMinutes') === control )) {
        if (parentGroup.get('slotDurationMinutes') === control && (control.value === null || control.value === undefined || control.value === '')) {
           return { 'requiredIfAvailable': true };
        } else if (parentGroup.get('slotDurationMinutes') !== control && !control.value) {
           return { 'requiredIfAvailable': true };
        }
      }
      if (control.value && (parentGroup.get('startTime') === control || parentGroup.get('endTime') === control) && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(control.value)) {
        return { 'invalidTimeFormat': true };
      }
      if(parentGroup.get('slotDurationMinutes') === control && control.value !== null && control.value !== undefined && Number(control.value) < 1){
          return { 'min': true };
      }
    }
    return null;
  }

  timeFormatValidator(control: AbstractControl): { [key: string]: any } | null {
    if (control.value && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(control.value)) {
      return { 'invalidTimeFormat': true };
    }
    return null;
  }

  endTimeAfterStartTimeValidator(startTimeField: string = 'startTime', endTimeField: string = 'endTime') {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const formGroup = group as FormGroup;
      const startControl = formGroup.get(startTimeField);
      const endControl = formGroup.get(endTimeField);

      if (!startControl || !endControl) return null;
      
      // Only validate if isAvailable is true (for weekly schedule and overrides)
      // or if both time fields have values (for breaks)
      const isAvailableControl = formGroup.get('isAvailable');
      if (isAvailableControl && !isAvailableControl.value && (startTimeField === 'startTime')) {
          this.clearTimeValidators(formGroup, ['startTime', 'endTime', 'slotDurationMinutes']);
          return null;
      }

      if (!startControl.value || !endControl.value) return null; // Don't validate if either is missing

      const startMinutes = this.timeStringToMinutes(startControl.value);
      const endMinutes = this.timeStringToMinutes(endControl.value);

      if (isNaN(startMinutes) || isNaN(endMinutes)) return null;

      if (endMinutes <= startMinutes) {
        endControl.setErrors({ ...endControl.errors, 'endTimeBeforeStartTime': true });
        return { 'endTimeBeforeStartTime': true };
      }
      if(endControl.hasError('endTimeBeforeStartTime')) {
        const errors = { ...endControl.errors }; // Create a new object for errors
        delete errors['endTimeBeforeStartTime'];
        endControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return null;
    };
  }

  private timeStringToMinutes(timeStr: string): number {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return NaN;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private clearTimeValidators(group: FormGroup, fieldNames: string[]): void {
    fieldNames.forEach(fieldName => {
        const control = group.get(fieldName);
        if(control) {
            control.setErrors(null);
            // control.clearValidators(); // This removes ALL validators, be careful
            // control.setValidators(null); // Or set to null to remove specific conditional ones
            // control.updateValueAndValidity();
        }
    });
  }

  toggleTimeFields(group: FormGroup, isAvailable: boolean): void {
    const fieldsToToggle = ['startTime', 'endTime', 'slotDurationMinutes'];
    fieldsToToggle.forEach(fieldName => {
      const control = group.get(fieldName);
      if (control) {
        if (isAvailable) {
          control.enable();
          // Re-apply validators as they might have been cleared
          if (fieldName === 'slotDurationMinutes') {
            control.setValidators([Validators.required, Validators.min(1)]);
          } else { // startTime, endTime
            control.setValidators([Validators.required, this.timeFormatValidator]);
          }
        } else {
          control.disable();
          control.reset(''); // Reset value to empty string
          control.clearValidators(); // Clear all validators
        }
        control.updateValueAndValidity();
      }
    });
    const breakTimesArray = group.get('breakTimes') as FormArray;
    if (breakTimesArray) {
        if (isAvailable) {
            breakTimesArray.enable();
             // Re-apply validators to break time controls if needed
            breakTimesArray.controls.forEach(breakGroup => {
                breakGroup.get('breakStart')?.setValidators([Validators.required, this.timeFormatValidator]);
                breakGroup.get('breakEnd')?.setValidators([Validators.required, this.timeFormatValidator]);
                breakGroup.get('breakStart')?.updateValueAndValidity();
                breakGroup.get('breakEnd')?.updateValueAndValidity();
            });
        } else {
            breakTimesArray.disable();
            breakTimesArray.controls.forEach(breakGroup => {
                breakGroup.get('breakStart')?.clearValidators();
                breakGroup.get('breakStart')?.updateValueAndValidity();
                breakGroup.get('breakEnd')?.clearValidators();
                breakGroup.get('breakEnd')?.updateValueAndValidity();
            });
        }
    }
  }

  getDoctorFormScheduleControls() { return (this.doctorForm.get('availabilitySchedule') as FormArray).controls; }
  getDoctorFormOverrideControls() { return (this.doctorForm.get('availabilityOverrides') as FormArray).controls; }
}