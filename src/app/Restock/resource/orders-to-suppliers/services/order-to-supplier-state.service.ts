import { Injectable } from '@angular/core';
import { BaseService } from '../../../../shared/services/base.service';
import { firstValueFrom } from 'rxjs';

import { OrderToSupplierState } from '../model/order-to-supplier-state.entity';
import { OrderToSupplierStateAssembler } from './order-to-supplier-state.assembler';

@Injectable({ providedIn: 'root' })
export class OrderStateService extends BaseService<OrderToSupplierState> {
  constructor() {
    super();
    this.resourceEndpoint = '/orders_to_supplier_states';
  }

  async getAllStates(): Promise<OrderToSupplierState[]> {
    const raw = await firstValueFrom(this.getAll());
    return raw.map(dto => OrderToSupplierStateAssembler.toEntity(dto));
  }

  async getStateById(id: number): Promise<OrderToSupplierState> {
    const raw = await firstValueFrom(this.getById(id));
    return OrderToSupplierStateAssembler.toEntity(raw);
  }

  async createState(state: OrderToSupplierState): Promise<OrderToSupplierState> {
    const dto = OrderToSupplierStateAssembler.toDTO(state);
    const created = await firstValueFrom(this.create(dto));
    return OrderToSupplierStateAssembler.toEntity(created);
  }

  async updateState(id: number, state: OrderToSupplierState): Promise<OrderToSupplierState> {
    const dto = OrderToSupplierStateAssembler.toDTO(state);
    const updated = await firstValueFrom(this.update(id, dto));
    return OrderToSupplierStateAssembler.toEntity(updated);
  }

  async deleteState(id: number): Promise<void> {
    await firstValueFrom(this.delete(id));
  }
}
