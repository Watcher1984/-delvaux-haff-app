
const KEY='delvaux-haff-data-v2';
const seed={animals:[{id:crypto.randomUUID(),name:'Aubrac 01',species:'Rind',breed:'Aubrac',status:'Aktiv'}],
groups:[{id:crypto.randomUUID(),name:'Mobilstall 1',hens:280,location:'Hof'}],
eggs:[{id:crypto.randomUUID(),date:new Date().toISOString().slice(0,10),group:'Mobilstall 1',count:190,broken:3}],
feed:[],tasks:[{id:crypto.randomUUID(),title:'Eier stempeln',due:new Date().toISOString().slice(0,10),done:false}]};
let data=JSON.parse(localStorage.getItem(KEY)||'null')||seed, page='home';
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const today=()=>new Date().toISOString().slice(0,10);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function nav(){return `<nav>
<button onclick="go('home')"><i>🏠</i>Start</button>
<button onclick="go('animals')"><i>🐄</i>Tiere</button>
<button onclick="go('groups')"><i>🐔</i>Hühner</button>
<button onclick="go('eggs')"><i>🥚</i>Eier</button>
<button onclick="go('tasks')"><i>✅</i>Aufgaben</button>
</nav>`}
function header(t='Delvaux\\'s Haff',s='Hofverwaltung'){return `<header><h1>${t}</h1><p>${s}</p></header>`}
function go(p){page=p;render()} window.go=go;
function home(){
 const hens=data.groups.reduce((a,x)=>a+Number(x.hens||0),0);
 const eggs=data.eggs.filter(x=>x.date===today()).reduce((a,x)=>a+Number(x.count||0),0);
 const open=data.tasks.filter(x=>!x.done).length;
 return `${header()}<main>
 <div class="stats">
 <div class="card stat"><span>Einzeltiere</span><strong>${data.animals.length}</strong></div>
 <div class="card stat"><span>Legehennen</span><strong>${hens}</strong></div>
 <div class="card stat"><span>Eier heute</span><strong>${eggs}</strong></div>
 <div class="card stat"><span>Aufgaben offen</span><strong>${open}</strong></div>
 </div>
 <div class="grid">
 <button class="action" onclick="form('egg')">🥚<b>Eier eintragen</b><span>Schneller Tageseintrag</span></button>
 <button class="action" onclick="form('animal')">🐄<b>Tier hinzufügen</b><span>Rind, Ziege usw.</span></button>
 <button class="action" onclick="form('group')">🐔<b>Hühnergruppe</b><span>Mobilstall verwalten</span></button>
 <button class="action" onclick="form('task')">✅<b>Aufgabe</b><span>Arbeit festhalten</span></button>
 </div>
 <p class="note">Diese Version speichert die Daten auf dem jeweiligen Gerät. Cloud-Synchronisierung für mehrere Benutzer kommt im nächsten Schritt.</p>
 </main>${nav()}`;
}
function rows(kind){
 let arr=data[kind];
 if(!arr.length)return '<div class="card">Noch keine Einträge.</div>';
 return `<div class="list">${arr.map(x=>{
  if(kind==='animals')return `<div class="row"><b>${esc(x.name)}</b><small>${esc(x.species)} · ${esc(x.breed)} · ${esc(x.status)}</small></div>`;
  if(kind==='groups')return `<div class="row"><b>${esc(x.name)}</b><small>${x.hens} Hennen · ${esc(x.location)}</small></div>`;
  if(kind==='eggs')return `<div class="row"><b>${x.count} Eier</b><small>${esc(x.date)} · ${esc(x.group)} · Bruch ${x.broken||0}</small></div>`;
  if(kind==='tasks')return `<div class="row"><b>${x.done?'✅':'⬜️'} ${esc(x.title)}</b><small>Fällig ${esc(x.due)}</small><div class="toolbar"><button class="btn secondary" onclick="toggle('${x.id}')">${x.done?'Öffnen':'Erledigt'}</button></div></div>`;
 }).join('')}</div>`
}
function section(kind,title,sub,formKind){
 return `${header(title,sub)}<main><div class="toolbar"><button class="btn" onclick="form('${formKind}')">+ Neu</button></div>${rows(kind)}</main>${nav()}`
}
function toggle(id){let t=data.tasks.find(x=>x.id===id);if(t)t.done=!t.done;save();render()} window.toggle=toggle;
function form(type){
 const fields={
 animal:`<div class="field"><label>Name / Ohrmarke</label><input name="name" required></div><div class="field"><label>Tierart</label><input name="species" required></div><div class="field"><label>Rasse</label><input name="breed"></div><div class="field"><label>Status</label><select name="status"><option>Aktiv</option><option>Verkauft</option><option>Verstorben</option></select></div>`,
 group:`<div class="field"><label>Gruppenname</label><input name="name" value="Mobilstall 1" required></div><div class="field"><label>Hennen</label><input type="number" name="hens" value="0"></div><div class="field"><label>Standort</label><input name="location"></div>`,
 egg:`<div class="field"><label>Datum</label><input type="date" name="date" value="${today()}"></div><div class="field"><label>Gruppe</label><input name="group" value="${esc(data.groups[0]?.name||'Mobilstall 1')}"></div><div class="field"><label>Anzahl Eier</label><input type="number" inputmode="numeric" name="count" required autofocus></div><div class="field"><label>Bruch</label><input type="number" name="broken" value="0"></div>`,
 task:`<div class="field"><label>Aufgabe</label><input name="title" required></div><div class="field"><label>Fällig</label><input type="date" name="due" value="${today()}"></div>`
 };
 const m=document.createElement('div');m.className='modalBack';m.id='modal';m.innerHTML=`<div class="modal"><h2>Neuer Eintrag</h2><form id="f">${fields[type]}</form><div class="actions"><button class="btn secondary" onclick="closeM()">Abbrechen</button><button class="btn" onclick="submitF('${type}')">Speichern</button></div></div>`;document.body.appendChild(m)
} window.form=form;
function closeM(){document.getElementById('modal')?.remove()} window.closeM=closeM;
function submitF(type){
 const f=document.getElementById('f');if(!f.reportValidity())return;let x=Object.fromEntries(new FormData(f).entries());x.id=crypto.randomUUID();
 if(type==='animal')data.animals.unshift(x);
 if(type==='group'){x.hens=Number(x.hens||0);data.groups.unshift(x)}
 if(type==='egg'){x.count=Number(x.count||0);x.broken=Number(x.broken||0);data.eggs.unshift(x)}
 if(type==='task'){x.done=false;data.tasks.unshift(x)}
 save();closeM();render()
} window.submitF=submitF;
function render(){
 let html=page==='home'?home():page==='animals'?section('animals','Tiere','Einzeltiere verwalten','animal'):page==='groups'?section('groups','Hühner','Gruppen und Mobilställe','group'):page==='eggs'?section('eggs','Eier','Produktion erfassen','egg'):section('tasks','Aufgaben','Arbeiten verteilen','task');
 document.getElementById('app').innerHTML=html;
}
render();
