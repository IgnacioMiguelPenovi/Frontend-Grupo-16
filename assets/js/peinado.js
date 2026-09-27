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