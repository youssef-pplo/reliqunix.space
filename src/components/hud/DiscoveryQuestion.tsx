'use client';
import { useState } from 'react';
import { Check, Lightbulb } from 'lucide-react';
import { type Relic } from '@/data/relicsData';
import { useReliqunixStore } from '@/store/useReliqunixStore';
import { fieldMission } from '@/data/fieldMission';

export default function DiscoveryQuestion({relic,showNotebookLink=true}:{relic:Relic;showNotebookLink?:boolean}) {
  const [choice,setChoice]=useState<number|null>(null);
  const collected=useReliqunixStore(s=>s.answeredRelicIds.includes(relic.id));
  const question=relic.learningQuestion;
  if(!question)return null;
  const selected=choice??(collected?question.answer:null);
  const answer=(index:number)=>{setChoice(index);if(index===question.answer)useReliqunixStore.getState().recordAnswer(relic.id);};
  return <section className="discovery-question" aria-label="Discovery question"><div className="micro"><Lightbulb size={14}/>{collected?'DISCOVERY COLLECTED':'A QUESTION FOR THE EXPLORER'}{collected&&<Check size={14}/>}</div><h3>{question.question}</h3><div className="discovery-options">{question.options.map((option,i)=><button key={option} className={selected===i?(i===question.answer?'correct':'retry'):''} aria-pressed={selected===i} onClick={()=>answer(i)}><span>{String.fromCharCode(65+i)}</span>{option}</button>)}</div>{selected!==null&&<p className="discovery-feedback" aria-live="polite">{selected===question.answer?question.explanation:'Look again at the story, then try another answer.'}</p>}{collected&&showNotebookLink&&<button className="notebook-link micro" onClick={()=>useReliqunixStore.getState().openArchive(fieldMission.some(stop=>stop.relicId===relic.id)?'mission':'notebook')}>{fieldMission.some(stop=>stop.relicId===relic.id)?'CONTINUE MY FIELD MISSION':'OPEN MY EXPLORER NOTEBOOK'} ↗</button>}</section>;
}
