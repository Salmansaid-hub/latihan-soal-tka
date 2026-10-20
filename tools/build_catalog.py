"""Bangun assets/catalog.js (daftar mapel, bab, subbab + kata kunci pencarian) untuk portal.

Sumber: tools/catalog_base.json (6 mapel lama) + data/bindo.js + data/bing.js.
Pakai: python3 tools/build_catalog.py
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent

def load_js(path):
    s = path.read_text(encoding="utf-8")
    return json.loads(s[s.index("]=") + 2:].rstrip().rstrip(";"))

def strip(h):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h or "")).strip()

def lit_entry(d, badge, desc):
    chapters = []
    for i, c in enumerate(d["chapters"]):
        subs = [{"idx": j, "code": f"{i+1}.{j+1}", "title": s["t"],
                 "kw": (f"{i+1}.{j+1} {s['t']} " + strip(s.get("konsep", "")))[:220]} for j, s in enumerate(c["S"])]
        chapters.append({"idx": i, "title": f"Bab {i+1} · {c['n']}", "short": c["n"], "icon": c["e"], "color": c["c"], "subs": subs})
    nsub = sum(len(c["subs"]) for c in chapters)
    return {"id": d["id"], "name": d["name"], "badge": badge, "icon": d["icon"], "color": d["color"], "accent": d["accent"],
            "tagline": f"{len(chapters)} Bab · {nsub} Subbab · {len(d['stimuli'])} Teks · {d['count']} Soal format TKA",
            "desc": desc, "totalSubs": nsub, "nStim": len(d["stimuli"]) + (1 if any("stim" not in it for it in d["items"]) else 0), "chapters": chapters}

base = json.loads((ROOT / "tools" / "catalog_base.json").read_text(encoding="utf-8"))
by = {c["id"]: c for c in base}
by["matwajib"]["name"] = "Matematika"
bindo = lit_entry(load_js(ROOT / "data" / "bindo.js"), "BAHASAICG",
                  "Literasi membaca teks informasi dan fiksi: makna kata, ide pokok, hubungan antarparagraf, fakta–opini, teks jamak, tabel, puisi, cerpen, drama, dan ketepatan bahasa.")
bing = lit_entry(load_js(ROOT / "data" / "bing.js"), "ENGLISHICG",
                 "Reading comprehension: descriptive, recount, narrative, procedure, analytical exposition, dan teks fungsional pendek, lengkap dengan strategi menjawab.")
order = [bindo, bing] + [by[k] for k in ["matwajib", "matlanjut", "fisika", "kimia", "biologi", "ekonomi"]]
out = "/* Dihasilkan otomatis oleh tools/build_catalog.py — jangan edit manual. */\nwindow.CATALOG=" + json.dumps(order, ensure_ascii=False, separators=(",", ":")) + ";\n"
(ROOT / "assets" / "catalog.js").write_text(out, encoding="utf-8")
print("catalog:", [(c["id"], c["totalSubs"] if "totalSubs" in c else sum(len(x["subs"]) for x in c["chapters"])) for c in order])
