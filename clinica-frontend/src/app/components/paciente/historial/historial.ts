import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Historial } from '../../../models/historial';
import { Medico } from '../../../models/medico';
import { ApiError } from '../../../services/api';
import { AuthService } from '../../../services/auth';
import { HistorialService } from '../../../services/historial';
import { MedicoService } from '../../../services/medico';
import { formatearFechaHora } from '../../../utils/fecha';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-paciente-historial',
  imports: [MatCardModule, MatIconModule, PageHeader, LoadingState, ErrorState, EmptyState],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class PacienteHistorial implements OnInit {
  private auth = inject(AuthService);
  private historialService = inject(HistorialService);
  private medicoService = inject(MedicoService);

  readonly historial = signal<Historial[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly formatearFechaHora = formatearFechaHora;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.cargarMedicos();

    const idPaciente = this.auth.getUsuario()?.id;
    if (!idPaciente) {
      this.auth.cargarPerfil().subscribe({
        next: (usuario) => {
          if (!usuario.id) {
            this.error.set('No se pudo identificar al paciente.');
            this.cargando.set(false);
            return;
          }
          this.cargarHistorial(usuario.id);
        },
        error: (e: ApiError) => {
          this.error.set(e?.mensaje || 'No se pudo cargar el perfil del paciente.');
          this.cargando.set(false);
        },
      });
      return;
    }

    this.cargarHistorial(idPaciente);
  }

  nombreMedico(id: number): string {
    const medico = this.medicos().find((item) => item.id === id);
    return medico ? `${medico.apellido}, ${medico.nombre}` : `Médico #${id}`;
  }

  private cargarHistorial(idPaciente: number): void {
    this.historialService.consultarPorPaciente(idPaciente).subscribe({
      next: (historial) => {
        this.historial.set(
          [...historial].sort((a, b) => b.fecha_registro.localeCompare(a.fecha_registro)),
        );
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudo cargar tu historial clínico.');
        this.cargando.set(false);
      },
    });
  }

  private cargarMedicos(): void {
    this.medicoService.listar().subscribe({
      next: (medicos) => this.medicos.set(medicos),
      error: () => this.medicos.set([]),
    });
  }
}
