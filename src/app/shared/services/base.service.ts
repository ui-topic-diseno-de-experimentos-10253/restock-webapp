import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';

// Clase abstracta base para servicios genéricos (CRUD)
// Se usa 'abstract' porque esta clase no se instancia directamente,
// sino que se extiende por servicios específicos (ej. UserService)
export abstract class BaseService<T> {
    // Opciones HTTP, por ejemplo, cabecera Content-Type
    protected httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

    // URL base del backend, tomada del archivo de configuración
    private serverBaseUrl: string = `${environment.serverBaseUrlBackend}`;

    // Endpoint por defecto, se puede sobreescribir en clases hijas
    protected resourceEndpoint: string = '/resources';

    // Inyección de HttpClient para hacer llamadas HTTP
    protected http: HttpClient = inject(HttpClient);

    // Manejo de errores centralizado para todas las peticiones
    public handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('An error occurred:', error.error.message);
        } else {
            console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
        }
        // Retorna un observable de error personalizado
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }

    // Método para obtener la URL completa del recurso
    private resourcePath() {
        return `${this.serverBaseUrl}${this.resourceEndpoint}`;
    }

    // Crea un recurso en el backend (POST)
    public create(resource: T): Observable<T> {
        return this.http.post<T>(this.resourcePath(), JSON.stringify(resource), this.httpOptions)
            .pipe(retry(2), catchError(this.handleError));
    }

    // Elimina un recurso por ID (DELETE)
    public delete(id: any): Observable<any> {
        return this.http.delete(`${this.resourcePath()}/${id}`, this.httpOptions)
            .pipe(retry(2), catchError(this.handleError));
    }

    // Actualiza un recurso por ID (PUT)
    public update(id: any, resource: T): Observable<T> {
        return this.http.put<T>(`${this.resourcePath()}/${id}`, JSON.stringify(resource), this.httpOptions)
            .pipe(retry(2), catchError(this.handleError));
    }

    // Obtiene todos los recursos (GET)
    public getAll(): Observable<Array<T>> {
        return this.http.get<Array<T>>(this.resourcePath(), this.httpOptions)
            .pipe(retry(2), catchError(this.handleError));
    }

    // Obtiene un recurso por ID (GET)
    public getById(id: any): Observable<T> {
        return this.http.get<T>(`${this.resourcePath()}/${id}`, this.httpOptions)
            .pipe(retry(2), catchError(this.handleError));
    }

    public getByQuery(param: string, value: any): Observable<Array<T>> {
        const url = `${this.resourcePath()}?${param}=${value}`;
        return this.http.get<Array<T>>(url, this.httpOptions)
            .pipe(retry(2), catchError(this.handleError));
    }

    public deleteByCompositeKey(keys: { [key: string]: any }): Observable<any> {
    const params = new URLSearchParams();
    Object.entries(keys).forEach(([k, v]) => params.append(k, v));
    return this.http.delete(`${this.resourcePath()}?${params.toString()}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }


}
