import { Component, inject, OnInit, signal } from '@angular/core';
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
import { RegistroForm } from '../../../models/auth';
import { Usuario } from '../../../models/usuario';
import { ApiError } from '../../../services/api';
import { AuthService } from '../../../services/auth';
import { CoberturaService } from '../../../services/cobertura';
import { hoyISO } from '../../../utils/fecha';

export type PacienteFormDialogData = Record<string, never>;

function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string;
  if (!valor) {
    return null;
  }
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    return { fechaInvalida: true };
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha.getTime() > hoy.getTime() ? { fechaFutura: true } : null;
}

@Component({
  selector: 'app-paciente-form-dialog',
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
  templateUrl: './paciente-form-dialog.html',
  styleUrl: './paciente-form-dialog.css',
})
export class PacienteFormDialog implements OnInit {
  readonly datos = inject<PacienteFormDialogData>(MAT_DIALOG_DATA, { optional: true });
  private ref = inject(MatDialogRef<PacienteFormDialog, Usuario>);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private coberturaService = inject(CoberturaService);

  readonly coberturas = signal<Cobertura[]>([]);
  readonly cargandoCoberturas = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly maxFecha = hoyISO();

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(30)]],
    apellido: ['', [Validators.required, Validators.maxLength(30)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
    coberturaId: this.fb.control<number | null>(null, [Validators.required]),
  });

  ngOnInit(): void {
    this.coberturaService.obtenerCoberturas().subscribe({
      next: (coberturas) => {
        this.coberturas.set(coberturas);
        this.cargandoCoberturas.set(false);
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudieron cargar las coberturas.');
        this.cargandoCoberturas.set(false);
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const datos: RegistroForm = {
      nombre: (valores.nombre ?? '').trim(),
      apellido: (valores.apellido ?? '').trim(),
      dni: (valores.dni ?? '').trim(),
      email: (valores.email ?? '').trim(),
      password: valores.password ?? '',
      fechaNacimiento: valores.fechaNacimiento ?? '',
      coberturaId: valores.coberturaId as number,
    };

    this.guardando.set(true);
    this.error.set('');

    this.auth.registro(datos).subscribe({
      next: (paciente) => this.ref.close(paciente),
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudo registrar el paciente.');
        this.guardando.set(false);
      },
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}
