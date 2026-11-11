'use client';
import { Component, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { getRelic } from '@/data/relicsData';
import PlanetAndTerrain from './PlanetAndTerrain';
import RelicAssemblies from './RelicAssemblies';
import CameraRig from './CameraRig';

class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){useReliqunixStore.getState().setGraphicsAvailable(false);}
  render(){return this.state.failed?null:this.props.children;}
}
function SceneSetup(){
  const {gl,scene,camera}=useThree(),sun=useRef<THREE.DirectionalLight>(null),bounce=useRef<THREE.HemisphereLight>(null);
  useEffect(()=>{
    const generator=new THREE.PMREMGenerator(gl),room=new RoomEnvironment();
    const environment=generator.fromScene(room,0.04);
    scene.environment=environment.texture;scene.environmentIntensity=0.32;
    room.dispose();generator.dispose();
    const timer=setTimeout(()=>useReliqunixStore.getState().setSceneReady(),100);
    const lost=(event:Event)=>{event.preventDefault();useReliqunixStore.getState().setGraphicsAvailable(false);};
    const canvas=gl.domElement;canvas.addEventListener('webglcontextlost',lost);
    return()=>{clearTimeout(timer);canvas.removeEventListener('webglcontextlost',lost);environment.dispose();scene.environment=null;};
  },[gl,scene]);
  useFrame(()=>{
    const state=useReliqunixStore.getState(),surface=THREE.MathUtils.smoothstep(state.scrollProgress,0.25,0.4),mars=state.celestialBody==='MARS';
    if(scene.fog instanceof THREE.FogExp2){scene.fog.density=surface*(mars?0.010:0.0038);scene.fog.color.set(mars?'#5a392b':'#101315');}
    // A low key light and restrained sky fill preserve shape, metal and deep shadows.
    // The PMREM is generated locally once; no HDR network dependency or extra pass.
    scene.environmentIntensity=THREE.MathUtils.lerp(0.025,mars?0.38:0.28,surface);
    if(bounce.current){
      bounce.current.intensity=THREE.MathUtils.lerp(0.035,mars?0.34:0.19,surface);
      bounce.current.color.set(mars?'#c7a491':'#80909e');
      bounce.current.groundColor.set(mars?'#48291d':'#242624');
    }
    if(sun.current){
      const relic=getRelic(state.activeRelicId),z=surface?(relic?.position[2]??camera.position.z-7):0;
      sun.current.position.set(THREE.MathUtils.lerp(-15,-22,surface),THREE.MathUtils.lerp(24,18,surface),z+26);
      sun.current.target.position.set(0,0,z);sun.current.target.updateMatrixWorld();
      sun.current.color.set(mars?'#ffdfbd':'#f2f1ec');
      sun.current.intensity=THREE.MathUtils.lerp(2.35,mars?2.75:3.0,surface);
    }
  });
  return <>
    <fogExp2 attach="fog" args={['#090a0b',0]}/>
    <ambientLight intensity={0.018}/>
    <hemisphereLight ref={bounce} args={['#a7b5c3','#30251e',0.05]}/>
    <directionalLight ref={sun} position={[-22,18,26]} intensity={3} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-camera-near={0.5} shadow-camera-far={100} shadow-bias={-0.0002} shadow-normalBias={0.018}/>
    <CameraRig/>
  </>;
}
function RenderOnInteraction(){
  const invalidate=useThree(s=>s.invalidate);
  useEffect(()=>useReliqunixStore.subscribe((state,previous)=>{
    if(state.scrollProgress!==previous.scrollProgress||state.cameraPhase!==previous.cameraPhase||state.selectedPartId!==previous.selectedPartId||state.decayTimeline!==previous.decayTimeline||state.celestialBody!==previous.celestialBody||state.hoveredPartLabel!==previous.hoveredPartLabel)invalidate(2);
  }),[invalidate]);
  return null;
}
export default function Experience(){
  const available=useReliqunixStore(s=>s.graphicsAvailable);
  useEffect(()=>{
    const c=document.createElement('canvas');
    const supported=!!(c.getContext('webgl2')||c.getContext('webgl'));
    if(!supported)useReliqunixStore.getState().setGraphicsAvailable(false);
  },[]);
  if(!available)return null;
  return <SceneBoundary><div className="experience-canvas" aria-label="Interactive 3D archive of the Moon and Mars">
    <Canvas frameloop="demand" shadows={{type:THREE.PCFShadowMap}} dpr={1} camera={{position:[0,18,42],fov:40,near:0.1,far:500}} gl={{antialias:true,alpha:true,toneMapping:THREE.ACESFilmicToneMapping,powerPreference:'high-performance'}} fallback={null} onCreated={({gl})=>{gl.setClearColor('#08090a',0);gl.toneMappingExposure=0.97;}}>
      <Suspense fallback={null}>
        <SceneSetup/><RenderOnInteraction/><PlanetAndTerrain/><RelicAssemblies/>
      </Suspense>
    </Canvas>
  </div></SceneBoundary>;
}
