import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EstadoTurno, Turno } from '../../../models/turno';
import { ApiError } from '../../../services/api';
import { AuthService } from '../../../services/auth';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { TurnoService } from '../../../services/turno';
import { hoyISO } from '../../../utils/fecha';
import {
  AsignarTurnoDialog,
  AsignarTurnoDialogData,
} from '../../shared/asignar-turno-dialog/asignar-turno-dialog';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-operador-turnos',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    PageHeader,
    LoadingState,
    ErrorState,
    EmptyState,
  ],
  templateUrl: './turnos.html',
  styleUrl: './turnos.css',
})
export class OperadorTurnos implements OnInit {
  private turnoService = inject(TurnoService);
  private confirmDialog = inject(ConfirmDialogService);
  private dialog = inject(MatDialog);
  private auth = inject(AuthService);

  readonly turnos = signal<Turno[]>([]);
  readonly fecha = signal(hoyISO());
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly exito = signal('');
  readonly expandidoId = signal<number | null>(null);
  readonly cancelandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.turnoService.listarPorSede(this.fecha()).subscribe({
      next: (turnos) => {
        this.turnos.set([...turnos].sort((a, b) => a.hora.localeCompare(b.hora)));
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.errorCarga.set(e?.mensaje || 'No se pudieron cargar los turnos de la sede.');
        this.cargando.set(false);
      },
    });
  }

  cambiarFecha(valor: string): void {
    if (!valor) {
      return;
    }
    this.exito.set('');
    this.expandidoId.set(null);
    this.fecha.set(valor);
    this.cargar();
  }

  toggleDetalle(turno: Turno): void {
    this.expandidoId.update((id) => (id === turno.id ? null : turno.id));
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

  asignarTurno(): void {
    this.exito.set('');
    this.errorAccion.set('');

    this.dialog
      .open<AsignarTurnoDialog, AsignarTurnoDialogData, Turno>(AsignarTurnoDialog, {
        width: '940px',
        maxWidth: '95vw',
        data: { paciente: null, sedeFija: this.auth.getUsuario()?.id_sede ?? null },
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((turno) => {
        if (turno) {
          this.exito.set(`Turno asignado para el ${turno.fecha} a las ${turno.hora}.`);
          if (turno.fecha === this.fecha()) {
            this.cargar();
          }
        }
      });
  }

  etiquetaEstado(estado: EstadoTurno): string {
    const etiquetas: Record<EstadoTurno, string> = {
      confirmado: 'Confirmado',
      cancelado: 'Cancelado',
      atendido: 'Atendido',
    };
    return etiquetas[estado];
  }
}
