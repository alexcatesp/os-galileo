# CLAUDE.md — OS Galileo

SO simulado en el navegador para el alumnado del IES Galileo (Vite + TypeScript, sin framework de UI). Descripción y arquitectura en `README.md`.

## Reglas de trabajo
- Responder y escribir en **español** (con tildes), también identificadores y comentarios.
- Ante cualquier duda, usar **AskUserQuestion** con opciones concretas.
- Actualizar `README.md` y este fichero con cada cambio importante.
- Tras una construcción correcta (`npm run build`): commit y push.
- Probar en el navegador (Playwright MCP) escritorio y móvil.
- Los commits terminan con las líneas de atribución que indique el sistema.

## Decisiones
- Stack: Vite + TypeScript estricto, sin dependencias de UI; `dist/` estático con rutas relativas.
- Publicación: raíz de `iesgalileo.alejandrocatalaespi.es`.
- Dos shells (escritorio ≥ 760 px y móvil) sobre el mismo núcleo; las apps no dependen del shell.
- Acceso: solo invitado por ahora. El acceso real (correo + código, apps por módulo en una base de datos con el propietario como administrador) queda para más adelante.
- Independiente de `ai-os` (SO de Raspberry Pi 5) por ahora.
- Identidad: morado `#2a1770`, rojo `#da251c`, logo en `public/logo.svg`; fondos en `public/fondos/` (aportados por Alejandro, con el logo centrado y adornos en las esquinas), rotados por `src/kernel/fondos.ts`.
- La simulación debe poder crecer hacia procesos, permisos y usuarios: el acceso al almacenamiento va siempre por `Vfs`.
