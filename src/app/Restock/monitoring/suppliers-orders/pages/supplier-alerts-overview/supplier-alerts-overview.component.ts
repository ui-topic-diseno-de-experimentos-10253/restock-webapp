import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { OrderToSupplierService } from '../../../../resource/orders-to-suppliers/services/order-to-supplier.service';
import { OrderSituationService } from '../../../../resource/orders-to-suppliers/services/order-to-supplier-situation.service';
import { ProfileService } from '../../../../profiles/services/profile.service';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { UserService } from '../../../../iam/services/user.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-supplier-alerts-overview',
  imports: [
    MatTableModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './supplier-alerts-overview.component.html',
  styleUrl: './supplier-alerts-overview.component.css'
})
export class SupplierAlertsOverviewComponent implements OnInit {

  ngOnInit(): void {
    this.getAllOrdersOfSupplierID();
  }
  dataSource = new MatTableDataSource<any>([]);

  //user logueado simulado
  user = {
    "id": 1,
    "email": "pepe@gmail.com",
    "password": "password123",
    "role_id": 1, //1: supplier, 2: restaurant
    "subscription_id": 1,
    "start_date": "2023-01-01",
    "subscription_payment_details_id": 1
  };

  ordersOfSupplierLogueado: any[] = [];


  private ordersService: OrderToSupplierService = inject(OrderToSupplierService);
  private orderSituationService: OrderSituationService = inject(OrderSituationService);
  private profileService: ProfileService = inject(ProfileService);
  private userService: UserService = inject(UserService);


  private getAllOrdersOfSupplierID() {
    this.ordersService.getByQuery("supplier_id", this.user.id).subscribe(orders => {
      const enrichedOrders$ = orders.map(order =>
        this.userService.getByQuery("id", order.admin_restaurant_id).pipe(
          switchMap(userArr => {
            const user = userArr[0];
            if (!user) return of(null);

            return forkJoin({
              situation: this.orderSituationService.getByQuery("id", order.order_to_supplier_situation_id),
              profile: this.profileService.getByQuery("user_id", user.id)
            }).pipe(
              map(({ situation, profile }) => {
                const orderDate = new Date(order.date ?? '');
                const now = new Date();
                const diffMs = now.getTime() - orderDate.getTime();
                const diffMins = Math.floor(diffMs / (1000 * 60));

                let elapsedTime = '';
                if (diffMins < 60) {
                  elapsedTime = `${diffMins} min ago`;
                } else {
                  const diffHours = Math.floor(diffMins / 60);
                  elapsedTime = `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
                }

                return {
                  id: order.id,
                  date: order.date,
                  elapsedTime,
                  totalPrice: order.totalPrice,
                  situation: situation[0]?.name || 'Unknown',
                  restaurant: profile[0]?.business?.name || 'Unknown'
                };
              })

            );
          })
        )
      );
      //  { restaurant: 'El carbonazo', status: 'Ordering request', orderPlaced: '15 minutes ago' },

      forkJoin(enrichedOrders$).subscribe(finalOrders => {
        // filtramos por si hubo errores y retornó null
        this.dataSource.data = finalOrders.filter(o => o !== null);
        console.log('Órdenes enriquecidas con profile:', this.dataSource.data);
      });
    });
  }

  displayedColumns: string[] = ['restaurant', 'details', 'status', 'orderPlaced'];
}
