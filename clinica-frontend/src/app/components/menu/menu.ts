import { Component, inject, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MenuItem } from '../../models/menu-item';

@Component({
  selector: 'app-menu',
  imports: [MatListModule, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  private auth = inject(AuthService);
  items: MenuItem[] = [];

  ngOnInit(): void {
    const u = this.auth.getUsuario();
    const rol = (u?.rol || '').toUpperCase();
    if (!this.auth.isLoggedIn()) {
      this.items = [];
      return;
    }
    if (rol === 'ADMIN') {
      this.items = [
        { titulo: 'Usuarios', ruta: '/admin/usuarios' },
      ];
    } else if (rol === 'MEDICO') {
      this.items = [{ titulo: 'Agenda', ruta: '/medico/agenda' }];
    } else if (rol === 'OPERADOR') {
      this.items = [{ titulo: 'Turnos', ruta: '/operador/turnos' }];
    } else if (rol === 'PACIENTE') {
      this.items = [{ titulo: 'Mis turnos', ruta: '/paciente/turnos' }];
    }
  }
}

