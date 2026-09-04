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

// Navigazione naturale del documento.
// Lo scroll automatico a sezioni è stato rimosso per lasciare all'utente pieno controllo
// della lettura su desktop e mobile.

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

// V2: evidenzia la sezione corrente nel menu senza modificare lo scroll naturale.
(function initActiveNavigation(){
  const links = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map();
  links.forEach(link => {
    const id = link.getAttribute('href');
    const section = id && document.querySelector(id);
    if (section) map.set(section, link);
  });
  if (!map.size) return;
  const obs = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach(l => l.classList.remove('is-active'));
    map.get(visible.target)?.classList.add('is-active');
  }, {rootMargin:'-24% 0px -58% 0px', threshold:[0,.15,.35,.6]});
  map.forEach((_,section) => obs.observe(section));
})();

// V2: Escape chiude il menu mobile.
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  navMenu?.classList.remove('open');
  navToggle?.setAttribute('aria-expanded','false');
});
