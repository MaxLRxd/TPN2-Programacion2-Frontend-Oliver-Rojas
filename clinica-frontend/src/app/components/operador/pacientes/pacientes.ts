import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { Turno } from '../../../models/turno';
import { UsuarioAdmin } from '../../../models/usuario-admin';
import { ApiError } from '../../../services/api';
import { AuthService } from '../../../services/auth';
import { PacienteService } from '../../../services/paciente';
import {
  AsignarTurnoDialog,
  AsignarTurnoDialogData,
} from '../../shared/asignar-turno-dialog/asignar-turno-dialog';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';
import { PacienteFormDialog } from '../../shared/paciente-form-dialog/paciente-form-dialog';

@Component({
  selector: 'app-operador-pacientes',
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
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css',
})
export class OperadorPacientes implements OnInit {
  private pacienteService = inject(PacienteService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);

  readonly busqueda = signal('');
  readonly pacientes = signal<UsuarioAdmin[]>([]);
  readonly buscando = signal(true);
  readonly error = signal('');
  readonly exito = signal('');
  readonly errorAccion = signal('');

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.buscando.set(true);
    this.error.set('');

    this.pacienteService.buscar(this.busqueda().trim()).subscribe({
      next: (pacientes) => {
        this.pacientes.set(pacientes);
        this.buscando.set(false);
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudieron buscar pacientes.');
        this.buscando.set(false);
      },
    });
  }

  limpiar(): void {
    this.busqueda.set('');
    this.buscar();
  }

  nuevoPaciente(): void {
    this.exito.set('');
    this.errorAccion.set('');

    this.dialog
      .open<PacienteFormDialog, Record<string, never>>(PacienteFormDialog, {
        width: '680px',
        maxWidth: '95vw',
        data: {},
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((paciente) => {
        if (paciente) {
          this.exito.set(
            `Paciente ${paciente.apellido}, ${paciente.nombre} registrado correctamente.`,
          );
          this.busqueda.set(paciente.dni ?? '');
          this.buscar();
        }
      });
  }

  asignarTurno(paciente: UsuarioAdmin): void {
    this.exito.set('');
    this.errorAccion.set('');

    this.dialog
      .open<AsignarTurnoDialog, AsignarTurnoDialogData, Turno>(AsignarTurnoDialog, {
        width: '940px',
        maxWidth: '95vw',
        data: { paciente, sedeFija: this.auth.getUsuario()?.id_sede ?? null },
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((turno) => {
        if (turno) {
          this.exito.set(
            `Turno asignado a ${paciente.apellido}, ${paciente.nombre} para el ${turno.fecha} a las ${turno.hora}.`,
          );
        }
      });
  }
}
