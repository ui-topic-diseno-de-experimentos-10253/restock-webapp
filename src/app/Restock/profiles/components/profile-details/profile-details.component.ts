import {Component, Input} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../model/profile.entity';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-profile-details',
  imports: [MatCardModule,
    MatIconModule, MatChipsModule, TranslatePipe],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.css'
})
export class ProfileDetailsComponent {
  @Input() profile: Profile = new Profile();
  @Input() categories: string[] = [];

  constructor() {

  }
}
