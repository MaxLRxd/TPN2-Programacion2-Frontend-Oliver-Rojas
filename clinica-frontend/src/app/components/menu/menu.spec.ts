import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { Menu } from './menu';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/usuario';

describe('Menu', () => {
  let usuario$: BehaviorSubject<Usuario | null>;
  let auth: { usuario$: BehaviorSubject<Usuario | null>; getUsuario: () => Usuario | null };

  beforeEach(async () => {
    usuario$ = new BehaviorSubject<Usuario | null>(null);
    auth = { usuario$, getUsuario: () => usuario$.value };
    await TestBed.configureTestingModule({
      imports: [Menu],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();
  });

  function crear(usuario: Usuario | null): Menu {
    usuario$.next(usuario);
    const fixture: ComponentFixture<Menu> = TestBed.createComponent(Menu);
    return fixture.componentInstance;
  }

  it('sin sesión no muestra opciones', () => {
    expect(crear(null).items()).toEqual([]);
  });

  it('muestra las opciones del admin', () => {
    const items = crear({ id: 1, rol: 'admin' }).items();
    expect(items).toHaveLength(6);
    expect(items[0]).toEqual({ titulo: 'Usuarios', ruta: '/admin/usuarios' });
  });

  it('normaliza el rol aunque venga en mayúsculas', () => {
    const items = crear({ id: 1, rol: 'MEDICO' }).items();
    expect(items.map((i) => i.ruta)).toContain('/medico/agenda');
  });

  it('un rol desconocido no muestra opciones', () => {
    expect(crear({ id: 1, rol: 'raro' }).items()).toEqual([]);
  });

  it('reacciona al iniciar y cerrar sesión', () => {
    const component = crear(null);
    expect(component.items()).toEqual([]);

    usuario$.next({ id: 1, rol: 'paciente' });
    expect(component.items().length).toBe(3);

    usuario$.next(null);
    expect(component.items()).toEqual([]);
  });
});
