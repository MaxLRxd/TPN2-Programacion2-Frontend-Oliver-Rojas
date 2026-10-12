import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

import { Login } from './login';
import { AuthService } from '../../services/auth';
import { ApiError } from '../../services/api';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let auth: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    auth = { login: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no llama al servicio si el formulario es inválido', () => {
    component.onSubmit();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('muestra el mensaje de error del backend', () => {
    auth.login.mockReturnValue(throwError(() => new ApiError(401, 'Credenciales invalidas')));
    component.form.setValue({ dni: '36000960', password: 'mala' });
    component.onSubmit();
    expect(component.error()).toBe('Credenciales invalidas');
  });
});