import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyCarouselComponent } from './supply-carousel.component';

describe('SupplyCarouselComponent', () => {
  let component: SupplyCarouselComponent;
  let fixture: ComponentFixture<SupplyCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplyCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplyCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
