import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';

import { Cobertura } from '../../../models/cobertura';
import { PerfilPacienteRequest } from '../../../models/auth';
import { Usuario } from '../../../models/usuario';
import { ApiError } from '../../../services/api';
import { AuthService } from '../../../services/auth';
import { CoberturaService } from '../../../services/cobertura';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-paciente-datos',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    PageHeader,
    LoadingState,
    ErrorState,
  ],
  templateUrl: './datos.html',
  styleUrl: './datos.css',
})
export class PacienteDatos implements OnInit {
  private auth = inject(AuthService);
  private coberturaService = inject(CoberturaService);
  private fb = inject(FormBuilder);

  readonly usuario = signal<Usuario | null>(null);
  readonly coberturas = signal<Cobertura[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(60)]],
    telefono: ['', [Validators.maxLength(30)]],
    coberturaId: this.fb.control<number | null>(null, [Validators.required]),
    password: ['', [Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.exito.set('');

    forkJoin({
      usuario: this.auth.cargarPerfil(),
      coberturas: this.coberturaService.obtenerCoberturas(),
    }).subscribe({
      next: ({ usuario, coberturas }) => {
        this.usuario.set(usuario);
        this.coberturas.set(coberturas);
        this.form.patchValue({
          email: usuario.email ?? '',
          telefono: usuario.telefono ?? '',
          coberturaId: usuario.id_cobertura ?? null,
          password: '',
        });
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudieron cargar tus datos.');
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const datos: PerfilPacienteRequest = {
      email: (valores.email ?? '').trim(),
      telefono: (valores.telefono ?? '').trim() || undefined,
      id_cobertura: valores.coberturaId ?? undefined,
    };

    const password = (valores.password ?? '').trim();
    if (password) {
      datos.password = password;
    }

    this.guardando.set(true);
    this.error.set('');
    this.exito.set('');

    this.auth.actualizarPerfil(datos).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.form.patchValue({ password: '' });
        this.form.markAsPristine();
        this.guardando.set(false);
        this.exito.set('Tus datos se actualizaron correctamente.');
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudieron actualizar tus datos.');
        this.guardando.set(false);
      },
    });
  }

  coberturaActual(): string {
    const id = this.usuario()?.id_cobertura;
    return this.coberturas().find((item) => item.id === id)?.nombre ?? 'Sin cobertura';
  }
}
