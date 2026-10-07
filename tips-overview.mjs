import {money,addDate} from './tips-core.mjs';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>s.split('-').reverse().join('/');
const table=people=>`<table><thead><tr><th>Pessoa</th><th>Pagamento</th></tr></thead><tbody>${people.map(p=>`<tr><td>${escape(p.name)}</td><td>${money(p.paid)}</td></tr>`).join('')}</tbody></table>`;
export function openOverview(root,week,people,status,options={}){
 root.querySelector('#gt-overview')?.remove();
 const dialog=document.createElement('dialog');dialog.id='gt-overview';dialog.className='tips-overview';dialog.setAttribute('aria-labelledby','gt-overview-title');
 const total=people.reduce((sum,p)=>sum+p.paid,0);
 dialog.innerHTML=`<header><div><h2 id="gt-overview-title">Vista geral</h2><p>${escape(options.title??`${date(week)} a ${date(addDate(week,6))}`)}</p></div><button type="button" class="secondary" data-overview-close>Fechar</button></header><p class="tips-caption">${escape(status)}</p><div class="tips-overview-labels"><span>Pessoa</span><span>A entregar</span></div><ul>${people.map(p=>`<li><span>${escape(p.name)}</span><strong>${money(p.paid)}</strong></li>`).join('')}</ul><div class="tips-overview-total"><span>Total a entregar</span><strong>${money(total)}</strong></div><button type="button" class="tips-block" data-overview-pdf>Guardar PDF</button>`;
 root.append(dialog);dialog.querySelector('[data-overview-close]').onclick=()=>dialog.close();dialog.querySelector('[data-overview-pdf]').onclick=()=>{document.getElementById('tips-printout')?.remove();const print=document.createElement('section');print.id='tips-printout';print.innerHTML=`<h1>Tips · ${escape(options.title??'Pagamentos da semana')}</h1><p>${escape(options.title??`${date(week)} a ${date(addDate(week,6))}`)}</p><p>${escape(status)}</p>${table(people)}<p><strong>Total: ${money(total)}</strong></p>${(options.weeks||[]).map(w=>`<section class="tips-print-week"><h2>${date(w.week)} a ${date(addDate(w.week,6))}</h2>${table(w.people)}<p>Total da semana: ${money(w.people.reduce((sum,p)=>sum+p.paid,0))}</p></section>`).join('')}`;document.body.append(print);window.print();};dialog.showModal();
}

export function openMonthlyOverview(root,title,weeks){
 const totals=new Map();for(const week of weeks)for(const person of week.people)totals.set(person.name,(totals.get(person.name)||0)+person.paid);
 openOverview(root,weeks[0].week,[...totals].map(([name,paid])=>({name,paid})),'Pagamentos após acerto · total por pessoa nas semanas selecionadas.',{title,weeks});
}
