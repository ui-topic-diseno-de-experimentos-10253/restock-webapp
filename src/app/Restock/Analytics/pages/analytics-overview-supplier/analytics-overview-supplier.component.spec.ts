import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsOverviewSupplierComponent } from './analytics-overview-supplier.component';

describe('AnalyticsOverviewComponent', () => {
  let component: AnalyticsOverviewSupplierComponent;
  let fixture: ComponentFixture<AnalyticsOverviewSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsOverviewSupplierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsOverviewSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
