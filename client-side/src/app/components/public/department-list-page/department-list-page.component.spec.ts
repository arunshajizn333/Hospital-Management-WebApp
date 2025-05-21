import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentListPageComponent } from './department-list-page.component';

describe('DepartmentListPageComponent', () => {
  let component: DepartmentListPageComponent;
  let fixture: ComponentFixture<DepartmentListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepartmentListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
