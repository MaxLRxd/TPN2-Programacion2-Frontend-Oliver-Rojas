# Clínica Virtual — Frontend

Aplicación de frontend para la Clínica Virtual (TP N°2, Programación 2). Está
construida con **Angular 21** y **Angular Material 21**, sin Server-Side
Rendering (SSR). Consume la API del backend (Node + Express + MySQL/MariaDB) y
cubre los cuatro roles: administrador, médico, operador y paciente.

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

## Puesta en marcha desde cero

Se necesitan dos repositorios/carpetas: el **backend** (`Backend/` y `BD/`) y
este **frontend** (`clinica-frontend/`).

### 1. Requisitos previos

- Node.js 20.19.0 o superior para el frontend (se recomienda Node 22 o 24 LTS;
  el backend se probó con Node 24).
- MySQL o MariaDB en ejecución (probado con MariaDB 10.4 de XAMPP).
- Angular CLI 21 (opcional; se puede usar `npx ng`):

  ```bash
  npm install -g @angular/cli@21
  ```

### 2. Base de datos

Importar el script con datos de prueba (`BD/clinica.sql`). El script **elimina y
vuelve a crear** la base `clinica`, por lo que no hace falta crearla antes (y se
pierden los datos que tuviera):

```bash
mysql -u root -p < BD/clinica.sql
```

También se puede pegar completo en la pestaña SQL de phpMyAdmin, a nivel
servidor y sin seleccionar ninguna base.

El script carga usuarios de los cuatro roles, tres médicos con distintas
especialidades (uno con agenda en dos sedes), turnos en estado `confirmado`,
`cancelado` y `atendido`, historial clínico y notificaciones. Las fechas de la
agenda se calculan respecto del día de la importación; si pasaron varios días,
conviene cargar rangos nuevos desde la pantalla de agenda para poder sacar
turnos.

### 3. Backend

Copiar `Backend/.env.example` a `Backend/.env` y completar:

| Variable         | Descripción                            | Ejemplo               |
| ---------------- | -------------------------------------- | --------------------- |
| `DB_HOST`        | Host de la base de datos               | `localhost`           |
| `DB_PORT`        | Puerto de la base de datos             | `3306`                |
| `DB_USER`        | Usuario de la base                     | `root`                |
| `DB_PASSWORD`    | Contraseña de la base (puede ir vacía) |                       |
| `DB_NAME`        | Nombre de la base                      | `clinica`             |
| `JWT_SECRET`     | Clave para firmar los tokens           | `una_clave_secreta`   |
| `JWT_EXPIRES_IN` | Vigencia del token                     | `8h`                  |
| `PORT`           | Puerto del servidor                    | `8080`                |

```bash
cd Backend
npm install
npm run dev
```

El backend queda en `http://localhost:8080`. La colección de Postman está en
`Backend/Prog2.postman_collection.json`.

### 4. Frontend

Dentro de la carpeta `clinica-frontend`:

```bash
npm install
ng serve
```

Luego abrir el navegador en `http://localhost:4200`. La URL de la API se define
en un único lugar (`src/environments/`).

## Usuarios de prueba

Todos los usuarios tienen la contraseña `1234`.

| Rol      | Nombre                          | DNI      |
| -------- | ------------------------------- | -------- |
| admin    | Marcos Gomez                    | 18222333 |
| operador | Juan Perez (sede 1)             | 15200548 |
| medico   | Ana Lopez (sedes 1 y 2)         | 20111222 |
| medico   | Pablo Rodriguez (sede 1)        | 22333444 |
| medico   | Lucia Martinez (sede 2)         | 23444555 |
| paciente | Franco Friggeri                 | 36000960 |
| paciente | Maria Sosa                      | 41000111 |
| paciente | Carlos Diaz                     | 12000222 |

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

## Funcionalidades por rol

**Todos los roles**
- Layout con header, menú por rol y footer; pantalla principal con y sin sesión.
- Registro de paciente, login con DNI y contraseña, sesión persistente y "Mi perfil".
- Notificaciones: campana con contador de no leídas, listado de la más reciente
  a la más antigua, marcado como leída y actualización del contador tras
  confirmar, cancelar o atender un turno.
- Rutas protegidas por sesión y por rol (menú y URL escrita a mano), con páginas
  "Acceso denegado" y "No encontrada". Un token vencido (401) lleva al login.
- Indicadores de carga, mensajes de listado vacío y de error (incluido backend
  caído), fechas en formato día/mes/año.

**Administrador**
- CRUD de sedes, especialidades y coberturas con filtro de texto, validaciones y
  baja con confirmación (se muestra el mensaje del backend si hay dependencias).
- Usuarios: listado paginado con filtros por nombre, apellido, tipo y sede; alta
  de operador, médico y administrador (sede y especialidades según el rol);
  edición de cualquier usuario, incluidos los pacientes.
- Auditoría de solo lectura con filtros por usuario, entidad y rango de fechas,
  paginada y de más reciente a más antigua.
- Reportes: turnos totales, atendidos y cancelados, tasa de cancelación, turnos
  por especialidad (barras), por sede (torta) y ranking de médicos (barras
  horizontales), con un único filtro de rango de fechas.

**Médico**
- Agenda propia con selector de fecha; alta, modificación y baja de rangos
  horarios (varios por día, en más de una sede). No permite eliminar ni acortar
  un rango dejando turnos confirmados fuera.
- Turnos del día en todas sus sedes con filtro de sede, edad del paciente y notas
  desplegables; "Marcar como atendido" con diagnóstico, tratamiento y
  observaciones; cancelación con confirmación.
- Historial clínico: búsqueda de pacientes por DNI o apellido, mostrando solo los
  registros de los turnos que atendió.

**Operador**
- Agenda por fecha y sede (por defecto la suya): alta, edición y baja de rangos y
  vista de turnos con cancelación, solo en su sede (las demás son de lectura).
- Alta de pacientes y asignación de turnos con la sede fija, reutilizando el
  formulario de registro y el wizard de turnos.

**Paciente**
- Sacar turno paso a paso (especialidad, sede, médico, fecha, horario, nota y
  resumen), ofreciendo solo médicos, fechas y horarios disponibles.
- Mis turnos: ordenados por proximidad, con estado diferenciado, cancelación con
  confirmación y, en los atendidos, diagnóstico, tratamiento y observaciones.
- Mi historial clínico y Mis datos (solo email, teléfono, cobertura y contraseña;
  la nueva contraseña se repite y debe coincidir).

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

## Cambios en el backend

Para las pantallas del frontend se agregaron o ampliaron estos endpoints (todos
documentados en la carpeta `06 - Soporte frontend` de la colección de Postman y
en `Backend/README.md`): `GET /medicos`, `GET /turnos/disponibilidad/fechas` y
`/horarios`, `GET /pacientes`, `PATCH /auth/perfil`, `GET/POST/PUT /usuarios`
(con auditoría), agenda enriquecida con nombres, y validaciones de agenda,
sedes y usuarios (rangos solapados, nombres duplicados, formato de email, DNI y
contraseña).
