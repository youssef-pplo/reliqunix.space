'use client';
import { create } from 'zustand';
import { getRelic, getRelics, type CelestialBody } from '@/data/relicsData';

export type CameraPhase = 'ORBIT' | 'DESCENT' | 'SURFACE_TOUR' | 'INSPECT';
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
  switchPlanet: planet => {
    if (get().celestialBody === planet) return;
    set({ celestialBody: planet, scrollProgress: 0, cameraPhase: 'ORBIT', activeRelicId: null, selectedPartId: null, hoveredPartLabel: null, decayTimeline: 25, jumpTarget: { progress: 0, serial: Date.now(), immediate: true } });
  },
  setScrollProgress: progress => {
    const p = Math.max(0, Math.min(1, progress));
    if (get().cameraPhase === 'INSPECT' || Math.abs(p-get().scrollProgress)<0.0001) return;
    const relics = getRelics(get().celestialBody);
    const active = p < 0.37 || p > 0.94 ? null : relics[p < 0.56 ? 0 : p < 0.76 ? 1 : 2];
    set({ scrollProgress: p, cameraPhase: phaseAt(p), activeRelicId: active?.id ?? null });
  },
  inspectPart: (relicId, partId) => {
    const relic = getRelic(relicId);
    if (!relic || !relic.parts.some(p => p.partId === partId)) return;
    set({ celestialBody: relic.planet, activeRelicId: relicId, selectedPartId: partId, cameraPhase: 'INSPECT', hoveredPartLabel: null });
  },
  returnToFlight: () => set(state => ({ selectedPartId: null, cameraPhase: phaseAt(state.scrollProgress), hoveredPartLabel: null })),
  setDecayTimeline: value => set({ decayTimeline: Math.max(0, Math.min(100, value)) }),
  jumpToRelic: id => {
    const relic = getRelic(id);
    set(state => ({ celestialBody: relic?.planet ?? state.celestialBody, selectedPartId: null, hoveredPartLabel: null, cameraPhase: phaseAt(relic?.splineProgress ?? 0), activeRelicId: id, jumpTarget: { progress: relic?.splineProgress ?? 0, serial: Date.now() } }));
  },
  setHoveredPart: label => set({ hoveredPartLabel: label }),
  setAudioEnabled: enabled => set({ audioEnabled: enabled }),
  launch: audio => set({ isLoaded: true, audioEnabled: audio }),
  setSceneReady: () => set({ sceneReady: true }),
  setGraphicsAvailable: available => set({ graphicsAvailable: available, sceneReady: true }),
  setReducedMotion: reduced => set({ reducedMotion: reduced }),
}));
