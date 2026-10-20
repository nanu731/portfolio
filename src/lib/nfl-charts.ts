import {DATA_URL,MANIFEST_URL,validatePair,METRICS,fmt,type Payload,type Row} from './nfl-comparison';
const NS='http://www.w3.org/2000/svg';
function element(tag:string,attrs:Record<string,string|number>={},text?:string){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e;}
function cell(tag:string,text:string){const e=document.createElement(tag);e.textContent=text;if(tag==='th')e.setAttribute('scope','row');return e;}
export function registerNFL(){
 if(customElements.get('nfl-comparison'))return;
 class NFLComparison extends HTMLElement{
  data?:Payload; observer?:ResizeObserver; request=0; players:{id:string;name:string}[]=[];
  name(r:Row){return this.players.find(p=>p.id===r.player_key)?.name??r.observed_name;}
  label(r:Row){return `${this.name(r)} · ${r.season}`;}
  control(key:string){return this.querySelector<HTMLSelectElement>(`[data-${key}]`)!;}
  search(side:string){return this.querySelector<HTMLInputElement>(`[data-search-${side}]`)!;}
  filter(side:string){
   const select=this.control(side),selected=select.value,query=this.search(side).value.trim().toLocaleLowerCase();
   const matches=this.players.filter(p=>p.name.toLocaleLowerCase().includes(query));
   const current=this.players.find(p=>p.id===selected)!;
   const keepsCurrent=matches.some(p=>p.id===selected);
   const choices=keepsCurrent?matches:[current,...matches];
   select.replaceChildren(...choices.map(p=>new Option(p.name,p.id,false,p.id===selected)));
   this.querySelector(`[data-search-status-${side}]`)!.textContent=!query?'All 20 QBs available. Search by name, then choose from the dropdown.':matches.length?`${matches.length} matching QB${matches.length===1?'':'s'}. Choose from the dropdown.${keepsCurrent?'':` Keeping ${current.name} until you choose.`}`:`No matching QBs. Clear search to see all 20. Keeping ${current.name}.`;
  }
  connectedCallback(){
   if(this.dataset.initialized)return;this.dataset.initialized='true';
   this.players=[...this.control('a').options].map(o=>({id:o.value,name:o.textContent!}));
   for(const side of ['a','b']){
    this.search(side).addEventListener('input',()=>this.filter(side));
    this.querySelector(`[data-clear-search="${side}"]`)!.addEventListener('click',()=>{this.search(side).value='';this.filter(side);this.search(side).focus();});
   }
   this.querySelectorAll('select').forEach(e=>e.addEventListener('change',()=>{for(const side of ['a','b'])this.filter(side);this.render();}));
   this.querySelector('[data-retry]')!.addEventListener('click',()=>this.load());
   this.querySelector('[data-sack-section]')!.addEventListener('toggle',()=>{if(this.data)this.render(false);});
   this.observer=new ResizeObserver(()=>{if(this.data)this.render(false);});
   this.querySelectorAll('[data-chart-host]').forEach(e=>this.observer!.observe(e));this.load();
  }
  disconnectedCallback(){this.observer?.disconnect();this.request++;}
  clear(){
   this.querySelectorAll('svg[data-field]').forEach(s=>{s.replaceChildren();s.setAttribute('hidden','');});
   this.querySelectorAll('[data-selected-values]').forEach(e=>e.replaceChildren());
   this.querySelectorAll('[data-counts],[data-pair-legend]').forEach(e=>e.textContent='');
   this.querySelectorAll<HTMLSelectElement|HTMLInputElement|HTMLButtonElement>('select,input[type=search],[data-clear-search]').forEach(e=>e.disabled=true);
  }
  async load(){
   const restore=this.querySelector('[data-retry]')===document.activeElement,token=++this.request;
   this.data=undefined;this.clear();this.dataset.state='loading';this.querySelector<HTMLButtonElement>('[data-retry]')!.hidden=true;
   this.querySelector('[data-comparison-status]')!.textContent='Checking comparison data…';
   try{
    const responses=await Promise.all([DATA_URL,MANIFEST_URL].map(url=>fetch(url,{cache:'no-store',headers:{Accept:'application/json'}})));
    if(responses.some(r=>!r.ok))throw Error('Data unavailable');
    const[a,b]=await Promise.all(responses.map(r=>r.arrayBuffer()));const data=await validatePair(new Uint8Array(a),new Uint8Array(b));await document.fonts.ready;
    if(token!==this.request||!this.isConnected)return;this.data=data;this.dataset.state='ready';this.querySelectorAll<HTMLSelectElement|HTMLInputElement|HTMLButtonElement>('select,input[type=search],[data-clear-search]').forEach(e=>e.disabled=false);for(const side of ['a','b'])this.filter(side);this.render();if(restore)this.control('a').focus();
   }catch{
    if(token!==this.request)return;this.clear();this.dataset.state='error';this.querySelector('[data-comparison-status]')!.textContent='The comparison data could not be verified. Retry, or open the complete data tables below.';this.querySelector<HTMLButtonElement>('[data-retry]')!.hidden=false;
   }
  }
  render(announce=true){
   if(!this.data)return;
   const pair=['a','b'].map(side=>this.data!.rows.find(r=>r.player_key===this.control(side).value&&r.season===Number(this.control(`season-${side}`).value)));if(!pair[0]||!pair[1])return;
   const rows=pair as Row[];
   this.querySelector('[data-pair-legend]')!.textContent=`Filled circle: A, ${this.label(rows[0])}. Open diamond: B, ${this.label(rows[1])}.`;
   this.querySelectorAll<SVGSVGElement>('svg[data-field]').forEach(svg=>{
    const field=svg.dataset.field!;const optional=svg.closest<HTMLDetailsElement>('[data-sack-section]');if(optional&&!optional.open){svg.replaceChildren();svg.setAttribute('hidden','');return;}
    const width=Math.round(svg.parentElement!.getBoundingClientRect().width);if(width>0)this.draw(svg,rows,field,width);
   });
   for(const field of ['epa_per_dropback','cpoe_pp','sack_avoidance_pct']){
    const region=this.querySelector(`[data-evidence="${field}"]`)!;
    const body=region.querySelector('[data-selected-values]')!;body.replaceChildren();
    rows.forEach((r,i)=>{const tr=document.createElement('tr');tr.append(cell('th',`${i?'B':'A'} · ${this.label(r)}`),cell('td',fmt(r[field])),cell('td',field==='epa_per_dropback'?`${r.dropbacks} dropbacks in ${r.dropback_games} games`:field==='cpoe_pp'?`${r.eligible_throws} included throws in ${r.eligible_games} games`:`${r.sacks} sacks / ${r.dropbacks} dropbacks in ${r.dropback_games} games`));
     if(field==='epa_per_dropback')tr.append(cell('td',`${fmt(r.epa_lower)} to ${fmt(r.epa_upper)}; ${String(r.epa_interval_status).replaceAll('_',' ')}`));body.append(tr);});
   }
   this.querySelector('[data-counts="epa"]')!.textContent=rows.map(r=>`${this.label(r)}: ${r.dropbacks} dropbacks`).join(' · ');
   this.querySelector('[data-counts="cpoe"]')!.textContent=rows.map(r=>`${this.label(r)}: ${r.eligible_throws} included throws`).join(' · ');
   if(announce)this.querySelector('[data-comparison-status]')!.textContent=`${this.label(rows[0])} versus ${this.label(rows[1])}`;
  }
  draw(svg:SVGSVGElement,rows:Row[],field:string,width:number){
   const domain=this.data!.domains[field],metric=METRICS[field],L=18,R=width-18,axisY=128,x=(v:number)=>L+(v-domain.min!)/(domain.max!-domain.min!)*(R-L);
   svg.replaceChildren();svg.removeAttribute('hidden');svg.setAttribute('viewBox',`0 0 ${width} 162`);
   const id=svg.id;svg.append(element('title',{id:id+'-title'},`${field==='epa_per_dropback'?'Value per dropback':field==='cpoe_pp'?'Completions above expectation':'Dropbacks without a sack'}: ${this.label(rows[0])} versus ${this.label(rows[1])}`));
   svg.append(element('desc',{id:id+'-description'},rows.map(r=>`${this.label(r)}: ${fmt(r[field])} ${metric.unitLabel}`).join('; ')+'. Values and counts are also in the following table.'));
   const line=(x1:number,y1:number,x2:number,y2:number,cls:string)=>svg.append(element('line',{x1,y1,x2,y2,class:cls}));
   const text=(px:number,py:number,t:string,anchor='start',cls='')=>svg.append(element('text',{x:px,y:py,'text-anchor':anchor,class:cls},t));
   const hasZero=domain.min!<=0&&domain.max!>=0;if(hasZero)line(x(0),29,x(0),111,'zero');
   rows.forEach((r,i)=>{const nameY=20+i*54,py=40+i*54,v=Number(r[field]);text(L,nameY,this.label(r));text(R,nameY,fmt(v),'end','value');
    if(metric.lower&&typeof r[metric.lower]==='number'&&typeof r[metric.upper!]==='number'){
     const lo=x(Number(r[metric.lower])),hi=x(Number(r[metric.upper!]));line(lo,py,hi,py,`interval ${i?'series-b':'series-a'}`);line(lo,py-5,lo,py+5,`interval ${i?'series-b':'series-a'}`);line(hi,py-5,hi,py+5,`interval ${i?'series-b':'series-a'}`);
    }
    const px=x(v);const mark=i?element('path',{d:`M ${px} ${py-6} l 6 6 l -6 6 l -6 -6 Z`,class:'mark-b'}):element('circle',{cx:px,cy:py,r:6,class:'mark-a'});mark.append(element('title',{},`${i?'B':'A'} ${this.label(r)}: ${fmt(v)}`));svg.append(mark);
   });
   line(L,axisY,R,axisY,'axis');const span=domain.max!-domain.min!;let ticks=[domain.min!,domain.min!+span/2,domain.max!];if(hasZero){ticks=ticks.filter(v=>v===domain.min||v===domain.max||Math.abs(v)/span>.17);if(!ticks.includes(0))ticks.push(0);}
   for(const value of ticks){line(x(value),axisY,x(value),axisY+5,'axis');text(x(value),axisY+25,fmt(value,2),value===domain.min?'start':value===domain.max?'end':'middle','tick');}
   svg.dataset.domain=`${domain.min},${domain.max}`;
  }
 }
 customElements.define('nfl-comparison',NFLComparison);
}
