import {RecipeSupply} from '../model/recipe-supply.entity';

export class RecipeSupplyAssembler {
    static toEntity(dto: any): RecipeSupply {
        return RecipeSupply.fromPersistence(dto);
    }

    static toDTO(entity: RecipeSupply): any {
        return {
        recipe_id: entity.recipe_id,
          supplyId: entity.supplyId,
        quantity: entity.quantity
        };
    }
}
