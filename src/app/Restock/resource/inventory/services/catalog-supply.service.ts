import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, firstValueFrom, retry, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogSupplyService {
  private http = inject(HttpClient);
  private baseUrl = environment.serverBaseUrlBackend;
  private endpoint = '/supplies';
  private httpOptions = {headers: {'Content-Type': 'application/json'}};

  async getCatalogSupplies(): Promise<any[]> {
    const res$ = this.http.get<any[]>(`${this.baseUrl}${this.endpoint}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
    return firstValueFrom(res$);

  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Error in catalog supply service'));
  }
}
