import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  AuditoriaFiltros,
  AuditoriaOpcionUsuario,
  AuditoriaRegistro,
} from '../../../models/auditoria';
import { ApiError } from '../../../services/api';
import { AuditoriaService } from '../../../services/auditoria';
import { formatearFechaHora } from '../../../utils/fecha';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';

const ENTIDADES: Record<string, string> = {
  usuario: 'Usuario',
  sede: 'Sede',
  especialidad: 'Especialidad',
  cobertura: 'Cobertura',
};

const ACCIONES: Record<string, string> = {
  ALTA: 'Alta',
  BAJA: 'Baja',
  MODIFICACION: 'Modificación',
};

@Component({
  selector: 'app-auditoria',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    PageHeader,
    LoadingState,
    ErrorState,
    EmptyState,
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class Auditoria implements OnInit {
  readonly limites = [10, 20, 50];
  readonly formatearFechaHora = formatearFechaHora;

  private auditoriaService = inject(AuditoriaService);
  private fb = inject(FormBuilder);

  readonly filtrosForm = this.fb.group({
    id_usuario: [null as number | null],
    entidad: [''],
    fecha_desde: [''],
    fecha_hasta: [''],
  });

  readonly registros = signal<AuditoriaRegistro[]>([]);
  readonly filtrosAplicados = signal<AuditoriaFiltros>({});
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorFiltros = signal('');
  readonly pagina = signal(1);
  readonly limite = signal(10);

  readonly usuariosFiltro = computed<AuditoriaOpcionUsuario[]>(() => {
    const usuarios = new Map<number, string>();
    for (const registro of this.registros()) {
      if (!usuarios.has(registro.id_usuario)) {
        usuarios.set(
          registro.id_usuario,
          registro.nombre_usuario?.trim() || `Usuario #${registro.id_usuario}`,
        );
      }
    }

    return [...usuarios.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  });

  readonly entidadesFiltro = computed(() =>
    [...new Set(this.registros().map((registro) => registro.entidad))].sort((a, b) =>
      this.etiquetaEntidad(a).localeCompare(this.etiquetaEntidad(b), 'es'),
    ),
  );

  readonly registrosFiltrados = computed(() => {
    const filtros = this.filtrosAplicados();
    const desde = filtros.fecha_desde;
    const hasta = filtros.fecha_hasta;

    return this.registros()
      .filter((registro) => {
        const fecha = registro.fecha.slice(0, 10);
        return (
          (!filtros.id_usuario || registro.id_usuario === filtros.id_usuario) &&
          (!filtros.entidad || registro.entidad === filtros.entidad) &&
          (!desde || fecha >= desde) &&
          (!hasta || fecha <= hasta)
        );
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
  });

  readonly total = computed(() => this.registrosFiltrados().length);
  readonly totalPaginas = computed(() => Math.ceil(this.total() / this.limite()));
  readonly desde = computed(() =>
    this.total() === 0 ? 0 : (this.pagina() - 1) * this.limite() + 1,
  );
  readonly hasta = computed(() => Math.min(this.pagina() * this.limite(), this.total()));
  readonly hayPaginaAnterior = computed(() => this.pagina() > 1);
  readonly hayPaginaSiguiente = computed(() => this.pagina() < this.totalPaginas());
  readonly registrosPagina = computed(() => {
    const inicio = (this.pagina() - 1) * this.limite();
    return this.registrosFiltrados().slice(inicio, inicio + this.limite());
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.auditoriaService.listar().subscribe({
      next: (registros) => {
        this.registros.set(registros);
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.errorCarga.set(e?.mensaje || 'No se pudo cargar la auditoría.');
        this.cargando.set(false);
      },
    });
  }

  aplicarFiltros(): void {
    const valores = this.filtrosForm.getRawValue();
    const desde = valores.fecha_desde || undefined;
    const hasta = valores.fecha_hasta || undefined;

    if (desde && hasta && desde > hasta) {
      this.errorFiltros.set('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }

    this.errorFiltros.set('');
    this.filtrosAplicados.set({
      id_usuario: valores.id_usuario ?? undefined,
      entidad: valores.entidad || undefined,
      fecha_desde: desde,
      fecha_hasta: hasta,
    });
    this.pagina.set(1);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      id_usuario: null,
      entidad: '',
      fecha_desde: '',
      fecha_hasta: '',
    });
    this.filtrosAplicados.set({});
    this.errorFiltros.set('');
    this.pagina.set(1);
  }

  hayFiltros(): boolean {
    const filtros = this.filtrosAplicados();
    return !!(filtros.id_usuario || filtros.entidad || filtros.fecha_desde || filtros.fecha_hasta);
  }

  cambiarLimite(limite: number): void {
    this.limite.set(limite);
    this.pagina.set(1);
  }

  paginaAnterior(): void {
    if (this.hayPaginaAnterior()) {
      this.pagina.update((pagina) => pagina - 1);
    }
  }

  paginaSiguiente(): void {
    if (this.hayPaginaSiguiente()) {
      this.pagina.update((pagina) => pagina + 1);
    }
  }

  etiquetaUsuario(registro: AuditoriaRegistro): string {
    return registro.nombre_usuario?.trim() || `Usuario #${registro.id_usuario}`;
  }

  etiquetaEntidad(entidad: string): string {
    return ENTIDADES[entidad] ?? entidad;
  }

  etiquetaAccion(accion: string): string {
    return ACCIONES[accion] ?? accion;
  }

  claseAccion(accion: string): string {
    return ACCIONES[accion] ? accion.toLowerCase() : 'otra';
  }

  detalle(registro: AuditoriaRegistro): string {
    return registro.detalle?.trim() || '—';
  }
}
