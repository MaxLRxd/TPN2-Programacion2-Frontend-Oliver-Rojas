import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';

import { Cobertura } from '../../../models/cobertura';
import { Especialidad } from '../../../models/especialidad';
import { Medico } from '../../../models/medico';
import { Sede } from '../../../models/sede';
import { Turno, TurnoPayload } from '../../../models/turno';
import { UsuarioAdmin } from '../../../models/usuario-admin';
import { ApiError } from '../../../services/api';
import { AuthService } from '../../../services/auth';
import { CoberturaService } from '../../../services/cobertura';
import { DisponibilidadService } from '../../../services/disponibilidad';
import { EspecialidadService } from '../../../services/especialidad';
import { MedicoService } from '../../../services/medico';
import { PacienteService } from '../../../services/paciente';
import { SedeService } from '../../../services/sede';
import { TurnoService } from '../../../services/turno';
import { EmptyState } from '../empty-state/empty-state';
import { ErrorState } from '../error-state/error-state';
import { LoadingState } from '../loading-state/loading-state';
import { formatearFecha } from '../../../utils/fecha';

export type TurnoWizardModo = 'paciente' | 'operador';
export type TurnoWizardPaso =
  'paciente' | 'especialidad' | 'sede' | 'medico' | 'fecha' | 'horario' | 'nota' | 'confirmar';

export interface ResumenTurno {
  paciente: string;
  especialidad: string;
  medico: string;
  sede: string;
  fecha: string;
  hora: string;
  cobertura: string;
}

function sinSoloEspacios(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { sinContenido: true };
}

@Component({
  selector: 'app-turno-wizard',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    EmptyState,
    ErrorState,
    LoadingState,
  ],
  templateUrl: './turno-wizard.html',
  styleUrl: './turno-wizard.css',
})
export class TurnoWizard implements OnInit {
  readonly formatearFecha = formatearFecha;
  readonly modo = input<TurnoWizardModo>('paciente');
  readonly pacienteInicial = input<UsuarioAdmin | null>(null);
  readonly sedeFija = input<number | null>(null);
  readonly creado = output<Turno>();

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private especialidadService = inject(EspecialidadService);
  private sedeService = inject(SedeService);
  private coberturaService = inject(CoberturaService);
  private medicoService = inject(MedicoService);
  private disponibilidadService = inject(DisponibilidadService);
  private pacienteService = inject(PacienteService);
  private turnoService = inject(TurnoService);

  readonly pasos = computed<TurnoWizardPaso[]>(() =>
    this.modo() === 'operador'
      ? ['paciente', 'especialidad', 'sede', 'medico', 'fecha', 'horario', 'nota', 'confirmar']
      : ['especialidad', 'sede', 'medico', 'fecha', 'horario', 'nota', 'confirmar'],
  );
  readonly paso = signal(0);
  readonly pasoActual = computed<TurnoWizardPaso>(
    () => this.pasos()[this.paso()] ?? 'especialidad',
  );

  readonly especialidades = signal<Especialidad[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly coberturas = signal<Cobertura[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly fechas = signal<string[]>([]);
  readonly horarios = signal<string[]>([]);

  readonly cargandoCatalogos = signal(true);
  readonly cargandoMedicos = signal(false);
  readonly cargandoFechas = signal(false);
  readonly cargandoHorarios = signal(false);
  readonly guardando = signal(false);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');

  readonly especialidadId = signal<number | null>(null);
  readonly sedeId = signal<number | null>(null);
  readonly medicoId = signal<number | null>(null);
  readonly fecha = signal('');
  readonly hora = signal('');

  readonly pacienteSeleccionado = signal<UsuarioAdmin | null>(null);
  readonly busquedaPaciente = signal('');
  readonly resultadosPacientes = signal<UsuarioAdmin[]>([]);
  readonly buscandoPacientes = signal(false);
  readonly errorPacientes = signal('');

  readonly nota = this.fb.nonNullable.control('', [
    Validators.required,
    sinSoloEspacios,
    Validators.maxLength(255),
  ]);

  readonly resumen = computed<ResumenTurno>(() => {
    const paciente = this.pacienteSeleccionado();
    const usuario = this.auth.getUsuario();
    const coberturaId = this.modo() === 'operador' ? paciente?.id_cobertura : usuario?.id_cobertura;
    const cobertura = this.coberturas().find((item) => item.id === coberturaId);

    return {
      paciente: paciente
        ? `${paciente.apellido}, ${paciente.nombre}`
        : this.modo() === 'paciente'
          ? `${usuario?.apellido ?? ''}, ${usuario?.nombre ?? ''}`.replace(/^, |, $/g, '')
          : '',
      especialidad:
        this.especialidades().find((item) => item.id === this.especialidadId())?.descripcion ?? '',
      medico: this.nombreMedico(this.medicoId()),
      sede: this.sedes().find((item) => item.id === this.sedeId())?.nombre ?? '',
      fecha: this.fecha(),
      hora: this.hora(),
      cobertura: cobertura?.nombre ?? paciente?.cobertura ?? 'Sin cobertura',
    };
  });

  ngOnInit(): void {
    const fija = this.sedeFija();
    if (fija) {
      this.sedeId.set(fija);
    }

    const paciente = this.pacienteInicial();
    if (paciente) {
      this.pacienteSeleccionado.set(paciente);
    }

    this.cargarCatalogos();

    if (this.modo() === 'operador' && !paciente) {
      this.buscarPacientes();
    }
  }

  cargarCatalogos(): void {
    this.cargandoCatalogos.set(true);
    this.errorCarga.set('');

    forkJoin({
      especialidades: this.especialidadService.listar(),
      sedes: this.sedeService.listar(),
      coberturas: this.coberturaService.obtenerCoberturas(),
    }).subscribe({
      next: ({ especialidades, sedes, coberturas }) => {
        this.especialidades.set(especialidades);
        this.sedes.set(sedes);
        this.coberturas.set(coberturas);
        this.cargandoCatalogos.set(false);
      },
      error: (e: ApiError) => {
        this.errorCarga.set(e?.mensaje || 'No se pudieron cargar los catálogos.');
        this.cargandoCatalogos.set(false);
      },
    });
  }

  buscarPacientes(): void {
    this.buscandoPacientes.set(true);
    this.errorPacientes.set('');

    this.pacienteService.buscar(this.busquedaPaciente().trim()).subscribe({
      next: (pacientes) => {
        this.resultadosPacientes.set(pacientes);
        this.buscandoPacientes.set(false);
      },
      error: (e: ApiError) => {
        this.errorPacientes.set(e?.mensaje || 'No se pudieron buscar pacientes.');
        this.buscandoPacientes.set(false);
      },
    });
  }

  seleccionarPaciente(paciente: UsuarioAdmin): void {
    this.pacienteSeleccionado.set(paciente);
  }

  cambiarPaciente(): void {
    this.pacienteSeleccionado.set(null);
  }

  seleccionarEspecialidad(id: number): void {
    if (this.especialidadId() === id) {
      return;
    }
    this.especialidadId.set(id);
    this.limpiarDesdeSede();
    if (this.sedeId() !== null) {
      this.cargarMedicos();
    }
  }

  seleccionarSede(id: number): void {
    if (this.sedeId() === id) {
      return;
    }
    this.sedeId.set(id);
    this.limpiarDesdeMedico();
    this.cargarMedicos();
  }

  seleccionarMedico(id: number): void {
    if (this.medicoId() === id) {
      return;
    }
    this.medicoId.set(id);
    this.limpiarDesdeFecha();
    this.cargarFechas();
  }

  seleccionarFecha(fecha: string): void {
    if (this.fecha() === fecha) {
      return;
    }
    this.fecha.set(fecha);
    this.hora.set('');
    this.horarios.set([]);
    this.cargarHorarios();
  }

  seleccionarHora(hora: string): void {
    this.hora.set(hora);
  }

  continuar(): void {
    const actual = this.pasoActual();

    if (!this.pasoCompleto(actual)) {
      if (actual === 'nota') {
        this.nota.markAsTouched();
        this.nota.updateValueAndValidity();
      }
      return;
    }

    if (actual === 'sede' && this.medicos().length === 0) {
      this.cargarMedicos();
    }

    this.errorAccion.set('');
    this.paso.update((valor) => Math.min(valor + 1, this.pasos().length - 1));
  }

  volver(): void {
    this.errorAccion.set('');
    this.paso.update((valor) => Math.max(valor - 1, 0));
  }

  pasoCompleto(paso: TurnoWizardPaso): boolean {
    switch (paso) {
      case 'paciente':
        return this.pacienteSeleccionado() !== null;
      case 'especialidad':
        return this.especialidadId() !== null;
      case 'sede':
        return this.sedeId() !== null;
      case 'medico':
        return this.medicoId() !== null;
      case 'fecha':
        return this.fecha() !== '';
      case 'horario':
        return this.hora() !== '';
      case 'nota':
        return this.nota.valid;
      case 'confirmar':
        return true;
    }
  }

  esUltimoPaso(): boolean {
    return this.paso() === this.pasos().length - 1;
  }

  indicePaso(nombre: TurnoWizardPaso): number {
    return this.pasos().indexOf(nombre);
  }

  etiquetaPaso(nombre: TurnoWizardPaso): string {
    const etiquetas: Record<TurnoWizardPaso, string> = {
      paciente: 'Paciente',
      especialidad: 'Especialidad',
      sede: 'Sede',
      medico: 'Médico',
      fecha: 'Fecha',
      horario: 'Horario',
      nota: 'Nota',
      confirmar: 'Confirmar',
    };
    return etiquetas[nombre];
  }

  /** Muestra la especialidad elegida si el médico la tiene; si no, la primera que atiende. */
  especialidadDe(medico: Medico): string {
    const elegida = medico.especialidades.find((item) => item.id === this.especialidadId());
    return (elegida ?? medico.especialidades[0])?.descripcion || 'Médico';
  }

  nombreMedico(id: number | null): string {
    const medico = this.medicos().find((item) => item.id === id);
    return medico ? `${medico.apellido}, ${medico.nombre}` : '';
  }

  recargarPaso(): void {
    switch (this.pasoActual()) {
      case 'paciente':
        this.buscarPacientes();
        break;
      case 'medico':
        this.cargarMedicos();
        break;
      case 'fecha':
        this.cargarFechas();
        break;
      case 'horario':
        this.cargarHorarios();
        break;
      default:
        this.cargarCatalogos();
        break;
    }
  }

  confirmar(): void {
    if (!this.pasoCompleto('nota')) {
      this.nota.markAsTouched();
      return;
    }

    const payload: TurnoPayload = {
      id_especialidad: this.especialidadId() as number,
      id_sede: this.sedeId() as number,
      id_medico: this.medicoId() as number,
      fecha: this.fecha(),
      hora: this.hora(),
      nota: this.nota.value.trim(),
    };

    const paciente = this.pacienteSeleccionado();
    if (this.modo() === 'operador' && paciente) {
      payload.id_paciente = paciente.id;
    }

    this.guardando.set(true);
    this.errorAccion.set('');

    this.turnoService.crear(payload).subscribe({
      next: (turno) => {
        this.guardando.set(false);
        const medico = this.medicos().find((item) => item.id === this.medicoId());
        this.creado.emit({
          ...turno,
          especialidad: turno.especialidad ?? this.resumen().especialidad,
          sede: turno.sede ?? this.resumen().sede,
          medico_nombre: turno.medico_nombre ?? medico?.nombre,
          medico_apellido: turno.medico_apellido ?? medico?.apellido,
        });
      },
      error: (e: ApiError) => {
        this.guardando.set(false);

        if (e?.codigo === 409) {
          this.hora.set('');
          this.paso.set(this.indicePaso('horario'));
          this.cargarHorarios();
        }

        this.errorAccion.set(e?.mensaje || 'No se pudo confirmar el turno.');
      },
    });
  }

  private cargarMedicos(): void {
    const especialidad = this.especialidadId();
    const sede = this.sedeId();
    if (especialidad === null || sede === null) {
      return;
    }

    this.cargandoMedicos.set(true);
    this.errorAccion.set('');

    this.medicoService.listar({ especialidad, sede }).subscribe({
      next: (medicos) => {
        this.medicos.set(medicos);
        this.medicoId.set(null);
        this.limpiarDesdeFecha();
        this.cargandoMedicos.set(false);
      },
      error: (e: ApiError) => {
        this.errorAccion.set(e?.mensaje || 'No se pudieron cargar los médicos.');
        this.cargandoMedicos.set(false);
      },
    });
  }

  private cargarFechas(): void {
    const especialidad = this.especialidadId();
    const sede = this.sedeId();
    const medico = this.medicoId();
    if (especialidad === null || sede === null || medico === null) {
      return;
    }

    this.cargandoFechas.set(true);
    this.errorAccion.set('');
    this.fechas.set([]);
    this.fecha.set('');
    this.hora.set('');
    this.horarios.set([]);

    this.disponibilidadService
      .fechas({ id_medico: medico, id_especialidad: especialidad, id_sede: sede })
      .subscribe({
        next: (fechas) => {
          this.fechas.set(fechas);
          this.cargandoFechas.set(false);
        },
        error: (e: ApiError) => {
          this.errorAccion.set(e?.mensaje || 'No se pudieron cargar las fechas disponibles.');
          this.cargandoFechas.set(false);
        },
      });
  }

  private cargarHorarios(): void {
    const especialidad = this.especialidadId();
    const sede = this.sedeId();
    const medico = this.medicoId();
    if (especialidad === null || sede === null || medico === null || !this.fecha()) {
      return;
    }

    this.cargandoHorarios.set(true);
    this.errorAccion.set('');
    this.horarios.set([]);

    this.disponibilidadService
      .horarios({
        id_medico: medico,
        id_especialidad: especialidad,
        id_sede: sede,
        fecha: this.fecha(),
      })
      .subscribe({
        next: (horarios) => {
          this.horarios.set(horarios);
          this.cargandoHorarios.set(false);
        },
        error: (e: ApiError) => {
          this.errorAccion.set(e?.mensaje || 'No se pudieron cargar los horarios disponibles.');
          this.cargandoHorarios.set(false);
        },
      });
  }

  private limpiarDesdeSede(): void {
    if (this.sedeFija() === null) {
      this.sedeId.set(null);
    }
    this.limpiarDesdeMedico();
  }

  private limpiarDesdeMedico(): void {
    this.medicoId.set(null);
    this.medicos.set([]);
    this.limpiarDesdeFecha();
  }

  private limpiarDesdeFecha(): void {
    this.fecha.set('');
    this.hora.set('');
    this.fechas.set([]);
    this.horarios.set([]);
  }
}
