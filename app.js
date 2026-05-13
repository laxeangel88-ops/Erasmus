// ─── CONSTANTES ──────────────────────────────────────────────
const FEED_ORIGINAL = 'https://iesaljada.murciaeduca.es/feed/';
const PROXY_URL = `https://corsproxy.io/?url=${encodeURIComponent(FEED_ORIGINAL)}`;

// ─── FUNCIÓN PRINCIPAL ───────────────────────────────────────
async function cargarFeed() {
  const contenedor = document.getElementById('feed');

  try {
    const respuesta = await fetch(PROXY_URL);
    const textoXML  = await respuesta.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textoXML, 'application/xml');

    if (xmlDoc.querySelector('parsererror')) {
      contenedor.innerHTML = '<p class="cargando">Error al leer el feed.</p>';
      return;
    }

    const items = Array.from(xmlDoc.getElementsByTagName('item'));

    if (items.length === 0) {
      contenedor.innerHTML = '<p class="cargando">Sin noticias por ahora.</p>';
      return;
    }

    contenedor.innerHTML = '';

    items.forEach(item => {
      // Función auxiliar para leer texto con o sin CDATA
      const getText = (tag) => {
        const el = item.getElementsByTagName(tag)[0];
        if (!el) return '';
        return (el.innerHTML || el.textContent || '')
          .replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      };

      const titulo      = getText('title')       || 'Sin título';
      const descripcion = getText('description') || '';
      const fecha       = getText('pubDate')     || '';
      const enlace      = getText('link')        || '#';
      const categoriaRaw= getText('category')    || 'General';

      // Limpiamos etiquetas HTML de la descripción
      const tmp = document.createElement('div');
      tmp.innerHTML = descripcion;
      const textoLimpio = tmp.textContent || tmp.innerText || '';

      const tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta';
      tarjeta.dataset.categoria = categoriaRaw.toLowerCase();

      tarjeta.innerHTML = `
        <p class="pais">${categoriaRaw}</p>
        <h2>${titulo}</h2>
        <p>${textoLimpio.substring(0, 200)}...</p>
        <p class="fecha">${new Date(fecha).toLocaleDateString('es-ES', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}</p>
        <a class="autor" href="${enlace}" target="_blank" rel="noopener">
          Leer noticia completa →
        </a>
      `;

      contenedor.appendChild(tarjeta);
    });

    activarFiltros();

  } catch (error) {
    console.error('Error:', error);
    contenedor.innerHTML = '<p class="cargando">Error al cargar las noticias.</p>';
  }
}

// ─── FILTROS ─────────────────────────────────────────────────
function activarFiltros() {
  const botones    = document.querySelectorAll('.filtro-btn');
  const contenedor = document.getElementById('feed');

  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      botones.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');

      const categoria = boton.dataset.cat;
      const tarjetas  = contenedor.querySelectorAll('.tarjeta');

      tarjetas.forEach(tarjeta => {
        if (categoria === 'todos' ||
            tarjeta.dataset.categoria.includes(categoria)) {
          tarjeta.style.display = '';
        } else {
          tarjeta.style.display = 'none';
        }
      });
    });
  });
}

// ─── ARRANQUE ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', cargarFeed);
