import { Supply } from './supply.entity';

export class Batch {
  /** Rotation level ("Alta" | "Media" | "Baja") from the To-Be rotation endpoint (US-40). Populated after fetch. */
  public rotationLevel?: string;

  private constructor(
    public readonly id: number | null,
    public readonly customSupplyId: number,
    public stock: number,
    public readonly expiration_date: string | null,
    public readonly user_id: number,
    public readonly supply?: Supply
  ) { }

  static fromPersistence(data: any, supply?: Supply): Batch {
    return new Batch(
      data.id,
      data.customSupplyId ?? data.supplyId,
      data.stock,
      data.expirationDate ?? data.expiration_date ?? null,
      data.userId ?? data.user_id,
      supply
    );
  }


  static fromForm(data: Omit<Batch, 'user_id'>, userId: number): Batch {
    return new Batch(
      (data as any).id ?? null,
      (data as any).customSupplyId ?? (data as any).supplyId,
      data.stock,
      (data as any).expirationDate ?? data.expiration_date ?? null,
      userId
    );
  }

  static empty(): Batch {
    return new Batch(null, 0, 0, null, 0);
  }

  isExpired(): boolean {
    if (!this.expiration_date) return false;
    return new Date(this.expiration_date) < new Date();
  }
}
