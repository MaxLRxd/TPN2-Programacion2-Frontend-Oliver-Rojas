# Clínica Virtual — Frontend

Aplicación de frontend para la Clínica Virtual (TP N°2, Programación 2). Está
construida con **Angular 21** y **Angular Material 21**, sin Server-Side
Rendering (SSR). Consume la API del backend para el circuito de autenticación:
registro de pacientes, inicio y cierre de sesión, y "Mi perfil".

## Versiones utilizadas

| Herramienta        | Versión    |
| ------------------ | ---------- |
| Node.js            | 20.19.0    |
| npm                | 10.8.2     |
| Angular CLI        | 21.2.26    |
| Angular            | 21.2.25    |
| Angular Material   | 21.2.14    |
| TypeScript         | 5.9.2      |
| Chart.js           | 4.6.1      |
| ng2-charts         | 10.0.0     |

> Angular 21 requiere Node `^20.19.0`, `^22.12.0` o `^24.0.0`.

## Requisitos previos

- Node.js 20.19.0 o superior (se recomienda Node 22 o 24 LTS).
- Angular CLI 21 instalado de forma global (o usar `npx ng`):

  ```bash
  npm install -g @angular/cli@21
  ```

- El backend corriendo en `http://localhost:8080` con **CORS habilitado** para
  `http://localhost:4200`.

## Instalación y ejecución

Dentro de la carpeta `clinica-frontend`:

```bash
npm install
ng serve
```

Luego abrir el navegador en `http://localhost:4200`.

## Backend y CORS

La URL base de la API se define en un único lugar del proyecto, en los archivos
de entorno:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Ambos apuntan a:

```ts
export const environment = {
  apiUrl: 'http://localhost:8080',
};
```

El backend debe permitir peticiones desde `http://localhost:4200` (front) ya que
corre en un puerto distinto.

## Estructura del proyecto

```
src/
├── app/
│   ├── components/      # Vistas (header, menu, footer, home, login, registro, mi-perfil...)
│   ├── config/          # Configuración de temas y Material
│   ├── guards/          # Guards de sesión (authGuard) y por rol (rolGuard)
│   ├── interceptors/    # Interceptor que adjunta el token a las peticiones
│   ├── models/          # Interfaces y modelos de datos
│   ├── routes/          # Rutas agrupadas por rol (admin, medico, operador, paciente)
│   ├── services/        # Servicios de acceso a la API y autenticación
│   ├── app.config.ts    # Configuración de la aplicación
│   └── app.routes.ts    # Definición de rutas raíz
├── environments/        # URL base de la API
├── material-theme.scss  # Tema de Angular Material
└── styles.css           # Estilos globales
```

## Scripts disponibles

| Comando         | Descripción                                  |
| --------------- | -------------------------------------------- |
| `ng serve`      | Levanta el servidor de desarrollo            |
| `ng build`      | Compila el proyecto para producción          |
| `ng test`       | Ejecuta los tests unitarios (Vitest)         |
| `npm start`     | Alias de `ng serve`                          |
| `npm run build` | Alias de `ng build`                          |

## Funcionalidades incluidas (Semana 1)

- Layout general: header, menú de navegación por rol y footer.
- Pantalla principal con y sin sesión.
- Registro de paciente con coberturas cargadas desde el backend.
- Login con DNI y contraseña, sesión persistente al recargar.
- Cierre de sesión y pantalla "Mi perfil" contra `GET /auth/perfil`.
- Rutas protegidas por sesión y por rol, con páginas "Acceso denegado" y
  "No encontrada".

## Librería de gráficos

La pantalla de **Reportes** (`/admin/reportes`) usa
[Chart.js](https://www.chartjs.org/) 4 a través de
[ng2-charts](https://valor-software.com/ng2-charts/) 10, que es la versión
compatible con Angular 21 (`peerDependencies: @angular/core >= 21`). Ambas se
instalan con `npm install`; no requieren configuración adicional.

- La directiva `baseChart` se importa solo en el componente de reportes, que se
  carga en forma diferida (lazy loading), por lo que Chart.js no aumenta el
  bundle inicial.
- Se registran únicamente los elementos usados (barras, torta, escalas,
  leyenda y tooltip) con `provideCharts(...)` en el propio componente.

## Funcionalidades incluidas (Semana 4)

- Auditoría de solo lectura con filtros por usuario, entidad y rango de fechas,
  paginada y ordenada de más reciente a más antigua.
- Reportes y estadísticas: turnos totales, atendidos y cancelados, tasa de
  cancelación, turnos por especialidad (gráfico de barras), turnos por sede
  (gráfico de torta) y ranking de médicos por turnos atendidos (gráfico de
  barras horizontales). Un único filtro de rango de fechas actualiza todos los
  indicadores a la vez.
