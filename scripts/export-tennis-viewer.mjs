import os from 'node:os';
// Display-only export: read the approved aggregate viewer; never execute analysis runners.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const sourceRoot=process.env.TENNIS_ANALYSIS_ROOT||path.join(os.homedir(),'Documents','GitHub','tennis-analytics');
const expected={commit:'524cee99fa8856866536a29d1b32bc5a647b2ba1',html:'a7d65eb32f5c0395316f851adf5deea1d8662a5b2411d1789328d779ca7ad7f7',data:'123263579bec1b88d2bfab604ea7977cb5ef323add6ca89f5db10b4dc913de34',context:'f43021f0244b2f1145b48aca803abe6296bd68122a23dcd4ced0164e27c352dd',readme:'2c2a5961a2761eea35b4143e9cab1d23200f49d72fc0ced56bb09f5a326e8444'};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
// The approved viewer stays pinned; only the separately audited privacy metadata may follow it.
execFileSync('git',['merge-base','--is-ancestor',expected.commit,'HEAD'],{cwd:sourceRoot});
const privacyOnly=new Set(['.gitignore','README.md','AGENTS.md','AGENTS.override.md','CLAUDE.md','PROJECT_CONTEXT.md','docs/status.md','docs/codex-task-template.md']);
const changed=execFileSync('git',['diff','--name-only',expected.commit],{cwd:sourceRoot,encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert.ok(changed.every(file=>privacyOnly.has(file)),'Analysis differs beyond the audited privacy metadata');
const html=fs.readFileSync(path.join(sourceRoot,'data/pilot/mcp-modern-point-phase-viewer-v1.html'),'utf8');
assert.equal(sha(html),expected.html,'Viewer fingerprint mismatch');
const encoded=id=>html.match(new RegExp('<script id="'+id+'" type="application/json">([\\s\\S]*?)</script>'))[1];
assert.equal(sha(encoded('frozen-data')),expected.data);assert.equal(sha(encoded('frozen-context')),expected.context);
const readme=fs.readFileSync(path.join(sourceRoot,'data/raw/reference/mcp-stage1-README.md'));
assert.equal(readme.length,4805);assert.equal(sha(readme),expected.readme);
const blob=crypto.createHash('sha1').update(Buffer.from('blob '+readme.length+'\0')).update(readme).digest('hex');
assert.equal(blob,'4615df62170830f15bd84876c26ccf20e56437d0');
assert.match(readme.toString(),/Non-commercial use only/);
const data=JSON.parse(encoded('frozen-data')),context=JSON.parse(encoded('frozen-context'));
const upstream='https://github.com/JeffSackmann/tennis_MatchChartingProject/tree/1813a1309b7ed7ebf1c7e884b32bf675d00e4edf';
const license='https://creativecommons.org/licenses/by-nc-sa/4.0/';
const attribution={creator:'The Tennis Abstract Match Charting Project; Jeff Sackmann and contributors',source:upstream,license,notice:'/tennis-mcp-notice.txt'};
const peers=data.profiles.filter(g=>g.meta.aggregation_level==='POOLED_PLAYER');
assert.equal(peers.length,450);assert.equal(data.profiles.length,2972);assert.equal(context.length,2972);
const index={version:'TENNIS_PORTFOLIO_DISPLAY_1.0.0',attribution,players:[],coverage:data.coverage.filter(c=>c.aggregation_level==='CATEGORY')};
const files=[];
function write(name,value){const bytes=JSON.stringify(value)+'\n';const dest=path.join('public/data',name);if(fs.existsSync(dest))assert.equal(fs.readFileSync(dest,'utf8'),bytes,'Refuse differing existing aggregate: '+name);else fs.writeFileSync(dest,bytes);return {file:name,bytes:Buffer.byteLength(bytes),sha256:sha(bytes)}}
for(const peer of peers){const {category,player}=peer.meta;
 const match=g=>g.meta.category===category&&g.meta.player===player;
 const profiles=data.profiles.filter(match),contexts=context.filter(match),ids=new Set(profiles.map(g=>g.meta.match_id));
 const coverage=data.coverage.filter(c=>c.aggregation_level==='MATCH'&&c.category===category&&ids.has(c.match_id));
 const filename='tennis-viewer-v1-'+sha(category+'\0'+player)+'.json';
 const packet={version:index.version,attribution,profiles,context:contexts,coverage};
 const record=write(filename,packet);files.push(record);
 index.players.push({category,player,file:'/data/'+filename,hidden:category==='ATP'&&player==='Dominik Koepfer'});
 // Encoding must preserve every field, null, identity and numeric value.
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join('public/data',filename),'utf8')),packet);
}
index.players.sort((a,b)=>a.category.localeCompare(b.category)||a.player.localeCompare(b.player));
files.push(write('tennis-viewer-index-v1.json',index));
const sourceBuilder=fs.readFileSync(path.join(sourceRoot,'R/build_mcp_modern_point_phase_viewer.R'),'utf8');
const definitions=JSON.parse(sourceBuilder.match(/const definitionCopy=([\s\S]*?);\nconst phaseTerms/)[1]);
assert.equal(Object.keys(definitions).length,37);
const manifest={version:index.version,analysis_commit:expected.commit,verified_remote_analysis_head:'dbb1ca880b971f9acc38097deaeeaf4624de1ba9',source_revision:'1813a1309b7ed7ebf1c7e884b32bf675d00e4edf',source_readme_sha256:expected.readme,source_html_sha256:expected.html,source_payload_sha256:expected.data,source_context_sha256:expected.context,publication_rights:'OWNER_NONCOMMERCIAL_INTENDED_USE_DECISION',checked_date:'2026-10-13',attribution,files,publication_decision:{"decided_by":"Narayan Lekhi","date":"2026-10-13","website":"https://www.nslanalytics.com/","basis":"Personal portfolio for sharing independent student research; no monetization or financial benefit. Intended purpose, rather than free hosting, is the basis for the noncommercial-use decision.","rights_holder_permission":false,"guarantee_against_complaints":false}};
write('tennis-viewer-manifest-v1.json',manifest);
const copy={definitions,intro:html.match(/<p class="intro">([\s\S]*?)<\/p>/)[1],guide:html.match(/<section class="guide"[\s\S]*?<p>([\s\S]*?)<\/p><\/section>/)[1],limitations:html.match(/<section class="section limitations"[\s\S]*?<ul>([\s\S]*?)<\/ul><\/section>/)[1],methodology:html.match(/<details id="methodology"><summary>Methodology<\/summary>([\s\S]*?)<details><summary>Technical identifiers/)[1],render_script:html.match(/<\/script><script>([\s\S]*?)<\/script>/)[1]};
// The copy/reference file is build input, never a public raw-data release.
const copyFile='scripts/tennis-viewer-copy.json';const text=JSON.stringify(copy,null,2)+'\n';if(fs.existsSync(copyFile))assert.equal(fs.readFileSync(copyFile,'utf8'),text);else fs.writeFileSync(copyFile,text);
console.log(JSON.stringify({players:index.players.length,views:data.profiles.length,selectable:index.players.filter(p=>!p.hidden).length,indexBytes:files.at(-1).bytes,maxPlayerBytes:Math.max(...files.slice(0,-1).map(f=>f.bytes)),totalBytes:files.reduce((n,f)=>n+f.bytes,0),publicationRights:manifest.publication_rights}));
