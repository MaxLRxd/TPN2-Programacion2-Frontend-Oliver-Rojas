import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-mi-perfil',
  imports: [MatCardModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private auth = inject(AuthService);
  usuario: Usuario | null = null;

  ngOnInit(): void {
    this.usuario = this.auth.getUsuario();
    if (!this.usuario && this.auth.isLoggedIn()) {
      this.auth.cargarPerfil().subscribe((u) => (this.usuario = u));
    }
  }
}

