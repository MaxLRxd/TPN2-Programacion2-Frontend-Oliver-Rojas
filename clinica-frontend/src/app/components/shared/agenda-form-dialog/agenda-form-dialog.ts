import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Agenda, AgendaCreada, AgendaPayload } from '../../../models/agenda';
import { Especialidad } from '../../../models/especialidad';
import { Medico } from '../../../models/medico';
import { Sede } from '../../../models/sede';
import { AgendaService } from '../../../services/agenda';
import { ApiError } from '../../../services/api';
import { hoyISO } from '../../../utils/fecha';

export interface AgendaFormDialogData {
  agenda: Agenda | null;
  medicos: Medico[];
  sedes: Sede[];
  medicoIdFijo?: number | null;
  sedeIdFija?: number | null;
  fechaInicial?: string;
}

function minutosHora(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

@Component({
  selector: 'app-agenda-form-dialog',
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
  templateUrl: './agenda-form-dialog.html',
  styleUrl: './agenda-form-dialog.css',
})
export class AgendaFormDialog {
  readonly datos = inject<AgendaFormDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<AgendaFormDialog, AgendaCreada>);
  private agendaService = inject(AgendaService);
  private fb = inject(FormBuilder);

  readonly esEdicion = this.datos.agenda !== null;
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly errorHorario = signal('');

  readonly sedesDisponibles = computed(() => {
    const sedeFija = this.datos.sedeIdFija;
    return sedeFija ? this.datos.sedes.filter((sede) => sede.id === sedeFija) : this.datos.sedes;
  });

  readonly form = this.fb.group({
    fecha: [this.datos.agenda?.fecha ?? this.datos.fechaInicial ?? hoyISO(), [Validators.required]],
    hora_entrada: [this.datos.agenda?.hora_entrada?.slice(0, 5) ?? '', [Validators.required]],
    hora_salida: [this.datos.agenda?.hora_salida?.slice(0, 5) ?? '', [Validators.required]],
    id_medico: this.fb.control<number | null>(
      this.datos.agenda?.id_medico ?? this.datos.medicoIdFijo ?? null,
      [Validators.required],
    ),
    id_especialidad: this.fb.control<number | null>(this.datos.agenda?.id_especialidad ?? null, [
      Validators.required,
    ]),
    id_sede: this.fb.control<number | null>(
      this.datos.agenda?.id_sede ?? this.datos.sedeIdFija ?? null,
      [Validators.required],
    ),
  });

  readonly medicoSeleccionadoId = signal<number | null>(this.form.controls.id_medico.value);

  readonly especialidadesDisponibles = computed<Especialidad[]>(() => {
    const medico = this.datos.medicos.find((item) => item.id === this.medicoSeleccionadoId());
    return medico?.especialidades ?? [];
  });

  constructor() {
    this.form.controls.id_medico.valueChanges.pipe(takeUntilDestroyed()).subscribe((idMedico) => {
      this.medicoSeleccionadoId.set(idMedico);
      const especialidad = this.form.controls.id_especialidad.value;
      if (
        especialidad !== null &&
        !this.especialidadesDisponibles().some((item) => item.id === especialidad)
      ) {
        this.form.controls.id_especialidad.setValue(null);
      }
    });
  }

  guardar(): void {
    this.errorHorario.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const entrada = valores.hora_entrada ?? '';
    const salida = valores.hora_salida ?? '';

    if (minutosHora(salida) <= minutosHora(entrada)) {
      this.errorHorario.set('La hora de salida debe ser posterior a la hora de entrada.');
      return;
    }

    const payload: AgendaPayload = {
      fecha: valores.fecha ?? '',
      hora_entrada: entrada,
      hora_salida: salida,
      id_especialidad: valores.id_especialidad as number,
      id_sede: valores.id_sede as number,
    };

    if (valores.id_medico !== null) {
      payload.id_medico = valores.id_medico;
    }

    const agenda = this.datos.agenda;
    const peticion = agenda
      ? this.agendaService.actualizar(agenda.id, payload)
      : this.agendaService.crear(payload);

    this.guardando.set(true);
    this.error.set('');

    peticion.subscribe({
      next: (guardada) => this.ref.close(guardada),
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudo guardar el rango horario.');
        this.guardando.set(false);
      },
    });
  }

  cancelar(): void {
    this.ref.close();
  }

  nombreMedico(id: number | null): string {
    const medico = this.datos.medicos.find((item) => item.id === id);
    return medico ? `${medico.apellido}, ${medico.nombre}` : 'Médico';
  }
}
