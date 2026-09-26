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
