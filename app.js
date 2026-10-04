// Démonstration : toutes les données ci-dessous sont des exemples, rien n'est enregistré.
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAMPS_GOAL=10;
const TIMES=['12:00','12:30','13:00','19:00','19:30','20:00','20:30'];
const PRESETS=['Ce soir, soirée match au bar : on vous attend !','Plat du jour : l’ardoise est en ligne.','Fermeture exceptionnelle ce lundi. À mardi !'];
const days=Array.from({length:5},(_,i)=>{const date=new Date();date.setDate(date.getDate()+i);return i===0?'Aujourd’hui':date.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});});
const state={
  day:0,time:'19:30',covers:2,stamps:6,booking:null,
  slate:{starter:'Œuf mayonnaise maison',main:'Bœuf bourguignon, pommes vapeur',dessert:'Tarte aux pommes',price:'14,50 €'},
  bookings:[
    {day:0,time:'12:15',name:'Famille Martin',covers:4,note:'Table près de la fenêtre',status:'confirmed'},
    {day:0,time:'12:30',name:'M. Dubois',covers:2,note:'Allergie aux fruits à coque',status:'confirmed'},
    {day:0,time:'19:30',name:'Mme Lefèvre',covers:6,note:'Anniversaire',status:'confirmed'},
    {day:1,time:'20:00',name:'M. Bernard',covers:2,note:'',status:'confirmed'}
  ],
  clients:[
    {name:'Famille Martin',visits:14,note:'Table près de la fenêtre'},
    {name:'M. Dubois',visits:9,note:'Allergie aux fruits à coque'},
    {name:'Mme Lefèvre',visits:5,note:'Vient surtout le week-end'},
    {name:'M. Bernard',visits:3,note:''}
  ],
  news:[{when:'Hier',text:'Vendredi soir, moules-frites au ST Georges. Pensez à réserver !'}]
};

function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function plural(count,word){return count+' '+word+(count>1?'s':'');}

// Navigation
const header=$('header'),menu=$('.menu-toggle'),navigation=$('#navigation');
function closeMenu(){navigation.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Ouvrir le menu');}
menu.addEventListener('click',()=>{const open=navigation.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');});
$$('a',navigation).forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigation.classList.contains('open')){closeMenu();menu.focus();}});
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>25),{passive:true});

// Téléphone
function showScreen(name){$$('.screen').forEach(screen=>screen.hidden=screen.dataset.screen!==name);$$('.phone-tabs button').forEach(tab=>tab.setAttribute('aria-selected',String(tab.dataset.tab===name)));$('.phone-body').scrollTop=0;}
$$('.phone-tabs button').forEach(tab=>tab.addEventListener('click',()=>showScreen(tab.dataset.tab)));
$$('[data-go]').forEach(button=>button.addEventListener('click',()=>showScreen(button.dataset.go)));
let notifTimer;
function notify(text){const notif=$('#phone-notif');notif.replaceChildren(element('strong','','LE ST GEORGES'),document.createTextNode(text));notif.classList.add('visible');clearTimeout(notifTimer);notifTimer=setTimeout(()=>notif.classList.remove('visible'),5000);}
function renderSlate(){['starter','main','dessert','price'].forEach(key=>$('#slate-'+key).textContent=state.slate[key]);}
function renderLoyalty(){
  const stamps=$('#stamps');stamps.replaceChildren();
  for(let i=1;i<=STAMPS_GOAL;i++)stamps.append(element('span',i<=state.stamps?'on':'',i<=state.stamps?'✓':''));
  const done=state.stamps>=STAMPS_GOAL;
  $('#loyalty-count').textContent=state.stamps+' / '+STAMPS_GOAL+' passages';
  $('#loyalty-text').textContent=done?'Carte complète : votre récompense vous attend.':'Encore '+plural(STAMPS_GOAL-state.stamps,'passage')+' avant votre récompense.';
}
function renderNews(){const list=$('#news-list');list.replaceChildren(...state.news.map(item=>{const row=element('li');row.append(element('small','',item.when),document.createTextNode(item.text));return row;}));}
function renderNextBooking(){const box=$('#next-booking');box.hidden=!state.booking;if(state.booking)$('#next-booking-text').textContent=days[state.booking.day]+' à '+state.booking.time+' · '+plural(state.booking.covers,'personne');}
function chips(container,labels,isActive,onPick){container.replaceChildren(...labels.map((label,index)=>{const chip=element('button','chip',label);chip.type='button';chip.setAttribute('aria-pressed',String(isActive(index)));chip.addEventListener('click',()=>onPick(index));return chip;}));}
function renderBookingForm(){
  chips($('#day-chips'),days,index=>index===state.day,index=>{state.day=index;renderBookingForm();});
  chips($('#time-chips'),TIMES,index=>TIMES[index]===state.time,index=>{state.time=TIMES[index];renderBookingForm();});
  $('#covers-value').textContent=state.covers;
}
$('#covers-minus').addEventListener('click',()=>{state.covers=Math.max(1,state.covers-1);renderBookingForm();});
$('#covers-plus').addEventListener('click',()=>{state.covers=Math.min(12,state.covers+1);renderBookingForm();});
$('#booking-form').addEventListener('submit',event=>{
  event.preventDefault();
  const name=$('#booking-name').value.trim()||'Client de l’appli';
  state.bookings.forEach(booking=>booking.isNew=false);
  state.booking={day:state.day,time:state.time,name,covers:state.covers,note:'',status:'confirmed',fromApp:true,isNew:true};
  state.bookings.push(state.booking);
  $('#booking-summary').textContent=days[state.day]+' à '+state.time+' · '+plural(state.covers,'personne')+' · '+name;
  $('#booking-form').hidden=true;$('#booking-done').hidden=false;
  renderNextBooking();showView('bookings');renderBookings();
  setStatus('Nouvelle réservation reçue par l’appli : '+name+', '+plural(state.covers,'personne')+'.');
});
$('#booking-again').addEventListener('click',()=>{$('#booking-done').hidden=true;$('#booking-form').hidden=false;$('#booking-name').value='';});

// Outil de gestion
function setStatus(text){$('#crm-status').textContent=text;}
function showView(name){$$('.crm-view').forEach(view=>view.hidden=view.dataset.viewPanel!==name);$$('.crm-tabs button').forEach(tab=>tab.setAttribute('aria-selected',String(tab.dataset.view===name)));}
$$('.crm-tabs button').forEach(tab=>tab.addEventListener('click',()=>{setStatus('');showView(tab.dataset.view);}));
function addStamp(){state.stamps=state.stamps>=STAMPS_GOAL?1:state.stamps+1;renderLoyalty();renderClients();notify(state.stamps>=STAMPS_GOAL?'Carte de fidélité complète : votre récompense vous attend.':'Un passage ajouté sur votre carte de fidélité.');}
function renderBookings(){
  const sorted=[...state.bookings].sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time));
  $('#booking-list').replaceChildren(...sorted.map(booking=>{
    const row=element('li',booking.isNew?'is-new':'');
    const when=element('div','crm-when',booking.time);when.append(element('small','',days[booking.day]));
    const who=element('div','crm-who');const name=element('strong','',booking.name);
    if(booking.fromApp)name.append(element('span','crm-tag','APPLI'));
    who.append(name,element('span','',plural(booking.covers,'couvert')+(booking.note?' · '+booking.note:'')));
    const arrived=booking.status==='arrived';
    const action=element('button','crm-action',arrived?'Arrivé ✓':'Marquer arrivé');action.type='button';action.disabled=arrived;
    action.addEventListener('click',()=>{booking.status='arrived';booking.isNew=false;renderBookings();if(booking.fromApp){addStamp();setStatus(booking.name+' est arrivé : un passage a été ajouté sur sa carte de fidélité.');}else setStatus(booking.name+' est arrivé.');});
    row.append(when,who,action);return row;
  }));
  const pending=state.bookings.filter(booking=>booking.status!=='arrived');
  $('#stat-covers').textContent=pending.reduce((total,booking)=>total+booking.covers,0);
  $('#stat-bookings').textContent=state.bookings.length;
  $('#stat-app').textContent=state.bookings.filter(booking=>booking.fromApp).length;
}
function renderClients(){
  const demo={name:'Votre client de démonstration',visits:state.stamps,note:'C’est le téléphone de la démonstration',demo:true};
  $('#client-list').replaceChildren(...[demo,...state.clients].map(client=>{
    const row=element('li');
    const visits=element('div','crm-when',String(client.visits));visits.append(element('small','',client.visits>1?'passages':'passage'));
    const who=element('div','crm-who');who.append(element('strong','',client.name),element('span','',client.note||'Aucune note'));
    const action=element('button','crm-action','+ 1 passage');action.type='button';
    action.addEventListener('click',()=>{if(client.demo){addStamp();setStatus('Passage ajouté : la carte de fidélité du téléphone est à jour.');}else{client.visits++;renderClients();setStatus('Passage ajouté pour '+client.name+'.');}});
    row.append(visits,who,action);return row;
  }));
}
const slateForm=$('#slate-form');
['starter','main','dessert','price'].forEach(key=>slateForm.elements[key].value=state.slate[key]);
slateForm.addEventListener('submit',event=>{
  event.preventDefault();
  ['starter','main','dessert','price'].forEach(key=>{const value=slateForm.elements[key].value.trim();if(value)state.slate[key]=value;else slateForm.elements[key].value=state.slate[key];});
  renderSlate();showScreen('home');
  state.news.unshift({when:'À l’instant',text:'L’ardoise du jour est en ligne : '+state.slate.main+'.'});renderNews();
  notify('L’ardoise du jour est en ligne : '+state.slate.main+'.');
  setStatus('Ardoise publiée : regardez l’écran d’accueil du téléphone.');
});
const messageForm=$('#message-form');
chips($('#message-presets'),['Soirée match','Plat du jour','Fermeture'],()=>false,index=>{messageForm.elements.text.value=PRESETS[index];messageForm.elements.text.focus();});
messageForm.addEventListener('submit',event=>{
  event.preventDefault();
  const text=messageForm.elements.text.value.trim();
  if(!text){setStatus('Écrivez un message ou choisissez un modèle avant d’envoyer.');messageForm.elements.text.focus();return;}
  state.news.unshift({when:'À l’instant',text});renderNews();notify(text);
  messageForm.elements.text.value='';
  setStatus('Message envoyé : il s’affiche sur le téléphone et dans l’onglet Actus.');
});

$('#crm-date').textContent=new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
$('#year').textContent=new Date().getFullYear();
renderSlate();renderLoyalty();renderNews();renderNextBooking();renderBookingForm();renderBookings();renderClients();
if('IntersectionObserver' in window&&!reduced){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});$$('.reveal').forEach(node=>observer.observe(node));}
