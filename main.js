/* KING Motero · Los Patios — enlaces, horario y película que avanza con el scroll */
'use strict';

/* ===== DATOS DEL NEGOCIO (edita aquí) ===== */
const NEGOCIO = {
  nombre: 'KING Motero',
  whatsapp: '573125210852',            // WhatsApp de la tienda (Facebook /about y wa.link de Instagram)
  mensajes: {
    general: 'Hola KING Motero, vi su página web y quiero cotizar un producto para mi moto.',
    mayorista: 'Hola KING Motero, vi su página web. Tengo un negocio y quiero el catálogo con precios de mayorista.',
  },
  mapa: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Av. 10 # 22-21, Videlso, Los Patios, Norte de Santander'),
  instagram: 'https://www.instagram.com/king_motero_oficial/',
  facebook: 'https://www.facebook.com/aktlospatios',
  // Horario por día (0 = domingo). null = cerrado. CONFIRMAR con la tienda.
  horario: {
    1: ['8:00 a. m.', '6:00 p. m.'], 2: ['8:00 a. m.', '6:00 p. m.'], 3: ['8:00 a. m.', '6:00 p. m.'],
    4: ['8:00 a. m.', '6:00 p. m.'], 5: ['8:00 a. m.', '6:00 p. m.'], 6: ['8:00 a. m.', '6:00 p. m.'], 0: null,
  },
  pelicula: { escritorio: 'img/film/king-desktop.mp4', movil: 'img/film/king-mobile.mp4' },
};

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.remove('no-js');
if (reduced) document.documentElement.classList.add('motion-off');

/* ---- enlaces de WhatsApp, mapa y redes ---- */
const waUrl = (tipo) => `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(NEGOCIO.mensajes[tipo] || NEGOCIO.mensajes.general)}`;
document.querySelectorAll('[data-wa]').forEach(a => { a.href = waUrl(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });
document.querySelectorAll('[data-map]').forEach(a => { a.href = NEGOCIO.mapa; a.target = '_blank'; a.rel = 'noopener'; });
document.querySelectorAll('[data-ig]').forEach(a => { a.href = NEGOCIO.instagram; a.target = '_blank'; a.rel = 'noopener'; });
document.querySelectorAll('[data-fb]').forEach(a => { a.href = NEGOCIO.facebook; a.target = '_blank'; a.rel = 'noopener'; });

/* ---- navegación ---- */
const nav = document.getElementById('nav');
const onScrollNav = () => nav.classList.toggle('solid', window.scrollY > 40);
onScrollNav(); window.addEventListener('scroll', onScrollNav, { passive: true });
const burger = document.getElementById('burger'), menu = document.getElementById('menu');
burger.addEventListener('click', () => { const open = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; });
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); document.body.style.overflow = ''; }));

/* ---- horario: marcar hoy y estado abierto/cerrado ---- */
(function horario() {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const box = document.getElementById('hours'); if (!box) return;
  const hoy = new Date().getDay();
  box.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => { const h = NEGOCIO.horario[d]; return `<div class="${d === hoy ? 'today' : ''}"><span>${dias[d]}${d === hoy ? ' (hoy)' : ''}</span><span>${h ? h[0] + ' a ' + h[1] : 'Cerrado'}</span></div>`; }).join('');
  const st = document.getElementById('open-now'); if (!st) return;
  const h = NEGOCIO.horario[hoy];
  const to24 = (s) => { const m = s.match(/(\d+):(\d+)\s*(a|p)/); let hh = +m[1]; if (m[3] === 'p' && hh !== 12) hh += 12; if (m[3] === 'a' && hh === 12) hh = 0; return hh * 60 + (+m[2]); };
  const now = new Date(); const mins = now.getHours() * 60 + now.getMinutes();
  const abierto = h && mins >= to24(h[0]) && mins < to24(h[1]);
  st.classList.toggle('on', !!abierto);
  st.querySelector('span').textContent = abierto ? `Abierto ahora · cierra a las ${h[1]}` : h ? `Cerrado ahora · abre a las ${h[0]}` : 'Hoy cerrado · abre el lunes';
})();

/* ---- entradas de sección (solo transform, sin ocultar contenido) ---- */
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}

/* ---- película que avanza con el scroll ---- */
(function pelicula() {
  const film = document.querySelector('.film'), video = document.getElementById('film-video');
  const chapters = Array.from(document.querySelectorAll('.chapter'));
  const index = Array.from(document.querySelectorAll('.film-index button'));
  if (!film || !video) return;
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const src = mobile ? NEGOCIO.pelicula.movil : NEGOCIO.pelicula.escritorio;

  const progress = () => { const total = film.offsetHeight - window.innerHeight; if (total <= 0) return 0; const p = -film.getBoundingClientRect().top / total; return Math.min(1, Math.max(0, p)); };
  const setChapter = (p) => {
    const i = Math.min(chapters.length - 1, Math.floor(p * chapters.length));
    chapters.forEach((c, k) => c.classList.toggle('on', k === i));
    index.forEach((b, k) => b.classList.toggle('on', k === i));
  };
  index.forEach(b => b.addEventListener('click', () => {
    const k = +b.dataset.go; const total = film.offsetHeight - window.innerHeight;
    window.scrollTo({ top: film.offsetTop + total * ((k + .5) / chapters.length), behavior: reduced ? 'auto' : 'smooth' });
  }));
  if (reduced) { chapters.forEach(c => c.classList.add('on')); return; }

  let duration = 0, ready = false, seeking = false, pending = null;
  const seekTo = (t) => { if (Math.abs(video.currentTime - t) < .02) return; seeking = true; video.currentTime = t; };
  video.addEventListener('loadedmetadata', () => { duration = video.duration || 0; ready = duration > 0; update(); });
  video.addEventListener('seeked', () => { seeking = false; if (pending !== null) { const t = pending; pending = null; seekTo(t); } });
  const update = () => {
    const p = progress();
    setChapter(p);
    if (!ready) return;
    const t = p * Math.max(0, duration - .06);
    if (seeking) pending = t; else seekTo(t);
  };
  let ticking = false;
  window.addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); }, { passive: true });
  window.addEventListener('resize', update);
  update();

  // descarga completa en memoria para que el scroll busque cualquier fotograma al instante
  fetch(src).then(r => r.ok ? r.blob() : Promise.reject(r.status)).then(b => { video.src = URL.createObjectURL(b); video.load(); }).catch(() => { /* queda el póster */ });
  // iOS: el primer toque habilita la búsqueda de fotogramas
  const prime = () => { video.play().then(() => video.pause()).catch(() => {}); window.removeEventListener('touchstart', prime); };
  window.addEventListener('touchstart', prime, { passive: true });
})();
