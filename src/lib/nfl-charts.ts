import {DATA_URL,MANIFEST_URL,validatePair,METRICS,PRIMARY,VIEWS,fmt,evidence,interval,studyLabel,composition,type Payload,type Row,type Study,type View} from './nfl-comparison';
const NS='http://www.w3.org/2000/svg';
function svgEl(tag:string,attrs:Record<string,string|number>={},text?:string): SVGElement {
  const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));if(text!==undefined)el.textContent=text;return el;
}
function node(tag:string,text?:string): HTMLElement {const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;}
export function registerNFL() {
  if(customElements.get('nfl-comparison'))return;
  class NFLComparison extends HTMLElement {
    data?: Payload; observer?: ResizeObserver; request=0;
    control(key:string){return this.querySelector<HTMLSelectElement>(`[data-${key}]`)!;}
    get plot(){return this.querySelector<SVGSVGElement>('[data-plot]')!;}
    connectedCallback(){
      if(this.dataset.initialized)return;this.dataset.initialized='true';
      this.querySelectorAll('select').forEach(c=>c.addEventListener('change',()=>this.update()));
      this.querySelector('[data-retry]')!.addEventListener('click',()=>this.load());
      this.observer=new ResizeObserver(()=>{if(this.data)this.update(false)});this.observer.observe(this.querySelector('[data-chart-host]')!);
      this.load();
    }
    disconnectedCallback(){this.observer?.disconnect();this.request++;}
    async load(){
      const restoreFocus=this.querySelector('[data-retry]')===document.activeElement;
      const token=++this.request;this.data=undefined;this.dataset.state='loading';this.plot.replaceChildren();this.plot.toggleAttribute('hidden',true);
      this.querySelector('[data-view-table]')!.replaceChildren();this.querySelectorAll<HTMLSelectElement>('select').forEach(c=>c.disabled=true);
      this.querySelector<HTMLButtonElement>('[data-retry]')!.hidden=true;this.querySelector('[role="status"]')!.textContent='Checking the reviewed comparison data…';
      try {
        const responses=await Promise.all([DATA_URL,MANIFEST_URL].map(url=>fetch(url,{cache:'no-store',headers:{Accept:'application/json'}})));
        if(responses.some(r=>!r.ok))throw new Error('Data request failed');
        const [a,b]=await Promise.all(responses.map(r=>r.arrayBuffer()));const data=await validatePair(new Uint8Array(a),new Uint8Array(b));
        await document.fonts.ready;
        if(token!==this.request || !this.isConnected)return;this.data=data;this.dataset.state='ready';
        this.querySelectorAll<HTMLSelectElement>('select').forEach(c=>c.disabled=false);this.update();if(restoreFocus)this.control('view').focus();
      }catch{
        if(token!==this.request)return;this.dataset.state='error';this.plot.replaceChildren();this.plot.toggleAttribute('hidden',true);
        this.querySelector('[data-view-table]')!.replaceChildren();this.querySelector('[role="status"]')!.textContent='Interactive comparison unavailable: the data could not be verified. Retry the same reviewed files, or read the build-verified tables below.';
        this.querySelector<HTMLButtonElement>('[data-retry]')!.hidden=false;
      }
    }
    update(announce=true){
      if(!this.data)return;const view=this.control('view').value as View;const cfg=VIEWS[view];if(!cfg)return;
      const metric=this.control('metric');for(const o of metric.options){o.hidden=!(cfg.metrics as readonly string[]).includes(o.value);o.disabled=o.hidden;}
      if(!(cfg.metrics as readonly string[]).includes(metric.value))metric.value=cfg.metrics[0];metric.disabled=cfg.metrics.length===1;
      this.control('season').disabled=cfg.annual;
      this.control('a').disabled=view==='study';this.control('b').disabled=view==='study';
      // Both identities remain visible; reject a duplicate pair without swapping a player silently.
      for(const [which,other] of [['a','b'],['b','a']])for(const o of this.control(which).options)o.disabled=o.value===this.control(other).value;
      const a=this.control('a').value,b=this.control('b').value,year=Number(this.control('season').value),field=metric.value;
      const row=(id:string,season:number)=>this.data!.rows.find(r=>r.player_key===id && r.season===season)!;
      const pair=[row(a,year),row(b,year)];if(!pair[0] || !pair[1] || a===b)return;
      this.querySelector('[data-view-heading]')!.textContent=`${cfg.title}${METRICS[field]?' · '+METRICS[field].label:''} · ${cfg.annual?'2023–2024':year}`;
      this.querySelector('[data-description]')!.textContent=cfg.description;
      this.querySelector('[data-control-note]')!.textContent=view==='study'?'These fixed studies use the full 20-passer cohort. Player and single-season controls do not apply.':cfg.annual?'Both 2023 and 2024 apply to this view. The single-season control is inactive.':'Both players share the selected season and measure.';
      this.querySelector<HTMLElement>('[data-identities]')!.hidden=view==='study';
      this.querySelector('[data-identities]')!.textContent=`A: ${pair[0].observed_name} (filled circle) · B: ${pair[1].observed_name} (open diamond)`;
      const unit=METRICS[field]?.unitLabel ?? (view==='study'?'dimensionless correlations; separate paired difference':'percent of combined opportunities');
      this.querySelector('[data-unit]')!.textContent=unit;
      this.querySelector('[data-uncertainty]')!.textContent=METRICS[field]&&!METRICS[field].lower?'Individual uncertainty not estimated.':view==='association'?'Player marginal intervals are in the complete table; the copied study interval describes the annual association.':METRICS[field]?.lower?'Bars show available marginal conditional sensitivities; they do not test player differences or season changes.':'';
      this.plot.replaceChildren();this.plot.toggleAttribute('hidden',false);
      const width=Math.max(260,Math.round(this.querySelector('[data-chart-host]')!.getBoundingClientRect().width));
      if(view==='compare')this.compare(pair,field,width);
      if(view==='change')this.change(a,b,field,width);
      if(view==='association')this.scatter(a,b,field,width,true,year);
      if(view==='usage')this.scatter(a,b,field,width,false,year);
      if(view==='composition')this.parts(pair,width);
      if(view==='study')this.studies(width);
      this.dataset.view=view;this.dataset.metric=field;
      if(announce)this.querySelector('[role="status"]')!.textContent=view==='study'?'Study-level evidence. All ten study rows for the fixed 20-passer cohort shown.':`${cfg.title}. ${pair[0].observed_name} and ${pair[1].observed_name}. ${cfg.annual?'2023 and 2024':year}. ${view==='association'||view==='usage'?'All 20 cohort passers shown.':'Values and evidence follow the chart.'}`;
    }
    setup(w:number,h:number,description:string){
      this.plot.setAttribute('viewBox',`0 0 ${w} ${h}`);this.plot.setAttribute('height',String(h));
      this.plot.append(svgEl('title',{id:'nfl-plot-title'},this.querySelector('[data-view-heading]')!.textContent!),svgEl('desc',{id:'nfl-plot-description'},description));
    }
    text(x:number,y:number,value:string,anchor='start',cls=''){const el=svgEl('text',{x,y,'text-anchor':anchor,class:cls},value) as SVGTextElement;this.plot.append(el);return el;}
    line(x1:number,y1:number,x2:number,y2:number,cls='axis'){this.plot.append(svgEl('line',{x1,y1,x2,y2,class:cls}));}
    mark(x:number,y:number,slot:number,title:string,r=7){
      const attrs=slot===1?{d:`M ${x} ${y-r} l ${r} ${r} l ${-r} ${r} l ${-r} ${-r} Z`,class:'mark-b'}:{cx:x,cy:y,r:slot===2?4:r,class:slot===2?'mark-cohort':'mark-a'};
      const el=svgEl(slot===1?'path':'circle',attrs);el.append(svgEl('title',{},title));this.plot.append(el);
    }
    scale(field:string,start:number,end:number){const d=this.data!.domains[field];return(v:number)=>start+(v-d.min!)/(d.max!-d.min!)*(end-start);}
    ticks(field:string){const d=this.data!.domains[field],span=d.max!-d.min!;let values=[0,1,2,3].map(i=>d.min!+span*i/3);if(d.min!<=0&&d.max!>=0){values=values.filter(v=>v===d.min||v===d.max||Math.abs(v)/span>.12);if(!values.includes(0))values.push(0);}return values;}
    xAxis(field:string,left:number,right:number,y:number){const d=this.data!.domains[field],x=this.scale(field,left,right);this.line(left,y,right,y);
      for(const value of this.ticks(field)){this.line(x(value),y,x(value),y+5);this.text(x(value),y+25,fmt(value,2),value===d.min?'start':value===d.max?'end':'middle','tick');}
    }
    zeroX(field:string,left:number,right:number,top:number,bottom:number){const d=this.data!.domains[field];if(d.min!<=0 && d.max!>=0){const z=this.scale(field,left,right)(0);this.line(z,top,z,bottom,'reference');}}
    table(headers:string[],body:string[][],caption:string){
      const host=this.querySelector('[data-view-table]')!;host.replaceChildren();const t=node('table');t.append(node('caption',caption));
      const head=node('thead'),tr=node('tr');headers.forEach(h=>{const th=node('th',h);th.setAttribute('scope','col');tr.append(th)});head.append(tr);t.append(head);
      const tb=node('tbody');body.forEach(row=>{const tr=node('tr');row.forEach((v,i)=>{const cell=node(i===0?'th':'td',v);if(i===0)cell.setAttribute('scope','row');tr.append(cell)});tb.append(tr)});t.append(tb);host.append(t);
    }
    compare(pair:Row[],f:string,w:number){
      const m=METRICS[f],L=24,R=w-24,x=this.scale(f,L,R);this.setup(w,290,'Two player values and available marginal intervals. Full values, counts and statuses appear in the following table.');this.zeroX(f,L,R,30,220);
      pair.forEach((r,i)=>{const y=75+i*100;this.text(L,y-28,`${i?'B':'A'} · ${r.observed_name}`);if(m.lower && typeof r[m.lower]==='number'){this.line(x(Number(r[m.lower])),y,x(Number(r[m.upper!])),y,`interval ${i?'series-b':'series-a'}`);for(const v of [r[m.lower],r[m.upper!]])this.line(x(Number(v)),y-6,x(Number(v)),y+6,`interval ${i?'series-b':'series-a'}`)}
        if(typeof r[f]==='number'){this.mark(x(Number(r[f])),y,i,`${r.observed_name}: ${fmt(r[f])} ${m.unitLabel}`);this.text(Math.min(R,Math.max(L,x(Number(r[f])))),y+28,fmt(r[f]),x(Number(r[f]))>w/2?'end':'start');}
      });this.xAxis(f,L,R,230);
      this.table(['Player / season',m.label,`Unit: ${m.unitLabel}`,'Counts / denominator','Uncertainty'],pair.map((r,i)=>[`${i?'B':'A'} · ${r.observed_name} · ${r.season}`,fmt(r[f]),m.unitLabel,evidence(r,f),interval(r,f)]),'The two plotted player values and their evidence.');
    }
    change(a:string,b:string,f:string,w:number){
      const m=METRICS[f],L=68,R=w-36,T=38,B=310,y=this.scale(f,B,T);this.setup(w,365,'Observed 2023 and 2024 values for the two selected passers. Lines connect historical points; endpoint intervals do not test changes.');
      const d=this.data!.domains[f];for(const v of this.ticks(f)){this.text(L-10,y(v)+5,fmt(v,2),'end','tick');this.line(L,y(v),R,y(v),v===0?'reference':'grid');}
      if(d.min!<0 && d.max!>0)this.line(L,y(0),R,y(0),'reference');
      const records:Row[]=[];
      [a,b].forEach((id,i)=>{const rows=[2023,2024].map(year=>this.data!.rows.find(r=>r.player_key===id && r.season===year)!);records.push(...rows);
        this.line(L,y(Number(rows[0][f])),R,y(Number(rows[1][f])),i?'trajectory series-b':'trajectory series-a');
        rows.forEach((r,j)=>{const px=j?R:L,py=y(Number(r[f]));if(m.lower && typeof r[m.lower]==='number')this.line(px,y(Number(r[m.lower])),px,y(Number(r[m.upper!])),'interval '+(i?'series-b':'series-a'));
          this.mark(px,py,i,`${i?'B':'A'} ${r.observed_name} ${r.season}: ${fmt(r[f])}`);this.text(px,py+(i?24:-14),`${i?'B':'A'} ${fmt(r[f])}`,j?'end':'start');});
      });this.text(L,344,'2023','middle');this.text(R,344,'2024','middle');
      this.table(['Player / season',m.label,'Counts / denominator','Uncertainty'],records.map(r=>[`${r.observed_name} · ${r.season}`,fmt(r[f]),evidence(r,f),interval(r,f)]),'All four trajectory endpoints.');
    }
    scatter(a:string,b:string,f:string,w:number,annual:boolean,year:number){
      const share=f==='scramble_contribution'?'scramble_share_pct':'nonscramble_share_pct';const xf=annual?f:share,L=65,R=w-25,T=45,B=w<500?330:390,y=this.scale(f,B,T),x=this.scale(xf,L,R);
      this.setup(w,B+82,annual?'All 20 matched passers, 2023 on the horizontal axis and 2024 on the vertical axis.':'All 20 passers, recorded role share on the horizontal axis and contribution on the vertical axis.');
      this.xAxis(xf,L,R,B);this.zeroX(xf,L,R,T,B);const d=this.data!.domains[f];if(d.min!<=0&&d.max!>=0)this.line(L,y(0),R,y(0),'reference');
      for(const v of this.ticks(f)){this.text(L-9,y(v)+5,fmt(v,2),'end','tick');}
      this.text(L,22,annual?'2024':METRICS[f].short);this.text((L+R)/2,B+61,annual?'2023':METRICS[share].short,'middle');
      if(annual)this.line(L,B,R,T,'reference');
      const rows=this.data!.rows.filter(r=>r.season===(annual?2023:year));
      const points=rows.map(r=>({r,target:annual?this.data!.rows.find(t=>t.player_key===r.player_key&&t.season===2024)!:r}));
      // Draw selected marks last; every player still contributes one point.
      const ordered=[...points.filter(p=>p.r.player_key!==a&&p.r.player_key!==b),...points.filter(p=>p.r.player_key===a||p.r.player_key===b)];
      const labels:{el:SVGTextElement;px:number;py:number}[]=[];
      for(const {r,target} of ordered){const px=x(Number(r[xf])),py=y(Number(target[f])),slot=r.player_key===a?0:r.player_key===b?1:2;
        if(!annual && METRICS[f].lower)this.line(px,y(Number(r[METRICS[f].lower!])),px,y(Number(r[METRICS[f].upper!])),'cohort-interval');
        this.mark(px,py,slot,`${r.observed_name}: ${fmt(r[xf])}, ${fmt(target[f])}`,7);
        if(slot!==2){const el=this.text(px,py+(slot===0?-13:24),`${slot?'B':'A'} ${r.observed_name}`,px>(L+R)/2?'end':'start');el.dataset.labelSlot=String(slot);labels.push({el,px,py});}
      }
      // Keep the two direct annotations inside the plot and separate at phone widths.
      const shift=(el:SVGTextElement,dx:number,dy:number)=>{el.setAttribute('x',String(Number(el.getAttribute('x'))+dx));el.setAttribute('y',String(Number(el.getAttribute('y'))+dy));};
      for(const {el} of labels){const b=el.getBBox();shift(el,b.x<L?L-b.x:b.x+b.width>R?R-b.x-b.width:0,b.y<T?T-b.y:b.y+b.height>B-5?B-5-b.y-b.height:0);}
      if(labels.length===2){const a=labels[0].el.getBBox(),b=labels[1].el.getBBox();if(a.x<b.x+b.width&&b.x<a.x+a.width&&a.y<b.y+b.height+8&&b.y<a.y+a.height+8){const below=a.y+a.height+8-b.y;shift(labels[1].el,0,b.y+b.height+below<=B-5?below:a.y-8-b.y-b.height);}}
      for(const {el,px,py}of labels){const box=el.getBBox();const endY=box.y>py?box.y-3:box.y+box.height+3;if(Math.abs(endY-py)>12)this.line(px,py+(endY>py?9:-9),Math.max(box.x,Math.min(box.x+box.width,px)),endY,'label-leader');}
      if(annual){const s=this.data!.study_associations.find(s=>s.analysis==='annual'&&s.metric===f)!;
        this.querySelector('[data-description]')!.textContent=VIEWS.association.description+` Copied annual r = ${fmt(s.estimate)}; conditional interval ${fmt(s.lower)} to ${fmt(s.upper)}. Dashed diagonal marks equal values across years.`;
        this.table(['Passer','2023 value','2023 counts','2024 value','2024 counts'],points.map(({r,target})=>[`${r.player_key===a?'A · ':r.player_key===b?'B · ':''}${r.observed_name}`,fmt(r[f]),evidence(r,f),fmt(target[f]),evidence(target,f)]),`All 20 paired passers. ${METRICS[f].label}, ${METRICS[f].unitLabel}. Individual uncertainty: ${METRICS[f].lower?'see the 40-row table below':'not estimated'}.`);
      }else this.table(['Passer',METRICS[share].short,METRICS[f].short,'Per-run EPA (diagnostic)','Counts / denominator','Marginal interval'],points.map(({r})=>[`${r.player_key===a?'A · ':r.player_key===b?'B · ':''}${r.observed_name}`,fmt(r[share]),fmt(r[f]),fmt(r[f==='scramble_contribution'?'scramble_epa_per_run':'nonscramble_epa_per_run']),evidence(r,f),interval(r,f)]),`All 20 passers in ${year}. Share is percent; contribution is expected points per combined opportunity. Vertical bars are marginal conditional sensitivities.`);
    }
    parts(pair:Row[],w:number){
      this.setup(w,310,'Two 100-percent bars with disjoint recorded categories. Count and percentage for each segment appear in the table.');const L=24,R=w-24;
      const defs=svgEl('defs');const patterns=[['sack-hatch','M0 8L8 0'],['run-hatch','M0 0L8 8']];for(const [id,d]of patterns){const pat=svgEl('pattern',{id,width:8,height:8,patternUnits:'userSpaceOnUse'});pat.append(svgEl('rect',{width:8,height:8,class:'pattern-ground'}),svgEl('path',{d,class:'pattern-line'}));defs.append(pat)}this.plot.append(defs);
      const body:string[][]=[];pair.forEach((r,i)=>{const py=65+i*110;this.text(L,py-18,`${i?'B':'A'} · ${r.observed_name} · O = ${r.combined_opportunities}`);let left=L;
        composition(r).forEach(([label,count],j)=>{const share=100*count/Number(r.combined_opportunities),width=(R-L)*share/100;const rect=svgEl('rect',{x:left,y:py,width,height:44,class:`composition-part part-${j}`});rect.append(svgEl('title',{},`${label}: ${count}, ${fmt(share)}%`));this.plot.append(rect);left+=width;body.push([`${i?'B':'A'} · ${r.observed_name}`,label,String(count),fmt(share),`${r.combined_opportunities} O; ${r.combined_games} O games`]);});
      });this.xAxis('recorded_composition_pct',L,R,260);
      this.table(['Passer','Recorded category','Count','Percent of O','Denominator'],body,'Eight disjoint composition segments. Other D passes exclude recorded sacks and scrambles.');
    }
    studies(w:number){
      const rows=this.data!.study_associations,ordered=[...rows.filter(s=>s.statistic!=='Delta'),...rows.filter(s=>s.statistic==='Delta')],L=24,R=w-24;
      this.setup(w,ordered.length*124+40,'Nine fixed correlation rows on minus one to one, followed by the separate paired difference on minus two to two. All ten rows and conditional intervals have an HTML equivalent.');
      ordered.forEach((s,i)=>{const top=20+i*124,delta=s.statistic==='Delta',field=delta?'study_delta':'study_correlation',x=this.scale(field,L,R);
        const label=studyLabel(s).split(' · ');this.text(L,top+5,label[0]);this.text(L,top+25,label[1],'start','tick');this.text(L,top+45,`${delta?'Δ':'r'} ${fmt(s.estimate)} [${fmt(s.lower)}, ${fmt(s.upper)}]`,'start','tick');
        this.line(L,top+76,R,top+76,'grid');this.line(x(0),top+61,x(0),top+91,'reference');
        if(s.lower!==null&&s.upper!==null)this.line(x(s.lower),top+76,x(s.upper),top+76,'interval series-a');if(s.estimate!==null)this.mark(x(s.estimate),top+76,0,studyLabel(s)+': '+fmt(s.estimate),5);
        const d=this.data!.domains[field];this.text(L,top+105,String(d.min),'start','tick');this.text(x(0),top+105,'0','middle','tick');this.text(R,top+105,String(d.max),'end','tick');
      });
      this.table(['Study / population','Estimate','Conditional interval','Status','Influence / contributing games'],rows.map(s=>[studyLabel(s),fmt(s.estimate),`${fmt(s.lower)} to ${fmt(s.upper)}`,s.status.replaceAll('_',' '),`${s.cohort_count} passers; ${s.contributing_games??'NFL-game count not in this export'}${s.influence?`; player deletion ${fmt(s.influence.actor_deletion_min)} to ${fmt(s.influence.actor_deletion_max)}; ${s.influence.actor_sign_reversals} sign reversals`:''}`]),'All ten study rows. Correlations use −1 to 1. Delta uses −2 to 2. Games are deletion/sampling units, not independent quarterback pairs. Approximate game independence is a working assumption.');
    }
  }
  customElements.define('nfl-comparison',NFLComparison);
}
