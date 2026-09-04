const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#nav-menu');
const toast = document.querySelector('#toast');
const contactForm = document.querySelector('#contactForm');
const appointmentForm = document.querySelector('#appointmentForm');
const year = document.querySelector('#year');

const CONTACT_EMAIL = 'angela.parola@libero.it';
const WHATSAPP_NUMBER = '393467762594';

if (year) year.textContent = new Date().getFullYear();

navToggle?.addEventListener('click', () => {
  const open = navMenu?.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(Boolean(open)));
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
  }, { threshold: 0.10 });
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

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = (data.get('name') || '').toString().trim();
  const phone = (data.get('phone') || '').toString().trim();
  const message = (data.get('message') || '').toString().trim();
  const text = `RICHIESTA APPUNTAMENTO – OFTALMOLOGIA VETERINARIA\n\nNome: ${name}\nTelefono: ${phone}\nMessaggio: ${message}`;
  window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
});

// Filtro strutture per provincia.
const provinceTabs = document.querySelectorAll('.province-tab');
const structureCards = document.querySelectorAll('.structure-card');
provinceTabs.forEach(button => {
  button.addEventListener('click', () => {
    const province = button.dataset.provinceFilter;
    provinceTabs.forEach(tab => {
      const active = tab === button;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    structureCards.forEach(card => {
      const match = card.dataset.province === province;
      card.hidden = !match;
    });
    document.querySelector('#structuresList')?.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
// Stato iniziale: Napoli.
if (provinceTabs.length) {
  structureCards.forEach(card => { card.hidden = card.dataset.province !== 'napoli'; });
}

// Modulo appuntamento e precompilazione da struttura selezionata.
const provinceSelect = document.querySelector('#provinceSelect');
const structureSelect = document.querySelector('#structureSelect');

function syncStructureOptions(){
  if (!provinceSelect || !structureSelect) return;
  const province = provinceSelect.value;
  Array.from(structureSelect.options).forEach(option => {
    if (!option.value) {
      option.hidden = false;
      return;
    }
    option.hidden = Boolean(province && option.dataset.province !== province);
  });
  const selected = structureSelect.selectedOptions[0];
  if (selected?.value && selected.dataset.province !== province) structureSelect.value = '';
}

provinceSelect?.addEventListener('change', syncStructureOptions);
structureSelect?.addEventListener('change', () => {
  const province = structureSelect.selectedOptions[0]?.dataset.province;
  if (province && provinceSelect) provinceSelect.value = province;
  syncStructureOptions();
});

if (appointmentForm) {
  const params = new URLSearchParams(window.location.search);
  const requestedStructure = params.get('struttura');
  const requestedProvince = params.get('provincia');
  if (requestedProvince && provinceSelect) provinceSelect.value = requestedProvince;
  syncStructureOptions();
  if (requestedStructure && structureSelect) {
    const match = Array.from(structureSelect.options).find(option => option.value === requestedStructure);
    if (match) {
      structureSelect.value = match.value;
      if (provinceSelect && match.dataset.province) provinceSelect.value = match.dataset.province;
      syncStructureOptions();
    }
  }

  appointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!appointmentForm.reportValidity()) return;
    const data = new FormData(appointmentForm);
    const value = key => (data.get(key) || '').toString().trim();
    const text = [
      '*RICHIESTA APPUNTAMENTO – OFTALMOLOGIA VETERINARIA*',
      '',
      `*Proprietario:* ${value('name')}`,
      `*Telefono:* ${value('phone')}`,
      `*Email:* ${value('email') || 'Non indicata'}`,
      '',
      `*Paziente:* ${value('petName')} (${value('petType')})`,
      `*Provincia:* ${value('province')}`,
      `*Struttura preferita:* ${value('structure')}`,
      '',
      '*Sintomi / richiesta:*',
      value('message'),
      '',
      'Confermo di aver letto la Privacy Policy e autorizzo il trattamento dei dati per gestire questa richiesta.'
    ].join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.location.href = url;
  });
}

// Filtri pagina “I nostri lavori”.
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

// Una FAQ aperta alla volta.
const faqDetails = document.querySelectorAll('.faq-list details');
faqDetails.forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqDetails.forEach(other => { if (other !== item) other.open = false; });
  });
});

// Navigazione full-page: una rotella / uno swipe = una sezione completa.
// Nelle pagine modulo resta volutamente disattivata.
(function initSnapScroll(){
  if (document.body.classList.contains('no-snap')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pages = Array.from(document.querySelectorAll('main > section, .site-footer'));
  if (pages.length < 2) return;

  const mobileMQ = window.matchMedia('(max-width: 980px)');
  const header = document.querySelector('.site-header');
  const getHeaderHeight = () => Math.round(header?.getBoundingClientRect().height || 0);

  document.documentElement.classList.add('snap-enabled');
  document.body.classList.add('snap-enabled');
  pages.forEach((page, index) => {
    page.classList.add('snap-page');
    page.dataset.snapIndex = String(index);
  });

  let activeIndex = 0;
  let locked = false;
  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartTarget = null;

  function setMobileMode(){
    const on = mobileMQ.matches;
    document.documentElement.classList.toggle('fullpage-mobile', on);
    document.body.classList.toggle('fullpage-mobile', on);
    if (on) {
      // Un vecchio trascinamento orizzontale non deve lasciare il viewport fuori asse.
      document.scrollingElement.scrollLeft = 0;
    }
  }
  setMobileMode();
  mobileMQ.addEventListener?.('change', setMobileMode);

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
    const headerH = getHeaderHeight();
    let bestIndex = 0;
    let bestDistance = Infinity;
    pages.forEach((page, index) => {
      const distance = Math.abs(page.getBoundingClientRect().top - headerH);
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

  function targetTopFor(page){
    return Math.max(0, Math.round(window.scrollY + page.getBoundingClientRect().top - getHeaderHeight()));
  }

  function goToPage(index){
    const nextIndex = Math.max(0, Math.min(index, pages.length - 1));
    const page = pages[nextIndex];
    if (!page || (locked && nextIndex !== activeIndex)) return;

    locked = true;
    setActive(nextIndex);
    document.scrollingElement.scrollLeft = 0;
    const top = targetTopFor(page);
    window.scrollTo({ left: 0, top, behavior: reduceMotion ? 'auto' : 'smooth' });

    // Correzione finale: evita di rimanere anche solo di pochi pixel tra due sezioni.
    window.setTimeout(() => {
      const exactTop = targetTopFor(page);
      window.scrollTo({ left: 0, top: exactTop, behavior: 'auto' });
      document.scrollingElement.scrollLeft = 0;
      locked = false;
    }, reduceMotion ? 80 : 560);
  }

  function innerCanScroll(element, direction){
    if (!element) return false;
    const maxScroll = element.scrollHeight - element.clientHeight;
    if (maxScroll <= 2) return false;
    return direction > 0 ? element.scrollTop < maxScroll - 2 : element.scrollTop > 2;
  }

  // In mobile la posizione attiva è governata dal full-page controller, non dallo scroll nativo.
  window.addEventListener('scroll', () => {
    if (window.scrollX !== 0) document.scrollingElement.scrollLeft = 0;
    if (!locked && !mobileMQ.matches) setActive(getCurrentIndex());
  }, { passive:true });

  window.addEventListener('wheel', (event) => {
    if (document.body.classList.contains('lightbox-open')) return;
    if (Math.abs(event.deltaY) < 18 || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input, textarea, select')) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    const inner = event.target.closest('[data-no-snap]');
    if (inner && innerCanScroll(inner, direction)) return;

    event.preventDefault();
    if (locked) return;
    if (!mobileMQ.matches) setActive(getCurrentIndex());
    goToPage(activeIndex + direction);
  }, { passive:false });

  window.addEventListener('touchstart', (event) => {
    if (document.body.classList.contains('lightbox-open')) return;
    const touch = event.changedTouches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
    touchStartTarget = event.target;
    if (!locked) setActive(getCurrentIndex());
  }, { passive:true });

  window.addEventListener('touchmove', (event) => {
    if (!mobileMQ.matches || document.body.classList.contains('lightbox-open')) return;
    if (!touchStartTarget || touchStartTarget.closest('input, textarea, select')) return;

    const touch = event.changedTouches[0];
    const diffY = touchStartY - touch.clientY;
    const diffX = touchStartX - touch.clientX;
    if (Math.abs(diffY) <= Math.abs(diffX) || Math.abs(diffY) < 6) return;

    const direction = diffY > 0 ? 1 : -1;
    const inner = touchStartTarget.closest('[data-no-snap]');
    if (inner && innerCanScroll(inner, direction)) return;

    // Impedisce fisicamente al browser di fermarsi a metà pagina.
    event.preventDefault();
  }, { passive:false });

  window.addEventListener('touchend', (event) => {
    if (!mobileMQ.matches || document.body.classList.contains('lightbox-open')) return;
    if (!touchStartTarget || touchStartTarget.closest('input, textarea, select')) return;

    const touch = event.changedTouches[0];
    const diffY = touchStartY - touch.clientY;
    const diffX = touchStartX - touch.clientX;
    touchStartTarget = null;

    // Swipe verticale deliberato: basta un gesto breve, ma non un semplice tap.
    if (Math.abs(diffY) < 28 || Math.abs(diffY) <= Math.abs(diffX) * 1.08) return;
    const direction = diffY > 0 ? 1 : -1;
    if (locked) return;
    goToPage(activeIndex + direction);
  }, { passive:true });

  window.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (['input','textarea','select'].includes(tag)) return;
    const downKeys = ['ArrowDown','PageDown','Space'];
    const upKeys = ['ArrowUp','PageUp'];
    if (![...downKeys, ...upKeys].includes(event.code)) return;
    event.preventDefault();
    if (locked) return;
    if (!mobileMQ.matches) setActive(getCurrentIndex());
    goToPage(activeIndex + (downKeys.includes(event.code) ? 1 : -1));
  });

  window.addEventListener('resize', () => {
    setMobileMode();
    if (mobileMQ.matches && !locked) {
      window.setTimeout(() => goToPage(activeIndex), 100);
    }
  }, { passive:true });

  setActive(getCurrentIndex());
  window.setTimeout(() => {
    document.scrollingElement.scrollLeft = 0;
    if (mobileMQ.matches) goToPage(activeIndex);
  }, 80);
})();


// Lightbox accessibile per fotografie cliniche e professionali.
(function initImageLightbox(){
  const triggers = document.querySelectorAll('[data-lightbox-src]');
  if (!triggers.length || typeof HTMLDialogElement === 'undefined') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'image-lightbox';
  dialog.setAttribute('aria-label', 'Visualizzazione immagine ingrandita');
  dialog.innerHTML = '<button class="image-lightbox-close" type="button" aria-label="Chiudi immagine">×</button><img alt="" />';
  document.body.appendChild(dialog);
  const image = dialog.querySelector('img');
  const closeButton = dialog.querySelector('.image-lightbox-close');

  const close = () => {
    if (dialog.open) dialog.close();
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      image.src = trigger.dataset.lightboxSrc || '';
      image.alt = trigger.dataset.lightboxAlt || trigger.querySelector('img')?.alt || 'Immagine ingrandita';
      document.body.classList.add('lightbox-open');
      dialog.showModal();
    });
  });

  closeButton.addEventListener('click', close);
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    image.removeAttribute('src');
  });
})();
