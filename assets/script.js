const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#nav-menu');
const year = document.querySelector('#year');
const WHATSAPP_NUMBER = '393467762594';

if (year) year.textContent = new Date().getFullYear();

function closeMenu(){
  navMenu?.classList.remove('open');
  navToggle?.setAttribute('aria-expanded','false');
}

navToggle?.addEventListener('click',()=>{
  const open = navMenu?.classList.toggle('open');
  navToggle.setAttribute('aria-expanded',String(Boolean(open)));
});

document.querySelectorAll('.nav-menu a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('click',event=>{
  if (!navMenu || !navToggle) return;
  if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) closeMenu();
});
document.addEventListener('keydown',event=>{ if(event.key==='Escape') closeMenu(); });

// Entrata morbida degli elementi, senza interferire con lo scroll naturale.
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },{threshold:.08,rootMargin:'0px 0px -4% 0px'});
  revealElements.forEach(el=>observer.observe(el));
} else {
  revealElements.forEach(el=>el.classList.add('is-visible'));
}

// Evidenzia la sezione corrente nel menu della home.
(function initActiveNavigation(){
  const links=[...document.querySelectorAll('.nav-menu a[href^="#"]')];
  if(!links.length || !('IntersectionObserver' in window)) return;
  const map=new Map();
  links.forEach(link=>{
    const section=document.querySelector(link.getAttribute('href'));
    if(section) map.set(section,link);
  });
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    links.forEach(link=>link.classList.remove('is-active'));
    map.get(visible.target)?.classList.add('is-active');
  },{rootMargin:'-24% 0px -58% 0px',threshold:[0,.15,.35,.6]});
  map.forEach((_,section)=>observer.observe(section));
})();

// Filtri strutture.
const provinceTabs=document.querySelectorAll('.province-tab');
const structureCards=document.querySelectorAll('.structure-card');
function showProvince(province){
  provinceTabs.forEach(tab=>{
    const active=tab.dataset.provinceFilter===province;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
  });
  structureCards.forEach(card=>{ card.hidden=card.dataset.province!==province; });
}
provinceTabs.forEach(tab=>tab.addEventListener('click',()=>showProvince(tab.dataset.provinceFilter)));
if(provinceTabs.length) showProvince('napoli');

// Modulo appuntamento: provincia, struttura e precompilazione da URL.
const appointmentForm=document.querySelector('#appointmentForm');
const provinceSelect=document.querySelector('#provinceSelect');
const structureSelect=document.querySelector('#structureSelect');

function syncStructureOptions(){
  if(!provinceSelect || !structureSelect) return;
  const province=provinceSelect.value;
  [...structureSelect.options].forEach(option=>{
    if(!option.value){ option.hidden=false; option.disabled=false; return; }
    const match=!province || option.dataset.province===province;
    option.hidden=!match;
    option.disabled=!match;
  });
  const selected=structureSelect.selectedOptions[0];
  if(selected?.value && selected.dataset.province!==province) structureSelect.value='';
}

provinceSelect?.addEventListener('change',syncStructureOptions);
structureSelect?.addEventListener('change',()=>{
  const province=structureSelect.selectedOptions[0]?.dataset.province;
  if(province && provinceSelect) provinceSelect.value=province;
  syncStructureOptions();
});

if(appointmentForm){
  const params=new URLSearchParams(location.search);
  const requestedProvince=params.get('provincia');
  const requestedStructure=params.get('struttura');
  if(requestedProvince && provinceSelect) provinceSelect.value=requestedProvince;
  syncStructureOptions();
  if(requestedStructure && structureSelect){
    const option=[...structureSelect.options].find(item=>item.value===requestedStructure);
    if(option){
      if(provinceSelect && option.dataset.province) provinceSelect.value=option.dataset.province;
      syncStructureOptions();
      structureSelect.value=option.value;
    }
  }

  appointmentForm.addEventListener('submit',event=>{
    event.preventDefault();
    if(!appointmentForm.reportValidity()) return;
    const data=new FormData(appointmentForm);
    const value=key=>(data.get(key)||'').toString().trim();
    const message=[
      '*RICHIESTA APPUNTAMENTO – OFTALMOLOGIA VETERINARIA*','',
      `*Proprietario:* ${value('name')}`,
      `*Telefono:* ${value('phone')}`,
      `*Email:* ${value('email') || 'Non indicata'}`,'',
      `*Paziente:* ${value('petName')} (${value('petType')})`,
      `*Provincia:* ${value('province')}`,
      `*Struttura preferita:* ${value('structure')}`,'',
      '*Sintomi / richiesta:*',value('message'),'',
      'Confermo di aver letto la Privacy Policy e autorizzo il trattamento dei dati per gestire questa richiesta.'
    ].join('\n');
    location.href=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  });
}

// Gallery: filtri.
const filterButtons=document.querySelectorAll('.filter-btn');
const caseCards=document.querySelectorAll('.case-card');
filterButtons.forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter || 'all';
  filterButtons.forEach(btn=>btn.classList.toggle('active',btn===button));
  caseCards.forEach(card=>{ card.hidden=filter!=='all' && card.dataset.category!==filter; });
}));

// FAQ: una risposta aperta alla volta.
const faqDetails=document.querySelectorAll('.faq-list details');
faqDetails.forEach(item=>item.addEventListener('toggle',()=>{
  if(!item.open) return;
  faqDetails.forEach(other=>{ if(other!==item) other.open=false; });
}));

// Lightbox accessibile per foto cliniche e professionali.
(function initImageLightbox(){
  const triggers=document.querySelectorAll('[data-lightbox-src]');
  if(!triggers.length || typeof HTMLDialogElement==='undefined') return;
  const dialog=document.createElement('dialog');
  dialog.className='image-lightbox';
  dialog.setAttribute('aria-label','Visualizzazione immagine ingrandita');
  dialog.innerHTML='<button class="image-lightbox-close" type="button" aria-label="Chiudi immagine">×</button><img alt="">';
  document.body.appendChild(dialog);
  const image=dialog.querySelector('img');
  const closeButton=dialog.querySelector('.image-lightbox-close');
  const close=()=>{ if(dialog.open) dialog.close(); };
  triggers.forEach(trigger=>trigger.addEventListener('click',()=>{
    image.src=trigger.dataset.lightboxSrc || '';
    image.alt=trigger.dataset.lightboxAlt || trigger.querySelector('img')?.alt || 'Immagine ingrandita';
    document.body.classList.add('lightbox-open');
    dialog.showModal();
  }));
  closeButton.addEventListener('click',close);
  dialog.addEventListener('click',event=>{
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) close();
  });
  dialog.addEventListener('close',()=>{
    document.body.classList.remove('lightbox-open');
    image.removeAttribute('src');
  });
})();
