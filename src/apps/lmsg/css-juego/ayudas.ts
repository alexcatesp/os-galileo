// Textos de ayuda de los niveles de Flexbox y Grid (mismo orden que NIVELES_FLEX y NIVELES_GRID).
// - teoria: el concepto, sin dar la propiedad exacta cuando el nivel se puede resolver pensando.
// - pistas: la primera orienta; la segunda concreta. Después, el botón enseña la solución.
// - explicacion: se muestra al acertar, para entender POR QUÉ funciona.

export interface Ayuda {
  teoria: string;
  pistas: [string, string];
  explicacion: string;
}

export const AYUDAS_FLEX: Ayuda[] = [
  {
    teoria: `Por defecto los hijos de un contenedor se apilan unos debajo de otros, como bloques. Hay un modo que los coloca <b>uno al lado del otro</b>; se activa en el contenedor, con la propiedad <code>display</code>.`,
    pistas: [
      `Mira el objetivo: las cajas van en fila. ¿Qué valor de <code>display</code> las coloca así?`,
      `El valor se llama <code>flex</code>: escribe <code>display: flex</code> en <code>.pista</code>.`,
    ],
    explicacion: `<code>display: flex</code> convierte a <code>.pista</code> en un contenedor flex y a sus hijos en elementos flex, que se colocan en fila sobre el <b>eje principal</b>.`,
  },
  {
    teoria: `En un contenedor flex los elementos se reparten a lo largo del <b>eje principal</b> (en una fila, el horizontal). Una propiedad del contenedor decide qué se hace con el espacio sobrante: dejarlo al principio, al final, en el centro…`,
    pistas: [
      `Es una propiedad del contenedor cuyo nombre empieza por <code>justify-</code>. Mira dónde ha quedado el espacio libre en el objetivo.`,
      `<code>justify-content: flex-end</code>.`,
    ],
    explicacion: `<code>justify-content</code> reparte el espacio libre sobre el eje principal. <code>flex-end</code> empuja todos los elementos hacia el final.`,
  },
  {
    teoria: `Con la misma propiedad del nivel anterior se puede dejar el espacio sobrante <b>repartido a los dos lados</b>, de modo que el grupo de cajas quede en el medio.`,
    pistas: [
      `Mira el objetivo: queda el mismo espacio a la izquierda que a la derecha. Es un valor de la propiedad de antes.`,
      `<code>justify-content: center</code>.`,
    ],
    explicacion: `<code>center</code> agrupa los elementos en el centro del eje principal, con el mismo espacio a cada lado.`,
  },
  {
    teoria: `Otros valores de esa propiedad reparten el espacio libre <b>entre</b> los elementos en lugar de dejarlo en los extremos. Aquí la primera caja está pegada al principio y la última, al final.`,
    pistas: [
      `El nombre del valor dice dónde va el espacio: <i>entre</i> los elementos (en inglés, <i>between</i>).`,
      `<code>justify-content: space-between</code>.`,
    ],
    explicacion: `<code>space-between</code> pega el primero al inicio y el último al final, y reparte el resto del espacio en huecos iguales entre las cajas.`,
  },
  {
    teoria: `Otro reparto: cada elemento recibe el mismo espacio <b>a su alrededor</b>. Fíjate en que los extremos tienen la mitad de hueco que el que hay entre cajas.`,
    pistas: [
      `En inglés, <i>around</i> significa «alrededor».`,
      `<code>justify-content: space-around</code>.`,
    ],
    explicacion: `<code>space-around</code> da medio hueco a cada lado de cada caja, así que entre dos cajas hay el doble que en los bordes. <code>space-evenly</code> iguala todos los huecos.`,
  },
  {
    teoria: `Además del eje principal hay un <b>eje secundario</b>, perpendicular a él (en una fila, el vertical). Otra propiedad del contenedor, distinta de la anterior, coloca los elementos sobre ese eje. Aquí las cajas están en el fondo.`,
    pistas: [
      `Es la propiedad que empieza por <code>align-</code> y que termina en <code>-items</code>.`,
      `<code>align-items: flex-end</code>.`,
    ],
    explicacion: `<code>align-items</code> alinea los elementos en el eje secundario. <code>flex-end</code> los lleva al final de ese eje: abajo, cuando va en fila.`,
  },
  {
    teoria: `La propiedad del nivel anterior tiene un valor que deja los elementos <b>a media altura</b>.`,
    pistas: [
      `Mira el objetivo: las cajas están a media altura de la pista, no arriba ni abajo.`,
      `<code>align-items: center</code>.`,
    ],
    explicacion: `<code>center</code> centra cada elemento en el eje secundario. Sin esa propiedad, las cajas con altura fija se quedan arriba.`,
  },
  {
    teoria: `Una sola caja en el <b>centro exacto</b> de la pista: hay que actuar sobre los dos ejes a la vez.`,
    pistas: [
      `Combina la propiedad del eje principal y la del eje secundario que ya conoces.`,
      `<code>justify-content: center</code> y <code>align-items: center</code>.`,
    ],
    explicacion: `Es el truco más usado de Flexbox: <code>justify-content</code> centra en horizontal y <code>align-items</code> centra en vertical.`,
  },
  {
    teoria: `La <b>dirección</b> del eje principal también se puede cambiar. Mira los números de las cajas: en el objetivo salen en el orden contrario al del HTML.`,
    pistas: [
      `Busca una propiedad del contenedor que empiece por <code>flex-</code> y hable de la <i>dirección</i>.`,
      `<code>flex-direction: row-reverse</code>.`,
    ],
    explicacion: `<code>flex-direction</code> fija la dirección del eje principal. <code>row-reverse</code> sigue en horizontal pero de derecha a izquierda. Ojo: solo cambia el orden visual, no el del HTML (importa para lectores de pantalla y para el tabulador).`,
  },
  {
    teoria: `El eje principal también puede ser <b>vertical</b>: entonces los elementos se apilan unos encima de otros, pero conservando las ventajas de Flexbox.`,
    pistas: [
      `Es la misma propiedad del nivel anterior con otro valor.`,
      `<code>flex-direction: column</code>.`,
    ],
    explicacion: `Con <code>column</code> el eje principal es el vertical y el secundario, el horizontal.`,
  },
  {
    teoria: `Cuando cambia la dirección, <b>los ejes se intercambian</b>: las propiedades de siempre actúan sobre el otro sentido. Lleva las cajas al fondo y centradas horizontalmente.`,
    pistas: [
      `Necesitas tres propiedades: la dirección y las dos de colocación. Recuerda qué eje controla cada una cuando la dirección es columna.`,
      `<code>flex-direction: column; justify-content: flex-end; align-items: center;</code>`,
    ],
    explicacion: `En columna, <code>justify-content</code> actúa en vertical (es el eje principal) y <code>align-items</code> en horizontal. Lo que no cambia es que <code>justify-content</code> siempre sigue al eje principal.`,
  },
  {
    teoria: `Un hijo puede cambiar su posición sin tocar el HTML: tiene un <b>número de orden</b> (por defecto, 0 para todos) y se colocan de menor a mayor. Esa propiedad se escribe en el hijo, no en el contenedor. Quieres que la caja 3 salga la primera.`,
    pistas: [
      `La propiedad se llama como lo que hace: <code>order</code>. Piensa qué número queda por delante de los que valen 0.`,
      `<code>#c3 { order: -1; }</code>`,
    ],
    explicacion: `<code>order</code> ordena los elementos de menor a mayor; si hay empate se respeta el orden del HTML. Con <code>-1</code>, la caja 3 pasa por delante de las demás, que valen 0.`,
  },
  {
    teoria: `La alineación del eje secundario que decide el contenedor se puede <b>sobrescribir para un solo hijo</b>. Baja únicamente la caja 2 al fondo.`,
    pistas: [
      `Es como la propiedad <code>align-items</code>, pero termina con otra palabra y se escribe en el hijo.`,
      `<code>#c2 { align-self: flex-end; }</code>`,
    ],
    explicacion: `<code>align-self</code> es la versión de <code>align-items</code> para un único elemento y tiene prioridad sobre ella.`,
  },
  {
    teoria: `Para separar elementos no hace falta poner márgenes a cada uno: el contenedor puede dejar un <b>hueco fijo</b> entre sus hijos. Quieres 24px.`,
    pistas: [
      `Es una propiedad del contenedor, de tres letras, que en inglés significa «hueco».`,
      `<code>gap: 24px</code>.`,
    ],
    explicacion: `<code>gap</code> añade huecos solo entre los elementos, no en los bordes. Es más limpio que usar márgenes, porque no hay que quitar el del último.`,
  },
  {
    teoria: `Los elementos pueden <b>crecer</b> para llenar el espacio libre del eje principal. Cada hijo indica cuánto crece respecto a los demás. Haz que las tres cajas llenen toda la fila a partes iguales.`,
    pistas: [
      `La propiedad se escribe en los hijos (<code>.caja</code>). Un mismo número en todos significa «mismo reparto».`,
      `<code>.caja { flex: 1; }</code>`,
    ],
    explicacion: `<code>flex: 1</code> equivale a <code>1 1 0</code>: pueden crecer, pueden encogerse y parten de ancho 0, así que se reparten todo el espacio por igual. Con <code>flex: 2</code> en una caja, esa recibiría el doble.`,
  },
  {
    teoria: `Por defecto todos los elementos intentan caber en <b>una sola línea</b> y se encogen para ello. En el objetivo ya no se encogen: los que no caben pasan a otra línea. Eso se pide al contenedor.`,
    pistas: [
      `Empieza por <code>flex-</code> y trata del <i>envoltorio</i> (en inglés, <i>wrap</i>).`,
      `<code>flex-wrap: wrap</code>.`,
    ],
    explicacion: `<code>flex-wrap: wrap</code> deja que los elementos que no caben bajen a una nueva línea sin encogerse. El valor por defecto es <code>nowrap</code>.`,
  },
  {
    teoria: `Con varias líneas aparece otro reparto: el de <b>las propias líneas</b> dentro del contenedor, sobre el eje secundario. Quieres las líneas separadas: la primera arriba y la última abajo.`,
    pistas: [
      `No es <code>align-items</code> (esa coloca los elementos dentro de cada línea). Es otra propiedad que empieza por <code>align-</code>, la que reparte <i>el contenido</i>.`,
      `<code>align-content: space-between</code>.`,
    ],
    explicacion: `<code>align-content</code> reparte las <i>líneas</i> y solo tiene efecto cuando hay varias (<code>flex-wrap</code>). <code>align-items</code> coloca los elementos dentro de cada línea.`,
  },
  {
    teoria: `Cuatro cajas: el logo (la 1) a la izquierda y las otras tres a la derecha, todas a media altura. En Flexbox un <b>margen automático</b> se come todo el espacio libre de su lado.`,
    pistas: [
      `Son dos cosas: una alineación vertical en el contenedor y un margen en una caja concreta. ¿Cuál es la primera de las que van a la derecha?`,
      `<code>.pista { align-items: center; }</code> y <code>#c2 { margin-left: auto; }</code>`,
    ],
    explicacion: `<code>margin-left: auto</code> en un elemento flex absorbe todo el espacio libre a su izquierda y empuja a ese elemento, y a los siguientes, hacia el final. Es el truco típico de las barras de navegación.`,
  },
];

export const AYUDAS_GRID: Ayuda[] = [
  {
    teoria: `Un contenedor <b>grid</b> divide su espacio en filas y columnas. Se activa en el contenedor con <code>display</code> y las columnas se definen con una propiedad que empieza por <code>grid-template-</code>. Existe una unidad, la <b>fracción</b> (<code>fr</code>), que reparte el espacio libre.`,
    pistas: [
      `Hacen falta dos cosas: activar el modo rejilla y fijar las columnas. Para repetir un tamaño existe <code>repeat(veces, tamaño)</code>.`,
      `<code>display: grid; grid-template-columns: repeat(3, 1fr);</code>`,
    ],
    explicacion: `<code>repeat(3, 1fr)</code> es una abreviatura de <code>1fr 1fr 1fr</code>: tres columnas que se reparten el ancho por igual.`,
  },
  {
    teoria: `Las columnas pueden tener anchos distintos mezclando <b>unidades fijas y fracciones</b>. Quieres tres: una de 80px y dos que se reparten el resto, la última con el doble de espacio que la anterior.`,
    pistas: [
      `Es la propiedad del nivel anterior: se lista un tamaño por cada columna, separados por espacios.`,
      `<code>grid-template-columns: 80px 1fr 2fr;</code>`,
    ],
    explicacion: `Primero se descuentan las columnas fijas (80px) y el resto se reparte en 3 fracciones: 1 para la segunda columna y 2 para la tercera.`,
  },
  {
    teoria: `Como en Flexbox, el contenedor puede dejar <b>huecos</b> entre las celdas. Quieres 12px.`,
    pistas: [
      `Es la misma propiedad que se usó en Flexbox para los huecos.`,
      `<code>gap: 12px;</code>`,
    ],
    explicacion: `<code>gap</code> separa filas y columnas a la vez. Con <code>row-gap</code> y <code>column-gap</code> se controlan por separado.`,
  },
  {
    teoria: `Las filas se definen igual que las columnas, con otra propiedad paralela. Quieres dos filas: la primera de 60px y la segunda ocupando todo lo que quede.`,
    pistas: [
      `Cambia una palabra en el nombre de la propiedad de las columnas.`,
      `<code>grid-template-rows: 60px 1fr;</code>`,
    ],
    explicacion: `<code>1fr</code> en la segunda fila se queda con todo el alto sobrante una vez descontados los 60px de la primera.`,
  },
  {
    teoria: `Un hijo puede ocupar <b>más de una celda</b>. Esa propiedad se escribe en el hijo: haz que la caja 1 ocupe dos columnas.`,
    pistas: [
      `Empieza por <code>grid-</code>, trata de la <i>columna</i> y admite la palabra <code>span</code> (abarcar).`,
      `<code>#c1 { grid-column: span 2; }</code>`,
    ],
    explicacion: `<code>span 2</code> significa «abarca 2 columnas a partir de donde empiece». Las demás cajas se recolocan solas.`,
  },
  {
    teoria: `Las columnas están separadas por <b>líneas numeradas</b> que empiezan en 1 (con 3 columnas hay 4 líneas). Un hijo puede indicar entre qué líneas va. Haz que la caja 1 ocupe toda la fila.`,
    pistas: [
      `La propiedad de columna del nivel anterior admite dos números separados por una barra: la línea donde empieza y la línea donde termina.`,
      `<code>#c1 { grid-column: 1 / 4; }</code>`,
    ],
    explicacion: `<code>1 / 4</code> va de la línea 1 a la 4, o sea, las tres columnas. También valdría <code>1 / -1</code>, donde -1 es «la última línea».`,
  },
  {
    teoria: `Lo mismo que con las columnas, pero en <b>vertical</b>. La caja 2 debe ocupar dos filas de alto.`,
    pistas: [
      `Cambia <i>columna</i> por <i>fila</i> (en inglés, <i>row</i>) en la propiedad del nivel 5.`,
      `<code>#c2 { grid-row: span 2; }</code>`,
    ],
    explicacion: `La caja abarca dos filas, y las siguientes se colocan en los huecos que quedan libres.`,
  },
  {
    teoria: `Las cajas son más pequeñas que su celda. Por defecto se quedan en la esquina; el contenedor puede <b>alinearlas dentro de su celda</b>, en horizontal y en vertical.`,
    pistas: [
      `Hay una propiedad para cada sentido: la horizontal empieza por <code>justify-</code> y la vertical, por <code>align-</code>; ambas acaban en <code>-items</code>.`,
      `<code>justify-items: center; align-items: center;</code>`,
    ],
    explicacion: `En grid, <code>justify-</code> es siempre el sentido horizontal y <code>align-</code> el vertical (no se intercambian como en Flexbox). <code>-items</code> afecta a todos los hijos.`,
  },
  {
    teoria: `Igual que se alinean todas, se puede alinear <b>una sola</b> dentro de su celda; se escribe en el hijo. Lleva la caja 1 a la esquina inferior derecha de su celda.`,
    pistas: [
      `Cambia <code>-items</code> por <code>-self</code> en las dos propiedades de alineación, y usa el valor <code>end</code>.`,
      `<code>#c1 { justify-self: end; align-self: end; }</code>`,
    ],
    explicacion: `<code>justify-self</code> y <code>align-self</code> son la versión de un solo elemento y mandan sobre las de <code>-items</code>.`,
  },
  {
    teoria: `Una rejilla <b>adaptable</b> crea sola tantas columnas como quepan, cada una con un ancho mínimo, y las estira para llenar el espacio. Se escribe con <code>repeat</code> usando una palabra clave en lugar del número de columnas, y la función <code>minmax(mínimo, máximo)</code>. Aquí el mínimo es 80px.`,
    pistas: [
      `<code>repeat(auto-…, minmax(80px, 1fr))</code>: falta la palabra que significa «rellenar» (en inglés, <i>fill</i>).`,
      `<code>grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));</code>`,
    ],
    explicacion: `<code>auto-fill</code> crea todas las columnas que quepan y <code>minmax(80px, 1fr)</code> las hace de 80px como mínimo y las estira. Si la pista cambiara de ancho, cambiaría el número de columnas sin necesidad de media queries.`,
  },
  {
    teoria: `Monta la estructura clásica: la caja <b>1</b> (cabecera) ocupa toda la fila de arriba, la <b>2</b> (menú) queda a la izquierda en el centro, la <b>3</b> (contenido) a su derecha y la <b>4</b> (pie) ocupa toda la fila de abajo. Hay dos columnas (80px y 1fr), tres filas (44px, 1fr y 44px) y 8px de hueco.`,
    pistas: [
      `Hay dos caminos: dar a cada caja <code>grid-column</code> y <code>grid-row</code> con líneas numeradas, o poner <b>nombres</b> a las áreas con <code>grid-template-areas</code> y asignarlos a cada caja con <code>grid-area</code>.`,
      `Con áreas: <code>grid-template-areas: "cab cab" "menu cont" "pie pie";</code> y después <code>#c1 { grid-area: cab; }</code>, y así con las demás. No olvides columnas, filas y <code>gap</code>.`,
    ],
    explicacion: `Cada cadena de <code>grid-template-areas</code> es una fila y cada palabra, una celda; repetir un nombre fusiona celdas. Es la forma más legible de maquetar una página entera.`,
  },
];
