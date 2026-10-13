import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ApiError } from '../../services/api';
import { rutaInicioPorRol } from '../../config/menu.config';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    password: ['', Validators.required],
  });

  readonly cargando = signal(false);
  readonly error = signal('');

  get dni() {
    return this.form.controls.dni;
  }

  get password() {
    return this.form.controls.password;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (resp) => {
        this.cargando.set(false);
        this.router.navigateByUrl(rutaInicioPorRol(resp.usuario?.rol));
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'Error al iniciar sesión');
        this.cargando.set(false);
      },
    });
  }
}