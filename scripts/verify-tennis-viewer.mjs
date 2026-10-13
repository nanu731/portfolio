import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.env.TENNIS_ANALYSIS_ROOT||path.join(os.homedir(),'Documents','GitHub','tennis-analytics');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const html=fs.readFileSync(root+'/data/pilot/mcp-modern-point-phase-viewer-v1.html','utf8');
const source=id=>JSON.parse(html.match(new RegExp('<script id="'+id+'" type="application/json">([\\s\\S]*?)</script>'))[1]);
const expected=source('frozen-data'),expectedContext=source('frozen-context');
const index=JSON.parse(fs.readFileSync('public/data/tennis-viewer-index-v1.json'));
const manifest=JSON.parse(fs.readFileSync('public/data/tennis-viewer-manifest-v1.json'));
let checks=0;const check=(value,message)=>{assert(value,message);checks++};
const key=m=>JSON.stringify([m.aggregation_level,m.category,m.player,m.match_id]);
const profiles=new Map(),contexts=new Map(),coverage=new Map();
check(index.players.length===450,'All original player identities');
check(index.players.filter(p=>p.hidden).length===1&&index.players.find(p=>p.hidden).player==='Dominik Koepfer','Exact selector-only hide');
check(index.players.filter(p=>p.category==='ATP'&&!p.hidden).length===227,'Men selectable');check(index.players.filter(p=>p.category==='WTA').length===222,'Women selectable');
for(const file of manifest.files){const bytes=fs.readFileSync('public/data/'+file.file);check(bytes.length===file.bytes,'Pinned bytes '+file.file);check(sha(bytes)===file.sha256,'Pinned hash '+file.file)}
for(const player of index.players){const p=JSON.parse(fs.readFileSync('public'+player.file));
 check(p.attribution.license==='https://creativecommons.org/licenses/by-nc-sa/4.0/','Data-specific license notice');
 for(const r of p.profiles){check(r.meta.player===player.player&&r.meta.category===player.category,'Player linkage');check(!profiles.has(key(r.meta)),'Unique view');profiles.set(key(r.meta),r)}
 for(const r of p.context){check(!contexts.has(key(r.meta)),'Unique context view');contexts.set(key(r.meta),r)}
 for(const r of p.coverage){const k=r.category+'\0'+r.match_id;const old=coverage.get(k);if(old)assert.deepEqual(old,r);coverage.set(k,r)}
}
for(const p of expected.profiles){assert.deepEqual(profiles.get(key(p.meta)),p);checks++}
for(const p of expectedContext){assert.deepEqual(contexts.get(key(p.meta)),p);checks++}
check(profiles.size===2972&&contexts.size===2972,'Every view accounted once');
const allCoverage=[...coverage.values(),...index.coverage];
for(const c of expected.coverage){assert.deepEqual(allCoverage.find(r=>r.aggregation_level===c.aggregation_level&&r.category===c.category&&r.match_id===c.match_id),c);checks++}
check(allCoverage.length===1263,'Every coverage record accounted');
check(!fs.readdirSync('public/data').filter(f=>f.startsWith('tennis-')).some(f=>/point-dispositions|action|raw|membership|state/i.test(f)),'Only aggregate display artifacts');
check(manifest.publication_rights==='OWNER_NONCOMMERCIAL_INTENDED_USE_DECISION','Owner intended-use decision');
check(manifest.publication_decision?.decided_by==='Narayan Lekhi' && manifest.publication_decision.rights_holder_permission===false && manifest.publication_decision.guarantee_against_complaints===false,'No invented provider permission or guarantee');
const notice=fs.readFileSync('public/tennis-mcp-notice.txt','utf8');
check(notice.includes('Jeff Sackmann and contributors') && notice.includes('https://creativecommons.org/licenses/by-nc-sa/4.0/') && notice.includes('not all website code'),'Attribution and scoped ShareAlike notice');
check(notice.includes('INTENDED-USE DECISION') && notice.includes('not permission from the rights holder'),'Decision scope and disclaimer');
for(const name of ['fraunces','source-serif','ibm-plex']){const text=fs.readFileSync('public/'+name+'-license.txt','utf8');check(/Copyright/.test(text)&&/SIL OPEN FONT LICENSE/.test(text),'Full font notice '+name)}
console.log(JSON.stringify({checks,players:profiles.size?450:0,views:profiles.size,coverage:allCoverage.length,result:'PASS',rights:manifest.publication_rights}));
