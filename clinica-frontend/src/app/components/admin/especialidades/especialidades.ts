import { Component, inject } from '@angular/core';
import { map } from 'rxjs';

import { EspecialidadService } from '../../../services/especialidad';
import {
  CatalogoSimple,
  CatalogoSimpleConfig,
} from '../catalogo-simple/catalogo-simple';

@Component({
  selector: 'app-especialidades',
  imports: [CatalogoSimple],
  template: '<app-catalogo-simple [config]="config" />',
})
export class Especialidades {
  private especialidadService = inject(EspecialidadService);

  readonly config: CatalogoSimpleConfig = {
    titulo: 'Especialidades',
    subtitulo: 'Administrá las especialidades médicas de la clínica.',
    icono: 'medical_services',
    iconoVacio: 'medical_services',
    etiqueta: 'Descripción',
    singular: 'especialidad',
    plural: 'especialidades',
    maxLongitud: 30,
    listar: () =>
      this.especialidadService
        .listar()
        .pipe(map((items) => items.map((item) => ({ id: item.id, texto: item.descripcion })))),
    crear: (texto) =>
      this.especialidadService
        .crear({ descripcion: texto })
        .pipe(map((item) => ({ id: item.id, texto: item.descripcion }))),
    actualizar: (id, texto) =>
      this.especialidadService
        .actualizar(id, { descripcion: texto })
        .pipe(map((item) => ({ id: item.id, texto: item.descripcion }))),
    eliminar: (id) => this.especialidadService.eliminar(id),
  };
}
