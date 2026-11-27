#!/usr/bin/env python3
"""Portfolyo veri denetimi: data/projeler.json ve data/ozgecmis.json.

Kullanım:  python3 scripts/kontrol_veri.py
Çıkış kodu 0 = temiz, 1 = hata var. Kurallar AGENTS.md bölüm 3 ve 4'te.
"""
import json
import re
import sys
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
YERLESIM = {"vitrin", "liste", "arsiv", "gizli"}
DURUM = {"canli", "kullanimda", "gelistiriliyor", "aktif", "kullanildi", "teslim",
         "tamamlandi", "prototip", "planlama", "arsiv"}
TARIH = re.compile(r"^\d{4}(-\d{2})?$")
TELEFON = re.compile(r"(\+?90[\s-]?)?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}")
YASAKLI = ["Mubea"]

hatalar = []


def hata(mesaj):
    hatalar.append(mesaj)


def yasakli_listesi():
    liste = list(YASAKLI)
    yerel = KOK / ".yasakli.txt"
    if yerel.exists():
        liste += [s.strip() for s in yerel.read_text(encoding="utf-8").splitlines() if s.strip()]
    return liste


def metin_tara(etiket, metin, yasakli):
    for kelime in yasakli:
        if re.search(rf"\b{re.escape(kelime)}\b", metin, re.IGNORECASE):
            hata(f"{etiket}: yasaklı kelime '{kelime}'")
    if TELEFON.search(metin):
        hata(f"{etiket}: telefon numarasına benzeyen ifade")


def projeleri_denetle(yasakli):
    veri = json.loads((KOK / "data/projeler.json").read_text(encoding="utf-8"))
    gruplar = {g["id"] for g in veri["gruplar"]}
    gorulen = set()
    for p in veri["projeler"]:
        pid = p.get("id", "?")
        if pid in gorulen:
            hata(f"{pid}: id tekrar ediyor")
        gorulen.add(pid)
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", pid):
            hata(f"{pid}: id kebab-case değil")
        if p.get("yerlesim") not in YERLESIM:
            hata(f"{pid}: yerlesim geçersiz")
        if p.get("grup") not in gruplar:
            hata(f"{pid}: grup tanımsız")
        if p.get("durum") not in DURUM:
            hata(f"{pid}: durum geçersiz")
        t = p.get("tarih", {})
        if not TARIH.match(str(t.get("baslangic", ""))):
            hata(f"{pid}: tarih.baslangic biçimi yyyy ya da yyyy-aa olmalı")
        if t.get("bitis") is not None and not TARIH.match(str(t["bitis"])):
            hata(f"{pid}: tarih.bitis biçimi yyyy ya da yyyy-aa olmalı")
        zorunlu = ["baslik", "ozet"]
        if p.get("yerlesim") == "vitrin":
            zorunlu += ["problem", "cozum", "sonuc"]
        for dil in ("tr", "en"):
            blok = p.get(dil) or {}
            for alan in zorunlu:
                if not blok.get(alan):
                    hata(f"{pid}: {dil}.{alan} eksik")
            metin_tara(f"{pid}.{dil}", json.dumps(blok, ensure_ascii=False), yasakli)
    return veri


def ozgecmisi_denetle(yasakli):
    veri = json.loads((KOK / "data/ozgecmis.json").read_text(encoding="utf-8"))
    # İşveren adı özgeçmişin deneyim bölümünde serbest (AGENTS.md 4.1); telefon her yerde yasak.
    if TELEFON.search(json.dumps(veri, ensure_ascii=False)):
        hata("ozgecmis.json: telefon numarasına benzeyen ifade")
    for anahtar in ("kisi", "hakkimda"):
        metin_tara(f"ozgecmis.{anahtar}", json.dumps(veri.get(anahtar, {}), ensure_ascii=False),
                   [k for k in yasakli if k != "Mubea"])
    return veri


def main():
    yasakli = yasakli_listesi()
    projeler = projeleri_denetle(yasakli)
    ozgecmisi_denetle(yasakli)
    sayim = {}
    for p in projeler["projeler"]:
        sayim[p["yerlesim"]] = sayim.get(p["yerlesim"], 0) + 1
    print(f"Proje: {len(projeler['projeler'])} · " + " · ".join(f"{k}: {v}" for k, v in sorted(sayim.items())))
    if hatalar:
        print(f"\n{len(hatalar)} hata:")
        for h in hatalar:
            print(f"  - {h}")
        return 1
    print("Temiz.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
