import { TestBed } from '@angular/core/testing';

import { CustomSupplyService } from './custom-supply.service';

describe('CustomSupplyService', () => {
  let service: CustomSupplyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomSupplyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
