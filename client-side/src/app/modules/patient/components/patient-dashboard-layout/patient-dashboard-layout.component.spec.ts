import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDashboardLayoutComponent } from './patient-dashboard-layout.component';

describe('PatientDashboardLayoutComponent', () => {
  let component: PatientDashboardLayoutComponent;
  let fixture: ComponentFixture<PatientDashboardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientDashboardLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
