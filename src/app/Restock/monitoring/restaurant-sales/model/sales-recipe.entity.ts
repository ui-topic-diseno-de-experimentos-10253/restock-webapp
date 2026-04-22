
export class SalesRecipe {
    sale_id: number;
    recipe_id: number;
    quantity: number;

    constructor(salesRecipe: {
        sale_id?: number,
        recipe_id?: number,
        quantity?: number,
    }) {
        this.sale_id = salesRecipe.sale_id || 0;
        this.recipe_id = salesRecipe.recipe_id || 0;
        this.quantity = salesRecipe.quantity || 0;
    }
}
