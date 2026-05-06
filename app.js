// ─── CONSTANTES ─────────────────────────────────────────────
const RSS_URL = './erasmus.xml';

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────
async function cargarFeed() {
  const contenedor = document.getElementById('feed');

  try {
    const respuesta = await fetch(RSS_URL);
    const textoXML  = await respuesta.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textoXML, 'application/xml');

    // Convertimos a Array para poder usar forEach
    const items = Array.from(xmlDoc.getElementsByTagName('item'));

    if (items.length === 0) {
      contenedor.innerHTML = '<p class="cargando">Sin noticias por ahora.</p>';
      return;
    }

    contenedor.innerHTML = '';

    items.forEach(item => {
      // Usamos getElementsByTagName también aquí dentro
      const titulo      = item.getElementsByTagName('title')[0]?.textContent || 'Sin título';
      const descripcion = item.getElementsByTagName('description')[0]?.textContent || '';
      const fecha       = item.getElementsByTagName('pubDate')[0]?.textContent || '';
      const autor       = item.getElementsByTagName('author')[0]?.textContent || '';
      const categoria   = item.getElementsByTagName('category')[0]?.textContent || 'Erasmus+';

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

// ─── ARRANQUE ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', cargarFeed);
