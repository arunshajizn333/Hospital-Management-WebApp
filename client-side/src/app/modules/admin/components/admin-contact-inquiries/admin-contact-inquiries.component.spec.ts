import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminContactInquiriesComponent } from './admin-contact-inquiries.component';

describe('AdminContactInquiriesComponent', () => {
  let component: AdminContactInquiriesComponent;
  let fixture: ComponentFixture<AdminContactInquiriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminContactInquiriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminContactInquiriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
