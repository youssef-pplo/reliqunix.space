import { mkdir, readFile, writeFile, access, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets');
await Promise.all(['textures', 'models', 'fonts','draco'].map(d => mkdir(join(root, d), { recursive: true })));
// Bundle the decoder: NASA GLBs must never need a third-party CDN at runtime.
for(const name of ['draco_wasm_wrapper.js','draco_decoder.wasm','draco_decoder.js']) {
  await copyFile(join(root,'../../node_modules/three/examples/jsm/libs/draco/gltf',name),join(root,'draco',name));
}
const exists = async p => access(p).then(() => true, () => false);
const manifest = { generated: new Date().toISOString(), models: [], textures: {}, credits: [] };
try {
  const previous = JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));
  for (const model of previous.models || []) if (await exists(join(root,'..',model.path))) manifest.models.push(model);
} catch { /* First run. */ }
const hash = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
function noise(x, y) {
  const a = Math.floor(x), b = Math.floor(y), u = x - a, v = y - b;
  const s = u * u * (3 - 2 * u), t = v * v * (3 - 2 * v);
  return (hash(a, b) * (1 - s) + hash(a + 1, b) * s) * (1 - t) + (hash(a, b + 1) * (1 - s) + hash(a + 1, b + 1) * s) * t;
}
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => { let c = n; for (let i = 0; i < 8; i++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function chunk(name, data) {
  const type = Buffer.from(name), body = Buffer.concat([type, data]); let crc = 0xffffffff;
  for (const v of body) crc = crcTable[(crc ^ v) & 255] ^ (crc >>> 8);
  const size = Buffer.alloc(4), end = Buffer.alloc(4); size.writeUInt32BE(data.length); end.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([size, body, end]);
}
function png(width, height, rgb) {
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  const rows = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) rgb.copy(rows, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}
for (const planet of ['moon', 'mars']) {
  const path = join(root, 'textures', `${planet}-procedural.png`);
  if (!(await exists(path))) {
    const w = 2048, h = 1024, data = Buffer.alloc(w * h * 3);
    const craters = Array.from({length: 160}, (_, i) => ({ x: hash(i, 1) * w, y: hash(i, 2) * h, r: 3 + Math.pow(hash(i, 3), 3) * 95 }));
    const heights = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let n = 0, amp = 0.5, freq = 0.008;
      for (let o = 0; o < 6; o++) { n += noise(x * freq, y * freq) * amp; amp *= 0.5; freq *= 2; }
      heights[y * w + x] = n;
    }
    for (const c of craters) for (let y = Math.max(0, Math.floor(c.y-c.r*1.5)); y < Math.min(h, c.y+c.r*1.5); y++) for (let x = Math.max(0, Math.floor(c.x-c.r*1.5)); x < Math.min(w, c.x+c.r*1.5); x++) {
      const d = Math.hypot(x-c.x,y-c.y)/c.r;
      heights[y*w+x] += Math.exp(-Math.pow((d-1)*9,2))*0.18 - Math.max(0,1-d*d)*0.19;
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = heights[y*w+x], slope = (n-heights[y*w+Math.max(0,x-2)])*1.7;
      const v = Math.max(0.15,Math.min(1,n+slope));
      const base = planet === 'moon' ? [186,182,171] : [209,115,67];
      const low = planet === 'moon' ? 20 : 11;
      for (let j=0;j<3;j++) data[(y*w+x)*3+j] = Math.min(255,low+base[j]*v);
    }
    await writeFile(path,png(w,h,data));
    console.log(`[GENERATED] 2048×1024 ${planet} procedural albedo`);
  }
  manifest.textures[planet] = `/assets/textures/${planet}-procedural.png`;
}
async function download(url, path, maxBytes = 24000000) {
  if (await exists(path)) return true;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'Reliqunix-Archive/1.0' } });
    if (!response.ok || Number(response.headers.get('content-length')) > maxBytes) return false;
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length > maxBytes) return false;
    if (path.endsWith('.glb') && String.fromCharCode(...bytes.slice(0,4)) !== 'glTF') return false;
    await writeFile(path, bytes); return true;
  } catch { return false; }
}
await Promise.all([
  (async () => {
    const url = 'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg';
    if (await download(url, join(root,'textures','moon-nasa.jpg'))) {
      manifest.textures.moon = '/assets/textures/moon-nasa.jpg';
      manifest.credits.push({ title: 'LROC color mosaic · NASA SVS / Ernie Wright / NASA LRO', url: 'https://svs.gsfc.nasa.gov/4720/' });
      await download('https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_3_8bit.jpg', join(root,'textures','moon-height.jpg'));
      console.log('[FETCHED] NASA LRO Moon maps');
    } else console.log('[OFFLINE FALLBACK] Procedural Moon maps ready');
  })(),
  (async () => {
    if (manifest.models.length) { console.log(`[NASA MODELS] ${manifest.models.length} cached; procedural fallbacks available for every relic`); return; }
    try {
      const response = await fetch('https://api.github.com/repos/nasa/NASA-3D-Resources/git/trees/master?recursive=1', { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw Error('repository unavailable');
      const tree = await response.json();
      const candidates = (tree.tree || []).filter(p => /\.glb$/i.test(p.path) && /ingenuity|surveyor|lunar.*module|opportunity/i.test(p.path) && p.size < 24000000).slice(0,2);
      for (const asset of candidates) {
        const url = 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/' + asset.path.split('/').map(encodeURIComponent).join('/');
        const name = asset.path.split('/').at(-1).replace(/[^\w.-]/g,'-');
        if (await download(url,join(root,'models',name))) manifest.models.push({path:'/assets/models/'+name,source:url});
      }
    } catch { /* Bespoke interactive models are always available. */ }
    // A second official source is attempted even when the GitHub listing is unavailable.
    const url = 'https://mars.nasa.gov/system/resources/gltf_files/25043_Ingenuity_v3.glb';
    if (!manifest.models.length && await download(url,join(root,'models','ingenuity-nasa.glb'))) manifest.models.push({path:'/assets/models/ingenuity-nasa.glb',source:url});
    console.log(`[NASA MODELS] ${manifest.models.length} cached; procedural fallbacks available for every relic`);
  })(),
  (async () => {
    const fonts = [{ family:'Barlow Condensed',weight:600,name:'display',path:'barlowcondensed/BarlowCondensed-SemiBold.ttf' },{ family:'Space Grotesk',weight:400,name:'sans',path:'spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf' },{ family:'IBM Plex Mono',weight:400,name:'mono',path:'ibmplexmono/IBMPlexMono-Regular.ttf' }];
    let css = '';
    for (const font of fonts) {
      const file = join(root,'fonts',font.name+'.ttf');
      if (!(await exists(file))) {
        await download('https://raw.githubusercontent.com/google/fonts/main/ofl/'+font.path,file,2000000);
      }
      if (await exists(file)) css += `@font-face{font-family:'${font.family}';font-style:normal;font-weight:${font.weight};font-display:swap;src:url('/assets/fonts/${font.name}.ttf') format('truetype')}\n`;
      if (await exists(file)) await download('https://raw.githubusercontent.com/google/fonts/main/ofl/'+font.path.split('/')[0]+'/OFL.txt',join(root,'fonts',font.name+'.OFL.txt'),100000);
    }
    await writeFile(join(root,'fonts','fonts.css'),css);
  })(),
]);
// Include curated web editions and provenance alongside the original NASA cache.
try {
  const catalog=JSON.parse(await readFile(join(root,'nasa-model-catalog.json'),'utf8'));
  for(const model of catalog.models||[])if(await exists(join(root,'..',model.path))){
    const record={path:model.path,source:model.source,credit:model.credit,page:model.page};
    const index=manifest.models.findIndex(m=>m.path===model.path);
    if(index<0)manifest.models.push(record);else manifest.models[index]=record;
  }
}catch{/* Offline reconstruction remains available if catalog has not been generated. */}
await writeFile(join(root,'manifest.json'),JSON.stringify(manifest,null,2));
console.log('[READY] Offline assets and provenance manifest generated.');
