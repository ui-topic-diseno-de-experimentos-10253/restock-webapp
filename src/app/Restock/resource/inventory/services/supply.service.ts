import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { BaseService } from '../../../../shared/services/base.service';
import { Supply } from '../model/supply.entity';
import { SupplyAssembler } from './supply.assembler';
import {catchError, firstValueFrom, map, Observable, retry, throwError} from 'rxjs';
import { CategoryService } from './category.service';
import { BatchService } from './batch.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SupplyService extends BaseService<any> {

  private readonly categoryService = inject(CategoryService);
  private readonly batchService = inject(BatchService);


  constructor() {
    super();
    this.resourceEndpoint = '/supplies';
  }

  async getAllSuppliesEnriched(): Promise<Supply[]> {
    const rawSupplies = await firstValueFrom(super.getAll());
    return rawSupplies.map(raw => Supply.fromPersistence(raw));
  }

  async getSuppliesEnrichedByUserIds(userIds: number[]): Promise<Supply[]> {
    const [rawSupplies, rawBatches] = await Promise.all([
      firstValueFrom(this.http.get<any[]>(`${environment.serverBaseUrlBackend}${this.resourceEndpoint}`, this.httpOptions)
        .pipe(retry(2), catchError(this.handleError))),
      this.batchService.getAllBatchesWithSupplies()
    ]);
    const filteredSupplies = rawSupplies.filter(supply =>
      userIds.includes(supply.user_id)
    );

    return filteredSupplies.map(raw => {
      const supply = Supply.fromPersistence(raw);

      const relatedBatches = rawBatches.filter(
        b => b.customSupplyId === raw.id && b.user_id === raw.user_id
      );

      (supply as any).batches = relatedBatches;

      return supply;
    });
  }


  async getSupplyById(id: number): Promise<Supply> {
    const response$ = super.getById(id);
    const dto = await firstValueFrom(response$);
    return SupplyAssembler.toEntity(dto);
  }

  async createSupply(supply: Supply): Promise<Supply> {
    const dto = SupplyAssembler.toDTO(supply);
    const response$ = super.create(dto);
    const created = await firstValueFrom(response$);
    return SupplyAssembler.toEntity(created);
  }

  async updateSupply(id: string | number | null, supply: Supply): Promise<Supply> {
    const dto = SupplyAssembler.toDTO(supply);
    const response$ = super.update(id, dto);
    const updated = await firstValueFrom(response$);
    return SupplyAssembler.toEntity(updated);
  }

  async deleteSupply(id: string | number | null): Promise<void> {
    await firstValueFrom(super.delete(id));
  }
}




