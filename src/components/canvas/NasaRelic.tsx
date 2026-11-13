'use client';
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { type Relic, type Vec3 } from '@/data/relicsData';
import { getModelAsset, type RelicModelAsset } from '@/data/modelAssets';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { partRegistry } from '@/utils/partRegistry';
import { installDecayShader, generateKaptonNormal } from '@/utils/proceduralTextures';
import { soundEngine } from '@/utils/soundEngine';
import { Html } from './TelemetryHtml';

interface PreparedPart {group:THREE.Group;center:THREE.Vector3;radius:number;materials:THREE.MeshStandardMaterial[];geometries:THREE.BufferGeometry[];}
function lineage(object:THREE.Object3D):string[]{const names:string[]=[];let parent:THREE.Object3D|null=object;while(parent){names.push(parent.name);parent=parent.parent;}return names;}

function componentFor(relic:Relic,mesh:THREE.Mesh,box:THREE.Box3,full:THREE.Box3):number {
  const name=lineage(mesh).join(' ').toLowerCase(),material=(Array.isArray(mesh.material)?mesh.material[0]:mesh.material).name.toLowerCase();
  const center=box.getCenter(new THREE.Vector3()),size=full.getSize(new THREE.Vector3()),y=(center.y-full.min.y)/size.y;
  if(relic.id==='eagle'){
    if(/pplane/.test(name))return 3;
    if(/group13.*pc/.test(name))return 2;
    if(/group31[ _]*(?:1[5-9]|20)(?:$|\s)/.test(name))return 1;
    if(/polysurfa1/.test(name))return 1;
    if(/group13.*p2/.test(name))return 3;
    return 0;
  }
  if(relic.id==='ingenuity'){
    if(/rotor|parts_0/.test(name))return 0;
    if(/leg_/.test(name))return 3;
    if(/solar|antenna/.test(name))return 2;
    return 1;
  }
  if(relic.id==='opportunity'||relic.id==='spirit'){
    if(/arm/.test(material+' '+name))return 2;
    if(/mast/.test(material+' '+name))return 1;
    if(/instrument|silver/.test(material)&&!/foil/.test(material))return 3;
    if(/foil_silver/.test(material))return 1;
    return 0;
  }
  if(/wheel|suspension/.test(name+' '+material))return 0;
  if(/camera/.test(name))return 2;
  if(/dish|antenna/.test(name))return 1;
  return y>0.7?1:0;
}

function prepare(scene:THREE.Group,relic:Relic,asset:RelicModelAsset):PreparedPart[]{
  const original=scene.clone(true);
  if(asset.rotation)original.rotation.set(...asset.rotation);
  original.updateMatrixWorld(true);
  const meshes:THREE.Mesh[]=[];
  original.traverse(object=>{if(object instanceof THREE.Mesh){
    object.geometry.computeBoundingBox();
    const box=object.geometry.boundingBox!.clone().applyMatrix4(object.matrixWorld);
    // NASA's source depicts the complete LM. Only descent hardware stayed.
    if(relic.id==='eagle'&&!lineage(object).some(name=>/^(group31|group13.*p[2c]|pcylinder[13]$|polysurfa1$|pplane[12]$)/i.test(name)))return;
    meshes.push(object);
  }});
  const full=new THREE.Box3();
  for(const mesh of meshes)full.union(mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld));
  const size=full.getSize(new THREE.Vector3()),center=full.getCenter(new THREE.Vector3());
  const scale=asset.width/Math.max(size.x,size.z);
  const normalization=new THREE.Matrix4().makeScale(scale,scale,scale).multiply(new THREE.Matrix4().makeTranslation(-center.x,-full.min.y,-center.z));
  const result:PreparedPart[]=relic.parts.map(()=>({group:new THREE.Group(),center:new THREE.Vector3(),radius:0,materials:[],geometries:[]}));
  const buckets=new Map<string,{part:number;material:THREE.MeshStandardMaterial;geometries:THREE.BufferGeometry[]}>();
  for(const mesh of meshes){
    const worldBox=mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld);
    const index=componentFor(relic,mesh,worldBox,full),part=result[index];
    const source=(Array.isArray(mesh.material)?mesh.material[0]:mesh.material) as THREE.MeshStandardMaterial;
    const geometry=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld).applyMatrix4(normalization);
    const gold=relic.id==='eagle'&&!source.map&&source.color.r>0.45&&source.color.g>0.25&&source.color.b<0.28;
    if(gold||!geometry.getAttribute('uv')){
      // Untextured NASA foil has stretched source UVs. Project in world units
      // so its added crinkle detail keeps the same scale on every panel.
      const positions=geometry.getAttribute('position'),uv=new Float32Array(positions.count*2);
      for(let i=0;i<positions.count;i++){
        uv[i*2]=(positions.getX(i)+positions.getZ(i)*0.63)*1.2;
        uv[i*2+1]=(positions.getY(i)+positions.getZ(i)*0.41)*1.2;
      }
      geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    }
    const signature=Object.keys(geometry.attributes).sort().map(key=>`${key}:${geometry.attributes[key].itemSize}`).join(',');
    const key=`${index}:${source.uuid}:${signature}:${!!geometry.index}`;
    let bucket=buckets.get(key);
    if(!bucket){
      const material=source.clone();material.envMapIntensity=0.65;
      material.roughness=Math.max(0.28,material.roughness);material.side=THREE.DoubleSide;
      if(relic.id==='eagle'&&!material.map&&material.color.r>0.45&&material.color.g>0.25&&material.color.b<0.28){
        material.color.set('#bd8a35');material.metalness=0.82;material.roughness=0.42;
        material.normalMap=generateKaptonNormal();material.normalScale.set(0.42,0.42);
      }
      part.materials.push(material);bucket={part:index,material,geometries:[]};buckets.set(key,bucket);
    }
    bucket.geometries.push(geometry);
  }
  for(const bucket of buckets.values()){
    const merged=bucket.geometries.length>1?mergeGeometries(bucket.geometries,false):bucket.geometries[0];
    const geometries=merged?[merged]:bucket.geometries;
    if(merged&&bucket.geometries.length>1)bucket.geometries.forEach(g=>g.dispose());
    for(const geometry of geometries){
      const mesh=new THREE.Mesh(geometry,bucket.material);mesh.castShadow=true;mesh.receiveShadow=true;
      result[bucket.part].group.add(mesh);result[bucket.part].geometries.push(geometry);
    }
  }
  result.forEach((part,index)=>{
    const bounds=new THREE.Box3().setFromObject(part.group);
    if(bounds.isEmpty())part.center.set(...relic.parts[index].lookAtOffset);
    else {bounds.getCenter(part.center);part.radius=bounds.getSize(new THREE.Vector3()).length()*0.5;}
    // Focus the ladder/plaque on one landing leg rather than the four-leg span.
    if(relic.id==='eagle'&&index===1){part.center.set(-0.043,1.265,2.47).applyMatrix4(normalization);part.radius=0.85;}
    for(const child of part.group.children)child.position.sub(part.center);
    part.group.userData.inspectionRadius=part.radius;
  });
  return result;
}

function SourcePart({prepared,relic,index}:{prepared:PreparedPart;relic:Relic;index:number}){
  const root=useRef<THREE.Group>(null),[hover,setHover]=useState(false),invalidate=useThree(s=>s.invalidate);
  const active=useReliqunixStore(s=>s.activeRelicId===relic.id),selected=useReliqunixStore(s=>s.selectedPartId===relic.parts[index].partId);
  const part=relic.parts[index];
  const materialStates=useMemo(()=>prepared.materials.map(material=>({material,color:material.color.clone(),roughness:material.roughness,uniform:installDecayShader(material,relic.planet)})),[prepared,relic.planet]);
  const dust=useMemo(()=>new THREE.Color(relic.planet==='MOON'?'#8a8d91':'#b85d3b'),[relic.planet]);
  useEffect(()=>{
    if(root.current){root.current.userData.inspectionRadius=prepared.radius;partRegistry.set(part.partId,root.current);}
    return()=>{partRegistry.delete(part.partId);};
  },[part.partId,prepared.radius]);
  useFrame((_,dt)=>{
    const d=useReliqunixStore.getState().decayTimeline/100;
    for(const state of materialStates){
      state.uniform.value=d;state.material.color.copy(state.color).lerp(dust,d*0.25);
      state.material.roughness=THREE.MathUtils.lerp(state.roughness,0.96,d*0.8);
      state.material.emissive.set(selected?'#d56b32':'#72c2b3');state.material.emissiveIntensity=selected?0.12:hover?0.18:0;
    }
    if(root.current){
      const goal=hover||selected?1.012:1,scale=THREE.MathUtils.damp(root.current.scale.x,goal,9,Math.min(dt,0.05));
      root.current.scale.setScalar(Math.abs(scale-goal)<0.0001?goal:scale);
      root.current.position.y=prepared.center.y-d*0.12;
      if(root.current.scale.x!==goal)invalidate();
    }
  });
  const over=(event:ThreeEvent<PointerEvent>)=>{event.stopPropagation();setHover(true);useReliqunixStore.getState().setHoveredPart(part.shortLabel);soundEngine.playHoverPing();};
  const out=()=>{setHover(false);useReliqunixStore.getState().setHoveredPart(null);};
  const inspect=()=>{soundEngine.playLockClick();useReliqunixStore.getState().inspectPart(relic.id,part.partId);};
  return <group ref={root} position={prepared.center} onPointerOver={over} onPointerOut={out} onClick={e=>{e.stopPropagation();inspect();}}>
    <primitive object={prepared.group}/>
    {active&&<Html position={[0,0.15,0]} center distanceFactor={8.5} zIndexRange={[9,0]}><button className={`part-pin ${selected?'is-selected':''}`} onClick={inspect} aria-label={`Inspect ${part.label}`}><span className="part-pin-cross">+</span>{String(index+1).padStart(2,'0')}<span className="part-pin-label">{part.shortLabel}</span></button></Html>}
  </group>;
}

function LoadedAsset({relic,asset}:{relic:Relic;asset:RelicModelAsset}){
  const {scene}=useGLTF(asset.path,'/assets/draco/');
  const prepared=useMemo(()=>prepare(scene,relic,asset),[scene,relic,asset]);
  useEffect(()=>()=>{prepared.forEach(p=>{p.geometries.forEach(g=>g.dispose());p.materials.forEach(m=>m.dispose());});},[prepared]);
  return <>{prepared.map((part,index)=><SourcePart key={relic.parts[index].partId} prepared={part} relic={relic} index={index}/>)}</>;
}
class AssetBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?this.props.fallback:this.props.children;}
}
export default function NasaRelic({relic,fallback}:{relic:Relic;fallback:ReactNode}){
  const asset=getModelAsset(relic.id);
  const nearby=useReliqunixStore(s=>s.scrollProgress>0.18&&Math.abs(s.scrollProgress-relic.splineProgress)<0.27||s.activeRelicId===relic.id);
  const [requested,setRequested]=useState(false);
  useEffect(()=>{if(nearby)setRequested(true);},[nearby]);
  if(!asset||!requested)return fallback;
  const loading=<group>{fallback}{nearby&&<Html position={[0,3.5,0]} center><div className="asset-loading" role="status"><span/>RESTORING NASA GEOMETRY</div></Html>}</group>;
  return <AssetBoundary fallback={fallback}><Suspense fallback={loading}><LoadedAsset relic={relic} asset={asset}/></Suspense></AssetBoundary>;
}
