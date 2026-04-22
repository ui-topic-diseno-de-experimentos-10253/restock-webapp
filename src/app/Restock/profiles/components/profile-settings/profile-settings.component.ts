import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {SecuritySettingsComponent} from '../security-settings/security-settings.component';
import {PersonalDataSettingsComponent} from '../personal-data-settings/personal-data-settings.component';
import { MatCardContent, MatCardModule} from '@angular/material/card';
import {BusinessDataSettingsComponent} from '../business-data-settings/business-data-settings.component';
import {Profile} from '../../model/profile.entity';
import {Business} from '../../model/business.entity';
import {User} from '../../../iam/model/user.entity';
import {TranslatePipe} from '@ngx-translate/core';


@Component({
  selector: 'app-profile-settings',
  imports: [
    MatTabGroup,
    MatTabsModule,
    SecuritySettingsComponent,
    PersonalDataSettingsComponent,
    MatCardContent,
    MatCardModule,
    BusinessDataSettingsComponent,
    TranslatePipe
  ],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.css'
})
export class ProfileSettingsComponent {

  @Input() profile: Profile = new Profile();
  @Input() categories: string[] = [];
  @Input() categoriesOptions: string[] = [];

  @Output() profileUpdated: EventEmitter<Profile> = new EventEmitter<Profile>();
  @Output() profileAndBusinessUpdated: EventEmitter<Business> = new EventEmitter<Business>();
  @Output() profileAndUserUpdated: EventEmitter<User> = new EventEmitter<User>();
  constructor() {
  }

  onSaveChanges(profile: Profile) {
    this.profileUpdated.emit(profile);
  }

  onProfileAndBusinessChanges(business: Business) {
    this.profileAndBusinessUpdated.emit(business);
  }

  onProfileAndUserChanges(user: User) {
    this.profileAndUserUpdated.emit(user);
  }

}
