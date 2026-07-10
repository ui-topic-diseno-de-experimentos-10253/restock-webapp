import {Injectable, inject} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {Batch} from '../model/batch.entity';
import {Supply} from '../model/supply.entity';
import {BatchService} from './batch.service';
import {CatalogSupplyService} from './catalog-supply.service';
import {CustomSupplyService} from './custom-supply.service';
import {CustomSupplyAssembler} from './custom-supply.assembler';
import {RotationService, SupplyRotation} from './rotation.service';

export interface InventorySnapshot { supplies: Supply[]; batches: Batch[]; }
interface CachedSnapshot { expiresAt: number; request: Promise<InventorySnapshot>; }

@Injectable({providedIn: 'root'})
export class InventoryDataService {
  private readonly catalog = inject(CatalogSupplyService);
  private readonly customSupplies = inject(CustomSupplyService);
  private readonly batches = inject(BatchService);
  private readonly rotations = inject(RotationService);
  private readonly cache = new Map<string, CachedSnapshot>();
  private readonly cacheTtlMs = 30_000;

  load(userId: number, options: {rotation?: boolean; force?: boolean} = {}): Promise<InventorySnapshot> {
    const key = `${userId}:${Boolean(options.rotation)}`;
    const cached = this.cache.get(key);
    if (!options.force && cached && cached.expiresAt > Date.now()) return cached.request;
    const request = this.fetchSnapshot(userId, Boolean(options.rotation)).catch(error => {
      this.cache.delete(key);
      throw error;
    });
    this.cache.set(key, {expiresAt: Date.now() + this.cacheTtlMs, request});
    return request;
  }

  invalidate(userId?: number): void {
    if (userId == null) return this.cache.clear();
    for (const key of this.cache.keys()) if (key.startsWith(`${userId}:`)) this.cache.delete(key);
  }

  private async fetchSnapshot(userId: number, includeRotation: boolean): Promise<InventorySnapshot> {
    const rotationRequest: Promise<SupplyRotation[]> = includeRotation
      ? this.rotations.getRotationByUserId(userId).catch(() => [])
      : Promise.resolve([]);
    const [catalog, rawCustoms, rawBatches, rotations] = await Promise.all([
      this.catalog.getCatalogSupplies(),
      firstValueFrom(this.customSupplies.getByUser(userId)),
      this.batches.getRawBatchesByUserId(userId),
      rotationRequest
    ]);
    const supplies = rawCustoms.map(custom => {
      const raw: any = custom;
      const sourceId = raw.supplyId ?? raw.supply?.id;
      return CustomSupplyAssembler.toEntity(custom, catalog.find(item => Number(item.id) === Number(sourceId)));
    });
    const suppliesById = new Map(supplies.map(supply => [Number(supply.id), supply]));
    const rotationBySupply = new Map(rotations.map(item => [Number(item.customSupplyId), item.rotationLevel]));
    const batches = rawBatches.map(raw => {
      const customSupplyId = Number(raw.customSupplyId ?? raw.supplyId);
      const batch = Batch.fromPersistence(raw, suppliesById.get(customSupplyId));
      batch.rotationLevel = rotationBySupply.get(customSupplyId);
      return batch;
    });
    return {supplies, batches};
  }
}
