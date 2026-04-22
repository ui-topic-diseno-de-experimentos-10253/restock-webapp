import { OrderToSupplierState } from '../model/order-to-supplier-state.entity';

export class OrderToSupplierStateAssembler {
  static toEntity(dto: any): OrderToSupplierState {
    return new OrderToSupplierState({
      id: dto.id,
      name: dto.name
    });
  }

  static toDTO(entity: OrderToSupplierState): any {
    return {
      id: entity.id,
      name: entity.name
    };
  }
}
