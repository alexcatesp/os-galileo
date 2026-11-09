// Ayudas de los niveles de «Selectores» (mismo orden que NIVELES_SELECTOR). Ver ayudas.ts.

import type { Ayuda } from "./ayudas";

export const AYUDAS_SELECTOR: Ayuda[] = [
  {
    teoria: `Cada elemento HTML tiene un nombre de etiqueta (<code>p</code>, <code>h1</code>, <code>ul</code>…): es lo que ves entre <code>&lt; &gt;</code> en cada caja. Un selector puede elegir elementos por ese nombre.`,
    pistas: [
      `Fíjate en las cajas que parpadean: ¿qué etiqueta comparten?`,
      `Escribe solo el nombre de la etiqueta: <code>p</code>.`,
    ],
    explicacion: `Un selector de tipo es el nombre de la etiqueta, sin más, y elige todos los elementos de ese tipo.`,
  },
  {
    teoria: `Un elemento puede tener un <b>id</b> (lo ves como <code>id="…"</code> en la caja), que es único en la página. CSS tiene un símbolo propio para elegir por id.`,
    pistas: [
      `El símbolo es la almohadilla <code>#</code>, seguida del valor del id.`,
      `<code>#principal</code>`,
    ],
    explicacion: `<code>#id</code> elige el elemento con ese id. Como el id debe ser único, elige como mucho uno.`,
  },
  {
    teoria: `Una <b>clase</b> (<code>class="…"</code>) puede repetirse en muchos elementos, aunque sean de tipos distintos. Hay un símbolo propio para elegir por clase.`,
    pistas: [
      `El símbolo es un punto <code>.</code> seguido del nombre de la clase.`,
      `<code>.aviso</code>`,
    ],
    explicacion: `<code>.clase</code> elige todo elemento que tenga esa clase, sea de la etiqueta que sea.`,
  },
  {
    teoria: `Los selectores se pueden <b>combinar pegados</b>, sin espacios, para exigir varias condiciones a la vez sobre el mismo elemento. Aquí hay elementos con la clase buscada que no son del tipo que interesa.`,
    pistas: [
      `Escribe primero la etiqueta y, pegada a ella, la clase.`,
      `<code>p.aviso</code>`,
    ],
    explicacion: `Sin espacio, las condiciones se suman sobre el mismo elemento: debe ser un <code>p</code> Y tener la clase <code>aviso</code>.`,
  },
  {
    teoria: `Un elemento puede tener <b>varias clases</b>, separadas por espacios en el HTML. Para exigir que tenga las dos hay que pegar sus selectores de clase.`,
    pistas: [
      `Dos selectores de clase, uno detrás de otro, sin espacio entre ellos.`,
      `<code>.aviso.urgente</code>`,
    ],
    explicacion: `<code>.a.b</code> exige las dos clases a la vez; el orden en el HTML da igual. Con espacio (<code>.a .b</code>) significaría otra cosa: un <code>.b</code> dentro de un <code>.a</code>.`,
  },
  {
    teoria: `A veces importa <b>dónde</b> está el elemento. Un espacio entre dos selectores significa «dentro de», a cualquier profundidad. Quieres los enlaces que están en el menú de navegación, aunque haya otras etiquetas por medio.`,
    pistas: [
      `Escribe el contenedor, un espacio y el elemento que buscas dentro: <code>nav</code> y <code>a</code>.`,
      `<code>nav a</code>`,
    ],
    explicacion: `<code>A B</code> elige las B que son descendientes de una A, sean hijas, nietas o más profundas. Los <code>a</code> de fuera del <code>nav</code> no cuentan.`,
  },
  {
    teoria: `Hay una forma de pedir que el elemento sea <b>hijo directo</b>, sin etiquetas intermedias. Aquí hay <code>li</code> metidos dentro de listas anidadas, y solo quieres los del primer nivel.`,
    pistas: [
      `El símbolo es <code>&gt;</code>, entre el padre y el hijo.`,
      `<code>ul &gt; li</code>`,
    ],
    explicacion: `<code>A &gt; B</code> elige las B cuyo padre es directamente una A. Con <code>ul li</code> también habría salido el <code>li</code> de la lista interior, porque está dentro del <code>ul</code>, aunque no sea hijo directo.`,
  },
  {
    teoria: `Un mismo criterio puede servir para elementos de <b>distintos tipos</b> a la vez, agrupando selectores. Quieres elegir los dos tipos de título que hay, pero no el resto.`,
    pistas: [
      `Los selectores se separan con una coma.`,
      `<code>h1, h2</code>`,
    ],
    explicacion: `La coma agrupa: elige lo que cumpla el primer selector o el segundo.`,
  },
  {
    teoria: `Dos elementos son <b>hermanos</b> si comparten padre. Se puede elegir el que va <i>justo después</i> de otro. Aquí solo cuenta el párrafo que sigue inmediatamente a un título <code>h2</code>.`,
    pistas: [
      `El símbolo es <code>+</code> entre los dos elementos.`,
      `<code>h2 + p</code>`,
    ],
    explicacion: `<code>A + B</code> elige la B que va inmediatamente después de una A. El segundo <code>h2</code> va seguido de un <code>div</code>, así que no hay ningún <code>p</code> que cumpla.`,
  },
  {
    teoria: `Variante del anterior: todos los hermanos que vienen <b>más adelante</b>, aunque haya otros elementos entre medias. El párrafo que va antes del título no cuenta.`,
    pistas: [
      `El símbolo es una tilde <code>~</code>.`,
      `<code>h2 ~ p</code>`,
    ],
    explicacion: `<code>A ~ B</code> elige todas las B hermanas que vienen después de una A. El <code>p</code> que va antes del <code>h2</code> queda fuera.`,
  },
  {
    teoria: `Además de clase e id, los elementos tienen otros <b>atributos</b> (<code>type</code>, <code>href</code>, <code>required</code>…), que se ven en las etiquetas de las cajas. Se pueden elegir por tener un atributo.`,
    pistas: [
      `Los atributos se escriben entre corchetes <code>[ ]</code>. Mira qué atributo se repite en las cajas que parpadean.`,
      `<code>[required]</code>`,
    ],
    explicacion: `<code>[atributo]</code> elige los elementos que tienen ese atributo, tenga el valor que tenga (o ninguno).`,
  },
  {
    teoria: `También se puede exigir un <b>valor exacto</b> del atributo. Aquí hay enlaces con distintos valores de <code>target</code>, y solo interesan los que se abren en una pestaña nueva.`,
    pistas: [
      `Entre corchetes: el nombre del atributo, un <code>=</code> y el valor entre comillas.`,
      `<code>a[target="_blank"]</code>`,
    ],
    explicacion: `<code>[atributo="valor"]</code> exige el valor exacto. Sirve, por ejemplo, para marcar con un icono los enlaces que se abren fuera de la página.`,
  },
  {
    teoria: `No siempre se conoce el valor entero del atributo: se puede exigir solo que <b>empiece</b> por un texto. Aquí interesan los enlaces seguros, y uno de ellos tiene «https» en medio sin empezar por ahí.`,
    pistas: [
      `Antes del <code>=</code> va el símbolo <code>^</code>, que en las expresiones regulares significa «comienzo».`,
      `<code>a[href^="https"]</code>`,
    ],
    explicacion: `<code>[atributo^="x"]</code> elige los que empiezan por x. El último enlace contiene «https» pero no empieza por ello, y por eso no cuenta.`,
  },
  {
    teoria: `El mismo recurso funciona para el <b>final</b> del valor, por ejemplo para distinguir enlaces por la extensión del archivo al que apuntan.`,
    pistas: [
      `Ahora el símbolo antes del <code>=</code> es el dólar <code>$</code>, que en las expresiones regulares significa «final».`,
      `<code>a[href$=".pdf"]</code>`,
    ],
    explicacion: `<code>[atributo$="x"]</code> elige los que terminan en x. El enlace <code>pdf.zip</code> contiene «pdf» pero no acaba en <code>.pdf</code>. También existe <code>*=</code> para «contiene».`,
  },
  {
    teoria: `Las <b>pseudoclases</b> eligen por algo que el elemento tiene sin que esté escrito en el HTML, como su posición entre los hermanos. Aquí interesa el que ocupa el primer lugar dentro de su padre.`,
    pistas: [
      `Las pseudoclases se escriben con dos puntos <code>:</code> pegados al selector. En inglés, «primer hijo» es <i>first child</i>.`,
      `<code>li:first-child</code>`,
    ],
    explicacion: `<code>:first-child</code> elige el elemento que es el primero de su padre. Hay uno por cada padre, de ahí que salgan dos.`,
  },
  {
    teoria: `También hay una para el <b>último</b>. Ojo: es el último de todos los hijos de su padre; si después de un <code>p</code> va otra etiqueta, ese <code>p</code> ya no es el último.`,
    pistas: [
      `Es la pareja de la anterior: <i>last child</i>.`,
      `<code>p:last-child</code>`,
    ],
    explicacion: `<code>:last-child</code> comprueba la posición entre <em>todos</em> los hermanos, sin importar su tipo. En la sección, el <code>p</code> va seguido de un <code>span</code>, así que no es el último.`,
  },
  {
    teoria: `Se puede elegir por <b>posición exacta</b>, contando desde 1, con una pseudoclase que recibe el número entre paréntesis.`,
    pistas: [
      `Empieza por <code>:nth-</code> (de «enésimo») y lleva el número entre paréntesis.`,
      `<code>li:nth-child(2)</code>`,
    ],
    explicacion: `<code>:nth-child(n)</code> elige el hijo que ocupa la posición n de su padre. En la lista de un solo elemento no hay segundo, por eso no sale.`,
  },
  {
    teoria: `La misma pseudoclase admite <b>palabras clave y fórmulas</b> para elegir patrones de posiciones, como las impares o las pares (muy usado para dar color a filas alternas de una tabla).`,
    pistas: [
      `En vez de un número, escribe la palabra inglesa para «impar».`,
      `<code>li:nth-child(odd)</code>`,
    ],
    explicacion: `<code>odd</code> son las posiciones 1, 3, 5… y <code>even</code> las 2, 4, 6… También vale una fórmula: <code>2n+1</code> equivale a <code>odd</code>.`,
  },
  {
    teoria: `A veces es más fácil decir lo que <b>no</b> debe cumplir. Existe una pseudoclase que excluye lo que coincida con el selector que lleva dentro.`,
    pistas: [
      `Se llama como la palabra inglesa para «no» y recibe un selector entre paréntesis.`,
      `<code>p:not(.nota)</code>`,
    ],
    explicacion: `<code>:not(X)</code> elige lo que no cumple X. Aquí, los <code>p</code> que no tienen la clase <code>nota</code>, aunque tengan otras.`,
  },
  {
    teoria: `Otra pseudoclase de posición: la que elige al elemento que es el <b>único</b> hijo de su padre.`,
    pistas: [
      `En inglés, <i>only child</i>.`,
      `<code>li:only-child</code>`,
    ],
    explicacion: `<code>:only-child</code> equivale a <code>:first-child:last-child</code>: el primero y a la vez el último.`,
  },
  {
    teoria: `También se pueden elegir los elementos <b>sin contenido</b>: ni texto ni otras etiquetas dentro. Es útil, por ejemplo, para ocultar párrafos vacíos.`,
    pistas: [
      `Es una pseudoclase cuyo nombre es la palabra inglesa para «vacío».`,
      `<code>p:empty</code>`,
    ],
    explicacion: `<code>:empty</code> solo elige elementos sin hijos ni texto. Un párrafo con texto, aunque sea corto, ya no está vacío.`,
  },
  {
    teoria: `Parecido a «primer hijo», pero contando solo entre los hermanos <b>de la misma etiqueta</b>. Fíjate en el segundo bloque: hay un <code>p</code> que es el primer <code>p</code> aunque no sea el primer hijo.`,
    pistas: [
      `Es como <code>:first-child</code>, pero termina en <code>-of-type</code> («de su tipo»).`,
      `<code>p:first-of-type</code>`,
    ],
    explicacion: `<code>:first-of-type</code> ignora las demás etiquetas al contar. En el primer bloque, el primer <code>p</code> va después de un <code>h2</code> y aun así cuenta como el primero de su tipo.`,
  },
  {
    teoria: `Elige los <b>enlaces internos</b> (los que empiezan por <code>#</code>) del menú <code>.menu</code>, pero <b>no los del último elemento de la lista</b>. Hay que combinar clase, descendiente, exclusión, posición y atributo.`,
    pistas: [
      `Piensa por piezas, de izquierda a derecha: el menú (clase) → los <code>li</code> que NO son el último → los <code>a</code> dentro de ellos → cuyo <code>href</code> empieza por <code>#</code>.`,
      `<code>.menu li:not(:last-child) a[href^="#"]</code>`,
    ],
    explicacion: `Se lee de izquierda a derecha: dentro de <code>.menu</code>, los <code>li</code> que no son el último hijo y, dentro de ellos, los <code>a</code> cuyo <code>href</code> empieza por <code>#</code>.`,
  },
];
