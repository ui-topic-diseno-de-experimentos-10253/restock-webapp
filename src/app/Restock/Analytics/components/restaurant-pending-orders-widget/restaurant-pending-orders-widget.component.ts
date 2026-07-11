import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { OrderToSupplierService } from '../../../resource/orders-to-suppliers/services/order-to-supplier.service';
import { OrderToSupplier } from '../../../resource/orders-to-suppliers/model/order-to-supplier.entity';
import { SessionService } from '../../../../shared/services/session.service';

@Component({
  selector: 'app-restaurant-pending-orders-widget',
  standalone: true,
  imports: [CommonModule, MatIcon, MatIconButton, TranslateModule],
  templateUrl: './restaurant-pending-orders-widget.component.html',
  styleUrl: './restaurant-pending-orders-widget.component.css'
})
export class RestaurantPendingOrdersWidgetComponent implements OnInit {
  orders: OrderToSupplier[] = [];
  isLoading = true;
  hasError = false;

  constructor(
    private readonly orderService: OrderToSupplierService,
    private readonly router: Router,
    private readonly session: SessionService
  ) {}

  async ngOnInit(): Promise<void> {
    const restaurantId = this.session.getUserId();
    if (!restaurantId) {
      this.isLoading = false;
      this.hasError = true;
      return;
    }

    try {
      this.orders = await firstValueFrom(this.orderService.getByRestaurant(restaurantId));
    } catch (error) {
      console.error('Error loading restaurant orders summary:', error);
      this.hasError = true;
    } finally {
      this.isLoading = false;
    }
  }

  getSupplierName(supplierId: number): string {
    return `#${supplierId}`;
  }

  getStatus(order: OrderToSupplier): string {
    return order.state?.name || order.situation?.name || '—';
  }

  getStatusClass(order: OrderToSupplier): string {
    const status = this.getStatus(order).toLowerCase().replace(/\s+/g, '-');
    return `status-${status}`;
  }

  goToOrders(): void {
    this.router.navigate(['/dashboard/restaurant/orders']);
  }
}
