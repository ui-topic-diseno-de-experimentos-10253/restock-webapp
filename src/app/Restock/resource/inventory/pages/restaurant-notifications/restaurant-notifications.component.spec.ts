import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantNotificationsComponent } from './restaurant-notifications.component';

describe('RestaurantNotificationsComponent', () => {
  let component: RestaurantNotificationsComponent;
  let fixture: ComponentFixture<RestaurantNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
