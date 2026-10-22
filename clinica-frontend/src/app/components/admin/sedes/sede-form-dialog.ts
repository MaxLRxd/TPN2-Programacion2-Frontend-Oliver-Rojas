import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Sede, SedePayload } from '../../../models/sede';
import { ApiError } from '../../../services/api';
import { SedeService } from '../../../services/sede';

export interface SedeFormDialogData {
  sede: Sede | null;
}

function sinSoloEspacios(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { sinContenido: true };
}

@Component({
  selector: 'app-sede-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sede-form-dialog.html',
  styleUrl: './sede-form-dialog.css',
})
export class SedeFormDialog {
  readonly datos = inject<SedeFormDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<SedeFormDialog, Sede>);
  private sedeService = inject(SedeService);
  private fb = inject(FormBuilder);

  readonly esEdicion = this.datos.sede !== null;
  readonly guardando = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    nombre: [
      this.datos.sede?.nombre ?? '',
      [Validators.required, sinSoloEspacios, Validators.maxLength(50)],
    ],
    direccion: [
      this.datos.sede?.direccion ?? '',
      [Validators.required, sinSoloEspacios, Validators.maxLength(100)],
    ],
    telefono: [
      this.datos.sede?.telefono ?? '',
      [
        Validators.required,
        sinSoloEspacios,
        Validators.maxLength(15),
        Validators.pattern(/^[0-9+\s()\-]{6,15}$/),
      ],
    ],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos: SedePayload = {
      nombre: this.form.controls.nombre.value.trim(),
      direccion: this.form.controls.direccion.value.trim(),
      telefono: this.form.controls.telefono.value.trim(),
    };
    const sede = this.datos.sede;
    const peticion = sede
      ? this.sedeService.actualizar(sede.id, datos)
      : this.sedeService.crear(datos);

    this.guardando.set(true);
    this.error.set('');

    peticion.subscribe({
      next: (guardada) => {
        this.ref.close(guardada);
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudo guardar la sede.');
        this.guardando.set(false);
      },
    });
  }

  cancelar(): void {
    this.ref.close();
  }

  mensajeError(campo: 'nombre' | 'direccion' | 'telefono'): string {
    const control = this.form.controls[campo];

    if (control.hasError('required') || control.hasError('sinContenido')) {
      return 'Este campo es obligatorio.';
    }
    if (control.hasError('maxlength')) {
      const maximo = control.getError('maxlength')?.requiredLength;
      return `Máximo ${maximo} caracteres.`;
    }
    if (control.hasError('pattern')) {
      return campo === 'telefono'
        ? 'Ingresá un teléfono válido de 6 a 15 caracteres.'
        : 'Ingresá un valor válido.';
    }
    return 'Ingresá un valor válido.';
  }
}
