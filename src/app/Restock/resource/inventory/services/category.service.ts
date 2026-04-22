import {inject, Injectable} from '@angular/core';
import {Category} from '../model/category.entity';
import {environment} from '../../../../../environments/environment';
import {catchError, firstValueFrom, retry, throwError} from 'rxjs';
import {CategoryAssembler} from './category.assembler';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.serverBaseUrlBackend;
  private endpoint = '/supplies/categories';
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  async getAllCategories(): Promise<Category[]> {
    const res$ = this.http.get<any[]>(`${this.baseUrl}${this.endpoint}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
    const dtos = await firstValueFrom(res$);
    return dtos.map(CategoryAssembler.toEntity);
  }

  private handleError(error: any) {
      console.error(error);
      return throwError(() => new Error('Error in category service'));
    }
  }
