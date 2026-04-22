import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAndEditRecipeComponent } from './create-and-edit-recipe.component';

describe('CreateAndEditRecipeComponent', () => {
  let component: CreateAndEditRecipeComponent;
  let fixture: ComponentFixture<CreateAndEditRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAndEditRecipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAndEditRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
