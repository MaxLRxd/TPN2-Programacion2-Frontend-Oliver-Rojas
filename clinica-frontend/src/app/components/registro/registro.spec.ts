import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Registro } from './registro';
import { AuthService } from '../../services/auth';
import { CoberturaService } from '../../services/cobertura';
import { ApiError } from '../../services/api';

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;
  let auth: { registro: ReturnType<typeof vi.fn> };
  let coberturas: { obtenerCoberturas: ReturnType<typeof vi.fn> };

  const formValido = {
    nombre: 'Franco',
    apellido: 'Friggeri',
    dni: '36000960',
    email: 'franco@mail.com',
    password: 'clave123',
    fechaNacimiento: '1998-03-14',
    coberturaId: 1,
  };

  beforeEach(async () => {
    auth = { registro: vi.fn() };
    coberturas = {
      obtenerCoberturas: vi.fn().mockReturnValue(of([{ id: 1, nombre: 'Jerarquicos' }])),
    };
    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: CoberturaService, useValue: coberturas },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carga las coberturas desde el backend al iniciar', () => {
    expect(coberturas.obtenerCoberturas).toHaveBeenCalled();
    expect(component.coberturas).toEqual([{ id: 1, nombre: 'Jerarquicos' }]);
  });

  it('no llama al servicio si el formulario es inválido', () => {
    component.onSubmit();
    expect(auth.registro).not.toHaveBeenCalled();
  });

  it('mapea el formulario a snake_case y envía', () => {
    auth.registro.mockReturnValue(of({ id: 5 }));
    component.form.setValue(formValido);
    component.onSubmit();
    expect(auth.registro).toHaveBeenCalledWith({
      nombre: 'Franco',
      apellido: 'Friggeri',
      dni: '36000960',
      email: 'franco@mail.com',
      password: 'clave123',
      fecha_nacimiento: '1998-03-14',
      id_cobertura: 1,
    });
  });

  it('muestra el error del backend (DNI/email duplicado)', () => {
    auth.registro.mockReturnValue(
      throwError(() => new ApiError(409, 'El DNI ya esta registrado')),
    );
    component.form.setValue(formValido);
    component.onSubmit();
    expect(component.error()).toBe('El DNI ya esta registrado');
    expect(component.success()).toBe('');
  });
});