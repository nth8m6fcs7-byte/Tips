import {openOverview,openMonthlyOverview} from './tips-overview.mjs?v=20261007-clean';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=value=>typeof value==='number'?new Intl.NumberFormat('pt-PT',{maximumFractionDigits:2}).format(value):escape(value);
const date=value=>value.split('-').reverse().join('/');
export function archivePayment(person,fields){
 const candidates=(fields||[]).filter(f=>['total','€-5%'].includes(String(f.label).trim().toLowerCase()));
 for(const field of candidates.reverse()){
  const cell=person.cells.find(c=>c.cell.replace(/\d+/g,'')===field.column);
  if(typeof cell?.value==='number'&&Number.isFinite(cell.value))return cell.value;
 }
 return person.gross??person.cells[2]?.value;
}
export function renderArchive(root,archive){
 if(!archive?.weeks?.length){root.innerHTML='';return;}
 const weeks=archive.weeks,months=[...new Set(weeks.map(w=>w.month))];
 root.innerHTML=`<section class="tips-archive-clean"><div class="tips-month-bar"><label>Mês<select data-archive-month>${months.map(m=>`<option>${escape(m)}</option>`).join('')}</select></label><button type="button" class="secondary" data-archive-month-pdf>PDF do mês</button></div><div data-archive-weeks></div></section>`;
 const list=root.querySelector('[data-archive-weeks]');
 function show(month){list.innerHTML=[...weeks].reverse().filter(w=>!month||w.month===month).map(w=>{
  const labels=new Map(w.fields.map(f=>[f.column,f.label]));
  return `<details class="tips-history-item"><summary>${date(w.week)} – ${date(new Date(Date.parse(w.week+'T00:00:00Z')+6*86400000).toISOString().slice(0,10))}<span class="tips-week-total"></span></summary><button type="button" class="secondary" data-archive-overview="${w.week}">Vista geral</button><details class="tips-tools"><summary>Fechos diários</summary>${w.days.map((n,i)=>`<div class="tips-detail"><span>${['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'][i]}</span><span>${number(n)} €</span></div>`).join('')}</details><div class="tips-records">${w.staff.map(p=>{
   const extras=p.cells.slice(3).filter(c=>c.value!==null&&c.value!=='');
   const label=c=>{const raw=labels.get(c.cell.replace(/\d+/g,''));return raw==='0.05'?'Acerto (5%)':raw==='€-5%'?'Após acerto':raw==='€'?'Gorjeta':raw|| (typeof c.value==='string'?'Nota':'Acerto adicional');};
   return `<article class="tips-record"><div class="tips-record-head"><div><strong>${escape(p.name)}</strong><small>${number(p.hours??p.cells[1]?.value)} horas</small></div><div class="tips-record-amount"><small>Após acerto</small><strong>${number(archivePayment(p,w.fields))} €</strong></div></div><details class="tips-person-details"><summary>Ver detalhes</summary><dl class="tips-record-facts"><div><dt>Gorjeta antes do acerto</dt><dd>${number(p.gross??p.cells[2]?.value)} €</dd></div>${extras.map(c=>`<div><dt>${escape(label(c))}</dt><dd>${number(c.value)}${typeof c.value==='number'?' €':''}</dd></div>`).join('')}</dl></details></article>`;
 }).join('')}</div></details>`;
 }).join('');}
 list.addEventListener('click',event=>{const button=event.target.closest('[data-archive-overview]');if(!button)return;const week=weeks.find(w=>w.week===button.dataset.archiveOverview);if(week)openOverview(root,week.week,week.staff.map(p=>({name:p.name,paid:Math.round(archivePayment(p,week.fields)*100)})),'Excel · pagamentos após acerto.');});
 const select=root.querySelector('[data-archive-month]');select.value=months.at(-1);select.onchange=e=>show(e.target.value);show(select.value);
 root.querySelector('[data-archive-month-pdf]').onclick=()=>{const selected=weeks.filter(w=>w.month===select.value);openMonthlyOverview(root,`${select.value.charAt(0)+select.value.slice(1).toLowerCase()} ${archive.year}`,selected.map(w=>({week:w.week,people:w.staff.map(p=>({name:p.name,paid:Math.round(archivePayment(p,w.fields)*100)}))})));};
}
