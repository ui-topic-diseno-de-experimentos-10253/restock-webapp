import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessDataSettingsComponent } from './business-data-settings.component';

describe('BusinessDataSettingsComponent', () => {
  let component: BusinessDataSettingsComponent;
  let fixture: ComponentFixture<BusinessDataSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessDataSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessDataSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
