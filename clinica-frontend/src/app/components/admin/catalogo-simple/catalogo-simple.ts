import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';

import { ApiError } from '../../../services/api';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';
import { CatalogoFormDialog, CatalogoFormDialogData } from './catalogo-form-dialog';

export interface CatalogoItem {
  id: number;
  texto: string;
}

export interface CatalogoSimpleConfig {
  titulo: string;
  subtitulo: string;
  icono: string;
  iconoVacio: string;
  etiqueta: string;
  singular: string;
  plural: string;
  maxLongitud: number;
  listar: () => Observable<CatalogoItem[]>;
  crear: (texto: string) => Observable<CatalogoItem>;
  actualizar: (id: number, texto: string) => Observable<CatalogoItem>;
  eliminar: (id: number) => Observable<{ id: number }>;
}

@Component({
  selector: 'app-catalogo-simple',
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
  templateUrl: './catalogo-simple.html',
  styleUrl: './catalogo-simple.css',
})
export class CatalogoSimple implements OnInit {
  readonly config = input.required<CatalogoSimpleConfig>();

  private dialog = inject(MatDialog);
  private confirmDialog = inject(ConfirmDialogService);

  readonly items = signal<CatalogoItem[]>([]);
  readonly filtro = signal('');
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly eliminandoId = signal<number | null>(null);

  readonly itemsFiltrados = computed(() => {
    const texto = this.filtro().trim().toLocaleLowerCase('es');
    if (!texto) {
      return this.items();
    }

    return this.items().filter((item) => item.texto.toLocaleLowerCase('es').includes(texto));
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.errorAccion.set('');

    this.config().listar().subscribe({
      next: (items) => {
        this.items.set(items);
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.errorCarga.set(e?.mensaje || `No se pudieron cargar ${this.config().plural}.`);
        this.cargando.set(false);
      },
    });
  }

  nuevo(): void {
    this.abrirFormulario(null);
  }

  editar(item: CatalogoItem): void {
    this.abrirFormulario(item);
  }

  eliminar(item: CatalogoItem): void {
    this.errorAccion.set('');

    this.confirmDialog
      .confirmar({
        titulo: `Eliminar ${this.config().singular}`,
        mensaje: `¿Está seguro de eliminar la ${this.config().singular} "${item.texto}"?`,
        textoConfirmar: 'Eliminar',
        color: 'warn',
        icono: 'delete_outline',
      })
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.eliminandoId.set(item.id);
        this.config()
          .eliminar(item.id)
          .subscribe({
            next: () => {
              this.items.update((items) => items.filter((actual) => actual.id !== item.id));
              this.eliminandoId.set(null);
            },
            error: (e: ApiError) => {
              this.errorAccion.set(e?.mensaje || `No se pudo eliminar la ${this.config().singular}.`);
              this.eliminandoId.set(null);
            },
          });
      });
  }

  limpiarFiltro(): void {
    this.filtro.set('');
  }

  private abrirFormulario(item: CatalogoItem | null): void {
    this.errorAccion.set('');

    this.dialog
      .open<CatalogoFormDialog, CatalogoFormDialogData, CatalogoItem>(CatalogoFormDialog, {
        width: '520px',
        maxWidth: '95vw',
        data: { item, config: this.config() },
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) {
          this.aplicarGuardado(guardado);
        }
      });
  }

  private aplicarGuardado(item: CatalogoItem): void {
    this.items.update((items) => {
      const existe = items.some((actual) => actual.id === item.id);
      const actualizados = existe
        ? items.map((actual) => (actual.id === item.id ? item : actual))
        : [...items, item];
      return actualizados.sort((a, b) => a.texto.localeCompare(b.texto, 'es'));
    });
  }
}
