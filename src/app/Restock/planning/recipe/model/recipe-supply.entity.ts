export class RecipeSupply {
  private constructor(
    public readonly recipe_id: number,
    public readonly supplyId: number,
    public readonly quantity: number) {}

  static fromPersistence(data: any): RecipeSupply {
    return new RecipeSupply(
      data.recipe_id,
      data.supplyId,
      data.quantity
    );
  }
}
