// ─── CONSTANTES ─────────────────────────────────────────────
// URL del feed XML en GitHub (raw = texto plano, no HTML)
const RSS_URL = 'https://raw.githubusercontent.com/laxeangel88-ops/Erasmus/main/erasmus.xml';

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────
async function cargarFeed() {
  const contenedor = document.getElementById('feed');

  try {
    // 1. Descargamos el XML como texto
    const respuesta = await fetch(RSS_URL);
    const textoXML  = await respuesta.text();

    // 2. Convertimos el texto a un documento XML navegable
    const parser   = new DOMParser();
    const xmlDoc   = parser.parseFromString(textoXML, 'application/xml');

    // 3. Extraemos todos los <item> del feed
    const items = xmlDoc.querySelectorAll('item');

    if (items.length === 0) {
      contenedor.innerHTML = '<p class="cargando">Sin noticias por ahora.</p>';
      return;
    }

    // 4. Limpiamos el mensaje de carga
    contenedor.innerHTML = '';

    // 5. Por cada noticia, creamos una tarjeta HTML
    items.forEach(item => {
      const titulo      = item.querySelector('title')?.textContent || 'Sin título';
      const descripcion = item.querySelector('description')?.textContent || '';
      const fecha       = item.querySelector('pubDate')?.textContent || '';
      const autor       = item.querySelector('author')?.textContent || '';
      const enlace      = item.querySelector('link')?.textContent || '#';
      const categoria   = item.querySelector('category')?.textContent || 'Erasmus+';

      // Guardamos la categoría en el dataset para los filtros
      const tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta';
      tarjeta.dataset.categoria = categoria;

      tarjeta.innerHTML = `
        <p class="pais">${categoria}</p>
        <h2>${titulo}</h2>
        <p>${descripcion}</p>
        <p class="fecha">${new Date(fecha).toLocaleDateString('es-ES', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}</p>
        <p class="autor">${autor}</p>
      `;

      contenedor.appendChild(tarjeta);
    });

    // 6. Activamos los botones de filtro
    activarFiltros();

  } catch (error) {
    console.error('Error al cargar el feed:', error);
    contenedor.innerHTML = '<p class="cargando">Error al cargar las noticias.</p>';
  }
}

// ─── FILTROS POR PAÍS ─────────────────────────────────────────
function activarFiltros() {
  const botones    = document.querySelectorAll('.filtro-btn');
  const contenedor = document.getElementById('feed');

  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      // Quitar clase activo de todos
      botones.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');

      const categoria = boton.dataset.cat;
      const tarjetas  = contenedor.querySelectorAll('.tarjeta');

      tarjetas.forEach(tarjeta => {
        if (categoria === 'todos' ||
            tarjeta.dataset.categoria === categoria) {
          tarjeta.style.display = '';
        } else {
          tarjeta.style.display = 'none';
        }
      });
    });
  });
}

// ─── ARRANQUE ─────────────────────────────────────────────────
// Esperamos a que el DOM esté listo y cargamos el feed
document.addEventListener('DOMContentLoaded', cargarFeed);
