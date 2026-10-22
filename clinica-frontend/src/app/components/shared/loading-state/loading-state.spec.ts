import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingState } from './loading-state';

describe('LoadingState', () => {
  let component: LoadingState;
  let fixture: ComponentFixture<LoadingState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingState],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingState);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('muestra el mensaje por defecto', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando...');
  });

  it('permite personalizar el mensaje', async () => {
    fixture.componentRef.setInput('mensaje', 'Cargando turnos...');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Cargando turnos...');
  });
});
