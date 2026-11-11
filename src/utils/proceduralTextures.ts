import * as THREE from 'three';
import type { CelestialBody } from '@/data/relicsData';

export function seededRandom(seed:number) {
  let value=seed>>>0;
  return ()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
}
const hash=(x:number,y:number)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
export function perlinNoise(x:number,y:number):number {
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),u),THREE.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),u),v);
}
export function fractalNoise(x:number,y:number,octaves=5) {
  let result=0,amplitude=0.5;
  for(let i=0;i<octaves;i++){result+=perlinNoise(x,y)*amplitude;x*=2.03;y*=2.03;amplitude*=0.5;}
  return result;
}
export function craterHeight(x:number,z:number) {
  let height=fractalNoise(x*0.045,z*0.045)*1.6+fractalNoise(x*0.32,z*0.32)*0.14-0.55;
  const craters=[[-16,-12,7],[15,-30,5],[-13,-51,8],[22,-69,6],[-30,15,12],[27,6,9]];
  for(const [cx,cz,r] of craters){const d=Math.hypot(x-cx,z-cz)/r;height+=Math.exp(-(((d-1)*7)**2))*0.8-Math.max(0,1-d*d)*0.9;}
  // Level the exhibit pads without flattening the surrounding landscape.
  const pad=Math.min(...[0,-35,-70].map(p=>Math.hypot(x,z-p)));
  return height*THREE.MathUtils.smoothstep(pad,3.6,8.5)-0.03;
}
function canvas(size:number) {
  const c=document.createElement('canvas');c.width=c.height=size;
  const ctx=c.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw new Error('Canvas 2D unavailable');
  return {canvas:c,ctx};
}
function texture(c:HTMLCanvasElement,color=false) {
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;
  if(color)t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
export interface PBRMaps { albedo:THREE.CanvasTexture; height:THREE.CanvasTexture; normal:THREE.CanvasTexture; roughness:THREE.CanvasTexture; }
const cache=new Map<string,PBRMaps>();
export function generateTerrainTextures(planet:CelestialBody,size=512):PBRMaps {
  const key=`terrain-${planet}-${size}`;const cached=cache.get(key);if(cached)return cached;
  const a=canvas(size),h=canvas(size),n=canvas(size),r=canvas(size);
  const ad=a.ctx.createImageData(size,size),hd=h.ctx.createImageData(size,size),nd=n.ctx.createImageData(size,size),rd=r.ctx.createImageData(size,size);
  const heights=new Float32Array(size*size),rand=seededRandom(planet==='MOON'?701:204);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)heights[y*size+x]=fractalNoise(x*0.016,y*0.016,6);
  for(let i=0;i<90;i++){
    const cx=rand()*size,cy=rand()*size,radius=4+rand()**3*size*0.12;
    for(let y=Math.max(0,Math.floor(cy-radius*1.4));y<Math.min(size,cy+radius*1.4);y++)for(let x=Math.max(0,Math.floor(cx-radius*1.4));x<Math.min(size,cx+radius*1.4);x++){
      const d=Math.hypot(x-cx,y-cy)/radius;
      heights[y*size+x]+=Math.exp(-(((d-1)*9)**2))*0.11-Math.max(0,1-d*d)*0.18;
    }
  }
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=y*size+x,j=i*4,v=heights[i],grain=rand()*0.07;
    const rgb=planet==='MOON'?[137,135,126]:[178,103,68];
    for(let c=0;c<3;c++){ad.data[j+c]=rgb[c]*(0.65+v*0.75)+grain*30;hd.data[j+c]=v*255;rd.data[j+c]=190+v*60;}
    const dx=heights[y*size+(x+1)%size]-heights[y*size+(x+size-1)%size];
    const dy=heights[((y+1)%size)*size+x]-heights[((y+size-1)%size)*size+x];
    const normal=new THREE.Vector3(-dx*6,-dy*6,1).normalize();
    nd.data[j]=(normal.x*0.5+0.5)*255;nd.data[j+1]=(normal.y*0.5+0.5)*255;nd.data[j+2]=normal.z*255;
    ad.data[j+3]=hd.data[j+3]=nd.data[j+3]=rd.data[j+3]=255;
  }
  a.ctx.putImageData(ad,0,0);h.ctx.putImageData(hd,0,0);n.ctx.putImageData(nd,0,0);r.ctx.putImageData(rd,0,0);
  const maps={albedo:texture(a.canvas,true),height:texture(h.canvas),normal:texture(n.canvas),roughness:texture(r.canvas)};
  cache.set(key,maps);return maps;
}
let foil:THREE.CanvasTexture|undefined;
export function generateKaptonNormal(size=256) {
  if(foil)return foil;
  const {canvas:c,ctx}=canvas(size),data=ctx.createImageData(size,size),rand=seededRandom(61);
  // Jittered Voronoi cells: distance-to-edge creates thin, sharp foil creases.
  const cells=16,points=Array.from({length:cells*cells},()=>[rand(),rand()]);
  const field=(x:number,y:number)=>{
    const gx=x/size*cells,gy=y/size*cells,ix=Math.floor(gx),iy=Math.floor(gy);let first=10,second=10;
    for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
      const xx=ix+ox,yy=iy+oy,p=points[((yy+cells)%cells)*cells+((xx+cells)%cells)];
      const d=Math.hypot(gx-xx-p[0],gy-yy-p[1]);if(d<first){second=first;first=d;}else if(d<second)second=d;
    }
    return Math.pow(Math.min(1,(second-first)*3),0.45)*0.6+perlinNoise(x*0.11,y*0.11)*0.13;
  };
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const j=(y*size+x)*4,v=new THREE.Vector3((field(x-1,y)-field(x+1,y))*3,(field(x,y-1)-field(x,y+1))*3,1).normalize();
    data.data[j]=(v.x*0.5+0.5)*255;data.data[j+1]=(v.y*0.5+0.5)*255;data.data[j+2]=v.z*255;data.data[j+3]=255;
  }
  ctx.putImageData(data,0,0);foil=texture(c);return foil;
}
let solar:THREE.CanvasTexture|undefined;
export function generateSolarArrayTexture(size=1024) {
  if(solar)return solar;
  const {canvas:c,ctx}=canvas(size),rand=seededRandom(77);
  ctx.fillStyle='#aaa9a0';ctx.fillRect(0,0,size,size);
  const cell=size/12;
  for(let y=0;y<12;y++)for(let x=0;x<12;x++){
    ctx.fillStyle=`hsl(${220+rand()*20} 45% ${14+rand()*10}%)`;ctx.fillRect(x*cell+2,y*cell+2,cell-4,cell-4);
    ctx.strokeStyle='rgba(157,177,198,.45)';ctx.lineWidth=0.7;
    for(let b=1;b<9;b++){const xx=x*cell+b*cell/9;ctx.beginPath();ctx.moveTo(xx,y*cell+3);ctx.lineTo(xx,(y+1)*cell-3);ctx.stroke();}
    ctx.fillStyle='#c4bb9a';ctx.fillRect(x*cell+cell*0.48,y*cell+2,1.6,cell-4);
  }
  solar=texture(c,true);return solar;
}
let dust:THREE.CanvasTexture|undefined;
export function generateDustPittingMask(size=256) {
  if(dust)return dust;
  const {canvas:c,ctx}=canvas(size),data=ctx.createImageData(size,size),rand=seededRandom(210);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const j=(y*size+x)*4,n=fractalNoise(x*0.04,y*0.04)*200+rand()*50;
    data.data[j]=data.data[j+1]=data.data[j+2]=n;data.data[j+3]=255;
  }
  ctx.putImageData(data,0,0);ctx.fillStyle='#101010';
  for(let i=0;i<800;i++){ctx.beginPath();ctx.arc(rand()*size,rand()*size,0.3+rand()*1.2,0,Math.PI*2);ctx.fill();}
  dust=texture(c);return dust;
}
/** Injects a live dust/pitting uniform without regenerating textures while scrubbing. */
export function installDecayShader(material:THREE.MeshStandardMaterial,planet:CelestialBody) {
  const uniform={value:0};
  material.onBeforeCompile=shader=>{
    shader.uniforms.decayFactor=uniform;
    shader.uniforms.archiveDustColor={value:new THREE.Color(planet==='MOON'?'#8A8D91':'#B85D3B')};
    shader.fragmentShader='uniform float decayFactor;\nuniform vec3 archiveDustColor;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float grain = fract(sin(dot(vViewPosition.xy, vec2(12.9898,78.233))) * 43758.5453);
      float deposit = smoothstep(0.25, 0.95, grain) * decayFactor * 0.42;
      diffuseColor.rgb = mix(diffuseColor.rgb, archiveDustColor, deposit);
    `);
  };
  material.customProgramCacheKey=()=>`archive-decay-${planet}`;
  return uniform;
}
