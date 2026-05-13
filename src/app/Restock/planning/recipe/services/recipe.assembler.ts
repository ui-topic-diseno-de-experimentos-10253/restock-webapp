import {Recipe} from '../model/recipe.entity';

export class RecipeAssembler {
  static toEntity(dto: any): Recipe {
    return Recipe.fromPersistence(dto);
  }

  static toDTO(entity: Recipe): any {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      imageUrl: entity.imageUrl,   // fix: was image_url (snake_case)
      userId: entity.userId        // fix: was user_id (snake_case)
    };
  }
}