import {inject, Injectable} from '@angular/core';
import { BaseService } from '../../../../shared/services/base.service';
import { firstValueFrom } from 'rxjs';

import { OrderToSupplierBatch } from '../model/order-to-supplier-batch.entity';
import { OrderToSupplierBatchAssembler } from './order-to-supplier-batch.assembler';
import {BatchService} from '../../inventory/services/batch.service';

@Injectable({ providedIn: 'root' })
export class OrderToSupplierBatchService extends BaseService<OrderToSupplierBatch> {
  constructor() {
    super();
    this.resourceEndpoint = '/orders_to_supplier_batches';
  }

  private readonly batchService = inject(BatchService);

  // async getAllSupplies(): Promise<OrderToSupplierBatch[]> {
  //   const raw = await firstValueFrom(this.getAll());
  //   return raw.map(dto => OrderToSupplierBatchAssembler.toEntity(dto));
  // }

  async getAllSupplies(): Promise<OrderToSupplierBatch[]> {
    const [rawRelations, batches] = await Promise.all([
      firstValueFrom(super.getAll()),
      this.batchService.getAllBatchesWithSupplies()
    ]);

    return rawRelations.map(raw => {
      const batch = batches.find(b => Number(b.id) === Number(raw.batch_id));
      return OrderToSupplierBatchAssembler.toEntity(raw, batch);
    });
  }

  async getSupplyByOrder(orderId: number): Promise<OrderToSupplierBatch[]> {
    const raw = await firstValueFrom(this.getByQuery('order_to_supplier_id', orderId));
    return raw.map(dto => OrderToSupplierBatchAssembler.toEntity(dto));
  }

  async createSupply(supply: OrderToSupplierBatch): Promise<OrderToSupplierBatch> {
    const dto = OrderToSupplierBatchAssembler.toDTO(supply);
    const created = await firstValueFrom(this.create(dto));
    return OrderToSupplierBatchAssembler.toEntity(created);
  }
  async updateSupply(id: number, supply: OrderToSupplierBatch): Promise<OrderToSupplierBatch> {
    const dto = OrderToSupplierBatchAssembler.toDTO(supply);
    const updated = await firstValueFrom(this.update(id, dto));
    return OrderToSupplierBatchAssembler.toEntity(updated);
  }

  async deleteSupply(id: number): Promise<void> {
    await firstValueFrom(this.delete(id));
  }
}
