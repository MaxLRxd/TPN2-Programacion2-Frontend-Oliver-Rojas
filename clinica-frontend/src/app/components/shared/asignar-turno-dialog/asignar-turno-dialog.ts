import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Turno } from '../../../models/turno';
import { UsuarioAdmin } from '../../../models/usuario-admin';
import { TurnoWizard } from '../turno-wizard/turno-wizard';

export interface AsignarTurnoDialogData {
  paciente: UsuarioAdmin | null;
  sedeFija: number | null;
}

@Component({
  selector: 'app-asignar-turno-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, TurnoWizard],
  templateUrl: './asignar-turno-dialog.html',
  styleUrl: './asignar-turno-dialog.css',
})
export class AsignarTurnoDialog {
  readonly datos = inject<AsignarTurnoDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<AsignarTurnoDialog, Turno>);

  cerrar(turno: Turno): void {
    this.ref.close(turno);
  }

  cancelar(): void {
    this.ref.close();
  }
}
