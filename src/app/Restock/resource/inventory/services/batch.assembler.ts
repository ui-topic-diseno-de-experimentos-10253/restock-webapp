import { Batch } from '../model/batch.entity';
import { Supply } from '../model/supply.entity';

export class BatchAssembler {
  static toEntity(dto: any, supply?: Supply): Batch {
    return Batch.fromPersistence(dto, supply);
  }

  static toDTO(entity: Batch): any {
    return {
      id: entity.id,
      customSupplyId: entity.customSupplyId,
      stock: entity.stock,
      expirationDate: entity.expiration_date,
      userId: entity.user_id
    };
  }
}
