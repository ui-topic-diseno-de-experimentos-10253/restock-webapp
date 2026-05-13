import { OrderToSupplier } from "./order-to-supplier.entity";

export class OrderComment {
  id: number;
  order_to_supplier_id: number;
  order_to_supplier?: OrderToSupplier;
  content: string;
  rating: number;
  date: Date;

  constructor(data: Partial<OrderComment> = {}) {
    this.id = data.id || 0;
    this.order_to_supplier_id = data.order_to_supplier_id || 0;
    this.content = data.content || '';
    this.rating = data.rating ?? 0;
    this.date = new Date(data.date || new Date());
  }
}
