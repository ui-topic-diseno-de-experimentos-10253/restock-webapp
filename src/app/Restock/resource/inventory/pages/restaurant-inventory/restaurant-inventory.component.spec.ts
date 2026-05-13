import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantInventoryComponent } from './restaurant-inventory.component';

describe('RestaurantInventoryComponent', () => {
  let component: RestaurantInventoryComponent;
  let fixture: ComponentFixture<RestaurantInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
