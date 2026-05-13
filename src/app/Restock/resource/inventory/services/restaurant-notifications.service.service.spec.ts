import { TestBed } from '@angular/core/testing';

import { RestaurantNotificationsService} from './restaurant-notifications.service.service';

describe('RestaurantNotificationsServiceService', () => {
  let service: RestaurantNotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestaurantNotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
