'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReliqunixStore } from '@/store/useReliqunixStore';
export default function CustomCursor() {
  const label=useReliqunixStore(s=>s.hoveredPartLabel),reduced=useReliqunixStore(s=>s.reducedMotion);
  const [visible,setVisible]=useState(false),[pointer,setPointer]=useState(false),[enabled,setEnabled]=useState(false);
  const x=useMotionValue(-100),y=useMotionValue(-100),sx=useSpring(x,{stiffness:700,damping:42,mass:0.3}),sy=useSpring(y,{stiffness:700,damping:42,mass:0.3});
  useEffect(()=>{
    const fine=window.matchMedia('(pointer: fine)').matches&&!reduced;setEnabled(fine);if(!fine)return;
    const move=(e:PointerEvent)=>{x.set(e.clientX);y.set(e.clientY);setVisible(true);};
    const over=(e:PointerEvent)=>setPointer(!!(e.target as HTMLElement).closest?.('button,a,input'));
    const leave=()=>setVisible(false);
    document.addEventListener('pointermove',move);document.addEventListener('pointerover',over);document.addEventListener('pointerleave',leave);
    document.documentElement.classList.add('custom-cursor-enabled');
    return()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerover',over);document.removeEventListener('pointerleave',leave);document.documentElement.classList.remove('custom-cursor-enabled');};
  },[x,y,reduced]);
  if(!enabled)return null;
  return <motion.div className={`custom-cursor ${label?'target-locked':pointer?'is-pointer':''}`} style={{x:sx,y:sy,opacity:visible?1:0}} aria-hidden="true"><span className="cursor-reticle"><i/><i/><i/><i/><b/></span>{label&&<span className="cursor-label mono">{label}<small>CLICK TO INSPECT ↗</small></span>}</motion.div>;
}
