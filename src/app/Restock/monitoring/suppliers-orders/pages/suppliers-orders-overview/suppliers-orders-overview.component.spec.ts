import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliersOrdersOverviewComponent } from './suppliers-orders-overview.component';

describe('SuppliersOrdersOverviewComponent', () => {
  let component: SuppliersOrdersOverviewComponent;
  let fixture: ComponentFixture<SuppliersOrdersOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliersOrdersOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliersOrdersOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
