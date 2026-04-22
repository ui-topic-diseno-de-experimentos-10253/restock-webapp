import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplySelectorComponent } from './supply-selector.component';

describe('SupplySelectorComponent', () => {
  let component: SupplySelectorComponent;
  let fixture: ComponentFixture<SupplySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplySelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
