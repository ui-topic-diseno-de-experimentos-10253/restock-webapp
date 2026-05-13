import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionsCardsComponent } from './subscriptions-cards.component';

describe('SubscriptionsCardsComponent', () => {
  let component: SubscriptionsCardsComponent;
  let fixture: ComponentFixture<SubscriptionsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionsCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionsCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
