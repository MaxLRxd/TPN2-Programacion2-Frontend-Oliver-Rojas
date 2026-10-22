import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiError } from '../../../services/api';
import type { CatalogoItem, CatalogoSimpleConfig } from './catalogo-simple';

export interface CatalogoFormDialogData {
  item: CatalogoItem | null;
  config: CatalogoSimpleConfig;
}

function sinSoloEspacios(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { sinContenido: true };
}

@Component({
  selector: 'app-catalogo-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './catalogo-form-dialog.html',
  styleUrl: './catalogo-form-dialog.css',
})
export class CatalogoFormDialog {
  readonly datos = inject<CatalogoFormDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<CatalogoFormDialog, CatalogoItem>);
  private fb = inject(FormBuilder);

  readonly esEdicion = this.datos.item !== null;
  readonly guardando = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    texto: [
      this.datos.item?.texto ?? '',
      [
        Validators.required,
        sinSoloEspacios,
        Validators.maxLength(this.datos.config.maxLongitud),
      ],
    ],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const texto = this.form.controls.texto.value.trim();
    const item = this.datos.item;
    const peticion = item
      ? this.datos.config.actualizar(item.id, texto)
      : this.datos.config.crear(texto);

    this.guardando.set(true);
    this.error.set('');

    peticion.subscribe({
      next: (guardado) => {
        this.ref.close(guardado);
      },
      error: (e: ApiError) => {
        this.error.set(
          e?.mensaje || `No se pudo guardar la ${this.datos.config.singular}.`,
        );
        this.guardando.set(false);
      },
    });
  }

  cancelar(): void {
    this.ref.close();
  }

  mensajeError(): string {
    const control = this.form.controls.texto;

    if (control.hasError('required') || control.hasError('sinContenido')) {
      return 'Este campo es obligatorio.';
    }
    if (control.hasError('maxlength')) {
      const maximo = control.getError('maxlength')?.requiredLength;
      return `Máximo ${maximo} caracteres.`;
    }
    return 'Ingresá un valor válido.';
  }
}
