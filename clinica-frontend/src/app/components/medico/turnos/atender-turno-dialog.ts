import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { HistorialPayload } from '../../../models/historial';
import { Turno } from '../../../models/turno';

@Component({
  selector: 'app-atender-turno-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './atender-turno-dialog.html',
  styleUrl: './atender-turno-dialog.css',
})
export class AtenderTurnoDialog {
  readonly datos = inject<Turno>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<AtenderTurnoDialog, HistorialPayload>);
  private fb = inject(FormBuilder);

  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    diagnostico: ['', [Validators.required, Validators.maxLength(255)]],
    tratamiento: ['', [Validators.maxLength(255)]],
    observaciones: ['', [Validators.maxLength(255)]],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    if (!valores.diagnostico.trim()) {
      this.form.controls.diagnostico.setErrors({ sinContenido: true });
      this.form.controls.diagnostico.markAsTouched();
      return;
    }

    this.ref.close({
      id_turno: this.datos.id,
      diagnostico: valores.diagnostico.trim(),
      tratamiento: valores.tratamiento.trim() || null,
      observaciones: valores.observaciones.trim() || null,
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}
