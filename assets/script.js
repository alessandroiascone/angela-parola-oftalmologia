const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#nav-menu');
const toast = document.querySelector('#toast');
const form = document.querySelector('#contactForm');
const year = document.querySelector('#year');

const CONTACT_EMAIL = 'angela.parola@libero.it';
const WHATSAPP_NUMBER = '393467762594';

if (year) year.textContent = new Date().getFullYear();

navToggle?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', (event) => {
  if (!navMenu || !navToggle) return;
  const clickedInside = navMenu.contains(event.target) || navToggle.contains(event.target);
  if (!clickedInside) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach(el => revealObserver.observe(el));
} else {
  revealElements.forEach(el => el.classList.add('is-visible'));
}

function showToast(message){
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 5200);
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = (data.get('name') || '').toString().trim();
  const phone = (data.get('phone') || '').toString().trim();
  const message = (data.get('message') || '').toString().trim();
  const text = `Richiesta consulenza oftalmologica\n\nNome: ${name}\nTelefono: ${phone}\nMessaggio: ${message}`;

  if (WHATSAPP_NUMBER) {
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    return;
  }
  if (CONTACT_EMAIL) {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=Richiesta consulenza oftalmologica&body=${encodeURIComponent(text)}`;
    return;
  }
  showToast('Modulo pronto. Puoi inviarlo tramite WhatsApp o via email ufficiale.');
});

// Filtri pagina “I nostri lavori”
const filterButtons = document.querySelectorAll('.filter-btn');
const caseCards = document.querySelectorAll('.case-card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter || 'all';
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    caseCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.display = match ? '' : 'none';
    });
  });
});

// Chiude le FAQ aperte quando l'utente ne apre un'altra: più pulito su mobile.
const faqDetails = document.querySelectorAll('.faq-list details');
faqDetails.forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqDetails.forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});

// Scroll snap controllato: rotella mouse, swipe mobile, tastiera e puntini laterali.
(function initSnapScroll(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pages = Array.from(document.querySelectorAll('main > section, .site-footer'));
  if (pages.length < 2) return;

  document.documentElement.classList.add('snap-enabled');
  document.body.classList.add('snap-enabled');
  pages.forEach((page, index) => {
    page.classList.add('snap-page');
    page.dataset.snapIndex = String(index);
  });

  const header = document.querySelector('.site-header');
  const getHeaderHeight = () => Math.round(header?.getBoundingClientRect().height || 0);
  let activeIndex = 0;
  let locked = false;
  let touchStartY = 0;
  let touchStartX = 0;

  const dots = document.createElement('nav');
  dots.className = 'scroll-dots';
  dots.setAttribute('aria-label', 'Navigazione sezioni');
  const dotButtons = pages.map((page, index) => {
    const button = document.createElement('button');
    const label = page.id ? page.id.replace(/-/g, ' ') : `sezione ${index + 1}`;
    button.type = 'button';
    button.setAttribute('aria-label', `Vai a ${label}`);
    button.addEventListener('click', () => goToPage(index));
    dots.appendChild(button);
    return button;
  });
  document.body.appendChild(dots);

  function getCurrentIndex(){
    const targetTop = getHeaderHeight();
    let bestIndex = 0;
    let bestDistance = Infinity;
    pages.forEach((page, index) => {
      const rect = page.getBoundingClientRect();
      const distance = Math.abs(rect.top - targetTop);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  }

  function setActive(index){
    activeIndex = Math.max(0, Math.min(index, pages.length - 1));
    dotButtons.forEach((button, i) => button.classList.toggle('is-active', i === activeIndex));
  }

  function goToPage(index){
    const nextIndex = Math.max(0, Math.min(index, pages.length - 1));
    const page = pages[nextIndex];
    if (!page) return;
    const top = Math.max(0, window.scrollY + page.getBoundingClientRect().top - getHeaderHeight());
    locked = true;
    setActive(nextIndex);
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    window.setTimeout(() => { locked = false; }, reduceMotion ? 120 : 780);
  }

  function sectionCanContinue(direction){
    // Desktop: ogni colpo di rotella deve essere una pagina secca.
    // Mobile/tablet: se una sezione è più lunga del viewport, lascia respirare il contenuto.
    if (window.innerWidth > 980) return false;
    const current = pages[getCurrentIndex()];
    if (!current) return false;
    const rect = current.getBoundingClientRect();
    const headerH = getHeaderHeight();
    const viewportBottom = window.innerHeight;
    const hasMoreBelow = rect.bottom > viewportBottom + 34;
    const hasMoreAbove = rect.top < headerH - 34;
    const tallerThanViewport = rect.height > (window.innerHeight - headerH + 80);
    if (!tallerThanViewport) return false;
    return direction > 0 ? hasMoreBelow : hasMoreAbove;
  }

  window.addEventListener('scroll', () => {
    if (!locked) setActive(getCurrentIndex());
  }, { passive:true });

  window.addEventListener('wheel', (event) => {
    const delta = event.deltaY;
    if (Math.abs(delta) < 18) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input, textarea, select, [data-no-snap]')) return;
    const direction = delta > 0 ? 1 : -1;
    if (sectionCanContinue(direction)) return;
    event.preventDefault();
    if (locked) return;
    goToPage(getCurrentIndex() + direction);
  }, { passive:false });

  window.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
  }, { passive:true });

  window.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const diffY = touchStartY - touch.clientY;
    const diffX = touchStartX - touch.clientX;
    if (Math.abs(diffY) < 54 || Math.abs(diffY) < Math.abs(diffX) * 1.35) return;
    if (event.target.closest('input, textarea, select, [data-no-snap]')) return;
    const direction = diffY > 0 ? 1 : -1;
    if (sectionCanContinue(direction)) return;
    if (locked) return;
    goToPage(getCurrentIndex() + direction);
  }, { passive:true });

  window.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (['input','textarea','select'].includes(tag)) return;
    const downKeys = ['ArrowDown','PageDown','Space'];
    const upKeys = ['ArrowUp','PageUp'];
    if (![...downKeys, ...upKeys].includes(event.code)) return;
    event.preventDefault();
    if (locked) return;
    const direction = downKeys.includes(event.code) ? 1 : -1;
    goToPage(getCurrentIndex() + direction);
  });

  setActive(getCurrentIndex());
})();
