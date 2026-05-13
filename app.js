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

    const items = Array.from(xmlDoc.getElementsByTagName('item'));

    if (items.length === 0) {
      contenedor.innerHTML = '<p class="cargando">🌍 Sin noticias de movilidad por ahora.</p>';
      return;
    }

    contenedor.innerHTML = '';

    items.forEach((item, index) => {
      const titulo      = item.getElementsByTagName('title')[0]?.textContent || 'Sin título';
      const descripcion = item.getElementsByTagName('description')[0]?.textContent || '';
      const fecha       = item.getElementsByTagName('pubDate')[0]?.textContent || '';
      const autor       = item.getElementsByTagName('author')[0]?.textContent || 'Equipo Erasmus+';
      const categoria   = item.getElementsByTagName('category')[0]?.textContent || 'Erasmus+';

      const tarjeta = document.createElement('article');
      
      // 🪄 TOQUE VISUAL: Añadimos clase para animación y retraso escalonado
      tarjeta.className = 'tarjeta animar-entrada';
      tarjeta.dataset.categoria = categoria;
      tarjeta.style.animationDelay = `${index * 0.1}s`;

      // Estructuramos el HTML interno de la tarjeta limpio
      tarjeta.innerHTML = `
        <div class="tarjeta-header">
            <span class="pais">${categoria}</span>
            <span class="fecha">📅 ${new Date(fecha).toLocaleDateString('es-ES', {
              day: '2-digit', month: 'short', year: 'numeric'
            })}</span>
        </div>
        <h2>${titulo}</h2>
        <p class="descripcion">${descripcion}</p>
        <p class="autor">👤 ${autor}</p>
      `;

      contenedor.appendChild(tarjeta);
    });

    // Activamos los filtros después de crear las tarjetas
    activarFiltros();

  } catch (error) {
    console.error('Error al cargar el feed:', error);
    contenedor.innerHTML = '<p class="cargando error-msg">❌ No se pudieron cargar las noticias en este momento. Inténtalo más tarde.</p>';
  }
}

// ─── FILTROS POR PAÍS SUAVES ──────────────────────────────────
function activarFiltros() {
  const botones    = document.querySelectorAll('.filtro-btn');
  const contenedor = document.getElementById('feed');

  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      // Control de botones activos
      botones.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');

      const categoria = boton.dataset.cat;
      const tarjetas  = contenedor.querySelectorAll('.tarjeta');

      tarjetas.forEach(tarjeta => {
        // 🪄 TOQUE VISUAL: Transición suave al filtrar
        if (categoria === 'todos' || tarjeta.dataset.categoria === categoria) {
          tarjeta.style.display = 'block'; // O 'flex', dependiendo del CSS base
          // Timeout mínimo para que el navegador aplique la transición de opacidad
          setTimeout(() => tarjeta.style.opacity = '1', 10); 
        } else {
          tarjeta.style.opacity = '0';
          // Esperamos a que la transición visual termine antes de ocultar la caja
          setTimeout(() => {
              if (tarjeta.style.opacity === '0') {
                  tarjeta.style.display = 'none';
              }
          }, 300); // Sincronizado con los 0.3s del CSS
        }
      });
    });
  });
}

// ─── ARRANQUE ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', cargarFeed);
