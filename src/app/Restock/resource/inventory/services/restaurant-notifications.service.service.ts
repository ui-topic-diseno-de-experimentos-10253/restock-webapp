import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, from, map } from 'rxjs';
import { OrderToSupplierService } from '../../orders-to-suppliers/services/order-to-supplier.service';
import { InventoryDataService } from './inventory-data.service';
import { SessionService } from '../../../../shared/services/session.service';

export interface AlertNotification {
  ingredient: string;
  status: string;
  tone: 'danger' | 'warning' | 'success' | 'info';
}

export interface RestaurantSummaryAlerts {
  inventory: AlertNotification[];
  orders: AlertNotification[];
}

@Injectable({ providedIn: 'root' })
export class RestaurantNotificationsService {
  private readonly inventoryData = inject(InventoryDataService);
  private readonly orderService = inject(OrderToSupplierService);
  private readonly session = inject(SessionService);
  private pendingRequest?: Promise<RestaurantSummaryAlerts>;
  private expiresAt = 0;
  private readonly cacheTtlMs = 30_000;

  loadSummary(force = false): Promise<RestaurantSummaryAlerts> {
    if (!force && this.pendingRequest && this.expiresAt > Date.now()) return this.pendingRequest;

    const userId = this.session.getUserId();
    if (!userId) return Promise.resolve({ inventory: [], orders: [] });

    this.pendingRequest = Promise.all([
      this.inventoryData.load(userId),
      firstValueFrom(this.orderService.getByRestaurant(userId))
    ]).then(([inventorySnapshot, orders]) => {
      const inventory = inventorySnapshot.batches
        .filter(batch => batch.supply)
        .filter(batch =>
          batch.stock <= (batch.supply?.min_stock ?? 0) ||
          batch.stock >= (batch.supply?.max_stock ?? Number.POSITIVE_INFINITY)
        )
        .map(batch => {
          const isLowStock = batch.stock <= (batch.supply?.min_stock ?? 0);
          return {
            ingredient: batch.supply?.name ?? '',
            status: isLowStock ? 'Low stock' : 'Maximum stock',
            tone: isLowStock ? 'danger' as const : 'warning' as const
          };
        })
        .slice(0, 8);

      const orderAlerts = orders
        .filter(order => {
          const situation = order.situation?.name?.toLowerCase();
          const state = order.state?.name?.toLowerCase();
          return Boolean((situation && situation !== 'pending') || state === 'delivered');
        })
        .map(order => {
          const delivered = order.state?.name?.toLowerCase() === 'delivered';
          return {
            ingredient: `#${order.id}`,
            status: delivered ? 'Delivered' : (order.situation?.name || order.state?.name || 'Updated'),
            tone: delivered ? 'success' as const : 'info' as const
          };
        })
        .slice(0, 8);

      return { inventory, orders: orderAlerts };
    }).catch(error => {
      this.pendingRequest = undefined;
      this.expiresAt = 0;
      throw error;
    });

    this.expiresAt = Date.now() + this.cacheTtlMs;
    return this.pendingRequest;
  }

  getInventoryAlerts(): Observable<AlertNotification[]> {
    return from(this.loadSummary()).pipe(map(summary => summary.inventory));
  }

  getOrderAlerts(): Observable<AlertNotification[]> {
    return from(this.loadSummary()).pipe(map(summary => summary.orders));
  }

  invalidate(): void {
    this.pendingRequest = undefined;
    this.expiresAt = 0;
  }
}
