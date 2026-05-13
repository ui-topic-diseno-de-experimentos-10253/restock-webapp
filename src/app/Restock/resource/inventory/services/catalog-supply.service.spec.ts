import { TestBed } from '@angular/core/testing';

import { CatalogSupplyService } from './catalog-supply.service';

describe('CatalogSupplyService', () => {
  let service: CatalogSupplyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogSupplyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
