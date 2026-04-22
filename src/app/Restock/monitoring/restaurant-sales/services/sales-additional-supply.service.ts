import { Injectable } from '@angular/core';
import { BaseService } from '../../../../shared/services/base.service';
import { SalesAdditionalSupply } from '../model/sales-additionalSupply.entity';

@Injectable({
    providedIn: 'root'
})
export class SalesAdditionalSupplyService extends BaseService<SalesAdditionalSupply> {

    constructor() {
        super();
        this.resourceEndpoint = '/sales_additional_supplies';
    }
}
