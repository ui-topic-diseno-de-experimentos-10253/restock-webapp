import { ComponentFixture, TestBed } from '@angular/core/testing';
import {RestaurantRecipesOverviewComponent} from './restaurant-recipes-overview.component';

describe('RestaurantRecipesOverviewComponent', () => {
  let component: RestaurantRecipesOverviewComponent;
  let fixture: ComponentFixture<RestaurantRecipesOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantRecipesOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantRecipesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
