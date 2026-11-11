import assert from 'node:assert/strict';
import { readFile, access, mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url),temporary=await mkdtemp(join(tmpdir(),'reliqunix-test-'));
let js;
try {
  const compiler=join(dirname(require.resolve('typescript/package.json')),'bin/tsc');
  const result=spawnSync(process.execPath,[compiler,join(root,'src/data/relicsData.ts'),'--ignoreConfig','--target','ES2020','--module','ESNext','--skipLibCheck','--outDir',temporary],{encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);
  js=await readFile(join(temporary,'relicsData.js'),'utf8');
} finally { await rm(temporary,{recursive:true,force:true}); }
const {relicsData,formatCoordinate}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
assert.equal(relicsData.length,6,'Six complete relic records');
const ids=new Set(),parts=new Set();
for(const planet of ['MOON','MARS']){
  const records=relicsData.filter(r=>r.planet===planet);
  assert.equal(records.length,3,`Three records for ${planet}`);
  assert.deepEqual(records.map(r=>r.splineProgress),[0.45,0.65,0.85],'Archive stops align with the flight');
}
for(const relic of relicsData){
  assert(!ids.has(relic.id),'Unique relic identifier');ids.add(relic.id);
  assert.equal(relic.parts.length,4,`${relic.id}: four engineering targets`);
  assert(relic.coordinates.lat>=-90&&relic.coordinates.lat<=90,'Valid latitude');
  assert(relic.coordinates.lng>=-180&&relic.coordinates.lng<=360,'Valid longitude');
  assert(relic.massKg>0&&relic.massNote,'Mass has provenance and scope');
  assert(new URL(relic.sourceUrl).hostname.endsWith('nasa.gov'),'Primary NASA source');
  for(const field of ['scientificStory','whyAbandoned','environmentalThreat','archiveQuote','sourceTitle'])assert(relic[field]?.length>10,`${relic.id}: ${field} populated`);
  for(const part of relic.parts){
    assert(!parts.has(part.partId),'Unique component identifier');parts.add(part.partId);
    assert(part.story.length>90&&part.material&&part.status&&part.telemetryCode,'Substantive engineering record');
    assert(part.cameraOffset.every(Number.isFinite)&&part.lookAtOffset.every(Number.isFinite),'Finite camera targets');
    assert.notDeepEqual(part.cameraOffset,part.lookAtOffset,'Inspection camera is outside its focus point');
  }
}
assert.equal(parts.size,24,'Twenty-four distinct inspection targets');
assert.equal(formatCoordinate(354.7384,false),'5.2616° W','Positive-east coordinates normalize correctly');
assert.equal(formatCoordinate(-3.0162),'3.0162° S','Southern latitudes preserve their hemisphere');
const manifest=JSON.parse(await readFile(join(root,'public/assets/manifest.json'),'utf8'));
for(const path of Object.values(manifest.textures))await access(join(root,'public',path));
for(const model of manifest.models){
  const file=await readFile(join(root,'public',model.path));assert.equal(file.toString('utf8',0,4),'glTF','Cached NASA model is a real binary glTF');
}
const catalog=JSON.parse(await readFile(join(root,'public/assets/nasa-model-catalog.json'),'utf8'));
for(const id of ['eagle','ingenuity','opportunity']){
  const model=catalog.models.find(m=>m.id===id);
  assert(model&&model.credit&&model.source&&model.page,`${id}: original model provenance`);
  assert(model.bytes<5000000,`${id}: web model stays below 5 MB`);
  assert(manifest.models.some(m=>m.path===model.path),`${id}: manifest includes live model`);
  const file=await readFile(join(root,'public',model.path));
  assert.equal(file.length,model.bytes,`${id}: cached model matches catalog`);
  assert(model.triangles>1000&&model.triangles<100000,`${id}: source geometry within web budget`);
}
for(const name of ['draco_decoder.wasm','draco_wasm_wrapper.js'])await access(join(root,'public/assets/draco',name));
// Texture optimization must preserve every geometry buffer view byte-for-byte.
const unpack=file=>{const length=file.readUInt32LE(12);return {json:JSON.parse(file.subarray(20,20+length)),binary:file.subarray(28+length)};};
const original=unpack(await readFile(join(root,'public/assets/models/Opportunity-MER.glb')));
const web=unpack(await readFile(join(root,'public/assets/models/Opportunity-MER-Web.glb')));
assert.deepEqual(web.json.accessors,original.json.accessors,'Opportunity vertex/index accessors unchanged');
assert.deepEqual(web.json.meshes,original.json.meshes,'Opportunity primitives unchanged');
const images=new Set(original.json.images.map(image=>image.bufferView));
for(let i=0;i<original.json.bufferViews.length;i++)if(!images.has(i)){
  const a=original.json.bufferViews[i],b=web.json.bufferViews[i];
  assert(original.binary.subarray(a.byteOffset||0,(a.byteOffset||0)+a.byteLength).equals(web.binary.subarray(b.byteOffset||0,(b.byteOffset||0)+b.byteLength)),'Opportunity geometry bytes preserved');
}
for(const name of ['moon','mars']){
  const file=await readFile(join(root,`public/assets/textures/${name}-procedural.png`));
  assert.equal(file.readUInt32BE(16),2048,'Offline texture has 2K width');assert.equal(file.readUInt32BE(20),1024,'Offline texture has 1K height');
}
console.log('PASS · 6 relics / 24 components / flight stops / NASA provenance / local Draco / offline textures / lossless geometry optimization');
