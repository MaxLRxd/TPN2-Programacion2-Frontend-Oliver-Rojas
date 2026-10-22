export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface SedePayload {
  nombre: string;
  direccion: string;
  telefono: string;
}
