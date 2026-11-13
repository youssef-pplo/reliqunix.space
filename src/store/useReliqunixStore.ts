'use client';
import { create } from 'zustand';
import { getRelic, getRelics, type CelestialBody } from '@/data/relicsData';
import { missionEvidence } from '@/data/missionEvidence';
import { type CuratorNotes } from '@/data/fieldMission';

export type CameraPhase = 'ORBIT' | 'DESCENT' | 'SURFACE_TOUR' | 'INSPECT';
export type ArchivePanel = 'collection' | 'sources' | 'notebook' | 'mission' | null;
interface ReliqunixState {
  celestialBody: CelestialBody;
  scrollProgress: number;
  cameraPhase: CameraPhase;
  activeRelicId: string | null;
  selectedPartId: string | null;
  hoveredPartLabel: string | null;
  decayTimeline: number;
  audioEnabled: boolean;
  isLoaded: boolean;
  sceneReady: boolean;
  graphicsAvailable: boolean;
  reducedMotion: boolean;
  archivePanel: ArchivePanel;
  exploredRelicIds: string[];
  answeredRelicIds: string[];
  curatorNotes: CuratorNotes;
  openArchive: (panel: ArchivePanel) => void;
  recordAnswer: (id: string) => void;
  recordComponentView: (relicId:string,partId:string) => void;
  setCuratorNote: (id:string,factIndex:number,reflection:string) => void;
  restoreNotebook: (explored: string[], answered: string[], notes?:unknown) => void;
  jumpTarget: { progress: number; serial: number; immediate?: boolean } | null;
  switchPlanet: (planet: CelestialBody) => void;
  setScrollProgress: (progress: number) => void;
  inspectPart: (relicId: string, partId: string) => void;
  returnToFlight: () => void;
  setDecayTimeline: (value: number) => void;
  jumpToRelic: (id: string | null) => void;
  setHoveredPart: (label: string | null) => void;
  setAudioEnabled: (enabled: boolean) => void;
  launch: (audio: boolean) => void;
  setSceneReady: () => void;
  setGraphicsAvailable: (available: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
}
const phaseAt = (p: number): CameraPhase => p < 0.22 ? 'ORBIT' : p < 0.38 ? 'DESCENT' : 'SURFACE_TOUR';
export const useReliqunixStore = create<ReliqunixState>((set, get) => ({
  celestialBody: 'MOON', scrollProgress: 0, cameraPhase: 'ORBIT', activeRelicId: null, selectedPartId: null,
  hoveredPartLabel: null, decayTimeline: 25, audioEnabled: false, isLoaded: false, sceneReady: false,
  graphicsAvailable: true, reducedMotion: false, jumpTarget: null,
  archivePanel: null, exploredRelicIds: [], answeredRelicIds: [], curatorNotes:{},
  openArchive: panel => set({ archivePanel: panel }),
  recordAnswer: id => { if(getRelic(id))set(s=>({answeredRelicIds:[...new Set([...s.answeredRelicIds,id])]})); },
  recordComponentView: (id,partId) => {if(getRelic(id)?.parts.some(part=>part.partId===partId))set(s=>({exploredRelicIds:[...new Set([...s.exploredRelicIds,id])]}));},
  setCuratorNote: (id,factIndex,reflection) => {
    if(!getRelic(id)||!Number.isInteger(factIndex)||!missionEvidence[id]?.facts[factIndex]||typeof reflection!=='string')return;
    set(s=>({curatorNotes:{...s.curatorNotes,[id]:{factIndex,reflection:reflection.slice(0,800)}}}));
  },
  restoreNotebook: (explored, answered, notes) => {
    const curatorNotes:CuratorNotes={};
    if(notes&&typeof notes==='object'&&!Array.isArray(notes))for(const [id,value] of Object.entries(notes)){
      if(!getRelic(id)||!value||typeof value!=='object')continue;
      const note=value as {factIndex?:unknown;reflection?:unknown};
      if(typeof note.factIndex==='number'&&Number.isInteger(note.factIndex)&&missionEvidence[id]?.facts[note.factIndex]&&typeof note.reflection==='string')curatorNotes[id]={factIndex:note.factIndex,reflection:note.reflection.slice(0,800)};
    }
    set({exploredRelicIds:[...new Set(explored.filter(id=>!!getRelic(id)))],answeredRelicIds:[...new Set(answered.filter(id=>!!getRelic(id)))],curatorNotes});
  },
  switchPlanet: planet => {
    if (get().celestialBody === planet) return;
    set({ celestialBody: planet, scrollProgress: 0, cameraPhase: 'ORBIT', activeRelicId: null, selectedPartId: null, hoveredPartLabel: null, decayTimeline: 25, jumpTarget: { progress: 0, serial: Date.now(), immediate: true } });
  },
  setScrollProgress: progress => {
    const p = Math.max(0, Math.min(1, progress));
    if (get().cameraPhase === 'INSPECT' || Math.abs(p-get().scrollProgress)<0.0001) return;
    const relics = getRelics(get().celestialBody);
    const active = p < 0.37 || p > 0.94 ? null : relics.reduce((nearest, relic) => Math.abs(relic.splineProgress-p)<Math.abs(nearest.splineProgress-p)?relic:nearest,relics[0]);
    set({ scrollProgress: p, cameraPhase: phaseAt(p), activeRelicId: active?.id ?? null });
  },
  inspectPart: (relicId, partId) => {
    const relic = getRelic(relicId);
    if (!relic || !relic.parts.some(p => p.partId === partId)) return;
    set(s=>({ celestialBody: relic.planet, activeRelicId: relicId, selectedPartId: partId, cameraPhase: 'INSPECT', hoveredPartLabel: null, exploredRelicIds:[...new Set([...s.exploredRelicIds,relicId])] }));
  },
  returnToFlight: () => set(state => ({ selectedPartId: null, cameraPhase: phaseAt(state.scrollProgress), hoveredPartLabel: null })),
  setDecayTimeline: value => set({ decayTimeline: Math.max(0, Math.min(100, value)) }),
  jumpToRelic: id => {
    const relic = getRelic(id);
    if(id&&!relic)return;
    set(state => ({ celestialBody: relic?.planet ?? state.celestialBody, archivePanel:null, selectedPartId: null, hoveredPartLabel: null, cameraPhase: phaseAt(relic?.splineProgress ?? 0), activeRelicId: id, jumpTarget: { progress: relic?.splineProgress ?? 0, serial: Date.now(), immediate:!!relic&&relic.planet!==state.celestialBody } }));
  },
  setHoveredPart: label => set({ hoveredPartLabel: label }),
  setAudioEnabled: enabled => set({ audioEnabled: enabled }),
  launch: audio => set({ isLoaded: true, audioEnabled: audio }),
  setSceneReady: () => set({ sceneReady: true }),
  setGraphicsAvailable: available => set({ graphicsAvailable: available, sceneReady: true }),
  setReducedMotion: reduced => set({ reducedMotion: reduced }),
}));
