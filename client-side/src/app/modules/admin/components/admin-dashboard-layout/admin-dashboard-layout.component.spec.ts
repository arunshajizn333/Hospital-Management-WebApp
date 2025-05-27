import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardLayoutComponent } from './admin-dashboard-layout.component';

describe('AdminDashboardLayoutComponent', () => {
  let component: AdminDashboardLayoutComponent;
  let fixture: ComponentFixture<AdminDashboardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminDashboardLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
