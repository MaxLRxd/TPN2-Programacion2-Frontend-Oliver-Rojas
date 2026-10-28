import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { Historial } from '../../../models/historial';
import { EstadoTurno, Turno } from '../../../models/turno';
import { ApiError } from '../../../services/api';
import { AuthService } from '../../../services/auth';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { HistorialService } from '../../../services/historial';
import { TurnoService } from '../../../services/turno';
import { fechaISO, formatearFecha } from '../../../utils/fecha';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';

type FiltroTurnos = 'proximos' | 'historial';

@Component({
  selector: 'app-paciente-turnos',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    PageHeader,
    LoadingState,
    ErrorState,
    EmptyState,
  ],
  templateUrl: './turnos.html',
  styleUrl: './turnos.css',
})
export class PacienteTurnos implements OnInit {
  private turnoService = inject(TurnoService);
  private historialService = inject(HistorialService);
  private auth = inject(AuthService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly turnos = signal<Turno[]>([]);
  /** Registros clínicos del paciente indexados por turno (se muestran en el detalle de los atendidos). */
  readonly historialPorTurno = signal<Record<number, Historial>>({});
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly filtro = signal<FiltroTurnos>('proximos');
  readonly expandidoId = signal<number | null>(null);
  readonly cancelandoId = signal<number | null>(null);

  readonly proximos = computed(() =>
    this.turnos()
      .filter((turno) => turno.estado === 'confirmado' && !this.esVencido(turno))
      .sort((a, b) => this.clave(a).localeCompare(this.clave(b))),
  );

  readonly historial = computed(() =>
    this.turnos()
      .filter((turno) => turno.estado !== 'confirmado' || this.esVencido(turno))
      .sort((a, b) => this.clave(b).localeCompare(this.clave(a))),
  );

  readonly turnosFiltrados = computed(() =>
    this.filtro() === 'proximos' ? this.proximos() : this.historial(),
  );

  readonly formatearFecha = formatearFecha;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.turnoService.listarPorPaciente().subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
        this.cargarHistorial();
      },
      error: (e: ApiError) => {
        this.errorCarga.set(e?.mensaje || 'No se pudieron cargar tus turnos.');
        this.cargando.set(false);
      },
    });
  }

  /** El historial es complementario: si falla, el detalle solo omite el resumen clínico. */
  private cargarHistorial(): void {
    const idActual = this.auth.getUsuario()?.id;
    const idPaciente$ = idActual
      ? of(idActual)
      : this.auth.cargarPerfil().pipe(switchMap((usuario) => of(usuario.id)));

    idPaciente$
      .pipe(
        switchMap((id) => (id ? this.historialService.consultarPorPaciente(id) : of([]))),
        catchError(() => of([] as Historial[])),
      )
      .subscribe((registros) => {
        this.historialPorTurno.set(
          Object.fromEntries(registros.map((registro) => [registro.id_turno, registro])),
        );
      });
  }

  cambiarFiltro(filtro: FiltroTurnos): void {
    this.filtro.set(filtro);
    this.expandidoId.set(null);
  }

  toggleDetalle(turno: Turno): void {
    this.expandidoId.update((id) => (id === turno.id ? null : turno.id));
  }

  cancelar(turno: Turno): void {
    this.errorAccion.set('');

    this.confirmDialog
      .confirmar({
        titulo: 'Cancelar turno',
        mensaje: `¿Querés cancelar tu turno del ${formatearFecha(turno.fecha)} a las ${turno.hora.slice(0, 5)} con ${turno.medico_apellido}, ${turno.medico_nombre}?`,
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
            this.turnos.update((turnos) =>
              turnos.map((item) =>
                item.id === turno.id ? { ...item, estado: 'cancelado' } : item,
              ),
            );
            this.cancelandoId.set(null);
          },
          error: (e: ApiError) => {
            this.errorAccion.set(e?.mensaje || 'No se pudo cancelar el turno.');
            this.cancelandoId.set(null);
          },
        });
      });
  }

  /** Turno confirmado cuya fecha y hora ya pasaron: no es "próximo" ni se puede cancelar. */
  esVencido(turno: Turno): boolean {
    return turno.estado === 'confirmado' && this.clave(turno) < this.ahora();
  }

  estadoVisible(turno: Turno): EstadoTurno | 'vencido' {
    return this.esVencido(turno) ? 'vencido' : turno.estado;
  }

  etiquetaEstado(estado: EstadoTurno | 'vencido'): string {
    const etiquetas: Record<EstadoTurno | 'vencido', string> = {
      confirmado: 'Confirmado',
      cancelado: 'Cancelado',
      atendido: 'Atendido',
      vencido: 'Vencido',
    };
    return etiquetas[estado];
  }

  private ahora(): string {
    const ahora = new Date();
    return `${fechaISO(ahora)}T${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  }

  private clave(turno: Turno): string {
    return `${turno.fecha}T${turno.hora}`;
  }
}
