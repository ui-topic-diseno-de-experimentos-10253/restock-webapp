import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatInput, MatLabel} from "@angular/material/input";
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {User} from '../../../iam/model/user.entity';
import {Profile} from '../../model/profile.entity';
import {Business} from '../../model/business.entity';
import {FormsModule} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-security-settings',
  imports: [
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatFormFieldModule,
    MatInput,
    MatLabel,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.css'
})
export class SecuritySettingsComponent {
  @Input() user: User = new User();

  hideCurrentPassword = true;
  hideNewPassword = true;
  hideNewPasswordConfirm = true;

  currentPassword = '';
  newPassword = '';
  newPasswordConfirm = '';

  @Output() profileAndUserUpdated: EventEmitter<User> = new EventEmitter<User>();

  constructor(private snackBar: MatSnackBar) {
  }

  onSaveChanges() {

    if (this.currentPassword !== this.user.password) {
      this.invalidUpdate('The current password is incorrect');
      return;
    }

    if (this.newPassword !== this.newPasswordConfirm) {
      this.invalidUpdate('The new passwords did not match');
      return;
    }

    if(this.newPassword === this.currentPassword) {
      this.invalidUpdate('The new password cannot be the same as the current password');
      return;
    }

    this.user.password = this.newPassword;
    const updatedUser = new User(this.user);
    this.profileAndUserUpdated.emit(updatedUser);
  }

  invalidUpdate(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-error']
    });
  }

}
