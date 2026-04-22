import {inject, Injectable} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {RecipeSupply} from '../model/recipe-supply.entity';
import {catchError, firstValueFrom, forkJoin, mergeMap, retry, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Recipe} from '../model/recipe.entity';

@Injectable({ providedIn: 'root' })
export class RecipeSupplyService {
  private http = inject(HttpClient);
  private baseUrl = environment.serverBaseUrlBackend;
  private resourceEndpoint = '/recipes';
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  getByRecipe(recipeId: number) {
    return this.http.get<RecipeSupply[]>(
      `${this.resourceEndpoint}/${recipeId}/supplies`, this.httpOptions
    ).pipe(retry(2), catchError(this.handleError));
  }

  add(recipeId: number, supply: RecipeSupply) {
    return this.http.post<Recipe>(
      `${this.resourceEndpoint}/${recipeId}/supplies`, supply, this.httpOptions
    ).pipe(retry(2), catchError(this.handleError));
  }

  update(recipeId: number, supplyId: number, supply: RecipeSupply) {
    return this.http.put<Recipe>(
      `${this.resourceEndpoint}/${recipeId}/supplies/${supplyId}`, supply, this.httpOptions
    ).pipe(retry(2), catchError(this.handleError));
  }

  delete(recipeId: number, supplyId: number) {
    return this.http.delete<Recipe>(
      `${this.resourceEndpoint}/${recipeId}/supplies/${supplyId}`, this.httpOptions
    ).pipe(retry(2), catchError(this.handleError));
  }

  bulkCreate(recipeId: number, supplies: RecipeSupply[]) {
    const requests = supplies.map(s => this.add(recipeId, s));
    return forkJoin(requests);
  }

  deleteAll(recipeId: number) {
    return this.getByRecipe(recipeId).pipe(
      mergeMap(supplies => {
        const deletions = supplies.map(s => this.delete(recipeId, s.supplyId));
        return forkJoin(deletions);
      })
    );
  }

  async replaceSupplies(recipeId: number, supplies: RecipeSupply[]) {
    await firstValueFrom(this.deleteAll(recipeId));
    await firstValueFrom(this.bulkCreate(recipeId, supplies));
  }


  private handleError(error: HttpErrorResponse) {
    console.error(error);
    return throwError(() => new Error('Error in recipe supply service'));
  }
}

