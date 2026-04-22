
export class RestaurantSale {
    id?: number;
    code: string;
    admin_restaurant_id: number;
    diner_name: string;
    totalPrice: number;
    date: string;
    added_inventory: boolean;

    constructor(restaurantSale: {
        id?: number,
        code?: string,
        admin_restaurant_id?: number,
        diner_name?: string,
      totalPrice?: number,
        date?: string,
        added_inventory?: boolean,
    }) {
        this.id = restaurantSale.id || 0;
        this.code = restaurantSale.code || '';
        this.admin_restaurant_id = restaurantSale.admin_restaurant_id || 0;
        this.diner_name = restaurantSale.diner_name || '';
        this.totalPrice = restaurantSale.totalPrice || 0;
        this.date = restaurantSale.date || '';
        this.added_inventory = restaurantSale.added_inventory || false;
    }
}
