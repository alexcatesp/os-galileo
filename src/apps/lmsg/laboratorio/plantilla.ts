// Piezas comunes de los retos: la plantilla de documento y una imagen de ejemplo.

export const plantilla = (cuerpo: string, titulo = "Mi página") => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <link rel="stylesheet" href="estilos.css">
</head>
<body>
${cuerpo}
</body>
</html>
`;

export const LOGO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='46' fill='%232a1770'/%3E%3Cpath d='M30 62l20-34 20 34z' fill='%23da251c'/%3E%3C/svg%3E`;
