import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Home } from './home';
import { AuthService } from '../../services/auth';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let auth: { isLoggedIn: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    auth = { isLoggedIn: vi.fn().mockReturnValue(false) };
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('sin sesión invita a iniciar sesión o registrarse', () => {
    auth.isLoggedIn.mockReturnValue(false);
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Sacar un turno');
    expect(texto).toContain('Iniciar sesión');
  });

  it('con sesión invita a elegir del menú', () => {
    auth.isLoggedIn.mockReturnValue(true);
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Elegí una sección del menú');
  });
});
