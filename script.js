// Replace null with the confirmed international number to activate all phone actions.
const restaurant = { phone: null };
const header = document.querySelector('header');
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(){navigation.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Ouvrir le menu');}
menu.addEventListener('click',()=>{const open=navigation.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu.focus();}});
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>25),{passive:true});
const gallery=document.querySelector('.gallery');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function moveGallery(direction){const step=gallery.querySelector('figure').getBoundingClientRect().width+parseFloat(getComputedStyle(gallery).gap);const end=gallery.scrollWidth-gallery.clientWidth;let target=gallery.scrollLeft+direction*step;if(direction>0&&gallery.scrollLeft>=end-4)target=0;if(direction<0&&gallery.scrollLeft<=4)target=end;gallery.scrollTo({left:target,behavior:reduced?'instant':'smooth'});}
document.querySelector('#next').addEventListener('click',()=>moveGallery(1));
document.querySelector('#previous').addEventListener('click',()=>moveGallery(-1));
gallery.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveGallery(e.key==='ArrowRight'?1:-1);}});
gallery.addEventListener('scroll',()=>{const width=gallery.querySelector('figure').getBoundingClientRect().width+parseFloat(getComputedStyle(gallery).gap);document.querySelector('#gallery-position').textContent=String(Math.round(gallery.scrollLeft/width)+1).padStart(2,'0')+' — 06';},{passive:true});
if('IntersectionObserver' in window&&!reduced){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
const callButton=document.querySelector('.contact-button');
if(restaurant.phone){document.querySelector('.phone').textContent=restaurant.phone;document.querySelector('#contact .muted').textContent='Pour réserver votre table, appelez-nous.';document.querySelectorAll('a[href="#contact"]').forEach(link=>link.href='tel:'+restaurant.phone);callButton.addEventListener('click',()=>window.location.href='tel:'+restaurant.phone);}else{callButton.addEventListener('click',()=>{document.querySelector('#contact-status').textContent='Le numéro sera disponible après validation des coordonnées du restaurant.';});}
document.querySelector('#year').textContent=new Date().getFullYear();
