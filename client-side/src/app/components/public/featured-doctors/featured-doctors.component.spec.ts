import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedDoctorsComponent } from './featured-doctors.component';

describe('FeaturedDoctorsComponent', () => {
  let component: FeaturedDoctorsComponent;
  let fixture: ComponentFixture<FeaturedDoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeaturedDoctorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
