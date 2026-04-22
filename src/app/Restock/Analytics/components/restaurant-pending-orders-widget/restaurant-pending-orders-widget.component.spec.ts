import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantPendingOrdersWidgetComponent } from './restaurant-pending-orders-widget.component';

describe('RestaurantPendingOrdersWidgetComponent', () => {
  let component: RestaurantPendingOrdersWidgetComponent;
  let fixture: ComponentFixture<RestaurantPendingOrdersWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantPendingOrdersWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantPendingOrdersWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
