'use client';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getRelic } from '@/data/relicsData';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { soundEngine } from '@/utils/soundEngine';
import AssetProvenance from './AssetProvenance';

export default function InspectionDrawer() {
  const id=useReliqunixStore(s=>s.activeRelicId),selected=useReliqunixStore(s=>s.selectedPartId),decay=useReliqunixStore(s=>s.decayTimeline);
  const relic=getRelic(id),part=relic?.parts.find(p=>p.partId===selected),close=useRef<HTMLButtonElement>(null),scroll=useRef<HTMLDivElement>(null);
  const returnToFlight=useReliqunixStore(s=>s.returnToFlight);
  const index=relic?.parts.findIndex(p=>p.partId===selected)??0;
  useEffect(()=>{
    if(!selected)return;const previous=document.activeElement as HTMLElement|null;
    close.current?.focus({preventScroll:true});scroll.current?.scrollTo({top:0});
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!useReliqunixStore.getState().archivePanel)returnToFlight();};window.addEventListener('keydown',key);
    return()=>{window.removeEventListener('keydown',key);previous?.focus?.({preventScroll:true});};
  },[selected,returnToFlight]);
  const currentYear=2026;
  const year=relic?Math.round(decay<=80?relic.yearAbandoned+(currentYear-relic.yearAbandoned)*decay/80:currentYear+(decay-80)/20*50):currentYear;
  const go=(direction:number)=>{
    if(!relic)return;const next=(index+direction+relic.parts.length)%relic.parts.length;soundEngine.playLockClick();useReliqunixStore.getState().inspectPart(relic.id,relic.parts[next].partId);
  };
  return <AnimatePresence>{part&&relic&&<motion.aside className="inspection-drawer" initial={{x:36,opacity:0}} animate={{x:0,opacity:1}} exit={{x:24,opacity:0}} transition={{duration:0.48,ease:[0.22,1,0.36,1]}} role="dialog" aria-labelledby="inspection-title" data-lenis-prevent>
    <div className="drawer-top"><span className="micro"><span className="orange">●</span> COMPONENT INSPECTION</span><button ref={close} className="icon-button" onClick={returnToFlight} aria-label="Close inspection"><X size={18}/></button></div>
    <div className="drawer-scroll" ref={scroll} data-lenis-prevent>
      <div className="drawer-mission mono">{relic.mission} <span> / 0{index+1}</span></div>
      <div className="inspection-relic-name">{relic.shortName}<span>ENGINEERING FIELD RECORD</span></div>
      <h2 id="inspection-title">{part.label}</h2>
      <div className="part-status mono"><span className="signal-dot"/>{part.status}</div>
      <AssetProvenance relicId={relic.id}/>
      <dl className="telemetry-data"><div><dt>RECORD ID</dt><dd>{part.telemetryCode}</dd></div><div><dt>MATERIAL</dt><dd>{part.material}</dd></div><div><dt>LOCATION</dt><dd>{relic.coordinates.regionName}</dd></div></dl>
      <p className="inspection-story">{part.story}</p>
      <div className="drawer-section"><span className="micro dim">WHY IT WAS LEFT BEHIND</span><p>{relic.whyAbandoned}</p></div>
      <blockquote><span className="quote-mark">“</span>{relic.archiveQuote}<cite>{relic.quoteAttribution}</cite></blockquote>
      <section className="decay-controls" aria-label="Environmental decay simulation">
        <div className="decay-overline"><span className="tiny-cross">+</span> EXPOSURE STUDY</div>
        <div className="decay-heading"><span className="micro">TIME-LAPSE / ENVIRONMENTAL DECAY</span><span className="mono orange">{String(Math.round(decay)).padStart(3,'0')}%</span></div>
        <div className="decay-year"><strong>{year}</strong><span className="micro">{decay===0?'PLACED / RETIRED':decay<80?'EXPOSURE SIMULATION':decay===80?'PRESENT DAY':'FUTURE PROJECTION'}</span></div>
        <input type="range" min="0" max="100" step="1" value={decay} onChange={e=>useReliqunixStore.getState().setDecayTimeline(Number(e.target.value))} aria-label="Environmental decay timeline" aria-valuetext={`${year}, ${Math.round(decay)} percent illustrative exposure`} style={{'--range':`${decay}%`} as React.CSSProperties}/>
        <div className="decay-labels mono"><button onClick={()=>useReliqunixStore.getState().setDecayTimeline(0)}>DAY 1</button><button onClick={()=>useReliqunixStore.getState().setDecayTimeline(80)}>PRESENT</button><button onClick={()=>useReliqunixStore.getState().setDecayTimeline(100)}>+50 YEARS</button></div>
        <p className="decay-explanation">{relic.environmentalThreat}</p><span className="simulation-note">Illustrative weathering, not a measured forecast.</span>
      </section>
      <a className="source-link mono" href={relic.sourceUrl} target="_blank" rel="noreferrer">READ THE NASA MISSION RECORD <ArrowUpRight size={14}/></a>
    </div>
    <div className="drawer-bottom"><div className="component-pagination"><button aria-label="Previous component" onClick={()=>go(-1)}><ChevronLeft size={16}/></button><span className="mono">0{index+1} <span className="dim">/ 04 COMPONENTS</span></span><button aria-label="Next component" onClick={()=>go(1)}><ChevronRight size={16}/></button></div><button className="return-button mono" onClick={returnToFlight}><ArrowLeft size={15}/> RETURN TO SURFACE FLIGHT <span>ESC</span></button></div>
  </motion.aside>}</AnimatePresence>;
}
