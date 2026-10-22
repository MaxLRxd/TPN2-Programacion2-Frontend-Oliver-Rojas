import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorState } from './error-state';

describe('ErrorState', () => {
  let component: ErrorState;
  let fixture: ComponentFixture<ErrorState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorState],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorState);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('muestra el mensaje de error', async () => {
    fixture.componentRef.setInput('mensaje', 'No se pudo conectar con el servidor');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('No se pudo conectar con el servidor');
  });

  it('emite el evento al reintentar', () => {
    const emitir = vi.spyOn(component.reintentar, 'emit');
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    boton.click();

    expect(emitir).toHaveBeenCalledTimes(1);
  });

  it('oculta el botón cuando no se permite reintentar', async () => {
    fixture.componentRef.setInput('mostrarReintentar', false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
