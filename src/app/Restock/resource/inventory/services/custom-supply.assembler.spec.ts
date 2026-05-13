import { TestBed } from '@angular/core/testing';

import { CustomSupplyAssembler } from './custom-supply.assembler';

describe('CustomSupplyAssemblerService', () => {
  let service: CustomSupplyAssembler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomSupplyAssembler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
