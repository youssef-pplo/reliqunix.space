import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import React,{act,useEffect} from 'react';
import {renderToString} from 'react-dom/server';
import {hydrateRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';

const require=createRequire(import.meta.url),project=join(dirname(fileURLToPath(import.meta.url)),'..');
const temporary=await mkdtemp(join(tmpdir(),'reliqunix-hydration-'));
let compatibility;
try {
  const compiler=join(dirname(require.resolve('typescript/package.json')),'bin/tsc');
  const result=spawnSync(process.execPath,[compiler,join(project,'src/utils/hydrationCompatibility.ts'),'--ignoreConfig','--target','ES2020','--module','ESNext','--lib','ES2020,DOM,DOM.Iterable','--skipLibCheck','--outDir',temporary],{encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);
  const js=await readFile(join(temporary,'hydrationCompatibility.js'),'utf8');
  compatibility=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
} finally {await rm(temporary,{recursive:true,force:true});}

globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const h=React.createElement;
function Fixture({cleanup=false}){
  useEffect(()=>{if(cleanup)compatibility.finishExtensionSafeHydration();},[cleanup]);
  return h('html',{lang:'en'},h('head',null,h('title',null,'Hydration regression')),h('body',{suppressHydrationWarning:true},
    h('div',{hidden:true,'data-metadata':'true'}),
    h('main',{'data-app':'preserve-me'},h('div',null,h('a',{href:'#archive'},'Skip to the relic archive')),h('button',{onClick:()=>{}},'Explore'))));
}
async function check(withCleanup){
  const dom=new JSDOM('<!doctype html>'+renderToString(h(Fixture,{cleanup:withCleanup})),{url:'http://localhost/'});
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,MutationObserver:dom.window.MutationObserver,Node:dom.window.Node,HTMLElement:dom.window.HTMLElement});
  const doc=dom.window.document;
  doc.querySelectorAll('div,main,a,button').forEach(el=>el.setAttribute('bis_skin_checked','1'));
  doc.body.setAttribute('bis_register','extension-bookkeeping');
  doc.body.setAttribute('__processed_7c7c84d2-b2b4-400a-b8c8-d96d31754906__','true');
  if(withCleanup){
    compatibility.prepareExtensionSafeHydration();
    // Also reproduce an extension writing another attribute during bootstrap.
    doc.querySelector('a').setAttribute('bis_skin_checked','1');
    await Promise.resolve();
    assert.equal(doc.querySelectorAll('[bis_skin_checked],[bis_register]').length,0);
    assert(!doc.body.getAttributeNames().some(n=>n.startsWith('__processed_')));
    assert.equal(doc.querySelector('main').getAttribute('data-app'),'preserve-me');
    assert.equal(doc.querySelector('a').textContent,'Skip to the relic archive');
    // Dynamic extension names cannot use MutationObserver's attributeFilter.
    // Reproduce the reported late write, after the synchronous cleanup ran.
    doc.body.setAttribute('__processed_late_extension_write__','true');
  }
  const diagnostics=[],original=console.error;
  let root;
  console.error=(...args)=>diagnostics.push(args.map(String).join(' '));
  try {
    await act(async()=>{root=hydrateRoot(doc,h(Fixture,{cleanup:withCleanup}),{onRecoverableError:e=>diagnostics.push(String(e))});});
    if(withCleanup){
      assert.deepEqual(diagnostics,[],'Hydration must succeed with all React warnings enabled');
      doc.querySelector('a').setAttribute('bis_skin_checked','after-hydration');
      await Promise.resolve();
      assert.equal(doc.querySelector('a').getAttribute('bis_skin_checked'),'after-hydration','Observer stops after hydration');
    }else assert(diagnostics.some(d=>/hydrat/i.test(d)&&d.includes('bis_skin_checked')),'Control must reproduce the reported warning');
  }finally{
    console.error=original;
    compatibility.finishExtensionSafeHydration();
    if(root)await act(async()=>root.unmount());
    dom.window.close();
  }
}
await check(false);
await check(true);
console.log('PASS · reproduced injected-attribute warning / clean React hydration after cleanup / application attributes preserved / observer released');
