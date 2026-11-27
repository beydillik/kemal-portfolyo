/* site.js — Portfolyo sitesinin tek betiği.
   İçerik data/projeler.json ve data/ozgecmis.json'dan gelir; bu dosyada yalnızca arayüz metinleri (TR/EN) durur.
   Sayfa türü <body data-sayfa="ana|projeler|proje|ozgecmis"> ile seçilir. Veri DOM'a textContent ile yazılır (innerHTML yok). */
(function () {
  "use strict";

  var METIN = {
    tr: {
      nav_ana: "Ana sayfa", nav_projeler: "Projeler", nav_ozgecmis: "Özgeçmiş",
      projeleri_gor: "Projeleri gör", ozgecmisi_gor: "Özgeçmiş",
      one_cikan: "Öne çıkan projeler", tum_projeler: "Tüm projeler",
      kisa_ozgecmis: "Kısa özgeçmiş", deneyim: "Deneyim", egitim: "Eğitim", iletisim: "İletişim",
      web: "Web sitesi", eposta: "E-posta", tamami: "Özgeçmişin tamamı",
      projeler_baslik: "Projeler",
      projeler_giris: "Finans ve controlling işlerim için kurduğum araçlar, yayındaki ürünler ve kendi kullanımım için yazdığım küçük uygulamalar.",
      filtre: "Gruba göre süz", tumu: "Tümü",
      diger: "Diğer çalışmalar", bos: "Bu grupta proje yok. Başka bir grup seçin ya da Tümü'ne dönün.",
      ayrinti: "Ayrıntılar", siteye_git: "Siteye git",
      problem: "Problem", cozum: "Çözüm", sonuc: "Sonuç", teknoloji: "Teknolojiler",
      geri: "Tüm projeler", bulunamadi_baslik: "Proje bulunamadı",
      bulunamadi: "Bu adreste gösterilecek bir proje yok. Tüm projeler listesinden seçebilirsiniz.",
      ornek_veri: "Ekran görüntüsü örnek veriyle hazırlanmıştır.",
      hakkimda: "Profil", secili_projeler: "Seçili projeler", sertifikalar: "Sertifikalar", yetkinlikler: "Yetkinlikler",
      diller: "Diller", ilgi: "İlgi alanları", not_ort: "Not ortalaması",
      pdf_indir: "PDF indir", yazdir: "Yazdır", pdf_yok: "PDF sürümü hazırlanıyor; bu sayfayı yazdırabilirsiniz.",
      devam: "devam ediyor", guncelleme: "Son güncelleme",
      hata: "Veri yüklenemedi. Site yerelde açılıyorsa bir sunucudan açın: python3 -m http.server",
      gorunum_acik: "Açık", gorunum_koyu: "Koyu", dil_grup: "Dil"
    },
    en: {
      nav_ana: "Home", nav_projeler: "Projects", nav_ozgecmis: "Resume",
      projeleri_gor: "See projects", ozgecmisi_gor: "Resume",
      one_cikan: "Featured projects", tum_projeler: "All projects",
      kisa_ozgecmis: "Resume at a glance", deneyim: "Experience", egitim: "Education", iletisim: "Contact",
      web: "Website", eposta: "Email", tamami: "Full resume",
      projeler_baslik: "Projects",
      projeler_giris: "Tools I built for finance and controlling work, products that are live, and small apps I wrote for my own use.",
      filtre: "Filter by group", tumu: "All",
      diger: "Other work", bos: "No projects in this group. Pick another group or go back to All.",
      ayrinti: "Details", siteye_git: "Visit site",
      problem: "Problem", cozum: "Solution", sonuc: "Result", teknoloji: "Technologies",
      geri: "All projects", bulunamadi_baslik: "Project not found",
      bulunamadi: "There is no project to show at this address. You can pick one from the project list.",
      ornek_veri: "Screenshot taken with sample data.",
      hakkimda: "Profile", secili_projeler: "Selected projects", sertifikalar: "Certifications", yetkinlikler: "Skills",
      diller: "Languages", ilgi: "Interests", not_ort: "GPA",
      pdf_indir: "Download PDF", yazdir: "Print", pdf_yok: "The PDF version is being updated; you can print this page.",
      devam: "present", guncelleme: "Last updated",
      hata: "Could not load the data. If you are opening the site locally, serve it: python3 -m http.server",
      gorunum_acik: "Light", gorunum_koyu: "Dark", dil_grup: "Language"
    }
  };

  var DURUM = {
    tr: { canli: "Canlı", kullanimda: "Kullanımda", gelistiriliyor: "Geliştiriliyor", aktif: "Aktif", kullanildi: "Kullanıldı",
          teslim: "Teslim edildi", tamamlandi: "Tamamlandı", prototip: "Prototip", planlama: "Planlama", arsiv: "Arşiv" },
    en: { canli: "Live", kullanimda: "In use", gelistiriliyor: "In development", aktif: "Active", kullanildi: "Used",
          teslim: "Delivered", tamamlandi: "Completed", prototip: "Prototype", planlama: "Planning", arsiv: "Archived" }
  };
  var AY_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var K_DIL = "portfolyo-dil";

  var kok = document.documentElement;
  var sayfa = document.body.getAttribute("data-sayfa");
  var dil = ilkDil();
  var veri = { projeler: null, ozgecmis: null, pdfVar: null };

  /* ---------- yardımcılar ---------- */
  function ilkDil() {
    var k = null;
    try { k = localStorage.getItem(K_DIL); } catch (e) {}
    if (k === "tr" || k === "en") return k;
    return "en"; /* Varsayılan İngilizce; kayıtlı seçim varsa o kullanılır. */
  }
  function t(k) { return METIN[dil][k] || k; }
  function sec(o) { return o == null ? "" : (typeof o === "string" ? o : (o[dil] || o.tr || "")); }

  function h(etiket, ozellik) {
    var e = document.createElement(etiket);
    if (ozellik) for (var a in ozellik) {
      if (ozellik[a] == null || ozellik[a] === false) continue;
      if (a === "text") e.textContent = ozellik[a];
      else if (a === "class") e.className = ozellik[a];
      else e.setAttribute(a, ozellik[a]);
    }
    for (var i = 2; i < arguments.length; i++) ekle(e, arguments[i]);
    return e;
  }
  function ekle(e, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { ekle(e, x); }); return; }
    e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  function bosalt(e) { while (e.firstChild) e.removeChild(e.firstChild); return e; }
  function $(id) { return document.getElementById(id); }

  /* "2026", "2026-10" → TR "10.2026" / EN "Oct 2026" */
  function ay(s) {
    if (!s) return "";
    var p = String(s).split("-");
    if (p.length < 2) return p[0];
    return dil === "tr" ? p[1] + "." + p[0] : AY_EN[parseInt(p[1], 10) - 1] + " " + p[0];
  }
  function aralik(b, s) {
    if (s === null || s === undefined) return ay(b) + " – " + t("devam");
    if (String(b) === String(s)) return ay(b);
    return ay(b) + " – " + ay(s);
  }
  /* "2026-11-27" → TR "27.11.2026" / EN "27 Nov 2026" */
  function gun(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return iso || "";
    return dil === "tr" ? p[2] + "." + p[1] + "." + p[0] : parseInt(p[2], 10) + " " + AY_EN[parseInt(p[1], 10) - 1] + " " + p[0];
  }
  function guvenliUrl(u) { return /^(https?:|mailto:)/i.test(u || "") ? u : null; }

  function jsonAl(yol) {
    return fetch(yol, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(yol + " " + r.status);
      return r.json();
    });
  }
  function pdfKontrol(yol) {
    if (!yol) return Promise.resolve(false);
    return fetch(yol, { method: "HEAD", cache: "no-cache" })
      .then(function (r) { return r.ok; })
      .catch(function () { return false; });
  }

  /* ---------- ortak: bant, çubuk, alt bant, dil ---------- */
  function ortak() {
    kok.setAttribute("lang", dil);
    var k = veri.ozgecmis && veri.ozgecmis.kisi;
    if (k) {
      $("band-ad").textContent = k.ad;
      $("band-alt").textContent = sec(k.unvan);
    }
    var etiketler = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < etiketler.length; i++) etiketler[i].textContent = t(etiketler[i].getAttribute("data-i18n"));

    var d = document.querySelectorAll("button[data-dil]");
    for (var j = 0; j < d.length; j++) d[j].setAttribute("aria-pressed", String(d[j].getAttribute("data-dil") === dil));
    var dg = $("dil-secici"); if (dg) dg.setAttribute("aria-label", t("dil_grup"));
    var g = document.querySelectorAll("button[data-gorunum]");
    for (var m = 0; m < g.length; m++) g[m].textContent = t(g[m].getAttribute("data-gorunum") === "acik" ? "gorunum_acik" : "gorunum_koyu");

    var alt = $("alt-bant");
    if (alt && k) {
      bosalt(alt);
      ekle(alt, [h("span", { text: "© " + new Date().getFullYear() + " " + k.ad }), h("span", { class: "ayrac" }),
        h("span", { text: t("guncelleme") + ": " + gun(veri.ozgecmis.guncelleme) })]);
    }
  }

  function dilKur() {
    var d = document.querySelectorAll("button[data-dil]");
    for (var i = 0; i < d.length; i++) d[i].addEventListener("click", function () {
      var yeni = this.getAttribute("data-dil");
      if (yeni === dil) return;
      dil = yeni;
      try { localStorage.setItem(K_DIL, dil); } catch (e) {}
      ciz();
    });
  }

  function hataGoster(e) {
    var hedef = document.querySelector("main") || document.body;
    bosalt(hedef);
    ekle(hedef, h("div", { class: "kart kart-bolum", role: "alert" }, h("p", { text: t("hata") })));
    if (window.console) console.error(e);
  }

  /* ---------- proje kartı ---------- */
  function grupAdi(id) {
    var g = (veri.projeler.gruplar || []).filter(function (x) { return x.id === id; })[0];
    return g ? sec(g) : id;
  }
  function teknolojiler(liste) {
    if (!liste || !liste.length) return null;
    return h("ul", { class: "teknoloji" }, liste.map(function (x) { return h("li", { text: x }); }));
  }
  function projeKarti(p, baslikSeviye) {
    var m = p[dil] || p.tr;
    var detay = p.yerlesim === "vitrin" ? "proje.html?id=" + encodeURIComponent(p.id) : null;
    var dis = guvenliUrl(p.link);
    var baslik = h(baslikSeviye || "h3", { class: "proje-baslik" }, detay ? h("a", { href: detay, text: m.baslik }) : m.baslik);
    return h("article", { class: "kart proje-kart" },
      h("div", { class: "rozetler" }, h("span", { class: "rozet", text: grupAdi(p.grup) }), h("span", { class: "rozet", text: DURUM[dil][p.durum] || p.durum })),
      baslik,
      h("p", { class: "proje-ozet", text: m.ozet }),
      teknolojiler(p.teknoloji),
      h("div", { class: "proje-alt" },
        h("span", { class: "tarih", text: aralik(p.tarih.baslangic, p.tarih.bitis) }),
        h("span", { class: "proje-linkler" },
          detay ? h("a", { href: detay, text: t("ayrinti") }) : null,
          dis ? h("a", { href: dis, target: "_blank", rel: "noopener", text: t("siteye_git") }) : null)));
  }
  function sirala(a, b) { return a.sira - b.sira; }
  function gorunur(yerlesim) {
    return veri.projeler.projeler.filter(function (p) { return p.yerlesim === yerlesim; }).sort(sirala);
  }

  /* ---------- sayfalar ---------- */
  function anaSayfa() {
    var o = veri.ozgecmis;
    document.title = o.kisi.ad + " · " + sec(o.kisi.unvan).split(" · ")[0];
    $("slogan").textContent = sec(o.kisi.slogan);
    $("hakkimda").textContent = sec(o.hakkimda);

    var v = bosalt($("vitrin"));
    gorunur("vitrin").forEach(function (p) { v.appendChild(projeKarti(p)); });

    /* Kısa özgeçmiş: işveren adı yazılmaz (AGENTS.md 4.1) — yalnızca unvan ve tarih. */
    var ko = bosalt($("kisa-ozgecmis"));
    ekle(ko, h("p", { class: "etiket", text: t("deneyim") }));
    ekle(ko, h("ul", { class: "zaman" }, o.deneyim.filter(function (d) { return !d.kisa; }).slice(0, 4).map(function (d) {
      return h("li", null, h("span", { text: sec(d.unvan) }), h("span", { class: "tarih", text: aralik(d.baslangic, d.bitis) }));
    })));
    ekle(ko, h("p", { class: "etiket", text: t("egitim") }));
    ekle(ko, h("ul", { class: "zaman" }, o.egitim.map(function (e) {
      return h("li", null, h("span", { text: sec(e.bolum) }), h("span", { class: "tarih", text: aralik(e.baslangic, e.bitis) }));
    })));
    ekle(ko, h("a", { class: "dugme", href: "ozgecmis.html", text: t("tamami") }));

    iletisimCiz($("iletisim"));
  }

  function iletisimCiz(kap, siteDahil) {
    var il = veri.ozgecmis.kisi.iletisim;
    bosalt(kap);
    var satirlar = [];
    if (il.eposta) satirlar.push([t("eposta"), "mailto:" + il.eposta, il.eposta]);
    if (il.linkedin) satirlar.push(["LinkedIn", il.linkedin, il.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")]);
    if (il.github) satirlar.push(["GitHub", il.github, il.github.replace(/^https?:\/\//, "")]);
    if (siteDahil && il.site) satirlar.push([t("web"), il.site, il.site.replace(/^https?:\/\//, "").replace(/\/$/, "")]);
    ekle(kap, h("ul", { class: "iletisim" }, satirlar.map(function (s) {
      var u = guvenliUrl(s[1]);
      return h("li", null, h("span", { class: "etiket", text: s[0] }),
        u ? h("a", { href: u, target: /^mailto:/.test(u) ? null : "_blank", rel: /^mailto:/.test(u) ? null : "noopener", text: s[2] }) : s[2]);
    })));
  }

  function projelerSayfasi() {
    document.title = t("projeler_baslik") + " · " + veri.ozgecmis.kisi.ad;
    var secili = new URLSearchParams(location.search).get("grup") || "";
    var tum = veri.projeler.projeler.filter(function (p) { return p.yerlesim !== "gizli"; });
    if (secili && !tum.some(function (p) { return p.grup === secili; })) secili = "";

    var f = bosalt($("filtre"));
    f.setAttribute("aria-label", t("filtre"));
    var secenekler = [{ id: "", ad: t("tumu") }].concat(veri.projeler.gruplar
      .filter(function (g) { return tum.some(function (p) { return p.grup === g.id; }); })
      .map(function (g) { return { id: g.id, ad: sec(g) }; }));
    secenekler.forEach(function (g) {
      var b = h("button", { type: "button", class: "cip", "aria-pressed": String(g.id === secili), text: g.ad });
      b.addEventListener("click", function () {
        var u = new URL(location.href);
        if (g.id) u.searchParams.set("grup", g.id); else u.searchParams.delete("grup");
        try { history.replaceState(null, "", u.pathname + u.search); } catch (e) {}
        projelerSayfasi();
      });
      f.appendChild(b);
    });

    function uyan(p) { return !secili || p.grup === secili; }
    var kartlar = gorunur("vitrin").concat(gorunur("liste")).filter(uyan);
    var k = bosalt($("proje-kartlari"));
    kartlar.forEach(function (p) { k.appendChild(projeKarti(p)); });

    var arsiv = gorunur("arsiv").filter(uyan);
    var a = bosalt($("arsiv"));
    arsiv.forEach(function (p) {
      var m = p[dil] || p.tr;
      var dis = guvenliUrl(p.link);
      a.appendChild(h("li", null,
        h("div", null, h("b", null, dis ? h("a", { href: dis, target: "_blank", rel: "noopener", text: m.baslik }) : m.baslik),
          h("span", { class: "arsiv-ozet", text: " · " + m.ozet })),
        h("span", { class: "tarih", text: aralik(p.tarih.baslangic, p.tarih.bitis) })));
    });
    $("arsiv-bolum").hidden = arsiv.length === 0;
    $("bos").hidden = kartlar.length + arsiv.length > 0;
  }

  function projeSayfasi() {
    var id = new URLSearchParams(location.search).get("id");
    var p = veri.projeler.projeler.filter(function (x) { return x.id === id && x.yerlesim === "vitrin"; })[0];
    var kap = bosalt($("proje"));
    var geri = h("a", { class: "geri", href: "projeler.html", text: "← " + t("geri") });
    if (!p) {
      document.title = t("bulunamadi_baslik") + " · " + veri.ozgecmis.kisi.ad;
      ekle(kap, h("div", { class: "kart" }, h("div", { class: "kart-bas" }, h("h1", { text: t("bulunamadi_baslik") }), h("p", { text: t("bulunamadi") })),
        h("div", { class: "kart-bolum" }, geri)));
      return;
    }
    var m = p[dil] || p.tr;
    var dis = guvenliUrl(p.link);
    document.title = m.baslik + " · " + veri.ozgecmis.kisi.ad;
    var gorsel = p.gorsel ? h("figure", { class: "gorsel" },
      h("img", { src: p.gorsel, alt: m.baslik, loading: "lazy" }), h("figcaption", { text: t("ornek_veri") })) : null;
    ekle(kap, [geri, h("article", { class: "kart" },
      h("div", { class: "kart-bas" },
        h("div", { class: "rozetler" }, h("span", { class: "rozet", text: grupAdi(p.grup) }), h("span", { class: "rozet", text: DURUM[dil][p.durum] || p.durum }),
          h("span", { class: "tarih", text: aralik(p.tarih.baslangic, p.tarih.bitis) })),
        h("h1", { text: m.baslik }),
        h("p", { class: "proje-ozet", text: m.ozet }),
        dis ? h("div", { class: "eylem" }, h("a", { class: "dugme birincil", href: dis, target: "_blank", rel: "noopener", text: t("siteye_git") })) : null),
      gorsel ? h("div", { class: "kart-bolum" }, gorsel) : null,
      [["problem", m.problem], ["cozum", m.cozum], ["sonuc", m.sonuc]].map(function (b) {
        return h("section", { class: "kart-bolum" }, h("h2", { class: "panel-baslik", text: t(b[0]) }), h("p", { class: "metin", text: b[1] }));
      }),
      p.teknoloji && p.teknoloji.length ? h("section", { class: "kart-bolum" }, h("h2", { class: "panel-baslik", text: t("teknoloji") }), teknolojiler(p.teknoloji)) : null)]);
  }

  function ozgecmisSayfasi() {
    var o = veri.ozgecmis, k = o.kisi;
    document.title = k.ad + " · " + t("nav_ozgecmis");
    var kap = bosalt($("ozgecmis"));

    function bolum(baslik, icerik, sinif) {
      return h("section", { class: "cv-bolum" + (sinif ? " " + sinif : "") }, h("h2", { class: "cv-baslik", text: baslik }), icerik);
    }

    /* Üst: ad, unvan, iletişim, eylemler + sağda fotoğraf */
    var yazdir = h("button", { type: "button", class: "dugme", text: t("yazdir") });
    yazdir.addEventListener("click", function () { window.print(); });
    var iletisim = h("div", { class: "cv-iletisim" });
    iletisimCiz(iletisim, true);
    var ust = h("header", { class: "cv-ust" },
      h("div", { class: "cv-kimlik" },
        h("h1", { text: k.ad }),
        h("p", { class: "cv-unvan", text: sec(k.unvan) }),
        h("p", { class: "cv-slogan", text: sec(k.slogan) }),
        h("p", { class: "cv-konum", text: sec(k.konum) }),
        iletisim,
        h("div", { class: "eylem" },
          veri.pdfVar ? h("a", { class: "dugme birincil", href: o.pdf, download: "", text: t("pdf_indir") }) : null, yazdir),
        veri.pdfVar ? null : h("p", { class: "not pdf-not", text: t("pdf_yok") })),
      k.foto ? h("img", { class: "cv-foto", src: k.foto, alt: k.ad, width: "480", height: "480" }) : null);

    var rakamlar = (o.one_cikanlar || []).length ? h("div", { class: "cv-rakamlar" }, o.one_cikanlar.map(function (r) {
      return h("div", { class: "cv-rakam" }, h("b", { text: r.deger }), h("span", { text: sec(r) }));
    })) : null;

    /* Ana sütun: profil, deneyim, seçili projeler */
    var deneyim = h("ol", { class: "zaman-cizgisi" }, o.deneyim.map(function (d) {
      return h("li", { class: "is" + (d.kisa ? " is-kisa" : "") },
        h("div", { class: "is-bas" },
          h("div", null, h("h3", { text: sec(d.unvan) }), d.sirket ? h("p", { class: "sirket", text: d.sirket }) : null),
          h("span", { class: "tarih", text: aralik(d.baslangic, d.bitis) })),
        h("ul", { class: "maddeler" }, (d.maddeler[dil] || d.maddeler.tr || []).map(function (x) { return h("li", { text: x }); })));
    }));
    var projeler = veri.projeler ? gorunur("vitrin").map(function (p) {
      var m = p[dil] || p.tr;
      return h("li", null, h("a", { href: "proje.html?id=" + encodeURIComponent(p.id), text: m.baslik }), h("span", { text: m.ozet }));
    }) : [];
    var ana = h("div", { class: "cv-ana" },
      bolum(t("hakkimda"), h("p", { class: "metin", text: sec(o.hakkimda) })),
      bolum(t("deneyim"), deneyim),
      projeler.length ? bolum(t("secili_projeler"), [h("ul", { class: "cv-projeler" }, projeler),
        h("a", { class: "cv-tum", href: "projeler.html", text: t("tum_projeler") + " →" })]) : null);

    /* Yan sütun: yetkinlik, eğitim, sertifika, dil, ilgi */
    var yan = h("aside", { class: "cv-yan" },
      bolum(t("yetkinlikler"), o.yetkinlikler.map(function (y) {
        return h("div", { class: "yetkinlik" }, h("p", { class: "etiket", text: sec(y.grup) }), teknolojiler(y.ogeler));
      })),
      bolum(t("egitim"), h("ul", { class: "yan-liste" }, o.egitim.map(function (e) {
        return h("li", null, h("b", { text: sec(e.bolum) }), h("span", { text: e.okul }),
          h("span", { class: "tarih", text: aralik(e.baslangic, e.bitis) + (e.not_ortalamasi ? " · " + t("not_ort") + " " + e.not_ortalamasi : "") }));
      }))),
      (o.sertifikalar || []).length ? bolum(t("sertifikalar"), h("ul", { class: "yan-liste" }, o.sertifikalar.map(function (s) {
        return h("li", null, h("b", { text: sec(s.ad) }), s.detay ? h("span", { text: sec(s.detay) }) : null, h("span", { class: "tarih", text: s.yil }));
      }))) : null,
      bolum(t("diller"), h("ul", { class: "yan-liste" }, o.diller.map(function (d) {
        return h("li", { class: "satir" }, h("b", { text: sec(d.dil) }), d.seviye ? h("span", { text: sec(d.seviye) }) : null);
      }))),
      o.ilgi_alanlari ? bolum(t("ilgi"), h("p", { class: "metin", text: (o.ilgi_alanlari[dil] || o.ilgi_alanlari.tr).join(" · ") })) : null);

    ekle(kap, h("article", { class: "kart cv" }, ust, rakamlar, h("div", { class: "cv-govde" }, ana, yan)));
  }

  /* ---------- akış ---------- */
  function ciz() {
    ortak();
    if (sayfa === "ana") anaSayfa();
    else if (sayfa === "projeler") projelerSayfasi();
    else if (sayfa === "proje") projeSayfasi();
    else if (sayfa === "ozgecmis") ozgecmisSayfasi();
  }

  /* Yazdırırken açık görünüm; sonra eski görünüme dön. */
  var oncekiGorunum = null;
  window.addEventListener("beforeprint", function () {
    if (!window.Bant || !Bant.tema) return;
    oncekiGorunum = Bant.tema.durum().gorunum;
    if (oncekiGorunum !== "acik") Bant.tema.uygula(null, "acik");
  });
  window.addEventListener("afterprint", function () {
    if (oncekiGorunum && oncekiGorunum !== "acik" && window.Bant && Bant.tema) Bant.tema.uygula(null, oncekiGorunum);
    oncekiGorunum = null;
  });

  function baslat() {
    dilKur();
    ortak();
    var isler = [jsonAl("data/ozgecmis.json").then(function (d) { veri.ozgecmis = d; })];
    isler.push(jsonAl("data/projeler.json").then(function (d) { veri.projeler = d; }));
    Promise.all(isler)
      .then(function () { return sayfa === "ozgecmis" ? pdfKontrol(veri.ozgecmis.pdf).then(function (v) { veri.pdfVar = v; }) : null; })
      .then(ciz)
      .catch(hataGoster);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", baslat);
  else baslat();
})();
