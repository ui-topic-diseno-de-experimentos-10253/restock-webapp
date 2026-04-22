import { TestBed } from '@angular/core/testing';

import { SupplyServiceService } from './supply.service';

describe('SupplyServiceService', () => {
  let service: SupplyServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplyServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
