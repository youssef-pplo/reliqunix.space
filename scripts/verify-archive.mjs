import assert from 'node:assert/strict';
import { readFile, writeFile, access, mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url),temporary=await mkdtemp(join(tmpdir(),'reliqunix-test-'));
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
let dataJs,storeJs,assetsJs,resourcesJs,flightJs,evidenceJs,fieldJs,reportJs;
try {
  const compiler=join(dirname(require.resolve('typescript/package.json')),'bin/tsc');
  const config=join(temporary,'tsconfig.json');
  await writeFile(config,JSON.stringify({compilerOptions:{target:'ES2020',module:'ESNext',moduleResolution:'bundler',skipLibCheck:true,strict:true,rootDir:join(root,'src'),outDir:temporary,paths:{'@/*':[join(root,'src/*')]}},files:[join(root,'src/data/relicsData.ts'),join(root,'src/data/modelAssets.ts'),join(root,'src/data/challengeResources.ts'),join(root,'src/store/useReliqunixStore.ts'),join(root,'src/utils/flightPath.ts'),join(root,'src/data/missionEvidence.ts'),join(root,'src/utils/fieldReport.ts')]}));
  const result=spawnSync(process.execPath,[compiler,'--project',config],{encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);
  [dataJs,storeJs,assetsJs,resourcesJs,flightJs,evidenceJs,fieldJs,reportJs]=await Promise.all(['data/relicsData.js','store/useReliqunixStore.js','data/modelAssets.js','data/challengeResources.js','utils/flightPath.js','data/missionEvidence.js','data/fieldMission.js','utils/fieldReport.js'].map(file=>readFile(join(temporary,file),'utf8')));
} finally { await rm(temporary,{recursive:true,force:true}); }
const {relicsData,formatCoordinate,getRelic,getRelics}=await import(moduleUrl(dataJs));
const {modelAssets}=await import(moduleUrl(assetsJs));
const {challengeResources,getRelicResources,CHALLENGE_URL}=await import(moduleUrl(resourcesJs));
const {missionEvidence}=await import(moduleUrl(evidenceJs));
const aliases={'@/data/relicsData':dataJs,'@/data/modelAssets':assetsJs,'@/data/challengeResources':resourcesJs,'@/data/missionEvidence':evidenceJs,'@/data/fieldMission':fieldJs};
const resolveData=source=>Object.entries(aliases).reduce((js,[alias,content])=>js.replaceAll(`'${alias}'`,JSON.stringify(moduleUrl(content))),source);
const {useReliqunixStore:store}=await import(moduleUrl(resolveData(storeJs).replaceAll("'zustand'",JSON.stringify(pathToFileURL(require.resolve('zustand')).href))));
const {fieldMission,getFieldProgress}=await import(moduleUrl(fieldJs));
const {buildFieldReport,buildFieldReportHtml,buildEvidencePack,buildClassroomWorksheetHtml}=await import(moduleUrl(resolveData(reportJs)));
const threeUrl=pathToFileURL(join(dirname(require.resolve('three')),'three.module.js')).href;
const THREE=await import(threeUrl);
const {createFlightPath,FLIGHT}=await import(moduleUrl(flightJs.replaceAll("'@/data/relicsData'",JSON.stringify(moduleUrl(dataJs))).replaceAll("'three'",JSON.stringify(threeUrl))));
for(const planet of ['MOON','MARS'])for(const width of [390,1440]){
  const path=createFlightPath(planet),position=new THREE.Vector3(),target=new THREE.Vector3(),center=new THREE.Vector3(),rotation=new THREE.Quaternion();
  let previousPosition,previousTarget;
  for(let step=0;step<=10000;step++){
    const progress=step/10000;
    path.sampleCamera(progress,width,position,target);
    assert([...position.toArray(),...target.toArray()].every(Number.isFinite),`${planet}: finite camera throughout the flight`);
    assert(position.distanceTo(target)>1,`${planet}: camera never crosses its focus`);
    if(progress<=FLIGHT.landed){
      const radius=path.sampleGlobe(progress,center,rotation)*10.6;
      assert(position.distanceTo(center)>radius+1,`${planet}: descent stays outside the planetary surface at ${progress}`);
    }
    if(previousPosition){
      assert(position.distanceTo(previousPosition)<.25,`${planet}: no camera position discontinuity at ${progress}`);
      assert(target.distanceTo(previousTarget)<.25,`${planet}: no focus discontinuity at ${progress}`);
    }
    previousPosition=position.clone();previousTarget=target.clone();
  }
  const first=getRelics(planet)[0];
  path.sampleCamera(first.splineProgress,width,position,target);
  assert.equal(target.z,first.position[2],`${planet}: descent reaches the first relic`);
}
assert.equal(relicsData.length,12,'Twelve complete relic records');
const ids=new Set(),parts=new Set();
for(const planet of ['MOON','MARS']){
  const records=getRelics(planet);
  assert.equal(records.length,6,`Six records for ${planet}`);
  const positions=new Set();
  for(let index=0;index<records.length;index++){
    const relic=records[index];
    assert(relic.splineProgress>0.38&&relic.splineProgress<0.94,`${relic.id}: stop is inside the visible surface tour`);
    if(index>0){
      assert(relic.splineProgress>records[index-1].splineProgress,`${relic.id}: flight stops increase`);
      assert(Math.hypot(...relic.position.map((value,axis)=>value-records[index-1].position[axis]))>=12,`${relic.id}: neighboring exhibit models have room`);
    }
    assert(relic.position.length===3&&relic.position.every(Number.isFinite),`${relic.id}: finite scene position`);
    assert(!positions.has(relic.position.join(',')),`${relic.id}: unique exhibit position`);positions.add(relic.position.join(','));
    store.getState().switchPlanet(planet);
    store.getState().setScrollProgress(0);
    store.getState().setScrollProgress(relic.splineProgress);
    assert.equal(store.getState().activeRelicId,relic.id,`${relic.id}: reachable by scrolling`);
    assert.equal(store.getState().cameraPhase,'SURFACE_TOUR',`${relic.id}: scroll arrives at surface`);
  }
}
for(const relic of relicsData){
  assert(!ids.has(relic.id),'Unique relic identifier');ids.add(relic.id);
  assert.equal(relic.parts.length,4,`${relic.id}: four engineering targets`);
  assert(relic.coordinates.lat>=-90&&relic.coordinates.lat<=90,'Valid latitude');
  assert(relic.coordinates.lng>=-180&&relic.coordinates.lng<=360,'Valid longitude');
  assert(relic.massKg>0&&relic.massNote,'Mass has provenance and scope');
  const source=new URL(relic.sourceUrl);
  assert(source.protocol==='https:'&&(source.hostname==='nasa.gov'||source.hostname.endsWith('.nasa.gov')),'Primary NASA source over HTTPS');
  assert(['retired','discarded','passive'].includes(relic.disposition),`${relic.id}: hardware disposition is explicit`);
  const question=relic.learningQuestion;
  assert(question?.question&&question?.explanation,`${relic.id}: discovery question has an explanation`);
  assert.equal(question.options.length,3,`${relic.id}: discovery question offers three choices`);
  assert.equal(new Set(question.options).size,3,`${relic.id}: answer options are distinct`);
  assert(Number.isInteger(question.answer)&&question.answer>=0&&question.answer<question.options.length,`${relic.id}: answer refers to an actual option`);
  for(const field of ['scientificStory','whyAbandoned','environmentalThreat','archiveQuote','sourceTitle'])assert(relic[field]?.length>10,`${relic.id}: ${field} populated`);
  for(const part of relic.parts){
    assert(!parts.has(part.partId),'Unique component identifier');parts.add(part.partId);
    assert(part.story.length>90&&part.material&&part.status&&part.telemetryCode,'Substantive engineering record');
    assert(part.cameraOffset.every(Number.isFinite)&&part.lookAtOffset.every(Number.isFinite),'Finite camera targets');
    assert.notDeepEqual(part.cameraOffset,part.lookAtOffset,'Inspection camera is outside its focus point');
  }
}
assert.equal(parts.size,48,'Forty-eight distinct inspection targets');
for(const relic of relicsData){
  store.getState().returnToFlight();
  store.getState().switchPlanet(relic.planet==='MOON'?'MARS':'MOON');
  store.getState().jumpToRelic(relic.id);
  assert.equal(store.getState().celestialBody,relic.planet,`${relic.id}: cross-world navigation selects the world`);
  assert.equal(store.getState().jumpTarget.progress,relic.splineProgress,`${relic.id}: navigation reaches its own flight stop`);
  store.getState().setScrollProgress(relic.splineProgress);
  assert.equal(store.getState().activeRelicId,relic.id,`${relic.id}: destination remains active after flight`);
  for(const part of relic.parts){
    store.getState().inspectPart(relic.id,part.partId);
    assert.equal(store.getState().selectedPartId,part.partId,`${part.partId}: selectable engineering target`);
    assert.equal(store.getState().cameraPhase,'INSPECT','Inspection locks the camera');
    store.getState().setScrollProgress(0);
    assert.equal(store.getState().scrollProgress,relic.splineProgress,'Background scrolling cannot move an inspected component');
    store.getState().returnToFlight();
    assert.equal(store.getState().selectedPartId,null,'Return to flight releases the component');
  }
}
const beforeInvalid=store.getState();
store.getState().inspectPart('missing-relic','missing-part');
assert.equal(store.getState(),beforeInvalid,'Unknown inspection targets leave the current view intact');
store.getState().jumpToRelic(null);store.getState().setScrollProgress(0);
assert.equal(store.getState().cameraPhase,'ORBIT','Returning to orbit restores orbital phase');
assert.equal(store.getState().activeRelicId,null,'Orbit does not retain a surface story');
store.getState().setScrollProgress(0.99);
assert.equal(store.getState().activeRelicId,null,'The ledger does not retain an overlapping surface story');
assert.equal(getRelic('missing-relic'),undefined,'Unknown archive identifiers do not resolve');
store.getState().restoreNotebook(['eagle','eagle','missing-relic'],['spirit','spirit','missing-relic']);
assert.deepEqual(store.getState().exploredRelicIds,['eagle'],'Restoring the notebook removes duplicate and unknown entries');
assert.deepEqual(store.getState().answeredRelicIds,['spirit'],'Restoring answers removes duplicate and unknown entries');
store.getState().recordAnswer('eagle');store.getState().recordAnswer('eagle');store.getState().recordAnswer('missing-relic');
assert.deepEqual(store.getState().answeredRelicIds,['spirit','eagle'],'Repeating a correct answer cannot inflate discovery progress');
store.getState().openArchive('collection');store.getState().jumpToRelic('eagle');
assert.equal(store.getState().archivePanel,null,'Selecting an archive record closes the modal before the flight');
assert.equal(new URL(CHALLENGE_URL).hostname,'www.spaceappschallenge.org','The source hub links back to the official challenge');
const resourceIds=new Set();
for(const resource of challengeResources){
  assert(!resourceIds.has(resource.id),'Resource identifiers are unique');resourceIds.add(resource.id);
  const url=new URL(resource.url);
  assert(url.protocol==='https:'&&(url.hostname==='nasa.gov'||url.hostname.endsWith('.nasa.gov')||(url.hostname==='github.com'&&url.pathname.startsWith('/nasa/'))),`${resource.id}: source is an official NASA resource`);
  assert(resource.title&&resource.organization&&resource.usedFor,`${resource.id}: source explains attribution and its actual use`);
  assert(['Challenge resource','Supporting NASA source'].includes(resource.origin),`${resource.id}: source origin is explicit`);
  assert(resource.relicIds.length>0&&resource.relicIds.every(id=>ids.has(id)),`${resource.id}: source is connected to valid collection records`);
}
for(const relic of relicsData)assert(getRelicResources(relic.id).length>0,`${relic.id}: source hub covers the object`);
assert.deepEqual(Object.keys(missionEvidence).sort(),[...ids].sort(),'Every relic has exactly one NASA mission file');
for(const relic of relicsData){
  const evidence=missionEvidence[relic.id];
  assert.equal(evidence.facts.length,3,`${relic.id}: three sourced mission facts`);
  assert.equal(evidence.timeline.length,3,`${relic.id}: three historical milestones`);
  assert(evidence.takeaway.length>60,`${relic.id}: explains the learning outcome`);
  for(const item of [...evidence.facts,...evidence.timeline]){
    const resource=challengeResources.find(source=>source.id===item.sourceId);
    assert(resource?.relicIds.includes(relic.id),`${relic.id}: each fact and event cites a primary resource linked to that relic`);
    assert(item.detail.length>25,`${relic.id}: measurements and dates retain context`);
  }
}
store.getState().restoreNotebook([],[],{eagle:{factIndex:99,reflection:'Invalid source selection'},unknown:{factIndex:0,reflection:'Unknown mission'},insight:{factIndex:0,reflection:12}});
assert.deepEqual(store.getState().curatorNotes,{},'Corrupt or unknown saved curator notes are rejected');
assert.equal(getFieldProgress(store.getState()).complete,false,'A fresh field mission is incomplete');
store.getState().recordComponentView('eagle','nonexistent-part');
assert.deepEqual(store.getState().exploredRelicIds,[],'Unknown text component records do not count as exploration');
for(const stop of fieldMission){
  const relic=getRelic(stop.relicId);
  assert(relic&&missionEvidence[relic.id],`${stop.relicId}: guided stop has a real record and evidence`);
  store.getState().recordComponentView(relic.id,relic.parts[0].partId);
  store.getState().recordAnswer(relic.id);
}
assert.equal(getFieldProgress(store.getState()).completed,3,'Text component records and questions support the whole guided mission');
assert.equal(getFieldProgress(store.getState()).complete,false,'A curator story is still required after the guided discoveries');
const reflection='This descent stage shows how a machine can become a launch platform, connecting a difficult return journey to the hardware left behind.';
store.getState().setCuratorNote('eagle',1,reflection);
assert.equal(getFieldProgress(store.getState()).complete,true,'Evidence-based reflection finishes the field mission');
const saved=JSON.parse(JSON.stringify(store.getState().curatorNotes));
store.getState().restoreNotebook(['eagle','surveyor','insight'],['eagle','surveyor','insight'],saved);
assert.equal(store.getState().curatorNotes.eagle.reflection,reflection,'Curator writing survives a notebook round trip');
const report=buildFieldReport(store.getState(),new Date('2026-11-13T12:00:00Z'));
assert(report.includes(reflection)&&report.includes('Guided stops completed: 3/3'),'Export includes the learner’s actual activity and writing');
assert(report.includes(challengeResources.find(source=>source.id==='apollo11-overview').url),'Export preserves the selected fact’s primary source');
const pack=buildEvidencePack();
assert.equal(pack.records.length,12,'Evidence export covers all twelve objects');
assert.equal(pack.sources.length,challengeResources.length,'Evidence export includes the complete source library');
assert(!JSON.stringify(pack).includes(reflection),'Public evidence export excludes learner writing');
store.getState().setCuratorNote('eagle',0,'<script>alert(1)</script><img src=x onerror=alert(1)> This is a learner interpretation, not executable content.');
const html=buildFieldReportHtml(store.getState());
assert(!html.includes('<script>')&&!html.includes('<img src=x'),'Explorer writing cannot inject active HTML into the field report');
assert(html.includes('&lt;script&gt;')&&html.includes('window.print()'),'Printable field report preserves escaped writing and print support');
assert(buildClassroomWorksheetHtml().includes('Before exploring'),'Classroom worksheet includes a baseline reflection prompt');
store.getState().setCuratorNote('eagle',0,'x'.repeat(900));
assert.equal(store.getState().curatorNotes.eagle.reflection.length,800,'Curator stories obey the storage and export length limit');
assert.equal(formatCoordinate(354.7384,false),'5.2616° W','Positive-east coordinates normalize correctly');
assert.equal(formatCoordinate(-3.0162),'3.0162° S','Southern latitudes preserve their hemisphere');
const manifest=JSON.parse(await readFile(join(root,'public/assets/manifest.json'),'utf8'));
for(const path of Object.values(manifest.textures))await access(join(root,'public',path));
for(const model of manifest.models){
  const file=await readFile(join(root,'public',model.path));assert.equal(file.toString('utf8',0,4),'glTF','Cached NASA model is a real binary glTF');
}
const catalog=JSON.parse(await readFile(join(root,'public/assets/nasa-model-catalog.json'),'utf8'));
for(const [id,asset] of Object.entries(modelAssets)){
  assert(ids.has(id),`${id}: model belongs to a real archive entry`);
  assert(asset.credit&&asset.notes&&asset.label,`${id}: model credit and adaptation notes are visible`);
  assert(new URL(asset.sourceUrl).hostname.endsWith('.nasa.gov'),`${id}: model has an official source`);
  const file=await readFile(join(root,'public',asset.path));
  assert.equal(file.toString('utf8',0,4),'glTF',`${id}: model asset is valid binary glTF`);
  assert(file.length<5000000,`${id}: model remains within the web payload budget`);
  assert(catalog.models.some(model=>model.path===asset.path),`${id}: model path has catalog provenance, including shared geometry`);
}
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
console.log(`PASS · ${relicsData.length} relics / ${parts.size} components / ${challengeResources.length} linked resources / continuous desktop & mobile descent / guided learning & curator reports / safe printable exports / all flight destinations / inspection locks / notebook integrity / NASA provenance / local Draco / offline textures / lossless geometry optimization`);
