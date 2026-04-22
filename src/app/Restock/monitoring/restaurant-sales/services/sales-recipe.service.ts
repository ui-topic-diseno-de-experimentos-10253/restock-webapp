import { Injectable } from '@angular/core';
import { BaseService } from '../../../../shared/services/base.service';
import { SalesRecipe } from '../model/sales-recipe.entity';

@Injectable({
    providedIn: 'root'
})
export class SalesRecipeService extends BaseService<SalesRecipe> {

    constructor() {
        super();
        this.resourceEndpoint = '/sales_recipes';
    }
}
