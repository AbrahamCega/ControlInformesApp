# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b (type-check de todo el proyecto) + vite build
npm run lint     # eslint .
npm run preview  # servir el build
```

No hay framework de tests configurado. `npm run build` es la verificación de tipos — úsalo como comprobación tras cambios.

## Contexto

SPA (React 19 + TypeScript + Vite + MUI v9) para el control de informes de predicación de una congregación: publicadores, grupos, informes mensuales, asistencia a reuniones y tarjetas (S-21). La UI y los nombres de dominio están **en español**; mantén ese idioma en identificadores, textos y mensajes.

Consume una API .NET externa, **hardcodeada** en `src/services/apiClient.ts` (`https://localhost:7144/api`). No hay archivos `.env`; si se cambia el backend hay que editar esa constante.

## Arquitectura

**Capas:** `pages/` (una página por ruta, contienen la mayor parte de la lógica y el estado local) → `services/` (un objeto por recurso: `informesService`, `publicadoresService`, …) → `services/apiClient.ts` (axios).

**Contrato de API.** Todo endpoint responde `ApiResponse<T>` (`src/types/common.ts`): `{ httpCode, result, hasError, mensaje, codigoError, errores }`. El interceptor de respuesta de `apiClient`:
- si `hasError` es true, muestra `mensaje` en el snackbar global y **rechaza** la promesa;
- en error de red/HTTP hace lo mismo con el mensaje del servidor.

Por eso los helpers `apiGet/apiPost/apiPut/apiDelete/apiPostFormData/apiGetBlob` devuelven directamente `result` ya desenvuelto, y **el código que llama no debe mostrar su propio snackbar de error**: ya se hizo. Sólo se notifican los éxitos.

**Auth.** `useAuthStore` (zustand + `persist`, clave `auth-storage` en localStorage) guarda `user`, `token`, `isAuthenticated`. El interceptor de petición lee el JWT *leyendo localStorage directamente*, no el store — si se renombra la clave de persistencia hay que tocar `apiClient.ts` y `authService.getStoredToken`. El backend sólo devuelve `{ token, expiracion }`; `AuthUser` se construye decodificando el payload del JWT en `authService`. Las rutas privadas cuelgan de `<RequireAuth>` → `<MainLayout>` en `src/routes/index.tsx`.

**Estado global:** sólo dos stores zustand — `useAuthStore` y `stores/notificationStore` (snackbar). Todo lo demás es estado local de página.

**Tipos:** `src/types/` con un archivo por dominio reexportado desde `types/index.ts`; importa siempre desde `'../types'`. Los enums (`TipoPublicador`, `TipoReunion`, `Genero`, `RolCongregacion`, …) son numéricos y deben coincidir con los del backend.

**Componentes:** `src/components/` genéricos + subcarpetas por dominio (`publicadores/`, `grupos/`, `asistencia/`), reexportados en `components/index.ts` (no todos: los de `grupos/` y `asistencia/` se importan por ruta). `src/features/auth/` es la única carpeta con estructura feature-first (components/hooks/pages/services).

**Año de servicio:** `utils/anoServicio.ts` — el año de servicio empieza en septiembre (`getMonth() >= 8`). Úsalo en vez de `getFullYear()` para cualquier filtro anual.

**Rutas desactivadas:** `ReportesPage` y `ExcelPage` existen pero están comentadas en `routes/index.tsx` y en el menú de `layouts/MainLayout.tsx`; si se reactivan hay que descomentar en ambos sitios.

**Descargas:** los servicios que generan archivos (PDF de tarjetas, plantillas Excel) hacen el `createObjectURL` + click en `<a>` dentro del propio servicio; devuelven `void`.
