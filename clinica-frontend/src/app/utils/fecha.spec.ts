import { calcularEdad, formatearFecha, parseFecha } from './fecha';

describe('utilidades de fecha', () => {
  it('formatea una fecha ISO como dd/MM/yyyy', () => {
    expect(formatearFecha('2026-10-22')).toBe('22/10/2026');
    expect(formatearFecha('2026-01-05T14:30:00.000Z')).toBe('05/01/2026');
  });

  it('formatea un Date local', () => {
    expect(formatearFecha(new Date(2026, 9, 22))).toBe('22/10/2026');
  });

  it('devuelve vacío para fechas inválidas o ausentes', () => {
    expect(formatearFecha(null)).toBe('');
    expect(formatearFecha(undefined)).toBe('');
    expect(formatearFecha('')).toBe('');
    expect(formatearFecha('2026-02-31')).toBe('');
    expect(formatearFecha('no es una fecha')).toBe('');
  });

  it('parsea la fecha sin corrimientos de zona horaria', () => {
    const fecha = parseFecha('2026-10-22');
    expect(fecha?.getFullYear()).toBe(2026);
    expect(fecha?.getMonth()).toBe(9);
    expect(fecha?.getDate()).toBe(22);
  });

  it('calcula la edad según el día y mes de referencia', () => {
    const referencia = new Date(2026, 9, 22);
    expect(calcularEdad('2000-10-22', referencia)).toBe(26);
    expect(calcularEdad('2000-10-23', referencia)).toBe(25);
    expect(calcularEdad('2026-10-22', referencia)).toBe(0);
  });

  it('devuelve null para fechas inválidas o futuras', () => {
    const referencia = new Date(2026, 9, 22);
    expect(calcularEdad(null, referencia)).toBeNull();
    expect(calcularEdad('', referencia)).toBeNull();
    expect(calcularEdad('2026-10-23', referencia)).toBeNull();
  });
});
