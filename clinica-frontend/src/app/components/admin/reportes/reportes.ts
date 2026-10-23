import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  ChartConfiguration,
  ChartData,
  Legend,
  LinearScale,
  PieController,
  Tooltip,
} from 'chart.js';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import { forkJoin } from 'rxjs';

import {
  RankingMedico,
  ReporteFiltros,
  TasaCancelacion,
  TurnosPorEspecialidad,
  TurnosPorSede,
} from '../../../models/reporte';
import { ApiError } from '../../../services/api';
import { ReporteService } from '../../../services/reporte';
import { formatearFecha } from '../../../utils/fecha';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorState } from '../../shared/error-state/error-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { PageHeader } from '../../shared/page-header/page-header';

// Paleta de la aplicación: bordó, dorado, pizarra y tonos derivados.
const COLORES = ['#a42822', '#be9f65', '#212934', '#6a7280', '#d0483e', '#8a6d38', '#4a8fc7'];

const TASA_VACIA: TasaCancelacion = { total_turnos: 0, total_cancelados: 0, tasa_cancelacion: 0 };

@Component({
  selector: 'app-reportes',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    BaseChartDirective,
    PageHeader,
    LoadingState,
    ErrorState,
    EmptyState,
  ],
  // Solo se registran las piezas de Chart.js que usa esta pantalla.
  providers: [
    provideCharts({
      registerables: [
        BarController,
        BarElement,
        PieController,
        ArcElement,
        CategoryScale,
        LinearScale,
        Legend,
        Tooltip,
      ],
    }),
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  private reporteService = inject(ReporteService);
  private fb = inject(FormBuilder);

  readonly filtrosForm = this.fb.group({
    fecha_desde: [''],
    fecha_hasta: [''],
  });

  readonly porEspecialidad = signal<TurnosPorEspecialidad[]>([]);
  readonly porSede = signal<TurnosPorSede[]>([]);
  readonly ranking = signal<RankingMedico[]>([]);
  readonly tasa = signal<TasaCancelacion>(TASA_VACIA);
  readonly filtrosAplicados = signal<ReporteFiltros>({});
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorFiltros = signal('');

  readonly sinDatos = computed(() => this.tasa().total_turnos === 0);
  readonly porcentajeCancelacion = computed(() =>
    (this.tasa().tasa_cancelacion * 100).toLocaleString('es-AR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
  );
  readonly totalAtendidos = computed(() =>
    this.ranking().reduce((suma, medico) => suma + medico.cantidad_atendidos, 0),
  );

  readonly periodo = computed(() => {
    const { fecha_desde, fecha_hasta } = this.filtrosAplicados();
    if (fecha_desde && fecha_hasta) {
      return `Del ${formatearFecha(fecha_desde)} al ${formatearFecha(fecha_hasta)}`;
    }
    if (fecha_desde) {
      return `Desde el ${formatearFecha(fecha_desde)}`;
    }
    if (fecha_hasta) {
      return `Hasta el ${formatearFecha(fecha_hasta)}`;
    }
    return 'Todo el período';
  });

  readonly datosEspecialidad = computed<ChartData<'bar', number[], string>>(() => ({
    labels: this.porEspecialidad().map((fila) => fila.descripcion),
    datasets: [
      {
        label: 'Turnos',
        data: this.porEspecialidad().map((fila) => fila.cantidad),
        backgroundColor: COLORES[0],
        borderRadius: 4,
        maxBarThickness: 48,
      },
    ],
  }));

  readonly datosSede = computed<ChartData<'pie', number[], string>>(() => ({
    labels: this.porSede().map((fila) => fila.nombre),
    datasets: [
      {
        data: this.porSede().map((fila) => fila.cantidad),
        backgroundColor: this.porSede().map((_, i) => COLORES[i % COLORES.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }));

  readonly datosRanking = computed<ChartData<'bar', number[], string>>(() => ({
    labels: this.ranking().map((medico) => this.nombreMedico(medico)),
    datasets: [
      {
        label: 'Turnos atendidos',
        data: this.ranking().map((medico) => medico.cantidad_atendidos),
        backgroundColor: COLORES[1],
        borderRadius: 4,
        maxBarThickness: 32,
      },
    ],
  }));

  readonly opcionesBarras: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  readonly opcionesRanking: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  readonly opcionesTorta: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
  };

  ngOnInit(): void {
    this.cargar();
  }

  /** Pide los cuatro indicadores juntos para que siempre correspondan al mismo rango. */
  cargar(): void {
    const filtros = this.filtrosAplicados();
    this.cargando.set(true);
    this.errorCarga.set('');

    forkJoin({
      especialidad: this.reporteService.turnosPorEspecialidad(filtros),
      sede: this.reporteService.turnosPorSede(filtros),
      ranking: this.reporteService.rankingMedicos(filtros),
      tasa: this.reporteService.tasaCancelacion(filtros),
    }).subscribe({
      next: ({ especialidad, sede, ranking, tasa }) => {
        this.porEspecialidad.set(
          especialidad.map((fila) => ({ ...fila, cantidad: Number(fila.cantidad) || 0 })),
        );
        this.porSede.set(sede.map((fila) => ({ ...fila, cantidad: Number(fila.cantidad) || 0 })));
        this.ranking.set(
          ranking.map((fila) => ({
            ...fila,
            cantidad_atendidos: Number(fila.cantidad_atendidos) || 0,
          })),
        );
        this.tasa.set({
          total_turnos: Number(tasa?.total_turnos) || 0,
          total_cancelados: Number(tasa?.total_cancelados) || 0,
          tasa_cancelacion: Number(tasa?.tasa_cancelacion) || 0,
        });
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.errorCarga.set(e?.mensaje || 'No se pudieron cargar los reportes.');
        this.cargando.set(false);
      },
    });
  }

  aplicarFiltros(): void {
    const valores = this.filtrosForm.getRawValue();
    const desde = valores.fecha_desde || undefined;
    const hasta = valores.fecha_hasta || undefined;

    if (desde && hasta && desde > hasta) {
      this.errorFiltros.set('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }

    this.errorFiltros.set('');
    this.filtrosAplicados.set({ fecha_desde: desde, fecha_hasta: hasta });
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({ fecha_desde: '', fecha_hasta: '' });
    this.errorFiltros.set('');
    this.filtrosAplicados.set({});
    this.cargar();
  }

  hayFiltros(): boolean {
    const { fecha_desde, fecha_hasta } = this.filtrosAplicados();
    return !!(fecha_desde || fecha_hasta);
  }

  nombreMedico(medico: RankingMedico): string {
    return `${medico.apellido}, ${medico.nombre}`;
  }
}
