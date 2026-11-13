'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getRelic } from '@/data/relicsData';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { partRegistry } from '@/utils/partRegistry';
import { createFlightPath, easeFlight } from '@/utils/flightPath';
import { useFlightProgress } from './FlightMotion';

export default function CameraRig() {
  const {camera,size,invalidate}=useThree();
  const phase=useReliqunixStore(s=>s.cameraPhase);
  const planet=useReliqunixStore(s=>s.celestialBody);
  const look=useRef(new THREE.Vector3(0,11,0));
  const route=useMemo(()=>createFlightPath(planet),[planet]),progress=useFlightProgress();
  const returning=useRef(false);
  const desired=useMemo(()=>new THREE.Vector3(),[]),target=useMemo(()=>new THREE.Vector3(),[]);
  const world=useMemo(()=>new THREE.Vector3(),[]);
  useEffect(()=>{returning.current=false;},[planet]);
  useEffect(()=>{
    const c=camera as THREE.PerspectiveCamera;
    if(phase==='INSPECT'&&size.width>900)c.setViewOffset(size.width,size.height,size.width*0.17,0,size.width,size.height);
    else if(phase==='INSPECT')c.setViewOffset(size.width,size.height,0,size.height*0.24,size.width,size.height);
    else c.clearViewOffset();
    c.updateProjectionMatrix();
  },[camera,size,phase]);
  useFrame((_,dt)=>{
    const state=useReliqunixStore.getState(),p=progress.current;
    const delta=Math.min(dt,0.05),relic=getRelic(state.activeRelicId);
    const c=camera as THREE.PerspectiveCamera;
    if(state.cameraPhase!=='INSPECT'&&size.width<750){
      c.setViewOffset(size.width,size.height,0,size.height*.19*easeFlight(p,.25,.38),size.width,size.height);
    }
    if(state.cameraPhase==='INSPECT'&&relic&&state.selectedPartId){
      const part=relic.parts.find(part=>part.partId===state.selectedPartId),group=partRegistry.get(state.selectedPartId);
      if(part){
        if(group)group.getWorldPosition(world);else world.set(...relic.position).add(new THREE.Vector3(...part.lookAtOffset));
        target.copy(world);
        const offset=new THREE.Vector3(...part.cameraOffset).sub(new THREE.Vector3(...part.lookAtOffset));
        const radius=group?.userData.inspectionRadius as number|undefined;
        if(radius&&Number.isFinite(radius))offset.setLength(THREE.MathUtils.clamp(radius*2+1.2,2.4,8));
        desired.copy(world).add(offset.multiplyScalar(size.width<700?1.6:1));
        returning.current=true;
      }
    }else{
      route.sampleCamera(p,size.width,desired,target);
    }
    // The approach itself is already smoothed. A second camera lag would detach
    // the viewpoint from the expanding globe and let it clip through the surface.
    if(state.cameraPhase!=='INSPECT'&&!returning.current){camera.position.copy(desired);look.current.copy(target);}
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
    if(state.cameraPhase!=='INSPECT'&&camera.position.distanceToSquared(desired)<.0001&&look.current.distanceToSquared(target)<.0001)returning.current=false;
    camera.lookAt(look.current);
    if(camera.position.distanceToSquared(desired)>0||look.current.distanceToSquared(target)>0)invalidate();
  });
  return null;
}
