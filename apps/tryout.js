/* Try Out TKA ICG — simulasi format TKA SMA 2026 per hari ujian.
   Bank soal dimuat dari ../data/*.js sesuai kebutuhan. Progres di localStorage: tka-tryout-v1. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var LET = 'ABCDE';
  var KEY = 'tka-tryout-v1', PREF = 'tka-icg-pref', SEEN = 'tka-tryout-seen';
  function ld(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function sv(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  var SUBJ = {
    bindo: { name: 'Bahasa Indonesia', short: 'B. Indonesia', file: 'bindo', n: 30, min: 75, icon: '📖', wajib: true },
    bing: { name: 'Bahasa Inggris', short: 'B. Inggris', file: 'bing', n: 30, min: 75, icon: '🌏', wajib: true },
    matwajib: { name: 'Matematika', short: 'Matematika', file: 'bank-matwajib', n: 25, min: 75, icon: '📐', wajib: true },
    matlanjut: { name: 'Matematika Tingkat Lanjut', short: 'Mat Lanjut', file: 'bank-matlanjut', n: 25, min: 60, icon: '∫' },
    fisika: { name: 'Fisika', short: 'Fisika', file: 'bank-fisika', n: 25, min: 60, icon: '⚛️' },
    kimia: { name: 'Kimia', short: 'Kimia', file: 'bank-kimia', n: 25, min: 60, icon: '⚗️' },
    biologi: { name: 'Biologi', short: 'Biologi', file: 'bank-biologi', n: 25, min: 60, icon: '🧬' },
    ekonomi: { name: 'Ekonomi', short: 'Ekonomi', file: 'bank-ekonomi', n: 25, min: 60, icon: '💹' },
    mix: { name: 'Buku Kesalahan', short: 'Campuran', file: null, n: 0, min: 0, icon: '📕', virtual: true }
  };
  var REAL = Object.keys(SUBJ).filter(function (k) { return !SUBJ[k].virtual; });
  var MK = 'tka-icg-mistakes';
  function mkLoad() { var m = ld(MK, {}); if (!m.items) m.items = {}; return m; }
  function mkOpen(m) { return Object.keys(m.items).filter(function (id) { return !m.items[id].ok && SUBJ[id.split(':')[0]]; }); }
  function mkRecord(s) {
    var m = mkLoad(), now = Date.now();
    s.items.forEach(function (id) {
      var right = isRight(ITEM[id], s.ans[id]), flagged = !!s.flag[id], e = m.items[id];
      if (!right || flagged) {
        e = m.items[id] = e || { n: 0 };
        if (!right) e.n++; else e.r = 1;
        e.ok = 0; e.t = now; e.src = 'tryout';
      } else if (e) { e.ok = (e.ok || 0) + 1; e.t2 = now; }
    });
    sv(MK, m);
  }
  var PILIHAN = ['matlanjut', 'fisika', 'kimia', 'biologi', 'ekonomi'];
  var DATES = { 1: ['Senin, 26 Oktober', 'Selasa, 27 Oktober', 'Rabu, 28 Oktober', 'Kamis, 29 Oktober'],
                2: ['Senin, 2 November', 'Selasa, 3 November', 'Rabu, 4 November', 'Kamis, 5 November'] };
  var MATW_QUOTA = { 'Bilangan': 4, 'Aljabar': 6, 'Geometri & Pengukuran': 6, 'Trigonometri': 3, 'Data & Peluang': 6 };

  var ST = ld(KEY, { active: null, history: [] });
  var BANK = {}, ITEM = {}, STIMS = {}, UNF = {}, tick = null, view = 'home';

  function pref() { var p = ld(PREF, {}); if (!p.gel) p.gel = 1; if (!Array.isArray(p.pilihan)) p.pilihan = []; return p; }
  function save() { sv(KEY, ST); }

  /* ---------- muat bank ---------- */
  function load(sid) {
    if (BANK[sid]) return Promise.resolve(BANK[sid]);
    var f = SUBJ[sid].file;
    return new Promise(function (res, rej) {
      var have = window.TKA_DATA && window.TKA_DATA[f];
      if (have) return res(have);
      var s = document.createElement('script');
      s.src = '../data/' + f + '.js';
      s.onload = function () { res(window.TKA_DATA[f]); };
      s.onerror = function () { rej(new Error('Bank soal ' + SUBJ[sid].name + ' gagal dimuat.')); };
      document.head.appendChild(s);
    }).then(function (d) { return prep(sid, d); });
  }
  function prep(sid, d) {
    var items = d.items.map(function (x) {
      var it = { id: sid + ':' + x.id, subj: sid, kind: x.kind, stem: x.stem, options: x.options, key: x.key, why: x.why || '',
        topic: x.comp || x.topic || 'Umum', stim: x.stim ? sid + ':' + x.stim : null, visual: x.visual, labels: x.labels, title: x.title };
      if (it.kind === 'bs') {
        if (!it.labels) it.labels = ['Benar', 'Salah'];
        it.key = it.key.map(function (v) { return v === true ? 0 : v === false ? 1 : v; });
      }
      ITEM[it.id] = it;
      return it;
    });
    (d.stimuli || []).forEach(function (s) { STIMS[sid + ':' + s.id] = s; });
    BANK[sid] = { items: items };
    return BANK[sid];
  }

  /* ---------- susun paket ---------- */
  function seenSet(sid) { var s = ld(SEEN, {}); return new Set(s[sid] || []); }
  function markSeen(sid, ids) { var s = ld(SEEN, {}); var a = (s[sid] || []).concat(ids); s[sid] = a.slice(-1500); sv(SEEN, s); }
  function prefUnseen(list, seen, idf) { var a = shuffle(list.slice()); return a.filter(function (x) { return !seen.has(idf(x)); }).concat(a.filter(function (x) { return seen.has(idf(x)); })); }

  function pick(sid, n) {
    var items = BANK[sid].items, seen = seenSet(sid);
    if (sid === 'bindo' || sid === 'bing') return pickGrouped(items, n, seen);
    if (sid === 'matwajib') return pickQuota(items, n, seen, MATW_QUOTA);
    var q = {}; items.forEach(function (it) { q[it.topic] = (q[it.topic] || 0) + 1; });
    return pickQuota(items, n, seen, q);
  }
  function pickGrouped(items, n, seen) {
    var groups = {}, singles = [];
    items.forEach(function (it) { if (it.stim) (groups[it.stim] = groups[it.stim] || []).push(it); else singles.push(it); });
    var G = Object.keys(groups).map(function (k) { return groups[k]; });
    var best = null;
    for (var t = 0; t < 500; t++) {
      var order = t < 200 ? prefUnseen(G, seen, function (g) { return g[0].id; }) : shuffle(G.slice()), out = [], used = 0;
      order.forEach(function (g) { if (used + g.length <= n) { out.push(g); used += g.length; } });
      var sg = t < 200 ? prefUnseen(singles, seen, function (x) { return x.id; }) : shuffle(singles.slice()), fill = sg.slice(0, n - used);
      var total = used + fill.length;
      if (!best || total > best.total) best = { total: total, out: out, fill: fill };
      if (total === n) break;
    }
    if (best.total < n) {
      var inUse = new Set(best.out.map(function (g) { return g; }));
      var spare = G.filter(function (g) { return !inUse.has(g); }).sort(function (a, b) { return b.length - a.length; })[0];
      if (spare) best.out.push(spare.slice(0, n - best.total));
    }
    var res = [];
    shuffle(best.out).forEach(function (g) { res = res.concat(g); });
    var pos = Math.floor(Math.random() * 2);
    best.fill.forEach(function (x) { res.splice(Math.min(res.length, pos), 0, x); pos += 1; });
    return res.slice(0, n);
  }
  function pickQuota(items, n, seen, weights) {
    var topics = Object.keys(weights), W = topics.reduce(function (a, k) { return a + weights[k]; }, 0);
    var by = {}; items.forEach(function (it) { (by[it.topic] = by[it.topic] || []).push(it); });
    var quota = {}, got = 0;
    topics.forEach(function (k) { quota[k] = Math.floor(weights[k] / W * n); got += quota[k]; });
    var rest = topics.slice().sort(function (a, b) { return (weights[b] / W * n % 1) - (weights[a] / W * n % 1); });
    for (var i = 0; got < n && i < rest.length * 3; i++) { quota[rest[i % rest.length]]++; got++; }
    var res = [];
    topics.forEach(function (k) { var pool = prefUnseen(by[k] || [], seen, function (x) { return x.id; }); res = res.concat(pool.slice(0, quota[k])); });
    if (res.length < n) { var ids = new Set(res.map(function (x) { return x.id; })); res = res.concat(prefUnseen(items.filter(function (x) { return !ids.has(x.id); }), seen, function (x) { return x.id; }).slice(0, n - res.length)); }
    return res;
  }

  /* ---------- mulai ---------- */
  function subjOf(sessions) {
    var out = [];
    sessions.forEach(function (s) { (s.subj === 'mix' ? (s.ids || s.items).map(function (id) { return id.split(':')[0]; }) : [s.subj]).forEach(function (k) { if (out.indexOf(k) < 0 && SUBJ[k] && !SUBJ[k].virtual) out.push(k); }); });
    return out;
  }
  function startPlan(label, sessions) {
    var subjects = subjOf(sessions);
    Promise.all(subjects.map(load)).then(function () {
      ST.active = { label: label, idx: 0, sessions: sessions.map(function (s) {
        var its = s.ids ? s.ids.map(function (id) { return ITEM[id]; }).filter(Boolean) : pick(s.subj, s.n);
        return { subj: s.subj, n: its.length, min: s.min, items: its.map(function (x) { return x.id; }), ans: {}, flag: {}, cur: 0, start: null, end: null, done: false };
      }) };
      save(); begin();
    }).catch(function (e) { alertBox('Gagal memuat', e.message); });
  }
  function begin() {
    var a = ST.active, s = a.sessions[a.idx];
    if (!s.start) { s.start = Date.now(); s.end = s.start + s.min * 60000; save(); }
    exam();
  }
  function resume() {
    var subs = subjOf(ST.active.sessions);
    Promise.all(subs.map(load)).then(function () {
      var s = ST.active.sessions[ST.active.idx];
      if (s.done) sessionResult(); else begin();
    }).catch(function (e) { alertBox('Gagal memuat', e.message); });
  }

  /* ---------- beranda try out ---------- */
  function home(focus) {
    view = 'home'; stopTick();
    var p = pref(), H = ST.history || [];
    var lastOf = function (lab) { var h = H.filter(function (x) { return x.label === lab; })[0]; return h ? '<div class="last">Terakhir: nilai ' + h.score + ' (' + h.correct + '/' + h.n + ')</div>' : ''; };
    var days = [
      { id: 'd1', lab: 'Hari 1', t: 'Bahasa Indonesia & Literasi', m: '30 soal · 75 menit', s: [{ subj: 'bindo', n: 30, min: 75 }] },
      { id: 'd2', lab: 'Hari 2', t: 'Bahasa Inggris', m: '30 soal · 75 menit', s: [{ subj: 'bing', n: 30, min: 75 }] },
      { id: 'd3', lab: 'Hari 3', t: 'Matematika & Numerasi', m: '25 soal · 75 menit', s: [{ subj: 'matwajib', n: 25, min: 75 }] },
      { id: 'd4', lab: 'Hari 4', t: p.pilihan.length === 2 ? SUBJ[p.pilihan[0]].name + ' + ' + SUBJ[p.pilihan[1]].name : 'Dua mapel pilihan', m: '2 × 25 soal · 2 × 60 menit', s: p.pilihan.map(function (x) { return { subj: x, n: 25, min: 60 }; }) }
    ];
    var h = '<div class="wrap">';
    if (ST.active) {
      var a = ST.active, s = a.sessions[a.idx];
      h += '<div class="resume"><div><b>Try out sedang berjalan: ' + esc(a.label) + '</b><div class="note">' + SUBJ[s.subj].name + (a.sessions.length > 1 ? ' · sesi ' + (a.idx + 1) + '/' + a.sessions.length : '') + (s.end && !s.done ? ' · sisa waktu terus berjalan' : '') + '</div></div><div style="display:flex;gap:8px"><button class="btn ghost" data-act="drop">Hapus</button><button class="btn" data-act="resume">Lanjutkan</button></div></div>';
    }
    h += '<div class="head"><div><h1>Try Out TKA 2026</h1><p>Jumlah soal dan durasi mengikuti jadwal resmi per hari. Waktu terus berjalan walau halaman ditutup, seperti ujian sungguhan.</p></div></div>';
    h += '<div class="days">' + days.map(function (d, i) {
      var ready = d.s.length >= 1 && (d.id !== 'd4' || p.pilihan.length === 2);
      return '<div class="day" id="day-' + d.id + '"' + (focus === d.id ? ' style="outline:3px solid var(--ac)"' : '') + '><div class="dl"><span>' + d.lab + '</span><span>' + DATES[p.gel][i] + '</span></div><h3>' + esc(d.t) + '</h3><div class="meta">' + d.m + '</div>' + lastOf('Simulasi ' + d.lab) +
        (d.id === 'd4' ? '<div class="pick" aria-label="Pilih dua mapel pilihan">' + PILIHAN.map(function (x) { var on = p.pilihan.indexOf(x) >= 0; return '<button class="chip ' + (on ? 'on' : '') + '" data-pil="' + x + '" aria-pressed="' + on + '">' + SUBJ[x].short + '</button>'; }).join('') + '</div><div class="note">' + (p.pilihan.length === 2 ? 'Mapel pilihanmu tersimpan.' : 'Pilih tepat dua mapel pilihanmu.') + '</div>' : '') +
        '<button class="go" data-day="' + d.id + '" ' + (ready ? '' : 'disabled') + '>Mulai simulasi ' + d.lab + '</button></div>';
    }).join('') + '</div>';
    var mo = mkOpen(mkLoad()).length;
    h += '<div class="box"><h2>📕 Buku kesalahan</h2><p class="note" style="margin-top:0">' + (mo ? '<b>' + mo + ' soal</b> pernah salah, kosong, atau ragu dan belum kamu jawab benar.' : 'Soal yang salah, kosong, atau ragu dari try out dan latihan per teks akan terkumpul di sini.') + '</p><button class="btn" data-act="book">' + (mo ? 'Buka buku kesalahan' : 'Lihat buku kesalahan') + '</button></div>';
    h += '<div class="box"><h2>⚡ Latihan kilat</h2><p class="note" style="margin-top:0">10 soal dalam 15 menit dari satu mapel. Cocok untuk pemanasan sebelum belajar.</p><div class="pick">' + REAL.map(function (k) { return '<button class="chip" data-quick="' + k + '">' + SUBJ[k].icon + ' ' + SUBJ[k].short + '</button>'; }).join('') + '</div></div>';
    h += '<div class="box"><h2>📦 Paket penuh per mapel</h2><p class="note" style="margin-top:0">Satu mapel dengan jumlah soal dan durasi resmi, di luar urutan hari.</p><div class="pick">' + REAL.map(function (k) { return '<button class="chip" data-full="' + k + '">' + SUBJ[k].icon + ' ' + SUBJ[k].short + ' · ' + SUBJ[k].n + ' soal</button>'; }).join('') + '</div></div>';
    h += '<div class="box"><h2>🗂️ Riwayat</h2>' + (H.length ? '<table class="hist"><tr><th>Tanggal</th><th>Paket</th><th>Mapel</th><th style="text-align:right">Nilai</th></tr>' + H.slice(0, 15).map(function (x) {
      return '<tr><td>' + new Date(x.t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + '</td><td>' + esc(x.label) + '</td><td>' + esc(SUBJ[x.subj] ? SUBJ[x.subj].short : x.subj) + ' (' + x.correct + '/' + x.n + ')</td><td class="n">' + x.score + '</td></tr>';
    }).join('') + '</table>' : '<p class="note">Belum ada riwayat. Mulai dari simulasi hari pertama atau latihan kilat.</p>') + '</div>';
    h += '<p class="note" style="margin-top:14px">Penilaian latihan: pilihan ganda kompleks dan soal kategori dianggap benar hanya jika seluruh isiannya tepat. Pembobotan TKA resmi dapat berbeda. Tanggal mengikuti jadwal gelombang ' + p.gel + '; cek jadwal resmi sekolahmu.</p></div>';
    $('app').innerHTML = h;
    if (focus) { var el = $('day-' + focus); if (el) el.scrollIntoView({ block: 'center' }); }
  }

  /* ---------- tampilan ujian ---------- */
  function sess() { return ST.active.sessions[ST.active.idx]; }
  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }
  function fmt(ms) { ms = Math.max(0, ms); var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' : '') + (h && m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x; }
  function answered(s, id) { var v = s.ans[id]; if (v == null) return false; if (Array.isArray(v)) return ITEM[id].kind === 'bs' ? v.filter(function (x) { return x != null; }).length === ITEM[id].options.length : v.length > 0; return true; }
  function partial(s, id) { var v = s.ans[id]; return Array.isArray(v) && v.filter(function (x) { return x != null; }).length > 0; }

  function exam() {
    view = 'exam';
    var a = ST.active, s = sess(), it = ITEM[s.items[s.cur]], sj = SUBJ[s.subj];
    var h = '<div class="xbar"><div class="sj"><b>' + sj.icon + ' ' + esc(sj.name) + '</b><small>' + esc(a.label) + (a.sessions.length > 1 ? ' · Sesi ' + (a.idx + 1) + '/' + a.sessions.length : '') + ' · Soal ' + (s.cur + 1) + '/' + s.n + '</small></div><button class="gridb" data-act="grid" aria-label="Daftar soal">☷ ' + (s.cur + 1) + '/' + s.n + '</button><div class="clock" id="clock" role="timer" aria-label="Sisa waktu">' + fmt(s.end - Date.now()) + '</div></div>';
    h += '<div class="xmain"><div class="qarea">' + questionWrap(it, s) + '</div>' + navPanel(s) + '</div>';
    var last = s.cur === s.n - 1;
    h += '<div class="xfoot"><button data-act="prev" ' + (s.cur ? '' : 'disabled') + ' aria-label="Soal sebelumnya">◀<span class="lbl"> Sebelumnya</span></button><button class="rg ' + (s.flag[it.id] ? 'on' : '') + '" data-act="flag" aria-pressed="' + !!s.flag[it.id] + '">' + (s.flag[it.id] ? '■' : '□') + ' Ragu-ragu</button>' + (last ? '<button class="fin" data-act="finish">Selesai ✓</button>' : '<button class="nx" data-act="next">Berikutnya ▶</button>') + '</div>';
    h += '<div class="modal" id="modal"></div>';
    $('app').innerHTML = h;
    stopTick(); tick = setInterval(clock, 1000); clock();
  }
  function clock() {
    var s = sess(), el = $('clock'); if (!s || !el) return;
    var left = s.end - Date.now();
    el.textContent = fmt(left);
    el.classList.toggle('low', left < 5 * 60000);
    if (left <= 0) { stopTick(); finishSession(true); }
  }
  function stimHTML(it) {
    var st = STIMS[it.stim]; if (!st) return '';
    if (UNF[it.stim]) return '<div class="stimbox" id="stimbox"><h3>' + esc(st.title) + '</h3><div class="ty">' + esc(st.type) + '</div>' + st.text + (st.note ? '<div class="nt">' + esc(st.note) + '</div>' : '') + '</div>';
    return '<div class="stimbox fold" id="stimbox"><h3>' + esc(st.title) + '</h3><div class="ty">' + esc(st.type) + '</div>' + st.text + (st.note ? '<div class="nt">' + esc(st.note) + '</div>' : '') + '</div><button class="mstim" data-act="unfold">Tampilkan teks lengkap ▾</button>';
  }
  function question(it, s) {
    var v = s.ans[it.id], body = '';
    var kindLab = { pg: 'Pilihan ganda', multi: 'PG kompleks', bs: 'Kategori' }[it.kind];
    var en = it.subj === 'bing';
    var inst = it.kind === 'multi' ? (en ? 'There is more than one correct answer. Choose every correct answer.' : 'Jawaban benar lebih dari satu. Pilih semua jawaban yang benar.') : it.kind === 'bs' ? (en ? 'Choose one category for each statement.' : 'Pilih satu kategori untuk setiap pernyataan.') : '';
    body += '<div class="qno"><span>Soal ' + (s.cur + 1) + (s.subj === 'mix' ? ' · ' + SUBJ[it.subj].short : '') + '</span><span class="kd">' + kindLab + '</span></div>' + (inst ? '<div class="inst">' + inst + '</div>' : '');
    body += '<div class="stem">' + (it.title ? '<b>' + esc(it.title) + '</b><br>' : '') + it.stem + '</div>' + (it.visual ? '<div class="vis">' + it.visual + '</div>' : '');
    if (it.kind === 'pg') body += it.options.map(function (o, k) { var on = v === k; return '<button class="opt ' + (on ? 'on' : '') + '" data-pg="' + k + '" aria-pressed="' + on + '"><span class="bub">' + LET[k] + '</span><span>' + o + '</span></button>'; }).join('');
    else if (it.kind === 'multi') { var sel = v || []; body += it.options.map(function (o, k) { var on = sel.indexOf(k) >= 0; return '<button class="opt ' + (on ? 'on' : '') + '" data-mu="' + k + '" aria-pressed="' + on + '"><span class="sq">' + (on ? '✓' : '') + '</span><span>' + o + '</span></button>'; }).join(''); }
    else { var rs = v || []; body += '<table class="bst"><tr><th style="text-align:left">' + (en ? 'Statement' : 'Pernyataan') + '</th>' + it.labels.map(function (l) { return '<th>' + esc(l) + '</th>'; }).join('') + '</tr>' + it.options.map(function (o, r) { return '<tr><td>' + o + '</td>' + it.labels.map(function (l, c) { var on = rs[r] === c; return '<td class="c"><button class="' + (on ? 'on' : '') + '" data-bs="' + r + '|' + c + '" aria-label="' + esc(l) + '" aria-pressed="' + on + '"></button></td>'; }).join('') + '</tr>'; }).join('') + '</table>'; }
    return body;
  }
  function questionWrap(it, s) {
    var q = '<div class="qbox" id="qbox">' + question(it, s) + '</div>';
    return it.stim ? '<div class="pair">' + '<div>' + stimHTML(it) + '</div>' + q + '</div>' : q;
  }
  function refresh() {
    var s = sess(), it = ITEM[s.items[s.cur]];
    $('qbox').innerHTML = question(it, s);
    var nv = $('nav'), open = nv && nv.classList.contains('open');
    if (nv) { nv.outerHTML = navPanel(s); if (open) $('nav').classList.add('open'); }
    var f = document.querySelector('.xfoot .rg');
    if (f) { f.classList.toggle('on', !!s.flag[it.id]); f.setAttribute('aria-pressed', !!s.flag[it.id]); f.textContent = (s.flag[it.id] ? '■' : '□') + ' Ragu-ragu'; }
  }
  function navPanel(s) {
    return '<aside class="nav" id="nav" aria-label="Daftar soal"><h4>Daftar soal</h4><div class="nums">' + s.items.map(function (id, i) {
      var c = s.flag[id] ? 'r' : answered(s, id) ? 'a' : '';
      return '<button class="' + c + (i === s.cur ? ' cur' : '') + '" data-to="' + i + '" aria-label="Soal ' + (i + 1) + (c === 'a' ? ', dijawab' : c === 'r' ? ', ragu-ragu' : ', kosong') + '">' + (i + 1) + '</button>';
    }).join('') + '</div><div class="legend"><span><i class="a"></i>Sudah dijawab</span><span><i class="r"></i>Ragu-ragu</span><span><i></i>Belum dijawab</span></div><button class="btn fin2" data-act="finish">Selesaikan sesi</button></aside>';
  }

  function confirmFinish() {
    var s = sess(), kosong = s.items.filter(function (id) { return !answered(s, id); }).length, ragu = s.items.filter(function (id) { return s.flag[id]; }).length;
    var m = $('modal');
    m.innerHTML = '<div class="mb" role="dialog" aria-modal="true" aria-labelledby="mt"><h3 id="mt">Selesaikan sesi ini?</h3><p>' + (kosong ? '<b>' + kosong + ' soal</b> belum dijawab. ' : 'Semua soal sudah dijawab. ') + (ragu ? '<b>' + ragu + ' soal</b> masih ditandai ragu-ragu. ' : '') + 'Setelah selesai, jawaban tidak bisa diubah.</p><div class="acts"><button class="btn ghost" data-act="close">Kembali</button><button class="btn" data-act="confirm">Ya, selesai</button></div></div>';
    m.classList.add('on');
    m.querySelector('[data-act=close]').focus();
  }
  function score(s) {
    var c = 0, e = 0, per = {};
    s.items.forEach(function (id) {
      var it = ITEM[id], ok = isRight(it, s.ans[id]), emp = !answered(s, id), tk = s.subj === 'mix' ? SUBJ[it.subj].short : it.topic;
      if (ok) c++; if (emp) e++;
      var p = per[tk] = per[tk] || { n: 0, c: 0 }; p.n++; if (ok) p.c++;
    });
    return { correct: c, empty: e, wrong: s.n - c - e, score: Math.round(c / s.n * 100), per: per };
  }
  function isRight(it, v) {
    if (v == null) return false;
    if (it.kind === 'pg') return v === it.key[0];
    if (it.kind === 'multi') { var a = v.slice().sort(), b = it.key.slice().sort(); return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
    return it.key.every(function (k, i) { return v[i] === k; });
  }
  function finishSession(auto) {
    stopTick();
    var a = ST.active, s = sess();
    if (s.done) return sessionResult();
    s.done = true; s.finished = Math.min(Date.now(), s.end); s.result = score(s);
    ST.history = ST.history || [];
    ST.history.unshift({ t: Date.now(), label: a.label, subj: s.subj, n: s.n, correct: s.result.correct, score: s.result.score, dur: Math.round((s.finished - s.start) / 1000) });
    ST.history = ST.history.slice(0, 60);
    if (s.subj !== 'mix') markSeen(s.subj, s.items);
    try { mkRecord(s); } catch (e) {}
    save();
    sessionResult(auto);
  }

  /* ---------- hasil ---------- */
  var filt = 'all';
  function sessionResult(auto) {
    view = 'result'; stopTick();
    var a = ST.active, s = sess(), r = s.result, sj = SUBJ[s.subj], more = a.idx < a.sessions.length - 1;
    var h = '<div class="wrap">' + (auto ? '<div class="resume"><b>Waktu habis. Sesi diselesaikan otomatis.</b></div>' : '');
    h += '<div class="head"><div><h1>' + sj.icon + ' Hasil ' + esc(sj.name) + '</h1><p>' + esc(a.label) + (a.sessions.length > 1 ? ' · Sesi ' + (a.idx + 1) + '/' + a.sessions.length : '') + '</p></div></div>';
    h += '<div class="box"><div class="score"><div class="big">' + r.score + '<small>/100</small></div><div>' + verdict(r.score) + '</div></div><div class="stats"><div><b>' + r.correct + '</b><small>benar</small></div><div><b>' + r.wrong + '</b><small>salah</small></div><div><b>' + r.empty + '</b><small>kosong</small></div><div><b>' + fmt(s.finished - s.start) + '</b><small>waktu terpakai</small></div></div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">' + (more ? '<button class="btn" data-act="nextsess">Lanjut ke sesi ' + (a.idx + 2) + ': ' + SUBJ[a.sessions[a.idx + 1].subj].name + ' ▶</button>' : '<button class="btn" data-act="done">Selesai, kembali ke Try Out</button>') + '<button class="btn ghost" data-act="again">Paket baru yang sama</button></div></div>';
    var topics = Object.keys(r.per).sort(function (x, y) { return r.per[x].c / r.per[x].n - r.per[y].c / r.per[y].n; });
    h += '<div class="box"><h2>Per topik</h2><p class="note" style="margin-top:0">Topik dengan ketepatan terendah ada di atas; mulai pengulangan dari sana.</p><div class="topics">' + topics.map(function (k) { var p = r.per[k], v = Math.round(p.c / p.n * 100); return '<div class="topic"><span>' + esc(k) + '</span><div class="bar"><i class="' + (v < 50 ? 'lo' : '') + '" style="width:' + v + '%"></i></div><b>' + p.c + '/' + p.n + '</b></div>'; }).join('') + '</div></div>';
    h += '<div class="box"><h2>Pembahasan</h2><div class="filt">' + [['all', 'Semua'], ['no', 'Salah'], ['em', 'Kosong'], ['rg', 'Ragu-ragu']].map(function (f) { return '<button class="chip ' + (filt === f[0] ? 'on' : '') + '" data-filt="' + f[0] + '">' + f[1] + '</button>'; }).join('') + '</div><div id="rvlist">' + reviewList(s) + '</div></div></div>';
    $('app').innerHTML = h; scrollTo(0, 0);
  }
  function verdict(v) {
    if (v >= 85) return '<b>Sangat siap.</b><div class="note">Pertahankan ritme dan fokus pada soal yang salah.</div>';
    if (v >= 70) return '<b>Siap.</b><div class="note">Beberapa topik masih perlu diulang. Lihat bagian per topik.</div>';
    if (v >= 50) return '<b>Cukup.</b><div class="note">Ulangi materi pada topik dengan bar merah, lalu coba latihan kilat.</div>';
    return '<b>Perlu penguatan.</b><div class="note">Kembali ke materi mapel ini, kerjakan latihan per subbab, lalu coba lagi.</div>';
  }
  function reviewList(s) {
    var out = s.items.map(function (id, i) {
      var it = ITEM[id], v = s.ans[id], ok = isRight(it, v), em = !answered(s, id);
      var cls = ok ? 'ok' : em ? 'em' : 'no';
      if (filt === 'no' && cls !== 'no') return ''; if (filt === 'em' && !em) return ''; if (filt === 'rg' && !s.flag[id]) return '';
      var h = '<div class="rv ' + cls + '"><div class="qno"><span>Soal ' + (i + 1) + ' · ' + esc(it.topic) + '</span><span class="kd">' + (ok ? '✓ Benar' : em ? '— Kosong' : '✗ Salah') + (s.flag[id] ? ' · ragu' : '') + '</span></div>';
      if (it.stim && STIMS[it.stim]) h += '<details class="st"><summary>Teks: ' + esc(STIMS[it.stim].title) + '</summary><div class="stimbox" style="position:static;max-height:none;margin-top:8px">' + STIMS[it.stim].text + '</div></details>';
      h += '<div class="stem">' + (it.title ? '<b>' + esc(it.title) + '</b><br>' : '') + it.stem + '</div>' + (it.visual ? '<div class="vis">' + it.visual + '</div>' : '');
      if (it.kind === 'pg') h += it.options.map(function (o, k) { return '<div class="opt ' + (k === it.key[0] ? 'key ' : '') + (v === k ? 'mine' : '') + '"><span class="bub">' + LET[k] + '</span><span>' + o + '</span></div>'; }).join('');
      else if (it.kind === 'multi') h += it.options.map(function (o, k) { var mine = (v || []).indexOf(k) >= 0, key = it.key.indexOf(k) >= 0; return '<div class="opt ' + (key ? 'key ' : '') + (mine ? 'mine' : '') + '"><span class="sq">' + (mine ? '✓' : '') + '</span><span>' + o + '</span></div>'; }).join('');
      else h += '<table class="bst"><tr><th style="text-align:left">Pernyataan</th><th>Jawabanmu</th><th>Kunci</th></tr>' + it.options.map(function (o, r) { var m = v && v[r] != null ? it.labels[v[r]] : '—', k = it.labels[it.key[r]]; return '<tr><td>' + o + '</td><td class="c" style="color:' + (m === k ? 'var(--ok)' : 'var(--no)') + ';font-weight:800">' + esc(m) + '</td><td class="c"><b>' + esc(k) + '</b></td></tr>'; }).join('') + '</table>';
      if (it.why) h += '<div class="why"><b>Pembahasan:</b> ' + it.why + '</div>';
      return h + '</div>';
    }).join('');
    return out || '<p class="note">Tidak ada soal pada kategori ini.</p>';
  }

  /* ---------- buku kesalahan ---------- */
  var BOOKF = '';
  function itemCard(id, e) {
    var it = ITEM[id]; if (!it) return '';
    var h = '<div class="rv no" style="border-left-color:' + (e.n ? 'var(--no)' : 'var(--rg)') + '"><div class="qno"><span>' + SUBJ[it.subj].icon + ' ' + esc(SUBJ[it.subj].short) + ' · ' + esc(it.topic) + '</span><span class="kd">' + (e.n ? 'salah ' + e.n + '×' : 'ragu') + ' · ' + new Date(e.t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + '</span></div>';
    if (it.stim && STIMS[it.stim]) h += '<details class="st"><summary>Teks: ' + esc(STIMS[it.stim].title) + '</summary><div class="stimbox" style="position:static;max-height:none;margin-top:8px">' + STIMS[it.stim].text + '</div></details>';
    h += '<div class="stem">' + (it.title ? '<b>' + esc(it.title) + '</b><br>' : '') + it.stem + '</div>' + (it.visual ? '<div class="vis">' + it.visual + '</div>' : '');
    h += '<details class="st"><summary>Lihat kunci & pembahasan</summary><div style="margin-top:6px">';
    if (it.kind === 'pg') h += it.options.map(function (o, k) { return '<div class="opt ' + (k === it.key[0] ? 'key' : '') + '"><span class="bub">' + LET[k] + '</span><span>' + o + '</span></div>'; }).join('');
    else if (it.kind === 'multi') h += it.options.map(function (o, k) { var key = it.key.indexOf(k) >= 0; return '<div class="opt ' + (key ? 'key' : '') + '"><span class="sq">' + (key ? '✓' : '') + '</span><span>' + o + '</span></div>'; }).join('');
    else h += '<table class="bst"><tr><th style="text-align:left">Pernyataan</th><th>Kunci</th></tr>' + it.options.map(function (o, r) { return '<tr><td>' + o + '</td><td class="c"><b>' + esc(it.labels[it.key[r]]) + '</b></td></tr>'; }).join('') + '</table>';
    if (it.why) h += '<div class="why"><b>Pembahasan:</b> ' + it.why + '</div>';
    h += '</div></details><div style="margin-top:10px"><button class="btn ghost" data-act="tuntas" data-id="' + esc(id) + '">✓ Saya sudah paham, tandai tuntas</button></div></div>';
    return h;
  }
  function bookList(m, f) {
    return mkOpen(m).filter(function (id) { return !f || id.split(':')[0] === f; }).sort(function (a, b) { var A = m.items[a], B = m.items[b]; return (B.n - A.n) || (B.t - A.t); });
  }
  function book(f) {
    view = 'book'; stopTick(); BOOKF = f || '';
    var m = mkLoad(), open = mkOpen(m), subs = [];
    open.forEach(function (id) { var k = id.split(':')[0]; if (subs.indexOf(k) < 0) subs.push(k); });
    $('app').innerHTML = '<div class="wrap"><p class="note">Memuat buku kesalahan…</p></div>';
    Promise.all(subs.map(function (k) { return load(k).catch(function () { return null; }); })).then(function () {
      var list = bookList(m, BOOKF), done = Object.keys(m.items).filter(function (id) { return m.items[id].ok; }).length;
      var count = {}; open.forEach(function (id) { var k = id.split(':')[0]; count[k] = (count[k] || 0) + 1; });
      var h = '<div class="wrap"><div class="head"><div><h1>📕 Buku Kesalahan</h1><p>Soal yang pernah salah, kosong, atau ditandai ragu dari try out dan latihan per teks. Soal dianggap tuntas setelah kamu menjawabnya dengan benar.</p></div><button class="btn ghost" data-act="tohome">← Try Out</button></div>';
      if (!open.length) {
        h += '<div class="box"><h2>Belum ada soal yang perlu diulang</h2><p class="note">Kerjakan simulasi, latihan kilat, atau latihan per teks. Soal yang salah otomatis masuk ke sini.</p><button class="btn" data-act="tohome">Ke Try Out</button></div>';
      } else {
        h += '<div class="box"><div class="filt" style="margin-top:0"><button class="chip ' + (!BOOKF ? 'on' : '') + '" data-bookf="">Semua · ' + open.length + '</button>' + subs.map(function (k) { return '<button class="chip ' + (BOOKF === k ? 'on' : '') + '" data-bookf="' + k + '">' + SUBJ[k].icon + ' ' + SUBJ[k].short + ' · ' + count[k] + '</button>'; }).join('') + '</div>' +
          '<p class="note">Latihan ulang memakai maksimal 30 soal dengan waktu 1,5 menit per soal. Soal yang kamu jawab benar akan ditandai tuntas.</p><button class="btn" data-act="bookgo" data-subj="' + BOOKF + '">Latihan ulang ' + Math.min(30, list.length) + ' soal' + (BOOKF ? ' ' + SUBJ[BOOKF].short : '') + '</button></div>';
        h += '<div class="box"><h2>Daftar soal (' + list.length + ')</h2>' + list.slice(0, 60).map(function (id) { return itemCard(id, m.items[id]); }).join('') + (list.length > 60 ? '<p class="note">Menampilkan 60 soal teratas. Selesaikan latihan ulang untuk mengurangi daftar.</p>' : '') + '</div>';
      }
      if (done) h += '<p class="note">' + done + ' soal sudah tuntas. <button class="chip" data-act="clearok">Bersihkan daftar tuntas</button></p>';
      h += '</div>';
      $('app').innerHTML = h; scrollTo(0, 0);
    });
  }
  function bookStart(f) {
    var m = mkLoad(), list = bookList(m, f).slice(0, 30);
    if (!list.length) return book(f);
    if (ST.active && !confirm('Try out yang sedang berjalan akan dihapus. Lanjutkan?')) return;
    startPlan('Buku kesalahan', [{ subj: 'mix', ids: list, n: list.length, min: Math.max(5, Math.ceil(list.length * 1.5)) }]);
  }

  function alertBox(t, m) { $('app').innerHTML = '<div class="wrap"><div class="box"><h2>' + esc(t) + '</h2><p>' + esc(m) + '</p><button class="btn" data-act="done">Kembali</button></div></div>'; }

  /* ---------- event ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) { if (e.target.id === 'modal') e.target.classList.remove('on'); return; }
    var d = t.dataset, s = ST.active && sess(), it = s && ITEM[s.items[s.cur]];
    if (d.pil) { var p = pref(), i = p.pilihan.indexOf(d.pil); if (i >= 0) p.pilihan.splice(i, 1); else { p.pilihan.push(d.pil); if (p.pilihan.length > 2) p.pilihan.shift(); } sv(PREF, p); return home('d4'); }
    if (d.day) {
      if (ST.active && !confirm('Try out yang sedang berjalan akan dihapus. Lanjutkan?')) return;
      var P = pref(), map = { d1: [['bindo', 30, 75]], d2: [['bing', 30, 75]], d3: [['matwajib', 25, 75]], d4: P.pilihan.map(function (x) { return [x, 25, 60]; }) };
      return startPlan('Simulasi ' + { d1: 'Hari 1', d2: 'Hari 2', d3: 'Hari 3', d4: 'Hari 4' }[d.day], map[d.day].map(function (x) { return { subj: x[0], n: x[1], min: x[2] }; }));
    }
    if (d.quick || d.full) {
      if (ST.active && !confirm('Try out yang sedang berjalan akan dihapus. Lanjutkan?')) return;
      var k = d.quick || d.full, S = SUBJ[k];
      return startPlan(d.quick ? 'Latihan kilat' : 'Paket ' + S.short, [{ subj: k, n: d.quick ? 10 : S.n, min: d.quick ? 15 : S.min }]);
    }
    if (d.filt) { filt = d.filt; return sessionResult(); }
    if (d.bookf != null) return book(d.bookf);
    if (d.to != null) { s.cur = +d.to; save(); var nv = $('nav'); if (nv) nv.classList.remove('open'); return exam(); }
    if (d.pg != null) { s.ans[it.id] = +d.pg; save(); return refresh(); }
    if (d.mu != null) { var a = s.ans[it.id] || [], k2 = +d.mu, ix = a.indexOf(k2); if (ix >= 0) a.splice(ix, 1); else a.push(k2); s.ans[it.id] = a; save(); return refresh(); }
    if (d.bs) { var rc = d.bs.split('|'), b = s.ans[it.id] || []; b[+rc[0]] = +rc[1]; s.ans[it.id] = b; save(); return refresh(); }
    switch (d.act) {
      case 'resume': return resume();
      case 'drop': if (confirm('Hapus try out yang sedang berjalan? Jawabannya tidak disimpan ke riwayat.')) { ST.active = null; save(); home(); } return;
      case 'prev': if (s.cur > 0) { s.cur--; save(); exam(); } return;
      case 'next': if (s.cur < s.n - 1) { s.cur++; save(); exam(); } return;
      case 'flag': s.flag[it.id] = !s.flag[it.id]; save(); return refresh();
      case 'grid': $('nav').classList.toggle('open'); return;
      case 'unfold': var sb = $('stimbox'); if (sb) sb.classList.remove('fold'); UNF[it.stim] = true; t.remove(); return;
      case 'finish': return confirmFinish();
      case 'close': $('modal').classList.remove('on'); return;
      case 'confirm': return finishSession(false);
      case 'nextsess': ST.active.idx++; save(); filt = 'all'; return begin();
      case 'again': var A = ST.active, cur = A.sessions[A.idx]; if (cur.subj === 'mix') { ST.active = null; save(); return bookStart(''); } return startPlan(A.label, [{ subj: cur.subj, n: cur.n, min: cur.min }]);
      case 'tohome': return home();
      case 'done': ST.active = null; save(); filt = 'all'; return home();
      case 'book': return book();
      case 'bookgo': return bookStart(d.subj || '');
      case 'tuntas': var mm = mkLoad(); if (mm.items[d.id]) { mm.items[d.id].ok = 1; mm.items[d.id].t2 = Date.now(); sv(MK, mm); } return book(BOOKF);
      case 'clearok': var m2 = mkLoad(); Object.keys(m2.items).forEach(function (id) { if (m2.items[id].ok) delete m2.items[id]; }); sv(MK, m2); return book(BOOKF);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (view !== 'exam' || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    var m = $('modal'); if (m && m.classList.contains('on')) { if (e.key === 'Escape') m.classList.remove('on'); return; }
    var s = sess(), it = ITEM[s.items[s.cur]];
    if (e.key === 'ArrowRight' && s.cur < s.n - 1) { s.cur++; save(); exam(); }
    else if (e.key === 'ArrowLeft' && s.cur > 0) { s.cur--; save(); exam(); }
    else if (it.kind === 'pg' && /^[a-eA-E]$/.test(e.key)) { var k = 'abcde'.indexOf(e.key.toLowerCase()); if (k < it.options.length) { s.ans[it.id] = k; save(); refresh(); } }
  });

  /* ---------- API untuk portal ---------- */
  function setTh(n) { if (!n || n === 'auto') document.documentElement.removeAttribute('data-skin'); else document.documentElement.setAttribute('data-skin', n === 'kertas' ? 'senja' : n); }
  function setFs(v) { document.body.style.fontSize = 16.5 * (+v || 1) + 'px'; }
  window.setTh = setTh; window.setFs = setFs;
  window.showHub = function (k) { if (view === 'exam') return; if (k === 'salah') book(); else if (/^d[1-4]$/.test(k)) home(k); else home(); };
  window.go = function () { if (view !== 'exam') home(); };
  window.home = function () { if (view !== 'exam') home(); };

  var h0 = (location.hash || '').slice(1);
  if (ST.active && !sess().done && sess().start) resume(); else if (h0 === 'salah') book(); else home(/^d[1-4]$/.test(h0) ? h0 : null);
})();
