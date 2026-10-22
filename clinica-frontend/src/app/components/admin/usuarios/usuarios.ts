import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

import { Cobertura } from '../../../models/cobertura';
import { Especialidad } from '../../../models/especialidad';
import { Rol, ROLES } from '../../../models/rol';
import { Sede } from '../../../models/sede';
import { UsuarioAdmin, UsuarioAdminFiltros } from '../../../models/usuario-admin';
import { ApiError } from '../../../services/api';
import { CoberturaService } from '../../../services/cobertura';
import { EspecialidadService } from '../../../services/especialidad';
import { SedeService } from '../../../services/sede';
import { UsuarioAdminService } from '../../../services/usuario-admin';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';
import { UsuarioFormDialog, UsuarioFormDialogData } from './usuario-form-dialog';

@Component({
  selector: 'app-usuarios',
  imports: [
    ReactiveFormsModule,
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
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  readonly roles = ROLES;
  readonly limites = [10, 20, 50];

  private usuarioService = inject(UsuarioAdminService);
  private sedeService = inject(SedeService);
  private especialidadService = inject(EspecialidadService);
  private coberturaService = inject(CoberturaService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  readonly filtrosForm = this.fb.group({
    nombre: [''],
    apellido: [''],
    rol: [''],
    id_sede: [null as number | null],
  });

  readonly usuarios = signal<UsuarioAdmin[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly coberturas = signal<Cobertura[]>([]);

  readonly cargando = signal(true);
  readonly cargandoCatalogos = signal(true);
  readonly errorCarga = signal('');
  readonly errorCatalogos = signal('');

  readonly pagina = signal(1);
  readonly limite = signal(10);
  readonly total = signal(0);
  readonly totalPaginas = signal(0);

  readonly desde = computed(() =>
    this.total() === 0 ? 0 : (this.pagina() - 1) * this.limite() + 1,
  );
  readonly hasta = computed(() => Math.min(this.pagina() * this.limite(), this.total()));
  readonly hayPaginaAnterior = computed(() => this.pagina() > 1);
  readonly hayPaginaSiguiente = computed(() => this.pagina() < this.totalPaginas());

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargar(1);
  }

  cargar(pagina = 1): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    const valores = this.filtrosForm.getRawValue();
    const filtros: UsuarioAdminFiltros = {
      pagina,
      limite: this.limite(),
      nombre: valores.nombre?.trim() || undefined,
      apellido: valores.apellido?.trim() || undefined,
      rol: (valores.rol || undefined) as Rol | undefined,
      id_sede: valores.id_sede ?? undefined,
    };

    this.usuarioService.listar(filtros).subscribe({
      next: (respuesta) => {
        this.usuarios.set(respuesta.usuarios);
        this.total.set(respuesta.total);
        this.pagina.set(respuesta.pagina);
        this.limite.set(respuesta.limite);
        this.totalPaginas.set(respuesta.totalPaginas);
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.errorCarga.set(e?.mensaje || 'No se pudieron cargar los usuarios.');
        this.cargando.set(false);
      },
    });
  }

  buscar(): void {
    this.cargar(1);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({ nombre: '', apellido: '', rol: '', id_sede: null });
    this.cargar(1);
  }

  cambiarLimite(limite: number): void {
    this.limite.set(limite);
    this.cargar(1);
  }

  paginaAnterior(): void {
    if (this.hayPaginaAnterior()) {
      this.cargar(this.pagina() - 1);
    }
  }

  paginaSiguiente(): void {
    if (this.hayPaginaSiguiente()) {
      this.cargar(this.pagina() + 1);
    }
  }

  nuevoUsuario(): void {
    this.abrirFormulario(null);
  }

  editarUsuario(usuario: UsuarioAdmin): void {
    this.abrirFormulario(usuario);
  }

  hayFiltros(): boolean {
    const valores = this.filtrosForm.getRawValue();
    return !!(valores.nombre?.trim() || valores.apellido?.trim() || valores.rol || valores.id_sede);
  }

  etiquetaRol(rol: Rol | string): string {
    const etiquetas: Record<string, string> = {
      admin: 'Administrador',
      medico: 'Médico',
      operador: 'Operador',
      paciente: 'Paciente',
    };
    return etiquetas[rol] ?? rol;
  }

  asignacion(usuario: UsuarioAdmin): string {
    if (usuario.rol === 'admin') {
      return 'Todas las sedes';
    }
    if (usuario.rol === 'paciente') {
      return usuario.cobertura || 'Sin cobertura';
    }
    return usuario.sede || 'Sin sede';
  }

  especialidadesTexto(usuario: UsuarioAdmin): string {
    return usuario.especialidades?.map((item) => item.descripcion).join(', ') || '—';
  }

  cargarCatalogos(): void {
    this.cargandoCatalogos.set(true);
    this.errorCatalogos.set('');

    forkJoin({
      sedes: this.sedeService.listar(),
      especialidades: this.especialidadService.listar(),
      coberturas: this.coberturaService.obtenerCoberturas(),
    }).subscribe({
      next: ({ sedes, especialidades, coberturas }) => {
        this.sedes.set(sedes);
        this.especialidades.set(especialidades);
        this.coberturas.set(coberturas);
        this.cargandoCatalogos.set(false);
      },
      error: (e: ApiError) => {
        this.errorCatalogos.set(
          e?.mensaje || 'No se pudieron cargar sedes, especialidades y coberturas.',
        );
        this.cargandoCatalogos.set(false);
      },
    });
  }

  private abrirFormulario(usuario: UsuarioAdmin | null): void {
    if (this.cargandoCatalogos() || this.errorCatalogos()) {
      return;
    }

    const datos: UsuarioFormDialogData = {
      usuario,
      sedes: this.sedes(),
      especialidades: this.especialidades(),
      coberturas: this.coberturas(),
    };

    this.dialog
      .open<UsuarioFormDialog, UsuarioFormDialogData, UsuarioAdmin>(UsuarioFormDialog, {
        width: '720px',
        maxWidth: '95vw',
        data: datos,
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) {
          this.cargar(this.pagina());
        }
      });
  }
}
