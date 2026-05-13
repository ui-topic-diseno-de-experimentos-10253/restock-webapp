import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAndEditFormComponent } from './create-and-edit-form.component';

describe('CreateAndEditFormComponent', () => {
  let component: CreateAndEditFormComponent;
  let fixture: ComponentFixture<CreateAndEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAndEditFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAndEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
