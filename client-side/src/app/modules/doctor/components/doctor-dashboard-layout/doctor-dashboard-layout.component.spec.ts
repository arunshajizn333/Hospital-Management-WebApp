import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDashboardLayoutComponent } from './doctor-dashboard-layout.component';

describe('DoctorDashboardLayoutComponent', () => {
  let component: DoctorDashboardLayoutComponent;
  let fixture: ComponentFixture<DoctorDashboardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DoctorDashboardLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
