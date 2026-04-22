import { Injectable } from '@angular/core';
import { BaseService } from '../../../../shared/services/base.service';
import { RestaurantSale } from '../model/restaurant-sale.entity';

@Injectable({
    providedIn: 'root'
})
export class RestaurantSaleService extends BaseService<RestaurantSale> {

    constructor() {
        super();
        this.resourceEndpoint = '/sales';
    }
}
