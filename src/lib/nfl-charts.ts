import {DATA_URL,MANIFEST_URL,validatePair,METRICS,fmt,type Payload,type Row,type Domain} from './nfl-comparison';
import {ANNUAL_URL,ANNUAL_MANIFEST_URL,DEPTH_URL,DEPTH_MANIFEST_URL,validateAnnualDepth,type AnnualPayload,type DepthPayload,type AnnualRow,type DepthRow} from './nfl-annual';
const NS='http://www.w3.org/2000/svg';
function element(tag:string,attrs:Record<string,string|number>={},text?:string){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e;}
function cell(tag:string,text:string){const e=document.createElement(tag);e.textContent=text;if(tag==='th')e.setAttribute('scope','row');return e;}
type Axis={trait:string;title:string;label:string[];field?:string;bin?:string;target?:string;unit?:string};
type Selected={side:'a'|'b';id:string;name:string;year:number;row?:AnnualRow;legacy?:Row;depth:DepthRow[]};
type Outcome={value:number|null;lower:number|null;upper:number|null;status:string;counts:string;reason:string};
const AXES:Axis[]=[
 {trait:'Arm strength',title:'Arm strength',label:['Arm strength','Not measured']},
 {trait:'Processing',title:'Processing',label:['Processing','Not measured']},
 {trait:'Pocket presence',title:'Dropbacks without a sack',label:['Dropbacks without','a sack (%)','Outcome proxy'],field:'sack_avoidance_pct',target:'nfl-definition-sack-avoidance',unit:'%'},
 {trait:'Mobility',title:'Scramble contribution',label:['Scramble contribution','Expected points','per included QB play'],field:'scramble_contribution',target:'nfl-definition-runs',unit:'expected points per included QB play'},
 {trait:'Short accuracy',title:'Short completions above expectation',label:['Short completions','above expectation','(percentage points)'],field:'short_cpoe_pp',bin:'short',target:'nfl-definition-depth',unit:'pp'},
 {trait:'Medium accuracy',title:'Medium completions above expectation',label:['Medium completions','above expectation','(percentage points)'],field:'medium_cpoe_pp',bin:'medium',target:'nfl-definition-depth',unit:'pp'},
 {trait:'Deep accuracy',title:'Deep completions above expectation',label:['Deep completions','above expectation','(percentage points)'],field:'deep_cpoe_pp',bin:'deep',target:'nfl-definition-depth',unit:'pp'},
];
export function registerNFL(){
 if(customElements.get('nfl-comparison'))return;
 class NFLComparison extends HTMLElement{
  annual?:AnnualPayload;depth?:DepthPayload;legacy?:Payload;observer?:ResizeObserver;request=0;players:{id:string;name:string}[]=[];
  control(key:string){return this.querySelector<HTMLSelectElement>(`[data-${key}]`)!;}
  search(side:string){return this.querySelector<HTMLInputElement>(`[data-search-${side}]`)!;}
  label(s:Selected){return `${s.name} · ${s.year}`;}
  selected(side:'a'|'b'):Selected{
   const id=this.control(side).value,year=Number(this.control(`season-${side}`).value),name=this.players.find(p=>p.id===id)!.name;
   return {side,id,year,name,row:this.annual!.rows.find(r=>r.player_key===id&&r.season===year),legacy:this.legacy!.rows.find(r=>r.player_key===id&&r.season===year),depth:this.depth!.rows.filter(r=>r.player_key===id&&r.season===year)};
  }
  missing(s:Selected){return s.year===2011?'2011 source blocked: unresolved duplicate events and air-yard records.':'No eligible player-season record: this year requires at least 200 included throws in ten games.';}
  outcome(s:Selected,a:Axis):Outcome{
   const empty=(reason:string):Outcome=>({value:null,lower:null,upper:null,status:'unavailable',counts:'',reason});
   if(!a.field)return empty(a.trait==='Arm strength'?'Not measured: no accepted throw-velocity measure.':'Not measured: no accepted decision-quality measure.');
   if(!s.row)return empty(this.missing(s));
   if(a.bin){const d=s.depth.find(r=>r.bin===a.bin);if(!d)return empty('No audited depth record.');return {value:d.cpoe_pp,lower:d.lower,upper:d.upper,status:d.interval_status,counts:`${d.bin_throws} throws · ${d.positive_bin_games} games with bin throws / ${d.eligible_games} included-throw games`,reason:d.cpoe_pp===null?'No defined depth outcome.':''};}
   if(a.field==='scramble_contribution'){const r=s.legacy;if(!r)return empty('No audited scramble-value record');return {value:Number(r.scramble_contribution),lower:r.scramble_contribution_lower as number|null,upper:r.scramble_contribution_upper as number|null,status:String(r.scramble_interval_status),counts:`${r.scramble_runs} scrambles / ${r.combined_opportunities} included QB plays · ${r.combined_games} games`,reason:''};}
   return {value:s.row.sack_avoidance_pct,lower:null,upper:null,status:'individual_range_not_estimated',counts:`${s.row.sacks} sacks / ${s.row.dropbacks} recorded dropbacks · ${s.row.dropback_games} games`,reason:''};
  }
  domain(a:Axis):Domain{return a.bin?this.depth!.domains.depth_cpoe_pp:a.field==='scramble_contribution'?this.legacy!.domains.scramble_contribution:this.annual!.domains.sack_avoidance_pct;}
  filter(side:string){
   const select=this.control(side),selected=select.value,query=this.search(side).value.trim().toLocaleLowerCase();
   const matches=this.players.filter(p=>p.name.toLocaleLowerCase().includes(query)),current=this.players.find(p=>p.id===selected)!;
   const keeps=matches.some(p=>p.id===selected),choices=keeps?matches:[current,...matches];select.replaceChildren(...choices.map(p=>new Option(p.name,p.id,false,p.id===selected)));
   this.querySelector(`[data-search-status-${side}]`)!.textContent=!query?`All ${this.players.length} QBs available. Search by name, then choose from the dropdown.`:matches.length?`${matches.length} matching QB${matches.length===1?'':'s'}. Choose from the dropdown.${keeps?'':` Keeping ${current.name} until you choose.`}`:`No matching QBs. Clear search to see all ${this.players.length}. Keeping ${current.name}.`;
  }
  connectedCallback(){
   if(this.dataset.initialized)return;this.dataset.initialized='true';this.players=[...this.control('a').options].map(o=>({id:o.value,name:o.textContent!}));
   for(const side of ['a','b']){this.search(side).addEventListener('input',()=>this.filter(side));this.querySelector(`[data-clear-search="${side}"]`)!.addEventListener('click',()=>{this.search(side).value='';this.filter(side);this.search(side).focus();});}
   this.querySelectorAll('select').forEach(e=>e.addEventListener('change',()=>{for(const side of ['a','b'])this.filter(side);this.render();}));
   this.querySelector('[data-retry]')!.addEventListener('click',()=>this.load());
   this.querySelectorAll('[data-sack-section],[data-comparison-evidence]').forEach(e=>e.addEventListener('toggle',()=>{if(this.annual)this.render(false);}));
   this.observer=new ResizeObserver(()=>{if(this.annual)this.render(false);});this.querySelectorAll('[data-chart-host]').forEach(e=>this.observer!.observe(e));this.load();
  }
  disconnectedCallback(){this.observer?.disconnect();this.request++;}
  clear(){
   this.querySelectorAll('svg[data-field],svg[data-radar]').forEach(s=>{s.replaceChildren();s.setAttribute('hidden','');});
   this.querySelectorAll('[data-selected-values],[data-radar-values],[data-radar-summary],[data-depth-summary],[data-selected-depth]').forEach(e=>e.replaceChildren());
   this.querySelectorAll('[data-counts],[data-pair-legend],[data-radar-legend],[data-radar-counts],[data-radar-gaps],[data-availability-a],[data-availability-b]').forEach(e=>e.textContent='');
   this.querySelector('[data-radar-a]')!.textContent='Quarterback A';this.querySelector('[data-radar-b]')!.textContent='Quarterback B';
   this.querySelectorAll<HTMLSelectElement|HTMLInputElement|HTMLButtonElement>('select,input[type=search],[data-clear-search]').forEach(e=>e.disabled=true);
  }
  async load(){
   const restore=this.querySelector('[data-retry]')===document.activeElement,token=++this.request;
   this.annual=undefined;this.depth=undefined;this.legacy=undefined;this.clear();this.dataset.state='loading';this.querySelector<HTMLButtonElement>('[data-retry]')!.hidden=true;this.querySelector('[data-comparison-status]')!.textContent='Checking comparison data…';
   try{
    const responses=await Promise.all([ANNUAL_URL,ANNUAL_MANIFEST_URL,DEPTH_URL,DEPTH_MANIFEST_URL,DATA_URL,MANIFEST_URL].map(url=>fetch(url,{cache:'no-store',headers:{Accept:'application/json'}})));
    if(responses.some(r=>!r.ok))throw Error('Data unavailable');const bytes=await Promise.all(responses.map(async r=>new Uint8Array(await r.arrayBuffer())));
    const [{annual,depth},legacy]=await Promise.all([validateAnnualDepth(bytes[0],bytes[1],bytes[2],bytes[3]),validatePair(bytes[4],bytes[5])]);await document.fonts.ready;
    if(token!==this.request||!this.isConnected)return;this.annual=annual;this.depth=depth;this.legacy=legacy;this.dataset.state='ready';
    this.querySelectorAll<HTMLSelectElement|HTMLInputElement|HTMLButtonElement>('select,input[type=search],[data-clear-search]').forEach(e=>e.disabled=false);for(const side of ['a','b'])this.filter(side);this.render();if(restore)this.control('a').focus();
   }catch{if(token!==this.request)return;this.clear();this.dataset.state='error';this.querySelector('[data-comparison-status]')!.textContent='The comparison data could not be verified. Retry, or open the complete annual and original-cohort tables below.';this.querySelector<HTMLButtonElement>('[data-retry]')!.hidden=false;}
  }
  render(announce=true){
   if(!this.annual||!this.depth||!this.legacy)return;const pair=[this.selected('a'),this.selected('b')];
   pair.forEach(s=>{this.querySelector(`[data-availability-${s.side}]`)!.textContent=s.row?'':`${s.side.toUpperCase()} · ${this.label(s)}: ${this.missing(s)} The selection is retained.`;});
   this.drawRadar(pair);this.renderEvidence(pair);
   this.querySelectorAll<SVGSVGElement>('svg[data-field]').forEach(svg=>{const main=svg.closest<HTMLDetailsElement>('[data-comparison-evidence]'),sack=svg.closest<HTMLDetailsElement>('[data-sack-section]');if(!main?.open||(sack&&!sack.open)){svg.replaceChildren();svg.setAttribute('hidden','');return;}const width=Math.round(svg.parentElement!.getBoundingClientRect().width);if(width>0)this.draw(svg,pair,svg.dataset.field!,width);});
   for(const field of ['epa_per_dropback','cpoe_pp','sack_avoidance_pct']){
    const body=this.querySelector(`[data-evidence="${field}"] [data-selected-values]`)!;body.replaceChildren();
    pair.forEach(s=>{const tr=document.createElement('tr');tr.append(cell('th',`${s.side.toUpperCase()} · ${this.label(s)}`));const r=s.row;if(!r){tr.append(cell('td','Unavailable'),cell('td',this.missing(s)));if(field==='epa_per_dropback')tr.append(cell('td','Unavailable'));}else{tr.append(cell('td',fmt(r[field])),cell('td',field==='cpoe_pp'?`${r.eligible_throws} throws in ${r.eligible_games} games`:`${r.dropbacks} dropbacks in ${r.dropback_games} games${field==='sack_avoidance_pct'?`; ${r.sacks} sacks`:''}`));if(field==='epa_per_dropback')tr.append(cell('td',`${fmt(r.epa_lower)} to ${fmt(r.epa_upper)}; ${r.epa_interval_status.replaceAll('_',' ')}`));}body.append(tr);});
   }
   for(const [tag,field]of [['epa','dropbacks'],['cpoe','eligible_throws']])this.querySelector(`[data-counts="${tag}"]`)!.textContent=pair.map(s=>`${s.side.toUpperCase()} · ${this.label(s)}: ${s.row?`${s.row[field]} ${tag==='epa'?'dropbacks':'included throws'}`:'Unavailable'}`).join(' · ');
   this.querySelector('[data-pair-legend]')!.textContent=`Filled circle: A, ${this.label(pair[0])}. Open diamond: B, ${this.label(pair[1])}.`;
   if(announce)this.querySelector('[data-comparison-status]')!.textContent=pair.map(s=>`${s.side.toUpperCase()} · ${this.label(s)}${s.row?'':' · unavailable'}`).join(' versus ');
  }
  drawRadar(pair:Selected[]){
   const svg=this.querySelector<SVGSVGElement>('[data-radar]')!,width=Math.round(svg.parentElement!.getBoundingClientRect().width);if(width<=0)return;
   const small=width<440,cx=width/2,cy=small?220:258,R=small?Math.min(94,(width-155)/2):Math.min(155,(width-190)/2),height=small?455:510;
   svg.replaceChildren();svg.removeAttribute('hidden');svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
   const point=(i:number,r:number)=>{const angle=-Math.PI/2+i*2*Math.PI/7;return {x:cx+Math.cos(angle)*r,y:cy+Math.sin(angle)*r,angle};};
   const radius=(a:Axis,v:number)=>{const d=this.domain(a);return (v-d.min!)/(d.max!-d.min!)*R;};
   const line=(a:{x:number;y:number},b:{x:number;y:number},attrs:Record<string,string|number>)=>svg.append(element('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,...attrs}));
   svg.append(element('title',{id:'nfl-radar-title'},`Research outcome-proxy radar: ${pair.map(s=>`${s.side.toUpperCase()} · ${this.label(s)}`).join(' versus ')}`));
   svg.append(element('desc',{id:'nfl-radar-description'},'Seven fixed positions. Arm strength and processing are not measured. Actual recorded sack, scramble and short/medium/deep completion-residual outcomes are proxies, not isolated traits. Each available side plots independently; unavailable points are absent. Only adjacent available positions connect. '+pair.map(s=>`${s.side.toUpperCase()} · ${this.label(s)}: `+AXES.filter(a=>a.field).map(a=>{const o=this.outcome(s,a);return `${a.title}: ${o.value===null?o.reason:fmt(o.value)+' '+a.unit}`;}).join('; ')).join('. ')+'. Counts, marginal ranges and limits follow in the evidence.'));
   for(const f of [.25,.5,.75,1])svg.append(element('circle',{cx,cy,r:R*f,class:'radar-ring'}));
   const positions=[{x:cx,y:small?28:45,anchor:'middle'},{x:width*.8,y:small?90:112,anchor:'middle'},
    {x:width-8,y:small?296:335,anchor:'end'},{x:width*.73,y:small?390:460,anchor:'middle'},
    {x:width*.23,y:small?390:460,anchor:'middle'},{x:8,y:small?296:335,anchor:'start'},{x:width*.2,y:small?90:112,anchor:'middle'}];
   AXES.forEach((a,i)=>{
    line({x:cx,y:cy},point(i,R),{class:'radar-spoke','data-position':i,'data-trait':a.trait});const g=element('g',{'data-axis-label':i,'data-trait':a.trait});a.label.forEach((t,j)=>g.append(element('text',{x:positions[i].x,y:positions[i].y+j*19,'text-anchor':positions[i].anchor,class:(a.field?j<2:j===0)?'radar-label':'radar-status'},t)));svg.append(g);
    if(a.field&&this.domain(a).min!<=0&&this.domain(a).max!>=0){const z=point(i,radius(a,0)),angle=z.angle;line({x:z.x-Math.sin(angle)*4,y:z.y+Math.cos(angle)*4},{x:z.x+Math.sin(angle)*4,y:z.y-Math.cos(angle)*4},{class:'radar-zero','data-zero-field':a.field});svg.append(element('text',{x:z.x+7,y:z.y+12,class:'radar-zero-label'},'0'));}
   });
   pair.forEach(s=>{const outcomes=AXES.map(a=>this.outcome(s,a)),series=`series-${s.side}`;
    for(let i=0;i<AXES.length-1;i++){const a=outcomes[i],b=outcomes[i+1];if(a.value!==null&&b.value!==null)line(point(i,radius(AXES[i],a.value)),point(i+1,radius(AXES[i+1],b.value)),{class:`radar-segment ${series}`,'data-side':s.side,'data-from':i,'data-to':i+1});}
    AXES.forEach((a,i)=>{const o=outcomes[i];if(o.value===null)return;const p=point(i,radius(a,o.value));if(o.lower!==null&&o.upper!==null)line(point(i,radius(a,o.lower)),point(i,radius(a,o.upper)),{class:`radar-range ${series}`,'data-side':s.side,'data-field':a.field!});
     const mark=s.side==='b'?element('path',{d:`M ${p.x} ${p.y-8} l 8 8 l -8 8 l -8 -8 Z`,class:'mark-b radar-mark'}):element('circle',{cx:p.x,cy:p.y,r:4.5,class:'mark-a radar-mark'});
     for(const[k,v]of Object.entries({'data-side':s.side,'data-field':a.field!,'data-value':o.value,'data-radius':radius(a,o.value)}))mark.setAttribute(k,String(v));mark.append(element('title',{},`${s.side.toUpperCase()} · ${this.label(s)} · ${a.title}: ${fmt(o.value)} ${a.unit}`));svg.append(mark);
    });
   });
   svg.dataset.domains=JSON.stringify(Object.fromEntries(AXES.filter(a=>a.field).map(a=>[a.field,{min:this.domain(a).min,max:this.domain(a).max}])));
  }
  renderEvidence(pair:Selected[]){
   const body=this.querySelector('[data-radar-values]')!;body.replaceChildren();
   AXES.forEach((a,i)=>{const tr=document.createElement('tr'),th=cell('th',''),title=document.createElement(a.target?'a':'strong');tr.dataset.position=String(i);tr.dataset.trait=a.trait;title.textContent=a.title;if(a.target)title.setAttribute('href','#'+a.target);th.append(title);if(a.field){const mapping=document.createElement('small');mapping.textContent=`Desired trait: ${a.trait.toLowerCase()}, not directly measured. Shown: ${a.bin?'depth residual':'recorded outcome'} proxy.`;th.append(mapping);}tr.append(th);
    pair.forEach(s=>{const td=cell('td',''),o=this.outcome(s,a);td.dataset.player=`${s.side.toUpperCase()} · ${this.label(s)}`;const value=document.createElement('strong');value.textContent=o.value===null?o.reason:`${fmt(o.value,a.field==='sack_avoidance_pct'?1:3)} ${a.unit}`;td.append(value);if(o.value!==null){td.dataset.value=String(o.value);const count=document.createElement('small'),range=document.createElement('small'),bounds=document.createElement('small'),d=this.domain(a);count.textContent=o.counts;range.textContent=o.lower!==null?`${fmt(o.lower)} to ${fmt(o.upper)} ${a.unit}; ${o.status.replaceAll('_',' ')}`:`Range: ${o.status.replaceAll('_',' ')}`;bounds.textContent=`Exact display bounds: ${d.min} to ${d.max} ${a.unit}.`;td.dataset.domain=`${d.min},${d.max}`;td.append(count,range,bounds);}tr.append(td);});body.append(tr);
   });
   const top=this.querySelector('[data-radar-summary]')!,depth=this.querySelector('[data-depth-summary]')!;top.replaceChildren();depth.replaceChildren();
   for(const a of AXES.filter(a=>a.field)){
    const section=document.createElement('section');section.className='outcome';section.dataset.outcome=a.field;
    const heading=document.createElement('h3'),unit=document.createElement('p'),list=document.createElement('dl'),bounds=document.createElement('p');heading.textContent=a.title;unit.className='outcome-unit';unit.textContent=a.bin?`${a.bin==='short'?'0 to under 10':a.bin==='medium'?'10 to under 20':'20 to under 70'} air yards · percentage points. Residual outcome proxy, not isolated accuracy.`:a.field==='sack_avoidance_pct'?'Percent of recorded dropbacks. Outcome proxy; pocket presence is not directly measured.':'Shared expected points from scrambles per included QB play. Outcome proxy; mobility is not directly measured.';
    pair.forEach(s=>{const o=this.outcome(s,a),row=document.createElement('div'),name=document.createElement('dt'),value=document.createElement('dd'),detail=document.createElement('p');row.className='outcome-player';name.textContent=`${s.side.toUpperCase()} · ${this.label(s)}`;value.dataset.side=s.side;detail.className='outcome-detail';if(o.value===null){value.textContent='Unavailable';value.className='unavailable';detail.textContent=o.reason;}else{value.dataset.value=String(o.value);value.textContent=fmt(o.value,a.field==='sack_avoidance_pct'?1:3)+(a.field==='sack_avoidance_pct'?'%':a.bin?' pp':'');detail.textContent=o.counts+(o.lower!==null?` · range ${fmt(o.lower,2)} to ${fmt(o.upper,2)}`:' · range not estimated');}row.append(name,value,detail);list.append(row);});
    const d=this.domain(a),sack=a.field==='sack_avoidance_pct';bounds.className='outcome-bounds';bounds.textContent=`Center ${fmt(d.min,sack?1:3)}${sack?'%':''} · rim ${fmt(d.max,sack?1:3)}${sack?'%':' · zero 0'}`;section.append(heading,unit,list,bounds);(a.bin?depth:top).append(section);
   }
   this.querySelector('[data-radar-gaps]')!.textContent='Arm strength and processing: not measured for either selection. '+pair.map(s=>{const available=AXES.filter(a=>this.outcome(s,a).value!==null).length;return `${s.side.toUpperCase()} · ${this.label(s)}: ${available} recorded outcomes, ${7-available} gaps.`;}).join(' ')+' A gap means unavailable evidence, not a low rating.';
   this.querySelector('[data-radar-a]')!.textContent=`A · ${this.label(pair[0])}`;this.querySelector('[data-radar-b]')!.textContent=`B · ${this.label(pair[1])}`;this.querySelector('[data-radar-legend]')!.textContent=pair.map(s=>`${s.side.toUpperCase()} · ${this.label(s)}`).join(' / ');this.querySelector('[data-radar-counts]')!.textContent='Depth outcomes use one shared percentage-point scale. Scramble values exist only for the original audited 20-ID, two-season cohort.';
   const selected=this.querySelector('[data-selected-depth]')!;selected.replaceChildren();pair.forEach(s=>{if(!s.row){const tr=document.createElement('tr');tr.append(cell('th',`${s.side.toUpperCase()} · ${this.label(s)}`),cell('td','Unavailable'),cell('td',this.missing(s)),cell('td','Unavailable'));selected.append(tr);return;}s.depth.forEach(r=>{const tr=document.createElement('tr');tr.dataset.side=s.side;tr.dataset.bin=r.bin;tr.append(cell('th',`${s.side.toUpperCase()} · ${this.label(s)} · ${r.bin} [${r.air_yards_lower}, ${r.air_yards_upper})`),cell('td',fmt(r.cpoe_pp)),cell('td',`${r.bin_throws} throws; ${r.positive_bin_games} positive-bin games / ${r.eligible_games} all E games`),cell('td',`${fmt(r.lower)} to ${fmt(r.upper)} pp; ${r.interval_status.replaceAll('_',' ')}`));selected.append(tr);});});
  }
  draw(svg:SVGSVGElement,pair:Selected[],field:string,width:number){
   const domain=this.annual!.domains[field],metric=METRICS[field],L=18,R=width-18,axisY=150,x=(v:number)=>L+(v-domain.min!)/(domain.max!-domain.min!)*(R-L);
   svg.replaceChildren();svg.removeAttribute('hidden');svg.setAttribute('viewBox',`0 0 ${width} 186`);const id=svg.id;
   svg.append(element('title',{id:id+'-title'},`${field==='epa_per_dropback'?'Value per dropback':field==='cpoe_pp'?'Completions above expectation':'Dropbacks without a sack'}: ${pair.map(s=>this.label(s)).join(' versus ')}`));svg.append(element('desc',{id:id+'-description'},pair.map(s=>`${s.side.toUpperCase()} · ${this.label(s)}: ${s.row?fmt(s.row[field])+' '+metric.unitLabel:this.missing(s)}`).join('; ')+'. Available points are shown independently; no difference statistic is calculated.'));
   const line=(x1:number,y1:number,x2:number,y2:number,cls:string)=>svg.append(element('line',{x1,y1,x2,y2,class:cls}));const text=(px:number,py:number,t:string,anchor='start',cls='')=>svg.append(element('text',{x:px,y:py,'text-anchor':anchor,class:cls},t));const hasZero=domain.min!<=0&&domain.max!>=0;if(hasZero)line(x(0),35,x(0),138,'zero');
   pair.forEach((s,i)=>{const nameY=20+i*67,py=48+i*67; text(L,nameY,`${s.side.toUpperCase()} · ${this.label(s)}`);if(!s.row){text(L,py,'Unavailable','start','value');return;}const r=s.row,v=Number(r[field]);text(R,py,fmt(v),'end','value');if(metric.lower&&typeof r[metric.lower]==='number'&&typeof r[metric.upper!]==='number'){const lo=x(Number(r[metric.lower])),hi=x(Number(r[metric.upper!]));line(lo,py,hi,py,`interval series-${s.side}`);line(lo,py-5,lo,py+5,`interval series-${s.side}`);line(hi,py-5,hi,py+5,`interval series-${s.side}`);}const px=x(v),mark=i?element('path',{d:`M ${px} ${py-6} l 6 6 l -6 6 l -6 -6 Z`,class:'mark-b'}):element('circle',{cx:px,cy:py,r:6,class:'mark-a'});mark.dataset.side=s.side;mark.dataset.value=String(v);mark.append(element('title',{},`${s.side.toUpperCase()} · ${this.label(s)}: ${fmt(v)}`));svg.append(mark);});
   line(L,axisY,R,axisY,'axis');const span=domain.max!-domain.min!;let ticks=[domain.min!,domain.min!+span/2,domain.max!];if(hasZero){ticks=ticks.filter(v=>v===domain.min||v===domain.max||Math.abs(v)/span>.17);if(!ticks.includes(0))ticks.push(0);}for(const v of ticks){line(x(v),axisY,x(v),axisY+5,'axis');text(x(v),axisY+25,fmt(v,2),v===domain.min?'start':v===domain.max?'end':'middle','tick');}svg.dataset.domain=`${domain.min},${domain.max}`;
  }
 }
 customElements.define('nfl-comparison',NFLComparison);
}
