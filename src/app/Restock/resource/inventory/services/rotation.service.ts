import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {catchError, firstValueFrom, retry, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';

export interface SupplyRotation {
  customSupplyId: number;
  supplyId: number;
  supplyName: string;
  rotationLevel: string;
  consumedUnits: number;
  currentStock: number;
}

/**
 * Consumes the To-Be inventory rotation endpoint (US-40 / Experiment 04).
 */
@Injectable({
  providedIn: 'root'
})
export class RotationService {
  private http = inject(HttpClient);
  private baseUrl = environment.serverBaseUrlBackend;
  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  async getRotationByUserId(userId: number): Promise<SupplyRotation[]> {
    return firstValueFrom(
      this.http.get<SupplyRotation[]>(`${this.baseUrl}/inventory/users/${userId}/rotation`, this.httpOptions)
        .pipe(retry(2), catchError(this.handleError))
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    return throwError(() => error);
  }
}
