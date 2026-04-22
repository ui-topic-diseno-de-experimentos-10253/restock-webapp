import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCustomSupplyComponent } from './create-custom-supply.component';

describe('CreateCustomSupplyComponent', () => {
  let component: CreateCustomSupplyComponent;
  let fixture: ComponentFixture<CreateCustomSupplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCustomSupplyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCustomSupplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
