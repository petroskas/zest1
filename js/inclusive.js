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
<p class="small">Keys: Alt+M menu · Alt+A audio mode · Alt+R read page · Alt+S stop · Alt+C chat · Esc closes. Voice: say “go to first aid”, “read page”, “stop”, “high contrast”, “bigger text”, “help”.</p>`;
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
document.addEventListener('click',e=>{if(!S.audio||pn.contains(e.target)||e.target.closest('#chat'))return;const t=e.target.closest('h1,h2,h3,p,li,a,button,img');if(t)say(label(t))});
$$('[data-read]').forEach(b=>b.addEventListener('click',()=>say($(b.dataset.read).textContent.replace('Read this aloud','')))); 
addEventListener('keydown',e=>{if(e.key==='Escape'){pn.hidden=true;stop();$('#chat').hidden=true}
 if(!e.altKey)return;const k=e.key.toLowerCase();if(k==='m')toggleMenu();if(k==='a')toggleAudio();if(k==='r')readPage();if(k==='s')stop();if(k==='c'){e.preventDefault();toggleChat()}});
// ---- voice commands
let rec;function listen(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return say('Voice commands are not supported in this browser. Try Chrome.');
 rec=new SR();rec.lang=voiceLang==='en-GB'?'en-GB':'en-ZW';rec.onresult=e=>cmd(e.results[0][0].transcript.toLowerCase());rec.onerror=()=>{};rec.start();say('Listening')}
function cmd(t){const go={'first aid':'#firstaid','myth':'#myths','types':'#types','seizure types':'#types','triggers':'#learn','learn':'#learn','contact':'#contact','donate':'#donate','meeting':'#meet','video':'#meet','map':'#contact','services':'#services','news':'#news'};
 const k=Object.keys(go).find(x=>t.includes(x));
 if(t.includes('read'))readPage();else if(t.includes('stop'))stop();else if(t.includes('contrast')){S.contrast=!S.contrast;save();apply()}else if(t.includes('bigger')||t.includes('larger')){S.size=Math.min((S.size||100)+10,160);save();apply()}else if(t.includes('help')||t.includes('chat')){toggleChat(true)}else if(k){location.hash=go[k];say('Going to '+k)}else say('Sorry, I heard '+t)}
// ---- seizure demos
const D={tc:['Tonic-clonic seizure','The person loses awareness, the body stiffens then jerks for 1 to 3 minutes. Stay with them, time it, cushion the head, clear hard objects, never restrain or put anything in the mouth. When shaking stops, turn them on their side. Call an ambulance after 5 minutes.'],
ab:['Absence seizure','A sudden blank stare for a few seconds. The person does not respond and then carries on. Stay calm, gently guide them away from danger and repeat what they missed.'],
fa:['Focal seizure','Starts in one part of the brain. The person may twitch on one side, feel strange smells or fear, or seem confused. Stay with them, guide them from danger, do not restrain. It may spread to a convulsive seizure.'],
my:['Myoclonic seizure','Quick, shock-like jerks. The person usually stays aware. Help them sit safely, and reassure them. Report frequent jerks to their clinic.'],
at:['Atonic seizure','Muscles suddenly go limp and the person drops. Check for injury, stay with them, and help them up slowly once alert. Call for help if hurt.'],
to:['Tonic seizure','Muscles suddenly become stiff, often in sleep or causing a fall. Protect the head, stay with them and time it.']};
function demo(k){const st=$('#stage');st.setAttribute('class','s-'+k);$('#demoTitle').textContent=D[k][0];$('#demoText').textContent=D[k][1];$$('#demoTabs button').forEach(b=>b.classList.toggle('on',b.dataset.demo===k));$('#demoRead').onclick=()=>say(D[k][0]+'. '+D[k][1]);if(S.audio)say(D[k][0]+'. '+D[k][1]);$('#stage').scrollIntoView({block:'nearest'})}
$$('[data-demo]').forEach(b=>b.onclick=()=>demo(b.dataset.demo));
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
// ---- Chatbot
const KB=[
['epilepsy neurological condition what is','Epilepsy is a neurological condition of the brain in which a person has repeated seizures. Seizures are sudden bursts of abnormal electrical activity. It is not contagious and not caused by witchcraft.'],
['first aid help seizing now what do i do','STAY with the person and time it. Keep them SAFE: clear hard objects and cushion the head. Do NOT restrain or put anything in the mouth. When shaking stops, turn them on their SIDE. Call an ambulance if it lasts over 5 minutes, repeats, they are hurt, or it is their first seizure.'],
['types kinds tonic clonic absence focal myoclonic atonic','Common types: tonic-clonic (stiffening and jerking), absence (brief blank stare), focal (one area, may be aware or confused), myoclonic (sudden jerks), atonic (sudden drop), tonic (stiffening). See the Seizure types section for demos.'],
['trigger triggers cause what causes','Triggers include missed medicine, lack of sleep, stress, illness or fever, alcohol, and for some people flashing lights. Causes include head injury, brain infections, stroke, tumours, genetics, and often no known cause.'],
['myth witchcraft curse contagious catch touch','Myth: epilepsy is witchcraft or contagious. Fact: it is a treatable brain condition and you cannot catch it. Helping safely is always right.'],
['spoon mouth tongue swallow','Never put anything in the mouth. A person cannot swallow their tongue. It can cause injury.'],
['school child teacher classroom','At school: stay, time it, protect the head, turn the child on their side after shaking, let them rest, and never send them home alone. Share a care plan with the school.'],
['work job employer employ','At work: keep people and machines away, do not restrain, allow rest, and make reasonable adjustments. Epilepsy is not a reason for dismissal.'],
['home cook fire bath shower','At home: cushion the head, avoid open fires and boiling water near the person, prefer showers to baths, and keep bathroom doors unlocked.'],
['medicine medication tablets stop treatment','Take medicine at the same time daily and never stop suddenly. Talk to your clinic about side effects. Most people can control seizures with medicine.'],
['contact address phone whatsapp norton','ZEST: WhatsApp or call +263 784 582 491, email zimbabweepilepsysurvivorstrust@gmail.com, 11903 First Street, Norton. Use the Contact section or the map in the footer.'],
['donate ecocash give','Dial *153*2*2*056028# on EcoCash or use the Donate section to record a pledge.'],
['meeting video google meet online','Open the Video support section to host a Google Meet or join with a code, or start the in-page video room.'],
['pregnant pregnancy women','Women with epilepsy can have healthy pregnancies. See a doctor before planning pregnancy because some medicines need changing. Do not stop medicine on your own.'],
['driving drive','Driving rules vary. Most places require a seizure-free period and medical clearance. Ask your doctor.']];
const stopw=new Set('a an the is are of to in on for and or my me i you it what how do does can with about tell please'.split(' '));
const tok=s=>s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w&&!stopw.has(w));
function kbAnswer(q){const w=tok(q);let best=0,ans=null;KB.forEach(([k,a])=>{const kw=new Set(tok(k));const sc=w.reduce((n,x)=>n+(kw.has(x)?1:0),0);if(sc>best){best=sc;ans=a}});return best?ans:null}
async function wiki(q){try{const s=await fetch('https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&limit=1&search='+encodeURIComponent(q+' epilepsy'));const j=await s.json();if(!j[1][0])return null;const r=await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(j[1][0]));const d=await r.json();return d.extract?d.extract.slice(0,600)+' (Source: Wikipedia)':null}catch(e){return null}}
const chat=document.createElement('div');chat.id='chat';chat.hidden=true;chat.setAttribute('role','dialog');chat.setAttribute('aria-label','ZEST assistant');
chat.innerHTML='<header><span>ZEST Epilepsy Assistant</span><button id="chatX" aria-label="Close chat" style="background:none;border:0;color:#fff;font-size:1.3rem">×</button></header><div id="chatLog" aria-live="polite"></div><form><button type="button" id="chatMic" aria-label="Speak your question">🎤</button><input id="chatIn" placeholder="Ask about epilepsy…" aria-label="Your question" maxlength="200"><button>Send</button></form>';
const cf=document.createElement('button');cf.id='chatFab';cf.setAttribute('aria-label','Open ZEST assistant (Alt+C)');cf.textContent='💬';document.body.append(chat,cf);
const log=$('#chatLog');const add=(t,c)=>{const d=document.createElement('div');d.className='m '+c;d.textContent=t;log.append(d);log.scrollTop=log.scrollHeight;if(c==='b'&&S.audio)say(t)};
function toggleChat(o){chat.hidden=o===true?false:!chat.hidden;if(!chat.hidden){$('#chatIn').focus();if(!log.children.length)add('Hello! I am the ZEST assistant. Ask me about seizures, first aid, triggers, school or work. I give general information only, not medical advice. In an emergency call your local ambulance.','b')}}
cf.onclick=()=>toggleChat();$('#chatX').onclick=()=>chat.hidden=true;
$('#chat form').onsubmit=async e=>{e.preventDefault();const q=$('#chatIn').value.trim();if(!q)return;$('#chatIn').value='';add(q,'u');
 let a=kbAnswer(q);if(!a){add('Searching trusted sources…','b');a=await wiki(q)}
 add(a||'I am not sure. Please contact ZEST on WhatsApp +263 784 582 491 or ask a health professional.','b')};
$('#chatMic').onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return add('Voice input is not supported in this browser.','b');const r=new SR();r.lang='en-GB';r.onresult=e=>{$('#chatIn').value=e.results[0][0].transcript;$('#chat form').requestSubmit()};r.start()};
// ---- init
apply();
if(!S.seen){S.seen=1;save();const w=document.createElement('div');w.className='calm';w.style.cssText='position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:10000;max-width:92vw';w.setAttribute('role','alert');w.innerHTML='Blind or low vision? Press <b>Alt+A</b> for audio mode, or <b>Alt+M</b> for accessibility tools. <button class="btn btn-gold" style="padding:4px 12px">OK</button>';w.querySelector('button').onclick=()=>w.remove();document.body.append(w);setTimeout(()=>w.remove(),15000)}
})();
