export class Order {
  id: number;
  supplier: string;
  supply: string;
  quantity: number;
  unit: string;
  finalPrice: number;
  situation: string;
  state: string;
  shipDate: string;

  constructor(order: {
    id?: number;
    supplier?: string;
    supply?: string;
    quantity?: number;
    unit?: string;
    finalPrice?: number;
    situation?: string;
    state?: string;
    shipDate?: string;
  }) {
    this.id = order.id || 0;
    this.supplier = order.supplier || '';
    this.supply = order.supply || '';
    this.quantity = order.quantity || 0;
    this.unit = order.unit || '';
    this.finalPrice = order.finalPrice || 0;
    this.situation = order.situation || '';
    this.state = order.state || '';
    this.shipDate = order.shipDate || '';
  }
}
