// Adapted from Revforge render3d.ts, MIT, Copyright (c) 2026 Wasabules.
export { MeshBuilder, m34, parseColor, triangulate } from './mesh3d';
export function toGeometry(T:any,data:any){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(Float32Array.from(data.positions),3));if(data.normals)g.setAttribute('normal',new T.BufferAttribute(Float32Array.from(data.normals),3));g.setIndex(new T.BufferAttribute(Uint32Array.from(data.indices),1));if(!data.normals)g.computeVertexNormals();return g;}
export function disposeObject(o:any,keep:any){const shared=new Set(Object.values(keep||{}));o.traverse((n:any)=>{n.geometry?.dispose();for(const m of Array.isArray(n.material)?n.material:[n.material])if(m&&!shared.has(m))m.dispose();});}
