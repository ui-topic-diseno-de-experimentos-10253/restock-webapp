import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, firstValueFrom, Observable, retry, throwError } from 'rxjs';
import { CategoryService } from './category.service';
import { Supply } from '../model/supply.entity';
import {environment} from '../../../../../environments/environment';
import {CatalogSupplyService} from './catalog-supply.service';
import {CustomSupplyAssembler} from './custom-supply.assembler';
import {SessionService} from '../../../../shared/services/session.service';
import { CreateCustomSupplyRequest, CustomSupply } from './custom-supply.contract';

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

  create(payload: CreateCustomSupplyRequest): Observable<CustomSupply> {
    return this.http
      .post<CustomSupply>(`${this.baseUrl}${this.endpoint}`, payload, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  getByUser(userId: number): Observable<CustomSupply[]> {
    return this.http
      .get<CustomSupply[]>(`${this.baseUrl}${this.endpoint}/user/${userId}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  getById(id: number): Observable<CustomSupply> {
    return this.http
      .get<CustomSupply>(`${this.baseUrl}${this.endpoint}/${id}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  update(id: number, payload: CreateCustomSupplyRequest): Observable<CustomSupply> {
    return this.http
      .put<CustomSupply>(`${this.baseUrl}${this.endpoint}/${id}`, payload, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  deleteById(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}${this.endpoint}/${id}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  // Backward compatible Promise-based delete used by inventory pages
  async delete(id: string | number | null): Promise<void> {
    if (id == null) return;
    await firstValueFrom(this.deleteById(Number(id)));
  }

  /**
   * Legacy API used by current inventory pages (returns merged Supply entities).
   * Kept for compatibility with the rest of the inventory section.
   */
  async getAll(): Promise<Supply[]> {
    const userId = this.session.getUserId();
    if (userId == null) {
      throw new Error('User ID not found in session');
    }
    const [customs, catalogSupplies] = await Promise.all([
      firstValueFrom(
        this.http.get<any[]>(`${this.baseUrl}${this.userEndpoint}/${userId}`, this.httpOptions)
          .pipe(retry(2), catchError(this.handleError))
      ),
      this.catalog.getCatalogSupplies(),
    ]);
    return customs.map(custom => {
      const sourceSupplyId = custom.supplyId ?? custom.supply?.id;
      const catalog = catalogSupplies.find(c => Number(c.id) === Number(sourceSupplyId));
      return CustomSupplyAssembler.toEntity(custom, catalog);
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    // IMPORTANT: rethrow the original HttpErrorResponse so callers can read
    // status codes and backend error bodies for debugging.
    return throwError(() => error);
  }
}
