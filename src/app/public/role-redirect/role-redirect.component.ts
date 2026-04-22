import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../shared/services/session.service';


@Component({
    selector: 'app-role-redirect',
    standalone: true,
    imports: [CommonModule],
    template: `<p>Redirecting...</p>`,
})
export class RoleRedirectComponent {
    private readonly router = inject(Router);
    private readonly sessionService = inject(SessionService);

    constructor() {
        const roleId = this.sessionService.getRoleId();
        const token = localStorage.getItem('token');

        if (!token || roleId == null) {
            this.router.navigate(['/sign-in']);
            return;
        }

        if (roleId === 2) {
            this.router.navigate(['/dashboard/restaurant']);
        } else if (roleId === 1) {
            this.router.navigate(['/dashboard/supplier']);
        } else {
            this.router.navigate(['/sign-in']);
        }
    }
}