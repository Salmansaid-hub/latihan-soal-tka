"""Ekstrak bank soal dari aplikasi mapel ke data/bank-*.js (dipakai Try Out).

Butuh: pip install playwright && playwright install chromium
Pakai: python3 tools/extract_banks.py
Jalankan ulang setiap kali isi soal di apps/*.html diubah.
"""
import asyncio, json, pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
NAMES = {"matwajib": "Matematika", "matlanjut": "Matematika Tingkat Lanjut", "fisika": "Fisika",
         "kimia": "Kimia", "biologi": "Biologi", "ekonomi": "Ekonomi"}

JS_FRAMEWORK = """() => {
  const F = typeof FMT === 'function' ? FMT : (typeof MT === 'function' && typeof FRAC !== 'function' ? MT : (x => x));
  const f = x => F(String(x));
  const items = [];
  CH.forEach((c, i) => c.S.forEach((s, j) => {
    const d = EX[i + '.' + j]; if (!d) return;
    (d.z || []).forEach((q, n) => items.push({id: `${i}.${j}.${n}`, topic: c.n, sub: s[0], kind: 'pg',
      stem: f(q[0]), options: q[1].map(f), key: [q[2]], why: f(q[3]), src: 'kuis'}));
  }));
  HT.forEach(h => items.push({id: 'hots-' + h.id, topic: CH[h.c].n, sub: 'HOTS · ' + h.t, kind: 'pg', title: h.t,
      stem: f(h.q), options: h.o.map(f), key: [h.a], why: f(h.e), src: 'hots'}));
  return items;
}"""

JS_MATWAJIB = """() => QUESTIONS.map(q => ({id: q.id, topic: CATS[q.cat].name, sub: q.sub, kind: q.kind, level: q.level,
  stem: q.stem, options: q.options, key: q.key, why: q.why, visual: q.visual || undefined, src: 'bank'}))"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for app, name in NAMES.items():
            pg = await b.new_page()
            await pg.route("**/*", lambda r: r.abort() if r.request.url.startswith("http") else r.continue_())
            await pg.goto((ROOT / "apps" / f"{app}.html").as_uri())
            await pg.wait_for_timeout(300)
            items = await pg.evaluate(JS_MATWAJIB if app == "matwajib" else JS_FRAMEWORK)
            out = {"id": app, "name": name, "count": len(items), "items": items}
            js = (f"/* Bank soal {name} untuk Try Out — dihasilkan otomatis oleh tools/extract_banks.py dari apps/{app}.html. Jangan edit manual. */\n"
                  f"(window.TKA_DATA=window.TKA_DATA||{{}})[{json.dumps('bank-' + app)}]=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
            (ROOT / "data" / f"bank-{app}.js").write_text(js, encoding="utf-8")
            print(f"{app}: {len(items)} soal")
            await pg.close()
        await b.close()

asyncio.run(main())
