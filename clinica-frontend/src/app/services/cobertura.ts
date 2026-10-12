import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cobertura } from '../models/cobertura';

@Injectable({
  providedIn: 'root',
})
export class CoberturaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/coberturas`;

  obtenerCoberturas(): Observable<Cobertura[]> {
    return this.http.get<Cobertura[]>(this.apiUrl);
  }
}

