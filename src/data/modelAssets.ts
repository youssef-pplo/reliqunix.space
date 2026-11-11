export interface RelicModelAsset {
  path:string;
  sourceUrl:string;
  label:string;
  credit:string;
  notes:string;
  width:number;
  rotation?:[number,number,number];
}

export const modelAssets:Record<string,RelicModelAsset>={
  eagle:{path:'/assets/models/Apollo-Lunar-Module.glb',sourceUrl:'https://science.nasa.gov/3d-resources/apollo-lunar-module/',label:'NASA Apollo Lunar Module',credit:'NASA / Michael D. Carbajal',notes:'NASA reference geometry, adapted to show the descent hardware left on the Moon.',width:6.8},
  ingenuity:{path:'/assets/models/Ingenuity-Mars-Helicopter.glb',sourceUrl:'https://science.nasa.gov/3d-resources/ingenuity-mars-helicopter/',label:'NASA Ingenuity Mars Helicopter',credit:'NASA / Brian E. Kumanchik',notes:'Original NASA engineering visualization. Environmental aging is illustrative; the source geometry predates Flight 72.',width:4.2},
  opportunity:{path:'/assets/models/Opportunity-MER-Web.glb',sourceUrl:'https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/',label:'NASA / JPL Mars Exploration Rover',credit:'NASA / JPL-Caltech',notes:'NASA rover geometry and textures. Web edition retains all 31,450 triangles; texture encoding reduces the download by 74%. Dust and settling are illustrative.',width:4.1},
};
export const getModelAsset=(id:string)=>modelAssets[id];
