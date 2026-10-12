import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiError } from '../../services/api';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-mi-perfil',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private auth = inject(AuthService);

  readonly usuario = signal<Usuario | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.auth.cargarPerfil().subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.error.set(e?.mensaje || 'No se pudo cargar el perfil.');
        this.cargando.set(false);
      },
    });
  }

  /** Muestra un guion cuando el dato no vino en la respuesta. */
  mostrar(valor: unknown): string {
    return valor === null || valor === undefined || valor === '' ? '—' : String(valor);
  }
}
