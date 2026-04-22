import { Category } from './category.entity';

export class Supply {
  constructor(
    public readonly id: string | number | null,
    public readonly user_id: number | null,
    public readonly name: string,
    public readonly description: string,
    public readonly perishable: boolean,
    public readonly min_stock: number,
    public readonly max_stock: number,
    public readonly price: number,
    public readonly category: string,
    public readonly unit_abbreviation: string,
  ) {}

  static fromPersistence(raw: any): Supply {
    return new Supply(
      raw.id ?? null,
      raw.user_id ?? raw.userId ?? null,
      raw.name ?? raw.supplyName ?? '',
      raw.description ?? '',
      raw.perishable ?? raw.isPerishable ?? false,
      raw.min_stock ?? raw.minStock ?? 0,
      raw.max_stock ?? raw.maxStock ?? 0,
      raw.price ?? raw.unitPrice ?? 0,
      raw.category ?? raw.category_name ?? raw.categoryName ?? '',
      raw.unit_abbreviation ?? raw.unitAbbreviation ?? ''
    );
  }
//test
  static fromForm(data: Omit<Supply, 'user_id'>, userId: number | null): Supply {
    return new Supply(
      (data as any).id ?? null,
      userId,
      data.name,
      data.description,
      data.perishable,
      data.min_stock,
      data.max_stock,
      data.price,
      data.category,
      data.unit_abbreviation
    );
  }
}
