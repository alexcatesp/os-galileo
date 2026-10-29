# OS Galileo

Sistema operativo **simulado** que corre en el navegador, para el alumnado del IES Galileo. Se publicará en la raíz de `iesgalileo.alejandrocatalaespi.es`.

## Objetivos
- Punto de entrada único a GASA, materiales y herramientas del curso.
- Aprender cómo funciona un SO (archivos, procesos, terminal, usuarios, permisos).
- Simulaciones de aplicaciones reales, sin instalar nada.
- Práctica de comandos y administración.
- Prueba de concepto de `ai-os` (SO para Raspberry Pi 5): los dos proyectos son independientes por ahora.

## Estado (v0.1)
- Arranque simulado y pantalla de acceso como **invitado** (sin cuenta).
- **Escritorio** con identidad Galileo (morado `#2a1770`, rojo `#da251c`): iconos, ventanas arrastrables, redimensionables, minimizables y maximizables, barra de tareas, menú de inicio con buscador y reloj.
- **Móvil** (< 760 px): cuadrícula de iconos, apps a pantalla completa, pulsación larga para reordenar (el orden se guarda).
- Núcleo: sistema de archivos virtual persistente (`localStorage`), procesos y registro de apps.
- Apps: **Bloc de notas** (abre y guarda en el sistema de archivos virtual), **Calculadora** y **GASA** (el campus en `/gasa/` dentro de una ventana; `apps/app-web.ts` sirve para cualquier web del mismo dominio).
- Fondos de escritorio en `public/fondos/` (`src/kernel/fondos.ts`): cambia en cada entrada y cada 10 minutos; para añadir más, copiar la imagen y listarla en `FONDOS`.

![Escritorio](docs/escritorio.png) ![Móvil](docs/movil.png)

## Desarrollo
```
npm install
npm run dev      # servidor de desarrollo
npm run build    # tsc + vite build → dist/
```
`dist/` es estático y usa rutas relativas: se publica copiándolo a la raíz del subdominio.

## Arquitectura (`src/`)
- `kernel/vfs.ts` — árbol de archivos y carpetas (`leer`, `escribir`, `listar`, `mkdir`, `borrar`). Interfaz preparada para migrar a IndexedDB.
- `kernel/kernel.ts` — usuario, procesos y registro de apps (`AppDef`: `id`, `nombre`, `icono`, tamaño e `iniciar(ctx)`).
- `shell/escritorio.ts` y `shell/movil.ts` — dos «shells» sobre el mismo núcleo; `main.ts` elige uno según el ancho.
- `shell/arranque.ts` — arranque y acceso.
- `apps/` — una app por fichero. Para añadir una: exportar un `AppDef` y registrarlo en `main.ts`.

## Hoja de ruta
1. Logo definitivo en el arranque.
2. Explorador de archivos y terminal con comandos básicos.
3. Acceso real: correo del alumno + código por correo, altas y apps por módulo en una base de datos administrada (como el panel del profesorado).
4. Simulaciones de aplicaciones (IDE, bases de datos, redes…) y procesos, permisos y usuarios.
