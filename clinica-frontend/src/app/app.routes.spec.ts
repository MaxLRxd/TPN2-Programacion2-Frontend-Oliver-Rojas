import { Routes } from '@angular/router';

import { routes } from './app.routes';
import { MENU_POR_ROL } from './config/menu.config';

/** Recolecta todas las rutas declaradas (incluyendo los hijos) en su forma completa. */
function rutasDeclaradas(rutas: Routes, prefijo = ''): Set<string> {
  const declaradas = new Set<string>();
  for (const ruta of rutas) {
    const segmento = ruta.path ?? '';
    const completo = `/${[prefijo, segmento].filter(Boolean).join('/')}`.replace(/\/+/g, '/');
    declaradas.add(completo);
    if (ruta.children) {
      for (const hija of rutasDeclaradas(ruta.children, `${prefijo}/${segmento}`)) {
        declaradas.add(hija);
      }
    }
  }
  return declaradas;
}

describe('app.routes', () => {
  it('declara una ruta para cada opción del menú', () => {
    const declaradas = rutasDeclaradas(routes);
    for (const items of Object.values(MENU_POR_ROL)) {
      for (const item of items) {
        expect(declaradas.has(item.ruta)).toBe(true);
      }
    }
  });

  it('deja el comodín `**` al final', () => {
    expect(routes[routes.length - 1].path).toBe('**');
  });
});
