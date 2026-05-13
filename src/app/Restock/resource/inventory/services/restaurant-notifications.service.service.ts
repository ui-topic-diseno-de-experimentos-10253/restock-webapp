import { Injectable, inject } from '@angular/core';
import { BatchService } from './batch.service';
import { OrderToSupplierService} from '../../orders-to-suppliers/services/order-to-supplier.service';
import { Observable, from, map, forkJoin } from 'rxjs';

export interface AlertNotification {
  ingredient: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class RestaurantNotificationsService {
  private readonly batchService = inject(BatchService);
  private readonly orderService = inject(OrderToSupplierService);

  getInventoryAlerts(): Observable<AlertNotification[]> {
    return from(this.batchService.getAllBatchesWithSupplies()).pipe(
      map(batches => {
        return batches
          .filter(b => b.supply)
          .filter(b => b.stock <= (b.supply?.min_stock ?? 0) || b.stock >= (b.supply?.max_stock ?? Infinity))
          .map(b => ({
            ingredient: `${b.supply!.name}`,
            status: b.stock <= b.supply!.min_stock ? 'Low stock' : 'Max stock'
          }));
      })
    );
  }

  getOrderAlerts(): Observable<AlertNotification[]> {
    return from(this.orderService.getAllEnriched()).pipe(
      map(orders =>
        orders
          .filter(o => {
            const sit = o.situation?.name?.toLowerCase();
            const state = o.state?.name?.toLowerCase();
            return sit && sit !== 'pending' || state === 'delivered';
          })
          .map(order => ({
            ingredient: `Order #${order.id}`,
            status: order.state?.name?.toLowerCase() === 'delivered'
              ? 'Delivered'
              : `Updated to ${order.situation?.name}`
          }))
      )
    );
  }
}
