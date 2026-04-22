export class Recipe {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly imageUrl: string,
    public readonly userId: number
) {}

  static fromPersistence(data: any) {
    return new Recipe(
      data.id,
      data.name,
      data.description,
      data.price,
      data.imageUrl,
      data.userId
    );
  }
}
