(function(){
'use strict';
const KEY='haff-v3';
const id=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const day=()=>new Date().toISOString().slice(0,10);
let data;
try{data=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!data)data={animals:[],groups:[{id:id(),name:'Mobilstall 1',hens:280}],eggs:[],tasks:[]};
let page='home';
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function nav(){return `<nav><button onclick="H.go('home')"><i>🏠</i>Start</button><button onclick="H.go('animals')"><i>🐄</i>Tiere</button><button onclick="H.go('groups')"><i>🐔</i>Hühner</button><button onclick="H.go('eggs')"><i>🥚</i>Eier</button><button onclick="H.go('tasks')"><i>✅</i>Aufgaben</button></nav>`}
function head(t,s){return `<header><h1>${t}</h1><p>${s}</p></header>`}
function home(){
 let hens=data.groups.reduce((n,x)=>n+(+x.hens||0),0);
 let eggs=data.eggs.filter(x=>x.date===day()).reduce((n,x)=>n+(+x.count||0),0);
 return `${head("Delvaux's Haff","Gemeinsame Hofverwaltung")}<main><div class="stats">
 <div class="card stat"><small>Einzeltiere</small><b>${data.animals.length}</b></div>
 <div class="card stat"><small>Legehennen</small><b>${hens}</b></div>
 <div class="card stat"><small>Eier heute</small><b>${eggs}</b></div>
 <div class="card stat"><small>Aufgaben offen</small><b>${data.tasks.filter(x=>!x.done).length}</b></div></div>
 <div class="quick"><button onclick="H.form('egg')">🥚<strong>Eier eintragen</strong><span>Schneller Tageseintrag</span></button>
 <button onclick="H.form('animal')">🐄<strong>Tier hinzufügen</strong><span>Rind, Ziege usw.</span></button>
 <button onclick="H.form('group')">🐔<strong>Hühnergruppe</strong><span>Bestand verwalten</span></button>
 <button onclick="H.form('task')">✅<strong>Aufgabe</strong><span>Arbeit festhalten</span></button></div></main>${nav()}`}
function list(kind,title,sub,type){
 let rows=data[kind].map(x=>{
  if(kind==='animals')return `<div class="item"><b>${x.name}</b><small>${x.species||''} ${x.breed||''}</small></div>`;
  if(kind==='groups')return `<div class="item"><b>${x.name}</b><small>${x.hens||0} Hennen</small></div>`;
  if(kind==='eggs')return `<div class="item"><b>${x.count} Eier</b><small>${x.date} · ${x.group||''} · Bruch ${x.broken||0}</small></div>`;
  return `<div class="item"><b>${x.done?'✅':'⬜️'} ${x.title}</b><small>${x.due||''}</small><div class="toolbar"><button class="btn secondary" onclick="H.toggle('${x.id}')">Status ändern</button></div></div>`;
 }).join('')||'<div class="card">Noch keine Einträge.</div>';
 return `${head(title,sub)}<main><div class="toolbar"><button class="btn" onclick="H.form('${type}')">+ Neu</button></div><div class="list">${rows}</div></main>${nav()}`}
function render(){
 let html=page==='home'?home():page==='animals'?list('animals','Tiere','Einzeltiere verwalten','animal'):page==='groups'?list('groups','Hühner','Gruppen verwalten','group'):page==='eggs'?list('eggs','Eier','Produktion erfassen','egg'):list('tasks','Aufgaben','Arbeiten festhalten','task');
 document.getElementById('app').innerHTML=html
}
window.H={
 go(p){page=p;render()},
 toggle(i){let x=data.tasks.find(t=>t.id===i);if(x){x.done=!x.done;save();render()}},
 close(){document.getElementById('modal')?.remove()},
 form(type){
  let f=type==='animal'?`<div class="field"><label>Name / Ohrmarke</label><input name="name" required></div><div class="field"><label>Tierart</label><input name="species" required></div><div class="field"><label>Rasse</label><input name="breed"></div>`:
  type==='group'?`<div class="field"><label>Gruppe</label><input name="name" value="Mobilstall 1" required></div><div class="field"><label>Hennen</label><input type="number" name="hens" value="0"></div>`:
  type==='egg'?`<div class="field"><label>Datum</label><input type="date" name="date" value="${day()}"></div><div class="field"><label>Gruppe</label><input name="group" value="${data.groups[0]?.name||'Mobilstall 1'}"></div><div class="field"><label>Eier</label><input type="number" name="count" required></div><div class="field"><label>Bruch</label><input type="number" name="broken" value="0"></div>`:
  `<div class="field"><label>Aufgabe</label><input name="title" required></div><div class="field"><label>Fällig</label><input type="date" name="due" value="${day()}"></div>`;
  let d=document.createElement('div');d.id='modal';d.className='modalbg';d.innerHTML=`<div class="modal"><h2>Neuer Eintrag</h2><form id="entry">${f}</form><div class="actions"><button class="btn secondary" onclick="H.close()">Abbrechen</button><button class="btn" onclick="H.submit('${type}')">Speichern</button></div></div>`;document.body.appendChild(d)
 },
 submit(type){
  let f=document.getElementById('entry');if(!f.reportValidity())return;let x=Object.fromEntries(new FormData(f));x.id=id();
  if(type==='animal')data.animals.unshift(x);if(type==='group'){x.hens=+x.hens||0;data.groups.unshift(x)}if(type==='egg'){x.count=+x.count||0;x.broken=+x.broken||0;data.eggs.unshift(x)}if(type==='task'){x.done=false;data.tasks.unshift(x)}
  save();H.close();render()
 }
};
render();
})();