import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDataSettingsComponent } from './personal-data-settings.component';

describe('PersonalDataSettingsComponent', () => {
  let component: PersonalDataSettingsComponent;
  let fixture: ComponentFixture<PersonalDataSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalDataSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalDataSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
