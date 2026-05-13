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
      
      // Añadimos clase para animación de entrada y el retraso
      tarjeta.className = 'tarjeta animar-entrada';
      tarjeta.dataset.categoria = categoria;
      tarjeta.style.animationDelay = `${index * 0.1}s`;

      // Estructuramos el HTML interno de la tarjeta
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

    // 👇 AQUÍ ACTIVAMOS TODO UNA VEZ CREADAS LAS TARJETAS 👇
    activarFiltros();
    activarEfectos3D(); // <-- La llamada mágica al 3D

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
      botones.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');

      const categoria = boton.dataset.cat;
      const tarjetas  = contenedor.querySelectorAll('.tarjeta');

      tarjetas.forEach(tarjeta => {
        if (categoria === 'todos' || tarjeta.dataset.categoria === categoria) {
          tarjeta.style.display = 'block'; 
          setTimeout(() => tarjeta.style.opacity = '1', 10); 
        } else {
          tarjeta.style.opacity = '0';
          setTimeout(() => {
              if (tarjeta.style.opacity === '0') {
                  tarjeta.style.display = 'none';
              }
          }, 300); 
        }
      });
    });
  });
}

// ─── LOKERA MÁXIMA: EFECTO 3D Y SPOTLIGHT ─────────────────────
function activarEfectos3D() {
  const tarjetas = document.querySelectorAll('.tarjeta');

  tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('mousemove', (e) => {
      const rect = tarjeta.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;  

      // 1. Efecto Spotlight: Actualizamos las variables CSS
      tarjeta.style.setProperty('--mouse-x', `${x}px`);
      tarjeta.style.setProperty('--mouse-y', `${y}px`);

      // 2. Efecto 3D: Calculamos la rotación
      const centroX = rect.width / 2;
      const centroY = rect.height / 2;
      
      const intensidad = 20; 
      
      const rotacionX = ((y - centroY) / centroY) * -intensidad;
      const rotacionY = ((x - centroX) / centroX) * intensidad;

      // Aplicamos la rotación
      tarjeta.style.transform = `perspective(1000px) rotateX(${rotacionX}deg) rotateY(${rotacionY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    // Resetear la tarjeta cuando el ratón sale
    tarjeta.addEventListener('mouseleave', () => {
      tarjeta.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// ─── ARRANQUE ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', cargarFeed);
