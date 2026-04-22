export interface OrderBatchItem {
  batchId: number;
  quantity: number;
  accept: boolean;
}

export interface CreateOrderRequest {
  adminRestaurantId: number;
  supplierId: number;
  batches: OrderBatchItem[];
  description: string;
  estimatedShipDate: string;
  estimatedShipTime: string;
}

export interface UpdateOrderStateRequest {
  stateId?: number;
  situationId?: number;
  estimatedShipDate?: string;
  estimatedShipTime?: string;
  description?: string;
}
