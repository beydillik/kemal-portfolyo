# AGENTS.md — Kemal Beydilli kişisel portfolyo sitesi

Bu dosya, bu depoda çalışan her yapay zekâ ajanının (Claude Code, Codex vb.) ilk okuduğu el kitabıdır.
Genel çalışma kurallarımın asıl kopyası: `beydillik/yapay-zeka-cantam/AGENTS.md`. Bu dosya o kurallara ek olarak bu projeye özgü kuralları içerir.

## 1. Amaç

Beni tanıtan (LinkedIn profili gibi) ve yaptığım projeleri gösteren kişisel site + portfolyo.
Okuyucular: LinkedIn'den ya da bir iş başvurusundan gelen işe alımcı, yönetici, meslektaş.
Ana mesaj: **"Rakamları okuyan, araçlarını kendi yazan bir controller."** Finans/controlling uzmanlığı + yazılım + yapay zekâ ile araç geliştirme.

## 2. Teknik çerçeve

- Statik site, derleme adımı yok. HTML + CSS + az JavaScript. Sunucu, veritabanı, framework yok.
- Yayın: **GitHub Pages** (ücretsiz). Netlify kullanılmaz.
- Tasarım: **Bant tasarım sistemi**, `kemalwebsablon-genel` skill'i. Palet **`indigo`** (sabit), düzen **`tanitim`**. Açık/Koyu düğmesi var, palet seçici yok.
  - Bant dosyaları (`bant-tema.css`, `bant-tema.js`, `bant-temel.css`) kökte durur ve **elle değiştirilmez**. Projeye özgü stil sayfanın kendi `<style>` bloğuna, yalnızca `var(--…)` tokenlarıyla yazılır.
  - Teslimden önce skill'in `scripts/kontrol.py` betiği çalıştırılır; çıkış kodu 0 olmalı.
- İki dil: **TR / EN**. Varsayılan dil **EN**, varsayılan görünüm **Açık** (kullanıcının kayıtlı seçimi varsa o geçerli). Dil bandın sağındaki düğmeyle değişir, seçim `localStorage`'da saklanır (try/catch ile).
- Tarih biçimi TR'de `aa.yyyy` / EN'de `Mon yyyy`. Binlik nokta, ondalık virgül (TR).

## 3. Veri odaklı yapı (en önemli kural)

Sayfalar içerik yazmaz; içeriği `data/` altındaki JSON dosyalarından okur.

```
/
├── index.html            Ana sayfa: tanıtım, vitrin projeleri, kısa özgeçmiş, iletişim
├── projeler.html         Tüm projeler: grup filtresi; vitrin + liste kartları, altta "Diğer çalışmalar" (arşiv)
├── proje.html?id=…       Tek proje detayı (problem / çözüm / sonuç) — yalnızca vitrin projeleri
├── ozgecmis.html         Web özgeçmiş + "PDF indir" düğmesi, yazdırılabilir (print CSS)
├── data/
│   ├── projeler.json     Projelerin tek kaynağı
│   └── ozgecmis.json     Kişi, hakkımda, deneyim, eğitim, yetkinlik
├── assets/
│   ├── Kemal_Beydilli_CV.pdf
│   ├── foto/kemal-beydilli.jpg  Özgeçmiş fotoğrafı (480×480, `ozgecmis.json` → `kisi.foto`)
│   └── projeler/<id>.png  Proje görselleri (örnek veriyle çekilmiş)
├── js/site.js            JSON okuma, dil, filtre, kart çizimi
├── bant-tema.css · bant-tema.js · bant-temel.css
├── AGENTS.md · README.md
└── scripts/kontrol_veri.py   JSON şema + gizlilik denetimi
```

`fetch()` ile JSON okunduğu için yerelde `python3 -m http.server` ile açılır (file:// ile değil).

### `projeler.json` alanları

| Alan | Değer | Açıklama |
|---|---|---|
| `id` | kebab-case, benzersiz | URL'de kullanılır (`proje.html?id=…`) |
| `yerlesim` | `vitrin` · `liste` · `arsiv` · `gizli` | vitrin: ana sayfada büyük kart + detay sayfası; liste: projeler sayfasında kart; arsiv: "Diğer çalışmalar" altında tek satır; gizli: hiçbir yerde görünmez |
| `grup` | `gruplar[].id` | Filtre |
| `sira` | sayı | Küçük olan önce |
| `tarih.baslangic` / `tarih.bitis` | `yyyy` ya da `yyyy-aa`; `bitis: null` = devam ediyor | |
| `durum` | `canli` · `kullanimda` · `gelistiriliyor` · `aktif` · `kullanildi` · `teslim` · `tamamlandi` · `prototip` · `planlama` · `arsiv` | Rozet olarak gösterilir; etiketleri `js/site.js` içinde TR/EN |
| `teknoloji` | dizi | Çip olarak gösterilir |
| `link` | URL ya da `null` | Yalnızca herkese açık ve gizlilik kurallarına uyan adresler |
| `gorsel` | `assets/projeler/<id>.png` ya da `null` | |
| `tr` / `en` | `baslik`, `ozet`; vitrinde ayrıca `problem`, `cozum`, `sonuc` | Vitrin projesinde bu üç alan zorunlu |
| `gizlilik` | metin ya da `null` | Sitede gösterilmez; yazarken uyulacak not |

## 4. Gizlilik kuralları (değişmez)

1. **İşverenin adı (Mubea) proje kartlarında, proje detaylarında ve görsellerde geçmez.** Gerekirse "otomotiv tedarikçisi", "iş yerim", "fabrika" denir. İşveren adı yalnızca `ozgecmis.html`'deki deneyim bölümünde yer alır. İstisna: Kemal'in onayladığı canlı adreslerin alan adında geçebilir (`po-rehberi`, `basket-takim`; 27.11.2026). Metinde yine geçmez.
2. Şirket verisi, şirket logosu, iç doküman adı/numarası, çalışan ya da meslektaş adı yok. Ekran görüntüleri yalnızca örnek veriyle; görselde "örnek veri" etiketi.
3. Çocukla ilgili projelerde öğrencinin adı, okulu, yaşı, fotoğrafı ve sağlık ya da kişisel bilgisi site metinlerinde yok. Canlı link yalnızca Kemal'in onayladığı projelere verilir: şu an Ders Defteri (27.11.2026). Yeni link Kemal'e sorulmadan eklenmez.
4. Telefon numarası sitede yok (yalnızca PDF'te). İletişim: e-posta, LinkedIn, GitHub.
5. Satış rakamı, gelir, maaş yazılmaz.
6. Aile üyelerinin adları, ev adresi, kişisel konular yok.

`scripts/kontrol_veri.py` her değişiklikte çalıştırılır: JSON şemasını, zorunlu alanları, benzersiz `id`'leri ve yasaklı kelimeleri (`Mubea`, telefon numarası kalıbı) `tr`/`en` metinlerinde arar. Kişisel adlar gibi ek yasaklı kelimeler repoya yazılmaz (repo herkese açık): kökte, `.gitignore`'daki `.yasakli.txt` dosyasında satır satır durur; dosya varsa betik onu da okur. Çıkış kodu 0 değilse PR açılmaz.

## 5. Yeni proje ekleme (rutin)

Kemal "şu işi portfolyoya ekle" dediğinde:

1. Projeyi tek paragrafta geri oku: başlık, grup, önerilen `yerlesim`, gizlilik riski. Onay bekle.
2. `data/projeler.json`'a kayıt ekle; TR ve EN metinleri birlikte yaz. EN çeviri değil, doğal İngilizce olsun.
3. Vitrin ise `problem / cozum / sonuc` yaz; görsel varsa `assets/projeler/<id>.png` (örnek veriyle).
4. `scripts/kontrol_veri.py` ve Bant `kontrol.py` çalıştır.
5. Ayrı dalda commit, PR aç. **Birleştirme Kemal'de.**

Kod değişikliği gerekmez; sayfalar yeni kaydı kendiliğinden gösterir. Kod değişikliği gerekiyorsa bu bir hata ya da yeni özelliktir, ayrıca konuşulur.

## 6. Metin tonu

- Birinci tekil şahıs, sade, abartısız. "Uzman", "tutkulu", "yenilikçi" gibi süs sözcükleri yok; ne yapıldığı ve sonucu söylenir.
- Rakam ve sonuç somut olsun ama gizlilik kurallarına takılmasın.
- EN metinler kısa cümleli, profesyonel. İşe alımcının 10 saniyede okuyacağı uzunluk.

## 7. Çalışma akışı

- Her iş ayrı dalda; PR açıklamasında ne değişti, hangi denetimler geçti.
- Önceden teslim edilmiş dosyalar baştan üretilmez; hedefli düzenlenir.
- Teslimden önce: açık ve koyu görünüm, TR ve EN, ≈390 px telefon genişliği kontrol edilir (yatay kaydırma, taşan metin yok).

## 8. Açık işler

- [ ] İngilizce seviyesi `ozgecmis.json`'a yazılacak.
- [ ] PDF özgeçmiş güncellenip `assets/Kemal_Beydilli_CV.pdf` olarak eklenecek (yazım düzeltmeleri, Country Manager, YBS, projeler).
- [ ] Vitrin projeleri için örnek veriyle ekran görüntüleri.
- [ ] Alan adı (isteğe bağlı, sonra).
- [x] Ders Defteri için canlı link kararı: link verildi (27.11.2026).
