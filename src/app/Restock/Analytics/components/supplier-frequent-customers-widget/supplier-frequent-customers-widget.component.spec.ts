import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierFrequentCustomersWidgetComponent } from './supplier-frequent-customers-widget.component';

describe('SupplierFrequentCustomersWidgetComponent', () => {
  let component: SupplierFrequentCustomersWidgetComponent;
  let fixture: ComponentFixture<SupplierFrequentCustomersWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierFrequentCustomersWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierFrequentCustomersWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
