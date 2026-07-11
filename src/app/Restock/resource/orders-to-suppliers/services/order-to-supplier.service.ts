import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, firstValueFrom, map, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { OrderToSupplier } from '../model/order-to-supplier.entity';
import { OrderToSupplierBatch } from '../model/order-to-supplier-batch.entity';
import {
  CreateOrderRequest,
  UpdateOrderStateRequest
} from '../model/create-order-request';

interface OrdersCacheEntry {
  expiresAt: number;
  stream: Observable<OrderToSupplier[]>;
}

@Injectable({ providedIn: 'root' })
export class OrderToSupplierService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.serverBaseUrlBackend;
  private readonly endpoint = '/orders';
  private readonly cacheTtlMs = 30_000;
  private readonly restaurantCache = new Map<number, OrdersCacheEntry>();
  private readonly supplierCache = new Map<number, OrdersCacheEntry>();
  private allOrdersCache?: OrdersCacheEntry;

  create(payload: CreateOrderRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}`, payload).pipe(
      tap(() => this.invalidateCache())
    );
  }

  getByRestaurant(adminRestaurantId: number, force = false): Observable<OrderToSupplier[]> {
    const cached = this.restaurantCache.get(adminRestaurantId);
    if (!force && cached && cached.expiresAt > Date.now()) return cached.stream;

    const stream = this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/admin-restaurant/${adminRestaurantId}`)
      .pipe(
        map(response => this.extractArray(response)),
        map(items => items.map(item => this.toEntity(item))),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(error => {
          this.restaurantCache.delete(adminRestaurantId);
          return throwError(() => error);
        })
      );

    this.restaurantCache.set(adminRestaurantId, {
      expiresAt: Date.now() + this.cacheTtlMs,
      stream
    });
    return stream;
  }

  getBySupplier(supplierId: number, force = false): Observable<OrderToSupplier[]> {
    const cached = this.supplierCache.get(supplierId);
    if (!force && cached && cached.expiresAt > Date.now()) return cached.stream;

    const stream = this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/supplier/${supplierId}`)
      .pipe(
        map(response => this.extractArray(response)),
        map(items => items.map(item => this.toEntity(item))),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(error => {
          this.supplierCache.delete(supplierId);
          return throwError(() => error);
        })
      );

    this.supplierCache.set(supplierId, {
      expiresAt: Date.now() + this.cacheTtlMs,
      stream
    });
    return stream;
  }

  updateState(orderId: number, state: UpdateOrderStateRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}${this.endpoint}/${orderId}/state`, state).pipe(
      tap(() => this.invalidateCache())
    );
  }

  async getAllOrders(force = false): Promise<OrderToSupplier[]> {
    if (!force && this.allOrdersCache && this.allOrdersCache.expiresAt > Date.now()) {
      return firstValueFrom(this.allOrdersCache.stream);
    }

    const stream = this.http.get<any[]>(`${this.baseUrl}${this.endpoint}`).pipe(
      map(response => this.extractArray(response)),
      map(items => items.map(item => this.toEntity(item))),
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError(error => {
        this.allOrdersCache = undefined;
        return throwError(() => error);
      })
    );

    this.allOrdersCache = {
      expiresAt: Date.now() + this.cacheTtlMs,
      stream
    };
    return firstValueFrom(stream);
  }

  getAllEnriched(force = false): Promise<OrderToSupplier[]> {
    return this.getAllOrders(force);
  }

  getOrderById(id: number): Promise<OrderToSupplier> {
    return firstValueFrom(
      this.http.get<any>(`${this.baseUrl}${this.endpoint}/${id}`).pipe(
        map(item => this.toEntity(item))
      )
    );
  }

  getByQuery(field: string, value: string | number): Observable<OrderToSupplier[]> {
    return this.getAllOrdersStream().pipe(
      map(items => items.filter(item => (item as any)[field] === value))
    );
  }

  async updateOrder(id: number, order: OrderToSupplier): Promise<OrderToSupplier> {
    const updated = await firstValueFrom(
      this.http.put<any>(`${this.baseUrl}${this.endpoint}/${id}`, order).pipe(
        map(item => this.toEntity(item))
      )
    );
    this.invalidateCache();
    return updated;
  }

  async createOrder(order: CreateOrderRequest): Promise<OrderToSupplier> {
    const created = await firstValueFrom(
      this.create(order).pipe(map(item => this.toEntity(item)))
    );
    return created;
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${this.endpoint}/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  invalidateCache(): void {
    this.restaurantCache.clear();
    this.supplierCache.clear();
    this.allOrdersCache = undefined;
  }

  private getAllOrdersStream(): Observable<OrderToSupplier[]> {
    if (this.allOrdersCache && this.allOrdersCache.expiresAt > Date.now()) {
      return this.allOrdersCache.stream;
    }

    const stream = this.http.get<any[]>(`${this.baseUrl}${this.endpoint}`).pipe(
      map(response => this.extractArray(response)),
      map(items => items.map(item => this.toEntity(item))),
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError(error => {
        this.allOrdersCache = undefined;
        return throwError(() => error);
      })
    );
    this.allOrdersCache = { expiresAt: Date.now() + this.cacheTtlMs, stream };
    return stream;
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
      state: { id: stateId, name: stateName } as any,
      situation: { id: situationId, name: situationName } as any
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
