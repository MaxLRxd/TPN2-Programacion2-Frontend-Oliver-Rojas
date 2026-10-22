import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Sede } from '../../../models/sede';
import { ApiError } from '../../../services/api';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { SedeService } from '../../../services/sede';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';
import { SedeFormDialog, SedeFormDialogData } from './sede-form-dialog';

@Component({
  selector: 'app-sedes',
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
  templateUrl: './sedes.html',
  styleUrl: './sedes.css',
})
export class Sedes implements OnInit {
  private sedeService = inject(SedeService);
  private dialog = inject(MatDialog);
  private confirmDialog = inject(ConfirmDialogService);

  readonly sedes = signal<Sede[]>([]);
  readonly filtro = signal('');
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly eliminandoId = signal<number | null>(null);

  readonly sedesFiltradas = computed(() => {
    const texto = this.filtro().trim().toLocaleLowerCase('es');
    if (!texto) {
      return this.sedes();
    }

    return this.sedes().filter((sede) =>
      [sede.nombre, sede.direccion, sede.telefono].some((valor) =>
        valor.toLocaleLowerCase('es').includes(texto),
      ),
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.errorAccion.set('');

    this.sedeService.listar().subscribe({
      next: (sedes) => {
        this.sedes.set(sedes);
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.errorCarga.set(e?.mensaje || 'No se pudieron cargar las sedes.');
        this.cargando.set(false);
      },
    });
  }

  nuevaSede(): void {
    this.abrirFormulario(null);
  }

  editarSede(sede: Sede): void {
    this.abrirFormulario(sede);
  }

  eliminarSede(sede: Sede): void {
    this.errorAccion.set('');

    this.confirmDialog
      .confirmar({
        titulo: 'Eliminar sede',
        mensaje: `¿Está seguro de eliminar la sede "${sede.nombre}"?`,
        textoConfirmar: 'Eliminar',
        color: 'warn',
        icono: 'delete_outline',
      })
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.eliminandoId.set(sede.id);
        this.sedeService.eliminar(sede.id).subscribe({
          next: () => {
            this.sedes.update((sedes) => sedes.filter((item) => item.id !== sede.id));
            this.eliminandoId.set(null);
          },
          error: (e: ApiError) => {
            this.errorAccion.set(e?.mensaje || 'No se pudo eliminar la sede.');
            this.eliminandoId.set(null);
          },
        });
      });
  }

  limpiarFiltro(): void {
    this.filtro.set('');
  }

  private abrirFormulario(sede: Sede | null): void {
    this.errorAccion.set('');

    this.dialog
      .open<SedeFormDialog, SedeFormDialogData, Sede>(SedeFormDialog, {
        width: '520px',
        maxWidth: '95vw',
        data: { sede },
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((guardada) => {
        if (guardada) {
          this.aplicarSedeGuardada(guardada);
        }
      });
  }

  private aplicarSedeGuardada(sede: Sede): void {
    this.sedes.update((sedes) => {
      const existe = sedes.some((item) => item.id === sede.id);
      const actualizadas = existe
        ? sedes.map((item) => (item.id === sede.id ? sede : item))
        : [...sedes, sede];
      return actualizadas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    });
  }
}
