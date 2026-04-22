import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {Profile} from '../../model/profile.entity';
import {ProfileService} from '../../services/profile.service';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-personal-data-settings',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    FormsModule,
    TranslatePipe,
  ],
  templateUrl: './personal-data-settings.component.html',
  styleUrl: './personal-data-settings.component.css'
})
export class PersonalDataSettingsComponent implements OnChanges {
  @Input() profile: Profile = new Profile();

  localProfile: Profile = new Profile();

  @Output() profileUpdated: EventEmitter<Profile> = new EventEmitter<Profile>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile'] && changes['profile'].currentValue) {
      this.localProfile = {
        ...changes['profile'].currentValue
      };
    }
  }

  onSaveChanges() {

    this.profileUpdated.emit(this.localProfile);

  }
}
