/* ecotera home: instrument registration and manual readings beta. No inference. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const make=(tag,text,attrs={})=>{const n=document.createElement(tag);if(text!==null)n.textContent=text;Object.assign(n,attrs);return n;};
let instruments=[],selected=null,loadedOwner=null,registrationBusy=false;
const copy=v=>JSON.parse(JSON.stringify(v));
function changed(){if(typeof markObservation==='function')markObservation();}
function text(r){if(!r)return '';return '\n\nInstrument: '+r.definition.name+' · Manual reading (Beta)\n'+[r.definition.manufacturer,r.definition.model,r.definition.serial_lot].filter(Boolean).join(' / ')+'\nMeasured: '+new Date(r.measured_at).toLocaleString()+'\n'+r.results.map(p=>p.name+': '+(p.qualifier==='not_read'?'Not read':p.qualifier==='invalid'?'Invalid':(p.qualifier==='below'?'Below ':p.qualifier==='above'?'Above ':'')+p.value+(p.unit?' '+p.unit:''))).join('\n')+'\nPhoto interpretation has not been performed.';}
function savedElement(r){const el=make('pre',text(r).trim());el.style.cssText='white-space:pre-wrap;font:inherit;padding:14px;background:#eef7f5;border-radius:10px;overflow-wrap:anywhere';return el;}
function snapshot(){
 if(!selected)return null;
 const results=[];
 for(const [i,p] of selected.parameters.entries()){
  const qualifier=$('qualifier'+i).value,raw=$('reading'+i).value;
  let value=null,color=null;
  if(!['not_read','invalid'].includes(qualifier)){
   if(raw.trim()===''||!Number.isFinite(Number(raw))){$('instrumentStatus').textContent='Enter a finite reading for '+p.name+', or choose Not read / Invalid.';$('reading'+i).focus();return false;}
   value=Number(raw);
   if(selected.kind==='strip'){const step=p.scale.find(x=>x.value===value);if(!step){$('instrumentStatus').textContent='Choose a scale step for '+p.name+'.';return false;}color=step.color;}
  }
  results.push({name:p.name,unit:p.unit,value,color,qualifier});
 }
 const local=$('measuredAt').value;
 if(!local||Number.isNaN(new Date(local).getTime())){$('instrumentStatus').textContent='Enter the measurement date and time.';return false;}
 $('instrumentStatus').textContent='Manual readings ready. Save the observation to keep them.';
 return {schema_version:1,method:'manual',definition:copy(selected),measured_at:new Date(local).toISOString(),results};
}
function reset(){selected=null;if($('instrumentSelect')){$('instrumentSelect').value='';$('readingFields').replaceChildren();$('referencePreview').replaceChildren();$('instrumentStatus').textContent='';}}
window.FieldInstruments={snapshot,reset,text,savedElement};
if(!$('instrumentBetaMount'))return;
const style=make('style',null);style.textContent=`.beta-tag{font-size:.75rem;background:#fef3c7;color:#78350f;padding:4px 8px;border-radius:20px;display:inline-block}.instrument-beta input,.instrument-beta select{width:100%;padding:11px;border:1px solid #d7ded9;border-radius:9px;font:inherit;background:white;color:#1f2933}.instrument-beta input[type=color]{height:44px;padding:4px}.instrument-beta details{margin-top:16px}.instrument-beta summary{cursor:pointer;font-weight:700;color:#0f766e;padding:12px 0}.instrument-beta fieldset{min-width:0;border:1px solid #d7ded9;border-radius:10px;margin:14px 0;padding:12px}.instrument-beta legend{font-weight:700}.instrument-beta .pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}.instrument-beta .scale-row{display:grid;grid-template-columns:1fr 65px auto;gap:8px;align-items:end}.instrument-beta .scale-row button{width:auto;margin:0}.instrument-beta .hint{color:#596579;font-size:.88rem;line-height:1.5}.instrument-beta .swatches{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.instrument-beta .swatch{display:inline-flex;align-items:center;gap:5px;border:1px solid #d7ded9;border-radius:6px;padding:5px}.instrument-beta .swatch i{width:20px;height:20px;display:inline-block;border:1px solid #667085}.instrument-beta .reference{display:block;max-height:280px;max-width:100%;margin-top:10px}.instrument-beta .reading-controls{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:480px){.instrument-beta .pair,.instrument-beta .reading-controls{grid-template-columns:1fr}}`;
document.head.appendChild(style);
$('instrumentBetaMount').innerHTML=`<section class="instrument-beta" aria-labelledby="instrumentTitle">
<h2 id="instrumentTitle">Instrument / Test <span class="beta-tag">Beta</span></h2>
<p class="hint">Register a meter or test strip and enter readings manually. Photo-based strip interpretation is planned; this beta does not calculate results from photos.</p>
<label for="instrumentSelect">Instrument / test for this observation</label><select id="instrumentSelect"><option value="">None — general observation</option></select>
<button id="refreshInstruments" type="button" class="secondary">Refresh My Instruments</button>
<div id="instrumentStatus" class="status" role="status" aria-live="polite"></div>
<div id="referencePreview"></div><div id="readingFields"></div>
<details id="registerDetails"><summary>Add Instrument <span class="beta-tag">Beta</span></summary>
<p class="hint">Sign in to save instruments to your account. New registrations keep their own definition; previous readings keep the definition used at capture.</p>
<form id="instrumentForm">
<label for="instrumentName">Instrument / test name *</label><input id="instrumentName" maxlength="120" required placeholder="e.g. My 9-in-1 water test strip">
<label for="instrumentKind">Type *</label><select id="instrumentKind"><option value="meter">Meter</option><option value="strip">Test strip</option><option value="other">Other test</option></select>
<div class="pair"><div><label for="manufacturer">Manufacturer</label><input id="manufacturer" maxlength="120"></div><div><label for="model">Model / product</label><input id="model" maxlength="120"></div></div>
<label for="serialLot">Serial number / lot</label><input id="serialLot" maxlength="120">
<label for="readSeconds">Read after (seconds, optional)</label><input id="readSeconds" type="number" min="0" max="86400" step="1" placeholder="Use the manufacturer's instructions">
<label for="testInstructions">Instructions / calibration notes</label><textarea id="testInstructions" maxlength="2000" placeholder="Record timing, calibration, and handling instructions."></textarea>
<label for="chartFile">Reference chart photo (optional, JPEG / PNG / WebP, up to 8 MB)</label><input id="chartFile" type="file" accept="image/jpeg,image/png,image/webp">
<p class="hint">For strips, add each pad in physical order. Copy the values and colors from the manufacturer’s chart; screen colors are approximate references.</p>
<div id="parameterDefinitions"></div><button id="addParameter" class="secondary" type="button">Add Measurement / Pad</button>
<button id="registerInstrumentButton" type="submit">Save Instrument</button>
<div id="registrationStatus" class="status" role="status" aria-live="polite"></div></form></details></section>`;
function input(label,type,value=''){const wrap=make('div',null),id='beta-'+crypto.randomUUID(),el=make('input',null,{id,type,value});wrap.append(make('label',label,{htmlFor:id}),el);return {wrap,el};}
function addScale(container,value='',color='#ffffff'){
 if(container.children.length>=30)return;
 const row=make('div',null,{className:'scale-row'}),v=input('Scale value','number',value),c=input('Color','color',color),remove=make('button','×',{type:'button',className:'secondary',ariaLabel:'Remove scale step'});
 v.el.step='any';v.el.required=true;v.el.dataset.role='value';c.el.dataset.role='color';remove.onclick=()=>row.remove();row.append(v.wrap,c.wrap,remove);container.appendChild(row);
}
function addParameter(){
 const holder=$('parameterDefinitions');if(holder.children.length>=30)return;
 const row=make('fieldset',null,{className:'parameter-definition'}),legend=make('legend','Measurement / Pad '+(holder.children.length+1)),pair=make('div',null,{className:'pair'}),name=input('Name *','text'),unit=input('Unit (leave blank for pH)','text');name.el.required=true;name.el.maxLength=80;unit.el.maxLength=40;name.el.dataset.role='name';unit.el.dataset.role='unit';pair.append(name.wrap,unit.wrap);
 const details=make('details',null,{className:'scale-definition'});details.open=$('instrumentKind').value==='strip';const steps=make('div',null,{className:'scale-steps'}),add=make('button','Add Color Scale Step',{type:'button',className:'secondary'});add.onclick=()=>addScale(steps);details.append(make('summary','Manufacturer color scale (required for strips)'),steps,add);
 const remove=make('button','Remove Measurement',{type:'button',className:'secondary'});remove.onclick=()=>{row.remove();Array.from(holder.children).forEach((r,i)=>r.querySelector('legend').textContent='Measurement / Pad '+(i+1));};row.append(legend,pair,details,remove);holder.appendChild(row);
}
$('addParameter').onclick=addParameter;addParameter();
$('instrumentKind').onchange=()=>document.querySelectorAll('.scale-definition').forEach(d=>d.open=$('instrumentKind').value==='strip');
async function user(){const {data,error}=await supabaseClient.auth.getUser();if(error||!data?.user)return null;currentUser=data.user;return data.user;}
function setupError(e){return 'Could not access saved instruments. '+(e.message||String(e))+' If setup is pending, ask the site owner to install the included Home database setup.';}
async function refresh(){
 const button=$('refreshInstruments');button.disabled=true;
 try{
  const u=await user();
  if(!u){instruments=[];if(loadedOwner){reset();changed();}loadedOwner=null;$('instrumentSelect').replaceChildren(make('option','None — general observation',{value:''}));$('instrumentStatus').textContent='Sign in in a new tab, then refresh to register or select your instruments.';return;}
  if(loadedOwner&&loadedOwner!==u.id){reset();changed();}
  loadedOwner=u.id;
  const {data,error}=await supabaseClient.from('field_instruments').select('id,name,kind,manufacturer,model,serial_lot,read_seconds,instructions,parameters,reference_chart_path,version').eq('user_id',u.id).order('created_at',{ascending:false});if(error)throw error;
  instruments=data||[];const select=$('instrumentSelect'),old=selected?.id;select.replaceChildren(make('option','None — general observation',{value:''}));for(const row of instruments)select.appendChild(make('option',row.name+(row.serial_lot?' · '+row.serial_lot:''),{value:row.id}));
  if(old&&instruments.some(r=>r.id===old))select.value=old;else if(old){reset();changed();}
  $('instrumentStatus').textContent=instruments.length?'Choose an instrument to enter manual readings.':'No saved instruments yet. Open Add Instrument · Beta below.';
 }catch(e){$('instrumentStatus').textContent=setupError(e);}finally{button.disabled=false;}
}
$('refreshInstruments').onclick=refresh;
$('instrumentForm').onsubmit=async event=>{
 event.preventDefault();if(registrationBusy)return;
 const status=$('registrationStatus'),button=$('registerInstrumentButton');let chartPath=null,completed=false,definitionId=null;
 try{
  const kind=$('instrumentKind').value,parameters=Array.from(document.querySelectorAll('.parameter-definition')).map(r=>({name:r.querySelector('[data-role=name]').value.trim(),unit:r.querySelector('[data-role=unit]').value.trim(),scale:Array.from(r.querySelector('.scale-steps').children).map(step=>({value:Number(step.querySelector('[data-role=value]').value),color:step.querySelector('[data-role=color]').value}))}));
  if(!parameters.length)throw Error('Add at least one measurement.');
  const names=new Set();for(const p of parameters){if(!p.name)throw Error('Each measurement needs a name.');if(names.has(p.name.toLowerCase()))throw Error('Use a different name for each measurement.');names.add(p.name.toLowerCase());if(kind==='strip'&&p.scale.length<2)throw Error('Add at least two color scale steps for every strip pad.');if(p.scale.some(v=>!Number.isFinite(v.value)))throw Error('Use finite numeric scale values.');if(new Set(p.scale.map(v=>v.value)).size!==p.scale.length)throw Error('Each pad needs distinct scale values.');}
  if(!$('instrumentName').value.trim())throw Error('Enter an instrument name.');
  const chart=$('chartFile').files[0];if(chart&&(!['image/jpeg','image/png','image/webp'].includes(chart.type)||chart.size>8*1024*1024))throw Error('Use a JPEG, PNG or WebP chart photo up to 8 MB.');
  registrationBusy=true;button.disabled=true;status.textContent='Checking your account…';
  const u=await user();if(!u)throw Error('Sign in in a new tab, then return here and save. Your instrument details have been kept.');
  const id=crypto.randomUUID();definitionId=id;
  if(chart){chartPath=u.id+'/instruments/'+id+'.'+({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[chart.type]);status.textContent='Uploading reference chart…';const {error}=await supabaseClient.storage.from('field-data').upload(chartPath,chart,{upsert:false,contentType:chart.type});if(error)throw error;}
  const definition={id,user_id:u.id,name:$('instrumentName').value.trim(),kind,manufacturer:$('manufacturer').value.trim(),model:$('model').value.trim(),serial_lot:$('serialLot').value.trim(),read_seconds:$('readSeconds').value===''?null:Number($('readSeconds').value),instructions:$('testInstructions').value.trim(),parameters,reference_chart_path:chartPath,version:1};
  status.textContent='Saving instrument…';const {error}=await supabaseClient.from('field_instruments').insert(definition);if(error)throw error;completed=true;
  await refresh();if(!instruments.some(r=>r.id===id)){status.textContent='Instrument saved. Refresh My Instruments to load it.';return;}
  if(!selected){$('instrumentSelect').value=id;await selectInstrument();}
  $('instrumentForm').reset();$('parameterDefinitions').replaceChildren();addParameter();$('registerDetails').open=false;status.textContent='Instrument saved.';$('instrumentStatus').textContent='Instrument saved. Enter its readings below.';
 }catch(e){if(definitionId&&!completed){try{const check=await supabaseClient.from('field_instruments').select('id').eq('id',definitionId).maybeSingle();if(!check.error&&check.data){await refresh();status.textContent='Instrument saved. Choose it from My Instruments.';return;}if(!check.error&&!check.data&&chartPath)await supabaseClient.storage.from('field-data').remove([chartPath]);}catch{}}status.textContent=(e.message||String(e))+' Your registration details have been kept.';}finally{registrationBusy=false;button.disabled=false;}
};
async function selectInstrument(){
 const value=$('instrumentSelect').value;
 if(selected&&value!==selected.id&&Array.from($('readingFields').querySelectorAll('[id^=reading]')).some(el=>el.value!=='')){
  if(!confirm('Changing instruments clears the current manual readings. Continue?')){$('instrumentSelect').value=selected.id;return;}
 }
 selected=instruments.find(r=>r.id===value)||null;changed();$('readingFields').replaceChildren();$('referencePreview').replaceChildren();if(!selected)return;
 const selectedId=selected.id;
 const local=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16),date=input('Measured at (your local time)','datetime-local',local);date.el.id='measuredAt';date.wrap.querySelector('label').htmlFor='measuredAt';date.el.required=true;$('readingFields').appendChild(date.wrap);
 if(selected.instructions)$('readingFields').appendChild(make('p',selected.instructions,{className:'hint'}));if(selected.read_seconds!==null)$('readingFields').appendChild(make('p','Read after '+selected.read_seconds+' seconds, following the manufacturer’s instructions.',{className:'hint'}));
 selected.parameters.forEach((p,i)=>{
  const group=make('fieldset',null);group.appendChild(make('legend',(i+1)+'. '+p.name+(p.unit?' ('+p.unit+')':'')));
  const controls=make('div',null,{className:'reading-controls'}),q=make('select',null,{id:'qualifier'+i,ariaLabel:p.name+' result status'});for(const [value,label] of [['not_read','Not read'],['exact','Reading'],['below','Below scale'],['above','Above scale'],['invalid','Invalid']])q.appendChild(make('option',label,{value}));
  const reading=make(selected.kind==='strip'?'select':'input',null,{id:'reading'+i,ariaLabel:p.name+' manual value',disabled:true});if(selected.kind==='strip'){reading.appendChild(make('option','Choose manufacturer scale step',{value:''}));for(const step of p.scale)reading.appendChild(make('option',String(step.value)+(p.unit?' '+p.unit:''),{value:String(step.value)}));}else {reading.type='number';reading.step='any';}
  q.onchange=()=>{reading.disabled=['not_read','invalid'].includes(q.value);changed();};reading.oninput=changed;controls.append(q,reading);group.appendChild(controls);
  if(p.scale.length){const swatches=make('div',null,{className:'swatches'});for(const step of p.scale){const swatch=make('span',null,{className:'swatch'}),chip=make('i',null);if(/^#[0-9a-f]{6}$/i.test(step.color))chip.style.backgroundColor=step.color;swatch.append(chip,make('span',String(step.value)));swatches.appendChild(swatch);}group.appendChild(swatches);}
  $('readingFields').appendChild(group);
 });
 $('measuredAt').oninput=changed;
 $('readingFields').appendChild(make('p','Add a clear photo of the test strip or instrument above to keep it with these readings. Follow the manufacturer’s timing and lighting instructions.',{className:'hint'}));
 if(selected.reference_chart_path){try{const {data,error}=await supabaseClient.storage.from('field-data').createSignedUrl(selected.reference_chart_path,3600);if(error)throw error;if(selected?.id===selectedId){$('referencePreview').appendChild(make('img',null,{src:data.signedUrl,alt:'Manufacturer reference chart',className:'reference'}));}}catch{if(selected?.id===selectedId)$('referencePreview').textContent='Reference chart could not be loaded. Use your physical manufacturer chart.';}}
}
$('instrumentSelect').onchange=selectInstrument;
window.saveEntry=async()=>{
 const status=$('saveStatus'),button=$('saveObservationButton');if(savingObservation)return;
 const observation=observationSnapshot();if(!observation){status.textContent='Add an observation and complete any selected manual readings first.';return;}
 savingObservation=true;button.disabled=true;
 let uploadedPath=null,rowSaved=false;
 try{
  status.textContent='Checking your account…';const u=await user();if(!u)throw Error('Sign in in a new tab, then return and save. Your draft has been kept.');
  if(observation.instrument&&loadedOwner!==u.id)throw Error('Your account changed. Refresh My Instruments and choose an instrument from this account before saving.');
  // A stable client ID makes a retry safe after an ambiguous network response.
  const prior=await supabaseClient.from('field_data').select('id').eq('id',observation.id).eq('user_id',u.id).maybeSingle();if(prior.error)throw prior.error;if(prior.data){status.textContent='This observation is already saved. Change the draft or clear it to record another.';return;}
  if(observation.photo){
   if(observation.photo.size>20*1024*1024)throw Error('Choose a photo up to 20 MB.');
   let file;
   if(observation.instrument){if(!['image/jpeg','image/png','image/webp'].includes(observation.photo.type))throw Error('For instrument photos, choose JPEG, PNG or WebP to preserve the uploaded image.');file=observation.photo;}else file=await compressImage(observation.photo,'FieldData');
   const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];if(!ext)throw Error('Unsupported photo format.');
   uploadedPath=u.id+'/observations/'+observation.id+'.'+ext;status.textContent='Uploading photo…';const result=await supabaseClient.storage.from('field-data').upload(uploadedPath,file,{upsert:false,contentType:file.type});if(result.error){uploadedPath=null;throw result.error;}
  }
  status.textContent='Saving observation…';const {error}=await supabaseClient.from('field_data').insert({id:observation.id,user_id:u.id,file_path:uploadedPath,notes:observation.notes||null,latitude:observation.latitude,longitude:observation.longitude,observed_at:observation.timestamp,instrument_reading:observation.instrument});if(error)throw error;
  rowSaved=true;status.textContent='✓ Saved to My Field Data. Clear the draft to start a new observation.';
 }catch(e){
  // Confirm an insert did not commit before removing its photo after network errors.
  if(uploadedPath&&!rowSaved){try{const check=await supabaseClient.from('field_data').select('id').eq('id',observation.id).maybeSingle();if(!check.error&&!check.data)await supabaseClient.storage.from('field-data').remove([uploadedPath]);else if(check.data){status.textContent='✓ Observation saved to My Field Data.';return;}}catch{}}
  status.textContent='Not confirmed saved: '+(e.message||String(e))+' Your draft has been kept.';
 }finally{savingObservation=false;button.disabled=false;}
};
window.addEventListener('beforeunload',e=>{if(selectedPhotoBlob||$('notes').value.trim()||latitude!==null||selected){e.preventDefault();e.returnValue='';}});
refresh();
})();
