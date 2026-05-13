import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationService } from '../../../Restock/iam/services/authentication.service';
import { SessionService } from '../../../shared/services/session.service';

@Component({
  selector: 'app-navbar',
  imports: [
    MatIconModule,
    RouterLink,
    MatButtonModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService,
    private readonly sessionService: SessionService
  ) {}

  get profileRoute(): string[] {
    const roleId = this.sessionService.getRoleId();
    if (roleId === 1) return ['/dashboard/supplier/profile'];
    return ['/dashboard/restaurant/profile'];
  }

  onLogout(): void {
    this.authenticationService.signOut();
  }

}
