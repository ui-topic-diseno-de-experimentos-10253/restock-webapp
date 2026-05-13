import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import {mockRestaurantAlerts} from '../../../../../shared/mocks/alerts.mock';
import {MatCardModule} from '@angular/material/card';
import {TranslatePipe} from '@ngx-translate/core';
import {BatchService} from '../../services/batch.service';
import {SupplyService} from '../../services/supply.service';
import {OrderToSupplierService} from '../../../orders-to-suppliers/services/order-to-supplier.service';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {MatListModule} from '@angular/material/list';


@Component({
  selector: 'app-restaurant-notifications',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, MatCardModule, TranslatePipe, MatTabGroup, MatTabsModule, MatListModule],
  templateUrl: './restaurant-notifications.component.html',
  styleUrls: ['./restaurant-notifications.component.css']
})
export class RestaurantNotificationsComponent implements OnInit {
  private readonly batchService = inject(BatchService);
  private readonly orderService = inject(OrderToSupplierService);

  notifications: Array<{ type: 'Inventory' | 'Order'; message: string; updatedAt: string; }> = [];

  async ngOnInit(): Promise<void> {
    await this.loadStockNotifications();
    await this.loadOrderNotifications();
  }

  private async loadStockNotifications(): Promise<void> {
    const batches = await this.batchService.getAllBatchesWithSupplies();
    const now = new Date();

    const stockNotifications = batches
      .filter(b => b.supply)
      .filter(b => b.stock <= (b.supply?.min_stock ?? 0) || b.stock >= (b.supply?.max_stock ?? Infinity))
      .map(b => ({
        type: 'Inventory' as const,
        message: `${b.supply!.name} at ${b.supply!.category ?? ''} ` +
          (b.stock <= b.supply!.min_stock ? 'has low stock ' : 'reached max stock '),
        updatedAt: this.relativeTime(now, b.expiration_date)
      }));

    this.notifications.push(...stockNotifications);
  }

  private async loadOrderNotifications(): Promise<void> {
    const orders = await this.orderService.getAllEnriched();
    const now = new Date();

    orders.forEach(order => {
      if (order.situation && order.situation.name && order.situation.name.toLowerCase() !== 'pending') {
        this.notifications.push({
          type: 'Order',
          message: `Order #${order.id} situation updated to ${order.situation.name} `,
          updatedAt: this.relativeTime(now, order.date)
        });
      }
      if (order.state && order.state.name && order.state.name.toLowerCase() === 'delivered') {
        this.notifications.push({
          type: 'Order',
          message: `Order #${order.id} was delivered `,
          updatedAt: this.relativeTime(now, order.estimated_ship_date ?? order.date)
        });
      }
    });
  }

  private relativeTime(now: Date, from?: Date | string | null): string {
    if (!from) return 'Just now';
    const fromDate = new Date(from);
    const diffMs = now.getTime() - fromDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  get inventoryNotifications() {
    return this.notifications.filter(n => n.type === 'Inventory');
  }

  get orderNotifications() {
    return this.notifications.filter(n => n.type === 'Order');
  }
}
