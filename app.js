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
      
      // 🪄 MAGIA 1: Añadimos clase para animación y retraso escalonado
      tarjeta.className = 'tarjeta animar-entrada';
      tarjeta.dataset.categoria = categoria;
      tarjeta.style.animationDelay = `${index * 0.1}s`;

      // 🪄 MAGIA 2: Lógica para truncar textos largos
      let htmlDescripcion = `<p class="descripcion">${descripcion}</p>`;
      
      if (descripcion.length > 120) {
        const descCorta = descripcion.substring(0, 120).trim() + '...';
        htmlDescripcion = `
          <div class="descripcion-contenedor">
            <p class="texto-visible">${descCorta}</p>
            <p class="texto-completo oculto">${descripcion}</p>
            <button class="leer-mas-btn">Leer más</button>
          </div>
        `;
      }

      // Estructuramos el HTML interno de la tarjeta
      tarjeta.innerHTML = `
        <div class="tarjeta-header">
            <span class="pais">${categoria}</span>
            <span class="fecha">📅 ${new Date(fecha).toLocaleDateString('es-ES', {
              day: '2-digit', month: 'short', year: 'numeric'
            })}</span>
        </div>
        <h2>${titulo}</h2>
        ${htmlDescripcion}
        <p class="autor">👤 ${autor}</p>
      `;

      contenedor.appendChild(tarjeta);
    });

    // Activamos los eventos después de crear las tarjetas
    activarBotonesLeerMas();
    activarFiltros();

  } catch (error) {
    console.error('Error al cargar el feed:', error);
    contenedor.innerHTML = '<p class="cargando error-msg">❌ No se pudieron cargar las noticias en este momento. Inténtalo más tarde.</p>';
  }
}

// ─── FUNCIONES INTERACTIVAS (UX) ──────────────────────────────

// Lógica para expandir/contraer las descripciones largas
function activarBotonesLeerMas() {
    const botones = document.querySelectorAll('.leer-mas-btn');
    
    botones.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const contenedor = e.target.closest('.descripcion-contenedor');
            const textoVisible = contenedor.querySelector('.texto-visible');
            const textoCompleto = contenedor.querySelector('.texto-completo');

            // Alternamos las clases para mostrar u ocultar
            if (textoCompleto.classList.contains('oculto')) {
                textoVisible.classList.add('oculto');
                textoCompleto.classList.remove('oculto');
                boton.textContent = 'Leer menos';
            } else {
                textoVisible.classList.remove('oculto');
                textoCompleto.classList.add('oculto');
                boton.textContent = 'Leer más';
            }
        });
    });
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
        // 🪄 MAGIA 3: Animación suave al filtrar
        if (categoria === 'todos' || tarjeta.dataset.categoria === categoria) {
          tarjeta.style.display = 'block'; // O 'flex', dependiendo de vuestro CSS
          // Pequeño timeout para que el navegador registre el display antes del cambio de opacidad
          setTimeout(() => tarjeta.style.opacity = '1', 10); 
        } else {
          tarjeta.style.opacity = '0';
          // Esperamos a que la transición de opacidad termine antes de quitarlo del flujo
          setTimeout(() => {
              if (tarjeta.style.opacity === '0') {
                  tarjeta.style.display = 'none';
              }
          }, 300); // Estos 300ms deben coincidir con la transición en CSS
        }
      });
    });
  });
}

// ─── ARRANQUE ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', cargarFeed);
