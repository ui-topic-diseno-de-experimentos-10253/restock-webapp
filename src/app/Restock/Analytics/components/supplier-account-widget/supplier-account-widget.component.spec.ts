import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierAccountWidgetComponent } from './supplier-account-widget.component';

describe('SupplierAccountWidgetComponent', () => {
  let component: SupplierAccountWidgetComponent;
  let fixture: ComponentFixture<SupplierAccountWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierAccountWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierAccountWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
