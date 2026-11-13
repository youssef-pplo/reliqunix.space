'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Check, Compass, Download, Plus, Search, X } from 'lucide-react';
import { relicsData } from '@/data/relicsData';
import { CHALLENGE_URL, challengeResources, resourceMethodology } from '@/data/challengeResources';
import { getModelAsset } from '@/data/modelAssets';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { RelicGlyph } from './ArchiveGlyph';
import MissionEvidence from './MissionEvidence';
import FieldMission from './FieldMission';
import { buildEvidencePack, buildFieldReportHtml } from '@/utils/fieldReport';
import { downloadText } from '@/utils/download';

export default function ArchiveHub() {
  const panel=useReliqunixStore(s=>s.archivePanel),open=useReliqunixStore(s=>s.openArchive);
  const explored=useReliqunixStore(s=>s.exploredRelicIds),answered=useReliqunixStore(s=>s.answeredRelicIds);
  const dialog=useRef<HTMLDialogElement>(null);
  const body=useRef<HTMLDivElement>(null);
  const [world,setWorld]=useState('ALL'),[query,setQuery]=useState('');
  useEffect(()=>{const el=dialog.current;if(!el)return;if(panel&&!el.open)el.showModal();else if(!panel&&el.open)el.close();},[panel]);
  useEffect(()=>{body.current?.scrollTo({top:0});},[panel]);
  const records=relicsData.filter(r=>(world==='ALL'||r.planet===world)&&`${r.name} ${r.mission} ${r.coordinates.regionName}`.toLowerCase().includes(query.trim().toLowerCase()));
  const launch=(id:string)=>useReliqunixStore.getState().jumpToRelic(id);
  return <>
    <button className="archive-nav mono" onClick={()=>open('collection')} aria-label="Explore archive" aria-haspopup="dialog"><BookOpen size={15}/><span>EXPLORE ARCHIVE</span></button>
    <dialog ref={dialog} className="archive-dialog" aria-labelledby="archive-title" onCancel={()=>open(null)} onClose={()=>open(null)} data-lenis-prevent>
      <div className="archive-header"><div><p className="eyebrow orange">RELIQUNIX / FIELD ARCHIVE</p><h2 id="archive-title">The things we left behind.</h2></div><button onClick={()=>open(null)} aria-label="Close archive" className="archive-close"><X size={22}/></button></div>
      <nav className="archive-tabs" aria-label="Archive sections">{(['collection','mission','sources','notebook'] as const).map(item=><button key={item} aria-pressed={panel===item} className={panel===item?'selected':''} onClick={()=>open(item)}>{item==='collection'?'Collection':item==='mission'?'Field mission':item==='sources'?'NASA sources':'Notebook'}<span>{item==='collection'?String(relicsData.length).padStart(2,'0'):item==='mission'?'03':item==='sources'?String(challengeResources.length).padStart(2,'0'):`${answered.length}/${relicsData.length}`}</span></button>)}</nav>
      <div className="archive-body" ref={body} data-lenis-prevent>
        {panel==='mission'&&<FieldMission/>}
        {panel==='collection'&&<>
          <div className="archive-summary"><p>Twelve objects. Two worlds. A different story at every stop.</p><span className="micro">SELECT A RECORD TO DESCEND</span></div>
          <div className="archive-filters"><div className="world-filters" aria-label="Filter collection">{['ALL','MOON','MARS'].map(value=><button key={value} onClick={()=>setWorld(value)} aria-pressed={world===value}>{value==='ALL'?'Both worlds':value==='MOON'?'The Moon':'Mars'}</button>)}</div><label className="archive-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a mission or object" aria-label="Search the relic collection"/></label></div>
          <div className="collection-grid">{records.map(relic=><article key={relic.id} className="collection-record"><button className="collection-card" onClick={()=>launch(relic.id)} aria-label={`Descend to ${relic.name}`}><div className="card-topline micro"><span>{relic.planet} / {relic.yearAbandoned}</span>{explored.includes(relic.id)?<Check size={15} aria-label="Inspected"/>:<ArrowUpRight size={16}/>}</div><RelicGlyph id={relic.id}/><span className="card-mission micro">{relic.mission}</span><h3>{relic.name}</h3><p>{relic.heroQuote}</p><span className="card-foot micro">{getModelAsset(relic.id)?'NASA SOURCE MODEL':'INTERPRETIVE 3D MODEL'}<span>04 PARTS</span></span></button><details className="mission-file"><summary aria-label={`Read NASA mission file for ${relic.name}`}><span>NASA MISSION FILE</span><Plus size={14}/></summary><MissionEvidence relicId={relic.id}/></details></article>)}</div>
          {!records.length&&<p className="archive-empty">No matching relics. Try another mission or choose both worlds.</p>}
          <p className="archive-note">Sites are arranged as a walkable exhibition. Distances in the 3D tour are compressed; location labels refer to the real mission sites.</p>
        </>}
        {panel==='sources'&&<>
          <div className="source-intro"><span className="eyebrow orange">BUILT FROM NASA OPEN RESOURCES</span><h3>Follow the story back to its source.</h3><p>{resourceMethodology}</p><p className="source-data-count mono">12 MISSION FILES · 36 FACTS · 36 TIMELINE EVENTS</p><a href={CHALLENGE_URL} target="_blank" rel="noreferrer">Open the official challenge resources <ArrowUpRight size={16}/></a></div>
          <div className="evidence-key"><div><strong>Historical record</strong><p>Mission dates, purpose, and science come from linked NASA records.</p></div><div><strong>Model interpretation</strong><p>NASA geometry is credited. Custom reconstructions illustrate engineering, not exact present-day condition.</p></div><div><strong>Environmental study</strong><p>The exposure slider is an illustration, not a measurement or prediction.</p></div></div>
          <button className="evidence-pack-download field-primary" onClick={()=>downloadText('reliqunix-nasa-evidence.json',JSON.stringify(buildEvidencePack(),null,2),'application/json')}><Download size={15}/> DOWNLOAD THE NASA EVIDENCE PACK</button>
          <div className="resource-list">{challengeResources.map(resource=><a key={resource.id} className="resource-row" href={resource.url} target="_blank" rel="noreferrer"><span className="micro resource-origin">{resource.origin}<small>{resource.category}</small></span><div><h4>{resource.title}</h4><p>{resource.usedFor}</p><span className="micro">{resource.organization}</span></div><ArrowUpRight size={18}/></a>)}</div>
          <p className="archive-note">Independent educational project. NASA does not endorse this experience. AI assisted with code and editorial development; mission evidence remains linked to primary sources.</p>
        </>}
        {panel==='notebook'&&<>
          <div className="notebook-intro"><div><p className="eyebrow orange">YOUR EXPLORER NOTEBOOK</p><h3>Look closer.<br/>Take something back.</h3><p>Inspect a component, read its story, then answer the discovery question. Your discoveries stay in this browser.</p></div><div className="notebook-count"><strong>{String(answered.length).padStart(2,'0')}<span>/{relicsData.length}</span></strong><span className="micro">DISCOVERIES COLLECTED</span></div></div>
          <div className="notebook-progress" role="progressbar" aria-label="Discovery progress" aria-valuenow={answered.length} aria-valuemin={0} aria-valuemax={relicsData.length}><span style={{width:`${answered.length/relicsData.length*100}%`}}/></div>
          {answered.length===relicsData.length&&<p className="notebook-complete"><Check size={18}/> Archive complete. You’ve connected twelve objects to the science they made possible.</p>}
          <div className="notebook-list">{relicsData.map((relic,i)=><button key={relic.id} onClick={()=>launch(relic.id)}><span className={`notebook-check ${answered.includes(relic.id)?'complete':''}`}>{answered.includes(relic.id)?<Check size={15}/>:String(i+1).padStart(2,'0')}</span><div><strong>{relic.shortName}</strong><small>{relic.planet} · {answered.includes(relic.id)?'Discovery collected':explored.includes(relic.id)?'Inspected · question waiting':'Ready to explore'}</small></div><ArrowUpRight size={17}/></button>)}</div>
          <div className="classroom-prompt"><Compass size={25}/><div><h4>One more question to bring home</h4><p>When does discarded equipment become heritage? Choose one object and explain what future explorers should preserve—and why.</p></div></div>
          <div className="notebook-actions"><button className="field-primary" onClick={()=>open('mission')}>WRITE MY CURATOR STORY <ArrowUpRight size={14}/></button><button onClick={()=>downloadText('reliqunix-field-report.html',buildFieldReportHtml(useReliqunixStore.getState()),'text/html;charset=utf-8')}><Download size={14}/> DOWNLOAD MY FIELD REPORT</button></div>
        </>}
      </div>
      <div className="archive-footer micro"><button onClick={()=>{open(null);useReliqunixStore.getState().returnToFlight();useReliqunixStore.setState({jumpTarget:{progress:.99,serial:Date.now()}});}}>THE MONUMENT LEDGER ↗</button><span>{explored.length} OF {relicsData.length} RELICS INSPECTED</span></div>
    </dialog>
  </>;
}
