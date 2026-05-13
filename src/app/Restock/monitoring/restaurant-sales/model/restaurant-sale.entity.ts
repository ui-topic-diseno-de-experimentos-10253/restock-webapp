export class DishSelection {
    dishId: number;
    quantity: number;
    unitPrice: number;

    constructor(data: { dishId?: number; quantity?: number; unitPrice?: number }) {
        this.dishId = data.dishId || 0;
        this.quantity = data.quantity || 0;
        this.unitPrice = data.unitPrice || 0;
    }
}

export class SupplySelection {
    supplyId: number;
    quantity: number;
    unitPrice: number;

    constructor(data: { supplyId?: number; quantity?: number; unitPrice?: number }) {
        this.supplyId = data.supplyId || 0;
        this.quantity = data.quantity || 0;
        this.unitPrice = data.unitPrice || 0;
    }
}

export class RestaurantSale {
    id?: number;
    saleNumber: string;
    totalCost: number;
    subtotal: number;
    taxes: number;
    registeredDate: string;
    userId: number;
    status: string;
    dishSelections: DishSelection[];
    supplySelections: SupplySelection[];

    constructor(data: {
        id?: number;
        saleNumber?: string;
        totalCost?: number;
        subtotal?: number;
        taxes?: number;
        registeredDate?: string;
        userId?: number;
        status?: string;
        dishSelections?: DishSelection[];
        supplySelections?: SupplySelection[];
    }) {
        this.id = data.id;
        this.saleNumber = data.saleNumber || '';
        this.totalCost = data.totalCost || 0;
        this.subtotal = data.subtotal || 0;
        this.taxes = data.taxes || 0;
        this.registeredDate = data.registeredDate || '';
        this.userId = data.userId || 0;
        this.status = data.status || '';
        this.dishSelections = data.dishSelections || [];
        this.supplySelections = data.supplySelections || [];
    }
}

// DTO used to POST a new sale
export interface CreateSaleDto {
    dishSelections: { dishId: number; quantity: number; unitPrice: number }[];
    supplySelections: { supplyId: number; quantity: number; unitPrice: number }[];
    subtotal: number;
    taxes: number;
    totalCost: number;
    userId: number;
}