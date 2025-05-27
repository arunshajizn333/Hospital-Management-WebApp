import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHospitalSettingsComponent } from './admin-hospital-settings.component';

describe('AdminHospitalSettingsComponent', () => {
  let component: AdminHospitalSettingsComponent;
  let fixture: ComponentFixture<AdminHospitalSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminHospitalSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHospitalSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
