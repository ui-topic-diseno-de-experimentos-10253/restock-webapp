/* import { Supply } from '../model/supply.entity';

export class SupplyAssembler {
  static toEntity(dto: any): Supply {
    return Supply.fromPersistence(dto);
  }

  static toDTO(entity: Supply): any {
    return {
      id: entity.id,
      description: entity.description,
      perishable: entity.perishable,
      min_stock: entity.min_stock,
      max_stock: entity.max_stock,
      price: entity.price,
      category_id: entity.category_id,
      unit_measurement_id: entity.unit_measurement_id,
      user_id: entity.user_id
    };
  }
}
 */

import { Supply } from '../model/supply.entity';

export class SupplyAssembler {
  static toEntity(dto: any): Supply {
    return Supply.fromPersistence(dto);
  }

  static toDTO(entity: Supply): any {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      perishable: entity.perishable,
      min_stock: entity.min_stock,
      max_stock: entity.max_stock,
      price: entity.price,
      category: entity.category,
      unit_abbreviation: entity.unit_abbreviation,
      user_id: entity.user_id
    };
  }
}
