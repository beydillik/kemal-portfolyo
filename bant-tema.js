/* bant-tema.js — Bant palet ve görünüm seçimi. <head> içinde, CSS'ten hemen sonra yüklenir.
   Proje ayarı <html> üzerindedir:
     data-palet="grafit"                  projenin paleti (zorunlu; yoksa petrol)
     data-palet-secici="petrol,grafit"    isteğe bağlı: kullanıcıya bu paletleri sun ("hepsi" = onu)
   Görünüm data-theme="acik|koyu" ile uygulanır. Kullanıcının seçimi bu sitede hatırlanır;
   seçim yoksa sistemin açık/koyu ayarı izlenir. Seçicinin yeri: <div class="bant-tema" data-bant-tema></div> */
window.Bant = window.Bant || {};
(function (Bant) {
  var PALETLER = [
    { id: "petrol", ad: "Petrol", nokta: "#6cc5d3" },
    { id: "mavi", ad: "Mavi", nokta: "#7dbdeb" },
    { id: "grafit", ad: "Grafit", nokta: "#a2b8ce" },
    { id: "zeytin", ad: "Zeytin", nokta: "#a2c187" },
    { id: "murdum", ad: "Mürdüm", nokta: "#cda1e8" },
    { id: "celik", ad: "Çelik", nokta: "#82a7ba" },
    { id: "bordo", ad: "Bordo", nokta: "#c28396" },
    { id: "orman", ad: "Orman", nokta: "#79afa1" },
    { id: "indigo", ad: "İndigo", nokta: "#9097d4" },
    { id: "toprak", ad: "Toprak", nokta: "#b99c84" }
  ];
  var K_PALET = "bant-palet", K_GORUNUM = "bant-gorunum";
  var kok = document.documentElement;
  var kalici = false;

  function oku(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function yaz(k, v) { if (!kalici) return; try { localStorage.setItem(k, v); } catch (e) {} }
  function gecerli(id) { for (var i = 0; i < PALETLER.length; i++) if (PALETLER[i].id === id) return true; return false; }
  function sistemKoyu() { try { return window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; } }

  function sunulanlar() {
    var s = kok.getAttribute("data-palet-secici");
    if (!s) return [];
    if (s.trim() === "hepsi") return PALETLER.map(function (p) { return p.id; });
    return s.split(",").map(function (x) { return x.trim(); }).filter(gecerli);
  }

  function uygula(palet, gorunum) {
    if (palet && gecerli(palet)) kok.setAttribute("data-palet", palet);
    if (gorunum === "acik" || gorunum === "koyu") kok.setAttribute("data-theme", gorunum);
    yenile();
    try { document.dispatchEvent(new CustomEvent("bant:tema", { detail: durum() })); } catch (e) {}
  }
  function durum() { return { palet: kok.getAttribute("data-palet") || "petrol", gorunum: kok.getAttribute("data-theme") || "acik" }; }

  function yenile() {
    var d = durum();
    var kutular = document.querySelectorAll("[data-bant-tema]");
    for (var i = 0; i < kutular.length; i++) {
      var b = kutular[i].querySelectorAll("button[data-gorunum]");
      for (var j = 0; j < b.length; j++) b[j].setAttribute("aria-pressed", String(b[j].getAttribute("data-gorunum") === d.gorunum));
      var r = kutular[i].querySelectorAll("button[data-palet]");
      for (var k = 0; k < r.length; k++) {
        var on = r[k].getAttribute("data-palet") === d.palet;
        r[k].setAttribute("aria-checked", String(on));
        r[k].tabIndex = on ? 0 : -1;
      }
    }
  }

  function dugme(attrs, ic) {
    var b = document.createElement("button");
    b.type = "button";
    for (var a in attrs) b.setAttribute(a, attrs[a]);
    if (typeof ic === "string") b.textContent = ic; else b.appendChild(ic);
    return b;
  }

  function kur(kutu) {
    if (kutu.getAttribute("data-kuruldu")) return;
    kutu.setAttribute("data-kuruldu", "1");
    var liste = sunulanlar();
    if (liste.length > 1) {
      var pal = document.createElement("div");
      pal.className = "bt-seg bt-pal";
      pal.setAttribute("role", "radiogroup");
      pal.setAttribute("aria-label", "Renk paleti");
      liste.forEach(function (id) {
        var p = PALETLER.filter(function (x) { return x.id === id; })[0];
        var n = document.createElement("span");
        n.style.background = p.nokta;
        var b = dugme({ "data-palet": p.id, role: "radio", "aria-label": p.ad, title: p.ad }, n);
        b.addEventListener("click", function () { uygula(p.id); yaz(K_PALET, p.id); });
        pal.appendChild(b);
      });
      pal.addEventListener("keydown", function (e) {
        if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].indexOf(e.key) < 0) return;
        e.preventDefault();
        var i = liste.indexOf(durum().palet), ileri = e.key === "ArrowRight" || e.key === "ArrowDown";
        var yeni = liste[(i + (ileri ? 1 : liste.length - 1)) % liste.length];
        uygula(yeni); yaz(K_PALET, yeni);
        var hedef = pal.querySelector('button[data-palet="' + yeni + '"]'); if (hedef) hedef.focus();
      });
      kutu.appendChild(pal);
    }
    var gor = document.createElement("div");
    gor.className = "bt-seg bt-gor";
    gor.setAttribute("role", "group");
    gor.setAttribute("aria-label", "Görünüm");
    [["acik", "Açık"], ["koyu", "Koyu"]].forEach(function (g) {
      var b = dugme({ "data-gorunum": g[0], "aria-pressed": "false" }, g[1]);
      b.addEventListener("click", function () { uygula(null, g[0]); yaz(K_GORUNUM, g[0]); });
      gor.appendChild(b);
    });
    kutu.appendChild(gor);
    yenile();
  }

  function baslat(secenek) {
    secenek = secenek || {};
    kalici = secenek.kalici !== false;
    var liste = sunulanlar();
    var palet = kok.getAttribute("data-palet") || "petrol";
    var kayitliPalet = kalici ? oku(K_PALET) : null;
    if (kayitliPalet && liste.indexOf(kayitliPalet) > -1) palet = kayitliPalet;
    var gorunum = kalici ? oku(K_GORUNUM) : null;
    if (gorunum !== "acik" && gorunum !== "koyu") gorunum = sistemKoyu() ? "koyu" : "acik";
    uygula(palet, gorunum);
    var kutular = document.querySelectorAll("[data-bant-tema]");
    for (var i = 0; i < kutular.length; i++) kur(kutular[i]);
  }

  Bant.tema = { PALETLER: PALETLER, baslat: baslat, kur: kur, uygula: uygula, durum: durum };

  /* Otomatik başlatma yalnızca projede: <html data-palet="..."> varsa. */
  if (kok.hasAttribute("data-palet")) {
    baslat();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { baslat(); });
  }
})(window.Bant);
