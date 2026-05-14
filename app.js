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

    items.forEach(item => {
      const titulo      = item.getElementsByTagName('title')[0]?.textContent || 'Sin título';
      const descripcion = item.getElementsByTagName('description')[0]?.textContent || '';
      const fecha       = item.getElementsByTagName('pubDate')[0]?.textContent || '';
      const enlace      = item.getElementsByTagName('link')[0]?.textContent || '#';
      const categoriaRaw= item.getElementsByTagName('category')[0]?.textContent || 'General';

      const tmp = document.createElement('div');
      tmp.innerHTML = descripcion;
      const textoLimpio = (tmp.textContent || '').substring(0, 200);

      const tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta';
      tarjeta.dataset.categoria = categoriaRaw.toLowerCase();
      tarjeta.style.display = 'block'; // ← forzamos que sean visibles al crear

      const pPais = document.createElement('p');
      pPais.className = 'pais';
      pPais.textContent = categoriaRaw;

      const h2 = document.createElement('h2');
      h2.textContent = titulo;

      const pDesc = document.createElement('p');
      pDesc.textContent = textoLimpio + '...';

      const pFecha = document.createElement('p');
      pFecha.className = 'fecha';
      pFecha.textContent = new Date(fecha).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      const a = document.createElement('a');
      a.className = 'autor';
      a.href = enlace;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Leer noticia completa →';

      tarjeta.appendChild(pPais);
      tarjeta.appendChild(h2);
      tarjeta.appendChild(pDesc);
      tarjeta.appendChild(pFecha);
      tarjeta.appendChild(a);

      contenedor.appendChild(tarjeta);
    });

    activarFiltros();

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

      tarjetas.forEach(tarjeta => {
        tarjeta.style.display =
          (categoria === 'todos' || tarjeta.dataset.categoria.includes(categoria))
          ? 'block'
          : 'none';
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', cargarFeed);

