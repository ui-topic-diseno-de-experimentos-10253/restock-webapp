import {BaseService} from '../../../../shared/services/base.service';
import {Batch} from '../model/batch.entity';
import {BatchAssembler} from './batch.assembler';
import {inject, Injectable, Injector} from '@angular/core';
import {catchError, firstValueFrom, retry, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {CustomSupplyService} from './custom-supply.service';
import {SessionService} from '../../../../shared/services/session.service';
import {Supply} from '../model/supply.entity';
import {CustomSupplyAssembler} from './custom-supply.assembler';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';

export interface BatchPayload {
  id: string;
  userId: string;
  customSupplyId: string;
  stock: number;
  expirationDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private http = inject(HttpClient);
  private session = inject(SessionService);
  private supplyService = inject(CustomSupplyService);
  private baseUrl = environment.serverBaseUrlBackend;
  private endpoint = '/batches';
  private userEndpoint = '/batches/user';
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  async getAllBatchesWithSupplies(): Promise<Batch[]> {
    const userId = this.session.getUserId();
    if (userId == null) return [];
    return this.getBatchesByUserId(userId);
  }

  async getBatchesByUserId(userId: number): Promise<Batch[]> {
    const [batchesResponse, supplies] = await Promise.all([
      this.getRawBatchesByUserId(userId),
      this.supplyService.getAll()
    ]);
    return batchesResponse.map((batch: any) =>
      Batch.fromPersistence(
        batch,
        supplies.find(s => s.id === batch.customSupplyId)
      )
    );
  }

  async getRawBatchesByUserId(userId: number): Promise<any[]> {
    const response = await firstValueFrom(
      this.http.get<any>(`${this.baseUrl}${this.userEndpoint}/${userId}`, this.httpOptions)
        .pipe(retry({count: 1, delay: 300}), catchError(this.handleError))
    );
    return Array.isArray(response) ? response : (response?.value ?? []);
  }

  async getBatchById(id: number): Promise<Batch> {
    const batch = await firstValueFrom(
      this.http.get<Batch>(`${this.baseUrl}${this.endpoint}/${id}`, this.httpOptions)
        .pipe(retry(2), catchError(this.handleError))
    );
    const supplies = await this.supplyService.getAll();
    const supply = supplies.find(s => s.id === (batch as any).customSupplyId);
    return Batch.fromPersistence(batch, supply);
  }

  async create(payload: BatchPayload | Batch): Promise<any> {
    const dto: any = (payload instanceof Batch)
      ? BatchAssembler.toDTO(payload)
      : payload;

    dto.customSupplyId = Number(dto.customSupplyId);
    dto.userId = Number(dto.userId);
    if (dto.id == null) {
      delete dto.id;
    }

    console.log('[Batch] create payload', dto);

    const res$ = this.http.post(`${this.baseUrl}${this.endpoint}`, dto, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
    return firstValueFrom(res$);
  }

  async update(id: string | number | null, payload: Batch): Promise<Batch> {
    if (id == null) {
      throw new Error('Cannot update batch without id');
    }
    const dto: any = BatchAssembler.toDTO(payload);
    dto.customSupplyId = Number(dto.customSupplyId);
    dto.userId = Number(dto.userId);
    dto.id = Number(id);
    const res$ = this.http.put(`${this.baseUrl}${this.endpoint}/${id}`, dto, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
    const updated = await firstValueFrom(res$);
    return BatchAssembler.toEntity(updated);
  }

  async delete(id: string | number | null): Promise<void> {
    if (id == null) return;
    const res$ = this.http.delete(`${this.baseUrl}${this.endpoint}/${id}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
    await firstValueFrom(res$);
  }

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    return throwError(() => error);
  }
}
