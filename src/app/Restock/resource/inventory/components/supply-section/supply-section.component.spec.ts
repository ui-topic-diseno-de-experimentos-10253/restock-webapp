import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplySectionComponent } from './supply-section.component';

describe('SupplySectionComponent', () => {
  let component: SupplySectionComponent;
  let fixture: ComponentFixture<SupplySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplySectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
