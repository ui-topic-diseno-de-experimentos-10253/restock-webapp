import {Supply} from '../model/supply.entity';

export class CustomSupplyAssembler {
  static toEntity(customDto: any, catalogDto?: any): Supply {
    const supplyFromApi = customDto?.supply ?? {};

    const merged = {
      id: customDto.id,
      supplyId: catalogDto?.id ?? customDto.supplyId ?? supplyFromApi?.id ?? null,

      user_id: customDto.user_id ?? customDto.userId ?? null,

      name: catalogDto?.name ?? supplyFromApi?.name ?? '',
      description: customDto.description ?? catalogDto?.description ?? supplyFromApi?.description ?? '',
      perishable: catalogDto?.perishable ?? supplyFromApi?.perishable ?? false,

      min_stock: customDto.min_stock ?? customDto.minStock ?? 0,
      max_stock: customDto.max_stock ?? customDto.maxStock ?? 0,
      price: customDto.price ?? customDto.unitPrice ?? 0,

      category: catalogDto?.category ?? supplyFromApi?.category ?? customDto.category ?? '',

      unit_abbreviation:
        customDto?.unitAbbreviaton ??
        customDto?.unitAbbreviation ??
        catalogDto?.unit_abbreviation ??
        catalogDto?.unitAbbreviation ??
        '',
    };

    return Supply.fromPersistence(merged);
  }


  static toDTO(entity: Supply): any {
    return {
      id: entity.id,
      supplyId: entity.supplyId,
      description: entity.description,
      minStock: entity.min_stock,
      maxStock: entity.max_stock,
      unitPrice: entity.price,
      userId: entity.user_id,
    }
  }
}
