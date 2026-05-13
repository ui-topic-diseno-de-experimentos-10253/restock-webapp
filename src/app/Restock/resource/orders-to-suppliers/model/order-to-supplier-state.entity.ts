export class OrderToSupplierState {
  id: number;
  name: string;

  constructor(data: Partial<OrderToSupplierState> = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
  }
}
