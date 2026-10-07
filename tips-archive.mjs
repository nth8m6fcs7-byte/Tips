const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=value=>typeof value==='number'?new Intl.NumberFormat('pt-PT',{maximumFractionDigits:2}).format(value):escape(value);
const date=value=>value.split('-').reverse().join('/');
export function renderArchive(root,archive){
 if(!archive?.weeks?.length){root.innerHTML='';return;}
 const weeks=archive.weeks,months=[...new Set(weeks.map(w=>w.month))];
 root.innerHTML=`<details class="tips-history"><summary>Histórico do Excel · ${weeks.length} semanas</summary><p class="tips-caption">Pagamentos e acertos registados no Excel. Escolhe o mês e abre uma semana para consultar os valores.</p><label class="tips-cash">Mês<select data-archive-month><option value="">Todos os meses</option>${months.map(m=>`<option>${escape(m)}</option>`).join('')}</select></label><button type="button" class="secondary" data-archive-export>Exportar histórico do Excel</button><div data-archive-weeks></div><details class="tips-tools"><summary>Notas e células da folha original</summary><p class="tips-caption">${escape(archive.filename)} · valores importados sem recalcular pagamentos. Apresentação com até duas casas decimais; referências e exportação preservam os valores completos. Os saldos de novas semanas são geridos separadamente.</p><div data-archive-source></div></details></details>`;
 root.querySelector('[data-archive-source]').innerHTML=(archive.months||[]).map(m=>`<details><summary>${escape(m.month)}</summary>${m.cells.map(c=>`<p class="tips-caption">${escape(c.cell)}: ${escape(c.value)}${c.formula?' · '+escape(c.formula):''}</p>`).join('')}</details>`).join('');
 const list=root.querySelector('[data-archive-weeks]');
 function show(month){list.innerHTML=[...weeks].reverse().filter(w=>!month||w.month===month).map(w=>{
  const labels=new Map(w.fields.map(f=>[f.column,f.label]));
  return `<details class="tips-history-item"><summary>${date(w.week)}<span class="tips-week-total">Fechos · ${number(w.daily)} €</span></summary><details class="tips-tools"><summary>Fechos diários</summary>${w.days.map((n,i)=>`<div class="tips-detail"><span>${['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'][i]}</span><span>${number(n)} €</span></div>`).join('')}</details><div class="tips-records">${w.staff.map(p=>{
   const extras=p.cells.slice(3).filter(c=>c.value!==null&&c.value!=='');
   const label=c=>{const raw=labels.get(c.cell.replace(/\d+/g,''));return raw==='0.05'?'Acerto (5%)':raw==='€-5%'?'Após acerto':raw==='€'?'Gorjeta':raw|| (typeof c.value==='string'?'Nota':'Acerto adicional');};
   return `<article class="tips-record"><div class="tips-record-head"><div><strong>${escape(p.name)}</strong><small>${number(p.hours??p.cells[1]?.value)} horas</small></div><div class="tips-record-amount"><small>Gorjeta</small><strong>${number(p.gross??p.cells[2]?.value)} €</strong></div></div><dl class="tips-record-facts">${extras.map(c=>`<div><dt>${escape(label(c))}</dt><dd>${number(c.value)}${typeof c.value==='number'?' €':''}</dd></div>`).join('')}</dl></article>`;
 }).join('')}</div><details class="tips-tools"><summary>Totais da folha</summary>${(w.totals||[]).map(c=>`<div class="tips-detail"><span>${escape(labels.get(c.cell.replace(/\d+/g,''))||c.cell)}</span><span>${number(c.value)}</span></div>`).join('')}</details><details class="tips-tools"><summary>Fórmulas e referências de origem</summary>${w.staff.map(p=>`<details><summary>${escape(p.name)}</summary>${p.cells.map(c=>`<p class="tips-caption">${escape(c.cell)}: ${escape(c.value)}${c.formula?' · '+escape(c.formula):''}</p>`).join('')}</details>`).join('')}</details></details>`;
 }).join('');}
 root.querySelector('[data-archive-month]').onchange=e=>show(e.target.value);show('');
 root.querySelector('[data-archive-export]').onclick=()=>{
  const quote=v=>'"'+String(v??'').replace(/^[=+@-]/,"'").replaceAll('"','""')+'"';
  const rows=[['Semana','Pessoa','Celula','Valor original','Formula original']];
  for(const w of weeks)for(const p of w.staff)for(const c of p.cells)rows.push([w.week,p.name,c.cell,c.value,c.formula]);
  const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(quote).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='gorjetas-excel-2026.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
}
