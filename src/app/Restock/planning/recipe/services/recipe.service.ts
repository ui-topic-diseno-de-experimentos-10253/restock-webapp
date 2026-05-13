import { Injectable } from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {Recipe} from '../model/recipe.entity';
import {BaseService} from '../../../../shared/services/base.service';
import {catchError, map, Observable, retry} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecipeService extends BaseService<Recipe> {
  private baseUrl = environment.serverBaseUrlBackend;
  private endpoint = '/recipes';

  constructor() {
    super();
    this.resourceEndpoint = this.endpoint;
  }

  override getAll(): Observable<Array<Recipe>>{
    return this.http.get<Array<Recipe>>(`${this.baseUrl}${this.endpoint}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  override getById(id: number) {
    return this.http.get<Recipe>(`${this.baseUrl}${this.endpoint}/${id}`, this.httpOptions)
      .pipe(retry(2), catchError(this['handleError']));
  }

  override update(id: number, resource: Recipe) {
    return this.http.put<Recipe>(`${this.baseUrl}${this.endpoint}/${id}`, resource, this.httpOptions)
      .pipe(retry(2), catchError(this['handleError']));
  }
}
