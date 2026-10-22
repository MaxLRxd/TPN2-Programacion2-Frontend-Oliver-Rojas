import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let component: ConfirmDialog;
  let fixture: ComponentFixture<ConfirmDialog>;
  let ref: { close: ReturnType<typeof vi.fn> };

  const datos: ConfirmDialogData = {
    titulo: 'Cancelar turno',
    mensaje: '¿Querés cancelar el turno?',
  };

  beforeEach(async () => {
    ref = { close: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: datos },
        { provide: MatDialogRef, useValue: ref },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('muestra el título y el mensaje', () => {
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Cancelar turno');
    expect(texto).toContain('¿Querés cancelar el turno?');
  });

  it('cierra con true al confirmar', () => {
    fixture.detectChanges();
    const botones = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    botones[1].click();
    expect(ref.close).toHaveBeenCalledWith(true);
  });

  it('cierra con false al cancelar', () => {
    fixture.detectChanges();
    const botones = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    botones[0].click();
    expect(ref.close).toHaveBeenCalledWith(false);
  });
});
