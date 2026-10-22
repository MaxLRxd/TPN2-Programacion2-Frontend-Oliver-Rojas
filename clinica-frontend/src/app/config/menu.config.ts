import { MenuItem } from '../models/menu-item';
import { normalizarRol, Rol } from '../models/rol';

/**
 * Menú declarativo por rol: única fuente de verdad de las secciones de la app.
 * Para sumar una opción basta con agregarla a la lista del rol.
 * Las rutas apuntan a secciones que hoy renderizan `EnConstruccion`.
 */
export const MENU_POR_ROL: Record<Rol, MenuItem[]> = {
  admin: [
    { titulo: 'Usuarios', ruta: '/admin/usuarios' },
    { titulo: 'Sedes', ruta: '/admin/sedes' },
    { titulo: 'Especialidades', ruta: '/admin/especialidades' },
    { titulo: 'Coberturas', ruta: '/admin/coberturas' },
    { titulo: 'Auditoría', ruta: '/admin/auditoria' },
    { titulo: 'Reportes', ruta: '/admin/reportes' },
  ],
  medico: [
    { titulo: 'Mi agenda', ruta: '/medico/agenda' },
    { titulo: 'Turnos del día', ruta: '/medico/turnos' },
    { titulo: 'Historial clínico', ruta: '/medico/historial' },
  ],
  operador: [
    { titulo: 'Agenda', ruta: '/operador/agenda' },
    { titulo: 'Turnos de la sede', ruta: '/operador/turnos' },
    { titulo: 'Pacientes', ruta: '/operador/pacientes' },
  ],
  paciente: [
    { titulo: 'Sacar turno', ruta: '/paciente/sacar-turno' },
    { titulo: 'Mis turnos', ruta: '/paciente/turnos' },
    { titulo: 'Mi historial', ruta: '/paciente/historial' },
    { titulo: 'Mis datos', ruta: '/paciente/datos' },
  ],
};

/** Primera sección del rol (destino post-login). `/` si el rol no es válido. */
export function rutaInicioPorRol(rol?: string | null): string {
  const normalizado = normalizarRol(rol);
  return normalizado ? MENU_POR_ROL[normalizado][0].ruta : '/';
}
