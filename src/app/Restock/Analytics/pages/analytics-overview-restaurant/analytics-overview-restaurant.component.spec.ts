import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsOverviewRestaurantComponent } from './analytics-overview-restaurant.component';

describe('AnalyticsOverviewRestaurantComponent', () => {
  let component: AnalyticsOverviewRestaurantComponent;
  let fixture: ComponentFixture<AnalyticsOverviewRestaurantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsOverviewRestaurantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsOverviewRestaurantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
