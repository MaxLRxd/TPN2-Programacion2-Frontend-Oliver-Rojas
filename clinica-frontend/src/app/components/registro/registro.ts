import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CoberturaService } from '../../services/cobertura';
import { Cobertura } from '../../models/cobertura';
import { RegistroForm } from '../../models/auth';
import { ApiError } from '../../services/api';

/** Valida que la fecha no sea posterior a hoy (fecha de nacimiento). */
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
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private coberturaService = inject(CoberturaService);
  private router = inject(Router);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(30)]],
    apellido: ['', [Validators.required, Validators.maxLength(30)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{1,8}$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(30)]],
    password: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
    coberturaId: [null as number | null, [Validators.required]],
  });

  coberturas: Cobertura[] = [];
  readonly cargando = signal(false);
  readonly cargandoCoberturas = signal(true);
  readonly error = signal('');
  readonly success = signal('');

  /** Tope del input type=date: hoy. */
  readonly maxFecha = new Date().toISOString().slice(0, 10);

  get nombre() {
    return this.form.controls.nombre;
  }

  get apellido() {
    return this.form.controls.apellido;
  }

  get dni() {
    return this.form.controls.dni;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get fechaNacimiento() {
    return this.form.controls.fechaNacimiento;
  }

  get coberturaId() {
    return this.form.controls.coberturaId;
  }

  ngOnInit(): void {
    this.cargarCoberturas();
  }

  cargarCoberturas(): void {
    this.cargandoCoberturas.set(true);
    this.coberturaService.obtenerCoberturas().subscribe({
      next: (coberturas) => {
        this.coberturas = coberturas;
        this.cargandoCoberturas.set(false);
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudieron cargar las coberturas');
        this.cargandoCoberturas.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.success.set('');
    this.cargando.set(true);

    const v = this.form.getRawValue();
    const datos: RegistroForm = {
      nombre: (v.nombre ?? '').trim(),
      apellido: (v.apellido ?? '').trim(),
      dni: (v.dni ?? '').trim(),
      email: (v.email ?? '').trim(),
      password: v.password ?? '',
      fechaNacimiento: v.fechaNacimiento ?? '',
      coberturaId: v.coberturaId as number,
    };

    this.auth.registro(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.success.set('Registro exitoso. Te llevamos al login...');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'Error en el registro');
        this.cargando.set(false);
      },
    });
  }
}