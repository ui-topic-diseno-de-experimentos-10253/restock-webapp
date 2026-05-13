import { OrderToSupplierBatch } from '../model/order-to-supplier-batch.entity';
import {Batch} from '../../inventory/model/batch.entity';

export class OrderToSupplierBatchAssembler {
  static toEntity(dto: any, batch?: Batch,): OrderToSupplierBatch {
    const entity = new OrderToSupplierBatch({
      id: dto.id,
      order_to_supplier_id: dto.order_to_supplier_id,
      batch_id: dto.batch_id,
      quantity: dto.quantity,
      accepted: dto.accepted
    });
    if(batch) {
      entity.batch = batch;
    }
    return entity;
  }

  static toDTO(entity: OrderToSupplierBatch): any {
    return {
      id: entity.id,
      order_to_supplier_id: entity.order_to_supplier_id,
      batch_id: entity.batch_id,
      quantity: entity.quantity,
      accepted: entity.accepted
    };
  }
}
