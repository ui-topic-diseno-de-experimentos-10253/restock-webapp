import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNewOrdersComponent } from './manage-new-orders.component';

describe('ManageNewOrdersComponent', () => {
  let component: ManageNewOrdersComponent;
  let fixture: ComponentFixture<ManageNewOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageNewOrdersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNewOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
