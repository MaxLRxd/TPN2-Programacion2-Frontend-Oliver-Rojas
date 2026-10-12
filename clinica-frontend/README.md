# Clínica Virtual — Frontend

Frontend en **Angular 21 + Angular Material** para la gestión de una clínica virtual.
Consume la API del backend (Express) que corre en `http://localhost:3000`.

## Requisitos

- Node.js y npm
- Backend levantado en el puerto `3000` (o ajustar `src/environments/environment.ts`)

## Instalación y ejecución

```bash
npm install
npm start        # levanta el dev server en http://localhost:4200
```

## Scripts

```bash
npm start        # servidor de desarrollo
npm run build    # compilación de producción en dist/
npm test         # tests unitarios (Vitest)
```

## Estructura

```
src/app/
  components/    # componentes de UI (login, registro, mi-perfil, home, header, menu, footer, ...)
  guards/        # auth-guard, rol-guard
  interceptors/  # token-interceptor
  models/        # interfaces de dominio y de la API
  services/      # ApiService (capa HTTP única), AuthService, SessionService, CoberturaService
```

## Arquitectura

- **`ApiService`** es la única capa que usa `HttpClient`: desempaqueta el envelope
  `{ codigo, estado, datos }` y expone `ApiError` con `codigo` y `mensaje`.
- **`SessionService`** guarda el token y el usuario (composición, sin herencia).
- **`AuthService`** compone `ApiService` + `SessionService` y encapsula el mapeo a los
  DTO en `snake_case` que espera el backend.
