import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalInfoSnippetComponent } from './hospital-info-snippet.component';

describe('HospitalInfoSnippetComponent', () => {
  let component: HospitalInfoSnippetComponent;
  let fixture: ComponentFixture<HospitalInfoSnippetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HospitalInfoSnippetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalInfoSnippetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
