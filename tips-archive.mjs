const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=value=>typeof value==='number'?new Intl.NumberFormat('pt-PT',{maximumFractionDigits:2}).format(value):escape(value);
const date=value=>value.split('-').reverse().join('/');
export function renderArchive(root,archive){
 if(!archive?.weeks?.length){root.innerHTML='';return;}
 const weeks=archive.weeks,months=[...new Set(weeks.map(w=>w.month))];
 root.innerHTML=`<details class="tips-history"><summary>Histórico do Excel · ${weeks.length} semanas</summary><p class="tips-caption">${escape(archive.filename)} · ${date(weeks[0].week)} a ${date(weeks.at(-1).week)} (início das semanas). Pagamentos e acertos conforme a folha de origem.</p><p class="tips-caption">O histórico foi importado sem recalcular ou duplicar pagamentos. Os valores da tabela aparecem com até duas casas decimais; as referências e a exportação preservam os valores completos. Os saldos de novas semanas são geridos separadamente.</p><label class="tips-cash">Mês<select data-archive-month><option value="">Todos os meses</option>${months.map(m=>`<option>${escape(m)}</option>`).join('')}</select></label><button type="button" class="secondary" data-archive-export>Exportar histórico do Excel</button><div data-archive-weeks></div><details class="tips-tools"><summary>Notas e células da folha original</summary><div data-archive-source></div></details></details>`;
 root.querySelector('[data-archive-source]').innerHTML=(archive.months||[]).map(m=>`<details><summary>${escape(m.month)}</summary>${m.cells.map(c=>`<p class="tips-caption">${escape(c.cell)}: ${escape(c.value)}${c.formula?' · '+escape(c.formula):''}</p>`).join('')}</details>`).join('');
 const list=root.querySelector('[data-archive-weeks]');
 function show(month){list.innerHTML=[...weeks].reverse().filter(w=>!month||w.month===month).map(w=>{
  const labels=new Map(w.fields.map(f=>[f.column,f.label]));
  const columns=[...new Set(w.staff.flatMap(p=>p.cells.map(c=>c.cell.replace(/\d+/g,''))))];
  return `<details class="tips-history-item"><summary>${date(w.week)} · ${escape(w.title)} · ${number(w.daily)} € nos fechos</summary><details class="tips-tools"><summary>Fechos diários</summary>${w.days.map((n,i)=>`<div class="tips-detail"><span>${['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'][i]}</span><span>${number(n)} €</span></div>`).join('')}</details><div class="tips-history-table"><table><thead><tr>${columns.map(c=>`<th>${escape(labels.get(c)==='0.05'?'5%':labels.get(c)||c)}</th>`).join('')}</tr></thead><tbody>${w.staff.map(p=>`<tr>${columns.map(col=>{const c=p.cells.find(x=>x.cell.replace(/\d+/g,'')===col);return `<td title="${escape(c?.cell)}">${number(c?.value)}</td>`;}).join('')}</tr>`).join('')}<tr>${columns.map(col=>{const c=w.totals.find(x=>x.cell.replace(/\d+/g,'')===col);return `<td><strong>${number(c?.value)}</strong></td>`;}).join('')}</tr></tbody></table></div><details class="tips-tools"><summary>Fórmulas e referências de origem</summary>${w.staff.map(p=>`<details><summary>${escape(p.name)}</summary>${p.cells.map(c=>`<p class="tips-caption">${escape(c.cell)}: ${escape(c.value)}${c.formula?' · '+escape(c.formula):''}</p>`).join('')}</details>`).join('')}</details></details>`;
 }).join('');}
 root.querySelector('[data-archive-month]').onchange=e=>show(e.target.value);show('');
 root.querySelector('[data-archive-export]').onclick=()=>{
  const quote=v=>'"'+String(v??'').replace(/^[=+@-]/,"'").replaceAll('"','""')+'"';
  const rows=[['Semana','Pessoa','Celula','Valor original','Formula original']];
  for(const w of weeks)for(const p of w.staff)for(const c of p.cells)rows.push([w.week,p.name,c.cell,c.value,c.formula]);
  const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(quote).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='gorjetas-excel-2026.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
}
