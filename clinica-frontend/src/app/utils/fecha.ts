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

    if (
      fecha.getFullYear() !== anio ||
      fecha.getMonth() !== mes - 1 ||
      fecha.getDate() !== dia
    ) {
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
