import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Cobertura } from '../models/cobertura';

@Injectable({
  providedIn: 'root',
})
export class CoberturaService {
  private api = inject(ApiService);

  obtenerCoberturas(): Observable<Cobertura[]> {
    return this.api.get<Cobertura[]>('/coberturas');
  }
}