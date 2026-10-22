import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { Turno } from '../../../models/turno';
import { PageHeader } from '../../shared/page-header/page-header';
import { TurnoWizard } from '../../shared/turno-wizard/turno-wizard';

@Component({
  selector: 'app-paciente-sacar-turno',
  imports: [MatButtonModule, MatCardModule, MatIconModule, PageHeader, TurnoWizard],
  templateUrl: './sacar-turno.html',
  styleUrl: './sacar-turno.css',
})
export class PacienteSacarTurno {
  private router = inject(Router);

  readonly turnoCreado = signal<Turno | null>(null);

  onCreado(turno: Turno): void {
    this.turnoCreado.set(turno);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  sacarOtro(): void {
    this.turnoCreado.set(null);
  }

  verMisTurnos(): void {
    this.router.navigate(['/paciente/turnos']);
  }
}
