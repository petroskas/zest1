(() => {
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const S=JSON.parse(localStorage.getItem('zest-a11y')||'{}'),save=()=>{try{localStorage.setItem('zest-a11y',JSON.stringify(S))}catch(e){}};
const tts='speechSynthesis' in window;let voiceLang=S.lang||'en-GB';
const say=(t,force)=>{if(!tts||!t)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.replace(/\s+/g,' ').slice(0,3000));u.lang=voiceLang;u.rate=S.rate||1;speechSynthesis.speak(u)};
const stop=()=>tts&&speechSynthesis.cancel();
const live=document.createElement('div');live.setAttribute('aria-live','polite');live.style.cssText='position:absolute;left:-9999px';document.body.append(live);
const announce=t=>{live.textContent=t;if(S.audio)say(t)};
// ---- toolbar
const opts=[['dys','Dyslexia font'],['contrast','High contrast'],['gray','Greyscale'],['invert','Invert colours'],['links','Highlight links'],['lh','Wider line spacing'],['still','Stop animations'],['cursor','Big cursor'],['ruler','Reading ruler'],['audio','Audio mode (auto-read)']];
const fab=document.createElement('button');fab.className='a11y-fab';fab.setAttribute('aria-label','Accessibility tools (Alt+M)');fab.setAttribute('aria-expanded','false');fab.textContent='♿';
const pn=document.createElement('div');pn.className='a11y-panel';pn.hidden=true;pn.setAttribute('role','dialog');pn.setAttribute('aria-label','Accessibility tools');
pn.innerHTML=`<h3>Accessibility tools</h3><div class="a-row"><button data-a="big">A+</button><button data-a="small">A−</button><button data-a="reset">Reset all</button></div>
<div class="a-grid">${opts.map(o=>`<button data-o="${o[0]}" aria-pressed="false">${o[1]}</button>`).join('')}</div>
<div class="a-row"><button data-a="readpage">🔊 Read page</button><button data-a="stop">⏹ Stop</button><button data-a="voice">🎤 Voice commands</button></div>
<div class="a-row"><label for="vl">Voice language</label><select id="vl"><option value="en-GB">English</option><option value="sn-ZW">Shona (if available)</option><option value="nd-ZW">Ndebele (if available)</option></select></div>
<div class="a-row"><label for="vr">Speed</label><input type="range" id="vr" min=".6" max="1.6" step=".1" value="1"></div>
<p class="small">Keys: Alt+M menu · Alt+A audio mode · Alt+R read page · Alt+S stop · Esc closes. Voice: say “go to first aid”, “read page”, “stop”, “high contrast” or “bigger text”.</p>`;
document.body.append(fab,pn);
const ruler=document.createElement('div');ruler.id='ruler';document.body.append(ruler);
addEventListener('mousemove',e=>{if(S.ruler)ruler.style.top=(e.clientY-23)+'px'});
addEventListener('touchmove',e=>{if(S.ruler)ruler.style.top=(e.touches[0].clientY-23)+'px'},{passive:true});
function apply(){opts.forEach(([k])=>{document.body.classList.toggle('a-'+k,!!S[k]);const b=$(`[data-o=${k}]`,pn);b&&b.setAttribute('aria-pressed',!!S[k])});ruler.style.display=S.ruler?'block':'none';document.documentElement.style.fontSize=(S.size||100)+'%';$('#vl',pn).value=voiceLang;$('#vr',pn).value=S.rate||1}
const toggleMenu=()=>{pn.hidden=!pn.hidden;fab.setAttribute('aria-expanded',!pn.hidden);if(!pn.hidden)$('button',pn).focus()};
fab.onclick=toggleMenu;
function toggleAudio(){S.audio=!S.audio;save();apply();const m=S.audio?'Audio mode on. Items will be read aloud as you move focus or tap. Press Alt R to read the page, Alt S to stop.':'Audio mode off.';S.audio?say(m):(stop())}
function readPage(){const m=$('#main');say($$('h1,h2,h3,p,li',m).filter(e=>e.offsetParent&&!e.closest('.reveal:not(.in)')).map(e=>e.textContent).join('. '))}
pn.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.o){if(b.dataset.o==='audio')return toggleAudio();S[b.dataset.o]=!S[b.dataset.o];save();apply()}
 const a=b.dataset.a;if(a==='big')S.size=Math.min((S.size||100)+10,160);if(a==='small')S.size=Math.max((S.size||100)-10,80);
 if(a==='reset'){Object.keys(S).forEach(k=>delete S[k]);stop()}
 if(a==='readpage')readPage();if(a==='stop')stop();if(a==='voice')listen();
 if(['big','small','reset'].includes(a)){save();apply()}});
$('#vl',pn).onchange=e=>{voiceLang=S.lang=e.target.value;save();say('Voice changed')};
$('#vr',pn).oninput=e=>{S.rate=+e.target.value;save()};
// auto-read on focus/hover/tap when audio mode on
const label=el=>el.getAttribute('aria-label')||el.alt||el.textContent;
document.addEventListener('focusin',e=>{if(S.audio&&!pn.contains(e.target))say(label(e.target))});
document.addEventListener('click',e=>{if(!S.audio||pn.contains(e.target))return;const t=e.target.closest('h1,h2,h3,p,li,a,button,img');if(t)say(label(t))});
$$('[data-read]').forEach(b=>b.addEventListener('click',()=>say($(b.dataset.read).textContent.replace('Read this aloud','')))); 
addEventListener('keydown',e=>{if(e.key==='Escape'){pn.hidden=true;stop()}
 if(!e.altKey)return;const k=e.key.toLowerCase();if(k==='m')toggleMenu();if(k==='a')toggleAudio();if(k==='r')readPage();if(k==='s')stop()});
// ---- voice commands
let rec;function listen(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return say('Voice commands are not supported in this browser. Try Chrome.');
 rec=new SR();rec.lang=voiceLang==='en-GB'?'en-GB':'en-ZW';rec.onresult=e=>cmd(e.results[0][0].transcript.toLowerCase());rec.onerror=()=>{};rec.start();say('Listening')}
function cmd(t){const go={'first aid':'#firstaid','myth':'#myths','types':'#types','seizure types':'#types','triggers':'#learn','learn':'#learn','contact':'#contact','donate':'#donate','meeting':'#meet','video':'#meet','map':'#contact','services':'#services','news':'#news'};
 const k=Object.keys(go).find(x=>t.includes(x));
 if(t.includes('read'))readPage();else if(t.includes('stop'))stop();else if(t.includes('contrast')){S.contrast=!S.contrast;save();apply()}else if(t.includes('bigger')||t.includes('larger')){S.size=Math.min((S.size||100)+10,160);save();apply()}else if(k){location.hash=go[k];say('Going to '+k)}else say('Sorry, I heard '+t)}
// ---- seizure demos
const D={tc:['Tonic-clonic seizure','The person loses awareness, the body stiffens then jerks for 1 to 3 minutes. Stay with them, time it, cushion the head, clear hard objects, never restrain or put anything in the mouth. When shaking stops, turn them on their side. Call an ambulance after 5 minutes.'],
ab:['Absence seizure','A sudden blank stare for a few seconds. The person does not respond and then carries on. Stay calm, gently guide them away from danger and repeat what they missed.'],
fa:['Focal seizure','Starts in one part of the brain. The person may twitch on one side, feel strange smells or fear, or seem confused. Stay with them, guide them from danger, do not restrain. It may spread to a convulsive seizure.'],
my:['Myoclonic seizure','Quick, shock-like jerks. The person usually stays aware. Help them sit safely, and reassure them. Report frequent jerks to their clinic.'],
at:['Atonic seizure','Muscles suddenly go limp and the person drops. Check for injury, stay with them, and help them up slowly once alert. Call for help if hurt.'],
to:['Tonic seizure','Muscles suddenly become stiff, often in sleep or causing a fall. Protect the head, stay with them and time it.']};
const demoStatus=$('#demoStatus');let demoDatasetOnline=false;
async function loadDemoDataset(){
 try{
  const response=await fetch('api/demos.php',{headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('Demo dataset request failed: '+response.status);
  const records=await response.json();
  if(!Array.isArray(records)||!records.length)throw new Error('The demo dataset is empty.');
  const loaded=new Set();
  records.forEach(record=>{
   if(!D[record.slug]||typeof record.title!=='string'||typeof record.description!=='string'||typeof record.firstAid!=='string')return;
   D[record.slug][0]=record.title;
   D[record.slug][1]=record.description+' First aid: '+record.firstAid;
   loaded.add(record.slug);
  });
  if(loaded.size!==Object.keys(D).length)throw new Error('The demo dataset is incomplete.');
  demoDatasetOnline=true;
  demoStatus.textContent='Seizure-aid guidance loaded.';
 }catch(error){
  demoStatus.textContent='Built-in seizure-aid guidance is ready.';
 }
}
loadDemoDataset();
async function recordDemoView(k){
 if(!demoDatasetOnline)return;
 try{
  const response=await fetch('api/demos.php',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({slug:k})});
  if(!response.ok)throw new Error('Demo view could not be saved: '+response.status);
  const result=await response.json();
  if(!result.ok||!Number.isSafeInteger(result.views))throw new Error('The demo view response was invalid.');
  demoStatus.textContent=D[k][0]+': '+result.views+' views.';
 }catch(error){
  demoStatus.textContent='Could not save this demonstration view. The video remains available.';
 }
}
const demoVideos={ab:'seizure-videos/2_absence_seizure.mp4',fa:'seizure-videos/3_focal_seizure.mp4',my:'seizure-videos/4_myoclonic_seizure.mp4',at:'seizure-videos/5_atonic_seizure.mp4',to:'seizure-videos/6_tonic_seizure.mp4'};
const stage=$('#stage'),videoFallback=$('#demoVideoFallback');
stage.addEventListener('error',()=>{videoFallback.textContent='This video could not be played. Try another seizure type or check your connection.';videoFallback.hidden=false});
function demo(k,shouldScroll=true){
 $('#demoTitle').textContent=D[k][0];$('#demoText').textContent=D[k][1];
 $$('#demoTabs button').forEach(b=>b.classList.toggle('on',b.dataset.demo===k));
 $('#demoRead').onclick=()=>say(D[k][0]+'. '+D[k][1]);
 const source=demoVideos[k];
 if(source){
  stage.hidden=false;
  videoFallback.hidden=true;videoFallback.textContent='';
  if(stage.getAttribute('src')!==source){stage.src=source;stage.load()}
  stage.play().catch(()=>{videoFallback.textContent='Autoplay was blocked. Press play to start the video.';videoFallback.hidden=false});
 }else{
  stage.pause();stage.hidden=true;stage.removeAttribute('src');stage.load();
  videoFallback.textContent='A matching tonic-clonic video illustration is not available yet. Use the first-aid guidance above.';
  videoFallback.hidden=false;
 }
 if(S.audio)say(D[k][0]+'. '+D[k][1]);
 if(shouldScroll)stage.scrollIntoView({block:'nearest'});
}
$$('[data-demo]').forEach(b=>b.onclick=()=>{demo(b.dataset.demo);recordDemoView(b.dataset.demo)});
demo('ab',false);
// ---- learn tabs
const lt=$$('#ltabs button'),lp=$$('.lpanel');lt.forEach(b=>b.onclick=()=>{lt.forEach(x=>x.classList.toggle('on',x===b));lp.forEach((p,i)=>p.classList.toggle('on',i==b.dataset.l));if(S.audio)say(lp[b.dataset.l].textContent)});
// ---- diary
const dk='zest-diary';let diary=[];try{diary=JSON.parse(localStorage.getItem(dk)||'[]')}catch(e){}
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const draw=()=>{$('#diaryList').innerHTML=diary.slice(-8).reverse().map(d=>`<li>${esc(d.d)} · ${esc(d.t)}${d.r?' · '+esc(d.r):''}</li>`).join('')};draw();$('#dDate').valueAsDate=new Date();
$('#diaryForm').onsubmit=e=>{e.preventDefault();diary.push({d:$('#dDate').value,t:$('#dType').value,r:$('#dTrig').value});try{localStorage.setItem(dk,JSON.stringify(diary))}catch(x){}$('#dTrig').value='';draw();announce('Diary entry saved')};
$('#diaryDl').onclick=()=>{const c='Date,Type,Trigger\n'+diary.map(d=>[d.d,d.t,d.r].map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:'text/csv'}));a.download='seizure-diary.csv';a.click()};
// ---- medicine reminder
let medT;$('#medSet').onclick=async()=>{const t=$('#medTime').value;if(!t)return $('#medMsg').textContent='Pick a time first.';if('Notification' in window)await Notification.requestPermission();clearInterval(medT);
 medT=setInterval(()=>{const n=new Date(),h=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');if(h===t&&n.getSeconds()<2){const m='Time to take your epilepsy medicine.';say(m);if(Notification.permission==='granted')new Notification('ZEST reminder',{body:m})}},1000);$('#medMsg').textContent='Reminder set for '+t+' daily while this page is open.'};
// ---- Meet
$('#meetJoin').onclick=()=>{const c=$('#meetCode').value.trim().toLowerCase();if(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(c))open('https://meet.google.com/'+c,'_blank','noopener');else announce('Enter a code like abc-defg-hij')};
$('#calLink').href='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent('ZEST support session')+'&details='+encodeURIComponent('Add a Google Meet link from the Calendar event.')+'&location='+encodeURIComponent('Google Meet');
$('#jitsiBtn').onclick=function(){const j=$('#jitsi');j.hidden=false;this.hidden=true;j.innerHTML='<iframe title="ZEST video room" allow="camera;microphone;fullscreen;display-capture" style="width:100%;height:100%;border:0" src="https://meet.jit.si/ZEST-Zimbabwe-Epilepsy-Support-Room"></iframe>'};
// ---- SOS
const sos=document.createElement('a');sos.id='sosBtn';sos.href='tel:+263784582491';sos.textContent='🆘 Help line';sos.setAttribute('aria-label','Call ZEST help line');document.body.append(sos);
// ---- init
apply();
if(!S.seen){S.seen=1;save();const w=document.createElement('div');w.className='calm';w.style.cssText='position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:10000;max-width:92vw';w.setAttribute('role','alert');w.innerHTML='Blind or low vision? Press <b>Alt+A</b> for audio mode, or <b>Alt+M</b> for accessibility tools. <button class="btn btn-gold" style="padding:4px 12px">OK</button>';w.querySelector('button').onclick=()=>w.remove();document.body.append(w);setTimeout(()=>w.remove(),15000)}
})();
