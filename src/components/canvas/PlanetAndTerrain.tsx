'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Line, Stars } from '@react-three/drei';
import { Html } from './TelemetryHtml';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getRelics, type CelestialBody } from '@/data/relicsData';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { craterHeight, fractalNoise, generateTerrainTextures, seededRandom } from '@/utils/proceduralTextures';
import { soundEngine } from '@/utils/soundEngine';

export function latLngToVector(lat:number,lng:number,radius:number) {
  const phi=THREE.MathUtils.degToRad(lat),theta=THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(Math.cos(phi)*Math.cos(theta)*radius,Math.sin(phi)*radius,-Math.cos(phi)*Math.sin(theta)*radius);
}
function OrbitalGlobe({planet}:{planet:CelestialBody}) {
  const root=useRef<THREE.Group>(null),sphere=useRef<THREE.Group>(null),ring=useRef<THREE.Group>(null);
  const material=useRef<THREE.MeshStandardMaterial>(null);
  const maps=useMemo(()=>generateTerrainTextures(planet),[planet]);
  const [official,setOfficial]=useState<THREE.Texture|null>(null);
  const [heightMap,setHeightMap]=useState<THREE.Texture|null>(null);
  const relics=getRelics(planet);
  useEffect(()=>{
    let alive=true;const owned:THREE.Texture[]=[];
    setOfficial(null);setHeightMap(null);
    fetch('/assets/manifest.json').then(r=>r.json()).then((manifest:{textures:Record<string,string>})=>{
      const url=manifest.textures[planet.toLowerCase()];
      if(!url)return;
      new THREE.TextureLoader().load(url,t=>{owned.push(t);if(!alive){t.dispose();return;}t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;setOfficial(t);},undefined,()=>{});
      if(url.includes('nasa'))new THREE.TextureLoader().load('/assets/textures/moon-height.jpg',t=>{owned.push(t);if(alive)setHeightMap(t);else t.dispose();},undefined,()=>{});
    }).catch(()=>{});
    return()=>{alive=false;owned.forEach(t=>t.dispose());};
  },[planet]);
  const rim=useMemo(()=>({
    uniforms:{rimColor:{value:new THREE.Color(planet==='MARS'?'#d67b47':'#b0b8ba')},opacity:{value:planet==='MARS'?0.24:0.085}},
    vertexShader:'varying vec3 vNormal; varying vec3 vPosition; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal);vPosition=p.xyz;gl_Position=projectionMatrix*p;}',
    fragmentShader:'uniform vec3 rimColor;uniform float opacity;varying vec3 vNormal;varying vec3 vPosition;void main(){float f=pow(1.0-abs(dot(normalize(vNormal),normalize(-vPosition))),4.0);gl_FragColor=vec4(rimColor,f*opacity);}',
  }),[planet]);
  const orbit=useMemo(()=>Array.from({length:161},(_,i)=>{const a=i/160*Math.PI*2;return new THREE.Vector3(Math.cos(a)*14.4,0,Math.sin(a)*14.4);}),[]);
  useFrame(()=>{
    if(!root.current)return;
    const p=useReliqunixStore.getState().scrollProgress,fade=1-THREE.MathUtils.smoothstep(p,0.22,0.38);
    root.current.visible=p<0.385;
    root.current.scale.setScalar(1+(1-fade)*0.45);
    root.current.position.set(8.8,12-(1-fade)*22,-(1-fade)*10);
    if(material.current)material.current.opacity=fade;
    rim.uniforms.opacity.value=fade*(planet==='MARS'?0.24:0.085);
    if(sphere.current)sphere.current.rotation.y=-Math.PI/2-(planet==='MOON'?0.36:0.68);

  });
  return <group ref={root} position={[10,12,0]}>
    <group ref={sphere} rotation={[0,-Math.PI/2+0.1,-0.11]}>
      <mesh>
        <sphereGeometry args={[10.6,128,96]}/>
        <meshStandardMaterial ref={material} map={official??maps.albedo} bumpMap={heightMap??maps.height} bumpScale={official?0.17:0.32} envMapIntensity={0.025} roughness={0.98} color={planet==='MOON'?'#dededb':'#d8b79d'} transparent/>
      </mesh>
      <mesh scale={1.009}><sphereGeometry args={[10.6,64,48]}/><shaderMaterial args={[rim]} transparent depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>
      {relics.map((relic,i)=>{
        const position=latLngToVector(relic.coordinates.lat,relic.coordinates.lng,10.75);
        return <group key={relic.id} position={position}>
          <mesh onPointerOver={e=>{e.stopPropagation();soundEngine.playHoverPing();}} onClick={e=>{e.stopPropagation();useReliqunixStore.getState().jumpToRelic(relic.id);}}>
            <sphereGeometry args={[0.11,12,12]}/><meshBasicMaterial color="#ff7747" toneMapped={false}/>
          </mesh>
          <Html center distanceFactor={36} zIndexRange={[7,0]} style={{pointerEvents:'auto'}}>
            <button className="orbital-pin" onClick={()=>useReliqunixStore.getState().jumpToRelic(relic.id)} aria-label={`Fly to ${relic.name}`}><span className="beacon-dot"/><span>0{i+1}<b>{relic.shortName}</b></span></button>
          </Html>
        </group>;
      })}
    </group>
    <group ref={ring} rotation={[0,0,-0.22]}>
      <group rotation={[1.16,0.12,0]}><Line points={orbit} color="#b7b6a9" lineWidth={0.65} transparent opacity={0.22}/></group>
      <group rotation={[0.5,0.15,1.1]}><Line points={orbit} color="#b7b6a9" lineWidth={0.6} transparent opacity={0.10}/></group>
    </group>
    <mesh rotation={[Math.PI/2,0,0]} position={[0,-13,0]}><ringGeometry args={[0.04,0.08,32]}/><meshBasicMaterial color="#ff7747" side={THREE.DoubleSide}/></mesh>
  </group>;
}

/** Gentle local relief with a broad, distant rim; the exhibit pads stay level. */
function surfaceHeight(x:number,z:number,planet:CelestialBody) {
  const distance=Math.min(...[0,-35,-70].map(p=>Math.hypot(x,z-p)));
  const perimeter=THREE.MathUtils.smoothstep(Math.hypot(x,(z+35)*0.68),34,105);
  const ridge=fractalNoise(x*0.025+27,z*0.025+39,3)*(planet==='MARS'?12:8)*perimeter;
  const ripple=planet==='MARS'?Math.sin(x*0.32+z*0.085)*0.07:0;
  return craterHeight(x,z)*0.39+(ridge+ripple)*THREE.MathUtils.smoothstep(distance,5,14);
}

/** Small cached maps carry powder grain, not oversized repeating crater rings. */
const regolithCache=new Map<CelestialBody,{albedo:THREE.CanvasTexture;normal:THREE.CanvasTexture;roughness:THREE.CanvasTexture}>();
function regolithMaps(planet:CelestialBody) {
  const cached=regolithCache.get(planet);if(cached)return cached;
  const size=256,random=seededRandom(planet==='MOON'?231:819),height=new Float32Array(size*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)height[y*size+x]=fractalNoise(x*0.07,y*0.07,3)*0.65+random()*0.35;
  const create=(kind:'albedo'|'normal'|'roughness')=>{
    const c=document.createElement('canvas');c.width=c.height=size;
    const ctx=c.getContext('2d');if(!ctx)throw Error('Canvas 2D unavailable');
    const data=ctx.createImageData(size,size),base=planet==='MOON'?[127,127,120]:[161,103,72];
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const i=y*size+x,j=i*4,h=height[i];
      if(kind==='normal'){
        const dx=(height[y*size+(x+1)%size]-height[y*size+(x+size-1)%size])*0.48;
        const dy=(height[((y+1)%size)*size+x]-height[((y+size-1)%size)*size+x])*0.48;
        const length=Math.sqrt(dx*dx+dy*dy+1);
        data.data[j]=(0.5-dx/length*0.5)*255;data.data[j+1]=(0.5-dy/length*0.5)*255;data.data[j+2]=255/length;
      }else for(let channel=0;channel<3;channel++)data.data[j+channel]=kind==='roughness'?218+h*35:base[channel]*(0.78+h*0.39);
      data.data[j+3]=255;
    }
    ctx.putImageData(data,0,0);
    const texture=new THREE.CanvasTexture(c);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(66,66);texture.anisotropy=4;
    if(kind==='albedo')texture.colorSpace=THREE.SRGBColorSpace;
    return texture;
  };
  const maps={albedo:create('albedo'),normal:create('normal'),roughness:create('roughness')};regolithCache.set(planet,maps);return maps;
}

function MartianHorizon() {
  const material=useRef<THREE.ShaderMaterial>(null);
  const shader=useMemo(()=>({
    uniforms:{opacity:{value:0}},
    vertexShader:'varying vec3 worldPosition; void main(){vec4 world=modelMatrix*vec4(position,1.0);worldPosition=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}',
    fragmentShader:'uniform float opacity; varying vec3 worldPosition; void main(){vec3 direction=normalize(worldPosition-cameraPosition);float horizon=pow(max(0.0,1.0-abs(direction.y)),7.0);vec3 color=mix(vec3(0.19,0.09,0.055),vec3(0.48,0.25,0.14),pow(horizon,2.0));gl_FragColor=vec4(color,horizon*opacity);}',
  }),[]);
  useFrame(()=>{if(material.current)material.current.uniforms.opacity.value=THREE.MathUtils.smoothstep(useReliqunixStore.getState().scrollProgress,0.22,0.38)*0.73;});
  return <mesh position={[0,0,-35]} renderOrder={-5}><sphereGeometry args={[135,32,16]}/><shaderMaterial ref={material} args={[shader]} side={THREE.BackSide} transparent depthWrite={false} toneMapped={false}/></mesh>;
}

function SurfaceTerrain({planet}:{planet:CelestialBody}) {
  const root=useRef<THREE.Group>(null),rocks=useRef<THREE.InstancedMesh>(null);
  const groundMaterial=useRef<THREE.MeshStandardMaterial>(null),rockMaterial=useRef<THREE.MeshStandardMaterial>(null),dustMaterial=useRef<THREE.PointsMaterial>(null);
  const maps=useMemo(()=>regolithMaps(planet),[planet]);
  const normalScale=useMemo(()=>new THREE.Vector2(0.42,0.42),[]);
  const geometry=useMemo(()=>{
    const geo=new THREE.PlaneGeometry(230,230,120,120),p=geo.attributes.position;
    for(let i=0;i<p.count;i++)p.setZ(i,surfaceHeight(p.getX(i),-p.getY(i)-35,planet));
    geo.computeVertexNormals();return geo;
  },[planet]);
  const particles=useMemo(()=>{
    const rand=seededRandom(planet==='MOON'?52:21),positions=new Float32Array(160*3);
    for(let i=0;i<160;i++){positions[i*3]=(rand()-0.5)*80;positions[i*3+1]=0.2+rand()*5;positions[i*3+2]=10-rand()*110;}
    return positions;
  },[planet]);
  useEffect(()=>{
    if(!rocks.current)return;const rand=seededRandom(429),dummy=new THREE.Object3D(),color=new THREE.Color();
    for(let i=0;i<640;i++){
      const foreground=i<400;
      let x=(rand()-0.5)*(foreground?76:190),z=(foreground?15:35)-rand()*(foreground?115:190);
      if(Math.min(...[0,-35,-70].map(v=>Math.hypot(x,z-v)))<4.3)x+=Math.sign(x||1)*5;
      const scale=foreground?0.035+rand()**3*0.37:0.17+rand()**3*1.45;
      dummy.position.set(x,surfaceHeight(x,z,planet)+scale*0.22-0.05,z);
      dummy.rotation.set(rand()*Math.PI,rand()*Math.PI,rand()*Math.PI);dummy.scale.set(scale,scale*(0.32+rand()*0.65),scale*(0.6+rand()*0.8));dummy.updateMatrix();rocks.current.setMatrixAt(i,dummy.matrix);
      color.setScalar(0.67+rand()*0.43);rocks.current.setColorAt(i,color);
    }
    rocks.current.instanceMatrix.needsUpdate=true;
    if(rocks.current.instanceColor)rocks.current.instanceColor.needsUpdate=true;
  },[planet]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useFrame(()=>{
    const p=useReliqunixStore.getState().scrollProgress,fade=THREE.MathUtils.smoothstep(p,0.22,0.38);
    if(root.current)root.current.visible=p>=0.22;
    if(groundMaterial.current)groundMaterial.current.opacity=fade;
    if(rockMaterial.current)rockMaterial.current.opacity=fade;
    if(dustMaterial.current)dustMaterial.current.opacity=fade*(planet==='MARS'?0.11:0.018);
  });
  return <group ref={root} visible={false}>
    {planet==='MARS'&&<MartianHorizon/>}
    <mesh geometry={geometry} rotation={[-Math.PI/2,0,0]} position={[0,-0.05,-35]} receiveShadow>
      <meshStandardMaterial ref={groundMaterial} map={maps.albedo} normalMap={maps.normal} normalScale={normalScale} roughnessMap={maps.roughness} roughness={1} envMapIntensity={0.14} transparent/>
    </mesh>
    <instancedMesh ref={rocks} args={[undefined,undefined,640]} receiveShadow frustumCulled={false}>
      <dodecahedronGeometry args={[1,0]}/><meshStandardMaterial ref={rockMaterial} color={planet==='MOON'?'#77776f':'#a47351'} roughness={0.98} envMapIntensity={0.10} transparent/>
    </instancedMesh>
    <points frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles,3]}/></bufferGeometry><pointsMaterial ref={dustMaterial} color={planet==='MOON'?'#b7b7a9':'#cc9d76'} size={0.018} transparent depthWrite={false} sizeAttenuation/></points>
  </group>;
}
export default function PlanetAndTerrain() {
  const planet=useReliqunixStore(s=>s.celestialBody);
  return <><Stars radius={150} depth={100} count={1600} factor={1.6} saturation={0} fade speed={0}/><OrbitalGlobe planet={planet}/><SurfaceTerrain planet={planet}/></>;
}
