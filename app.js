const FEED_ORIGINAL = 'https://iesaljada.murciaeduca.es/feed/';
const PROXY_URL = `https://corsproxy.io/?url=${encodeURIComponent(FEED_ORIGINAL)}`;

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

    items.forEach((item, index) => {
      const titulo      = item.getElementsByTagName('title')[0]?.textContent || 'Sin título';
      const descripcion = item.getElementsByTagName('description')[0]?.textContent || '';
      const fecha       = item.getElementsByTagName('pubDate')[0]?.textContent || '';
      const categoriaRaw= item.getElementsByTagName('category')[0]?.textContent || 'General';

      // Vuestro truco genial para limpiar etiquetas HTML
      const tmp = document.createElement('div');
      tmp.innerHTML = descripcion;
      const textoLimpio = (tmp.textContent || '').substring(0, 180);

      const tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta animar-entrada'; // Clase para la animación de entrada
      tarjeta.dataset.categoria = categoriaRaw.toLowerCase();
      tarjeta.style.animationDelay = `${index * 0.1}s`; // Retraso en cascada

      // Estructura HTML limpia. Hemos quitado el "Leer noticia completa" 
      // para priorizar un diseño visual limpio y sin distracciones.
      tarjeta.innerHTML = `
        <div class="contenido-tarjeta">
            <p class="pais">${categoriaRaw}</p>
            <h2>${titulo}</h2>
            <p>${textoLimpio}...</p>
            <p class="fecha">${new Date(fecha).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}</p>
        </div>
      `;

      contenedor.appendChild(tarjeta);
    });

    activarFiltros();
    activarEfectos3D(); // Desatamos la magia visual

  } catch (error) {
    console.error('Error:', error);
    contenedor.innerHTML = '<p class="cargando">Error al cargar las noticias.</p>';
  }
}

function activarFiltros() {
  const botones    = document.querySelectorAll('.filtro-btn');
  const contenedor = document.getElementById('feed');

  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      botones.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');

      const categoria = boton.dataset.cat;
      const tarjetas  = contenedor.querySelectorAll('.tarjeta');

      // Transiciones suaves para los filtros en lugar de cortes bruscos
      tarjetas.forEach(tarjeta => {
        if (categoria === 'todos' || tarjeta.dataset.categoria.includes(categoria)) {
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

function activarEfectos3D() {
  const tarjetas = document.querySelectorAll('.tarjeta');

  tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('mousemove', (e) => {
      const rect = tarjeta.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Actualizamos las variables para el foco de luz
      tarjeta.style.setProperty('--mouse-x', `${x}px`);
      tarjeta.style.setProperty('--mouse-y', `${y}px`);

      // Cálculo de la rotación 3D
      const centroX = rect.width / 2;
      const centroY = rect.height / 2;
      const intensidad = 20; 
      
      const rotacionX = ((y - centroY) / centroY) * -intensidad;
      const rotacionY = ((x - centroX) / centroX) * intensidad;

      tarjeta.style.transform = `perspective(1000px) rotateX(${rotacionX}deg) rotateY(${rotacionY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    tarjeta.addEventListener('mouseleave', () => {
      tarjeta.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

document.addEventListener('DOMContentLoaded', cargarFeed); 

// ─── MODO CAOS: BROMA POP-UPS ─────────────────────────────────
function iniciarBromaPopups() {
  // Mensajes aleatorios para volverles locos
  const mensajesError = [
    "⚠️ ERROR Crítico: El esquema XSD de Ángel no responde.",
    "🔥 ALERTA: El Frontend de Francisco está consumiendo demasiada RAM.",
    "💀 Se ha detectado una fuga de memoria en el servidor del IES Aljada.",
    "🚨 El Feed Erasmus+ está a punto de explotar. Cierra esta ventana rápido.",
    "👾 Virus 'LokeraMáxima.exe' descargado con éxito.",
    "⚠️ Error 404: Paciencia no encontrada."
  ];

  // Cada 3.5 segundos sale un pop-up nuevo
  setInterval(() => {
    const popup = document.createElement('div');
    popup.className = 'popup-molesto';

    // Calculamos una posición aleatoria en la pantalla
    const randomX = Math.floor(Math.random() * (window.innerWidth - 300));
    const randomY = Math.floor(Math.random() * (window.innerHeight - 150));
    
    popup.style.left = `${randomX}px`;
    popup.style.top = `${randomY}px`;

    // Elegimos un mensaje al azar
    const mensajeAleatorio = mensajesError[Math.floor(Math.random() * mensajesError.length)];

    popup.innerHTML = `
      <div class="popup-cabecera">
        <span>Mensaje del Sistema</span>
        <button class="cerrar-popup">X</button>
      </div>
      <div class="popup-cuerpo">
        <p>${mensajeAleatorio}</p>
        <button class="btn-ok">Aceptar</button>
      </div>
    `;

    document.body.appendChild(popup);

    // Lógica para que los botones cierren SU propio pop-up
    const btnCerrar = popup.querySelector('.cerrar-popup');
    const btnOk = popup.querySelector('.btn-ok');

    btnCerrar.addEventListener('click', () => popup.remove());
    btnOk.addEventListener('click', () => popup.remove());

  }, 3500); // 3500 milisegundos = 3.5 segundos. ¡Bájalo si quieres más caos!
}

// ⚠️ DESCOMENTA LA SIGUIENTE LÍNEA PARA ACTIVAR LA BROMA ⚠️
// iniciarBromaPopups();
