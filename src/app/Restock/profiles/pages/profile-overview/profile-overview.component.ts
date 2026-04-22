import {Component, OnInit} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {ProfileSettingsComponent} from '../../components/profile-settings/profile-settings.component';
import {ProfileDetailsComponent} from '../../components/profile-details/profile-details.component';
import {Profile} from '../../model/profile.entity';
import {User} from '../../../iam/model/user.entity';
import {Business} from '../../model/business.entity';
import {UserService} from '../../../iam/services/user.service';
import {ProfileService} from '../../services/profile.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BusinessService} from '../../services/business.service';
import {SessionService} from '../../../../shared/services/session.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile-overview',
  imports: [
    MatCard,
    ProfileSettingsComponent,
    ProfileDetailsComponent
  ],
  templateUrl: './profile-overview.component.html',
  styleUrl: './profile-overview.component.css'
})
export class ProfileOverviewComponent implements OnInit {

  profile: Profile = new Profile();
  user: User = new User();
  business: Business = new Business();

  categoriesArray: string[] = [];
  categoriesOptions: string[] = [ 'Fast Food', 'Fruits', 'Vegetables', 'Dairy', 'Pizzeria', 'Grid', 'Fitness', 'Bakery' ];

  constructor(
    private profileService: ProfileService,
    private userService: UserService,
    private businessService: BusinessService,
    private snackBar: MatSnackBar,
    private sessionService: SessionService,
  ) { }

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      const sessionProfileId = this.sessionService.getProfileId();
      if (sessionProfileId) {
        this.profile = await this.profileService.getProfileById(sessionProfileId);
      } else {
        const userId = this.sessionService.getUserId();
        if (!userId) throw new Error('Missing session user id');
        this.profile = await firstValueFrom(this.profileService.loadProfileByUserId(userId));
        this.sessionService.setProfileId(this.profile.id);
      }

      await this.loadUser();
      await this.loadBusiness();
      this.profile = {
        ...this.profile,
        user: this.user,
        business: this.business
      };
      this.categoriesArray = this.profile.business?.categories.split(',').map(cat => cat.trim()) || [];
      console.log('Profile loaded:', this.profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      this.invalidUpdate('Error loading profile data');
    }
  }

  async loadUser() {
    try {
      this.user = await this.userService.getUserById(this.profile.user_id);
      console.log('User loaded:', this.user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async loadBusiness() {
    try {
      this.business = await this.businessService.getBusinessById(this.profile.business_id);
      console.log('Business loaded:', this.business);
    } catch (error) {
      console.error('Error loading business:', error);
    }
  }

  async updateProfile(profile: Profile) {

    const noChanges =
      profile.name === this.profile.name &&
      profile.last_name === this.profile.last_name &&
      profile.email === this.profile.email &&
      profile.phone === this.profile.phone &&
      profile.address === this.profile.address &&
      profile.country === this.profile.country;

    if (noChanges) {
      this.invalidUpdate('No changes detected in profile');
      console.warn('No changes detected in profile. Update skipped.');
      return;
    }

    if(this.profile.id !== profile.id) {
      this.invalidUpdate('Failed to update profile');
      console.error('Profile ID mismatch. Cannot update profile with different ID.');
      return;
    }

    try {
      const payload = {
        ...profile,
        business: this.profile.business,
        user: this.profile.user
      } as Profile;
      await this.profileService.updateProfile(profile.id, payload);
      await this.loadProfile();
      this.successfulUpdate('Successful personal data update');
    } catch (error) {
      console.error('Error updating profile:', error);
      this.invalidUpdate('Failed to update profile');
    }

  }

  async updateProfileAndBusiness(business: Business) {

    if(this.profile.business_id == business.id)
    {
      const updatedProfile: Profile = {
        ...this.profile,
        business: business
      } as Profile;

      try {
        await this.businessService.updateBusiness(business.id, business);
        await this.profileService.updateProfile(updatedProfile.id, updatedProfile);
        await this.loadProfile();
        this.successfulUpdate('Successful business data update');
      } catch (error) {
        console.error('Error updating business/profile:', error);
        this.invalidUpdate('Failed to update business data');
      }
    }
    else
    {
      this.invalidUpdate('Failed to update business data');

      console.error('Business ID mismatch. Cannot update profile with different business ID.');
    }
  }

  async updateProfileAndUser(user: User) {

    if(this.profile.user_id == user.id)
    {
      try {
        await this.userService.updateUser(user.id, user);
        await this.loadProfile();
        this.successfulUpdate('Successful password update');
      } catch (error) {
        console.error('Error updating user password:', error);
        this.invalidUpdate('Failed to update password');
      }
    }
    else
    {
      this.invalidUpdate('Failed to update password');
      console.error('User ID mismatch. Cannot update profile with different user ID.');
    }
  }

  successfulUpdate(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  invalidUpdate(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-error']
    });
  }

}
