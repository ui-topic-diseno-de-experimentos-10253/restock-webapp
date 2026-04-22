
export class SalesAdditionalSupply {
    sale_id: number;
  supplyId: number;
    quantity: number;

    constructor(salesAdditionalSupply: {
        sale_id?: number,
      supplyId?: number,
        quantity?: number,
    }) {
        this.sale_id = salesAdditionalSupply.sale_id || 0;
        this.supplyId = salesAdditionalSupply.supplyId || 0;
        this.quantity = salesAdditionalSupply.quantity || 0;
    }
}
