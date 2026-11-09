(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Theme
  const root = document.documentElement;
  try { const t = localStorage.getItem('zest-theme'); if (t) root.dataset.theme = t; } catch (e) {}
  $('#themeBtn').onclick = () => {
    const n = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = n;
    try { localStorage.setItem('zest-theme', n); } catch (e) {}
  };

  // Mobile nav
  const burger = $('#burger'), nav = $('#mainNav');
  burger.onclick = () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  // Counters
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count || 0, suf = el.dataset.suffix || '', pre = el.dataset.prefix || '', t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / 1600, 1); el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString() + (p === 1 && end ? suf : ''); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  // EEG hero canvas
  const cv = $('#eeg'), cx = cv.getContext('2d'); let W, H, off = 0;
  const size = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  size(); addEventListener('resize', size);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw() {
    cx.clearRect(0, 0, W, H); cx.lineWidth = 2;
    [[.3, '#ffb400', 1], [.55, '#ffffff', .6], [.8, '#7b4dff', .8]].forEach(([y, c, a], i) => {
      cx.beginPath(); cx.strokeStyle = c; cx.globalAlpha = a * .6;
      for (let x = 0; x <= W; x += 3) {
        const k = (x + off * (1 + i * .4)) / 60;
        const burst = Math.max(0, Math.sin((x + off * .5) / 420 + i)) ** 6;
        const v = Math.sin(k) * 8 + Math.sin(k * 2.7) * 5 + burst * Math.sin(k * 6) * 50;
        x ? cx.lineTo(x, H * y + v) : cx.moveTo(x, H * y + v);
      }
      cx.stroke();
    });
    off += 2; if (!reduce) requestAnimationFrame(draw);
  }
  draw();

  // Search (jump to matching section)
  const idx = { 'first aid': '#firstaid', seizure: '#firstaid', help: '#firstaid', myth: '#myths', fact: '#myths', witchcraft: '#myths',
    treatment: '#resources', resource: '#resources', infographic: '#resources', shona: '#resources', learn: '#resources', children: '#services', child: '#services', kids: '#services', norton: '#contact', address: '#contact', support: '#services', counselling: '#services', school: '#services', work: '#services', donate: '#donate', volunteer: '#involved',
    news: '#news', campaign: '#campaigns', poster: '#campaigns', gallery: '#gallery', photo: '#gallery', training: '#services', 'sign language': '#services', job: '#involved', employ: '#involved', hire: '#involved', ecocash: '#donate', mental: '#news', contact: '#contact', about: '#about', epilepsy: '#about', story: '#stories', stories: '#stories' };
  $('#searchForm').onsubmit = e => {
    e.preventDefault();
    const q = $('#searchInput').value.trim().toLowerCase(), m = $('#searchMsg');
    if (!q) { m.textContent = 'Type a topic to search.'; return; }
    const k = Object.keys(idx).find(k => q.includes(k) || k.includes(q));
    if (k) { m.textContent = ''; location.hash = idx[k]; } else m.textContent = 'No match yet — try "first aid", "support" or "donate", or contact us.';
  };

  // First-aid tabs
  const tabs = $$('.aid-tabs button'), panels = $$('.aid-panel');
  tabs.forEach(b => b.onclick = () => { tabs.forEach(x => x.classList.toggle('on', x === b)); panels.forEach((p, i) => p.classList.toggle('on', i == b.dataset.t)); });

  // Seizure timer
  let ti = null, t0 = 0;
  const tn = $('#tnum'), tm = $('#tmsg'), ts = $('#tstart');
  const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  ts.onclick = () => {
    if (ti) { clearInterval(ti); ti = null; ts.textContent = 'Resume'; return; }
    t0 = Date.now() - (parseTime() * 1000); ts.textContent = 'Pause';
    ti = setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000); tn.textContent = fmt(s);
      if (s >= 300) { tm.textContent = '⚠ 5 minutes passed – CALL AN AMBULANCE NOW.'; tm.className = 'tmsg warn'; }
      else if (s >= 120) tm.textContent = 'Keep them safe and keep timing.';
    }, 250);
  };
  const parseTime = () => { const [m, s] = tn.textContent.split(':').map(Number); return m * 60 + s; };
  $('#treset').onclick = () => { clearInterval(ti); ti = null; tn.textContent = '00:00'; tm.textContent = ''; tm.className = 'tmsg'; ts.textContent = 'Start seizure timer'; };

  // Flip cards
  $$('.flip').forEach(f => f.onclick = () => f.classList.toggle('on'));

  // Slider
  const slides = $$('.slide'), dots = $('#dots'); let si = 0, st;
  slides.forEach((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Story ' + (i + 1)); b.onclick = () => { go(i); }; dots.append(b); });
  function go(i) { si = i; slides.forEach((s, j) => s.classList.toggle('on', j === i)); $$('button', dots).forEach((d, j) => d.classList.toggle('on', j === i)); clearInterval(st); st = setInterval(() => go((si + 1) % slides.length), 7000); }
  go(0);

  // Donate
  let amt = 10; const give = $('#giveBtn'), cust = $('#custom');
  $$('#amounts button').forEach(b => b.onclick = () => { $$('#amounts button').forEach(x => x.classList.toggle('on', x === b)); amt = +b.dataset.a; cust.value = ''; give.textContent = 'Pledge $' + amt; });
  cust.oninput = () => {
    if (+cust.value > 0) { amt = +cust.value; $$('#amounts button').forEach(x => x.classList.remove('on')); }
    else if (!cust.value) amt = +($('#amounts button.on')?.dataset.a || 10);
    give.textContent = 'Pledge $' + amt;
  };
  const addActionLink = (container, text, href, label) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    link.className = 'btn btn-primary';
    link.style.margin = '8px 8px 0 0';
    container.append(document.createTextNode(text), link);
  };

  give.onclick = async () => {
    const message = $('#giveMsg');
    const actions = $('#donateActions');
    const customAmount = cust.value.trim() ? Number(cust.value) : amt;
    actions.replaceChildren();
    actions.hidden = true;
    if (!Number.isFinite(customAmount) || customAmount < 1 || customAmount > 100000) {
      message.textContent = 'Enter a donation amount between $1 and $100,000.';
      return;
    }

    amt = Math.round(customAmount * 100) / 100;
    const name = $('#dName').value.trim();
    const phone = $('#dPhone').value.trim();
    const text = `Hello ZEST, I would like to donate $${amt}.${name ? ` My name is ${name}.` : ''}${phone ? ` My phone number is ${phone}.` : ''} I will complete the donation via EcoCash.`;
    give.disabled = true;
    message.textContent = 'Saving your pledge…';
    try {
      const response = await fetch('api/donate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ amount: amt, name, phone })
      });
      if (!response.ok) throw new Error('Could not save this pledge.');
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || 'Could not save this pledge.');
      message.textContent = `Your pledge has been saved. Complete your donation via EcoCash *153*2*2*056028#.`;
    } catch (error) {
      message.textContent = `To donate $${amt}, use EcoCash *153*2*2*056028#.`;
    } finally {
      give.disabled = false;
    }
    actions.hidden = false;
    addActionLink(actions, '', `https://wa.me/263784582491?text=${encodeURIComponent(text)}`, 'Notify ZEST on WhatsApp');
  };

  // Pre-select enquiry type from "Volunteer / Hire / Book training" links
  $$('[data-enquiry]').forEach(a => a.addEventListener('click', () => { const sel = $('#enquiryType'); if (sel) sel.value = a.dataset.enquiry; }));

  const formActions = (container, email, whatsapp) => {
    container.replaceChildren();
    addActionLink(container, '', `mailto:zimbabweepilepsysurvivorstrust@gmail.com?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`, 'Send by email');
    addActionLink(container, '', `https://wa.me/263784582491?text=${encodeURIComponent(whatsapp)}`, 'Send with WhatsApp');
    container.hidden = false;
  };

  $('#contactForm').onsubmit = async e => {
    e.preventDefault(); const f = e.currentTarget; let ok = true;
    ['name', 'email', 'msg'].forEach(n => { const el = f[n]; const bad = !el.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(el.value)); el.classList.toggle('err', bad); if (bad) ok = false; });
    const m = $('#formMsg');
    const actions = $('#contactActions');
    m.textContent = '';
    actions.replaceChildren();
    actions.hidden = true;
    m.className = '';
    if (!ok) { m.textContent = 'Please complete all fields with a valid email.'; return; }
    if (f.elements.website.value.trim()) return;
    const name = f.elements.name.value.trim();
    const email = f.elements.email.value.trim();
    const phone = f.elements.phone.value.trim();
    const type = f.elements.type.selectedOptions[0].text;
    const message = f.elements.msg.value.trim();
    const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nContacting as: ${type}\n\n${message}`;
    const subject = `ZEST website enquiry: ${type}`;
    const whatsapp = `Hello ZEST, I'm ${name} (${email})${phone ? `, phone ${phone}` : ''}. I'm contacting as: ${type}.\n\n${message}`;
    const submit = f.querySelector('[type=submit]');
    submit.disabled = true;
    m.textContent = 'Sending…';
    try {
      const response = await fetch('api/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, phone, type: f.elements.type.value, msg: message, website: '' })
      });
      if (!response.ok) throw new Error('Contact form could not be saved.');
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || 'Contact form could not be saved.');
      m.textContent = 'Your message has been recorded. Choose how to send it to ZEST:';
    } catch (error) {
      m.textContent = 'Choose how to send your message:';
    } finally {
      submit.disabled = false;
    }
    formActions(actions, { subject, body }, whatsapp);
  };

  const storyForm = $('#storyForm');
  const anonymousStory = storyForm.elements.anonymous;
  const storyName = storyForm.elements.display_name;
  const syncStoryName = () => {
    storyName.disabled = anonymousStory.checked;
    storyName.required = !anonymousStory.checked;
    storyName.closest('label').hidden = anonymousStory.checked;
  };
  anonymousStory.addEventListener('change', syncStoryName);
  syncStoryName();
  storyForm.elements.photo.addEventListener('change', () => {
    const file = storyForm.elements.photo.files[0];
    if (file && file.size > 3 * 1024 * 1024) {
      storyForm.elements.photo.value = '';
      $('#storyMsg').textContent = 'Choose an image smaller than 3 MB.';
    }
  });
  storyForm.onsubmit = async e => {
    e.preventDefault();
    const status = $('#storyMsg');
    const actions = $('#storyActions');
    const submit = storyForm.querySelector('[type=submit]');
    status.textContent = '';
    actions.replaceChildren();
    actions.hidden = true;
    const story = storyForm.elements.story.value.trim();
    const photo = storyForm.elements.photo.files[0];
    if (!story) { status.textContent = 'Please add your story.'; return; }
    if (!storyForm.elements.consent.checked) { status.textContent = 'Please confirm you have permission to share your story.'; return; }
    if (photo && photo.size > 3 * 1024 * 1024) { status.textContent = 'Choose an image smaller than 3 MB.'; return; }
    if (storyForm.elements.website.value.trim()) return;
    const name = anonymousStory.checked ? '' : storyName.value.trim();
    const identity = anonymousStory.checked ? 'Shared anonymously' : `Name to display: ${name}`;
    const body = `${identity}\n\n${story}${photo ? '\n\nI selected a photo to attach.' : ''}`;
    const subject = 'ZEST community story';
    const whatsapp = `Hello ZEST. ${identity}.\n\n${story}${photo ? '\n\nI selected a photo to attach.' : ''}`;
    submit.disabled = true;
    status.textContent = 'Sending your story for review…';
    try {
      const response = await fetch('api/story.php', { method: 'POST', body: new FormData(storyForm) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Your story could not be saved.');
      status.textContent = 'Thank you. Your story was sent for review before publication.';
      storyForm.reset();
      syncStoryName();
    } catch (error) {
      status.textContent = 'Choose how to share your story. Add your selected photo to the message after opening your email or WhatsApp.';
      formActions(actions, { subject, body }, whatsapp);
    } finally {
      submit.disabled = false;
    }
  };

  // Open trusted disability and epilepsy resources in the reading-room viewer.
  const readingFrame = $('#readingFrame');
  const readingStatus = $('#readingStatus');
  const openReading = $('#openReading');
  const defaultReadingUrl = new URL(readingFrame.src);
  $$('[data-reading]').forEach(button => button.addEventListener('click', () => {
    const url = new URL(button.dataset.reading);
    if (!['https:', 'http:'].includes(url.protocol)
      || (url.origin !== location.origin && url.protocol !== 'https:')) return;
    readingFrame.src = url.href;
    readingFrame.title = button.dataset.title;
    const isLocalDocument = url.origin === location.origin && url.pathname.toLowerCase().endsWith('.pdf');
    openReading.href = isLocalDocument ? defaultReadingUrl.href : url.href;
    openReading.hidden = isLocalDocument;
    openReading.textContent = isLocalDocument ? '' : 'Open official reading page';
    readingStatus.textContent = `Reading: ${button.dataset.title}. If the publisher blocks the viewer, open the official reading page.`;
  }));

  // Campaign poster filters (All / 2026 / 2025 / Other)
  const fb = $$('#campFilters button'), cps = $$('#campPosters .poster');
  fb.forEach(b => b.onclick = () => { fb.forEach(x => x.classList.toggle('on', x === b)); cps.forEach(p => { p.hidden = b.dataset.f !== 'all' && p.dataset.cat !== b.dataset.f; }); });

  // Lightbox for posters and gallery
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  const closeLb = () => { lb.hidden = true; lbImg.src = ''; };
  $$('[data-full]').forEach(b => b.onclick = () => { lbImg.src = b.dataset.full; lbImg.alt = $('img', b).alt; lbCap.textContent = b.dataset.cap || ''; lb.hidden = false; $('#lbClose').focus(); });
  $('#lbClose').onclick = closeLb; lb.onclick = e => { if (e.target === lb) closeLb(); };
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  // Back to top + year
  const tt = $('#totop'); addEventListener('scroll', () => tt.classList.toggle('show', scrollY > 600), { passive: true });
  tt.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  $('#yr').textContent = new Date().getFullYear();
})();
