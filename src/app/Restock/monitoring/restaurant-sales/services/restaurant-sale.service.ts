import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RestaurantSale, CreateSaleDto } from '../model/restaurant-sale.entity';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RestaurantSaleService {

    private readonly ENDPOINT = `${environment.serverBaseUrlBackend}/sales`;

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token') || '';
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    /** GET /api/v1/sales */
    getAll(): Observable<RestaurantSale[]> {
        return this.http.get<RestaurantSale[]>(this.ENDPOINT, {
            headers: this.getHeaders()
        }).pipe(
            catchError(err => throwError(() => err))
        );
    }

    /** GET /api/v1/sales/:id */
    getById(id: number): Observable<RestaurantSale> {
        return this.http.get<RestaurantSale>(`${this.ENDPOINT}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            catchError(err => throwError(() => err))
        );
    }

    /**
     * POST /api/v1/sales
     * API responds with { success, data, message } — we extract `data`.
     */
    create(dto: CreateSaleDto): Observable<RestaurantSale> {
        return this.http.post<{ success: boolean; data: RestaurantSale; message: string }>(
            this.ENDPOINT,
            dto,
            { headers: this.getHeaders() }
        ).pipe(
            map(response => response.data),
            catchError(err => throwError(() => err))
        );
    }

    /** DELETE /api/v1/sales/:id */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.ENDPOINT}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            catchError(err => throwError(() => err))
        );
    }
}