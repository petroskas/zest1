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
  cust.oninput = () => { if (+cust.value > 0) { amt = +cust.value; $$('#amounts button').forEach(x => x.classList.remove('on')); give.textContent = 'Pledge $' + amt; } };
  // Helper: POST JSON to the PHP/MySQL API
  const send = async (url, data) => {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (!r.ok || !j.ok) throw new Error(j.error || 'Server error');
    return j;
  };
  const offline = location.protocol === 'file:';

  give.onclick = async () => {
    const m = $('#giveMsg'); give.disabled = true;
    try {
      if (offline) throw new Error('offline');
      await send('api/donate.php', { amount: amt, name: $('#dName').value, phone: $('#dPhone').value });
      m.textContent = `Thank you! Your $${amt} pledge is recorded. Complete it via EcoCash *153*2*2*056028# and we'll confirm.`;
    } catch (err) {
      m.textContent = offline ? 'Open the site through XAMPP (http://localhost/zest/) so pledges can be saved. To give now, dial *153*2*2*056028#.' : 'Sorry, we could not save your pledge. Please try again or dial *153*2*2*056028#.';
    }
    give.disabled = false;
  };

  // Pre-select enquiry type from "Volunteer / Hire / Book training" links
  $$('[data-enquiry]').forEach(a => a.addEventListener('click', () => { const sel = $('#enquiryType'); if (sel) sel.value = a.dataset.enquiry; }));

  // Contact form: validate, then save to MySQL through api/contact.php
  $('#contactForm').onsubmit = async e => {
    e.preventDefault(); const f = e.target; let ok = true;
    ['name', 'email', 'msg'].forEach(n => { const el = f[n]; const bad = !el.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(el.value)); el.classList.toggle('err', bad); if (bad) ok = false; });
    const m = $('#formMsg'), btn = f.querySelector('button[type=submit]');
    m.className = ''; m.style.color = ok ? 'var(--green)' : 'var(--red)';
    if (!ok) { m.textContent = 'Please complete all fields with a valid email.'; return; }
    btn.disabled = true; m.textContent = 'Sending…';
    try {
      if (offline) throw new Error('offline');
      await send('api/contact.php', { name: f.name.value, email: f.email.value, phone: f.phone.value, type: f.type.value, msg: f.msg.value, website: f.website.value });
      m.textContent = 'Thank you – your message has been received. We will reply soon.'; f.reset();
    } catch (err) {
      m.style.color = 'var(--red)';
      m.textContent = offline ? 'Open the site through XAMPP (http://localhost/zest/) so messages can be saved. Or WhatsApp +263 784 582 491.' : 'Sorry, we could not send your message. Please try again or WhatsApp +263 784 582 491.';
    }
    btn.disabled = false;
  };

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
