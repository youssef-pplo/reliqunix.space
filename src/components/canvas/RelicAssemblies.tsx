'use client';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Line } from '@react-three/drei';
import { Html } from './TelemetryHtml';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { getRelics, type Relic, type RelicPart, type Vec3 } from '@/data/relicsData';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { generateKaptonNormal, generateSolarArrayTexture, generateDustPittingMask, installDecayShader } from '@/utils/proceduralTextures';
import { partRegistry } from '@/utils/partRegistry';
import { soundEngine } from '@/utils/soundEngine';
import NasaRelic from './NasaRelic';
import { useFlightProgress } from './FlightMotion';
import { easeFlight } from '@/utils/flightPath';

type Metal = 'foil'|'silver'|'white'|'dark'|'solar'|'orange'|'wire';
type Materials=Record<Metal,THREE.MeshStandardMaterial>;
const MaterialContext=createContext<Materials|null>(null);
function useMetal(kind:Metal='silver'){const m=useContext(MaterialContext);if(!m)throw Error('Relic material context missing');return m[kind];}
function Box({at=[0,0,0],size=[1,1,1],kind='silver',rotation=[0,0,0]}:{at?:Vec3;size?:Vec3;kind?:Metal;rotation?:Vec3}) {
  const material=useMetal(kind);
  return <mesh position={at} rotation={rotation} material={material} castShadow receiveShadow><boxGeometry args={size}/></mesh>;
}
function Cylinder({at=[0,0,0],r=0.2,top,height=0.5,kind='silver',rotation=[0,0,0],open=false,sides=24}:{at?:Vec3;r?:number;top?:number;height?:number;kind?:Metal;rotation?:Vec3;open?:boolean;sides?:number}) {
  const material=useMetal(kind);
  return <mesh position={at} rotation={rotation} material={material} castShadow receiveShadow><cylinderGeometry args={[top??r,r,height,sides,1,open]}/></mesh>;
}
function Strut({a,b,r=0.035,kind='silver'}:{a:Vec3;b:Vec3;r?:number;kind?:Metal}) {
  const material=useMetal(kind),v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),direction=v2.clone().sub(v1);
  const quaternion=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());
  return <mesh position={v1.add(v2).multiplyScalar(0.5)} quaternion={quaternion} material={material} castShadow><cylinderGeometry args={[r,r,direction.length(),8]}/></mesh>;
}
function Dish({at,r=0.55,rotation=[0.6,0,0]}:{at:Vec3;r?:number;rotation?:Vec3}) {
  const material=useMetal('silver');
  const points=useMemo(()=>Array.from({length:12},(_,i)=>{const x=i/11*r;return new THREE.Vector2(x,(x/r)**2*r*0.34);}),[r]);
  return <group position={at} rotation={rotation}>
    <mesh material={material} castShadow><latheGeometry args={[points,32]}/></mesh>
    <Strut a={[0,0,0]} b={[0,r*0.65,0]} r={0.015}/>
    {[0,2.094,4.188].map(a=><Strut key={a} a={[Math.cos(a)*r,r*0.34,Math.sin(a)*r]} b={[0,r*0.65,0]} r={0.008}/>)}
  </group>;
}
function Wheel({at,wire=true,r=0.43}:{at:Vec3;wire?:boolean;r?:number}) {
  const material=useMetal(wire?'wire':'dark'),silver=useMetal('silver');
  return <group position={at} rotation={[0,0,Math.PI/2]}>
    <mesh material={material} castShadow><cylinderGeometry args={[r,r,0.28,24,wire?4:1,true]}/></mesh>
    <mesh material={silver} rotation={[Math.PI/2,0,0]} position={[0,0.14,0]}><torusGeometry args={[r,0.022,6,32]}/></mesh>
    <mesh material={silver} rotation={[Math.PI/2,0,0]} position={[0,-0.14,0]}><torusGeometry args={[r,0.022,6,32]}/></mesh>
    <Cylinder r={r*0.23} height={0.32}/>
    {Array.from({length:12},(_,i)=>{
      const a=i/12*Math.PI*2;
      return <Strut key={i} a={[0,0.16,0]} b={[Math.cos(a)*r,0.16,Math.sin(a)*r]} r={0.012}/>;
    })}
  </group>;
}
function FabricSeat({x}:{x:number}){
  const material=useMetal('white');
  const fabric=useMemo(()=>{
    const geometry=new THREE.PlaneGeometry(0.59,0.64,12,12),positions=geometry.getAttribute('position');
    for(let i=0;i<positions.count;i++){const u=positions.getX(i)/0.295,v=positions.getY(i)/0.32;positions.setZ(i,-0.065*(1-u*u)*(1-v*v)+0.007*Math.sin(u*22));}
    geometry.computeVertexNormals();return geometry;
  },[]);
  useEffect(()=>()=>fabric.dispose(),[fabric]);
  return <group>
    <mesh position={[x,1.06,0.26]} rotation={[-Math.PI/2,0,0]} geometry={fabric} material={material} castShadow/>
    <mesh position={[x,1.39,-0.09]} rotation={[-0.16,0,0]} geometry={fabric} material={material} castShadow/>
    {[-1,1].map(side=><group key={side}>
      <Strut a={[x+side*0.33,0.86,0.56]} b={[x+side*0.33,1.06,0.56]} r={0.016}/>
      <Strut a={[x+side*0.33,1.06,0.56]} b={[x+side*0.33,1.02,-0.12]} r={0.016}/>
      <Strut a={[x+side*0.33,1.02,-0.12]} b={[x+side*0.33,1.76,-0.24]} r={0.018}/>
    </group>)}
    <Strut a={[x-0.33,1.76,-0.24]} b={[x+0.33,1.76,-0.24]} r={0.018}/>
    <Strut a={[x-0.33,1.06,0.56]} b={[x+0.33,1.06,0.56]} r={0.016}/>
    <Box at={[x,1.46,-0.047]} size={[0.04,0.48,0.018]} kind="dark" rotation={[-0.16,0,0]}/>
  </group>;
}
function RoverFender({x,z}:{x:number;z:number}){
  const material=useMetal('orange');
  return <mesh position={[x,0.46,z]} rotation={[0,0,Math.PI/2]} material={material} castShadow receiveShadow><cylinderGeometry args={[0.49,0.49,0.47,28,1,true,0,Math.PI]}/></mesh>;
}

function Part({relic,part,index,children}:{relic:Relic;part:RelicPart;index:number;children:ReactNode}) {
  const invalidate=useThree(s=>s.invalidate);
  const root=useRef<THREE.Group>(null),[hover,setHover]=useState(false);
  const active=useReliqunixStore(s=>s.activeRelicId===relic.id),selected=useReliqunixStore(s=>s.selectedPartId===part.partId);
  const isLoaded=useReliqunixStore(s=>s.isLoaded);
  const materials=useMemo(()=>{
    const common={side:THREE.DoubleSide,bumpMap:generateDustPittingMask(),bumpScale:0.012};
    return {
      foil:new THREE.MeshStandardMaterial({...common,color:'#c99936',metalness:0.87,roughness:0.38,normalMap:generateKaptonNormal(),normalScale:new THREE.Vector2(0.6,0.6)}),
      silver:new THREE.MeshStandardMaterial({...common,color:'#aaaead',metalness:0.74,roughness:0.38}),
      white:new THREE.MeshStandardMaterial({...common,color:'#ddd9c8',metalness:0.15,roughness:0.53}),
      dark:new THREE.MeshStandardMaterial({...common,color:'#252728',metalness:0.37,roughness:0.62}),
      solar:new THREE.MeshStandardMaterial({...common,color:'#b9c5df',map:generateSolarArrayTexture(),metalness:0.7,roughness:0.29}),
      orange:new THREE.MeshStandardMaterial({...common,color:'#d86638',metalness:0.05,roughness:0.8}),
      wire:new THREE.MeshStandardMaterial({...common,color:'#9c9d97',metalness:0.8,roughness:0.55,wireframe:true}),
    } satisfies Materials;
  },[]);
  const settings=useMemo(()=>Object.values(materials).map(m=>({material:m,color:m.color.clone(),roughness:m.roughness,decay:installDecayShader(m,relic.planet)})),[materials,relic.planet]);
  const dust=useMemo(()=>new THREE.Color(relic.planet==='MOON'?'#8A8D91':'#B85D3B'),[relic.planet]);
  useEffect(()=>{
    if(root.current)partRegistry.set(part.partId,root.current);
    return()=>{partRegistry.delete(part.partId);};
  },[part.partId]);
  useEffect(()=>()=>{Object.values(materials).forEach(m=>m.dispose());},[materials]);
  useFrame((_,dt)=>{
    const decay=useReliqunixStore.getState().decayTimeline/100,highlight=hover||selected;
    for(const s of settings){
      s.decay.value=decay;s.material.color.copy(s.color).lerp(dust,decay*(s.material===materials.solar?0.82:0.72));
      s.material.roughness=THREE.MathUtils.lerp(s.roughness,0.98,decay);
      s.material.emissive.set(selected?'#b84d20':'#55cfc4');s.material.emissiveIntensity=highlight?(selected?0.10:0.22):0;
      s.material.bumpScale=0.009+decay*0.035;
    }
    if(root.current){
      const goal=highlight?1.035:1;
      const scale=THREE.MathUtils.damp(root.current.scale.x,goal,8,Math.min(dt,0.05));
      root.current.scale.setScalar(Math.abs(scale-goal)<0.0001?goal:scale);
      if(root.current.scale.x!==goal)invalidate();
      root.current.rotation.z=(index%2===0?1:-1)*decay*0.04;root.current.position.y=part.lookAtOffset[1]-decay*0.35;
    }
  });
  const inspect=()=>{soundEngine.playLockClick();useReliqunixStore.getState().inspectPart(relic.id,part.partId);};
  const over=(event:ThreeEvent<PointerEvent>)=>{event.stopPropagation();setHover(true);useReliqunixStore.getState().setHoveredPart(part.shortLabel);soundEngine.playHoverPing();};
  const out=()=>{setHover(false);useReliqunixStore.getState().setHoveredPart(null);};
  return <MaterialContext.Provider value={materials}>
    <group ref={root} name={part.partId} position={part.lookAtOffset} onPointerOver={over} onPointerOut={out} onClick={e=>{e.stopPropagation();inspect();}}>
      <group position={part.lookAtOffset.map(v=>-v) as Vec3}>{children}</group>
      {active&&isLoaded&&<Html position={[0,0.45,0]} center zIndexRange={[9,0]} distanceFactor={9}>
        <button className={`part-pin ${selected?'is-selected':''}`} aria-label={`Inspect ${part.label}`} onClick={e=>{e.stopPropagation();inspect();}} onMouseEnter={()=>{setHover(true);useReliqunixStore.getState().setHoveredPart(part.shortLabel);}} onMouseLeave={out}>
          <span className="part-pin-cross">+</span>{String(index+1).padStart(2,'0')}<span className="part-pin-label">{part.shortLabel}</span>
        </button>
      </Html>}
    </group>
  </MaterialContext.Provider>;
}
function Eagle({relic}:{relic:Relic}) {
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      <Box at={[0,1.6,0]} size={[2.75,1.35,2.6]} kind="foil"/>
      <Box at={[0,2.31,0]} size={[2.9,0.10,2.7]} kind="dark"/>
      {[-1,1].map(x=><group key={x}>
        <Box at={[x*1.46,1.65,0]} size={[0.35,1.2,1.9]} kind="foil" rotation={[0,0,x*0.13]}/>
        <Cylinder at={[x*0.7,2.4,-0.5]} r={0.22} height={0.22} kind="silver"/>
        <Box at={[x*0.8,1.5,1.34]} size={[1.15,0.9,0.12]} kind="foil"/>
      </group>)}
      {Array.from({length:8},(_,i)=><Box key={i} at={[-1.2+i*0.34,2.39,0.8]} size={[0.045,0.12,0.8]} kind="silver"/>)}
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      {[0,Math.PI/2,Math.PI,Math.PI*1.5].map((angle,i)=>{
        const x=Math.cos(angle),z=Math.sin(angle);
        return <group key={i}>
          <Strut a={[x*1.1,1.95,z*1.1]} b={[x*3.2,0.3,z*3.2]} r={0.085} kind="foil"/>
          <Strut a={[x*1.1,0.95,z*1.1]} b={[x*2.9,0.5,z*2.9]} r={0.05}/>
          <Cylinder at={[x*3.2,0.14,z*3.2]} r={0.47} top={0.32} height={0.17} kind="foil"/>
          <Cylinder at={[x*2.2,1.1,z*2.2]} r={0.13} height={0.6} kind="silver" rotation={[z*0.9,0,-x*0.9]}/>
        </group>;
      })}
      <Strut a={[0,2.15,1.5]} b={[0,0.4,3]} r={0.025}/>
      <Strut a={[0.45,2.15,1.5]} b={[0.45,0.4,3]} r={0.025}/>
      {Array.from({length:7},(_,i)=><Strut key={i} a={[0,0.48+i*0.235,2.93-i*0.2]} b={[0.45,0.48+i*0.235,2.93-i*0.2]} r={0.016}/>)}
      <Box at={[0.23,1.29,2.27]} size={[0.39,0.23,0.025]} kind="silver" rotation={[-0.69,0,0]}/>
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      <Cylinder at={[0,0.65,0]} r={0.74} top={0.30} height={0.95} kind="dark" open/>
      <Cylinder at={[0,0.19,0]} r={0.76} height={0.055} kind="silver" open/>
      <Cylinder at={[0,1.3,0]} r={0.32} height={0.6} kind="silver"/>
      {[-1,1].map(i=><Strut key={i} a={[i*0.6,0.4,0]} b={[i*0.95,1.35,0]} r={0.04}/>)}
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      <Box at={[-1.55,1.57,-0.4]} size={[0.43,0.78,1.35]} kind="silver"/>
      <Box at={[-1.80,1.5,-0.4]} size={[0.06,0.9,1.6]} kind="white" rotation={[0,0,-0.16]}/>
      {Array.from({length:7},(_,i)=><Box key={i} at={[-1.81,1.12+i*0.12,-0.4]} size={[0.08,0.025,1.3]} kind="dark"/>)}
      <Strut a={[-1.6,1.9,0]} b={[-1.9,2.35,-0.8]} r={0.025}/>
    </Part>
  </>;
}
function LunarRover({relic}:{relic:Relic}) {
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      <Box at={[0,0.78,0]} size={[1.8,0.16,2.55]} kind="silver"/>
      {[-1,1].map(x=>[-1,1].map(z=><group key={`${x}${z}`}><Wheel at={[x*1.13,0.46,z*0.98]}/><Strut a={[x*0.5,0.8,z*0.6]} b={[x*1.1,0.46,z*0.98]} r={0.045}/></group>))}
      {[-1,1].map(x=><group key={x}>
        <FabricSeat x={x*0.46}/>
        <Strut a={[x*0.46,0.8,-0.2]} b={[x*0.46,1.75,-0.2]} r={0.018}/>
      </group>)}
      <Box at={[0,1.04,0.98]} size={[1.35,0.34,0.48]} kind="foil"/>
      {[-1,1].map(x=><group key={`frame-${x}`}><Strut a={[x*0.89,0.89,-1.25]} b={[x*0.89,0.89,1.25]} r={0.035}/><Box at={[x*0.39,1.225,0.98]} size={[0.04,0.025,0.49]} kind="dark"/><Strut a={[x*0.89,0.89,-1.25]} b={[x*0.89,1.16,-1.1]} r={0.02}/></group>)}
      <Strut a={[0,1.1,0.2]} b={[0,1.6,0.65]} r={0.028}/>
      <Box at={[0,1.62,0.65]} size={[0.28,0.06,0.2]} kind="dark"/>
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      <Strut a={[0.65,0.85,-0.85]} b={[0.9,2.25,-0.3]} r={0.03}/>
      <Dish at={[0.9,2.3,-0.3]} r={0.63} rotation={[1.0,0,-0.28]}/>
      <Strut a={[-0.75,0.9,-1]} b={[-0.75,2.4,-1]} r={0.018}/>
      <Cylinder at={[-0.75,2.45,-1]} r={0.12} height={0.1} kind="dark"/>
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      <Strut a={[-0.6,0.85,0.9]} b={[-0.6,1.9,-0.5]} r={0.025}/>
      <Box at={[-0.6,1.9,-0.5]} size={[0.36,0.32,0.5]} kind="white"/>
      <Cylinder at={[-0.6,1.9,-0.19]} r={0.105} height={0.18} kind="dark" rotation={[Math.PI/2,0,0]}/>
      <Box at={[-0.6,1.94,-0.8]} size={[0.43,0.4,0.1]} kind="foil"/>
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      {[-1,1].map(x=>[-1,1].map(z=><group key={`${x}${z}`}>
        <RoverFender x={x*1.15} z={z*0.98}/>
        <Box at={[x*1.15,0.78,z*1.36]} size={[0.47,0.34,0.06]} kind="orange" rotation={[z*0.18,0,0]}/>
      </group>))}
    </Part>
  </>;
}
function Surveyor({relic}:{relic:Relic}) {
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      <Strut a={[0.3,1.2,0.3]} b={[1.6,0.7,0.6]} r={0.05}/>
      <Strut a={[1.6,0.7,0.6]} b={[2.2,0.27,0.7]} r={0.035}/>
      <Cylinder at={[1.6,0.7,0.6]} r={0.11} height={0.16} rotation={[Math.PI/2,0,0]}/>
      <Box at={[2.18,0.28,0.7]} size={[0.25,0.08,0.3]} kind="dark"/>
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      <Strut a={[-0.6,1.1,0]} b={[-0.5,2.15,0]} r={0.065} kind="white"/>
      <Cylinder at={[-0.5,2.18,0]} r={0.075} height={0.05} kind="dark" open/>
      <Box at={[-0.4,1.35,0.13]} size={[0.26,0.45,0.1]} kind="foil"/>
      <Strut a={[-0.6,1.1,0]} b={[-1.4,0.3,-0.7]} r={0.03}/>
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      <Cylinder at={[0,1.23,0]} r={0.72} top={0.6} height={0.45} kind="white" sides={6}/>
      {[0,2.094,4.188].map(a=><group key={`frame-${a}`}><Strut a={[Math.cos(a)*0.62,1.55,Math.sin(a)*0.62]} b={[Math.cos(a)*0.75,0.85,Math.sin(a)*0.75]} r={0.025}/><Cylinder at={[Math.cos(a)*0.49,0.97,Math.sin(a)*0.49]} r={0.23} height={0.46} kind="foil"/></group>)}
      <Box at={[0,1.15,0.73]} size={[0.9,0.32,0.08]} kind="foil"/>
      <Strut a={[0.2,1.3,-0.2]} b={[0.2,3,-0.2]} r={0.055} kind="white"/>
      <Box at={[0.2,3.0,-0.2]} size={[1.65,0.08,0.84]} kind="solar" rotation={[0,0,0.2]}/>
      <Dish at={[0.2,2.65,-0.2]} r={0.32} rotation={[0.6,0,0]}/>
      {[0,2.094,4.188].map(a=><group key={a}>
        <Strut a={[Math.cos(a)*0.6,1.35,Math.sin(a)*0.6]} b={[Math.cos(a)*2.3,0.18,Math.sin(a)*2.3]} r={0.065} kind="white"/>
        <Strut a={[Math.cos(a)*0.5,0.9,Math.sin(a)*0.5]} b={[Math.cos(a)*2.1,0.33,Math.sin(a)*2.1]} r={0.025}/>
        <Cylinder at={[Math.cos(a)*2.3,0.1,Math.sin(a)*2.3]} r={0.34} top={0.27} height={0.12} kind="white"/>
      </group>)}
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      {[0,2.094,4.188].map(a=><group key={a}>
        <Cylinder at={[Math.cos(a)*0.72,0.72,Math.sin(a)*0.72]} r={0.2} top={0.09} height={0.42} kind="dark" open/>
        <Strut a={[Math.cos(a)*0.72,0.95,Math.sin(a)*0.72]} b={[Math.cos(a)*0.43,1.45,Math.sin(a)*0.43]} r={0.028}/>
      </group>)}
    </Part>
  </>;
}
function Opportunity({relic}:{relic:Relic}) {
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      <Box at={[0,0.92,0]} size={[1.5,0.63,1.75]} kind="foil"/>
      <Box at={[0,1.29,0]} size={[1.8,0.08,2.2]} kind="solar"/>
      {[-1,1].map(x=><group key={x}>
        <Box at={[x*1.3,1.26,-0.05]} size={[0.9,0.06,2.0]} kind="solar" rotation={[0,0,x*0.025]}/>
        {[-1,0,1].map(z=><group key={z}><Wheel at={[x*1.05,0.38,z*0.94]} r={0.36} wire={false}/><Strut a={[x*0.65,0.9,0]} b={[x*1.05,0.38,z*0.94]} r={0.045}/></group>)}
      </group>)}
      <Box at={[0,1.31,-1.14]} size={[0.9,0.06,0.2]} kind="solar"/>
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      <Cylinder at={[0,1.9,-0.55]} r={0.065} height={1.3} kind="white"/>
      <Box at={[0,2.58,-0.55]} size={[0.76,0.28,0.24]} kind="white"/>
      {[-1,1].map(x=><group key={x}><Cylinder at={[x*0.25,2.58,-0.36]} r={0.1} height={0.2} kind="dark" rotation={[Math.PI/2,0,0]}/><Cylinder at={[x*0.25,2.58,-0.245]} r={0.067} height={0.01} kind="solar" rotation={[Math.PI/2,0,0]}/></group>)}
      <Box at={[0.48,2.5,-0.57]} size={[0.2,0.22,0.28]} kind="dark"/>
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      <Strut a={[-0.55,0.9,0.9]} b={[-1.2,0.6,1.4]} r={0.075} kind="white"/>
      <Strut a={[-1.2,0.6,1.4]} b={[-0.5,0.38,2.1]} r={0.06} kind="white"/>
      <Cylinder at={[-0.5,0.4,2.1]} r={0.26} height={0.32} kind="silver" rotation={[Math.PI/2,0,0]}/>
      <Cylinder at={[-0.5,0.4,2.28]} r={0.12} height={0.04} kind="dark" rotation={[Math.PI/2,0,0]}/>
      <Cylinder at={[-1.2,0.6,1.4]} r={0.12} height={0.23} kind="dark" rotation={[0,0,Math.PI/2]}/>
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      <Strut a={[0.65,1.25,0.4]} b={[0.9,1.7,0.3]} r={0.035}/>
      <Dish at={[0.9,1.7,0.3]} r={0.44} rotation={[0.2,0,-0.2]}/>
      <Cylinder at={[-0.6,1.9,-0.7]} r={0.025} height={1.15} kind="dark"/>
    </Part>
  </>;
}
function Ingenuity({relic}:{relic:Relic}) {
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      <Box at={[0,1.02,0]} size={[0.72,0.65,0.7]} kind="foil"/>
      <Cylinder at={[0,1.76,0]} r={0.055} height={1.2} kind="dark"/>
      <Box at={[-0.28,1.9,0]} size={[2.9,0.035,0.18]} kind="dark" rotation={[0,0.22,0]}/>
      <Box at={[-0.36,2.16,0.05]} size={[2.5,0.035,0.18]} kind="dark" rotation={[0,-0.50,0]}/>
      <Box at={[1.0,1.88,-0.23]} size={[0.24,0.03,0.14]} kind="silver" rotation={[0,0.4,-0.2]}/>
      {[1.9,2.16].map(y=><Cylinder key={y} at={[0,y,0]} r={0.11} height={0.09} kind="silver"/>)}
      <Box at={[0,0.68,0.08]} size={[0.22,0.13,0.23]} kind="dark"/>
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      <Box at={[0.32,1.32,0.37]} size={[0.24,0.15,0.025]} kind="white"/>
      {Array.from({length:7},(_,i)=><Box key={i} at={[0.22+i*0.032,1.32,0.389]} size={[0.005,0.13,0.005]} kind="foil"/>)}
      <Box at={[0.32,1.32,0.35]} size={[0.29,0.2,0.025]} kind="silver"/>
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      <Box at={[0,2.47,0]} size={[1.45,0.055,0.62]} kind="solar"/>
      <Box at={[0,2.43,0]} size={[1.5,0.035,0.66]} kind="silver"/>
      <Cylinder at={[0.1,2.72,0]} r={0.012} height={0.44} kind="silver"/>
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      {[-1,1].map(x=>[-1,1].map(z=><group key={`${x}${z}`}>
        <Strut a={[x*0.3,1.02,z*0.3]} b={[x*0.82,0.14,z*0.82]} r={0.022} kind="dark"/>
        <Strut a={[x*0.82,0.14,z*0.82]} b={[x*0.98,0.11,z*0.90]} r={0.025} kind="dark"/>
      </group>))}
    </Part>
  </>;
}
function Canopy() {
  const white=useMetal('white');
  const geometry=useMemo(()=>{
    const g=new THREE.RingGeometry(0.1,3.0,64,12),p=g.attributes.position,colors=[];
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),r=Math.hypot(x,y),a=Math.atan2(y,x);
      p.setZ(i,Math.sin(x*3+y*2)*0.08+Math.sin(r*6)*0.025);
      const c=new THREE.Color((Math.floor((a+Math.PI)*10)+Math.floor(r*4))%4===0?'#df6d3b':'#ded6b9');colors.push(c.r,c.g,c.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
  },[]);
  const material=useMemo(()=>{white.vertexColors=true;return white;},[white]);
  useEffect(()=>()=>{geometry.dispose();},[geometry]);
  return <mesh position={[-3.6,0.13,-0.15]} rotation={[-Math.PI/2,0,0.16]} geometry={geometry} material={material} receiveShadow/>;
}
function EDL({relic}:{relic:Relic}) {
  const shell=useRef<THREE.Mesh>(null);
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      <mesh ref={shell} position={[0,0.82,0]} rotation={[0.12,0.25,0.14]} castShadow><coneGeometry args={[1.8,1.5,14,1,true,0,Math.PI*1.75]}/><ShellMaterial/></mesh>
      <Cylinder at={[0,0.16,0]} r={1.8} height={0.06} kind="dark" open/>
      {[0,1,2,3,4].map(i=><Box key={i} at={[1.8+Math.cos(i*2.5)*0.6,0.16,Math.sin(i*2.5)*1.8]} size={[0.45,0.07,0.55]} kind={i%2?'white':'dark'} rotation={[i*0.06,i*1.5,0.2]}/>)}
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      <Canopy/>
      {Array.from({length:12},(_,i)=><Strut key={i} a={[-3.6+Math.cos(i/12*Math.PI*2)*2.4,0.18,-0.15+Math.sin(i/12*Math.PI*2)*2.4]} b={[-0.6,0.25,0]} r={0.008} kind="white"/>)}
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      <Box at={[3.8,0.6,-1.5]} size={[2,0.28,1.4]} kind="foil" rotation={[0,0.3,0.12]}/>
      {[-1,1].map(x=>[-1,1].map(z=><Cylinder key={`${x}${z}`} at={[3.8+x,0.7,-1.5+z*0.55]} r={0.22} top={0.12} height={0.35} kind="dark" rotation={[0,0,x*0.4]} open/>))}
      <Strut a={[3,0.7,-1]} b={[2.5,0.08,0.6]} r={0.018} kind="white"/>
      <Strut a={[4.4,0.7,-1]} b={[3.5,0.08,0.9]} r={0.018} kind="white"/>
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      <Box at={[1.6,0.15,1.8]} size={[0.95,0.2,0.65]} kind="foil" rotation={[0,0.3,0.1]}/>
      {Array.from({length:15},(_,i)=><Cylinder key={i} at={[1.25+(i%5)*0.17,0.3,1.59+Math.floor(i/5)*0.17]} r={0.09} height={0.17} sides={6} kind="silver" open/>)}
    </Part>
  </>;
}
/** Educational reconstructions: proportions and deployment are illustrative. */
function Alsep({relic}:{relic:Relic}) {
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      <Box at={[0,0.55,0]} size={[1.55,0.85,1.15]} kind="foil"/>
      <Box at={[0,1.01,0]} size={[1.7,0.08,1.3]} kind="silver"/>
      {[-1,1].map(x=><group key={x}>
        <Box at={[x*1.03,1.08,0]} size={[0.55,0.055,1.23]} kind="white" rotation={[0,0,x*-0.3]}/>
        <Box at={[x*0.77,0.54,0]} size={[0.035,0.6,0.84]} kind="dark"/>
        {Array.from({length:8},(_,i)=><Box key={i} at={[x*0.79,0.29+i*0.07,0]} size={[0.06,0.025,0.87]} kind="silver"/>)}
      </group>)}
      <Box at={[0,0.59,0.59]} size={[1.17,0.53,0.045]} kind="white"/>
      {[-0.53,0,0.53].map(x=><Cylinder key={x} at={[x,0.51,0.64]} r={0.075} height={0.08} kind="dark" rotation={[Math.PI/2,0,0]}/>)}
      <Box at={[0,0.1,0]} size={[1.8,0.06,1.45]} kind="silver"/>
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      <Cylinder at={[-2.45,0.76,-0.5]} r={0.32} height={1.15} kind="dark"/>
      {Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return <Box key={i} at={[-2.45+Math.cos(a)*0.37,0.76,-0.5+Math.sin(a)*0.37]} size={[0.29,1.1,0.035]} kind="silver" rotation={[0,-a,0]}/>;})}
      <Cylinder at={[-2.45,1.36,-0.5]} r={0.3} height={0.09} kind="silver"/>
      {[-1,1].map(x=><group key={x}><Strut a={[-2.45+x*0.22,0.3,-0.5]} b={[-2.45+x*0.65,0.08,-0.5]} r={0.04}/><Box at={[-2.45+x*0.65,0.06,-0.5]} size={[0.2,0.04,0.5]} kind="silver"/></group>)}
      <Line points={[[-2.1,0.12,-0.4],[-1.7,0.05,-0.15],[-1.5,0.05,0.25],[-0.76,0.12,0.35]]} color="#bda66d" lineWidth={2}/>
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      <Cylinder at={[2.25,0.08,1.45]} r={0.87} height={0.035} kind="silver" sides={32}/>
      <Cylinder at={[2.25,0.3,1.45]} r={0.45} top={0.32} height={0.4} kind="foil"/>
      <Cylinder at={[2.25,0.52,1.45]} r={0.34} height={0.04} kind="silver"/>
      <Box at={[2.25,0.56,1.45]} size={[0.2,0.05,0.13]} kind="white"/>
      <Line points={[[0.7,0.12,0.5],[1.1,0.045,0.8],[1.3,0.045,1.1],[1.75,0.08,1.45]]} color="#bda66d" lineWidth={2}/>
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      <Strut a={[0.25,1.02,-0.22]} b={[0.25,2.45,-0.22]} r={0.035}/>
      <Cylinder at={[0.25,2.51,-0.22]} r={0.17} height={0.2} kind="white"/>
      <Box at={[0.25,2.69,-0.22]} size={[0.78,0.06,0.64]} kind="silver" rotation={[0.22,0.3,0]}/>
      <Box at={[0.25,2.74,-0.22]} size={[0.65,0.035,0.53]} kind="white" rotation={[0.22,0.3,0]}/>
      <Strut a={[0.25,1.72,-0.22]} b={[-0.55,1.02,-0.45]} r={0.018}/>
      <Strut a={[0.25,1.72,-0.22]} b={[0.6,1.02,0.45]} r={0.018}/>
    </Part>
  </>;
}
function MetCart({relic}:{relic:Relic}) {
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      {[-1,1].map(x=><group key={x}><Wheel at={[x*1.03,0.52,0.1]} r={0.5} wire={false}/><Strut a={[x*0.72,0.89,0.1]} b={[x*1.03,0.52,0.1]} r={0.07}/></group>)}
      <Strut a={[-1.03,0.52,0.1]} b={[1.03,0.52,0.1]} r={0.07}/>
      <Strut a={[-0.62,0.8,-0.8]} b={[-0.62,0.12,-1.18]} r={0.035}/>
      <Strut a={[0.62,0.8,-0.8]} b={[0.62,0.12,-1.18]} r={0.035}/>
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      <Box at={[0,0.82,0]} size={[1.6,0.09,1.9]} kind="silver"/>
      {[-1,1].map(x=><group key={x}><Box at={[x*0.79,1.03,0]} size={[0.045,0.38,1.9]} kind="white"/><Strut a={[x*0.79,1.25,-0.95]} b={[x*0.79,1.25,0.95]} r={0.028}/></group>)}
      {[-1,1].map(z=><Box key={z} at={[0,1.03,z*0.93]} size={[1.58,0.38,0.035]} kind="silver"/>)}
      <Box at={[-0.42,1.13,-0.36]} size={[0.56,0.44,0.64]} kind="white"/>
      <Box at={[-0.42,1.37,-0.36]} size={[0.6,0.05,0.68]} kind="silver"/>
      {[-0.63,-0.21].map(x=><Box key={x} at={[x,1.15,0]} size={[0.04,0.33,0.04]} kind="dark"/>)}
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      {[-1,1].map(x=><Strut key={x} a={[x*0.64,0.83,0.8]} b={[x*0.44,1.43,2.5]} r={0.035}/>)}
      <Strut a={[-0.44,1.43,2.5]} b={[0.44,1.43,2.5]} r={0.047} kind="dark"/>
      <Strut a={[-0.6,1.0,1.3]} b={[0.6,1.0,1.3]} r={0.025}/>
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      <Strut a={[0.45,0.93,-0.55]} b={[0.5,2.2,-0.75]} r={0.027}/>
      <Box at={[0.5,2.28,-0.76]} size={[0.32,0.22,0.055]} kind="silver" rotation={[-0.16,0,0]}/>
      <Strut a={[0.16,0.95,-0.7]} b={[0.2,2.0,-1.1]} r={0.023}/>
      <Box at={[0.2,2.04,-1.1]} size={[0.4,0.045,0.16]} kind="silver"/>
      {Array.from({length:7},(_,i)=><Strut key={i} a={[0.02+i*0.06,2.04,-1.14]} b={[0.02+i*0.06,2.16,-1.26]} r={0.009}/>)}
      {[0,1,2].map(i=><Cylinder key={i} at={[0.25+i*0.17,1.2,0.55]} r={0.055} height={0.62} kind="silver"/>)}
      <Box at={[-0.37,1.13,0.57]} size={[0.62,0.48,0.48]} kind="foil"/>
    </Part>
  </>;
}
function LunarCamera({relic}:{relic:Relic}) {
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      <Box at={[0,1.65,0]} size={[0.8,0.68,1.05]} kind="white"/>
      <Box at={[0,1.65,-0.56]} size={[0.72,0.59,0.09]} kind="foil"/>
      <Box at={[0,2.03,-0.08]} size={[0.86,0.07,0.96]} kind="silver"/>
      <Box at={[0.43,1.65,-0.08]} size={[0.06,0.45,0.64]} kind="foil"/>
      <Strut a={[-0.25,2.06,-0.24]} b={[-0.25,2.2,-0.24]} r={0.02}/>
      <Strut a={[0.25,2.06,-0.24]} b={[0.25,2.2,-0.24]} r={0.02}/>
      <Strut a={[-0.25,2.2,-0.24]} b={[0.25,2.2,-0.24]} r={0.02}/>
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      <Cylinder at={[0,1.65,0.66]} r={0.24} height={0.28} kind="dark" rotation={[Math.PI/2,0,0]}/>
      <Cylinder at={[0,1.65,0.82]} r={0.25} height={0.08} kind="silver" rotation={[Math.PI/2,0,0]} open/>
      <Cylinder at={[0,1.65,0.85]} r={0.19} height={0.012} kind="solar" rotation={[Math.PI/2,0,0]}/>
      <Box at={[0,1.97,0.65]} size={[0.57,0.025,0.37]} kind="white"/>
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      <Cylinder at={[0,1.25,0]} r={0.15} height={0.13} kind="silver"/>
      <Cylinder at={[0,0.96,0]} r={0.055} height={0.56} kind="silver"/>
      {[0,2.094,4.188].map(a=><group key={a}>
        <Strut a={[0,1.12,0]} b={[Math.cos(a)*0.9,0.07,Math.sin(a)*0.9]} r={0.026}/>
        <Strut a={[0,0.63,0]} b={[Math.cos(a)*0.6,0.42,Math.sin(a)*0.6]} r={0.015}/>
        <Cylinder at={[Math.cos(a)*0.9,0.045,Math.sin(a)*0.9]} r={0.09} height={0.025} kind="dark"/>
      </group>)}
      <Strut a={[0,1.25,0]} b={[-0.48,1.14,-0.4]} r={0.018}/>
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      <Line points={[[0.4,1.5,-0.4],[0.6,0.5,-0.5],[0.9,0.04,-0.4],[1.55,0.04,-0.3],[1.85,0.04,0.1],[2.4,0.04,0.1],[2.7,0.04,-0.4]]} color="#aaa799" lineWidth={2.5}/>
      {Array.from({length:4},(_,i)=><mesh key={i} position={[2.7,0.045+i*0.018,-0.65]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[0.42+i*0.018,0.014,5,40]}/><meshStandardMaterial color="#aaa799" roughness={0.9}/></mesh>)}
      <Box at={[1.6,0.1,0.8]} size={[0.34,0.16,0.22]} kind="silver"/>
    </Part>
  </>;
}
function Sojourner({relic}:{relic:Relic}) {
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      <Box at={[0,0.59,0]} size={[1.05,0.52,1.65]} kind="foil"/>
      {[-1,1].map(x=><group key={x}>
        {[-1,0,1].map(z=><group key={z}><Wheel at={[x*0.8,0.28,z*0.7]} r={0.27} wire={false}/><Strut a={[x*0.55,0.6,z===1?0.4:-0.3]} b={[x*0.8,0.28,z*0.7]} r={0.03}/></group>)}
        <Strut a={[x*0.68,0.64,-0.35]} b={[x*0.68,0.64,0.4]} r={0.045}/>
      </group>)}
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      <Box at={[0,0.9,0]} size={[1.36,0.08,1.85]} kind="silver"/>
      <Box at={[0,0.95,0]} size={[1.29,0.025,1.78]} kind="solar"/>
      {[-0.43,0.43].map(x=><Box key={x} at={[x,0.968,0]} size={[0.012,0.007,1.8]} kind="silver"/>)}
      <Cylinder at={[-0.45,1.3,-0.65]} r={0.012} height={0.7} kind="silver"/>
      <Cylinder at={[-0.45,1.66,-0.65]} r={0.025} height={0.04} kind="dark"/>
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      <Box at={[0,0.7,0.89]} size={[0.97,0.25,0.16]} kind="silver"/>
      {[-1,1].map(x=><group key={x}><Cylinder at={[x*0.36,0.73,1.01]} r={0.095} height={0.1} kind="dark" rotation={[Math.PI/2,0,0]}/><Cylinder at={[x*0.36,0.73,1.07]} r={0.055} height={0.015} kind="solar" rotation={[Math.PI/2,0,0]}/></group>)}
      {[-0.22,0.22].map(x=><Box key={x} at={[x,0.5,0.92]} size={[0.07,0.06,0.045]} kind="dark"/>)}
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      <Strut a={[0,0.64,-0.82]} b={[0,0.4,-1.2]} r={0.045}/>
      <Cylinder at={[0,0.4,-1.24]} r={0.17} height={0.18} kind="silver" rotation={[Math.PI/2,0,0]}/>
      <Cylinder at={[0,0.4,-1.35]} r={0.12} height={0.04} kind="dark" rotation={[Math.PI/2,0,0]}/>
      <Box at={[0,0.64,-0.89]} size={[0.3,0.2,0.1]} kind="white"/>
    </Part>
  </>;
}
function InSight({relic}:{relic:Relic}) {
  return <>
    <Part relic={relic} part={relic.parts[0]} index={0}>
      <Cylinder at={[0,1.0,0]} r={1.18} top={1.06} height={0.5} kind="foil" sides={6}/>
      <Cylinder at={[0,1.28,0]} r={1.16} height={0.08} kind="silver" sides={6}/>
      {[-1,1].map(x=><group key={x}>
        <Strut a={[x*0.8,1.1,0]} b={[x*2.35,1.04,0]} r={0.06}/>
        <Cylinder at={[x*2.35,1.08,0]} r={1.25} height={0.025} kind="solar" sides={48}/>
        <Cylinder at={[x*2.35,1.11,0]} r={0.15} height={0.03} kind="silver"/>
        {Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2;return <Strut key={i} a={[x*2.35,1.11,0]} b={[x*2.35+Math.cos(a)*1.25,1.11,Math.sin(a)*1.25]} r={0.009}/>;})}
      </group>)}
      {[Math.PI/2,Math.PI*7/6,Math.PI*11/6].map(a=><group key={a}>
        <Strut a={[Math.cos(a)*0.85,1.1,Math.sin(a)*0.85]} b={[Math.cos(a)*1.65,0.13,Math.sin(a)*1.65]} r={0.055}/>
        <Strut a={[Math.cos(a+0.4)*0.8,0.8,Math.sin(a+0.4)*0.8]} b={[Math.cos(a)*1.65,0.13,Math.sin(a)*1.65]} r={0.025}/>
        <Cylinder at={[Math.cos(a)*1.65,0.09,Math.sin(a)*1.65]} r={0.23} top={0.17} height={0.09} kind="silver"/>
      </group>)}
    </Part>
    <Part relic={relic} part={relic.parts[1]} index={1}>
      <SeismicDome/>
      <Line points={[[0.5,1.25,0.8],[0.65,0.18,1.4],[0.9,0.04,1.8],[0.8,0.04,2.25],[0.45,0.08,2.55]]} color="#c7a36d" lineWidth={5}/>
      <Box at={[1.7,0.19,2.25]} size={[0.35,0.3,0.45]} kind="silver"/>
    </Part>
    <Part relic={relic} part={relic.parts[2]} index={2}>
      <Cylinder at={[-0.65,1.47,0.5]} r={0.18} height={0.32} kind="white"/>
      <Strut a={[-0.65,1.55,0.5]} b={[-0.7,2.12,-0.45]} r={0.085} kind="white"/>
      <Cylinder at={[-0.7,2.12,-0.45]} r={0.14} height={0.22} kind="silver" rotation={[0,0,Math.PI/2]}/>
      <Strut a={[-0.7,2.12,-0.45]} b={[-0.8,1.65,-1.5]} r={0.065} kind="white"/>
      <Box at={[-0.8,1.65,-1.5]} size={[0.25,0.2,0.3]} kind="silver"/>
      <Strut a={[-0.8,1.56,-1.5]} b={[-0.8,1.23,-1.5]} r={0.015} kind="dark"/>
      {[-1,1].map(x=><Strut key={x} a={[-0.8,1.23,-1.5]} b={[-0.8+x*0.13,1.1,-1.5]} r={0.015}/>)}
    </Part>
    <Part relic={relic} part={relic.parts[3]} index={3}>
      {[-1,1].map(x=><group key={x}><Cylinder at={[x*0.65,1.52,-0.4]} r={0.11} height={0.42} kind="white"/><Cylinder at={[x*0.65,1.74,-0.4]} r={0.25} height={0.045} kind="white"/></group>)}
      <Cylinder at={[0.55,1.85,0.38]} r={0.018} height={0.95} kind="silver"/>
      <Box at={[0.22,1.5,0]} size={[0.55,0.38,0.5]} kind="foil"/>
      <Cylinder at={[0.42,1.42,0.72]} r={0.09} height={0.13} kind="dark" rotation={[Math.PI/2,0,0]}/>
    </Part>
  </>;
}
function SeismicDome(){
  const white=useMetal('white');
  return <group position={[0,0.07,2.7]}>
    <mesh material={white} castShadow><sphereGeometry args={[0.65,32,16,0,Math.PI*2,0,Math.PI/2]}/></mesh>
    <Cylinder at={[0,0.025,0]} r={0.72} height={0.05} kind="silver"/>
    <Box at={[0,0.68,0]} size={[0.15,0.05,0.12]} kind="silver"/>
  </group>;
}

function ShellMaterial(){const material=useMetal('white');return <primitive object={material} attach="material"/>;}
const Assemblies:Record<string,({relic}:{relic:Relic})=>ReactNode>={eagle:Eagle,lrv:LunarRover,surveyor:Surveyor,opportunity:Opportunity,ingenuity:Ingenuity,edl:EDL,alsep:Alsep,met:MetCart,camera:LunarCamera,spirit:Opportunity,sojourner:Sojourner,insight:InSight};
export default function RelicAssemblies() {
  const planet=useReliqunixStore(s=>s.celestialBody),root=useRef<THREE.Group>(null);
  const progress=useFlightProgress();
  const opacity=useRef(-1),originals=useMemo(()=>new WeakMap<THREE.Material,{opacity:number;transparent:boolean;depthWrite:boolean}>(),[planet]);
  useFrame(({camera})=>{
    if(!root.current)return;
    const fade=easeFlight(progress.current,.305,.35);
    root.current.visible=fade>0;
    for(const child of root.current.children)child.visible=Math.abs(child.position.z-camera.position.z)<34;
    if(fade<1||opacity.current!==fade){
      root.current.traverse(object=>{
        if(!(object instanceof THREE.Mesh))return;
        const materials=Array.isArray(object.material)?object.material:[object.material];
        for(const material of materials){
          let base=originals.get(material);
          if(!base){base={opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite};originals.set(material,base);}
          material.opacity=base.opacity*fade;material.transparent=fade<1||base.transparent;material.depthWrite=fade<1?false:base.depthWrite;
        }
      });
      opacity.current=fade;
    }
  });
  return <group ref={root} visible={false}>{getRelics(planet).map(relic=>{
    const Assembly=Assemblies[relic.id];
    return <group key={relic.id} position={relic.position}>
      <NasaRelic relic={relic} fallback={<Assembly relic={relic}/>}/>
      <Line points={[[-4,0.01,-3],[-4,0.01,3],[4,0.01,3],[4,0.01,-3],[-4,0.01,-3]]} color="#bb9b70" lineWidth={0.5} transparent opacity={0.18} dashed dashSize={0.15} gapSize={0.3}/>
    </group>;
  })}</group>;
}
