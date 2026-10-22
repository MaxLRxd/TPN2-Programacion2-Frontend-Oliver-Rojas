import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Agenda } from '../../../models/agenda';
import { Medico } from '../../../models/medico';
import { Sede } from '../../../models/sede';
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
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-medico-agenda',
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
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class MedicoAgenda implements OnInit {
  private agendaService = inject(AgendaService);
  private sedeService = inject(SedeService);
  private medicoService = inject(MedicoService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private confirmDialog = inject(ConfirmDialogService);

  readonly agendas = signal<Agenda[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly fecha = signal(hoyISO());
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly eliminandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    const filtros = this.fecha() ? { fecha: this.fecha() } : {};

    this.agendaService.listar(filtros).subscribe({
      next: (agendas) => {
        this.agendas.set([...agendas].sort((a, b) => a.hora_entrada.localeCompare(b.hora_entrada)));
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
    this.fecha.set(valor);
    this.cargar();
  }

  verTodasLasFechas(): void {
    this.fecha.set('');
    this.cargar();
  }

  nuevaAgenda(): void {
    this.abrirFormulario(null);
  }

  editarAgenda(agenda: Agenda): void {
    this.abrirFormulario(agenda);
  }

  eliminarAgenda(agenda: Agenda): void {
    this.errorAccion.set('');

    this.confirmDialog
      .confirmar({
        titulo: 'Eliminar rango horario',
        mensaje: `¿Está seguro de eliminar el rango de ${this.horario(agenda)}?`,
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
    const usuario = this.auth.getUsuario();
    const medicoPropio = this.medicos().filter((medico) => medico.id === usuario?.id);
    this.errorAccion.set('');

    this.dialog
      .open<AgendaFormDialog, AgendaFormDialogData>(AgendaFormDialog, {
        width: '680px',
        maxWidth: '95vw',
        data: {
          agenda,
          medicos: medicoPropio,
          sedes: this.sedes(),
          medicoIdFijo: usuario?.id ?? null,
          sedeInicial: usuario?.id_sede ?? null,
          fechaInicial: this.fecha(),
        },
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((guardada) => {
        if (!guardada) {
          return;
        }
        if (this.fecha() && guardada.fecha !== this.fecha()) {
          this.fecha.set(guardada.fecha);
        }
        this.cargar();
      });
  }
}
