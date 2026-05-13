import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { OrderToSupplier } from '../model/order-to-supplier.entity';
import { OrderToSupplierBatch } from '../model/order-to-supplier-batch.entity';
import {
  CreateOrderRequest,
  UpdateOrderStateRequest
} from '../model/create-order-request';

@Injectable({ providedIn: 'root' })
export class OrderToSupplierService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.serverBaseUrlBackend;
  private readonly endpoint = '/orders';

  create(payload: CreateOrderRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}`, payload);
  }

  getByRestaurant(adminRestaurantId: number): Observable<OrderToSupplier[]> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/admin-restaurant/${adminRestaurantId}`)
      .pipe(
        map(response => this.extractArray(response)),
        map(items => items.map(item => this.toEntity(item)))
      );
  }

  getBySupplier(supplierId: number): Observable<OrderToSupplier[]> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/supplier/${supplierId}`)
      .pipe(
        map(response => this.extractArray(response)),
        map(items => items.map(item => this.toEntity(item)))
      );
  }

  updateState(orderId: number, state: UpdateOrderStateRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}${this.endpoint}/${orderId}/state`, state);
  }

  getAllOrders(): Promise<OrderToSupplier[]> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>(`${this.baseUrl}${this.endpoint}`)
        .pipe(
          map(response => this.extractArray(response)),
          map(items => items.map(item => this.toEntity(item)))
        )
        .subscribe({
          next: resolve,
          error: reject
        });
    });
  }

  // Legacy method kept for existing widgets/components.
  getAllEnriched(): Promise<OrderToSupplier[]> {
    return this.getAllOrders();
  }

  getOrderById(id: number): Promise<OrderToSupplier> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${this.baseUrl}${this.endpoint}/${id}`)
        .pipe(map(item => this.toEntity(item)))
        .subscribe({
          next: resolve,
          error: reject
        });
    });
  }

  // Legacy query-style API used by some widgets.
  getByQuery(field: string, value: string | number): Observable<OrderToSupplier[]> {
    return this.http.get<any[]>(`${this.baseUrl}${this.endpoint}`).pipe(
      map(response => this.extractArray(response)),
      map(items => items.map(item => this.toEntity(item))),
      map(items => items.filter(item => (item as any)[field] === value))
    );
  }

  updateOrder(id: number, order: OrderToSupplier): Promise<OrderToSupplier> {
    return new Promise((resolve, reject) => {
      this.http.put<any>(`${this.baseUrl}${this.endpoint}/${id}`, order)
        .pipe(map(item => this.toEntity(item)))
        .subscribe({
          next: resolve,
          error: reject
        });
    });
  }

  createOrder(order: CreateOrderRequest): Promise<OrderToSupplier> {
    return new Promise((resolve, reject) => {
      this.create(order).pipe(map(item => this.toEntity(item))).subscribe({
        next: resolve,
        error: reject
      });
    });
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${this.endpoint}/${id}`);
  }

  private toEntity(raw: any): OrderToSupplier {
    const rawBatches = Array.isArray(raw?.batchItems)
      ? raw.batchItems
      : (Array.isArray(raw?.batches) ? raw.batches : []);
    const orderBatches = rawBatches.map((batch: any) => new OrderToSupplierBatch({
      batch_id: Number(batch.batchId ?? batch.batch_id ?? 0),
      quantity: Number(batch.quantity ?? 0),
      accepted: Boolean(batch.accept ?? batch.accepted ?? false),
      batch: this.mapBatch(batch.batch)
    }));

    const stateName = this.normalizeEnumLabel(raw.state ?? raw.stateName ?? raw.orderState);
    const situationName = this.normalizeEnumLabel(raw.situation ?? raw.situationName ?? raw.orderSituation);
    const stateId = Number(raw.stateId ?? raw.order_to_supplier_state_id ?? 0);
    const situationId = Number(raw.situationId ?? raw.order_to_supplier_situation_id ?? 0);

    return new OrderToSupplier({
      id: Number(raw.id ?? 0),
      date: raw.date ?? null,
      description: raw.description ?? null,
      admin_restaurant_id: Number(raw.adminRestaurantId ?? raw.admin_restaurant_id ?? 0),
      supplier_id: Number(raw.supplierId ?? raw.supplier_id ?? 0),
      order_to_supplier_state_id: stateId,
      order_to_supplier_situation_id: situationId,
      totalPrice: Number(raw.totalPrice ?? raw.total_price ?? 0),
      estimated_ship_date: raw.estimatedShipDate ?? raw.estimated_ship_date ?? null,
      estimated_ship_time: raw.estimatedShipTime ?? raw.estimated_ship_time ?? null,
      requested_products_count: Number(raw.requestedProductsCount ?? raw.requested_products_count ?? orderBatches.length),
      partially_accepted: Boolean(raw.partiallyAccepted ?? raw.partially_accepted ?? false),
      orderBatches,
      state: {
        id: stateId,
        name: stateName
      } as any,
      situation: {
        id: situationId,
        name: situationName
      } as any
    });
  }

  private extractArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.value)) return response.value;
    return [];
  }

  private normalizeEnumLabel(value: any): string {
    if (!value || typeof value !== 'string') return '';
    return value
      .toLowerCase()
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private mapBatch(rawBatch: any): any | undefined {
    if (!rawBatch) return undefined;
    const customSupply = rawBatch.customSupply;
    const catalogSupply = customSupply?.supply;
    return {
      id: Number(rawBatch.id ?? 0),
      customSupplyId: Number(rawBatch.customSupplyId ?? customSupply?.id ?? 0),
      stock: Number(rawBatch.stock ?? 0),
      expiration_date: rawBatch.expirationDate ?? rawBatch.expiration_date ?? null,
      user_id: Number(rawBatch.userId ?? rawBatch.user_id ?? 0),
      supply: {
        id: customSupply?.id ?? null,
        supplyId: catalogSupply?.id ?? null,
        user_id: customSupply?.userId ?? rawBatch.userId ?? null,
        name: catalogSupply?.name ?? 'Unknown supply',
        description: customSupply?.description ?? catalogSupply?.description ?? '',
        perishable: Boolean(catalogSupply?.perishable ?? false),
        min_stock: Number(customSupply?.minStock ?? 0),
        max_stock: Number(customSupply?.maxStock ?? 0),
        price: Number(customSupply?.price ?? 0),
        category: catalogSupply?.category ?? '',
        unit_abbreviation: customSupply?.unitAbbreviaton ?? customSupply?.unitAbbreviation ?? ''
      }
    };
  }
}
