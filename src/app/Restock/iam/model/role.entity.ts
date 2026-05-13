export class Role {
  constructor(
    public readonly id: number,
    public readonly name: string
  ) {}

  static fromPersistence(raw: any): Role {
    return new Role(raw.id, raw.name);
  }
}
