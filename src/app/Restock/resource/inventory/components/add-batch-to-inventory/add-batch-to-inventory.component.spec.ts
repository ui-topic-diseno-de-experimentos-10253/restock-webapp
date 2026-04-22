import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBatchToInventoryComponent } from './add-batch-to-inventory.component';

describe('AddBatchToInventoryComponent', () => {
  let component: AddBatchToInventoryComponent;
  let fixture: ComponentFixture<AddBatchToInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBatchToInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBatchToInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
