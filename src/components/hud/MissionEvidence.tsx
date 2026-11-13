import { ArrowUpRight } from 'lucide-react';
import { challengeResources } from '@/data/challengeResources';
import { missionEvidence } from '@/data/missionEvidence';

export default function MissionEvidence({relicId}:{relicId:string}) {
  const evidence=missionEvidence[relicId];
  if(!evidence)return null;
  const sourceIds=[...new Set([...evidence.facts,...evidence.timeline].map(item=>item.sourceId))];
  const sources=sourceIds.map(id=>challengeResources.find(resource=>resource.id===id)).filter(resource=>!!resource);
  const citation=(id:string,label:string)=>{
    const resource=sources.find(source=>source.id===id);
    return resource?<a className="evidence-citation" href={resource.url} target="_blank" rel="noreferrer" aria-label={`Verify ${label}: ${resource.title}`} title={resource.title}>[{sourceIds.indexOf(id)+1}]</a>:null;
  };
  return <div className="mission-evidence">
    <dl className="mission-facts">{evidence.facts.map(item=><div key={item.label}><dt>{item.label}</dt><dd><strong>{item.value}</strong><p>{item.detail} {citation(item.sourceId,item.label)}</p></dd></div>)}</dl>
    <h4 className="micro">THE MISSION TIMELINE</h4>
    <ol className="mission-timeline">{evidence.timeline.map(item=><li key={item.date}><span className="mono">{item.date}</span><strong>{item.title}</strong><p>{item.detail} {citation(item.sourceId,item.title)}</p></li>)}</ol>
    <div className="mission-takeaway"><h4 className="micro">WHAT THIS OBJECT TEACHES US</h4><p>{evidence.takeaway}</p></div>
    <div className="mission-evidence-sources"><h4 className="micro">READ THE PRIMARY RECORDS</h4>{sources.map((source,i)=><a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>[{i+1}] {source.title}<small>{source.origin}</small></span><ArrowUpRight size={13}/></a>)}</div>
  </div>;
}
