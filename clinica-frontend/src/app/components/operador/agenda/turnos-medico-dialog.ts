import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Turno } from '../../../models/turno';
import { ApiError } from '../../../services/api';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { TurnoService } from '../../../services/turno';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';

export interface TurnosMedicoDialogData {
  idMedico: number;
  medicoNombre: string;
  fecha: string;
}

@Component({
  selector: 'app-turnos-medico-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, LoadingState, ErrorState, EmptyState],
  templateUrl: './turnos-medico-dialog.html',
  styleUrl: './turnos-medico-dialog.css',
})
export class TurnosMedicoDialog implements OnInit {
  readonly datos = inject<TurnosMedicoDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<TurnosMedicoDialog, boolean>);
  private turnoService = inject(TurnoService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly cancelandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.turnoService.listarPorSede(this.datos.fecha).subscribe({
      next: (turnos) => {
        this.turnos.set(
          turnos
            .filter((turno) => turno.id_medico === this.datos.idMedico)
            .sort((a, b) => a.hora.localeCompare(b.hora)),
        );
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.errorCarga.set(e?.mensaje || 'No se pudieron cargar los turnos.');
        this.cargando.set(false);
      },
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

  cerrar(): void {
    this.ref.close(true);
  }
}
