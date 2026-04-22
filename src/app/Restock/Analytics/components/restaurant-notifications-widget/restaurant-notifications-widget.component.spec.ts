import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantNotificationsWidgetComponent } from './restaurant-notifications-widget.component';

describe('RestaurantNotificationsWidgetComponent', () => {
  let component: RestaurantNotificationsWidgetComponent;
  let fixture: ComponentFixture<RestaurantNotificationsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantNotificationsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantNotificationsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
