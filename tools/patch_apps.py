"""Pasang perbaikan pada aplikasi mapel (idempoten).

Perbaikan:
1. Posisi kunci jawaban kuis & HOTS diacak secara deterministik.
Sebelumnya kunci jawaban menumpuk di opsi B (Biologi 80%, Ekonomi 64%, Fisika 57%),
sehingga siswa bisa menebak tanpa berpikir.
2. Kata bercetak tebal di tengah paragraf materi tidak lagi pecah ke baris baru
   (aturan CSS .cb>b semula membuat SEMUA <b> menjadi blok).

Pakai:  python3 tools/patch_apps.py            (menambal apps/*.html di tempat)
        python3 tools/patch_apps.py --from ORIGINAL_PORTAL.html  (ekstrak dulu dari portal lama)
"""
import base64, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APPS = ROOT / "apps"
HT_KEYS = {"matlanjut": "tmlHT", "fisika": "tkaHT", "kimia": "tkmHT", "biologi": "tkaBioHT", "ekonomi": "ekoHT"}
MARK = "/*tka-balance-v1*/"
CSS_MARK = "/*tka-fix-cb*/"
CSS_FIX = "<style>" + CSS_MARK + ".cb>b:not(:first-child){display:inline;margin:0;font-size:inherit}</style>\n"

BALANCE = MARK + r"""
function __tkaBalance(htKey){
 var h=function(s){var x=2166136261;s=String(s);for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0};
 var rng=function(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
 var perm=function(n,seed){var r=rng(seed),p=[];for(var i=0;i<n;i++)p.push(i);for(var i=n-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=p[i];p[i]=p[j];p[j]=t}return p};
 try{Object.keys(EX).forEach(function(k){(EX[k].z||[]).forEach(function(q){var p=perm(q[1].length,h(q[0]));q[1]=p.map(function(i){return q[1][i]});q[2]=p.indexOf(q[2])})})}catch(e){}
 try{var mig=false;try{mig=localStorage.getItem(htKey+'_v2')!=='1'}catch(e){}
  HT.forEach(function(t){var p=perm(t.o.length,h(t.q));t.o=p.map(function(i){return t.o[i]});t.a=p.indexOf(t.a);
   if(mig&&HTD&&HTD[t.id]&&HTD[t.id].k!=null)HTD[t.id].k=p.indexOf(HTD[t.id].k)});
  if(mig){try{localStorage.setItem(htKey,JSON.stringify(HTD));localStorage.setItem(htKey+'_v2','1')}catch(e){}}
 }catch(e){}
}
"""

def extract(portal):
    s = pathlib.Path(portal).read_text(encoding="utf-8")
    for m in re.finditer(r'<script type="application/octet-stream" id="b64-(\w+)">(.*?)</script>', s, re.S):
        (APPS / f"{m.group(1)}.html").write_bytes(base64.b64decode(m.group(2).strip()))
        print("diekstrak", m.group(1))

def patch():
    for app, key in HT_KEYS.items():
        f = APPS / f"{app}.html"
        s = f.read_text(encoding="utf-8")
        if CSS_MARK not in s:
            s = s.replace("</head>", CSS_FIX + "</head>", 1)
            f.write_text(s, encoding="utf-8")
            print("CSS diperbaiki", app)
        if MARK in s:
            print("sudah ditambal", app); continue
        tail = "setTh(TH);home();"
        assert s.count(tail) == 1, app
        s = s.replace("<title>", "<script>" + BALANCE + "</script>\n<title>", 1)
        s = s.replace(tail, f"__tkaBalance('{key}');" + tail)
        f.write_text(s, encoding="utf-8")
        print("ditambal", app)

if __name__ == "__main__":
    if "--from" in sys.argv:
        extract(sys.argv[sys.argv.index("--from") + 1])
    patch()
