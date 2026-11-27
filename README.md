# kemal-portfolyo

Kemal Beydilli'nin kişisel sitesi ve proje portfolyosu. Statik site, GitHub Pages'te yayınlanır.

- İçerik: `data/projeler.json` (projeler) ve `data/ozgecmis.json` (özgeçmiş). Sayfalar içeriği bu dosyalardan okur.
- Tasarım: Bant tasarım sistemi, `indigo` palet, `tanitim` düzeni.
- Ajanlar için kurallar ve "yeni proje ekle" rutini: [AGENTS.md](AGENTS.md).

## Yerelde açma

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Denetim

```bash
python3 scripts/kontrol_veri.py
```
