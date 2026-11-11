'use client';
import { Volume2, VolumeX, ArrowUpRight } from 'lucide-react';
import { formatCoordinate, getRelic, getRelics, type CelestialBody } from '@/data/relicsData';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { soundEngine } from '@/utils/soundEngine';
import { BrandMark } from './ArchiveGlyph';
export default function TopNavHUD() {
  const planet=useReliqunixStore(s=>s.celestialBody),p=useReliqunixStore(s=>Math.round(s.scrollProgress*500)/500),audio=useReliqunixStore(s=>s.audioEnabled);
  const activeId=useReliqunixStore(s=>s.activeRelicId),relic=getRelic(activeId);
  const coordinates=(relic??getRelics(planet)[0]).coordinates;
  const range=planet==='MOON'?384400:225000000;
  const altitude=Math.max(0.001,range*Math.pow(0.001/range,Math.min(1,p/0.38)));
  const switchPlanet=(body:CelestialBody)=>{
    if(body===planet)return;soundEngine.playPlanetSwitch();useReliqunixStore.getState().switchPlanet(body);
    if(audio)soundEngine.startAmbientDrone(body);
  };
  const toggleAudio=()=>{if(audio)soundEngine.disable();else void soundEngine.enable(planet);useReliqunixStore.getState().setAudioEnabled(!audio);};
  return <header className="top-nav">
    <button className="brand" onClick={()=>useReliqunixStore.getState().jumpToRelic(null)} aria-label="Reliqunix — return to orbital view"><BrandMark/><span>RELIQUNIX<span className="brand-domain">.SPACE</span><small>NASA ARCHIVE <span> // </span> HUMAN STORIES</small></span></button>
    <nav className="planet-switch" aria-label="Choose a celestial body">
      <button className={planet==='MOON'?'active':''} aria-pressed={planet==='MOON'} onClick={()=>switchPlanet('MOON')}><span className="planet-icon moon-icon"/><span className="mono">01</span> LUNA <small>MOON</small></button>
      <button className={planet==='MARS'?'active':''} aria-pressed={planet==='MARS'} onClick={()=>switchPlanet('MARS')}><span className="planet-icon mars-icon"/><span className="mono">02</span> ARES <small>MARS</small></button>
    </nav>
    <div className="nav-telemetry"><span className="signal-dot"/><div><span className="micro dim">ALTITUDE / SIM.</span><span className="mono altitude">{altitude>=10?Math.round(altitude).toLocaleString('en-US'):altitude.toFixed(3)} <small>KM</small></span></div></div>
    <div className="nav-coordinates mono"><span>{formatCoordinate(coordinates.lat)}</span><span>{formatCoordinate(coordinates.lng,false)}</span></div>
    <button className={`audio-toggle ${audio?'enabled':''}`} onClick={toggleAudio} aria-label={audio?'Mute procedural audio':'Enable procedural audio'} aria-pressed={audio}><span className="waveform" aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i} style={{animationDelay:`${i*0.11}s`}}/>)}</span>{audio?<Volume2 size={15}/>:<VolumeX size={15}/>}<span className="micro">{audio?'SOUND ON':'SOUND OFF'}</span></button>
    <button className="ledger-nav micro" onClick={()=>{useReliqunixStore.getState().returnToFlight();useReliqunixStore.setState({jumpTarget:{progress:0.99,serial:Date.now()}});}}>THE LEDGER <ArrowUpRight size={14}/></button>
  </header>;
}
