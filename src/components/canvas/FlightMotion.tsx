'use client';
import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useReliqunixStore } from '@/store/useReliqunixStore';

const FlightContext=createContext({current:0});
export const useFlightProgress=()=>useContext(FlightContext);

/** Camera, lighting and geometry use one clock, including when scrolling stops or reverses. */
export default function FlightMotion({children}:{children:ReactNode}) {
  const progress=useRef(useReliqunixStore.getState().scrollProgress),planet=useRef(useReliqunixStore.getState().celestialBody);
  const invalidate=useThree(s=>s.invalidate);
  useFrame((_,dt)=>{
    const state=useReliqunixStore.getState();
    if(planet.current!==state.celestialBody||state.reducedMotion){
      planet.current=state.celestialBody;progress.current=state.scrollProgress;
    }else{
      progress.current=THREE.MathUtils.damp(progress.current,state.scrollProgress,9,Math.min(dt,.05));
      if(Math.abs(progress.current-state.scrollProgress)<.00001)progress.current=state.scrollProgress;
    }
    if(progress.current!==state.scrollProgress)invalidate();
  },-2);
  return <FlightContext.Provider value={progress}>{children}</FlightContext.Provider>;
}
