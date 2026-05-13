import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierNotificationsWidgetComponent } from './supplier-notifications-widget.component';

describe('SupplierNotificationsWidgetComponent', () => {
  let component: SupplierNotificationsWidgetComponent;
  let fixture: ComponentFixture<SupplierNotificationsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierNotificationsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierNotificationsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
