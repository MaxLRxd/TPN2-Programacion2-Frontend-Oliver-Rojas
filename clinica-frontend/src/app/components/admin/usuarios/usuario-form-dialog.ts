import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Cobertura } from '../../../models/cobertura';
import { Especialidad } from '../../../models/especialidad';
import { Rol, ROLES } from '../../../models/rol';
import { Sede } from '../../../models/sede';
import { UsuarioAdmin, UsuarioAdminPayload } from '../../../models/usuario-admin';
import { ApiError } from '../../../services/api';
import { UsuarioAdminService } from '../../../services/usuario-admin';

export interface UsuarioFormDialogData {
  usuario: UsuarioAdmin | null;
  sedes: Sede[];
  especialidades: Especialidad[];
  coberturas: Cobertura[];
}

type CampoFormulario =
  | 'nombre'
  | 'apellido'
  | 'dni'
  | 'email'
  | 'fecha_nacimiento'
  | 'telefono'
  | 'password'
  | 'rol'
  | 'id_sede'
  | 'id_cobertura'
  | 'especialidades';

const ROLES_ALTA: Rol[] = ['operador', 'medico', 'admin'];

function sinSoloEspacios(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { sinContenido: true };
}

function alMenosUno(control: AbstractControl): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length > 0 ? null : { requerido: true };
}

@Component({
  selector: 'app-usuario-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './usuario-form-dialog.html',
  styleUrl: './usuario-form-dialog.css',
})
export class UsuarioFormDialog {
  readonly datos = inject<UsuarioFormDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<UsuarioFormDialog, UsuarioAdmin>);
  private usuarioService = inject(UsuarioAdminService);
  private fb = inject(FormBuilder);

  readonly esEdicion = this.datos.usuario !== null;
  readonly rolesDisponibles: Rol[] = this.esEdicion ? [...ROLES] : ROLES_ALTA;
  readonly rolSeleccionado = signal<Rol>(this.datos.usuario?.rol ?? 'operador');
  readonly esStaff = computed(() => {
    const rol = this.rolSeleccionado();
    return rol === 'operador' || rol === 'medico';
  });

  readonly guardando = signal(false);
  readonly error = signal('');

  private readonly validadoresPassword = this.esEdicion
    ? [Validators.minLength(6)]
    : [Validators.required, Validators.minLength(6)];

  readonly form = this.fb.nonNullable.group({
    nombre: [
      this.datos.usuario?.nombre ?? '',
      [Validators.required, sinSoloEspacios, Validators.maxLength(30)],
    ],
    apellido: [
      this.datos.usuario?.apellido ?? '',
      [Validators.required, sinSoloEspacios, Validators.maxLength(30)],
    ],
    dni: [this.datos.usuario?.dni ?? '', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    email: [
      this.datos.usuario?.email ?? '',
      [Validators.required, Validators.email, Validators.maxLength(30)],
    ],
    fecha_nacimiento: [this.datos.usuario?.fecha_nacimiento ?? '', [Validators.required]],
    telefono: [
      this.datos.usuario?.telefono ?? '',
      [Validators.maxLength(10), Validators.pattern(/^[0-9+\s()\-]*$/)],
    ],
    password: ['', this.validadoresPassword],
    rol: [this.datos.usuario?.rol ?? 'operador', [Validators.required]],
    id_sede: this.fb.control<number | null>(this.datos.usuario?.id_sede ?? null),
    id_cobertura: this.fb.control<number | null>(this.datos.usuario?.id_cobertura ?? null),
    especialidades: this.fb.nonNullable.control<number[]>(
      this.datos.usuario?.especialidades?.map((item) => item.id) ?? [],
    ),
  });

  constructor() {
    this.form.controls.rol.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((rol) => this.aplicarRol(rol, true));
    this.aplicarRol(this.form.controls.rol.value, false);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const rol = valores.rol;
    const payload: UsuarioAdminPayload = {
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      dni: valores.dni.trim(),
      email: valores.email.trim(),
      rol,
      fecha_nacimiento: valores.fecha_nacimiento,
      telefono: valores.telefono.trim() || undefined,
      password: valores.password.trim() || undefined,
      id_sede: rol === 'operador' || rol === 'medico' ? valores.id_sede : null,
      id_cobertura: rol === 'paciente' ? valores.id_cobertura : null,
      especialidades: rol === 'medico' ? valores.especialidades : [],
    };
    const usuario = this.datos.usuario;
    const peticion = usuario
      ? this.usuarioService.actualizar(usuario.id, payload)
      : this.usuarioService.crear(payload);

    this.guardando.set(true);
    this.error.set('');

    peticion.subscribe({
      next: (guardado) => {
        this.ref.close(guardado);
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudo guardar el usuario.');
        this.guardando.set(false);
      },
    });
  }

  cancelar(): void {
    this.ref.close();
  }

  etiquetaRol(rol: Rol): string {
    const etiquetas: Record<Rol, string> = {
      admin: 'Administrador',
      medico: 'Médico',
      operador: 'Operador',
      paciente: 'Paciente',
    };
    return etiquetas[rol];
  }

  mensaje(campo: CampoFormulario): string {
    const control = this.form.controls[campo];

    if (
      control.hasError('required') ||
      control.hasError('sinContenido') ||
      control.hasError('requerido')
    ) {
      return 'Este campo es obligatorio.';
    }
    if (control.hasError('maxlength')) {
      const maximo = control.getError('maxlength')?.requiredLength;
      return `Máximo ${maximo} caracteres.`;
    }
    if (control.hasError('minlength')) {
      return 'Mínimo 6 caracteres.';
    }
    if (control.hasError('email')) {
      return 'Ingresá un email válido.';
    }
    if (control.hasError('pattern')) {
      return campo === 'dni' ? 'El DNI debe tener 7 u 8 dígitos.' : 'Ingresá un teléfono válido.';
    }
    return 'Ingresá un valor válido.';
  }

  private aplicarRol(rol: Rol, limpiar: boolean): void {
    this.rolSeleccionado.set(rol);

    const esStaff = rol === 'operador' || rol === 'medico';
    const sede = this.form.controls.id_sede;
    const cobertura = this.form.controls.id_cobertura;
    const especialidades = this.form.controls.especialidades;

    sede.setValidators(esStaff ? [Validators.required] : []);
    cobertura.setValidators(rol === 'paciente' ? [Validators.required] : []);
    especialidades.setValidators(rol === 'medico' ? [alMenosUno] : []);

    if (limpiar) {
      if (!esStaff) {
        sede.setValue(null);
      }
      if (rol !== 'paciente') {
        cobertura.setValue(null);
      }
      if (rol !== 'medico') {
        especialidades.setValue([]);
      }
    }

    sede.updateValueAndValidity({ emitEvent: false });
    cobertura.updateValueAndValidity({ emitEvent: false });
    especialidades.updateValueAndValidity({ emitEvent: false });
  }
}
