import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManageDoctorsComponent } from './admin-manage-doctors.component';

describe('AdminManageDoctorsComponent', () => {
  let component: AdminManageDoctorsComponent;
  let fixture: ComponentFixture<AdminManageDoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminManageDoctorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManageDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
