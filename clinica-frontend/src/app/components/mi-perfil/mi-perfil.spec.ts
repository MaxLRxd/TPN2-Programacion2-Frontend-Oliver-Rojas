import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { MiPerfil } from './mi-perfil';
import { AuthService } from '../../services/auth';
import { ApiError } from '../../services/api';
import { Usuario } from '../../models/usuario';

describe('MiPerfil', () => {
  let component: MiPerfil;
  let fixture: ComponentFixture<MiPerfil>;
  let auth: { cargarPerfil: ReturnType<typeof vi.fn> };

  const perfil: Usuario = {
    id: 5,
    nombre: 'Franco',
    apellido: 'Friggeri',
    dni: '36000960',
    email: 'franco@mail.com',
    telefono: '1144556677',
    rol: 'paciente',
    id_sede: 2,
    id_cobertura: 1,
  };

  beforeEach(async () => {
    auth = { cargarPerfil: vi.fn().mockReturnValue(of(perfil)) };
    await TestBed.configureTestingModule({
      imports: [MiPerfil],
      providers: [{ provide: AuthService, useValue: auth }],
    }).compileComponents();

    fixture = TestBed.createComponent(MiPerfil);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pide el perfil al iniciar y lo muestra', () => {
    fixture.detectChanges();
    expect(auth.cargarPerfil).toHaveBeenCalledTimes(1);
    expect(component.cargando()).toBe(false);
    expect(component.usuario()).toMatchObject({ id: 5, rol: 'paciente' });
  });

  it('muestra el error del backend', () => {
    auth.cargarPerfil.mockReturnValue(throwError(() => new ApiError(500, 'Error del servidor')));
    fixture.detectChanges();
    expect(component.error()).toBe('Error del servidor');
    expect(component.cargando()).toBe(false);
  });

  it('permite reintentar la carga', () => {
    fixture.detectChanges();
    component.cargar();
    expect(auth.cargarPerfil).toHaveBeenCalledTimes(2);
  });

  it('muestra un guion para datos vacíos', () => {
    expect(component.mostrar(null)).toBe('—');
    expect(component.mostrar(undefined)).toBe('—');
    expect(component.mostrar('')).toBe('—');
    expect(component.mostrar('Franco')).toBe('Franco');
  });
});
