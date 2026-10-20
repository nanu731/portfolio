import {DATA_URL,MANIFEST_URL,validatePair,METRICS,fmt,type Payload,type Row} from './nfl-comparison';
const NS='http://www.w3.org/2000/svg';
function element(tag:string,attrs:Record<string,string|number>={},text?:string){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e;}
function cell(tag:string,text:string){const e=document.createElement(tag);e.textContent=text;if(tag==='th')e.setAttribute('scope','row');return e;}
const RADAR_AXES = [
 {trait:'Arm strength',label:['Arm strength','Not measured'],missing:'Not measured',reason:'No accepted throw-velocity evidence.'},
 {trait:'Processing',label:['Processing','Not measured'],missing:'Not measured',reason:'No accepted decision-quality measurement.'},
 {trait:'Pocket presence',label:['Dropbacks without','a sack (%)','Outcome proxy'],field:'sack_avoidance_pct',target:'nfl-definition-sack-avoidance'},
 {trait:'Mobility',label:['Scramble contribution','Expected points','per included QB play'],field:'scramble_contribution',target:'nfl-definition-runs'},
 {trait:'Short accuracy',label:['Short accuracy','Not yet estimated'],missing:'Not yet estimated',reason:'Depth-specific estimates are pending.'},
 {trait:'Medium accuracy',label:['Medium accuracy','Not yet estimated'],missing:'Not yet estimated',reason:'Depth-specific estimates are pending.'},
 {trait:'Deep accuracy',label:['Deep accuracy','Not yet estimated'],missing:'Not yet estimated',reason:'Depth-specific estimates are pending.'},
];
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
   this.querySelector('[data-comparison-evidence]')!.addEventListener('toggle',()=>{if(this.data)this.render(false);});
   this.observer=new ResizeObserver(()=>{if(this.data)this.render(false);});
   this.querySelectorAll('[data-chart-host]').forEach(e=>this.observer!.observe(e));this.load();
  }
  disconnectedCallback(){this.observer?.disconnect();this.request++;}
  clear(){
   this.querySelectorAll('svg[data-field],svg[data-radar]').forEach(s=>{s.replaceChildren();s.setAttribute('hidden','');});
   this.querySelectorAll('[data-selected-values],[data-radar-values],[data-radar-summary]').forEach(e=>e.replaceChildren());
   this.querySelectorAll('[data-counts],[data-pair-legend],[data-radar-legend],[data-radar-counts]').forEach(e=>e.textContent='');
   this.querySelector('[data-radar-a]')!.textContent='Quarterback A';this.querySelector('[data-radar-b]')!.textContent='Quarterback B';
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
   this.drawRadar(rows);
   this.querySelector('[data-pair-legend]')!.textContent=`Filled circle: A, ${this.label(rows[0])}. Open diamond: B, ${this.label(rows[1])}.`;
   this.querySelectorAll<SVGSVGElement>('svg[data-field]').forEach(svg=>{
    const evidence=svg.closest<HTMLDetailsElement>('[data-comparison-evidence]');if(evidence&&!evidence.open){svg.replaceChildren();svg.setAttribute('hidden','');return;}
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
  radarDomain(field:string){const d=this.data!.domains[field];return {min:d.min!,max:d.max!};}
  drawRadar(rows:Row[]){
   const svg=this.querySelector<SVGSVGElement>('[data-radar]')!,width=Math.round(svg.parentElement!.getBoundingClientRect().width);
   if(width<=0)return;
   const small=width<440,cx=width/2,cy=small?212:250,R=small?Math.min(95,(width-153)/2):Math.min(155,(width-190)/2),height=small?425:490;
   svg.replaceChildren();svg.removeAttribute('hidden');svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
   const point=(i:number,r:number)=>{const angle=-Math.PI/2+i*2*Math.PI/7;return {x:cx+Math.cos(angle)*r,y:cy+Math.sin(angle)*r,angle};};
   const radius=(field:string,v:number)=>{const d=this.radarDomain(field);return (v-d.min)/(d.max-d.min)*R;};
   const line=(a:{x:number;y:number},b:{x:number;y:number},attrs:Record<string,string|number>)=>svg.append(element('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,...attrs}));
   svg.append(element('title',{id:'nfl-radar-title'},`Research outcome-proxy radar: ${this.label(rows[0])} versus ${this.label(rows[1])}`));
   svg.append(element('desc',{id:'nfl-radar-description'},'Seven fixed clockwise positions. Arm strength and processing: not measured. Pocket-presence position shows dropbacks without a sack; mobility position shows scramble contribution, both outcome proxies, not isolated skills. Short, medium and deep accuracy: not yet estimated. Only the two adjacent available positions connect. '+rows.map(r=>`${this.label(r)}: ${fmt(r.sack_avoidance_pct)} percent without a sack; ${fmt(r.scramble_contribution)} EPA per included QB play from scrambles.`).join(' ')+ ' Values in original units follow beside the chart; full counts, ranges, exact bounds and gap reasons are in the optional evidence table.'));
   for(const fraction of [.25,.5,.75,1])svg.append(element('circle',{cx,cy,r:R*fraction,class:'radar-ring'}));
   const positions=[{x:cx,y:small?28:45,anchor:'middle'},{x:width*.8,y:small?88:110,anchor:'middle'},
    {x:width-8,y:small?285:325,anchor:'end'},{x:width*.73,y:small?365:440,anchor:'middle'},
    {x:width*.27,y:small?365:440,anchor:'middle'},{x:8,y:small?285:325,anchor:'start'},
    {x:width*.2,y:small?88:110,anchor:'middle'}];
   RADAR_AXES.forEach((axis,i)=>{
    line({x:cx,y:cy},point(i,R),{class:'radar-spoke','data-position':i,'data-trait':axis.trait});
    const g=element('g',{'data-axis-label':i,'data-trait':axis.trait});
    axis.label.forEach((label,j)=>g.append(element('text',{x:positions[i].x,y:positions[i].y+j*19,'text-anchor':positions[i].anchor,class:(axis.field?j<2:j===0)?'radar-label':'radar-status'},label)));svg.append(g);
    if(axis.field==='scramble_contribution'){const z=point(i,radius(axis.field,0)),angle=z.angle;line({x:z.x-Math.sin(angle)*4,y:z.y+Math.cos(angle)*4},{x:z.x+Math.sin(angle)*4,y:z.y-Math.cos(angle)*4},{class:'radar-zero','data-zero-field':axis.field});svg.append(element('text',{x:z.x+7,y:z.y+12,class:'radar-zero-label'},'0'));}
   });
   rows.forEach((r,side)=>{
    const series=side?'series-b':'series-a';
    for(let i=0;i<RADAR_AXES.length-1;i++){
     const a=RADAR_AXES[i].field,b=RADAR_AXES[i+1].field;
     if(a&&b)line(point(i,radius(a,Number(r[a]))),point(i+1,radius(b,Number(r[b]))),{class:`radar-segment ${series}`,'data-side':side?'b':'a','data-from':i,'data-to':i+1});
    }
    RADAR_AXES.forEach((axis,i)=>{
     if(!axis.field)return;const field=axis.field,p=point(i,radius(field,Number(r[field])));
     if(field==='scramble_contribution'&&typeof r.scramble_contribution_lower==='number'&&typeof r.scramble_contribution_upper==='number'){
      const lo=point(i,radius(field,r.scramble_contribution_lower)),hi=point(i,radius(field,r.scramble_contribution_upper));line(lo,hi,{class:`radar-range ${series}`,'data-side':side?'b':'a'});
     }
     const mark=side?element('path',{d:`M ${p.x} ${p.y-8} l 8 8 l -8 8 l -8 -8 Z`,class:'mark-b radar-mark'}):element('circle',{cx:p.x,cy:p.y,r:4.5,class:'mark-a radar-mark'});
     mark.setAttribute('data-side',side?'b':'a');mark.setAttribute('data-field',field);mark.setAttribute('data-value',String(r[field]));mark.setAttribute('data-radius',String(radius(field,Number(r[field]))));
     mark.append(element('title',{},`${side?'B':'A'} · ${this.label(r)} · ${field==='sack_avoidance_pct'?'Dropbacks without a sack':'Scramble contribution'}: ${fmt(r[field])} ${field==='sack_avoidance_pct'?'%':'EPA/O'}`));svg.append(mark);
    });
   });
   const body=this.querySelector('[data-radar-values]')!;body.replaceChildren();
   RADAR_AXES.forEach((axis,i)=>{
    const tr=document.createElement('tr'),th=cell('th','');tr.dataset.position=String(i);tr.dataset.trait=axis.trait;
    const title=document.createElement(axis.field?'a':'strong');title.textContent=axis.field?(axis.field==='sack_avoidance_pct'?'Dropbacks without a sack (%)':'Scramble contribution (EPA/O)'):axis.trait;
    if(axis.target)title.setAttribute('href','#'+axis.target);th.append(title);
    if(axis.field){const mapping=document.createElement('small');mapping.textContent=`Desired trait: ${axis.trait.toLowerCase()}, not directly measured. Shown: outcome proxy.`;th.append(mapping);}
    tr.append(th);
    rows.forEach((r,side)=>{
     const td=cell('td','');td.dataset.player=`${side?'B':'A'} · ${this.label(r)}`;
     if(!axis.field){const status=document.createElement('strong');status.textContent=axis.missing!;const reason=document.createElement('small');reason.textContent=`${axis.reason} No value for ${r.season}.`;td.append(status,reason);}
     else{
      const strong=document.createElement('strong'),count=document.createElement('small'),range=document.createElement('small'),domain=document.createElement('small');
      strong.textContent=`${fmt(r[axis.field],axis.field==='sack_avoidance_pct'?1:3)} ${axis.field==='sack_avoidance_pct'?'%':'EPA/O'}`;
      count.textContent=axis.field==='sack_avoidance_pct'?`${r.sacks} sacks / ${r.dropbacks} recorded dropbacks · ${r.dropback_games} games`:`${r.scramble_runs} scrambles / ${r.combined_opportunities} included QB plays · ${r.scramble_games} scramble games; ${r.combined_games} included-play games`;
      range.textContent=axis.field==='sack_avoidance_pct'?'Individual range not estimated.':`${fmt(r.scramble_contribution_lower)} to ${fmt(r.scramble_contribution_upper)} EPA/O; ${String(r.scramble_interval_status).replaceAll('_',' ')}.`;
      const d=this.radarDomain(axis.field);domain.textContent=`Exact display bounds: ${d.min} to ${d.max}. ${axis.field==='sack_avoidance_pct'?'Percent; zero is outside the displayed range.':'Expected points per included QB play; zero reference: 0.'}`;td.dataset.domain=`${d.min},${d.max}`;td.dataset.value=String(r[axis.field]);td.append(strong,count,range,domain);
     }
     tr.append(td);
    });body.append(tr);
   });
   const summary=this.querySelector('[data-radar-summary]')!;summary.replaceChildren();
   for(const field of ['sack_avoidance_pct','scramble_contribution']){
    const sack=field==='sack_avoidance_pct',section=document.createElement('section');section.className='outcome';section.dataset.outcome=field;
    const heading=document.createElement('h3'),unit=document.createElement('p'),mapping=document.createElement('p'),list=document.createElement('dl'),bounds=document.createElement('p');
    heading.textContent=sack?'Dropbacks without a sack':'Scramble contribution';
    unit.className='outcome-unit';unit.textContent=sack?'Percent of recorded passes, sacks and scrambles.':'Shared scoring-outlook change on scrambles, in expected points per included quarterback play.';
    mapping.className='outcome-trait';mapping.textContent=sack?'Outcome proxy; pocket presence is not directly measured.':'Outcome proxy; mobility is not directly measured.';
    rows.forEach((r,i)=>{const pair=document.createElement('div'),name=document.createElement('dt'),value=document.createElement('dd');pair.className='outcome-player';name.textContent=`${i?'B':'A'} · ${this.label(r)}`;value.textContent=fmt(r[field],sack?1:3)+(sack?'%':'');value.dataset.value=String(r[field]);value.dataset.side=i?'b':'a';pair.append(name,value);list.append(pair);});
    const d=this.radarDomain(field);bounds.className='outcome-bounds';bounds.textContent=`Center ${fmt(d.min,sack?1:3)}${sack?'%':''} · rim ${fmt(d.max,sack?1:3)}${sack?'%':' · zero 0'}`;
    section.append(heading,unit,mapping,list,bounds);summary.append(section);
   }
   const gaps=document.createElement('div');gaps.className='evidence-gaps';
   const gapTitle=document.createElement('h3');gapTitle.textContent='Five open positions';
   const unmeasured=document.createElement('p');unmeasured.textContent='Not measured: arm strength and processing. No accepted throw-velocity or decision-quality measures.';
   const pending=document.createElement('p');pending.textContent='Not yet estimated: short, medium and deep accuracy.';
   const applies=document.createElement('p');applies.textContent='These gaps apply to both selected player-seasons. Missing evidence is not a low rating.';
   gaps.append(gapTitle,unmeasured,pending,applies);summary.append(gaps);
   this.querySelector('[data-radar-a]')!.textContent=`A · ${this.label(rows[0])}`;this.querySelector('[data-radar-b]')!.textContent=`B · ${this.label(rows[1])}`;
   this.querySelector('[data-radar-legend]')!.textContent=`A · ${this.label(rows[0])} / B · ${this.label(rows[1])}`;
   this.querySelector('[data-radar-counts]')!.textContent=rows.map(r=>`${this.label(r)}: ${r.dropbacks} dropbacks; ${r.scramble_runs} scrambles in ${r.combined_opportunities} included QB plays`).join(' · ');
   svg.dataset.domains=JSON.stringify(Object.fromEntries(['sack_avoidance_pct','scramble_contribution'].map(f=>[f,this.radarDomain(f)])));
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
