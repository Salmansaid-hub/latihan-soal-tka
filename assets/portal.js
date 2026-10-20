/* TKA ICG — portal belajar TKA SMA 2026 untuk kelas 12.
   Mengelola beranda, info TKA, rencana belajar, dan memuat aplikasi mapel di dalam iframe. */
(function () {
  'use strict';

  /* ===== Konfigurasi situs (ubah di sini bila perlu) ===== */
  var SITE = {
    repo: 'https://github.com/Salmansaid-hub/latihan-soal-tka',
    maker: 'siswa MAN Insan Cendekia Gorontalo',
    pusmendik: 'https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/sma/',
    version: '3.0 · Oktober 2026'
  };
  var EXAM = { 1: ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29'], 2: ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'] };
  var SUSULAN = ['2026-11-16', '2026-11-29'], HASIL = '2026-12-23';
  var MILESTONES = [
    ['2026-09-21', '2026-09-27', 'Simulasi TKA'],
    ['2026-10-05', '2026-10-18', 'Gladi bersih'],
    ['2026-10-26', '2026-10-29', 'Pelaksanaan gelombang 1'],
    ['2026-10-31', '2026-11-01', 'Gelombang khusus'],
    ['2026-11-02', '2026-11-05', 'Pelaksanaan gelombang 2'],
    ['2026-11-07', '2026-11-08', 'Gelombang khusus'],
    ['2026-11-16', '2026-11-29', 'Ujian susulan'],
    ['2026-12-23', '2026-12-23', 'Pengumuman hasil TKA']
  ];
  var WAJIB = ['bindo', 'bing', 'matwajib'], PIL = ['matlanjut', 'fisika', 'kimia', 'biologi', 'ekonomi'];
  var SHORT = { bindo: 'B. Indonesia', bing: 'B. Inggris', matwajib: 'Matematika', matlanjut: 'Mat Lanjut', fisika: 'Fisika', kimia: 'Kimia', biologi: 'Biologi', ekonomi: 'Ekonomi', tryout: 'Try Out' };
  var DAYINFO = [
    { subj: ['bindo'], t: 'Bahasa Indonesia & Literasi', m: '30 soal · 75 menit' },
    { subj: ['bing'], t: 'Bahasa Inggris', m: '30 soal · 75 menit' },
    { subj: ['matwajib'], t: 'Matematika & Numerasi', m: '25 soal · 75 menit' },
    { subj: null, t: 'Dua mapel pilihan', m: '2 × 25 soal · 2 × 60 menit' }
  ];
  var KEY = 'tka-icg-portal-state-v2', PREF = 'tka-icg-pref', ACT = 'tka-icg-activity';
  var OWN = /^(tka|tml|tkm|eko|ruangtka|lit)/;

  var CAT = window.CATALOG || [], BY = {};
  CAT.forEach(function (c) { BY[c.id] = c; });

  /* ===== util ===== */
  var $ = function (id) { return document.getElementById(id); };
  function ld(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function sv(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function today() { return ymd(new Date()); }
  function addDays(s, n) { var p = s.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + n); return ymd(d); }
  function diff(a, b) { var pa = a.split('-'), pb = b.split('-'); return Math.round((new Date(+pb[0], +pb[1] - 1, +pb[2]) - new Date(+pa[0], +pa[1] - 1, +pa[2])) / 864e5); }
  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function fdate(s, opt) { var p = s.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); var t = (opt === 'short' ? HARI[d.getDay()].slice(0, 3) : HARI[d.getDay()]) + ', ' + d.getDate() + ' ' + (opt === 'short' ? BULAN[d.getMonth()].slice(0, 3) : BULAN[d.getMonth()]); return opt === 'year' ? t + ' ' + d.getFullYear() : t; }
  function frange(a, b) { var pa = a.split('-'), pb = b.split('-'); if (a === b) return +pa[2] + ' ' + BULAN[+pa[1] - 1]; return pa[1] === pb[1] ? +pa[2] + '–' + +pb[2] + ' ' + BULAN[+pb[1] - 1] : +pa[2] + ' ' + BULAN[+pa[1] - 1] + ' – ' + +pb[2] + ' ' + BULAN[+pb[1] - 1]; }
  function toast(m) { var t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('on'); }, 2600); }

  /* ===== status & preferensi ===== */
  var ST = Object.assign({ skin: 'auto', nav: 'top', fs: 'm', barHidden: false, last: '' }, ld(KEY, {}));
  ST.barHidden = false;
  function pref() { var p = ld(PREF, {}); if (p.gel !== 2) p.gel = 1; if (!Array.isArray(p.pilihan)) p.pilihan = []; p.pilihan = p.pilihan.filter(function (x) { return PIL.indexOf(x) >= 0; }).slice(0, 2); return p; }
  function setPref(p) { sv(PREF, p); }
  function save() { sv(KEY, { skin: ST.skin, nav: ST.nav, fs: ST.fs, last: ST.last }); }
  var dark = function () { return matchMedia('(prefers-color-scheme: dark)').matches; };
  function skin() { return ST.skin === 'auto' ? (dark() ? 'gelap' : 'terang') : ST.skin; }

  /* ===== progres ===== */
  function prog(id) {
    try {
      if (id === 'matwajib') { var st = ld('ruangtka-math-v1', {}), a = st.attempts && typeof st.attempts === 'object' ? st.attempts : {}; return { d: Array.isArray(st.read) ? st.read.length : 0, t: 27, x: Object.keys(a).length + '/600 soal dicoba' }; }
      if (id === 'bindo' || id === 'bing') { var P = id === 'bindo' ? 'litBindo' : 'litBing', dn = ld(P + 'DN', {}), qz = ld(P + 'QZ', {}); return { d: Object.keys(dn).filter(function (k) { return dn[k]; }).length, t: BY[id] ? BY[id].totalSubs : 18, x: Object.keys(qz).length + '/' + (BY[id] ? BY[id].nStim : 10) + ' teks dikerjakan' }; }
      var m = { matlanjut: ['tmlDN', 'tmlQZ', 'tmlHT', 33, 6], fisika: ['tkaDN', 'tkaQZ', 'tkaHT', 58, 6], kimia: ['tkmDN', 'tkmQZ', 'tkmHT', 50, 18], biologi: ['tkaBioDN', 'tkaBioQZ', 'tkaBioHT', 72, 10], ekonomi: ['ekoDN', 'ekoQZ', 'ekoHT', 36, 10] }[id];
      if (!m) return { d: 0, t: 1, x: '' };
      var g = function (k) { return ld(k, {}) || {}; };
      return { d: Object.values(g(m[0])).filter(Boolean).length, t: m[3], x: Object.keys(g(m[1])).length + ' kuis · ' + Object.keys(g(m[2])).length + '/' + m[4] + ' HOTS' };
    } catch (e) { return { d: 0, t: 1, x: '' }; }
  }
  function tryHist() { var h = ld('tka-tryout-v1', {}); return (h && h.history) || []; }
  function lastScore(id) { var h = tryHist().filter(function (x) { return x.subj === id; })[0]; return h ? h.score : null; }
  function coverage(id) { var p = prog(id); return Math.min(100, Math.round(p.d / p.t * 100)); }
  function ready(id) { var c = coverage(id), s = lastScore(id); return s == null ? c : Math.round((c + s) / 2); }
  function totalDone() { var D = 0; CAT.forEach(function (c) { D += prog(c.id).d; }); return D; }

  /* ===== aktivitas & runtutan ===== */
  function touch() {
    var a = ld(ACT, {}), t = today(); a.days = a.days || {};
    if (!a.base || a.base.date !== t) a.base = { date: t, d: totalDone() };
    a.days[t] = 1;
    var ks = Object.keys(a.days).sort(); if (ks.length > 120) ks.slice(0, ks.length - 120).forEach(function (k) { delete a.days[k]; });
    sv(ACT, a); return a;
  }
  function streak() { var a = ld(ACT, {}), d = a.days || {}, t = today(), n = 0; if (!d[t]) t = addDays(t, -1); while (d[t]) { n++; t = addDays(t, -1); } return n; }

  /* ===== status ujian ===== */
  function examStatus() {
    var p = pref(), ex = EXAM[p.gel], t = today();
    if (t < ex[0]) return { mode: 'before', n: diff(t, ex[0]) };
    var k = ex.indexOf(t); if (k >= 0) return { mode: 'during', k: k };
    if (t < ex[3]) return { mode: 'gap' };
    if (t <= SUSULAN[1]) return { mode: 'after' };
    if (t <= HASIL) return { mode: 'wait', n: diff(t, HASIL) };
    return { mode: 'done' };
  }
  function daySubj(k) { var p = pref(); return k < 3 ? DAYINFO[k].subj : p.pilihan; }
  function dayName(k) { var p = pref(); if (k < 3) return DAYINFO[k].t; return p.pilihan.length === 2 ? BY[p.pilihan[0]].name + ' + ' + BY[p.pilihan[1]].name : DAYINFO[3].t; }
  function dayReady(k) { var s = daySubj(k); if (!s.length) return null; return Math.round(s.reduce(function (a, x) { return a + ready(x); }, 0) / s.length); }

  /* ===== tampilan beranda ===== */
  function bubbles(v) { var f = v == null ? 0 : Math.round(v / 20), h = ''; for (var i = 0; i < 5; i++) h += '<span class="bub' + (i < f ? ' f' : '') + '"></span>'; return '<div class="bubbles" role="img" aria-label="Kesiapan ' + (v == null ? 'belum diatur' : v + '%') + '">' + h + '<em>' + (v == null ? '—' : v + '%') + '</em></div>'; }

  function heroHTML() {
    var p = pref(), ex = EXAM[p.gel], s = examStatus(), t = today(), top;
    if (s.mode === 'before') top = '<div class="count"><span class="num">' + s.n + '</span><span class="unit">hari lagi<small>menuju Hari 1 · ' + fdate(ex[0], 'year') + '</small></span></div>';
    else if (s.mode === 'during') top = '<div class="count"><span class="num">Hari ' + (s.k + 1) + '</span><span class="unit">ujian hari ini<small>' + esc(dayName(s.k)) + (s.k < 3 ? ' · besok ' + esc(dayName(s.k + 1)) : ' · hari terakhir') + '</small></span></div>';
    else if (s.mode === 'gap') top = '<div class="count"><span class="unit">Jeda ujian<small>Ujian berikutnya ' + fdate(ex.filter(function (d) { return d > t; })[0], 'year') + '</small></span></div>';
    else if (s.mode === 'after') top = '<div class="count"><span class="num">✓</span><span class="unit">Ujian utama selesai<small>Susulan ' + frange(SUSULAN[0], SUSULAN[1]) + ' · hasil diumumkan ' + fdate(HASIL, 'year') + '</small></span></div>';
    else if (s.mode === 'wait') top = '<div class="count"><span class="num">' + s.n + '</span><span class="unit">hari lagi<small>menuju pengumuman hasil TKA · ' + fdate(HASIL, 'year') + '</small></span></div>';
    else top = '<div class="count"><span class="unit">TKA SMA 2026 sudah selesai<small>Materi dan try out tetap bisa dipakai untuk belajar.</small></span></div>';
    var rows = [0, 1, 2, 3].map(function (k) {
      var subj = daySubj(k), r = dayReady(k), isToday = ex[k] === t, past = ex[k] < t;
      var sj = k < 3 ? '<b>' + esc(DAYINFO[k].t) + '</b><small>' + DAYINFO[k].m + '</small>'
        : (subj.length === 2 ? '<b>' + esc(BY[subj[0]].name) + ' + ' + esc(BY[subj[1]].name) + '</b><small>' + DAYINFO[3].m + ' · <button class="lnk" data-act="pilih">ubah</button></small>'
          : '<b>Dua mapel pilihan</b><small>' + DAYINFO[3].m + ' · <button class="lnk" data-act="pilih">pilih mapelmu</button></small>');
      var open = subj.length ? subj[0] : null;
      return '<div class="dayrow' + (isToday ? ' today' : '') + '"><div class="no" aria-hidden="true">' + (k + 1) + '</div><div class="dt"><b>Hari ' + (k + 1) + (past ? ' ✓' : '') + '</b><small>' + fdate(ex[k], 'short') + '</small></div><div class="sj">' + sj + '</div>' + bubbles(r) +
        '<div class="acts" style="display:flex;gap:6px">' + (open ? '<button class="mini" data-open="' + open + '">Belajar</button>' : '') + '<button class="mini pri" data-tryout="d' + (k + 1) + '">Try out</button></div></div>';
    }).join('');
    return '<section class="sheet-card" aria-label="Kartu kesiapan TKA"><div class="sheet-top"><div><div class="lbl">Kartu kesiapan TKA SMA 2026</div>' + top + '</div><div class="seg" role="group" aria-label="Pilih gelombang">' +
      [1, 2].map(function (g) { return '<button data-gel="' + g + '" class="' + (p.gel === g ? 'on' : '') + '" aria-pressed="' + (p.gel === g) + '">Gelombang ' + g + '</button>'; }).join('') + '</div></div><div class="days">' + rows + '</div>' +
      '<div class="sheet-foot"><span>Bulatan = kesiapan: rata-rata materi yang sudah kamu pahami dan nilai try out terakhir.</span><button class="mini" data-route="info">Jadwal & aturan lengkap</button></div></section>';
  }

  function todayHTML() {
    var l = ST.last && BY[ST.last] ? BY[ST.last] : (ST.last === 'tryout' ? { id: 'tryout', name: 'Try Out' } : null);
    var a = ld(ACT, {}), delta = a.base && a.base.date === today() ? Math.max(0, totalDone() - a.base.d) : 0;
    var nTo = tryHist().filter(function (x) { return new Date(x.t).toDateString() === new Date().toDateString(); }).length;
    var left = '<div class="panel"><h3>' + (l ? 'Lanjutkan ' + esc(l.name) : 'Mulai belajar') + '</h3><p>' + (l ? 'Kembali ke halaman terakhir yang kamu buka.' : 'Mulai dari mapel ujian hari pertama: Bahasa Indonesia.') + '</p>' +
      '<div class="streak"><div><b>' + streak() + '</b><small>hari beruntun</small></div><div><b>+' + delta + '</b><small>subbab hari ini</small></div><div><b>' + nTo + '</b><small>try out hari ini</small></div></div>' +
      '<div class="btn-row"><button class="btn" data-open="' + (l ? l.id : 'bindo') + '">' + (l ? 'Lanjutkan' : 'Buka Bahasa Indonesia') + '</button></div></div>';
    var f = focusList();
    var right = '<div class="panel"><h3>Fokus berikutnya</h3><ul class="focus">' + f.map(function (x) { return '<li><span class="ic" aria-hidden="true">' + x.i + '</span><span>' + x.t + '<small>' + x.s + '</small></span><button class="mini" ' + x.a + '>' + x.b + '</button></li>'; }).join('') + '</ul></div>';
    return '<div class="today-grid">' + left + right + '</div>';
  }
  function focusList() {
    var p = pref(), s = examStatus(), out = [], ex = EXAM[p.gel], t = today();
    var nextK = ex.map(function (d, k) { return d >= t ? k : -1; }).filter(function (k) { return k >= 0; })[0];
    if (nextK != null && (s.mode === 'before' && s.n <= 3 || s.mode === 'during' || s.mode === 'gap')) {
      var k = s.mode === 'during' && nextK === ex.indexOf(t) && nextK < 3 ? nextK + 1 : nextK;
      if (daySubj(k).length) out.push({ i: '⏱️', t: 'Simulasi Hari ' + (k + 1), s: esc(dayName(k)) + ' · ' + fdate(ex[k], 'short'), a: 'data-tryout="d' + (k + 1) + '"', b: 'Mulai' });
    }
    var cand = WAJIB.concat(p.pilihan).map(function (id) { return { id: id, r: ready(id) }; }).sort(function (a, b) { return a.r - b.r; });
    if (cand[0]) out.push({ i: BY[cand[0].id].icon, t: 'Materi ' + esc(BY[cand[0].id].name), s: 'Kesiapan terendah (' + cand[0].r + '%). Selesaikan 2 subbab.', a: 'data-open="' + cand[0].id + '"', b: 'Buka' });
    var weak = cand.filter(function (c) { var sc = lastScore(c.id); return sc != null && sc < 60; })[0];
    if (weak) out.push({ i: '🔁', t: 'Ulangi ' + esc(BY[weak.id].name), s: 'Nilai try out terakhir ' + lastScore(weak.id) + '. Coba latihan kilat 10 soal.', a: 'data-route="tryout"', b: 'Try out' });
    if (!p.pilihan.length) out.push({ i: '✅', t: 'Pilih dua mapel pilihanmu', s: 'Agar Hari 4, rencana, dan try out sesuai.', a: 'data-act="pilih"', b: 'Pilih' });
    else if (out.length < 3 && cand[1]) out.push({ i: BY[cand[1].id].icon, t: 'Materi ' + esc(BY[cand[1].id].name), s: 'Kesiapan ' + cand[1].r + '%.', a: 'data-open="' + cand[1].id + '"', b: 'Buka' });
    return out.slice(0, 3);
  }

  function subjCard(c, wajibDay) {
    var p = prog(c.id), v = Math.min(100, Math.round(p.d / p.t * 100)), mine = pref().pilihan.indexOf(c.id) >= 0, sc = lastScore(c.id);
    var feats = c.id === 'matwajib' ? [['bank', '📝 Bank 600 soal'], ['exam', '⏱️ Simulasi'], ['missions', '🕵️ Studi kasus']]
      : (c.id === 'bindo' || c.id === 'bing') ? [['latihan', '📝 Latihan per teks']] : [['mis', '🕵️ Studi kasus'], ['tree', '🌳 Pohon logika']];
    var tags = (wajibDay ? '<span class="tagc">Hari ' + wajibDay + '</span>' : '<span class="tagc">Hari 4 · pilihan</span>') + (mine ? '<span class="tagc mine">Pilihanmu</span>' : '') + (sc != null ? '<span class="tagc">Try out ' + sc + '</span>' : '');
    return '<article class="sc" style="--sc:' + c.color + '" data-open="' + c.id + '"><div class="ico" aria-hidden="true">' + c.icon + '</div><div><h3>' + esc(c.name) + '</h3><div class="tg">' + tags + '</div></div>' +
      '<p class="desc">' + esc(c.tagline) + '</p><div class="pr"><div class="pbar"><i style="width:' + v + '%"></i></div><small>' + p.d + '/' + p.t + ' subbab dipahami · ' + esc(p.x) + '</small></div>' +
      '<div class="acts"><button class="go" data-open="' + c.id + '">Buka ' + esc(SHORT[c.id]) + '</button></div>' +
      '<details><summary>Bab & fitur</summary><div class="pills">' + c.chapters.map(function (ch) { return '<button class="pill" data-j="' + c.id + '|' + ch.idx + '">' + ch.icon + ' ' + esc(ch.short) + '</button>'; }).join('') + '</div><div class="pills">' + feats.map(function (q) { return '<button class="pill alt" data-n="' + c.id + '|' + q[0] + '">' + q[1] + '</button>'; }).join('') + '</div></details></article>';
  }

  function planHTML() {
    var p = pref(), ex = EXAM[p.gel], t = today(), s = examStatus();
    if (s.mode !== 'before' && s.mode !== 'during' && s.mode !== 'gap') return '';
    var cand = WAJIB.concat(p.pilihan).map(function (id) { return { id: id, r: ready(id) }; }).sort(function (a, b) { return a.r - b.r; });
    var simDone = {}; tryHist().forEach(function (h) { var m = /Simulasi Hari (\d)/.exec(h.label); if (m) simDone[m[1]] = 1; });
    var simQueue = [1, 2, 3, 4].filter(function (k) { return !simDone[k] && (k < 4 || p.pilihan.length === 2); }).concat([1, 2, 3, 4].filter(function (k) { return simDone[k]; }));
    var rows = [], d = t, i = 0;
    while (d <= ex[3] && rows.length < 12) {
      var k = ex.indexOf(d), tasks = [];
      var nk = ex.indexOf(addDays(d, 1));
      if (k >= 0) {
        tasks.push('<span>📝 Ujian Hari ' + (k + 1) + ': ' + esc(dayName(k)) + '</span>');
        if (k < 3) tasks.push('<button data-tryout="d' + (k + 2) + '">Malamnya: latihan kilat untuk Hari ' + (k + 2) + ' (' + esc(dayName(k + 1)) + ')</button>');
        else tasks.push('<span class="x">Selesai. Istirahat, kamu sudah berjuang.</span>');
      } else if (nk === 0) {
        tasks.push('<button data-open="bindo">Ulas ringan Bahasa Indonesia: baca lagi pembahasan soal yang salah</button>');
        tasks.push('<span class="x">Siapkan kartu peserta dan tidur cukup.</span>');
      } else {
        var sim = simQueue.length ? simQueue[i % simQueue.length] : 1, c = cand.length ? cand[i % cand.length] : null;
        tasks.push('<button data-tryout="d' + sim + '">Try out: Simulasi Hari ' + sim + ' (' + esc(dayName(sim - 1)) + ')</button>');
        if (c) tasks.push('<button data-open="' + c.id + '">Materi ' + esc(BY[c.id].name) + ': 2 subbab berikutnya</button>');
        i++;
      }
      rows.push('<li class="' + (d === t ? 'now' : '') + '"><div class="d"><b>' + (d === t ? 'Hari ini' : fdate(d, 'short')) + '</b><small>' + (k >= 0 ? 'hari ujian' : 'H-' + diff(d, ex[0] > d ? ex[0] : ex.filter(function (x) { return x >= d; })[0])) + '</small></div><div class="t">' + tasks.join('') + '</div></li>');
      d = addDays(d, 1);
    }
    if (!rows.length) return '';
    return '<div class="sec-h"><h2>Rencana menuju TKA</h2><span>Disusun dari kesiapanmu · gelombang ' + p.gel + '</span></div><ol class="plan">' + rows.join('') + '</ol>';
  }

  function home() {
    var wajib = WAJIB.map(function (id, i) { return subjCard(BY[id], i + 1); }).join('');
    var p = pref(), pil = PIL.slice().sort(function (a, b) { return (p.pilihan.indexOf(b) >= 0) - (p.pilihan.indexOf(a) >= 0); }).map(function (id) { return subjCard(BY[id], 0); }).join('');
    $('view').innerHTML = '<div class="in">' + heroHTML() + todayHTML() +
      '<div class="search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="q" placeholder="Cari materi di semua mapel: ide pokok, matriks, vektor, kalor, buffer, enzim, inflasi…" aria-label="Cari materi"></div><div class="res" id="res"></div>' +
      '<div class="sec-h"><h2>Mapel wajib</h2><span>Diujikan untuk semua peserta</span></div><div class="subj w">' + wajib + '</div>' +
      '<div class="sec-h"><h2>Mapel pilihan</h2><span>' + (p.pilihan.length === 2 ? 'Pilihanmu ditampilkan lebih dulu' : 'Pilih dua untuk Hari 4') + '</span></div><div class="subj p">' + pil + '</div>' +
      planHTML() + footHTML() + '</div>';
    $('q').addEventListener('input', search);
  }

  function footHTML() {
    return '<footer class="foot"><div><b>TKA ICG</b> · situs belajar mandiri TKA SMA untuk kelas 12, dikelola ' + esc(SITE.maker) + '. Bukan situs resmi Kemendikdasmen, Pusmendik, maupun sekolah.</div>' +
      '<div>Jadwal dirangkum dari pemberitaan Kemendikdasmen (Oktober 2026). Acuan resmi tetap <a href="' + SITE.pusmendik + '" target="_blank" rel="noopener">Pusmendik</a> dan pengumuman sekolahmu.</div>' +
      '<div>Progres tersimpan di perangkat ini. Pindah HP? Pakai Ekspor/Impor di menu Tampilan. · <a href="' + SITE.repo + '" target="_blank" rel="noopener">Kode sumber di GitHub</a> · versi ' + SITE.version + '</div></footer>';
  }

  /* ===== info TKA ===== */
  function info() {
    var t = today(), p = pref();
    var tl = MILESTONES.map(function (m) { var cls = m[1] < t ? 'past' : (m[0] <= t ? 'now' : ''); return '<li class="' + cls + '"><b>' + m[2] + '</b><small>' + frange(m[0], m[1]) + ' 2026' + (cls === 'now' ? ' · sedang berlangsung' : '') + '</small></li>'; }).join('');
    var allPil = ['Matematika Tingkat Lanjut', 'Bahasa Indonesia Tingkat Lanjut', 'Bahasa Inggris Tingkat Lanjut', 'Fisika', 'Kimia', 'Biologi', 'Ekonomi', 'Sosiologi', 'Geografi', 'Sejarah', 'PPKn', 'Antropologi', 'Bahasa Arab', 'Bahasa Prancis', 'Bahasa Jerman', 'Bahasa Jepang', 'Bahasa Korea', 'Bahasa Mandarin'];
    var have = { 'Matematika Tingkat Lanjut': 1, 'Fisika': 1, 'Kimia': 1, 'Biologi': 1, 'Ekonomi': 1 };
    $('view').innerHTML = '<div class="in info"><h1>Info TKA SMA 2026</h1><p class="lead">Ringkasan jadwal, struktur ujian, dan bentuk soal Tes Kemampuan Akademik jenjang SMA/MA. Setiap peserta mengikuti ujian selama empat hari.</p>' +
      '<div class="sec-h"><h2>Jadwal penting</h2><span>Hari ini ' + fdate(t, 'year') + '</span></div><div class="panel"><ol class="tl">' + tl + '</ol><p class="note">Gelombang dan sesi ditentukan sekolah. Jika berhalangan pada jadwal utama, peserta mengikuti ujian susulan.</p></div>' +
      '<div class="sec-h"><h2>Struktur ujian per hari</h2><span>Setiap hari diawali latihan 5 menit</span></div><div style="overflow-x:auto"><table class="tbl"><tr><th>Hari</th><th>Gel. 1</th><th>Gel. 2</th><th>Mata uji</th><th>Soal</th><th>Durasi</th></tr>' +
      [['1', 'Bahasa Indonesia & Literasi', '30', '75 menit', 'Survei Karakter (25 menit)'], ['2', 'Bahasa Inggris', '30', '75 menit', 'Survei Lingkungan Belajar (25 menit)'], ['3', 'Matematika & Numerasi', '25', '75 menit', ''], ['4', 'Mapel pilihan 1 dan mapel pilihan 2', '25 + 25', '60 + 60 menit', '']].map(function (r, i) {
        return '<tr><td><b>' + r[0] + '</b></td><td>' + fdate(EXAM[1][i], 'short') + '</td><td>' + fdate(EXAM[2][i], 'short') + '</td><td>' + r[1] + (r[4] ? '<br><span class="note">+ ' + r[4] + '</span>' : '') + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>';
      }).join('') + '</table></div>' +
      '<div class="sec-h"><h2>Tiga bentuk soal</h2><span>Muncul di semua mata uji</span></div><div class="fmt">' +
      '<div class="panel"><h3>Pilihan ganda</h3><p>Satu jawaban benar dari beberapa pilihan.</p><div class="ex"><div class="o"><i>A</i>2,5</div><div class="o"><i class="f">B</i>3,0</div><div class="o"><i>C</i>3,5</div></div></div>' +
      '<div class="panel"><h3>Pilihan ganda kompleks</h3><p>Jawaban benar lebih dari satu. Semua yang benar harus dipilih.</p><div class="ex"><div class="o"><i class="sq f">✓</i>Pernyataan 1</div><div class="o"><i class="sq"></i>Pernyataan 2</div><div class="o"><i class="sq f">✓</i>Pernyataan 3</div></div></div>' +
      '<div class="panel"><h3>Kategori</h3><p>Setiap pernyataan diberi satu kategori, misalnya Benar/Salah atau Fakta/Opini.</p><div class="ex"><table><tr><th style="text-align:left">Pernyataan</th><th>Benar</th><th>Salah</th></tr><tr><td>Pernyataan 1</td><td style="text-align:center">●</td><td style="text-align:center">○</td></tr><tr><td>Pernyataan 2</td><td style="text-align:center">○</td><td style="text-align:center">●</td></tr></table></div></div></div>' +
      '<div class="sec-h"><h2>Apa yang diukur</h2></div><div class="today-grid" style="margin-top:0"><div class="panel"><h3>Bahasa Indonesia & Bahasa Inggris</h3><p>Kemampuan membaca pada tiga level: <b>pemahaman kontekstual</b>, <b>pemahaman inferensial</b>, dan <b>evaluasi & apresiasi</b>. Bacaan berupa teks informasi (tunggal dan jamak, termasuk tabel) dan teks fiksi. Bahasa Inggris memakai teks descriptive, recount, narrative, procedure, dan analytical exposition setara CEFR A2–B1.</p></div>' +
      '<div class="panel"><h3>Matematika</h3><p>Lima domain: <b>Bilangan</b>, <b>Aljabar</b>, <b>Geometri & Pengukuran</b>, <b>Trigonometri</b>, serta <b>Data & Peluang</b>. Kompetensi yang diukur meliputi pengetahuan, representasi, penalaran, pemecahan masalah, dan koneksi matematis.</p></div></div>' +
      '<div class="sec-h"><h2>18 mapel pilihan SMA/MA</h2><span>Peserta memilih dua</span></div><div class="panel"><ul class="cols">' + allPil.map(function (x) { return '<li class="' + (have[x] ? 'have' : '') + '">' + x + (have[x] ? ' ✓' : '') + '</li>'; }).join('') + '</ul><p class="note">Bertanda ✓ sudah tersedia materi dan try out di situs ini. Peserta SMK mengambil Produk/Projek Kreatif dan Kewirausahaan sebagai pilihan pertama.</p></div>' +
      '<div class="sec-h"><h2>Persiapan hari-H</h2></div><div class="panel"><ul style="margin:0;padding-left:1.2em"><li>Datang lebih awal dan bawa kartu peserta sesuai ketentuan sekolah.</li><li>Pada hari ujian, ulas ringan saja. Jangan mempelajari bab baru.</li><li>Bagi waktu: ±2,5 menit per soal pada mapel wajib, ±2,4 menit pada mapel pilihan.</li><li>Tandai ragu-ragu, lanjutkan, lalu kembali di 5 menit terakhir.</li><li>Pada soal pilihan ganda kompleks, periksa setiap pernyataan sampai habis.</li></ul></div>' +
      '<div class="sec-h"><h2>Sumber</h2></div><div class="panel"><p>Jadwal: rilis Kemendikdasmen sebagaimana diberitakan Medcom, Warta Ekonomi, dan Brain Academy (Juli–Oktober 2026). Kisi-kisi: Pusmendik. <a href="' + SITE.pusmendik + '" target="_blank" rel="noopener">Buka laman TKA Pusmendik</a>. Jika ada perbedaan, ikuti pengumuman resmi Pusmendik dan sekolah.</p></div>' +
      footHTML() + '</div>';
  }

  /* ===== pencarian ===== */
  var MATCH = [];
  function search(e) {
    var q = e.target.value.toLowerCase().trim(), r = $('res');
    if (!q) { r.classList.remove('on'); r.innerHTML = ''; return; }
    MATCH = [];
    CAT.forEach(function (s) { s.chapters.forEach(function (c) { c.subs.forEach(function (u) { if ((s.name + ' ' + c.title + ' ' + u.code + ' ' + u.title + ' ' + u.kw).toLowerCase().indexOf(q) >= 0) MATCH.push({ s: s, c: c, u: u }); }); }); });
    r.classList.add('on');
    r.innerHTML = MATCH.length ? '<h2>' + MATCH.length + ' subbab ditemukan</h2><div class="rg">' + MATCH.slice(0, 30).map(function (m, i) { return '<button class="ri" style="--sc:' + m.s.color + '" data-r="' + i + '"><small>' + m.s.icon + ' ' + esc(m.s.name) + ' · ' + esc(m.c.short || m.c.title) + '</small><b>' + esc(m.u.code) + ' ' + esc(m.u.title) + '</b></button>'; }).join('') + '</div>'
      : '<div class="panel"><p>Tidak ada subbab yang cocok. Coba kata lain, misalnya fakta opini, matriks, limit, vektor, kalor, buffer, enzim, atau inflasi.</p></div>';
  }

  /* ===== navigasi & panggung ===== */
  var frames = {}, pend = {}, ROUTE = { name: 'home' };
  var APPNAME = { tryout: 'Try Out' };
  function drawNav() {
    var item = function (id, ic, lab) { return '<button data-t="' + id + '"' + (BY[id] ? ' style="--sc:' + BY[id].color + '"' : '') + '><span class="ni" aria-hidden="true">' + ic + '</span><span class="nl">' + lab + '</span></button>'; };
    $('nav').innerHTML = item('home', '🏠', 'Beranda') + item('tryout', '⏱️', 'Try Out') + item('info', '🗓️', 'Info TKA') + '<span class="sep"></span>' +
      WAJIB.map(function (id) { return item(id, BY[id].icon, SHORT[id]); }).join('') + '<span class="sep"></span>' + PIL.map(function (id) { return item(id, BY[id].icon, SHORT[id]); }).join('');
    markNav();
  }
  function markNav() { var cur = ROUTE.name === 'app' ? ROUTE.id : ROUTE.name; document.querySelectorAll('#nav button').forEach(function (b) { var on = b.dataset.t === cur; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }); }

  function applySet() {
    var r = document.documentElement;
    r.dataset.skin = skin(); r.dataset.nav = ST.nav === 'side' && innerWidth < 720 ? 'bottom' : ST.nav; r.dataset.fs = ST.fs;
    var tc = getComputedStyle(r).getPropertyValue('--card').trim(); var m = document.querySelector('meta[name=theme-color]'); if (m && tc) m.content = tc;
    document.body.classList.toggle('bar-hidden', ST.barHidden && ROUTE.name === 'app');
    Object.keys(frames).forEach(syncFrame);
  }
  function syncFrame(id) {
    var f = $('frame-' + id); if (!f || frames[id] !== 'ready') return;
    try { var w = f.contentWindow, s = skin(), sk = s === 'kertas' ? 'senja' : s;
      if (id === 'matwajib' && w.setSkin) w.setSkin(sk); else if (w.setTh) w.setTh(sk);
      if (w.setFs) w.setFs({ s: 0.9, m: 1, l: 1.15 }[ST.fs]);
    } catch (e) {}
  }
  function ensureFrame(id) {
    var f = $('frame-' + id);
    if (f) return f;
    f = document.createElement('iframe');
    f.className = 'fr'; f.id = 'frame-' + id; f.title = id === 'tryout' ? 'Try Out TKA' : BY[id].name;
    f.setAttribute('allow', 'fullscreen');
    frames[id] = 'loading'; $('loading').classList.add('on');
    f.addEventListener('load', function () {
      frames[id] = 'ready'; $('loading').classList.remove('on'); syncFrame(id);
      try { f.contentDocument.addEventListener('click', function () { setTimeout(refreshBadges, 120); }); } catch (e) {}
      if (pend[id]) { var fn = pend[id]; delete pend[id]; try { fn(f.contentWindow); } catch (e) {} }
    });
    f.src = 'apps/' + id + '.html';
    $('stage').appendChild(f);
    return f;
  }
  function showApp(id, cb) {
    ST.last = id; save(); touch();
    $('view').style.display = 'none'; $('stage').classList.add('on');
    var f = ensureFrame(id);
    document.querySelectorAll('.fr').forEach(function (x) { x.classList.toggle('on', x === f); });
    applySet();
    if (cb) { if (frames[id] === 'ready') { try { cb(f.contentWindow); } catch (e) {} } else pend[id] = cb; }
    document.title = (id === 'tryout' ? 'Try Out' : BY[id].name) + ' · TKA ICG';
  }
  function showPage(fn, title) {
    $('stage').classList.remove('on'); $('view').style.display = 'block'; ST.barHidden = false; applySet(); fn(); scrollTo(0, 0);
    document.title = title;
  }

  function route() {
    var h = decodeURIComponent((location.hash || '').replace(/^#\/?/, '')), parts = h.split('/');
    if (!h || h === 'beranda') { ROUTE = { name: 'home' }; showPage(home, 'TKA ICG — Belajar TKA SMA 2026 Kelas 12'); }
    else if (parts[0] === 'info') { ROUTE = { name: 'info' }; showPage(info, 'Info TKA SMA 2026 · TKA ICG'); }
    else if (parts[0] === 'tryout') { ROUTE = { name: 'app', id: 'tryout' }; var d = parts[1]; showApp('tryout', d ? function (w) { if (w.showHub) w.showHub(d); } : null); }
    else if (parts[0] === 'm' && BY[parts[1]]) {
      var id = parts[1], x = parts[2], y = parts[3]; ROUTE = { name: 'app', id: id };
      var cb = null;
      if (x === 'f' && y) cb = function (w) { if (id === 'matwajib' && w.go) w.go(y); else if (w.showHub) w.showHub(y); };
      else if (x && /^\d+(\.\d+)?$/.test(x)) { var c = +x.split('.')[0], s = +(x.split('.')[1] || 0); cb = function (w) { if (id === 'matwajib' && w.openChapter) w.openChapter(c, s); else if (w.go) w.go(c, s); }; }
      showApp(id, cb);
    } else { ROUTE = { name: 'home' }; showPage(home, 'TKA ICG — Belajar TKA SMA 2026 Kelas 12'); }
    markNav();
  }
  function nav(h) { if (location.hash === '#/' + h || (h === '' && (location.hash === '' || location.hash === '#/'))) route(); else location.hash = '/' + h; }

  function refreshBadges() { if (ROUTE.name === 'home' && $('view').style.display !== 'none') { var q = $('q') && $('q').value; home(); if (q) { $('q').value = q; search({ target: $('q') }); } } }

  /* ===== pengaturan ===== */
  var SK = [['auto', 'Otomatis', 'linear-gradient(90deg,#f6f7f5 50%,#15171c 50%)'], ['terang', 'Terang', '#b8285e'], ['gelap', 'Gelap', '#1d2027'], ['laut', 'Laut', '#0e6f8a'], ['hutan', 'Hutan', '#2f7a45'], ['senja', 'Senja', '#b4461b'], ['neon', 'Neon', '#a78bfa']];
  var OPT = { nav: [['top', 'Atas'], ['bottom', 'Bawah'], ['side', 'Samping']], fs: [['s', 'A−'], ['m', 'A'], ['l', 'A+']] };
  var installEvt = null;
  function sheet(focus) {
    var p = pref();
    var g = function (t, k) { return '<div class="grp"><h4>' + t + '</h4><div class="seg">' + OPT[k].map(function (o) { return '<button data-s="' + k + '|' + o[0] + '" class="' + (ST[k] === o[0] ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</div></div>'; };
    $('dlg').innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><div><h2 id="dlgT">Tampilan & data</h2><p>Tersimpan otomatis di perangkat ini.</p></div><button class="ib" data-x="1" aria-label="Tutup">✕</button></div>' +
      '<div class="grp" id="grp-pil"><h4>Mapel pilihan (Hari 4)</h4><div class="chips">' + PIL.map(function (x) { var on = p.pilihan.indexOf(x) >= 0; return '<button class="chip ' + (on ? 'on' : '') + '" data-pil="' + x + '" aria-pressed="' + on + '">' + BY[x].icon + ' ' + SHORT[x] + '</button>'; }).join('') + '</div><p>' + (p.pilihan.length === 2 ? 'Dua mapel terpilih.' : 'Pilih tepat dua mapel.') + '</p></div>' +
      '<div class="grp"><h4>Gelombang ujian</h4><div class="seg">' + [1, 2].map(function (x) { return '<button data-gel="' + x + '" class="' + (p.gel === x ? 'on' : '') + '">Gelombang ' + x + ' · ' + frange(EXAM[x][0], EXAM[x][3]) + '</button>'; }).join('') + '</div></div>' +
      '<div class="grp"><h4>Tema warna</h4><div class="sw">' + SK.map(function (k) { return '<button data-s="skin|' + k[0] + '" class="' + (ST.skin === k[0] ? 'on' : '') + '"><i style="background:' + k[2] + '"></i>' + k[1] + '</button>'; }).join('') + '</div></div>' +
      g('Posisi navigasi', 'nav') + g('Ukuran teks', 'fs') +
      '<div class="grp"><h4>Data progres</h4><div class="drow"><button data-d="export">⬇️ Ekspor progres</button><button data-d="import">⬆️ Impor progres</button><button data-d="reset">🗑️ Hapus progres</button></div><p>Ekspor menghasilkan file .json yang bisa diimpor di HP atau laptop lain.</p></div>' +
      '<div class="grp"><h4>Offline & aplikasi</h4><div class="drow"><button data-d="offline">📥 Simpan semua materi untuk offline</button>' + (installEvt ? '<button data-d="install">📲 Pasang sebagai aplikasi</button>' : '') + '</div><p>Setelah disimpan, situs tetap bisa dibuka tanpa internet di perangkat ini.</p></div>';
    $('sheet').classList.add('on');
    if (focus === 'pilihan') { var gp = $('grp-pil'); gp.scrollIntoView({ block: 'center' }); }
  }
  function closeSheet() { $('sheet').classList.remove('on'); }

  function exportData() {
    var out = {}; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (OWN.test(k)) out[k] = localStorage.getItem(k); }
    var blob = new Blob([JSON.stringify({ app: 'tka-icg', version: 1, exported: new Date().toISOString(), data: out }, null, 1)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'progres-tka-icg-' + today() + '.json'; document.body.appendChild(a); a.click(); a.remove();
    toast('Progres diekspor (' + Object.keys(out).length + ' data).');
  }
  function importData() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () {
        try { var j = JSON.parse(r.result); if (j.app !== 'tka-icg' || !j.data) throw new Error('format');
          var n = 0; Object.keys(j.data).forEach(function (k) { if (OWN.test(k)) { localStorage.setItem(k, j.data[k]); n++; } });
          toast(n + ' data progres diimpor. Memuat ulang…'); setTimeout(function () { location.reload(); }, 900);
        } catch (e) { toast('File tidak dikenali. Pilih file hasil Ekspor progres TKA ICG.'); }
      };
      r.readAsText(f);
    };
    inp.click();
  }
  function resetData() {
    if (!confirm('Hapus semua progres belajar, nilai try out, dan pengaturan di perangkat ini? Tindakan ini tidak bisa dibatalkan. Ekspor dulu bila ingin menyimpan cadangan.')) return;
    var ks = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (OWN.test(k)) ks.push(k); }
    ks.forEach(function (k) { localStorage.removeItem(k); }); location.reload();
  }
  function cacheAll() {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) { toast('Fitur offline aktif setelah situs dibuka lewat alamat web (https) dan dimuat ulang sekali.'); return; }
    navigator.serviceWorker.controller.postMessage({ type: 'cache-all' }); toast('Mengunduh semua materi untuk offline…');
  }

  /* ===== event ===== */
  document.addEventListener('click', function (e) {
    var t = e.target;
    var nb = t.closest('#nav button'); if (nb) { var id = nb.dataset.t; return nav(id === 'home' ? '' : id === 'info' ? 'info' : id === 'tryout' ? 'tryout' : 'm/' + id); }
    var el = t.closest('[data-open],[data-tryout],[data-route],[data-j],[data-n],[data-r],[data-s],[data-x],[data-gel],[data-pil],[data-d],[data-act]');
    if (!el) return;
    var d = el.dataset;
    if (d.s) { var kv = d.s.split('|'); ST[kv[0]] = kv[1]; save(); applySet(); return sheet(); }
    if (d.x) return closeSheet();
    if (d.gel) { var p = pref(); p.gel = +d.gel; setPref(p); if ($('sheet').classList.contains('on')) sheet(); if (ROUTE.name !== 'app') route(); return; }
    if (d.pil) { var q = pref(), i = q.pilihan.indexOf(d.pil); if (i >= 0) q.pilihan.splice(i, 1); else { q.pilihan.push(d.pil); if (q.pilihan.length > 2) q.pilihan.shift(); } setPref(q); sheet('pilihan'); if (ROUTE.name !== 'app') route(); return; }
    if (d.d) { if (d.d === 'export') return exportData(); if (d.d === 'import') return importData(); if (d.d === 'reset') return resetData(); if (d.d === 'offline') return cacheAll(); if (d.d === 'install' && installEvt) { installEvt.prompt(); installEvt = null; return closeSheet(); } return; }
    if (d.act === 'pilih') return sheet('pilihan');
    if (d.route) return nav(d.route);
    if (d.tryout) return nav('tryout/' + d.tryout);
    if (d.r != null && MATCH[+d.r]) { var m = MATCH[+d.r]; return nav('m/' + m.s.id + '/' + m.c.idx + '.' + m.u.idx); }
    if (d.j) { var a = d.j.split('|'); return nav('m/' + a[0] + '/' + a[1] + '.0'); }
    if (d.n) { var b = d.n.split('|'); return nav('m/' + b[0] + '/f/' + b[1]); }
    if (d.open) { if (t.closest('details') && !t.closest('[data-j],[data-n]') && el.tagName === 'ARTICLE') return; return nav(d.open === 'tryout' ? 'tryout' : 'm/' + d.open); }
  });
  $('sheet').addEventListener('click', function (e) { if (e.target === $('sheet')) closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); if (e.key === '/' && ROUTE.name === 'home' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $('q').focus(); } });
  $('btnHome').onclick = function () { nav(''); };
  $('btnSet').onclick = function () { sheet(); };
  $('btnSearch').onclick = function () { nav(''); setTimeout(function () { var q = $('q'); if (q) { q.focus(); q.scrollIntoView({ block: 'center' }); } }, 60); };
  $('btnFull').onclick = function () { if (ROUTE.name !== 'app') nav('m/' + (ST.last && BY[ST.last] ? ST.last : 'bindo')); ST.barHidden = true; applySet(); };
  $('btnRestore').onclick = function () { ST.barHidden = false; applySet(); };
  addEventListener('hashchange', route);
  addEventListener('resize', function () { var want = ST.nav === 'side' && innerWidth < 720 ? 'bottom' : ST.nav; if (document.documentElement.dataset.nav !== want) applySet(); });
  addEventListener('storage', function (e) { if (e.key && OWN.test(e.key)) { clearTimeout(refreshBadges.h); refreshBadges.h = setTimeout(refreshBadges, 400); } });
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySet); } catch (e) {}
  addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; });

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname)) {
    addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.type === 'cached') toast('Selesai: ' + e.data.n + ' file tersimpan untuk offline.'); });
  }

  touch(); drawNav(); applySet(); route();
})();
