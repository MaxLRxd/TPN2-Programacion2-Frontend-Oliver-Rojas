import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HistorialPayload } from '../../../models/historial';
import { EstadoTurno, Turno } from '../../../models/turno';
import { ApiError } from '../../../services/api';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { HistorialService } from '../../../services/historial';
import { TurnoService } from '../../../services/turno';
import { calcularEdad, hoyISO } from '../../../utils/fecha';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';
import { AtenderTurnoDialog } from './atender-turno-dialog';

@Component({
  selector: 'app-medico-turnos',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    PageHeader,
    LoadingState,
    ErrorState,
    EmptyState,
  ],
  templateUrl: './turnos.html',
  styleUrl: './turnos.css',
})
export class MedicoTurnos implements OnInit {
  private turnoService = inject(TurnoService);
  private historialService = inject(HistorialService);
  private confirmDialog = inject(ConfirmDialogService);
  private dialog = inject(MatDialog);

  readonly turnos = signal<Turno[]>([]);
  readonly fecha = signal(hoyISO());
  readonly filtroSede = signal<number | null>(null);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly expandidoId = signal<number | null>(null);
  readonly atendiendoId = signal<number | null>(null);
  readonly cancelandoId = signal<number | null>(null);

  readonly sedes = computed(() => {
    const mapa = new Map<number, string>();
    for (const turno of this.turnos()) {
      if (turno.id_sede && turno.sede) {
        mapa.set(turno.id_sede, turno.sede);
      }
    }
    return [...mapa.entries()].map(([id, nombre]) => ({ id, nombre }));
  });

  readonly turnosFiltrados = computed(() => {
    const sede = this.filtroSede();
    return this.turnos()
      .filter((turno) => sede === null || turno.id_sede === sede)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.turnoService.listarPorMedico(this.fecha()).subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.errorCarga.set(e?.mensaje || 'No se pudieron cargar los turnos.');
        this.cargando.set(false);
      },
    });
  }

  cambiarFecha(valor: string): void {
    if (!valor) {
      return;
    }
    this.fecha.set(valor);
    this.expandidoId.set(null);
    this.cargar();
  }

  toggleDetalle(turno: Turno): void {
    this.expandidoId.update((id) => (id === turno.id ? null : turno.id));
  }

  atender(turno: Turno): void {
    this.errorAccion.set('');

    this.dialog
      .open<AtenderTurnoDialog, Turno, HistorialPayload>(AtenderTurnoDialog, {
        width: '560px',
        maxWidth: '95vw',
        data: turno,
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((historial) => {
        if (!historial) {
          return;
        }

        this.atendiendoId.set(turno.id);
        this.turnoService.atender(turno.id).subscribe({
          next: () => this.registrarHistorial(historial),
          error: (e: ApiError) => {
            this.errorAccion.set(e?.mensaje || 'No se pudo marcar el turno como atendido.');
            this.atendiendoId.set(null);
          },
        });
      });
  }

  cancelar(turno: Turno): void {
    this.errorAccion.set('');

    this.confirmDialog
      .confirmar({
        titulo: 'Cancelar turno',
        mensaje: `¿Está seguro de cancelar el turno de ${turno.paciente_apellido}, ${turno.paciente_nombre} de las ${turno.hora.slice(0, 5)}?`,
        textoConfirmar: 'Cancelar turno',
        color: 'warn',
        icono: 'event_busy',
      })
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.cancelandoId.set(turno.id);
        this.turnoService.cancelar(turno.id).subscribe({
          next: () => {
            this.actualizarEstado(turno.id, 'cancelado');
            this.cancelandoId.set(null);
          },
          error: (e: ApiError) => {
            this.errorAccion.set(e?.mensaje || 'No se pudo cancelar el turno.');
            this.cancelandoId.set(null);
          },
        });
      });
  }

  edad(turno: Turno): number | null {
    return calcularEdad(turno.paciente_fecha_nacimiento);
  }

  etiquetaEstado(estado: EstadoTurno): string {
    const etiquetas: Record<EstadoTurno, string> = {
      confirmado: 'Confirmado',
      cancelado: 'Cancelado',
      atendido: 'Atendido',
    };
    return etiquetas[estado];
  }

  claseEstado(estado: EstadoTurno): string {
    return `estado estado--${estado}`;
  }

  private registrarHistorial(historial: HistorialPayload): void {
    this.historialService.crear(historial).subscribe({
      next: () => {
        this.actualizarEstado(historial.id_turno, 'atendido');
        this.atendiendoId.set(null);
      },
      error: (e: ApiError) => {
        this.errorAccion.set(
          e?.mensaje || 'El turno quedó atendido, pero no se pudo guardar el historial clínico.',
        );
        this.atendiendoId.set(null);
        this.cargar();
      },
    });
  }

  private actualizarEstado(id: number, estado: EstadoTurno): void {
    this.turnos.update((turnos) =>
      turnos.map((turno) => (turno.id === id ? { ...turno, estado } : turno)),
    );
  }
}
