export class UnitMeasurement {
  constructor(public readonly id: number, public readonly name: string) {}

  static fromPersistence(data: any): UnitMeasurement {
    return new UnitMeasurement(data.id, data.name);
  }
}
