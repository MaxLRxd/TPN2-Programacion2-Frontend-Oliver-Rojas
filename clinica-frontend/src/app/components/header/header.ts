import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  auth = inject(AuthService);
  private router = inject(Router);

  get usuario() {
    return this.auth.getUsuario();
  }

  get nombre() {
    const u = this.usuario;
    return u ? `${u.nombre} ${u.apellido}` : '';
  }

  get tipo() {
    const u = this.usuario;
    return u?.rol || '';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}

