import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorAvailabilityManagementComponent } from './doctor-availability-management.component';

describe('DoctorAvailabilityManagementComponent', () => {
  let component: DoctorAvailabilityManagementComponent;
  let fixture: ComponentFixture<DoctorAvailabilityManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DoctorAvailabilityManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorAvailabilityManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
