import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  let component: EmptyState;
  let fixture: ComponentFixture<EmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyState],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyState);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('muestra los valores por defecto', () => {
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('inbox');
    expect(texto).toContain('Sin resultados');
  });

  it('permite personalizar ícono, título y mensaje', async () => {
    fixture.componentRef.setInput('icono', 'event_busy');
    fixture.componentRef.setInput('titulo', 'No hay turnos');
    fixture.componentRef.setInput('mensaje', 'Probá con otra fecha.');
    fixture.detectChanges();
    await fixture.whenStable();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('event_busy');
    expect(texto).toContain('No hay turnos');
    expect(texto).toContain('Probá con otra fecha.');
  });
});
