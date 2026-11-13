export const fieldMission = [
  { relicId:'eagle', title:'The return ticket', question:'Why leave a spacecraft behind?', task:'Inspect one component, then explain why the descent stage stayed.', outcome:'Connect a two-stage vehicle to the problem of bringing a crew home.' },
  { relicId:'surveyor', title:'The machine became evidence', question:'What can an old lander still teach us?', task:'Inspect the sampler or camera. Find the NASA record of Apollo 12’s return visit.', outcome:'Connect recovered hardware to research on exposure to the lunar environment.' },
  { relicId:'insight', title:'The science outlives the signal', question:'Can a motionless machine explore a planet?', task:'Inspect the seismic instrument and discover how it investigated Mars’ interior.', outcome:'Connect ground vibrations to scientific evidence about a hidden interior.' },
] as const;

export interface CuratorNote { factIndex:number; reflection:string; }
export type CuratorNotes = Record<string,CuratorNote>;
export interface FieldSession { exploredRelicIds:string[]; answeredRelicIds:string[]; curatorNotes:CuratorNotes; }

export function getFieldProgress(session:FieldSession) {
  const inspected=fieldMission.filter(stop=>session.exploredRelicIds.includes(stop.relicId)).length;
  const discoveries=fieldMission.filter(stop=>session.answeredRelicIds.includes(stop.relicId)).length;
  const completed=fieldMission.filter(stop=>session.exploredRelicIds.includes(stop.relicId)&&session.answeredRelicIds.includes(stop.relicId)).length;
  const stories=Object.values(session.curatorNotes).filter(note=>note.reflection.trim().length>=40).length;
  return {inspected,discoveries,completed,stories,complete:completed===fieldMission.length&&stories>0};
}
