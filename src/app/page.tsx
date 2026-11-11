'use client';
import { useEffect, useRef } from 'react';
import { MotionConfig } from 'framer-motion';
import dynamic from 'next/dynamic';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ArrowDown, ArrowDownRight, ArrowUpRight, ArrowUp, MoveUpRight } from 'lucide-react';
import { getRelics, relicsData } from '@/data/relicsData';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { soundEngine } from '@/utils/soundEngine';
import { finishExtensionSafeHydration } from '@/utils/hydrationCompatibility';
import Preloader from '@/components/hud/Preloader';
import TopNavHUD from '@/components/hud/TopNavHUD';
import StoryOverlay from '@/components/hud/StoryOverlay';
import InspectionDrawer from '@/components/hud/InspectionDrawer';
import RadarMinimap from '@/components/hud/RadarMinimap';
import CustomCursor from '@/components/hud/CustomCursor';
import { BrandMark, RelicGlyph } from '@/components/hud/ArchiveGlyph';

const Experience=dynamic(()=>import('@/components/canvas/Experience'),{ssr:false});
function OrbitalStory() {
  const planet=useReliqunixStore(s=>s.celestialBody),p=useReliqunixStore(s=>s.scrollProgress),loaded=useReliqunixStore(s=>s.isLoaded);
  const relics=getRelics(planet),opacity=Math.max(0,1-p/0.17);
  return <section className={`orbital-story ${loaded?'is-launched':''}`} style={{opacity,visibility:p>0.19?'hidden':'visible',pointerEvents:'none'}} aria-label="Introduction to the archive" aria-hidden={p>0.19}>
    <div className="hero-copy" style={{transform:`translateY(${-p*160}px)`}}>
      <p className="eyebrow"><span className="tiny-cross">+</span> A DIGITAL ARCHAEOLOGY OF SPACE <span className="hero-volume">VOL. 001</span></p>
      <h1>ABANDONED.<br/><span className="hero-not">NOT</span> <span className="hero-outline">FORGOTTEN.</span></h1>
      <div className="hero-intro"><span className="intro-line"/><p>We left more than footprints.<br/>Discover the machines, memories, and human<br className="desktop-break"/> ambition still resting on other worlds.</p></div>
      <button className="begin-descent" onClick={()=>{soundEngine.playLockClick();useReliqunixStore.getState().jumpToRelic(relics[0].id);}}><span className="descent-circle"><ArrowDownRight size={25} strokeWidth={1.3}/></span><span>BEGIN THE DESCENT<small>SCROLL TO EXPLORE THE ARCHIVE</small></span></button>
    </div>
    <div className="orbital-target"><span className="micro"><span className="signal-dot"/> ORBITAL RECONNAISSANCE</span><span className="target-world">{planet==='MOON'?'LUNA':'ARES'}<sup>0{planet==='MOON'?'1':'2'}</sup></span><div className="target-data mono"><span>{planet==='MOON'?'EARTH’S ONLY NATURAL SATELLITE':'THE FOURTH PLANET'}</span><span>Ø {planet==='MOON'?'3,474.8':'6,779'} KM <i>/</i> {planet==='MOON'?'1.62':'3.71'} M/S²</span></div></div>
    <div className="planet-caption mono"><span className="caption-bracket">⌖</span><div>03 ARTIFACTS LOCATED<span>{planet==='MOON'?'THE MOON REMEMBERS.':'A WORLD OF SECOND LIVES.'}</span></div><span className="caption-rule"/></div>
    <div className="hero-bottom">
      <div className="scroll-prompt"><span className="scroll-line"><i/></span><span className="micro">SCROLL TO<br/>LEAVE ORBIT</span><ArrowDown size={15}/></div>
      <div className="mission-rail"><div className="rail-label micro"><span>THE {planet==='MOON'?'LUNAR':'MARTIAN'} COLLECTION</span><span>SELECT A RELIC <MoveUpRight size={11}/></span></div><div className="mission-links">{relics.map((relic,i)=><button className="mission-link" key={relic.id} onClick={()=>useReliqunixStore.getState().jumpToRelic(relic.id)} onMouseEnter={()=>soundEngine.playHoverPing()}><RelicGlyph id={relic.id}/><span className="mission-link-copy"><span className="micro">0{i+1}<i>/</i>{relic.yearAbandoned}</span><strong>{relic.shortName}</strong><small>{relic.mission.split(' · ')[0]}</small></span><ArrowUpRight className="mission-arrow" size={15}/></button>)}</div></div>
    </div>
  </section>;
}
function DescentOverlay() {
  const p=useReliqunixStore(s=>s.scrollProgress),planet=useReliqunixStore(s=>s.celestialBody);
  const opacity=p<0.18||p>0.38?0:Math.min(1,(p-0.18)/0.05,(0.38-p)/0.04);
  return <div className="descent-overlay" style={{opacity}} aria-hidden="true"><span className="eyebrow orange">ORBIT → SURFACE / ENTRY SEQUENCE</span><h2>EVERY ENDING<br/>LEAVES A <em>TRACE.</em></h2><p className="mono">DESCENDING TO THE {planet==='MOON'?'LUNAR':'MARTIAN'} ARCHIVE <span className="blink">_</span></p><div className="descent-ticks">{Array.from({length:36},(_,i)=><i key={i} style={{opacity:p>(0.18+i*0.004)?1:0.15}}/>)}</div></div>;
}
function MonumentLedger() {
  const visible=useReliqunixStore(s=>s.scrollProgress>0.94),planet=useReliqunixStore(s=>s.celestialBody);
  return <footer id="ledger" className={`monument-ledger ${visible?'is-visible':''}`} aria-hidden={!visible} inert={!visible} data-lenis-prevent>
    <div className="ledger-intro"><p className="eyebrow"><span className="tiny-cross">+</span> THE MONUMENT LEDGER / 1967–2024</p><h2>THEY STAYED.<br/><span>WE REMEMBER.</span></h2><p>Not simply things we discarded.<br/>Evidence that we dared to go.</p><button className="ledger-orbit mono" onClick={()=>useReliqunixStore.getState().jumpToRelic(null)}>RETURN TO {planet==='MOON'?'LUNAR':'MARTIAN'} ORBIT <ArrowUpRight size={18}/></button></div>
    <div className="ledger-records"><div className="ledger-table-heading micro"><span>THE OFF-WORLD REGISTER</span><span>06 RECORDS / 02 WORLDS</span></div>{relicsData.map((relic,i)=><button className="ledger-record" key={relic.id} onClick={()=>useReliqunixStore.getState().jumpToRelic(relic.id)}><span className="mono ledger-number">0{i+1}</span><RelicGlyph id={relic.id}/><span className="ledger-record-name"><strong>{relic.shortName}</strong><span className="micro">{relic.coordinates.regionName}</span></span><span className="micro ledger-planet">{relic.planet}</span><span className="mono ledger-year">{relic.yearAbandoned}</span><ArrowUpRight size={17}/></button>)}
    <div className="ledger-source"><span className="micro">MISSION RECORDS & SCIENCE</span><a href="https://science.nasa.gov/" target="_blank" rel="noreferrer">NASA Science <ArrowUpRight size={12}/></a><a href="https://www.jpl.nasa.gov/" target="_blank" rel="noreferrer">NASA / JPL <ArrowUpRight size={12}/></a></div></div>
    <div className="ledger-colophon"><div><BrandMark/><span className="mono">RELIQUNIX.SPACE</span></div><p>Created for NASA Space Apps · Independent educational project<br/>NASA models & interpretive reconstructions. Compressed flight paths.</p><p>Moon map: NASA SVS / Ernie Wright / LRO<br/>Hardware stories & original models: NASA & JPL</p><button onClick={()=>useReliqunixStore.getState().jumpToRelic(null)} aria-label="Back to orbital view"><ArrowUp size={18}/></button></div>
  </footer>;
}
function FlightStatus() {
  const p=useReliqunixStore(s=>s.scrollProgress),phase=useReliqunixStore(s=>s.cameraPhase),planet=useReliqunixStore(s=>s.celestialBody);
  if(p>0.94)return null;
  return <><div className={`flight-status micro ${phase==='INSPECT'?'inspection-status':''}`}><span className="orange">+</span> {phase==='INSPECT'?'COMPONENT LOCKED / CAMERA STABILIZED':p<0.22?'THE MISSION ENDED. THE STORY DIDN’T.':p<0.38?'AUTONOMOUS DESCENT IN PROGRESS':'SURFACE FLIGHT / SELECT A NUMBERED COMPONENT'}</div><aside className="flight-scale" aria-label={`${Math.round(p*100)} percent through the archive`}><span className="micro">{planet==='MOON'?'LUNA':'ARES'}</span><div className="scale-track"><div style={{height:`${p*100}%`}}/>{Array.from({length:21},(_,i)=><i key={i}/>)}</div><span className="mono">{String(Math.round(p*100)).padStart(3,'0')}</span></aside></>;
}
function FallbackPlanet() {
  const available=useReliqunixStore(s=>s.graphicsAvailable),planet=useReliqunixStore(s=>s.celestialBody),orbital=useReliqunixStore(s=>s.scrollProgress<0.22);
  return available?null:<div className={`fallback-planet ${planet.toLowerCase()}`} style={{opacity:orbital?1:0.25}} aria-hidden="true"/>;
}
export default function Home() {
  const lenis=useRef<Lenis|null>(null),loaded=useReliqunixStore(s=>s.isLoaded),phase=useReliqunixStore(s=>s.cameraPhase),jump=useReliqunixStore(s=>s.jumpTarget);
  const available=useReliqunixStore(s=>s.graphicsAvailable),planet=useReliqunixStore(s=>s.celestialBody);
  useEffect(()=>{
    finishExtensionSafeHydration();
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>useReliqunixStore.getState().setReducedMotion(motion.matches);update();motion.addEventListener('change',update);
    const scroller=new Lenis({duration:motion.matches?0:1.2,smoothWheel:!motion.matches,easing:t=>1-Math.pow(1-t,3)});lenis.current=scroller;
    const tick=(time:number)=>scroller.raf(time*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
    scroller.on('scroll',({scroll,limit}:{scroll:number;limit:number})=>useReliqunixStore.getState().setScrollProgress(limit>0?scroll/limit:0));
    scroller.scrollTo(0,{immediate:true,force:true});
    const state=useReliqunixStore.getState();if(!state.isLoaded)scroller.stop();
    return()=>{motion.removeEventListener('change',update);gsap.ticker.remove(tick);scroller.destroy();lenis.current=null;soundEngine.disable();};
  },[]);
  useEffect(()=>{
    document.body.dataset.planet=planet.toLowerCase();
  },[planet]);
  useEffect(()=>{
    if(!loaded||phase==='INSPECT')lenis.current?.stop();else lenis.current?.start();
    const overflow=!loaded||phase==='INSPECT'?'hidden':'';
    document.documentElement.style.overflow=overflow;
    return()=>{document.documentElement.style.overflow='';};
  },[loaded,phase]);
  useEffect(()=>{
    if(!jump||!lenis.current)return;
    const max=document.documentElement.scrollHeight-window.innerHeight;
    lenis.current.scrollTo(jump.progress*max,{force:true,immediate:jump.immediate||useReliqunixStore.getState().reducedMotion,duration:useReliqunixStore.getState().reducedMotion?0:1.6,onComplete:()=>useReliqunixStore.getState().setScrollProgress(jump.progress)});
  },[jump]);
  return <MotionConfig reducedMotion="user"><main>
    <div inert={!loaded} aria-hidden={!loaded}>
    <a className="skip-link" href="#archive-controls" onClick={()=>useReliqunixStore.getState().jumpToRelic(getRelics(planet)[0].id)}>Skip to the relic archive</a>
    <div className="space-background"/>
    <Experience/>
    <FallbackPlanet/>
    <div className="screen-grain" aria-hidden="true"/>
    <TopNavHUD/>
    <OrbitalStory/>
    <DescentOverlay/>
    <div id="archive-controls"><StoryOverlay/></div>
    <RadarMinimap/>
    <FlightStatus/>
    <MonumentLedger/>
    <InspectionDrawer/>
    <div className="scroll-track" aria-hidden="true"/>
    {!available&&<span className="graphics-note mono">FIELD GUIDE MODE · SELECT COMPONENTS FROM THE ARCHIVE</span>}
    </div>
    <Preloader/>
    <CustomCursor/>
  </main></MotionConfig>;
}
