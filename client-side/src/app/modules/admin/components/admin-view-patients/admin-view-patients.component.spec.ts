import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewPatientsComponent } from './admin-view-patients.component';

describe('AdminViewPatientsComponent', () => {
  let component: AdminViewPatientsComponent;
  let fixture: ComponentFixture<AdminViewPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminViewPatientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminViewPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
