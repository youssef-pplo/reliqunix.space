'use client';
import { useEffect, useRef } from 'react';
import { getRelics } from '@/data/relicsData';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { soundEngine } from '@/utils/soundEngine';
export default function RadarMinimap() {
  const planet=useReliqunixStore(s=>s.celestialBody),p=useReliqunixStore(s=>Math.round(s.scrollProgress*500)/500),phase=useReliqunixStore(s=>s.cameraPhase);
  const path=useRef<SVGPathElement>(null),marker=useRef<SVGGElement>(null);
  const relics=getRelics(planet),positions=[[18,65],[65,38],[112,55],[168,25]];
  useEffect(()=>{if(path.current){const pos=path.current.getPointAtLength(p*path.current.getTotalLength());marker.current?.setAttribute('transform',`translate(${pos.x} ${pos.y})`);}},[p]);
  return <aside className={`radar-minimap ${phase==='INSPECT'?'is-inspecting':''} ${p>0.94?'is-hidden':''}`} aria-label="Interactive flight path">
    <div className="radar-heading micro"><span><span className="signal-dot"/> FLIGHT PATH</span><span>{phase==='INSPECT'?'LOCKED':`${String(Math.round(p*100)).padStart(3,'0')}%`}</span></div>
    <div className="radar-chart"><svg viewBox="0 0 190 85" fill="none" aria-hidden="true"><path d="M0 20h190M0 45h190M0 70h190M28 0v85M76 0v85M124 0v85M172 0v85" stroke="#c3beb0" strokeOpacity="0.055"/><path ref={path} d="M18 65C29 63 45 22 65 38S91 74 112 55S143 13 168 25" stroke="#afa99b" strokeOpacity="0.45" strokeDasharray="2 4"/>{positions.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3" fill={p>=[0,0.45,0.65,0.85][i]?'#f7794c':'#77776f'}/>)}<g ref={marker} transform="translate(18 65)"><circle r="6" stroke="#ff8857" strokeOpacity="0.4"/><circle r="2" fill="#fff7dc"/></g></svg>{positions.map(([x,y],i)=><button key={i} className="radar-hit" style={{left:`${x/190*100}%`,top:`${y/85*100}%`}} aria-label={i===0?'Return to orbital view':`Warp to ${relics[i-1].name}`} title={i===0?'Orbital view':relics[i-1].shortName} onClick={()=>{soundEngine.playLockClick();useReliqunixStore.getState().jumpToRelic(i===0?null:relics[i-1].id);}}/>)}</div>
    <div className="radar-legend mono">{['ORB','01','02','03'].map((name,i)=><button key={name} onClick={()=>useReliqunixStore.getState().jumpToRelic(i===0?null:relics[i-1].id)} aria-label={i===0?'Orbital view':relics[i-1].shortName}>{name}</button>)}</div>
  </aside>;
}
