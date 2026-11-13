import { relicsData, getRelic } from '@/data/relicsData';
import { challengeResources, CHALLENGE_URL, resourceMethodology } from '@/data/challengeResources';
import { missionEvidence } from '@/data/missionEvidence';
import { fieldMission, getFieldProgress, type FieldSession } from '@/data/fieldMission';
import { modelAssets } from '@/data/modelAssets';

export function buildFieldReport(session:FieldSession,date=new Date()) {
  const progress=getFieldProgress(session);
  const lines=['# RELIQUNIX.SPACE — Explorer field report','',`Created: ${date.toISOString()}`,'',
    '## The mission','',
    'Explore how hardware left on the Moon and Mars connects engineering choices to scientific discovery.','',
    `- Guided stops completed: ${progress.completed}/${fieldMission.length}`,
    `- Guided records with a component opened: ${progress.inspected}/${fieldMission.length}`,
    `- Guided discovery questions completed: ${progress.discoveries}/${fieldMission.length}`,
    `- Archive-wide discoveries collected: ${session.answeredRelicIds.length}/${relicsData.length}`,
    `- Curator stories written: ${progress.stories}`,'',
    'These are activities recorded in this browser, not a validated measure of learning gain. Discovery questions allow retries.','',
    '## The three stops',''];
  for(const stop of fieldMission){
    const relic=getRelic(stop.relicId)!;
    lines.push(`### ${relic.name}`,stop.question,'',stop.outcome,'',`NASA mission record: ${relic.sourceUrl}`,'');
  }
  lines.push('## My curator stories','');
  const notes=Object.entries(session.curatorNotes).filter(([,note])=>note.reflection.trim().length>=40);
  if(!notes.length)lines.push('No completed curator story yet. Choose a NASA fact and explain why its object matters.','');
  for(const [id,note] of notes){
    const relic=getRelic(id),fact=missionEvidence[id]?.facts[note.factIndex];
    if(!relic||!fact)continue;
    const source=challengeResources.find(resource=>resource.id===fact.sourceId)!;
    lines.push(`### ${relic.name}`,'',`NASA evidence: ${fact.label} — ${fact.value}. ${fact.detail}`,'',`Primary source: ${source.title} — ${source.url}`,'',
      'Curator interpretation (written by the explorer):','',...note.reflection.trim().split('\n').map(line=>`> ${line}`),'');
  }
  lines.push('## Evidence and interpretation','',resourceMethodology,'',`Official challenge: ${CHALLENGE_URL}`,'',
    'Independent educational project. AI assisted with code and editorial development. Curator reflections are learner-authored interpretations, not verified historical claims.');
  return lines.join('\n');
}

export function buildEvidencePack() {
  return {
    format:'reliqunix-evidence-v1',reviewedOn:'2026-11-13',challenge:CHALLENGE_URL,methodology:resourceMethodology,
    records:relicsData.map(relic=>({id:relic.id,name:relic.name,planet:relic.planet,mission:relic.mission,coordinates:relic.coordinates,
      massKg:relic.massKg,massScope:relic.massNote,disposition:relic.disposition,missionSource:relic.sourceUrl,
      ...missionEvidence[relic.id],model:modelAssets[relic.id]??{type:'Interpretive reconstruction'},
      components:relic.parts.map(part=>({id:part.partId,label:part.label,story:part.story}))})),
    sources:challengeResources,
    limitations:['Tour distances are compressed and scene model scale is illustrative.','Site markers are approximate, not surveyed object coordinates.','NASA source models show reference geometry, not measured present-day condition.','Exposure effects illustrate environmental processes and are not scientific predictions.','Learner activity counts do not establish educational effectiveness.'],
  };
}

export function buildClassroomWorksheet() {
  return ['# RELIQUNIX.SPACE — What we left behind','',
    'Suggested audience: ages 10+ and casual space enthusiasts. Suggested activity: 10–15 minutes.','',
    '## Learning goals','',
    '- Explain one engineering reason that hardware remains on another world.',
    '- Connect a component to the science it made possible.',
    '- Support a short interpretation with a primary NASA source.','',
    '## Before exploring','',
    'Why might a successful mission leave equipment behind? Write your first explanation.','',
    ...fieldMission.flatMap((stop,i)=>[`## Stop ${i+1}: ${getRelic(stop.relicId)!.name}`,'',stop.question,'',stop.task,'',
      '1. Name a component and explain its job.','2. Record a NASA fact and its source.','3. Answer the discovery question, then explain it in your own words.','']),
    '## Become a curator','',
    'Choose one object. Use a NASA fact and write 2–3 sentences explaining what future explorers should learn from it. Label your interpretation separately from the historical evidence.','',
    '## After exploring','',
    'Return to your first explanation. What changed? What evidence changed it?','',
    '## For the facilitator','',
    'Accept different interpretations when they are supported by accurate evidence. A correct multiple-choice answer after retries does not by itself demonstrate understanding. Ask the learner to explain the engineering or science connection aloud.','',
    'Text alternative: every mission file and discovery question is available in Explore Archive without navigating the 3D scene.','',
    `Sources and challenge: ${CHALLENGE_URL}`,
  ].join('\n');
}

const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
function printableReport(markdown:string) {
  const linkify=(value:string)=>value.split(/(https:\/\/[^\s]+)/g).map(part=>part.startsWith('https://')?`<a href="${escapeHtml(part)}" rel="noreferrer">${escapeHtml(part)}</a>`:escapeHtml(part)).join('');
  let list=false;
  const content=markdown.split('\n').map(line=>{
    const heading=line.match(/^(#{1,3}) (.*)$/),item=line.startsWith('- '),prefix=list&&!item?'</ul>':'';
    if(list&&!item)list=false;
    if(item){const open=list?'':'<ul>';list=true;return `${open}<li>${linkify(line.slice(2))}</li>`;}
    if(heading)return `${prefix}<h${heading[1].length}>${linkify(heading[2])}</h${heading[1].length}>`;
    if(line.startsWith('> '))return `${prefix}<blockquote>${linkify(line.slice(2))}</blockquote>`;
    return prefix+(line?`<p>${linkify(line)}</p>`:'');
  }).join('\n')+(list?'</ul>':'');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RELIQUNIX — Field notes</title><style>
  :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#e9e7df;color:#1d2925;font:15px/1.75 system-ui,sans-serif}main{max-width:900px;margin:40px auto;padding:55px 65px;background:#fffef8;border-top:5px solid #bc572d}h1{font-size:36px;line-height:1.15;letter-spacing:-1px;margin:0 0 25px}h2{font-size:24px;line-height:1.3;border-top:1px solid #c9cec3;padding-top:24px;margin-top:35px}h3{font-size:18px;margin-top:25px}p,li{max-width:740px}a{color:#87502d;overflow-wrap:anywhere}blockquote{margin:15px 0;padding:16px 22px;border-left:3px solid #bc572d;background:#e8eee5;white-space:pre-wrap}button{display:block;margin:25px auto 0;padding:14px 22px;border:1px solid #223b2e;background:#183729;color:#fff;font:13px system-ui;cursor:pointer}footer{font-size:11px;color:#607265;margin-top:35px}.brand{font:11px ui-monospace,monospace;letter-spacing:2px;color:#98502e;margin-bottom:25px}@media(max-width:650px){main{margin:20px;padding:30px 24px}h1{font-size:28px}}@media print{@page{margin:15mm}body{background:#fff;font-size:11pt}main{margin:0;padding:0;max-width:none;border-top:0}button{display:none}h2,h3{break-after:avoid}blockquote,li{break-inside:avoid}a{color:inherit}h1{font-size:25pt}}
  </style><button onclick="window.print()">Print / Save as PDF</button><main><div class="brand">RELIQUNIX.SPACE / A FIELD ARCHIVE OF HUMAN AMBITION</div>${content}<footer>Independent NASA Space Apps educational project. Primary sources remain linked; explorer reflections are interpretations.</footer></main></html>`;
}

export const buildFieldReportHtml=(session:FieldSession,date=new Date())=>printableReport(buildFieldReport(session,date));
export const buildClassroomWorksheetHtml=()=>printableReport(buildClassroomWorksheet());
