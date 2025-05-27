import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManageDepartmentsComponent } from './admin-manage-departments.component';

describe('AdminManageDepartmentsComponent', () => {
  let component: AdminManageDepartmentsComponent;
  let fixture: ComponentFixture<AdminManageDepartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminManageDepartmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManageDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
