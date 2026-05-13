import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  MatTableModule,
  MatTableDataSource,
} from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { OrderToSupplierService} from '../../../resource/orders-to-suppliers/services/order-to-supplier.service';
import { OrderSituationService} from '../../../resource/orders-to-suppliers/services/order-to-supplier-situation.service';
import { ProfileService} from '../../../profiles/services/profile.service';
import { UserService} from '../../../iam/services/user.service';

@Component({
  selector: 'app-supplier-notifications-widget',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    NgIf
  ],
  templateUrl: './supplier-notifications-widget.component.html',
  styleUrl: './supplier-notifications-widget.component.css',
})
export class SupplierNotificationsWidgetComponent implements OnInit, OnDestroy {
  alerts = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['restaurant', 'status', 'orderPlaced', 'details'];
  mobileColumns: string[] = ['restaurant', 'status'];
  isMobile = false;

  // Suplantación temporal del user logueado (supplier)
  user = { id: 1 }; // Cambia esto si tienes auth real

  private ordersService = inject(OrderToSupplierService);
  private situationService = inject(OrderSituationService);
  private profileService = inject(ProfileService);
  private userService = inject(UserService);

  ngOnInit() {
    this.checkViewport();
    window.addEventListener('resize', this.checkViewport.bind(this));
    this.loadAlerts();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.checkViewport.bind(this));
  }

  checkViewport(): void {
    this.isMobile = window.innerWidth <= 800;
  }

  getColumns(): string[] {
    return this.isMobile ? this.mobileColumns : this.displayedColumns;
  }

  private loadAlerts(): void {
    this.ordersService.getByQuery("supplier_id", this.user.id).subscribe(orders => {
      const enriched$ = orders.map(order =>
        this.userService.getByQuery("id", order.admin_restaurant_id).pipe(
          switchMap(userArr => {
            const user = userArr[0];
            if (!user) return of(null);

            return forkJoin({
              situation: this.situationService.getByQuery("id", order.order_to_supplier_situation_id),
              profile: this.profileService.getByQuery("user_id", user.id)
            }).pipe(
              map(({ situation, profile }) => {
                const orderDate = new Date(order.date ?? '');
                const now = new Date();
                const diffMs = now.getTime() - orderDate.getTime();
                const diffMins = Math.floor(diffMs / (1000 * 60));

                let elapsedTime = '';
                if (diffMins < 60) elapsedTime = `${diffMins} min ago`;
                else elapsedTime = `${Math.floor(diffMins / 60)} hr ago`;

                return {
                  restaurant: profile[0]?.business?.name || 'Unknown',
                  status: situation[0]?.name || 'Unknown',
                  orderPlaced: elapsedTime,
                };
              })
            );
          })
        )
      );

      forkJoin(enriched$).subscribe(results => {
        this.alerts.data = results.filter(r => r !== null);
      });
    });
  }
}
