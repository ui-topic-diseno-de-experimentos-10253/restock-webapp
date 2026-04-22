import {Category} from '../model/category.entity';

export class CategoryAssembler {
  static toEntity(dto: any): Category {
    return Category.fromPersistence(dto);
  }

  static toDTO(entity: Category): any {
    return {
      id: entity.id,
      name: entity.name,
    };
  }
}
