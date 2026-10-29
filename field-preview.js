/* In-memory visual preview only. No Supabase client, credentials, or network writes. */
window.FIELD_INSTRUMENT_PREVIEW=true;
window.fieldPreviewClient=(()=>{
 const owner={id:'00000000-0000-4000-8000-000000000001'},tables={field_instruments:[]},photos=new Map();
 return {auth:{getUser:async()=>({data:{user:owner},error:null})},from:name=>{
  const filters=[];return {select(){return this},eq(k,v){filters.push([k,v]);return this},order(){return this},then(resolve,reject){return Promise.resolve({data:(tables[name]||[]).filter(r=>filters.every(([k,v])=>r[k]===v)),error:null}).then(resolve,reject)},async maybeSingle(){return {data:(tables[name]||[]).find(r=>filters.every(([k,v])=>r[k]===v))||null,error:null}},async insert(row){if(name!=='field_instruments')return {error:{message:'Preview only — cloud saving is not connected.'}};tables[name].push(structuredClone(row));return {error:null}}};
 },storage:{from:()=>({upload:async(path,file)=>{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)});photos.set(path,data);return {error:null}},remove:async paths=>{paths.forEach(p=>photos.delete(p));return {error:null}},createSignedUrl:async path=>({data:{signedUrl:photos.get(path)},error:photos.has(path)?null:{message:'Preview photo not found'}})})}};
})();
