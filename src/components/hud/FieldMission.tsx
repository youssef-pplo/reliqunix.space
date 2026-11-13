'use client';
import { useState } from 'react';
import { ArrowUpRight, Check, Download, Flag, PenLine } from 'lucide-react';
import { getRelic, relicsData } from '@/data/relicsData';
import { fieldMission, getFieldProgress } from '@/data/fieldMission';
import { missionEvidence } from '@/data/missionEvidence';
import { challengeResources } from '@/data/challengeResources';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { buildClassroomWorksheetHtml, buildFieldReportHtml } from '@/utils/fieldReport';
import { RelicGlyph } from './ArchiveGlyph';
import MissionEvidence from './MissionEvidence';
import DiscoveryQuestion from './DiscoveryQuestion';
import { downloadText } from '@/utils/download';

export default function FieldMission() {
  const explored=useReliqunixStore(s=>s.exploredRelicIds),answered=useReliqunixStore(s=>s.answeredRelicIds),notes=useReliqunixStore(s=>s.curatorNotes);
  const [selected,setSelected]=useState('eagle'),[exported,setExported]=useState(false);
  const note=notes[selected]??{factIndex:0,reflection:''},relic=getRelic(selected)!,facts=missionEvidence[selected].facts;
  const source=challengeResources.find(resource=>resource.id===facts[note.factIndex].sourceId)!;
  const progress=getFieldProgress({exploredRelicIds:explored,answeredRelicIds:answered,curatorNotes:notes});
  const update=(factIndex:number,reflection:string)=>{useReliqunixStore.getState().setCuratorNote(selected,factIndex,reflection);setExported(false);};
  return <div className="field-mission">
    <div className="field-mission-intro"><p className="eyebrow orange"><Flag size={15}/> A FIELD MISSION / TWO WORLDS</p><h3>It stayed behind.<br/>Bring its story home.</h3><p>Three objects. Three questions. Follow an engineering choice to the discovery it made possible, then become the curator of one story.</p><div className="field-mission-meta mono"><span>AGES 10+</span><span>10–15 MINUTES</span><span>SOLO OR CLASSROOM</span></div></div>
    <div className="field-session" aria-label="Your field mission activity"><div><strong>{progress.completed}/3</strong><span>stops completed</span></div><div><strong>{progress.discoveries}/3</strong><span>discoveries collected</span></div><div><strong>{progress.stories}</strong><span>curator stories</span></div></div>
    <div className="field-stops">{fieldMission.map((stop,i)=>{
      const object=getRelic(stop.relicId)!,complete=explored.includes(object.id)&&answered.includes(object.id);
      return <section key={object.id} className={`field-stop ${complete?'complete':''}`} aria-label={`Field mission stop ${i+1}: ${object.name}`}>
        <div className="field-stop-heading"><span className="field-stop-number mono">{complete?<Check size={17}/>:String(i+1).padStart(2,'0')}</span><div><p className="micro">{object.planet} / {stop.title}</p><h4>{stop.question}</h4></div><RelicGlyph id={object.id}/></div>
        <p className="field-stop-task">{stop.task}</p>
        <div className="field-stop-actions"><button className="field-primary" onClick={()=>useReliqunixStore.getState().jumpToRelic(object.id)}>EXPLORE {object.shortName.toUpperCase()} IN 3D <ArrowUpRight size={15}/></button><span className="micro">{explored.includes(object.id)?'✓ COMPONENT OPENED':'OPEN A COMPONENT'} · {answered.includes(object.id)?'✓ QUESTION COMPLETE':'ANSWER THE QUESTION'}</span></div>
        <details className="mission-file"><summary><span>READ THE MISSION FILE & ANSWER HERE</span><ArrowUpRight size={14}/></summary><MissionEvidence relicId={object.id}/><div className="field-component-records"><h4 className="micro">COMPONENT FIELD GUIDE / TEXT ALTERNATIVE</h4>{object.parts.map(part=><details key={part.partId} onToggle={event=>{if(event.currentTarget.open)useReliqunixStore.getState().recordComponentView(object.id,part.partId);}}><summary>{part.shortLabel}</summary><p>{part.story}</p><small>{part.material}</small></details>)}</div><DiscoveryQuestion relic={object} showNotebookLink={false}/></details>
      </section>;
    })}</div>
    <section className="curator-lab" aria-label="Write your curator story"><p className="eyebrow orange"><PenLine size={15}/> YOUR TURN / THE CURATOR’S DESK</p><h3>Evidence first.<br/>Your voice next.</h3><p className="curator-intro">Choose a NASA fact, then explain why the object matters. Your words become a field report you can take back to a classroom or share.</p>
      <label className="curator-label" htmlFor="curator-object">1 / CHOOSE AN OBJECT</label><select id="curator-object" value={selected} onChange={e=>{setSelected(e.target.value);setExported(false);}}>{relicsData.map(object=><option key={object.id} value={object.id}>{object.shortName} · {object.planet}</option>)}</select>
      <fieldset className="curator-facts"><legend>2 / CHOOSE YOUR NASA EVIDENCE</legend>{facts.map((fact,i)=><label key={fact.label}><input type="radio" name="curator-evidence" checked={note.factIndex===i} onChange={()=>update(i,note.reflection)}/><span><strong>{fact.label} / {fact.value}</strong><small>{fact.detail}</small></span></label>)}</fieldset>
      <a className="curator-source" href={source.url} target="_blank" rel="noreferrer">CHECK THE PRIMARY SOURCE: {source.title} <ArrowUpRight size={13}/></a>
      <label className="curator-label" htmlFor="curator-reflection">3 / WHAT SHOULD FUTURE EXPLORERS LEARN FROM IT?</label><textarea id="curator-reflection" rows={5} maxLength={800} value={note.reflection} onChange={e=>update(note.factIndex,e.target.value)} placeholder="Use the fact above to explain this object’s engineering, discovery, or legacy in 2–3 sentences." aria-describedby="curator-note-help"/>
      <div className="curator-note-meta"><p id="curator-note-help">Your interpretation · saved in this browser · 40 characters to complete a story.</p><span className="mono">{note.reflection.length}/800</span></div>
      {note.reflection.trim().length>=40&&<div className="curator-preview"><p className="micro">YOUR MUSEUM LABEL / {relic.shortName.toUpperCase()}</p><blockquote>{note.reflection}</blockquote><a href={source.url} target="_blank" rel="noreferrer">Evidence: {facts[note.factIndex].value} · NASA <ArrowUpRight size={12}/></a></div>}
    </section>
    <div className="field-export"><div><p className="eyebrow orange">{progress.complete?'MISSION COMPLETE':'TAKE THE LEARNING WITH YOU'}</p><h4>{progress.complete?'A story worth bringing home.':'Your field report, ready when you are.'}</h4><p>Download your activity, curator stories, and NASA references. Open the report in a browser to print or save as PDF. Teachers can use the matching worksheet without an account.</p></div><div className="field-export-actions"><button className="field-primary" onClick={()=>{downloadText('reliqunix-field-report.html',buildFieldReportHtml({exploredRelicIds:explored,answeredRelicIds:answered,curatorNotes:notes}),'text/html;charset=utf-8');setExported(true);}}><Download size={15}/> DOWNLOAD MY FIELD REPORT</button><button onClick={()=>downloadText('reliqunix-classroom-worksheet.html',buildClassroomWorksheetHtml(),'text/html;charset=utf-8')}><Download size={14}/> CLASSROOM WORKSHEET</button><p role="status">{exported?'Field report prepared with your current activity and source links.':'Activity records show participation; they are not a measured learning score.'}</p></div></div>
  </div>;
}
