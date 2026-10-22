import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Agenda } from '../../../models/agenda';
import { Medico } from '../../../models/medico';
import { Sede } from '../../../models/sede';
import { Turno } from '../../../models/turno';
import { Usuario } from '../../../models/usuario';
import { AgendaService } from '../../../services/agenda';
import { ApiError } from '../../../services/api';
import { AuthService } from '../../../services/auth';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { MedicoService } from '../../../services/medico';
import { SedeService } from '../../../services/sede';
import { hoyISO } from '../../../utils/fecha';
import {
  AgendaFormDialog,
  AgendaFormDialogData,
} from '../../shared/agenda-form-dialog/agenda-form-dialog';
import {
  AsignarTurnoDialog,
  AsignarTurnoDialogData,
} from '../../shared/asignar-turno-dialog/asignar-turno-dialog';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';
import { PacienteFormDialog } from '../../shared/paciente-form-dialog/paciente-form-dialog';
import { TurnosMedicoDialog, TurnosMedicoDialogData } from './turnos-medico-dialog';

@Component({
  selector: 'app-operador-agenda',
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
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class OperadorAgenda implements OnInit {
  private agendaService = inject(AgendaService);
  private sedeService = inject(SedeService);
  private medicoService = inject(MedicoService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private confirmDialog = inject(ConfirmDialogService);

  readonly usuario = signal<Usuario | null>(this.auth.getUsuario());
  readonly agendas = signal<Agenda[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly fecha = signal(hoyISO());
  readonly sedeId = signal<number | null>(this.auth.getUsuario()?.id_sede ?? null);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly exito = signal('');
  readonly eliminandoId = signal<number | null>(null);

  readonly esSedePropia = computed(() => {
    const usuario = this.usuario();
    return usuario?.id_sede != null && this.sedeId() === usuario.id_sede;
  });

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.agendaService
      .listar({ fecha: this.fecha(), id_sede: this.sedeId() ?? undefined })
      .subscribe({
        next: (agendas) => {
          this.agendas.set(
            [...agendas].sort((a, b) => a.hora_entrada.localeCompare(b.hora_entrada)),
          );
          this.cargando.set(false);
        },
        error: (e: ApiError) => {
          this.errorCarga.set(e?.mensaje || 'No se pudo cargar la agenda.');
          this.cargando.set(false);
        },
      });
  }

  cambiarFecha(valor: string): void {
    if (!valor) {
      return;
    }
    this.exito.set('');
    this.fecha.set(valor);
    this.cargar();
  }

  cambiarSede(valor: number | null): void {
    this.exito.set('');
    this.sedeId.set(valor);
    this.cargar();
  }

  nuevaAgenda(): void {
    if (!this.esSedePropia()) {
      return;
    }
    this.abrirFormulario(null);
  }

  editarAgenda(agenda: Agenda): void {
    if (!this.esSedePropia()) {
      return;
    }
    this.abrirFormulario(agenda);
  }

  eliminarAgenda(agenda: Agenda): void {
    if (!this.esSedePropia()) {
      return;
    }

    this.errorAccion.set('');
    this.confirmDialog
      .confirmar({
        titulo: 'Eliminar rango horario',
        mensaje: `¿Está seguro de eliminar el rango de ${this.horario(agenda)} de ${agenda.medico_apellido}, ${agenda.medico_nombre}?`,
        textoConfirmar: 'Eliminar',
        color: 'warn',
        icono: 'delete_outline',
      })
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.eliminandoId.set(agenda.id);
        this.agendaService.eliminar(agenda.id).subscribe({
          next: () => {
            this.agendas.update((items) => items.filter((item) => item.id !== agenda.id));
            this.eliminandoId.set(null);
          },
          error: (e: ApiError) => {
            this.errorAccion.set(e?.mensaje || 'No se pudo eliminar el rango horario.');
            this.eliminandoId.set(null);
          },
        });
      });
  }

  verTurnos(agenda: Agenda): void {
    if (!this.esSedePropia()) {
      return;
    }

    this.errorAccion.set('');
    this.dialog
      .open<TurnosMedicoDialog, TurnosMedicoDialogData>(TurnosMedicoDialog, {
        width: '700px',
        maxWidth: '95vw',
        data: {
          idMedico: agenda.id_medico,
          medicoNombre: `${agenda.medico_apellido}, ${agenda.medico_nombre}`,
          fecha: this.fecha(),
        },
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe();
  }

  nuevoPaciente(): void {
    this.exito.set('');
    this.errorAccion.set('');

    this.dialog
      .open<PacienteFormDialog>(PacienteFormDialog, {
        width: '680px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((paciente) => {
        if (paciente) {
          this.exito.set(
            `Paciente ${paciente.apellido}, ${paciente.nombre} registrado correctamente.`,
          );
        }
      });
  }

  asignarTurno(): void {
    if (!this.esSedePropia()) {
      return;
    }

    this.exito.set('');
    this.errorAccion.set('');

    this.dialog
      .open<AsignarTurnoDialog, AsignarTurnoDialogData, Turno>(AsignarTurnoDialog, {
        width: '940px',
        maxWidth: '95vw',
        data: { paciente: null, sedeFija: this.sedeId() },
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((turno) => {
        if (turno) {
          this.exito.set(`Turno asignado para el ${turno.fecha} a las ${turno.hora}.`);
        }
      });
  }

  horario(agenda: Agenda): string {
    return `${agenda.hora_entrada.slice(0, 5)} a ${agenda.hora_salida.slice(0, 5)}`;
  }

  private cargarCatalogos(): void {
    this.sedeService.listar().subscribe({
      next: (sedes) => this.sedes.set(sedes),
      error: () => this.sedes.set([]),
    });
    this.medicoService.listar().subscribe({
      next: (medicos) => this.medicos.set(medicos),
      error: () => this.medicos.set([]),
    });
  }

  private abrirFormulario(agenda: Agenda | null): void {
    const sedePropia = this.usuario()?.id_sede ?? null;
    this.errorAccion.set('');

    this.dialog
      .open<AgendaFormDialog, AgendaFormDialogData>(AgendaFormDialog, {
        width: '680px',
        maxWidth: '95vw',
        data: {
          agenda,
          medicos: this.medicos(),
          sedes: this.sedes(),
          medicoIdFijo: agenda?.id_medico ?? null,
          sedeIdFija: agenda?.id_sede ?? sedePropia,
          fechaInicial: this.fecha(),
        },
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((guardada) => {
        if (guardada) {
          this.exito.set('Agenda guardada correctamente.');
          this.cargar();
        }
      });
  }
}
