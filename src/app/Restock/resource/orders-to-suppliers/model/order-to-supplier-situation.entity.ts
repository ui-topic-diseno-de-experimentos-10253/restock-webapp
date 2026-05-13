export class OrderToSupplierSituation {
  id: number;
  name: string;

  constructor(data: Partial<OrderToSupplierSituation> = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
  }
}
