import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, firstValueFrom, retry, throwError } from 'rxjs';
import { CategoryService } from './category.service';
import { Supply } from '../model/supply.entity';
import {environment} from '../../../../../environments/environment';
import {CatalogSupplyService} from './catalog-supply.service';
import {CustomSupplyAssembler} from './custom-supply.assembler';
import {SessionService} from '../../../../shared/services/session.service';

export interface CustomSupplyPayload {
  supplyId: string;
  description: string;
  minStock: number;
  maxStock: number;
  price: number;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomSupplyService {
  private http = inject(HttpClient);
  private session = inject(SessionService);
  private catalog = inject(CatalogSupplyService);
  private baseUrl = environment.serverBaseUrlBackend;
  private endpoint = '/custom-supplies';
  private userEndpoint = '/custom-supplies/user';
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  async getAll(): Promise<Supply[]> {
    const userId = this.session.getUserId();
    const [customs, catalogSupplies] = await Promise.all([
      firstValueFrom(
        this.http.get<any[]>(`${this.baseUrl}${this.userEndpoint}/${userId}`, this.httpOptions)
          .pipe(retry(2), catchError(this.handleError))
      ),
      this.catalog.getCatalogSupplies(),
    ]);
    return customs.map(custom => {
      const catalog = catalogSupplies.find(c => c.id === custom.supplyId);
      return CustomSupplyAssembler.toEntity(custom, catalog);
    });
  }

  async create(payload: CustomSupplyPayload | Supply): Promise<any> {
    const dto = (payload instanceof Supply)
      ? CustomSupplyAssembler.toDTO(payload)
      : payload;
    const res$ = this.http.post(`${this.baseUrl}${this.endpoint}`, dto, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
    return firstValueFrom(res$);
  }

  async update(id: string | number | null, payload: CustomSupplyPayload | Supply): Promise<any> {
    const dto = (payload instanceof Supply)
      ? CustomSupplyAssembler.toDTO(payload)
      : payload;
    const res$ = this.http.put(`${this.baseUrl}${this.endpoint}`, dto, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
    return firstValueFrom(res$);
  }

  async delete(id: string | number | null): Promise<any> {
    const res$ = this.http.delete(`${this.baseUrl}${this.endpoint}/${id}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
    return firstValueFrom(res$);
  }

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    return throwError(() => new Error('Error in custom supply service'));
  }
}
