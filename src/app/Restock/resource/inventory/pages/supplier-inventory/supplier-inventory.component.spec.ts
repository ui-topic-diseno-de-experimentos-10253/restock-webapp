import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierInventory } from './supplier-inventory.component';

describe('SupplierInventory', () => {
  let component: SupplierInventory;
  let fixture: ComponentFixture<SupplierInventory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierInventory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierInventory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
