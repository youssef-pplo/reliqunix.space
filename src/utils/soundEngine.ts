import type { CelestialBody } from '@/data/relicsData';

/** Entirely synthesized, deliberately quiet, and activated only by a gesture. */
export class SoundEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: AudioNode[] = [];
  private enabled = false;
  private lastPing = 0;
  private planet: CelestialBody = 'MOON';

  async enable(planet: CelestialBody) {
    if (typeof window === 'undefined') return;
    try {
      this.context ??= new AudioContext();
      this.master ??= this.context.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.context.destination);
      await this.context.resume();
      this.enabled = true;
      this.startAmbientDrone(planet);
    } catch { this.enabled = false; }
  }
  disable() {
    this.enabled = false;
    this.stopAmbient();
    void this.context?.suspend();
  }
  private stopAmbient() {
    for (const node of this.ambient) {
      if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) { try { node.stop(); } catch { /* already stopped */ } }
      node.disconnect();
    }
    this.ambient = [];
  }
  private noise(seconds: number, pink = false) {
    const ctx = this.context!;
    const buffer = ctx.createBuffer(1,Math.ceil(ctx.sampleRate*seconds),ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0=0,b1=0,b2=0;
    for(let i=0;i<data.length;i++) {
      const white=Math.random()*2-1;
      if(pink) { b0=0.99765*b0+white*0.099046; b1=0.963*b1+white*0.2965164; b2=0.57*b2+white*1.0526913; data[i]=(b0+b1+b2+white*0.1848)*0.12; }
      else data[i]=white;
    }
    const source=ctx.createBufferSource(); source.buffer=buffer; return source;
  }
  startAmbientDrone(planet: CelestialBody) {
    this.planet = planet;
    if (!this.enabled || !this.context || !this.master) return;
    this.stopAmbient();
    const ctx=this.context;
    for (const [frequency,volume] of planet==='MARS'?[[43,0.14],[64.5,0.035]]:[[48,0.11],[144,0.014],[384,0.008]]) {
      const osc=ctx.createOscillator(), gain=ctx.createGain(); osc.type='sine'; osc.frequency.value=frequency;
      gain.gain.value=volume; osc.connect(gain).connect(this.master); osc.start(); this.ambient.push(osc,gain);
    }
    if(planet==='MARS') {
      const wind=this.noise(8,true), filter=ctx.createBiquadFilter(), gain=ctx.createGain();
      filter.type='lowpass';filter.frequency.value=350;gain.gain.value=0.13;wind.loop=true;
      wind.connect(filter).connect(gain).connect(this.master);wind.start();this.ambient.push(wind,filter,gain);
    }
  }
  private tone(frequency:number,duration:number,volume:number,type:OscillatorType='sine',slide?:number) {
    if(!this.enabled||!this.context||!this.master)return;
    const ctx=this.context,t=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(frequency,t);
    if(slide)osc.frequency.exponentialRampToValueAtTime(slide,t+duration);
    gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(0.0001,t+duration);
    osc.connect(gain).connect(this.master);osc.start(t);osc.stop(t+duration);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }
  playHoverPing() {
    if(Date.now()-this.lastPing<100)return;
    this.lastPing=Date.now();this.tone(2400,0.09,0.075);
  }
  playLockClick() {this.tone(640,0.065,0.14,'square',110);this.tone(90,0.12,0.18);}
  playPlanetSwitch() {
    this.tone(2525,0.14,0.11);
    if(!this.enabled||!this.context||!this.master)return;
    const source=this.noise(0.24),filter=this.context.createBiquadFilter(),gain=this.context.createGain();
    filter.type='bandpass';filter.frequency.value=1600;gain.gain.setValueAtTime(0.08,this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001,this.context.currentTime+0.24);
    source.connect(filter).connect(gain).connect(this.master);source.start();
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }
  dispose() {this.stopAmbient();void this.context?.close();this.context=null;this.master=null;this.enabled=false;}
}
export const soundEngine = new SoundEngine();
