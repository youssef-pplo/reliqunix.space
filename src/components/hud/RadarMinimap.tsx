'use client';
import { getRelics } from '@/data/relicsData';
import { useReliqunixStore } from '@/store/useReliqunixStore';

export default function RadarMinimap() {
  const planet=useReliqunixStore(s=>s.celestialBody),p=useReliqunixStore(s=>Math.round(s.scrollProgress*500)/500),phase=useReliqunixStore(s=>s.cameraPhase),active=useReliqunixStore(s=>s.activeRelicId);
  const relics=getRelics(planet);
  return <aside className={`radar-minimap ${phase==='INSPECT'?'is-inspecting':''} ${p>0.94?'is-hidden':''}`} aria-label="Interactive flight path">
    <div className="radar-heading micro"><span><span className="signal-dot"/> FLIGHT PATH</span><span>{phase==='INSPECT'?'LOCKED':`${String(Math.round(p*100)).padStart(3,'0')}%`}</span></div>
    <div className="route-stops"><div className="route-line"><span style={{width:`${Math.min(100,p/.9*100)}%`}}/></div><button className={!active?'active':''} aria-label="Return to orbital view" onClick={()=>useReliqunixStore.getState().jumpToRelic(null)}><i/><span>ORB</span></button>{relics.map((r,i)=><button key={r.id} className={active===r.id?'active':''} aria-current={active===r.id?'step':undefined} aria-label={`Warp to ${r.name}`} title={r.shortName} onClick={()=>useReliqunixStore.getState().jumpToRelic(r.id)}><i/><span>{String(i+1).padStart(2,'0')}</span></button>)}</div>
    <button className="radar-collection mono" onClick={()=>useReliqunixStore.getState().openArchive('collection')}>BROWSE ALL {relics.length}{' '}{planet==='MOON'?'LUNAR':'MARTIAN'} RELICS ↗</button>
  </aside>;
}
