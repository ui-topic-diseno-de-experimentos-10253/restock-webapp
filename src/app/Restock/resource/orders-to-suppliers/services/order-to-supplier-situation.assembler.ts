import { OrderToSupplierSituation } from '../model/order-to-supplier-situation.entity';

export class OrderToSupplierSituationAssembler {
  static toEntity(dto: any): OrderToSupplierSituation {
    return new OrderToSupplierSituation({
      id: dto.id,
      name: dto.name
    });
  }

  static toDTO(entity: OrderToSupplierSituation): any {
    return {
      id: entity.id,
      name: entity.name
    };
  }
}
