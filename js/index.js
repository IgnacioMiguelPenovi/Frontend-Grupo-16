iniciarFuncionLiza();

function iniciarFuncionLiza() {
  const boton = document.getElementById('boton-liza');
  const salida = document.getElementById('resultado-liza');
  if (!boton || !salida) return;

  const datos = [
    'Dato curioso: el primer "Hola, mundo" se publicó en 1972.',
    'Dato curioso: CSS cumplió su primera versión estable en 1996.',
    'Dato curioso: Git fue creado por Linus Torvalds en apenas dos semanas.',
    'Dato curioso: la primera página web sigue online desde 1991.',
    'Dato curioso: "bug" se usa desde que encontraron un insecto real en una computadora en 1947.',
  ];

  boton.addEventListener('click', () => {
    const dato = datos[Math.floor(Math.random() * datos.length)];
    salida.textContent = '🎷 ' + dato;
  });
}

/**
 * Peinado interactivo de Marge
 * -----------------------------
 * - Un slider controla la altura (en px) del peinado.
 * - Esa altura se muestra convertida a "metros" (px / 100).
 * - Los objetos con [data-reveal] dentro de .hair aparecen cuando
 *   la altura del peinado alcanza o supera su umbral.
 * - La dona apoyada arriba del pelo sube o baja junto con la altura.
 * - El botón "Guardar en el peinado" agrega el objeto elegido en el
 *   selector como un nuevo objeto oculto, escondido a la altura actual.
 */
function initPeinadoMarge() {
  const hair = document.getElementById('margeHair');
  const range = document.getElementById('peinadoRango');
  const metrosEl = document.getElementById('peinadoMetros');
  const btnGuardar = document.getElementById('guardarObjeto');
  const msg = document.getElementById('peinadoMsg');
  const donut = document.querySelector('.peinado-mini .donut');

  if (!hair || !range) return; // el widget no está en esta página

  // debe coincidir con el "bottom" que le dimos a .hair en el CSS
  const HAIR_BASE_OFFSET = 58;

  let objetosOcultos = Array.from(hair.querySelectorAll('.hair-object'));

  function metros(px) {
    return (px / 100).toFixed(2);
  }

  function actualizarPeinado(alturaPx) {
    hair.style.height = alturaPx + 'px';
    if (metrosEl) metrosEl.textContent = metros(alturaPx);

    // la dona queda siempre apoyada justo arriba de la punta del pelo
    if (donut) donut.style.bottom = (HAIR_BASE_OFFSET + alturaPx) + 'px';

    objetosOcultos.forEach(function (obj) {
      const umbral = Number(obj.dataset.reveal);
      const visible = alturaPx >= umbral;
      obj.classList.toggle('is-visible', visible);
      const bottom = Math.max(10, Math.min(umbral, alturaPx) - 24);
      obj.style.bottom = bottom + 'px';
    });
  }

  function guardarObjetoElegido() {
    const elegido = document.querySelector('input[name="objetoOculto"]:checked');
    if (!elegido) {
      if (msg) msg.textContent = 'Primero elegí qué objeto querés guardar.';
      return;
    }

    const alturaActual = Number(range.value);

    const nuevo = document.createElement('span');
    nuevo.className = 'hair-object objeto-guardado';
    nuevo.textContent = elegido.value;
    nuevo.dataset.reveal = String(alturaActual);
    hair.appendChild(nuevo);
    objetosOcultos.push(nuevo);

    actualizarPeinado(alturaActual);

    if (msg) {
      msg.textContent =
        'Guardaste ' + elegido.value + ' a ' + metros(alturaActual) +
        ' metros de altura. Subí o bajá el peinado para volver a encontrarlo.';
    }
  }

  range.addEventListener('input', function (e) {
    actualizarPeinado(Number(e.target.value));
  });

  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarObjetoElegido);
  }

  // estado inicial
  actualizarPeinado(Number(range.value));
}

document.addEventListener('DOMContentLoaded', initPeinadoMarge);

/**
 * La pizarra de Bart
 * ------------------
 * - El input es el mensaje de un "commit".
 * - Al hacer commit (botón o Enter), Bart lo escribe en el pizarrón
 *   letra por letra, con un hash corto adelante como si fuera un commit real.
 * - El pizarrón muestra como máximo MAX_LINEAS líneas: cuando se llena,
 *   se borra la más vieja.
 * - Los commits se guardan en localStorage para que sigan ahí al recargar.
 * - "Borrar pizarrón" limpia todo (y corta lo que Bart esté escribiendo).
 */
function initPizarraBart() {
  const form = document.getElementById('pizarraForm');
  const input = document.getElementById('pizarraInput');
  const board = document.getElementById('pizarraLineas');
  const msg = document.getElementById('pizarraMsg');
  const btnBorrar = document.getElementById('pizarraBorrar');
  const bart = document.querySelector('.pizarra-bart');

  if (!form || !input || !board) return; // el widget no está en esta página

  const MAX_LINEAS = 6;
  const MS_POR_LETRA = 32;
  const STORAGE_KEY = 'donuts-code:pizarra-bart';
  const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let commits = cargar();
  let cola = [];
  let escribiendo = false;
  let epoca = 0; // se incrementa al borrar para cancelar lo que se esté escribiendo

  // ---------- almacenamiento (puede fallar en modo privado) ----------
  function cargar() {
    try {
      const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(guardado)) return [];
      return guardado
        .filter(function (c) { return c && typeof c.hash === 'string' && typeof c.texto === 'string'; })
        .slice(-MAX_LINEAS);
    } catch (e) {
      return [];
    }
  }

  function guardar() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(commits));
    } catch (e) { /* sin almacenamiento: la pizarra funciona igual */ }
  }

  // ---------- helpers ----------
  function hashCorto() {
    const bytes = new Uint8Array(4);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes, function (b) { return b.toString(16).padStart(2, '0'); })
      .join('')
      .slice(0, 7);
  }

  function esperar(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function mostrarVacia() {
    if (board.querySelector('.pizarra-line, .pizarra-vacia')) return;
    const p = document.createElement('p');
    p.className = 'pizarra-vacia';
    p.textContent = 'Bart todavía no hizo ningún commit…';
    board.appendChild(p);
  }

  function ocultarVacia() {
    const vacia = board.querySelector('.pizarra-vacia');
    if (vacia) vacia.remove();
  }

  function crearLinea(hash) {
    ocultarVacia();
    const linea = document.createElement('div');
    linea.className = 'pizarra-line';
    const h = document.createElement('span');
    h.className = 'pizarra-hash';
    h.textContent = hash;
    const t = document.createElement('span');
    t.className = 'pizarra-text';
    linea.appendChild(h);
    linea.appendChild(t);
    board.appendChild(linea);

    // el pizarrón nunca muestra más de MAX_LINEAS: se borra la más vieja
    const lineas = board.querySelectorAll('.pizarra-line');
    for (let i = 0; i < lineas.length - MAX_LINEAS; i++) lineas[i].remove();
    return { linea: linea, texto: t };
  }

  // ---------- escritura ----------
  async function escribir(commit) {
    const miEpoca = epoca;
    const partes = crearLinea(commit.hash);

    if (sinAnimacion) {
      partes.texto.textContent = commit.texto;
      return true;
    }

    partes.linea.classList.add('is-typing');
    for (const letra of commit.texto) {
      if (miEpoca !== epoca) return false; // borraron el pizarrón mientras escribía
      partes.texto.textContent += letra;
      await esperar(MS_POR_LETRA);
    }
    partes.linea.classList.remove('is-typing');
    return true;
  }

  async function procesarCola() {
    if (escribiendo) return;
    escribiendo = true;
    if (bart) bart.classList.add('is-writing');

    while (cola.length) {
      const commit = cola.shift();
      const terminado = await escribir(commit);
      if (terminado && msg) {
        msg.textContent = '¡Bart escribió el commit ' + commit.hash + ' en la pizarra!';
      }
    }

    escribiendo = false;
    if (bart) bart.classList.remove('is-writing');
  }

  // ---------- eventos ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const texto = input.value.trim();

    if (!texto) {
      if (msg) msg.textContent = 'Escribí un mensaje de commit antes de hacer commit.';
      input.focus();
      return;
    }

    const commit = { hash: hashCorto(), texto: texto };
    commits.push(commit);
    commits = commits.slice(-MAX_LINEAS);
    guardar();

    cola.push(commit);
    input.value = '';
    input.focus();
    if (msg) msg.textContent = 'Bart está escribiendo…';
    procesarCola();
  });

  if (btnBorrar) {
    btnBorrar.addEventListener('click', function () {
      epoca++;
      cola = [];
      commits = [];
      guardar();
      board.textContent = '';
      mostrarVacia(); // el bucle de escritura en curso se corta solo (epoca) y apaga a Bart
      if (msg) msg.textContent = 'Pizarrón borrado. ¡Bart puede empezar de nuevo!';
    });
  }

  // ---------- estado inicial ----------
  board.textContent = '';
  if (commits.length) {
    commits.forEach(function (c) {
      crearLinea(c.hash).texto.textContent = c.texto;
    });
  } else {
    mostrarVacia();
  }
}

document.addEventListener('DOMContentLoaded', initPizarraBart);

 (() => {
    const area = document.getElementById('j-area');
    const objetivo = document.getElementById('j-objetivo');
    const elPuntos = document.getElementById('j-puntos');
    const elTiempo = document.getElementById('j-tiempo');
    const elRecord = document.getElementById('j-record');
    const btn = document.getElementById('j-empezar');

    if (!area || !objetivo || !elPuntos || !elTiempo || !elRecord || !btn) return; // el juego no está en esta página

    let puntos = 0, tiempo = 20, valor = 1;
    let reloj = null, movedor = null;
    let record = 0;
    try { record = Number(localStorage.getItem('maggie-record')) || 0; } catch (e) {}
    elRecord.textContent = record;

    function colocar() {
      const esDona = Math.random() < 0.2;
      objetivo.textContent = esDona ? '🍩' : '🍼';
      valor = esDona ? 3 : 1;
      const maxX = Math.max(0, area.clientWidth - 56);
      const maxY = Math.max(0, area.clientHeight - 56);
      objetivo.style.left = Math.random() * maxX + 'px';
      objetivo.style.top = Math.random() * maxY + 'px';
    }

    function terminar() {
      clearInterval(reloj);
      clearInterval(movedor);
      objetivo.hidden = true;
      if (puntos > record) {
        record = puntos;
        elRecord.textContent = record;
        try { localStorage.setItem('maggie-record', record); } catch (e) {}
      }
      btn.textContent = '¡Otra vez! (hiciste ' + puntos + ')';
      btn.hidden = false;
    }

    function empezar() {
      puntos = 0;
      tiempo = 20;
      elPuntos.textContent = 0;
      elTiempo.textContent = 20;
      btn.hidden = true;
      objetivo.hidden = false;
      colocar();
      movedor = setInterval(colocar, 900);
      reloj = setInterval(() => {
        tiempo--;
        elTiempo.textContent = tiempo;
        if (tiempo <= 0) terminar();
      }, 1000);
    }

    objetivo.addEventListener('click', () => {
      puntos += valor;
      elPuntos.textContent = puntos;
      colocar();
    });
    btn.addEventListener('click', empezar);
  })();

  // Dinámica del garage de la portada
 

  const garage = document.getElementById('garage');
  const garageDoor = document.getElementById('garage-door');
  const garageInside = document.getElementById('garage-inside');

  if (garage && garageDoor && garageInside) {
    function toggleGarage() {
      const isOpen = garage.classList.toggle('is-open');
      garageDoor.setAttribute('aria-expanded', isOpen);
      garageDoor.style.visibility = isOpen ? 'hidden' : 'visible';
      garageInside.hidden = !isOpen;
    }

    garageDoor.addEventListener('click', toggleGarage);
    garageInside.addEventListener('click', toggleGarage);
  }