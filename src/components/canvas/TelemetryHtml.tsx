'use client';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '@/data/relicsData';

/** Project DOM telemetry onto live 3D groups. Deferred root cleanup is React 19 safe. */
export function Html({children,position=[0,0,0],center=false,distanceFactor=10,zIndexRange=[9,0],style}:{children:ReactNode;position?:Vec3;center?:boolean;distanceFactor?:number;zIndexRange?:[number,number];style?:CSSProperties}) {
  const {gl,camera,size}=useThree(),group=useRef<THREE.Group>(null),element=useRef<HTMLDivElement|null>(null),root=useRef<Root|null>(null);
  const vector=useRef(new THREE.Vector3()),cameraPosition=useRef(new THREE.Vector3());
  useEffect(()=>{
    const host=document.createElement('div');
    Object.assign(host.style,{position:'absolute',top:'0',left:'0',transformOrigin:'0 0',pointerEvents:'none'});
    gl.domElement.parentElement?.appendChild(host);element.current=host;
    const domRoot=createRoot(host);root.current=domRoot;
    return()=>{host.remove();element.current=null;root.current=null;queueMicrotask(()=>domRoot.unmount());};
  },[gl]);
  useEffect(()=>{
    root.current?.render(<div style={{position:'absolute',transform:center?'translate(-50%,-50%)':undefined,pointerEvents:'auto',...style}}>{children}</div>);
  },[children,center,style]);
  useFrame(()=>{
    if(!group.current||!element.current)return;
    let object:THREE.Object3D|null=group.current,visible=true;
    while(object){if(!object.visible){visible=false;break;}object=object.parent;}
    group.current.getWorldPosition(vector.current);camera.getWorldPosition(cameraPosition.current);
    const distance=vector.current.distanceTo(cameraPosition.current);vector.current.project(camera);
    visible=visible&&vector.current.z<1&&vector.current.z>-1&&Math.abs(vector.current.x)<1.3&&Math.abs(vector.current.y)<1.3;
    element.current.style.display=visible?'block':'none';
    if(!visible)return;
    const x=(vector.current.x*0.5+0.5)*size.width,y=(-vector.current.y*0.5+0.5)*size.height;
    const scale=THREE.MathUtils.clamp(distanceFactor/(2*Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov)/2)*distance),0.7,1.6);
    element.current.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`;
    element.current.style.zIndex=String(zIndexRange[0]);
  });
  return <group ref={group} position={position}/>;
}
