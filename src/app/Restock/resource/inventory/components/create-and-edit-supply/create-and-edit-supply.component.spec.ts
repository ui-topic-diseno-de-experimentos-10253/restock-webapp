import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAndEditSupplyComponent } from './create-and-edit-supply.component';

describe('CreateAndEditSupplyComponent', () => {
  let component: CreateAndEditSupplyComponent;
  let fixture: ComponentFixture<CreateAndEditSupplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAndEditSupplyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAndEditSupplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
