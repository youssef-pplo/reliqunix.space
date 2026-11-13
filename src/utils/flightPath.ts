import * as THREE from 'three';
import { getRelics, type CelestialBody } from '@/data/relicsData';

export const FLIGHT = { approach: 0.04, terrain: 0.28, groundReady: 0.35, landed: 0.38 } as const;
export const easeFlight = (progress:number,from:number,to:number) => THREE.MathUtils.smootherstep(progress,from,to);

export function latLngToVector(lat:number,lng:number,radius:number) {
  const phi=THREE.MathUtils.degToRad(lat),theta=THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(Math.cos(phi)*Math.cos(theta)*radius,Math.sin(phi)*radius,-Math.cos(phi)*Math.sin(theta)*radius);
}

export function splineParameter(progress:number,stops:number[]) {
  const index=stops.findIndex((_,i)=>i<stops.length-1&&progress<=stops[i+1]);
  const i=index<0?stops.length-2:Math.max(0,index);
  return (i+easeFlight(progress,stops[i],stops[i+1]))/(stops.length-1);
}

/** The landing site stays anchored as a curved world becomes a local landscape. */
export function createFlightPath(planet:CelestialBody) {
  const relics=getRelics(planet),first=relics[0],last=relics[relics.length-1].position[2];
  const radius=10.6,orbitCenter=new THREE.Vector3(8.8,12,0);
  const orbitRotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-Math.PI/2-(planet==='MOON'?0.36:0.68),-0.11));
  const landingNormal=latLngToVector(first.coordinates.lat,first.coordinates.lng,1).applyQuaternion(orbitRotation);
  const landingAnchor=landingNormal.clone().multiplyScalar(radius).add(orbitCenter);
  const turn=new THREE.Quaternion().setFromUnitVectors(landingNormal,new THREE.Vector3(0,1,0));
  const inverseTurn=turn.clone().invert(),rotation=new THREE.Quaternion(),normal=new THREE.Vector3(),anchor=new THREE.Vector3();
  const offset=new THREE.Vector3(),endOffset=new THREE.Vector3(),lookOffset=new THREE.Vector3(),surfaceTarget=new THREE.Vector3();
  const stops=[FLIGHT.landed,...relics.map(r=>r.splineProgress),.94,1];
  const points=[new THREE.Vector3(8,3.8,13),...relics.map((r,i)=>new THREE.Vector3(i%2?6:7,3.4,r.position[2]+9)),new THREE.Vector3(8,5,last-10),new THREE.Vector3(6,10,last-24)];
  const targets=[new THREE.Vector3(0,1.2,0),...relics.map(r=>new THREE.Vector3(0,1.2,r.position[2])),new THREE.Vector3(0,1.2,last-4),new THREE.Vector3(0,1.2,last-18)];
  const curve=new THREE.CatmullRomCurve3(points,false,'catmullrom',.35),targetCurve=new THREE.CatmullRomCurve3(targets,false,'catmullrom',.35);

  function sampleFrame(progress:number) {
    const turnProgress=easeFlight(progress,.06,.30);
    rotation.identity().slerp(turn,turnProgress);
    normal.copy(landingNormal).applyQuaternion(rotation);
    anchor.copy(landingAnchor).multiplyScalar(1-turnProgress);
    // Expanding the radius around the landing point lets the horizon flatten naturally.
    return radius*Math.exp(Math.log(420/radius)*easeFlight(progress,.10,.32));
  }

  return {
    sampleGlobe(progress:number,center:THREE.Vector3,orientation:THREE.Quaternion) {
      const currentRadius=sampleFrame(progress);
      center.copy(anchor).addScaledVector(normal,-currentRadius);
      orientation.copy(rotation).multiply(orbitRotation);
      return currentRadius/radius;
    },
    sampleCamera(progress:number,width:number,position:THREE.Vector3,target:THREE.Vector3) {
      const mobile=width<750,framing=mobile?1.85:1.15;
      surfaceTarget.set(mobile?0:-2.1,1.2,0);
      if(progress>=FLIGHT.landed){
        const t=splineParameter(progress,stops);
        curve.getPoint(t,position);targetCurve.getPoint(t,target);target.x=surfaceTarget.x;
        position.sub(target).multiplyScalar(framing).add(target);
        return;
      }
      sampleFrame(progress);
      endOffset.copy(points[0]).sub(surfaceTarget).multiplyScalar(framing).add(surfaceTarget).applyQuaternion(inverseTurn);
      offset.set(mobile?8:0,18,mobile?52:42).sub(landingAnchor).lerp(endOffset,easeFlight(progress,0,FLIGHT.landed)).applyQuaternion(rotation);
      position.copy(anchor).add(offset);
      lookOffset.set(mobile?7:0,11,0).sub(landingAnchor).applyQuaternion(rotation).multiplyScalar(1-easeFlight(progress,FLIGHT.approach,.25));
      target.copy(anchor).add(lookOffset).addScaledVector(surfaceTarget,easeFlight(progress,.25,FLIGHT.landed));
    },
  };
}
