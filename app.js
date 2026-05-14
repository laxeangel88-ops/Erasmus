// ─── CONSTANTES Y RUTAS ───────────────────────────────────────
const FEED_ORIGINAL = 'https://iesaljada.murciaeduca.es/feed/';
const PROXY_URL = `https://corsproxy.io/?url=${encodeURIComponent(FEED_ORIGINAL)}`;

// ─── 1. CARGA DE NOTICIAS (EL NÚCLEO) ─────────────────────────
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

      // Limpieza del texto para que no rompa el diseño
      const tmp = document.createElement('div');
      tmp.innerHTML = descripcion;
      const textoLimpio = (tmp.textContent || '').substring(0, 180);

      const tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta animar-entrada';
      tarjeta.dataset.categoria = categoriaRaw.toLowerCase();
      tarjeta.style.animationDelay = `${index * 0.1}s`;

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

    // Activamos las funciones visuales cuando ya existen las tarjetas
    activarFiltros();
    activarEfectos3D();

  } catch (error) {
    console.error('Error:', error);
    contenedor.innerHTML = '<p class="cargando">Error al cargar las noticias.</p>';
  }
}

// ─── 2. SISTEMA DE FILTROS SUAVES ─────────────────────────────
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

// ─── 3. EFECTOS 3D Y SPOTLIGHT ────────────────────────────────
function activarEfectos3D() {
  const tarjetas = document.querySelectorAll('.tarjeta');

  tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('mousemove', (e) => {
      const rect = tarjeta.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      tarjeta.style.setProperty('--mouse-x', `${x}px`);
      tarjeta.style.setProperty('--mouse-y', `${y}px`);

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

// ─── 4. LA BROMA (MODO CAOS) ──────────────────────────────────
function iniciarBromaPopups() {
  const mensajesError = [
    "⚠️ El CSS de Francisco se ha derretido y está goteando por detrás de tu monitor.",
    "🔥 El archivo XML de Ángel tiene hambre. Por favor, introduce un bocadillo por la ranura del USB.",
    "💀 Tu app.js acaba de fundar una secta en Puente Tocinos. Tienen antorchas y exigen donativos.",
    "🚨 Un pastel de carne ha interceptado el paquete OSPF. Red inalcanzable.",
    "👾 El router de Cisco se ha enamorado del switch. Tráfico detenido por tensión romántica.",
    "⚠️ Windows Server 2012 ha exigido que le cantes una nana para poder arrancar.",
    "💾 Shopify ha puesto a la venta tus recuerdos de la infancia. El CTR es sorprendentemente alto.",
    "🧹 Los alumnos del Erasmus han sido sustituidos por palomas cibernéticas. Becas canceladas.",
    "💸 Error 404: El color azul ha dejado de existir en esta dimensión.",
    "👁️ Un cursor de PL/SQL se ha escapado y está escondido debajo de tu teclado. No hagas movimientos bruscos.",
    "🤖 Tu profesor de ASIR ha sido reemplazado por un holograma. Finge que entiendes la clase.",
    "🛑 El avión a Polonia está siendo pilotado por una etiqueta de HTML que Francisco dejó sin cerrar.",
    "⏳ Cicada 3301 ha resuelto el enigma: la respuesta es un limón murciano bailando bachata.",
    "📉 Las VLANs se han enredado. Ahora estás en la misma red local que una lavadora en Japón.",
    "✈️ La tarjeta de red huele a tostadas quemadas. El servidor de la consejería está desayunando.",
    "🔌 Cuidado. El ratón de tu ordenador está respirando de forma muy agitada.",
    "👨‍💻 El kernel de Linux ha empezado a hablar en arameo antiguo. Cierra los ojos.",
    "🎨 Los márgenes del CSS han conspirado para expulsarte físicamente de la habitación.",
    "🚀 Un pingüino ha interceptado la conexión de la página del instituto. Dale un pescado para continuar.",
    "👑 Pulsa Aceptar si confirmas que eres un holograma proyectado por el IES Aljada."
  ];

  setInterval(() => {
    const popup = document.createElement('div');
    popup.className = 'popup-molesto';

    const randomX = Math.floor(Math.random() * (window.innerWidth - 300));
    const randomY = Math.floor(Math.random() * (window.innerHeight - 150));
    
    popup.style.left = `${randomX}px`;
    popup.style.top = `${randomY}px`;

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

    const btnCerrar = popup.querySelector('.cerrar-popup');
    const btnOk = popup.querySelector('.btn-ok');

    btnCerrar.addEventListener('click', () => popup.remove());
    btnOk.addEventListener('click', () => popup.remove());

  }, 1000); // 3500ms = 3.5 segundos. 
}

// ─── ARRANQUE GLOBAL ──────────────────────────────────────────
// Esto asegura que TODO cargue en el orden correcto
document.addEventListener('DOMContentLoaded', () => {
  cargarFeed();
  iniciarBromaPopups(); // <-- ¡AQUÍ EMPIEZA LA FIESTA!
});
