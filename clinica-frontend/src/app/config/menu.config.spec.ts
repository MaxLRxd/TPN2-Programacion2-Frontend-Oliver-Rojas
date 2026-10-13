import { MENU_POR_ROL, rutaInicioPorRol } from './menu.config';
import { ROLES } from '../models/rol';

describe('MENU_POR_ROL', () => {
  it('define opciones para todos los roles', () => {
    for (const rol of ROLES) {
      expect(MENU_POR_ROL[rol].length).toBeGreaterThan(0);
    }
  });

  it('cada opción tiene título y ruta', () => {
    for (const items of Object.values(MENU_POR_ROL)) {
      for (const item of items) {
        expect(item.titulo).toBeTruthy();
        expect(item.ruta.startsWith('/')).toBe(true);
      }
    }
  });
});

describe('rutaInicioPorRol', () => {
  it('devuelve la primera ruta del rol', () => {
    expect(rutaInicioPorRol('admin')).toBe('/admin/usuarios');
    expect(rutaInicioPorRol('PACIENTE')).toBe('/paciente/sacar-turno');
  });

  it('devuelve "/" si el rol es desconocido o no hay rol', () => {
    expect(rutaInicioPorRol(null)).toBe('/');
    expect(rutaInicioPorRol('raro')).toBe('/');
  });
});
