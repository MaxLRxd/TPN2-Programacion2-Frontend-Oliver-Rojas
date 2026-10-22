import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { Historial } from '../../../models/historial';
import { UsuarioAdmin } from '../../../models/usuario-admin';
import { ApiError } from '../../../services/api';
import { HistorialService } from '../../../services/historial';
import { PacienteService } from '../../../services/paciente';
import { formatearFechaHora } from '../../../utils/fecha';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-medico-historial',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PageHeader,
    LoadingState,
    ErrorState,
    EmptyState,
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class MedicoHistorial {
  private pacienteService = inject(PacienteService);
  private historialService = inject(HistorialService);

  readonly busqueda = signal('');
  readonly buscando = signal(false);
  readonly buscado = signal(false);
  readonly pacientes = signal<UsuarioAdmin[]>([]);
  readonly pacienteSeleccionado = signal<UsuarioAdmin | null>(null);
  readonly historial = signal<Historial[]>([]);
  readonly cargandoHistorial = signal(false);
  readonly errorPacientes = signal('');
  readonly errorHistorial = signal('');
  readonly formatearFechaHora = formatearFechaHora;

  buscar(): void {
    this.buscando.set(true);
    this.buscado.set(true);
    this.errorPacientes.set('');

    this.pacienteService.buscar(this.busqueda().trim()).subscribe({
      next: (pacientes) => {
        this.pacientes.set(pacientes);
        this.buscando.set(false);
      },
      error: (e: ApiError) => {
        this.errorPacientes.set(e?.mensaje || 'No se pudieron buscar pacientes.');
        this.buscando.set(false);
      },
    });
  }

  seleccionarPaciente(paciente: UsuarioAdmin): void {
    this.pacienteSeleccionado.set(paciente);
    this.cargarHistorial(paciente);
  }

  cargarHistorial(paciente: UsuarioAdmin): void {
    this.cargandoHistorial.set(true);
    this.errorHistorial.set('');
    this.historial.set([]);

    this.historialService.consultarPorPaciente(paciente.id).subscribe({
      next: (historial) => {
        this.historial.set(historial);
        this.cargandoHistorial.set(false);
      },
      error: (e: ApiError) => {
        this.errorHistorial.set(e?.mensaje || 'No se pudo cargar el historial clínico.');
        this.cargandoHistorial.set(false);
      },
    });
  }

  limpiar(): void {
    this.busqueda.set('');
    this.pacientes.set([]);
    this.buscado.set(false);
    this.pacienteSeleccionado.set(null);
    this.historial.set([]);
    this.errorPacientes.set('');
    this.errorHistorial.set('');
  }
}
