/* Mesin modul literasi TKA ICG — dipakai apps/bindo.html dan apps/bing.html.
   Data: ../data/<mod>.js (window.TKA_DATA[mod]). Progres: localStorage dengan awalan litBindo / litBing. */
(function () {
  'use strict';
  var MOD = document.body.dataset.mod;
  var P = { bindo: 'litBindo', bing: 'litBing' }[MOD];
  var $ = function (id) { return document.getElementById(id); };
  var LET = 'ABCDE';
  function ld(k, d) { try { var v = JSON.parse(localStorage.getItem(P + k)); return v == null ? d : v; } catch (e) { return d; } }
  function sv(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function strip(h) { return String(h || '').replace(/<[^>]+>/g, ' '); }

  var D, DN = ld('DN', {}), QZ = ld('QZ', {}), LAST = ld('Last', null), TH = ld('Th', 'auto'), FS = ld('FS', 1);
  var view = 'home', cur = 0, sub = 0, ANS = {};
  var STIM = [], ITEMS_BY = {}, TOTAL = 0;
  var EN = MOD === 'bing';
  var T = EN ? { check: 'Check answer', right: 'Correct.', wrong: 'Not quite.', more: 'Choose every correct answer.', key: 'Answer' }
             : { check: 'Periksa jawaban', right: 'Tepat.', wrong: 'Belum tepat.', more: 'Pilih semua jawaban yang benar.', key: 'Kunci' };

  function init(data) {
    D = data;
    TOTAL = D.chapters.reduce(function (a, c) { return a + c.S.length; }, 0);
    STIM = D.stimuli.slice();
    D.items.forEach(function (it) {
      var k = it.stim || (MOD + '-lepas');
      (ITEMS_BY[k] = ITEMS_BY[k] || []).push(it);
    });
    if (ITEMS_BY[MOD + '-lepas']) STIM.push({ id: MOD + '-lepas', title: 'Soal Kebahasaan Lepas', type: 'Kata baku, EYD, kalimat efektif, konjungsi', text: '' });
    document.documentElement.style.setProperty('--m1', D.color);
    setTh(TH, true);
    document.body.style.fontSize = 17 * FS + 'px';
    side();
    var h = (location.hash || '').slice(1);
    if (/^t:/.test(h)) prac(h.slice(2)); else if (/^\d+\.\d+$/.test(h)) { var p = h.split('.'); go(+p[0], +p[1]); } else if (h === 'latihan') showHub('latihan'); else home();
  }

  /* ---------- tema & ukuran (dipanggil portal) ---------- */
  function setTh(n, quiet) {
    TH = n || 'auto';
    if (TH === 'kertas') TH = 'senja';
    if (TH === 'auto') document.documentElement.removeAttribute('data-skin'); else document.documentElement.setAttribute('data-skin', TH);
    if (!quiet) sv('Th', TH);
  }
  function setFs(v) { FS = +v || 1; sv('FS', FS); document.body.style.fontSize = 17 * FS + 'px'; }

  /* ---------- progres ---------- */
  function doneCount() { return Object.keys(DN).filter(function (k) { return DN[k]; }).length; }
  function chDone(i) { return D.chapters[i].S.filter(function (s, j) { return DN[i + '.' + j]; }).length; }
  function ring(pct) {
    return '<svg class="ring" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="9"/><circle cx="40" cy="40" r="33" fill="none" stroke="#fde68a" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + (pct * 2.073).toFixed(1) + ' 208" transform="rotate(-90 40 40)"/><text x="40" y="46" text-anchor="middle" font-size="17" font-weight="800" fill="#fff">' + pct + '%</text></svg>';
  }

  function side() {
    $('side').innerHTML = D.chapters.map(function (c, i) {
      var d = chDone(i);
      return '<button class="ch ' + (view === 'ch' && cur === i ? 'on' : '') + '" style="--c:' + c.c + '" data-go="' + i + '.0"><span class="em">' + c.e + '</span><span class="tx"><b>' + esc(c.n) + '</b><small>' + d + '/' + c.S.length + ' dipahami' + '</small></span><span class="bar"><u style="width:' + (d / c.S.length * 100) + '%"></u></span></button>';
    }).join('') + '<button class="ch ' + (view === 'hub' || view === 'prac' ? 'on' : '') + '" style="--c:' + D.color + '" data-hub="1"><span class="em">📝</span><span class="tx"><b>' + 'Latihan per teks' + '</b><small>' + Object.keys(QZ).length + '/' + STIM.length + ' teks dikerjakan' + '</small></span></button>';
  }

  /* ---------- beranda ---------- */
  function home() {
    view = 'home'; side();
    var dn = doneCount(), pct = Math.round(dn / TOTAL * 100);
    var answered = Object.keys(QZ).length, sumB = 0, sumN = 0;
    Object.keys(QZ).forEach(function (k) { sumB += QZ[k].b; sumN += QZ[k].n; });
    var acc = sumN ? Math.round(sumB / sumN * 100) : null;
    var last = LAST && D.chapters[LAST[0]] ? LAST : null;
    var nextStim = STIM.filter(function (s) { return !QZ[s.id]; })[0] || STIM[0];
    var html = '<section class="hero" style="--c:' + D.color + '">' + ring(pct) + '<div><small>' + 'TKA · HARI ' + D.exam.day + ' · ' + D.exam.n + ' SOAL · ' + D.exam.min + ' MENIT' + '</small><h1>' + esc(D.name) + '</h1><p>' + 'Kamu sudah memahami ' + dn + ' dari ' + TOTAL + ' subbab.' + '</p><div class="chips"><span>' + D.count + ' soal' + '</span><span>' + STIM.length + ' teks' + '</span><span>' + answered + ' teks dikerjakan' + '</span>' + (acc != null ? '<span>' + 'ketepatan ' + acc + '%</span>' : '') + '</div></div></section>';
    html += '<div class="row"><button class="btn" data-go="' + (last ? last[0] + '.' + last[1] : '0.0') + '">▶ ' + (last ? 'Lanjutkan: ' + esc(D.chapters[last[0]].S[last[1]].t) : 'Mulai dari subbab pertama') + '</button><button class="btn alt" data-prac="' + nextStim.id + '">📝 ' + 'Latihan: ' + esc(nextStim.title) + '</button></div>';
    html += '<h2 class="sec">' + '📚 Materi' + '</h2><div class="grid">' + D.chapters.map(function (c, i) {
      var d = chDone(i);
      return '<button class="cd" style="--c:' + c.c + '" data-go="' + i + '.0"><small>' + c.e + ' ' + 'Bab ' + (i + 1) + '</small><b>' + esc(c.n) + '</b><span>' + esc(c.i) + '</span><div class="pb"><i style="width:' + (d / c.S.length * 100) + '%"></i></div></button>';
    }).join('') + '</div>';
    html += '<h2 class="sec">' + '📝 Latihan per teks' + '</h2>' + stimGrid();
    $('m').innerHTML = html; scrollTo(0, 0);
  }

  function stimGrid(list) {
    list = list || STIM;
    return '<div class="grid">' + list.map(function (s) {
      var n = (ITEMS_BY[s.id] || []).length, q = QZ[s.id];
      return '<button class="cd" data-prac="' + s.id + '"><small>' + esc(s.type) + '</small><b>' + esc(s.title) + '</b><span>' + n + ' soal' + (q ? ' · ' + 'terbaik ' + q.b + '/' + q.n : '') + '</span>' + (q ? '<div class="pb"><i style="width:' + (q.b / q.n * 100) + '%"></i></div>' : '') + '</button>';
    }).join('') + '</div>';
  }

  function showHub() {
    view = 'hub'; side();
    $('m').innerHTML = '<section class="hero" style="--c:' + D.color + '"><div class="hemo">📝</div><div><small>' + 'LATIHAN' + '</small><h1>' + 'Latihan per teks' + '</h1><p>' + 'Setiap teks berisi 3–5 soal format TKA dengan pembahasan langsung setelah menjawab.' + '</p></div></section><div style="height:14px"></div>' + stimGrid();
    scrollTo(0, 0);
  }

  /* ---------- materi ---------- */
  function compOf(c) {
    var n = c.n.toLowerCase();
    if (/kontekstual|contextual/.test(n)) return 'Pemahaman Kontekstual';
    if (/inferensial|inferential/.test(n)) return 'Pemahaman Inferensial';
    if (/evaluasi|evaluation/.test(n)) return 'Evaluasi & Apresiasi';
    return null;
  }
  function related(i) {
    var comp = compOf(D.chapters[i]);
    var sc = STIM.map(function (s) {
      var its = ITEMS_BY[s.id] || [];
      var m = comp ? its.filter(function (x) { return x.comp === comp; }).length : its.length;
      if (/jamak|tabel|data/i.test(D.chapters[i].n)) m = /jamak|tabel/i.test(s.type) ? 9 : 0;
      return { s: s, m: m - (QZ[s.id] ? 0.5 : 0) };
    }).filter(function (x) { return x.m > 0; }).sort(function (a, b) { return b.m - a.m; });
    return sc.slice(0, 4).map(function (x) { return x.s; });
  }
  function go(i, j) {
    i = Math.max(0, Math.min(D.chapters.length - 1, +i || 0));
    var c = D.chapters[i]; j = Math.max(0, Math.min(c.S.length - 1, +j || 0));
    view = 'ch'; cur = i; sub = j; LAST = [i, j]; sv('Last', LAST); side();
    var s = c.S[j], key = i + '.' + j, dn = !!DN[key];
    var h = '<section class="hero" style="--c:' + c.c + '"><div class="hemo">' + c.e + '</div><div><small>' + 'BAB ' + (i + 1) + ' DARI ' + D.chapters.length + '</small><h1>' + esc(c.n) + '</h1><p>' + esc(c.i) + '</p></div></section>';
    h += '<nav class="snav" style="--c:' + c.c + '">' + c.S.map(function (t, k) { return '<button class="sn ' + (k === j ? 'on' : '') + '" data-go="' + i + '.' + k + '"><b>' + (i + 1) + '.' + (k + 1) + '</b><span>' + esc(t.t) + '</span>' + (DN[i + '.' + k] ? '<em>✓</em>' : '') + '</button>'; }).join('') + '</nav>';
    h += '<article style="--c:' + c.c + '"><h2 class="st"><i>' + (i + 1) + '.' + (j + 1) + '</i>' + esc(s.t) + '</h2>';
    h += '<div class="cb k"><b>💡 ' + 'Konsep' + '</b>' + s.konsep + '</div>';
    if (s.langkah) h += '<div class="cb l"><b>🧭 Langkah</b><ol>' + s.langkah.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol></div>';
    if (s.contoh) h += '<div class="cb x"><b>📝 Contoh</b>' + s.contoh + '</div>';
    if (s.jebakan) h += '<div class="cb j"><b>⚠️ Jebakan</b>' + s.jebakan + '</div>';
    h += '<button class="done ' + (dn ? 'on' : '') + '" data-done="' + key + '">' + (dn ? '✓ ' + 'Sudah paham' : '☐ ' + 'Tandai sudah paham') + '</button>';
    var rel = related(i);
    if (rel.length) h += '<h2 class="sec">🎯 ' + 'Latih di teks ini' + '</h2>' + stimGrid(rel);
    var prev = j > 0 ? [i, j - 1] : (i > 0 ? [i - 1, D.chapters[i - 1].S.length - 1] : null);
    var next = j < c.S.length - 1 ? [i, j + 1] : (i < D.chapters.length - 1 ? [i + 1, 0] : null);
    h += '<div class="pn"><button ' + (prev ? 'data-go="' + prev.join('.') + '"' : 'disabled') + '>← ' + (prev ? esc(D.chapters[prev[0]].S[prev[1]].t) : '') + '</button><button ' + (next ? 'data-go="' + next.join('.') + '"' : 'disabled') + '>' + (next ? esc(D.chapters[next[0]].S[next[1]].t) : '') + ' →</button></div></article>';
    $('m').innerHTML = h; scrollTo(0, 0);
  }

  /* ---------- latihan ---------- */
  function stem(it) {
    var lab = it.kind === 'multi' ? '<div class="muted" style="font-size:.85rem">' + T.more + '</div>' : '';
    return '<div class="stem">' + it.stem + lab + '</div>';
  }
  function itemHTML(it, n, st) {
    var a = st[it.id] || {}, done = !!a.done, h = '<div class="qc" id="qc-' + it.id + '"><div class="qh"><span>' + (EN ? 'Question ' : 'Soal ') + n + '</span><span>' + esc(it.comp) + '</span></div>' + stem(it);
    if (it.kind === 'pg') {
      h += it.options.map(function (o, k) {
        var cls = done ? (k === it.key[0] ? 'ok' : (k === a.sel ? 'no' : '')) : '';
        return '<button class="op ' + cls + '" data-ans="' + it.id + '|' + k + '" ' + (done ? 'disabled' : '') + '><span class="lt">' + LET[k] + '</span><span>' + o + '</span></button>';
      }).join('');
    } else if (it.kind === 'multi') {
      var sel = a.sel || [];
      h += it.options.map(function (o, k) {
        var on = sel.indexOf(k) >= 0, cls = done ? (it.key.indexOf(k) >= 0 ? 'ok' : (on ? 'no' : '')) : (on ? 'sel' : '');
        return '<button class="op ' + cls + (on ? ' sel' : '') + '" data-tog="' + it.id + '|' + k + '" ' + (done ? 'disabled' : '') + ' aria-pressed="' + on + '"><span class="ck">' + (on ? '✓' : '') + '</span><span>' + o + '</span></button>';
      }).join('');
      if (!done) h += '<button class="chk" data-chk="' + it.id + '" ' + (sel.length ? '' : 'disabled') + '>' + T.check + '</button>';
    } else {
      var rs = a.sel || [];
      h += '<table class="bst"><tr><th style="text-align:left">' + (EN ? 'Statement' : 'Pernyataan') + '</th>' + it.labels.map(function (l) { return '<th>' + esc(l) + '</th>'; }).join('') + '</tr>' +
        it.options.map(function (o, r) {
          var cls = done ? (rs[r] === it.key[r] ? 'ok' : 'no') : '';
          return '<tr class="' + cls + '"><td>' + o + (done && rs[r] !== it.key[r] ? '<div class="muted" style="font-size:.8rem">' + T.key + ': ' + esc(it.labels[it.key[r]]) + '</div>' : '') + '</td>' + it.labels.map(function (l, c) {
            var idn = 'r-' + it.id + '-' + r + '-' + c;
            return '<td class="c"><input type="radio" id="' + idn + '" name="r-' + it.id + '-' + r + '" data-bs="' + it.id + '|' + r + '|' + c + '" ' + (rs[r] === c ? 'checked' : '') + ' ' + (done ? 'disabled' : '') + '><label for="' + idn + '" title="' + esc(l) + '">' + (rs[r] === c ? '●' : '') + '</label></td>';
          }).join('') + '</tr>';
        }).join('') + '</table>';
      if (!done) h += '<button class="chk" data-chk="' + it.id + '" ' + (rs.filter(function (x) { return x != null; }).length === it.options.length ? '' : 'disabled') + '>' + T.check + '</button>';
    }
    if (done) { var ok = correct(it, a.sel); h += '<div class="fb ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? '✅ ' + T.right : '❌ ' + T.wrong) + '</b>' + it.why + '</div>'; }
    return h + '</div>';
  }
  function correct(it, sel) {
    if (it.kind === 'pg') return sel === it.key[0];
    if (it.kind === 'multi') { sel = (sel || []).slice().sort(); var k = it.key.slice().sort(); return sel.length === k.length && sel.every(function (v, i) { return v === k[i]; }); }
    return (sel || []).length === it.key.length && it.key.every(function (v, i) { return sel[i] === v; });
  }
  function prac(sid) {
    var s = STIM.filter(function (x) { return x.id === sid; })[0]; if (!s) return showHub();
    view = 'prac'; side();
    var st = ANS[sid] = ANS[sid] || {}, its = ITEMS_BY[sid] || [];
    var h = '<section class="hero" style="--c:' + D.color + ';padding:16px 22px"><div class="hemo" style="font-size:2.2rem">📝</div><div><small>' + esc(s.type).toUpperCase() + '</small><h1 style="font-size:1.4rem">' + esc(s.title) + '</h1><p>' + its.length + ' soal · jawab lalu baca pembahasannya' + '</p></div></section>';
    var qs = '<div class="qs">' + its.map(function (it, n) { return itemHTML(it, n + 1, st); }).join('') + '<div id="sum"></div></div>';
    if (s.text) h += '<div class="prac"><div><div class="txt fold" id="txt"><h3>' + esc(s.title) + '</h3><div class="ty">' + esc(s.type) + '</div>' + s.text + '<div class="nt">' + esc(s.note || '') + '</div></div><div class="tabs"><button data-unfold="1">' + 'Tampilkan teks lengkap ▾' + '</button></div></div>' + qs + '</div>';
    else h += '<div style="max-width:760px;margin-top:14px">' + qs + '</div>';
    h += '<div class="pn" style="margin-top:18px"><button data-hub="1">← ' + 'Semua teks' + '</button><button data-reset="' + sid + '">↺ ' + 'Ulangi teks ini' + '</button></div>';
    $('m').innerHTML = h; summary(sid); scrollTo(0, 0);
  }
  function rerender(it) {
    var sid = it.stim || (MOD + '-lepas'), its = ITEMS_BY[sid], n = its.indexOf(it) + 1;
    var el = $('qc-' + it.id); if (el) el.outerHTML = itemHTML(it, n, ANS[sid]);
    summary(sid);
  }
  function summary(sid) {
    var its = ITEMS_BY[sid] || [], st = ANS[sid] || {};
    var done = its.filter(function (it) { return st[it.id] && st[it.id].done; });
    var el = $('sum'); if (!el) return;
    if (done.length < its.length) { el.innerHTML = '<div class="muted" style="text-align:center;font-size:.9rem">' + done.length + '/' + its.length + ' terjawab' + '</div>'; return; }
    var b = its.filter(function (it) { return correct(it, st[it.id].sel); }).length, prev = QZ[sid];
    if (!prev || b >= prev.b) { QZ[sid] = { b: b, n: its.length, t: Date.now() }; sv('QZ', QZ); side(); }
    var nx = STIM.filter(function (s) { return !QZ[s.id] && s.id !== sid; })[0];
    el.innerHTML = '<div class="qc sum"><div class="big">' + b + '/' + its.length + '</div><p>' + (b === its.length ? 'Sempurna, semua jawaban tepat.' : 'Baca pembahasan soal yang salah, lalu ulangi beberapa hari lagi.') + '</p>' + (nx ? '<button class="btn" data-prac="' + nx.id + '">' + 'Teks berikutnya: ' + esc(nx.title) + '</button>' : '') + '</div>';
  }
  function find(id) { return D.items.filter(function (x) { return x.id === id; })[0]; }
  function stOf(it) { var sid = it.stim || (MOD + '-lepas'); ANS[sid] = ANS[sid] || {}; return ANS[sid][it.id] = ANS[sid][it.id] || {}; }

  /* ---------- cari ---------- */
  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) { if (view === 'search') home(); return; }
    view = 'search';
    var subs = [];
    D.chapters.forEach(function (c, i) { c.S.forEach(function (s, j) { if ((c.n + ' ' + s.t + ' ' + strip(s.konsep) + ' ' + strip((s.langkah || []).join(' '))).toLowerCase().indexOf(q) >= 0) subs.push('<button class="cd" style="--c:' + c.c + '" data-go="' + i + '.' + j + '"><small>' + c.e + ' ' + esc(c.n) + '</small><b>' + esc(s.t) + '</b></button>'); }); });
    var st = STIM.filter(function (s) { return (s.title + ' ' + s.type + ' ' + strip(s.text)).toLowerCase().indexOf(q) >= 0; });
    $('m').innerHTML = '<h2 class="sec">' + 'Hasil pencarian: ' + esc(q) + '</h2>' + (subs.length ? '<div class="grid">' + subs.join('') + '</div>' : '') + (st.length ? '<h2 class="sec">' + 'Teks' + '</h2>' + stimGrid(st) : '') + (!subs.length && !st.length ? '<div class="empty">' + 'Tidak ada hasil. Coba kata lain, misalnya “ide pokok”, “fakta”, atau “puisi”.' + '</div>' : '');
  }

  /* ---------- menu (layar kecil) ---------- */
  function openMenu() {
    $('menu').innerHTML = '<div class="sheet" role="dialog" aria-label="Daftar bab"><div class="sh"><b>🧭 ' + 'Bab & subbab' + '</b><button data-close="1" aria-label="Tutup">✕</button></div><button class="mi" data-home="1">🏠 ' + 'Beranda modul' + '</button><button class="mi" data-hub="1">📝 ' + 'Latihan per teks' + '</button>' + D.chapters.map(function (c, i) {
      return '<h4>' + c.e + ' ' + esc(c.n) + '</h4>' + c.S.map(function (s, j) { return '<button class="mi" data-go="' + i + '.' + j + '">' + (DN[i + '.' + j] ? '✓ ' : '') + (i + 1) + '.' + (j + 1) + ' ' + esc(s.t) + '</button>'; }).join('');
    }).join('') + '</div>';
    $('menu').classList.add('open');
  }
  function closeMenu() { $('menu').classList.remove('open'); }

  /* ---------- event ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go],[data-prac],[data-hub],[data-home],[data-done],[data-ans],[data-tog],[data-chk],[data-reset],[data-unfold],[data-close],#menuBtn,#brand');
    if (!t) { if (e.target.id === 'menu') closeMenu(); return; }
    var d = t.dataset;
    if (t.id === 'menuBtn') return openMenu();
    if (t.id === 'brand' || d.home) { closeMenu(); return home(); }
    if (d.close) return closeMenu();
    if (d.go) { closeMenu(); var p = d.go.split('.'); return go(+p[0], +p[1]); }
    if (d.prac) { closeMenu(); return prac(d.prac); }
    if (d.hub) { closeMenu(); return showHub('latihan'); }
    if (d.unfold) { $('txt').classList.remove('fold'); t.parentNode.remove(); return; }
    if (d.done) { DN[d.done] = !DN[d.done]; sv('DN', DN); return go(cur, sub); }
    if (d.reset) { delete ANS[d.reset]; return prac(d.reset); }
    var it, a;
    if (d.ans) { var q = d.ans.split('|'); it = find(q[0]); a = stOf(it); if (a.done) return; a.sel = +q[1]; a.done = true; return rerender(it); }
    if (d.tog) { var r = d.tog.split('|'); it = find(r[0]); a = stOf(it); if (a.done) return; a.sel = a.sel || []; var k = +r[1], ix = a.sel.indexOf(k); if (ix >= 0) a.sel.splice(ix, 1); else a.sel.push(k); return rerender(it); }
    if (d.chk) { it = find(d.chk); a = stOf(it); a.done = true; return rerender(it); }
  });
  document.addEventListener('change', function (e) {
    var d = e.target.dataset; if (!d.bs) return;
    var r = d.bs.split('|'), it = find(r[0]), a = stOf(it); if (a.done) return;
    a.sel = a.sel || []; a.sel[+r[1]] = +r[2]; rerender(it);
    var nx = document.querySelector('[name="r-' + it.id + '-' + (+r[1] + 1) + '"]'); if (nx) nx.focus();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  $('q').addEventListener('input', function (e) { search(e.target.value); });

  window.go = go; window.home = home; window.showHub = showHub; window.openPrac = prac;
  window.setTh = setTh; window.setFs = setFs;

  var data = window.TKA_DATA && window.TKA_DATA[MOD];
  if (data) init(data);
  else $('m').innerHTML = '<div class="empty">' + 'Data materi tidak termuat. Muat ulang halaman, atau buka lewat alamat situs.' + '</div>';
})();
