import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHeader } from './page-header';

describe('PageHeader', () => {
  let component: PageHeader;
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeader);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('titulo', 'Sedes');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('muestra título, subtítulo e ícono', async () => {
    fixture.componentRef.setInput('titulo', 'Sedes');
    fixture.componentRef.setInput('subtitulo', 'Administración de la clínica');
    fixture.componentRef.setInput('icono', 'apartment');
    fixture.detectChanges();
    await fixture.whenStable();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Sedes');
    expect(texto).toContain('Administración de la clínica');
    expect(texto).toContain('apartment');
  });
});
