import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
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
  refreshTrigger: number = 0;

  constructor(
    private profileService: ProfileService,
    private userService: UserService,
    private businessService: BusinessService,
    private snackBar: MatSnackBar,
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      const userId = this.sessionService.getUserId();
      if (!userId) throw new Error('Missing session user id');
      
      const [rawProfile, user] = await Promise.all([
        firstValueFrom(this.profileService.loadProfileByUserId(userId)),
        this.userService.getUserById(userId)
      ]);
      
      // Create a new object to force change detection
      this.profile = JSON.parse(JSON.stringify(rawProfile));
      this.sessionService.setProfileId(this.profile.id);

      this.user = user;
      // No need to load business separately - it's already in the profile
      this.business = this.profile.business || new Business();
      
      this.profile = JSON.parse(JSON.stringify({
        ...this.profile,
        user: this.user,
        business: this.business
      }));
      this.categoriesArray = this.profile.business?.categories?.split(',').map(cat => cat.trim()) || [];
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
      return;
    }

    const userId = this.sessionService.getUserId();
    if (!userId) {
      this.invalidUpdate('Failed to update profile - no user ID');
      return;
    }

    try {
      const payload = {
        firstName: profile.name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        country: profile.country,
        avatar: profile.avatar || ''
      };
      
      await this.profileService.updatePersonal(userId, payload).toPromise();
      
      // Force a new object reference to ensure change detection
      const newProfile = await firstValueFrom(this.profileService.loadProfileByUserId(userId));
      this.profile = JSON.parse(JSON.stringify(newProfile));
      
      this.refreshTrigger++;
      
      // Force change detection
      this.cdr.detectChanges();
      
      this.successfulUpdate('Successful personal data update');
    } catch (error) {
      console.error('Error updating profile:', error);
      this.invalidUpdate('Failed to update profile');
    }

  }

  async updateProfileAndBusiness(business: Business) {
    console.log('DEBUG updateProfileAndBusiness - business:', business);
    console.log('DEBUG updateProfileAndBusiness - profile.business:', this.profile.business);

    // Check if we have a business to update (no need to check business_id since it's not in the API response)
    if (this.profile.business || business.name || business.address)
    {
      const userId = this.sessionService.getUserId();
      console.log('DEBUG updateProfileAndBusiness - userId:', userId);
      
      if (!userId) {
        this.invalidUpdate('Failed to update business data - no user ID');
        return;
      }

      try {
        const payload = {
          businessName: business.name,
          businessAddress: business.address,
          description: business.description || ''
        };
        console.log('DEBUG updateProfileAndBusiness - payload:', payload);
        
        await this.profileService.updateBusiness(userId, payload).toPromise();
        console.log('DEBUG updateProfileAndBusiness - update successful');
        
        // Force a new object reference to ensure change detection
        const newProfile = await firstValueFrom(this.profileService.loadProfileByUserId(userId));
        console.log('DEBUG updateProfileAndBusiness - newProfile:', newProfile);
        this.profile = JSON.parse(JSON.stringify(newProfile));
        
        this.refreshTrigger++;
        console.log('DEBUG updateProfileAndBusiness - refreshTrigger:', this.refreshTrigger);
        
        // Force change detection
        this.cdr.detectChanges();
        
        this.successfulUpdate('Successful business data update');
      } catch (error) {
        console.error('Error updating business/profile:', error);
        this.invalidUpdate('Failed to update business data');
      }
    }
    else
    {
      this.invalidUpdate('Failed to update business data - no business data');

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
