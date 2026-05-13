import {inject, Injectable} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {RecipeSupply} from '../model/recipe-supply.entity';
import {catchError, firstValueFrom, forkJoin, mergeMap, of, retry, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class RecipeSupplyService {
  private http = inject(HttpClient);
  private baseUrl = environment.serverBaseUrlBackend;
  private resourceEndpoint = '/recipes';
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  getByRecipe(recipeId: number) {
    return this.http.get<RecipeSupply[]>(
      `${this.baseUrl}${this.resourceEndpoint}/${recipeId}/supplies`, this.httpOptions
    ).pipe(retry(2), catchError(this.handleError));
  }

  add(recipeId: number, supply: { supplyId: number; quantity: number }) {
    return this.http.post<any>(
      `${this.baseUrl}${this.resourceEndpoint}/${recipeId}/supplies`, supply, this.httpOptions
    ).pipe(retry(2), catchError(this.handleError));
  }

  update(recipeId: number, supplyId: number, supply: { supplyId: number; quantity: number }) {
    return this.http.put<any>(
      `${this.baseUrl}${this.resourceEndpoint}/${recipeId}/supplies/${supplyId}`, supply, this.httpOptions
    ).pipe(retry(2), catchError(this.handleError));
  }

  delete(recipeId: number, supplyId: number) {
    return this.http.delete<any>(
      `${this.baseUrl}${this.resourceEndpoint}/${recipeId}/supplies/${supplyId}`, this.httpOptions
    ).pipe(retry(2), catchError(this.handleError));
  }

  bulkCreate(recipeId: number, supplies: { supplyId: number; quantity: number }[]) {
    if (!supplies || supplies.length === 0) return of([]);
    const requests = supplies.map(s => this.add(recipeId, s));
    return forkJoin(requests);
  }

  deleteAll(recipeId: number) {
    return this.getByRecipe(recipeId).pipe(
      mergeMap(supplies => {
        if (!supplies || supplies.length === 0) return of([]);
        const deletions = supplies.map(s => this.delete(recipeId, s.supplyId));
        return forkJoin(deletions);
      })
    );
  }

  async replaceSupplies(recipeId: number, supplies: { supplyId: number; quantity: number }[]) {
    await firstValueFrom(this.deleteAll(recipeId));
    if (supplies && supplies.length > 0) {
      await firstValueFrom(this.bulkCreate(recipeId, supplies));
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    return throwError(() => new Error('Error in recipe supply service'));
  }
}