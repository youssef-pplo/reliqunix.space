'use client';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { soundEngine } from '@/utils/soundEngine';
import { relicsData } from '@/data/relicsData';
import { BrandMark } from './ArchiveGlyph';
const logs=['CONNECTING TO THE DEEP SPACE ARCHIVE','INDEXING LUNAR & MARTIAN MISSION RECORDS','SYNTHESIZING REGOLITH / THERMAL MATERIALS','CALIBRATING ORBITAL FLIGHT PATH',`${relicsData.length} RELICS · ${relicsData.reduce((sum,relic)=>sum+relic.parts.length,0)} COMPONENTS · TWO WORLDS`,'TELEMETRY ONLINE. AWAITING EXPLORER.'];
export default function Preloader() {
  const loaded=useReliqunixStore(s=>s.isLoaded),ready=useReliqunixStore(s=>s.sceneReady);
  const [progress,setProgress]=useState(0);
  useEffect(()=>{
    try {if(sessionStorage.getItem('reliqunix-entered')==='1')useReliqunixStore.getState().launch(false);} catch { /* Optional session memory. */ }
  },[]);
  useEffect(()=>{
    if(loaded)return;
    const timer=setInterval(()=>setProgress(p=>Math.min(ready?100:92,p+(ready?11:p<60?8:2))),65);
    return()=>clearInterval(timer);
  },[ready,loaded]);
  const launch=useCallback((audio:boolean)=>{
    if(progress<100)return;
    if(audio)void soundEngine.enable(useReliqunixStore.getState().celestialBody);
    try {sessionStorage.setItem('reliqunix-entered','1');} catch { /* Enter without storage. */ }useReliqunixStore.getState().launch(audio);
  },[progress]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Enter'&&!loaded)launch(true);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[launch,loaded]);
  return <AnimatePresence>{!loaded&&<motion.div className="preloader" initial={{opacity:1}} exit={{opacity:0,y:-16}} transition={{duration:0.72,ease:[0.22,1,0.36,1]}} role="dialog" aria-modal="true" aria-label="Initialize the Reliqunix experience">
    <div className="boot-brand"><BrandMark/><span>RELIQUNIX<span className="dim">.SPACE</span></span><span className="boot-edition mono">FIELD ARCHIVE / VOL. 002</span></div>
    <div className="boot-main"><div><p className="eyebrow"><i/> A SIGNAL FROM WHAT WE LEFT BEHIND</p><h1>HISTORY IS<br/>STILL <em>OUT THERE.</em></h1><p className="boot-intro">{relicsData.length} relics. Two worlds. The human stories<br/>that never made the return trip.</p><div className="boot-collection-index" aria-hidden="true"><span>01 <b>THE MOON</b></span><i/><span>02 <b>MARS</b></span></div></div>
      <div className="boot-terminal"><span className="mono dim">MISSION ARCHIVE BOOT SEQUENCE</span><div className="boot-number">{String(progress).padStart(3,'0')}<span>%</span></div><div className="boot-progress"><span style={{width:`${progress}%`}}/></div>
        <div className="terminal-lines" aria-live="polite">{logs.slice(0,Math.max(1,Math.ceil(progress/17))).map((line,i)=><p key={line}><span>{String(i+1).padStart(2,'0')}</span>{line}<b>OK</b></p>)}</div>
        <button className="launch-button" disabled={progress<100} onClick={()=>launch(true)}><span>{progress<100?'ESTABLISHING CONNECTION…':'INITIALIZE TELEMETRY & AUDIO'}</span><ArrowUpRight size={20}/></button>
        <button className="silent-button mono" disabled={progress<100} onClick={()=>launch(false)}>ENTER WITHOUT AUDIO <span>↗</span></button>
      </div>
    </div>
    <div className="boot-footer mono"><span>NASA SPACE APPS CHALLENGE · INDEPENDENT PROJECT</span><span>HEADPHONES RECOMMENDED / SCROLL TO EXPLORE</span></div>
  </motion.div>}</AnimatePresence>;
}
