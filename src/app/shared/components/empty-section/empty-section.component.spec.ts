import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptySectionComponent } from './empty-section.component';

describe('EmptySectionComponent', () => {
  let component: EmptySectionComponent;
  let fixture: ComponentFixture<EmptySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptySectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
