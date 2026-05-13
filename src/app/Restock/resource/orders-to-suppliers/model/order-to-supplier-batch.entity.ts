import { Batch } from "../../inventory/model/batch.entity";
import { Supply } from "../../inventory/model/supply.entity";

export class OrderToSupplierBatch {
  id: number; 
  order_to_supplier_id: number;
  quantity: number;
  accepted: boolean;
  batch_id: number;
  batch?: Batch;
  supply?: Supply;

  constructor(data: Partial<OrderToSupplierBatch> = {}) {
    this.id = data.id || 0;
    this.order_to_supplier_id = data.order_to_supplier_id || 0;
    this.batch_id = data.batch_id || 0;
    this.quantity = data.quantity || 0;
    this.accepted = data.accepted || false;
    this.batch = data.batch;
    this.supply = data.supply;
  }
}