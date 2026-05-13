// ─── CONSTANTES ──────────────────────────────────────────────
const FEED_URL  = 'https://erasmus-plus.ec.europa.eu/news/rss';
const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`;

// ─── FUNCIÓN PRINCIPAL ───────────────────────────────────────
async function cargarFeed() {
  const contenedor = document.getElementById('feed');

  try {
    // 1. Pedimos el XML a través del proxy (evita el bloqueo CORS)
    const respuesta = await fetch(PROXY_URL);
    const data      = await respuesta.json();     // allorigins devuelve JSON
    const textoXML  = data.contents;              // el XML está dentro de .contents

    // 2. Convertimos el texto XML a documento navegable
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textoXML, 'application/xml');

    // 3. Comprobamos si hay error de parseo
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      contenedor.innerHTML = '<p class="cargando">Error al leer el feed RSS.</p>';
      return;
    }

    // 4. Extraemos los <item>
    const items = Array.from(xmlDoc.getElementsByTagName('item'));

    if (items.length === 0) {
      contenedor.innerHTML = '<p class="cargando">Sin noticias por ahora.</p>';
      return;
    }

    // 5. Pintamos las tarjetas
    contenedor.innerHTML = '';

    items.forEach(item => {
      const titulo      = item.getElementsByTagName('title')[0]?.textContent || 'Sin título';
      const descripcion = item.getElementsByTagName('description')[0]?.textContent || '';
      const fecha       = item.getElementsByTagName('pubDate')[0]?.textContent || '';
      const enlace      = item.getElementsByTagName('link')[0]?.textContent || '#';

      // La categoría viene como slug en el feed de Europa (ej: "higher-education")
      const categoriaRaw = item.getElementsByTagName('category')[0]?.textContent || 'erasmus';
      const categoria    = categoriaRaw.toLowerCase().replace(/\s+/g, '-');

      // Etiqueta legible para mostrar en la tarjeta
      const etiquetas = {
        'higher-education':      '🎓 Universidad',
        'vocational-education':  '🔧 FP',
        'youth':                 '🌍 Juventud',
        'sport':                 '⚽ Deporte',
      };
      const etiqueta = etiquetas[categoria] || '📡 Erasmus+';

      const tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta';
      tarjeta.dataset.categoria = categoria;

      tarjeta.innerHTML = `
        <p class="pais">${etiqueta}</p>
        <h2>${titulo}</h2>
        <p>${descripcion.substring(0, 200)}...</p>
        <p class="fecha">${new Date(fecha).toLocaleDateString('es-ES', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}</p>
        <a class="autor" href="${enlace}" target="_blank" rel="noopener">
          Leer noticia completa →
        </a>
      `;

      contenedor.appendChild(tarjeta);
    });

    // 6. Activamos los filtros
    activarFiltros();

  } catch (error) {
    console.error('Error al cargar el feed:', error);
    contenedor.innerHTML = '<p class="cargando">Error al cargar las noticias. Inténtalo de nuevo.</p>';
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
        if (categoria === 'todos' || tarjeta.dataset.categoria === categoria) {
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
