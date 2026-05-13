import { Injectable } from '@angular/core';
import { BaseService } from '../../../../shared/services/base.service';
import { firstValueFrom } from 'rxjs';

import { OrderToSupplierSituation } from '../model/order-to-supplier-situation.entity';
import { OrderToSupplierSituationAssembler } from './order-to-supplier-situation.assembler';

@Injectable({ providedIn: 'root' })
export class OrderSituationService extends BaseService<OrderToSupplierSituation> {
  constructor() {
    super();
    this.resourceEndpoint = '/orders_to_supplier_situations';
  }

  async getAllSituations(): Promise<OrderToSupplierSituation[]> {
    const raw = await firstValueFrom(this.getAll());
    return raw.map(dto => OrderToSupplierSituationAssembler.toEntity(dto));
  }

  async getSituationById(id: number): Promise<OrderToSupplierSituation> {
    const raw = await firstValueFrom(this.getById(id));
    return OrderToSupplierSituationAssembler.toEntity(raw);
  }

  async createSituation(situation: OrderToSupplierSituation): Promise<OrderToSupplierSituation> {
    const dto = OrderToSupplierSituationAssembler.toDTO(situation);
    const created = await firstValueFrom(this.create(dto));
    return OrderToSupplierSituationAssembler.toEntity(created);
  }

  async updateSituation(id: number, situation: OrderToSupplierSituation): Promise<OrderToSupplierSituation> {
    const dto = OrderToSupplierSituationAssembler.toDTO(situation);
    const updated = await firstValueFrom(this.update(id, dto));
    return OrderToSupplierSituationAssembler.toEntity(updated);
  }

  async deleteSituation(id: number): Promise<void> {
    await firstValueFrom(this.delete(id));
  }
}
