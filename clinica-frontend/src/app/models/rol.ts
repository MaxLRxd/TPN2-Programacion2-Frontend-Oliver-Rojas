/** Roles válidos del backend (siempre en minúscula). */
export const ROLES = ['paciente', 'medico', 'operador', 'admin'] as const;

export type Rol = (typeof ROLES)[number];

/** Normaliza cualquier valor (mayúsculas, espacios, null) al rol o `null`. */
export function normalizarRol(valor?: string | null): Rol | null {
  const v = (valor ?? '').trim().toLowerCase();
  return (ROLES as readonly string[]).includes(v) ? (v as Rol) : null;
}