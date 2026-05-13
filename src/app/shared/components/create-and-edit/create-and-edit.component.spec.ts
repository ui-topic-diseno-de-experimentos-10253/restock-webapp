import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAndEditComponent } from './create-and-edit.component';

describe('CreateAndEditComponent', () => {
  let component: CreateAndEditComponent;
  let fixture: ComponentFixture<CreateAndEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAndEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAndEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
