export function fechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function hoyISO(referencia: Date = new Date()): string {
  return fechaISO(referencia);
}

export function parseFecha(valor: string | Date | null | undefined): Date | null {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor;
  }

  const texto = valor.trim();
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);

  if (coincidencia) {
    const anio = Number(coincidencia[1]);
    const mes = Number(coincidencia[2]);
    const dia = Number(coincidencia[3]);
    const fecha = new Date(anio, mes - 1, dia);

    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
      return null;
    }
    return fecha;
  }

  const fecha = new Date(texto);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function formatearFecha(valor: string | Date | null | undefined): string {
  const fecha = parseFecha(valor);
  if (!fecha) {
    return '';
  }

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

export function formatearFechaHora(valor: string | Date | null | undefined): string {
  const fecha = formatearFecha(valor);
  if (!fecha) {
    return '';
  }

  if (valor instanceof Date) {
    const horas = String(valor.getHours()).padStart(2, '0');
    const minutos = String(valor.getMinutes()).padStart(2, '0');
    return `${fecha} ${horas}:${minutos}`;
  }

  if (typeof valor !== 'string') {
    return fecha;
  }

  const coincidencia = /[T ](\d{2}):(\d{2})/.exec(valor.trim());
  return coincidencia ? `${fecha} ${coincidencia[1]}:${coincidencia[2]}` : fecha;
}

export function calcularEdad(
  fechaNacimiento: string | Date | null | undefined,
  referencia: Date = new Date(),
): number | null {
  const nacimiento = parseFecha(fechaNacimiento);
  if (!nacimiento) {
    return null;
  }

  let edad = referencia.getFullYear() - nacimiento.getFullYear();
  const diferenciaMes = referencia.getMonth() - nacimiento.getMonth();

  if (diferenciaMes < 0 || (diferenciaMes === 0 && referencia.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad >= 0 ? edad : null;
}
