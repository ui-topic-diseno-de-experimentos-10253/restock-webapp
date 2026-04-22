import { OrderToSupplier } from '../model/order-to-supplier.entity';
import { OrderToSupplierState } from '../model/order-to-supplier-state.entity';
import { OrderToSupplierSituation } from '../model/order-to-supplier-situation.entity';
import {OrderToSupplierBatch} from '../model/order-to-supplier-batch.entity';

export class OrderToSupplierAssembler {

  static toEntity(
    dto: any,
    state?: OrderToSupplierState,
    situation?: OrderToSupplierSituation,
    orderBatches?: OrderToSupplierBatch[]
  ): OrderToSupplier {
    const entity = new OrderToSupplier({
      id: dto.id,
      date: dto.date,
      description: dto.description,
      admin_restaurant_id: dto.admin_restaurant_id,
      supplier_id: dto.supplier_id,
      order_to_supplier_state_id: dto.order_to_supplier_state_id,
      order_to_supplier_situation_id: dto.order_to_supplier_situation_id,
      totalPrice: dto.totalPrice,
      requested_products_count: dto.requested_products_count,
      partially_accepted: dto.partially_accepted,
      estimated_ship_date: dto.estimated_ship_date ? new Date(dto.estimated_ship_date) : undefined,
      estimated_ship_time: dto.estimated_ship_time ? new Date(dto.estimated_ship_time) : undefined,
    });

    if (state) {
      entity.state = state;
    }
    if (situation) {
      entity.situation = situation;
    }

    if(orderBatches && Array.isArray(orderBatches)) {
      entity.orderBatches = orderBatches;
    }
    return entity;
  }

  static toDTO(entity: OrderToSupplier): any {
    return {
      id: entity.id,
      date: entity.date,
      description: entity.description ? entity.description : 'No description provided',
      admin_restaurant_id: entity.admin_restaurant_id,
      supplier_id: entity.supplier_id,
      order_to_supplier_state_id: entity.order_to_supplier_state_id,
      order_to_supplier_situation_id: entity.order_to_supplier_situation_id,
      requested_products_count: entity.requested_products_count,
      totalPrice: entity.totalPrice,
      partially_accepted: entity.partially_accepted,
      estimated_ship_date: entity.estimated_ship_date?.toISOString(),
      estimated_ship_time: entity.estimated_ship_time?.toISOString()
    };
  }
}
