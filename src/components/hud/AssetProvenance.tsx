import { ArrowUpRight } from 'lucide-react';
import { getModelAsset } from '@/data/modelAssets';

export default function AssetProvenance({relicId}:{relicId:string}) {
  const asset=getModelAsset(relicId);
  return <div className={`asset-provenance ${asset?'is-source-backed':'is-interpretive'}`} title={asset?.notes}>
    <span className="provenance-dot" aria-hidden="true"/>
    <span><strong>{asset?'NASA SOURCE MODEL':'INTERPRETIVE RECONSTRUCTION'}</strong>{asset&&<small>{asset.credit}</small>}</span>
    {asset&&<a href={asset.sourceUrl} target="_blank" rel="noreferrer" aria-label={`View the original ${asset.label} source`}>SOURCE <ArrowUpRight size={12}/></a>}
  </div>;
}
