import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import {mockRestaurantAlerts} from '../../../../../shared/mocks/alerts.mock';
import {MatCardModule} from '@angular/material/card';
import {TranslatePipe} from '@ngx-translate/core';
import {SupplyService} from '../../services/supply.service';
import {OrderToSupplierService} from '../../../orders-to-suppliers/services/order-to-supplier.service';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {MatListModule} from '@angular/material/list';
import {InventoryDataService} from '../../services/inventory-data.service';
import {SessionService} from '../../../../../shared/services/session.service';


@Component({
  selector: 'app-restaurant-notifications',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, MatCardModule, TranslatePipe, MatTabGroup, MatTabsModule, MatListModule],
  templateUrl: './restaurant-notifications.component.html',
  styleUrls: ['./restaurant-notifications.component.css']
})
export class RestaurantNotificationsComponent implements OnInit {
  private readonly orderService = inject(OrderToSupplierService);
  private readonly inventoryData = inject(InventoryDataService);
  private readonly session = inject(SessionService);

  notifications: Array<{ type: 'Inventory' | 'Order'; message: string; updatedAt: string; }> = [];

  async ngOnInit(): Promise<void> {
    const [stock, orders] = await Promise.all([this.loadStockNotifications(), this.loadOrderNotifications()]);
    this.notifications = [...stock, ...orders];
  }

  private async loadStockNotifications(): Promise<Array<{type:'Inventory';message:string;updatedAt:string}>> {
    const userId = this.session.getUserId();
    if (userId == null) return [];
    const {batches} = await this.inventoryData.load(userId);
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

    return stockNotifications;
  }

  private async loadOrderNotifications(): Promise<Array<{type:'Order';message:string;updatedAt:string}>> {
    const orders = await this.orderService.getAllEnriched();
    const now = new Date();

    const notifications: Array<{type:'Order';message:string;updatedAt:string}> = [];
    orders.forEach(order => {
      if (order.situation && order.situation.name && order.situation.name.toLowerCase() !== 'pending') {
        notifications.push({
          type: 'Order',
          message: `Order #${order.id} situation updated to ${order.situation.name} `,
          updatedAt: this.relativeTime(now, order.date)
        });
      }
      if (order.state && order.state.name && order.state.name.toLowerCase() === 'delivered') {
        notifications.push({
          type: 'Order',
          message: `Order #${order.id} was delivered `,
          updatedAt: this.relativeTime(now, order.estimated_ship_date ?? order.date)
        });
      }
    });
    return notifications;
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
