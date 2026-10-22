import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-state',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './error-state.html',
  styleUrl: './error-state.css',
})
export class ErrorState {
  readonly titulo = input('No se pudo cargar la información');
  readonly mensaje = input('Ocurrió un error inesperado.');
  readonly mostrarReintentar = input(true);
  readonly textoReintentar = input('Reintentar');
  readonly reintentar = output<void>();
}
