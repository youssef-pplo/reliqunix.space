'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Plus, Minus, MapPin } from 'lucide-react';
import { formatCoordinate, getRelic, getRelics } from '@/data/relicsData';
import { getRelicResources } from '@/data/challengeResources';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { soundEngine } from '@/utils/soundEngine';
import DiscoveryQuestion from './DiscoveryQuestion';
import AssetProvenance from './AssetProvenance';
import MissionEvidence from './MissionEvidence';

export default function StoryOverlay() {
  const id=useReliqunixStore(s=>s.activeRelicId),phase=useReliqunixStore(s=>s.cameraPhase),visible=useReliqunixStore(s=>s.scrollProgress>=0.37&&s.scrollProgress<0.94);
  const relic=getRelic(id),[expanded,setExpanded]=useState(false);
  useEffect(()=>setExpanded(false),[id]);
  return <AnimatePresence mode="wait">{relic&&phase!=='INSPECT'&&visible&&<motion.section key={relic.id} className="story-overlay" initial={{opacity:0,x:-18}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} transition={{duration:0.38}} aria-label={`${relic.name} story`} data-lenis-prevent tabIndex={0}>
    <div className="eyebrow story-index"><span className="orange">RELIC 0{getRelics(relic.planet).findIndex(r=>r.id===id)+1}</span><span> / THE {relic.planet==='MOON'?'LUNAR':'MARTIAN'} COLLECTION</span></div>
    <div className="story-badge mono"><span className="signal-dot"/>{relic.mission}</div>
    <h2>{relic.name}</h2>
    <div className="story-location mono"><MapPin size={12}/>{relic.coordinates.regionName}</div>
    <div className="disposition-label micro">{relic.disposition==='discarded'?'RELEASED HARDWARE':relic.disposition==='passive'?'PASSIVE SCIENCE HARDWARE':'RETIRED MISSION HARDWARE'}</div>
    <AssetProvenance relicId={relic.id}/>
    <p className="story-lead">{relic.heroQuote}</p>
    <p className="story-text">{relic.scientificStory}</p>
    <details className="mission-file story-mission-file"><summary><span>NASA MISSION FILE / FACTS & TIMELINE</span><Plus size={14}/></summary><MissionEvidence relicId={relic.id}/></details>
    <div className="story-stats"><div><span className="micro dim">PLACED / RETIRED</span><strong>{relic.yearAbandoned}<span> AD</span></strong></div><div><span className="micro dim">RECORDED MASS</span><strong>{relic.massKg.toLocaleString('en-US')}<span> KG</span></strong></div></div>
    <p className="mass-note">{relic.massNote}</p>
    <a className="story-source-link mono" href={relic.sourceUrl} target="_blank" rel="noreferrer">NASA MISSION RECORD <ArrowUpRight size={12}/></a>
    <button className="story-source-trail micro" onClick={()=>useReliqunixStore.getState().openArchive('sources')}>{getRelicResources(relic.id).length} LINKED NASA RESOURCES · VIEW SOURCE LIBRARY ↗</button>
    <button className="story-expand mono" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}><span>WHY IT STAYED</span>{expanded?<Minus size={14}/>:<Plus size={14}/>}</button>
    <AnimatePresence>{expanded&&<motion.p className="expanded-story" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}>{relic.whyAbandoned}</motion.p>}</AnimatePresence>
    <div className="component-heading micro"><span>LOOK CLOSER</span><span>04 COMPONENTS <ArrowUpRight size={12}/></span></div>
    <div className="part-list">{relic.parts.map((part,i)=><button key={part.partId} onClick={()=>{soundEngine.playLockClick();useReliqunixStore.getState().inspectPart(relic.id,part.partId);}} onMouseEnter={()=>soundEngine.playHoverPing()}><span className="mono">0{i+1}</span><span>{part.shortLabel}</span><span className="part-list-action" aria-hidden="true">INSPECT</span><Plus size={15}/></button>)}</div>
    <DiscoveryQuestion key={relic.id} relic={relic}/>
    <div className="story-coordinates mono">{formatCoordinate(relic.coordinates.lat)}<span> / </span>{formatCoordinate(relic.coordinates.lng,false)}</div>
  </motion.section>}</AnimatePresence>;
}
