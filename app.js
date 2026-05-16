// ─── FEEDS ───────────────────────────────────────────────────
const FEEDS = [
  {
    url: 'https://iesaljada.murciaeduca.es/feed/',
    fuente: 'aljada',
    etiqueta: 'IES Aljada'
  },
  {
    url: 'https://iesjoseplanes.es/feed/',
    fuente: 'joseplanes',
    etiqueta: 'IES Jose Planes'
  }
];

// ─── PROXIES (se intentan en orden hasta que uno funcione) ───
const PROXIES = [
  url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  url => `https://cors-anywhere.herokuapp.com/${url}`,
  url => `https://thingproxy.freeboard.io/fetch/${url}`,
];

// Devuelve el texto del feed usando el primer proxy que responda con XML válido
async function fetchConProxy(feedUrl) {
  for (const proxyFn of PROXIES) {
    try {
      const proxyUrl = proxyFn(feedUrl);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;

      // allorigins devuelve JSON con { contents: "..." }
      const contentType = res.headers.get('content-type') || '';
      let texto;
      if (contentType.includes('application/json')) {
        const json = await res.json();
        texto = json.contents ?? json.data ?? '';
      } else {
        texto = await res.text();
      }

      // Verificación mínima: debe parecer XML/RSS
      if (texto && texto.trim().startsWith('<') && texto.includes('<item')) {
        return texto;
      }
    } catch (_) {
      // Este proxy falló; probar el siguiente
    }
  }
  throw new Error(`No se pudo obtener el feed: ${feedUrl}`);
}

// ─── FUNCIÓN PRINCIPAL ───────────────────────────────────────
async function cargarFeed() {
  const contenedor = document.getElementById('feed');
  contenedor.innerHTML = '<p class="cargando">Cargando noticias...</p>';

  try {
    const resultados = await Promise.allSettled(
      FEEDS.map(f => fetchConProxy(f.url))
    );

    contenedor.innerHTML = '';
    let totalItems = 0;

    resultados.forEach((resultado, i) => {
      if (resultado.status !== 'fulfilled') {
        console.warn(`Feed ${FEEDS[i].etiqueta} no disponible:`, resultado.reason);
        return;
      }

      const { fuente, etiqueta } = FEEDS[i];
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(resultado.value, 'application/xml');

      if (xmlDoc.querySelector('parsererror')) {
        console.warn(`XML inválido en ${etiqueta}`);
        return;
      }

      const items = Array.from(xmlDoc.getElementsByTagName('item'));

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
        tarjeta.dataset.fuente    = fuente;
        tarjeta.dataset.categoria = categoriaRaw.toLowerCase();
        tarjeta.style.display     = 'block';

        const pFuente = document.createElement('p');
        pFuente.className = 'fuente-tag fuente-' + fuente;
        pFuente.textContent = etiqueta;

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
        a.textContent = 'Leer noticia completa';

        tarjeta.appendChild(pFuente);
        tarjeta.appendChild(pPais);
        tarjeta.appendChild(h2);
        tarjeta.appendChild(pDesc);
        tarjeta.appendChild(pFecha);
        tarjeta.appendChild(a);

        contenedor.appendChild(tarjeta);
        totalItems++;
      });
    });

    if (totalItems === 0) {
      contenedor.innerHTML = '<p class="cargando">Sin noticias por ahora.</p>';
      return;
    }

    activarFiltros();
    activarDropdowns();

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
    boton.addEventListener('click', (e) => {
      e.stopPropagation();
      botones.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');

      const fuente    = boton.dataset.fuente || 'todos';
      const categoria = boton.dataset.cat    || 'todos';
      const tarjetas  = contenedor.querySelectorAll('.tarjeta');

      tarjetas.forEach(tarjeta => {
        const coincideFuente    = fuente === 'todos'    || tarjeta.dataset.fuente === fuente;
        const coincideCategoria = categoria === 'todos' || tarjeta.dataset.categoria.includes(categoria);
        tarjeta.style.display   = (coincideFuente && coincideCategoria) ? 'block' : 'none';
      });
    });
  });
}

// ─── DESPLEGABLES ────────────────────────────────────────────
function activarDropdowns() {
  document.querySelectorAll('.dropdown-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = btn.parentElement;
      document.querySelectorAll('.dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('abierto');
      });
      dropdown.classList.toggle('abierto');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filtros')) {
      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('abierto'));
    }
  });
}

// ─── ARRANQUE ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', cargarFeed);
