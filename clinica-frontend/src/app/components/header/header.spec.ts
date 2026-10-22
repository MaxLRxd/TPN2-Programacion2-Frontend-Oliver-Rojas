import { computed, Signal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { Notificacion } from '../../models/notificacion';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth';
import { NotificacionService } from '../../services/notificacion';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let auth: {
    usuario$: Observable<Usuario>;
    getUsuario: ReturnType<typeof vi.fn>;
    isLoggedIn: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let notificaciones: {
    notificaciones: Signal<Notificacion[]>;
    noLeidas: Signal<number>;
    cargando: Signal<boolean>;
    error: Signal<string>;
    refrescar: ReturnType<typeof vi.fn>;
    limpiar: ReturnType<typeof vi.fn>;
    marcarLeida: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const usuario: Usuario = {
    id: 1,
    nombre: 'Ana',
    apellido: 'Pérez',
    rol: 'paciente',
  };

  const lista = signal<Notificacion[]>([
    {
      id: 1,
      tipo: 'turno',
      mensaje: 'Turno confirmado',
      leida: 0,
      fecha: '2026-10-22',
    },
  ]);

  beforeEach(async () => {
    auth = {
      usuario$: of(usuario),
      getUsuario: vi.fn().mockReturnValue(usuario),
      isLoggedIn: vi.fn().mockReturnValue(true),
      logout: vi.fn(),
    };
    notificaciones = {
      notificaciones: lista.asReadonly(),
      noLeidas: computed(() => lista().filter((n) => !n.leida).length),
      cargando: signal(false).asReadonly(),
      error: signal('').asReadonly(),
      refrescar: vi.fn(),
      limpiar: vi.fn(),
      marcarLeida: vi.fn().mockReturnValue(of({ id: 1, leida: 1 })),
    };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: NotificacionService, useValue: notificaciones },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el nombre del usuario y el contador de no leídas', () => {
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Ana Pérez');
    expect(texto).toContain('1');
    expect(notificaciones.refrescar).toHaveBeenCalled();
  });

  it('marca una notificación como leída', () => {
    const notificacion = lista()[0];
    component.marcarLeida(notificacion);
    expect(notificaciones.marcarLeida).toHaveBeenCalledWith(1);
  });

  it('no vuelve a marcar una notificación ya leída', () => {
    component.marcarLeida({ ...lista()[0], leida: 1 });
    expect(notificaciones.marcarLeida).not.toHaveBeenCalled();
  });

  it('navega a Mi perfil', () => {
    component.irAPerfil();
    expect(router.navigate).toHaveBeenCalledWith(['/perfil']);
  });

  it('cierra sesión y navega al inicio', () => {
    component.logout();
    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
