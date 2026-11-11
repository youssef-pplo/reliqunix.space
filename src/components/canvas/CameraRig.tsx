'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getRelic } from '@/data/relicsData';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { partRegistry } from '@/utils/partRegistry';

const stops=[0,0.12,0.22,0.38,0.45,0.55,0.65,0.75,0.85,0.94,1];
const flightPoints=[[0,18,42],[2,16,36],[12,6,18],[8,3.8,13],[7,3.2,8],[5,1.8,-12],[6,2.7,-27],[-4,1.8,-48],[7,3,-62],[8,4,-76],[6,10,-91]];
export function splineParameter(progress:number) {
  const i=Math.min(stops.length-2,Math.max(0,stops.findIndex((_,i)=>i<stops.length-1&&progress<=stops[i+1])));
  return (i+THREE.MathUtils.clamp((progress-stops[i])/(stops[i+1]-stops[i]),0,1))/(stops.length-1);
}
export default function CameraRig() {
  const {camera,size,invalidate}=useThree();
  const phase=useReliqunixStore(s=>s.cameraPhase);
  const look=useRef(new THREE.Vector3(0,11,0));
  const curve=useMemo(()=>new THREE.CatmullRomCurve3(flightPoints.map(p=>new THREE.Vector3(...p)),false,'catmullrom',0.38),[]);
  const desired=useMemo(()=>new THREE.Vector3(),[]),target=useMemo(()=>new THREE.Vector3(),[]);
  const world=useMemo(()=>new THREE.Vector3(),[]);
  useEffect(()=>{
    const c=camera as THREE.PerspectiveCamera;
    if(phase==='INSPECT'&&size.width>900)c.setViewOffset(size.width,size.height,size.width*0.17,0,size.width,size.height);
    else if(phase==='INSPECT')c.setViewOffset(size.width,size.height,0,size.height*0.24,size.width,size.height);
    else if(phase==='SURFACE_TOUR'&&size.width<750)c.setViewOffset(size.width,size.height,0,size.height*0.19,size.width,size.height);
    else c.clearViewOffset();
    c.updateProjectionMatrix();
  },[camera,size,phase]);
  useFrame((_,dt)=>{
    const state=useReliqunixStore.getState(),p=state.scrollProgress;
    const delta=Math.min(dt,0.05),relic=getRelic(state.activeRelicId);
    if(state.cameraPhase==='INSPECT'&&relic&&state.selectedPartId){
      const part=relic.parts.find(part=>part.partId===state.selectedPartId),group=partRegistry.get(state.selectedPartId);
      if(part){
        if(group)group.getWorldPosition(world);else world.set(...relic.position).add(new THREE.Vector3(...part.lookAtOffset));
        target.copy(world);
        const offset=new THREE.Vector3(...part.cameraOffset).sub(new THREE.Vector3(...part.lookAtOffset));
        const radius=group?.userData.inspectionRadius as number|undefined;
        if(radius&&Number.isFinite(radius))offset.setLength(THREE.MathUtils.clamp(radius*2+1.2,2.4,8));
        desired.copy(world).add(offset.multiplyScalar(size.width<700?1.6:1));
      }
    }else{
      curve.getPoint(splineParameter(p),desired);
      const orbital=new THREE.Vector3(0,11,0);
      const surfaceZ=THREE.MathUtils.lerp(0,-70,THREE.MathUtils.clamp((p-0.45)/0.4,0,1));
      target.set(size.width<750?0:-2.8,1.2,surfaceZ);
      if(p<0.38)target.lerp(orbital,1-THREE.MathUtils.smoothstep(p,0.12,0.38));
      if(p>0.94)target.z=THREE.MathUtils.lerp(-70,-85,(p-0.94)/0.06);
      if(p>=0.38&&size.width<750)desired.sub(target).multiplyScalar(1.85).add(target);
      if(p<0.18&&size.width<750){desired.x+=8;desired.z+=10;target.x+=7;}
    }
    const damping=state.reducedMotion?18:4.2;
    camera.position.x=THREE.MathUtils.damp(camera.position.x,desired.x,damping,delta);
    camera.position.y=THREE.MathUtils.damp(camera.position.y,desired.y,damping,delta);
    camera.position.z=THREE.MathUtils.damp(camera.position.z,desired.z,damping,delta);
    look.current.x=THREE.MathUtils.damp(look.current.x,target.x,damping,delta);
    look.current.y=THREE.MathUtils.damp(look.current.y,target.y,damping,delta);
    look.current.z=THREE.MathUtils.damp(look.current.z,target.z,damping,delta);
    // Finish transitions exactly so a stationary view cannot keep drifting.
    if(camera.position.distanceToSquared(desired)<1e-8)camera.position.copy(desired);
    if(look.current.distanceToSquared(target)<1e-8)look.current.copy(target);
    camera.lookAt(look.current);
    if(camera.position.distanceToSquared(desired)>0||look.current.distanceToSquared(target)>0)invalidate();
  });
  return null;
}
