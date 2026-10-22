import { Component, inject } from '@angular/core';
import { map } from 'rxjs';

import { CoberturaService } from '../../../services/cobertura';
import {
  CatalogoSimple,
  CatalogoSimpleConfig,
} from '../catalogo-simple/catalogo-simple';

@Component({
  selector: 'app-coberturas',
  imports: [CatalogoSimple],
  template: '<app-catalogo-simple [config]="config" />',
})
export class Coberturas {
  private coberturaService = inject(CoberturaService);

  readonly config: CatalogoSimpleConfig = {
    titulo: 'Coberturas',
    subtitulo: 'Administrá las coberturas disponibles para los pacientes.',
    icono: 'health_and_safety',
    iconoVacio: 'health_and_safety',
    etiqueta: 'Nombre',
    singular: 'cobertura',
    plural: 'coberturas',
    maxLongitud: 30,
    listar: () =>
      this.coberturaService
        .obtenerCoberturas()
        .pipe(map((items) => items.map((item) => ({ id: item.id, texto: item.nombre })))),
    crear: (texto) =>
      this.coberturaService
        .crear({ nombre: texto })
        .pipe(map((item) => ({ id: item.id, texto: item.nombre }))),
    actualizar: (id, texto) =>
      this.coberturaService
        .actualizar(id, { nombre: texto })
        .pipe(map((item) => ({ id: item.id, texto: item.nombre }))),
    eliminar: (id) => this.coberturaService.eliminar(id),
  };
}
