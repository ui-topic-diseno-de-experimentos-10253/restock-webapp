import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, firstValueFrom, Observable, retry, shareReplay, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogSupplyService {
  private http = inject(HttpClient);
  private baseUrl = environment.serverBaseUrlBackend;
  private endpoint = '/supplies';
  private httpOptions = {headers: {'Content-Type': 'application/json'}};
  private catalogRequest$?: Observable<any[]>;
  private catalogCachedAt = 0;
  private readonly cacheTtlMs = 5 * 60 * 1000;

  async getCatalogSupplies(): Promise<any[]> {
    const cacheExpired = Date.now() - this.catalogCachedAt > this.cacheTtlMs;
    if (!this.catalogRequest$ || cacheExpired) {
      this.catalogCachedAt = Date.now();
      this.catalogRequest$ = this.http.get<any[]>(`${this.baseUrl}${this.endpoint}`, this.httpOptions).pipe(
        retry({count: 1, delay: 300}),
        catchError(error => { this.catalogRequest$ = undefined; return this.handleError(error); }),
        shareReplay({bufferSize: 1, refCount: false})
      );
    }
    return firstValueFrom(this.catalogRequest$);
  }

  invalidateCache(): void { this.catalogRequest$ = undefined; this.catalogCachedAt = 0; }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Error in catalog supply service'));
  }
}
