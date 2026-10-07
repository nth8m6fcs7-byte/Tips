import {money,addDate} from './tips-core.mjs';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>s.split('-').reverse().join('/');
export function openOverview(root,week,people,status){
 root.querySelector('#gt-overview')?.remove();
 const dialog=document.createElement('dialog');dialog.id='gt-overview';dialog.className='tips-overview';dialog.setAttribute('aria-labelledby','gt-overview-title');
 const total=people.reduce((sum,p)=>sum+p.paid,0);
 dialog.innerHTML=`<header><div><h2 id="gt-overview-title">Vista geral</h2><p>${date(week)} a ${date(addDate(week,6))}</p></div><button type="button" class="secondary" data-overview-close>Fechar</button></header><p class="tips-caption">${escape(status)}</p><div class="tips-overview-labels"><span>Pessoa</span><span>A entregar</span></div><ul>${people.map(p=>`<li><span>${escape(p.name)}</span><strong>${money(p.paid)}</strong></li>`).join('')}</ul><div class="tips-overview-total"><span>Total a entregar</span><strong>${money(total)}</strong></div>`;
 root.append(dialog);dialog.querySelector('[data-overview-close]').onclick=()=>dialog.close();dialog.showModal();
}
