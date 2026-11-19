/* EN validation: generated from walidacja.js by build_walid.py - phone logic is international, messages are English. */
/* ⛔ WALIDACJA KONTAKTU Z WARIANTU B (nick + e-mail + telefon), 09.11.2026.
   Polecenie właściciela, verbatim: "wprowadź podstawową walidacje czy to nie jest
   fake mail i fake telefon wg. najlepszych praktyk", "musi byc zoptymalizowane pod
   instagram in app browser i autofill".

   JEDNA FUNKCJA DLA PRZEGLĄDARKI I SERWERA. Strona wstrzykuje ją przez
   `walidujKontakt.toString()` (ProstaPage.astro), a /api/lead importuje ten sam
   moduł, więc obie strony odrzucają dokładnie to samo. Dlatego funkcja jest
   SAMOWYSTARCZALNA: żadnych odwołań poza swoje ciało, składnia ES5.

   ZASADY (najlepsze praktyki formularzy):
   - Normalizujemy przed oceną: autouzupełnianie iOS/Android i przeglądarki
     Instagrama wkleja numer jako "+48 600 123 456", "(+48) 600-123-456",
     "0048600123456", czasem z twardą spacją; adres bywa z wielką literą
     i spacją na końcu. Formatu NIE wymuszamy na człowieku.
   - Odrzucamy tylko to, co NA PEWNO nie jest kontaktem: zła składnia, adres
     jednorazowy, domena zarezerwowana do testów, numer z powtórzonych cyfr albo
     z ciągu, polski numer stacjonarny (wiadomość idzie na WhatsAppa).
   - Literówkę w popularnej domenie PODPOWIADAMY, nie blokujemy (wzorzec
     mailcheck): drugi raz ten sam adres przechodzi.
   - ⛔ WYJĄTEK OD PODPOWIEDZI (19.11.2026, polecenie właściciela verbatim:
     "zrób że fake maile i fake numery nie wchodza"). Przeszły m.wolskii@wp.pk
     i goodstep.pl@bmail.com, bo drugi raz ten sam adres przechodził. Teraz
     TWARDO (kod email_zla_domena, drugie wysłanie też nie przechodzi):
     znany dostawca z cudzą końcówką (wp.pk, gmail.pl, onet.com) i znana
     literówka z listy LITEROWKI (gmial.com, bmail.com). Łagodna podpowiedź
     zostaje tylko dla domen podobnych "na oko" (odległość 1), bo wśród nich
     są prawdziwe domeny (email.com).
   - Ta funkcja jest synchroniczna i bez sieci. Istnienie domeny (MX, A/AAAA)
     sprawdza osobna funkcja niżej, sprawdzDomeneEmail.

   Wynik: { ok, pole, kod, komunikat, email, telefon, sugestia }.
   `email` i `telefon` są znormalizowane (adres małymi literami, numer E.164). */
function walidujKontakt(emailSurowy, telefonSurowy, opcje) {
  var o = opcje || {};
  var JEDNORAZOWE = ["mailinator.com", "10minutemail.com", "10minutemail.net", "guerrillamail.com",
    "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com", "sharklasers.com", "grr.la",
    "yopmail.com", "yopmail.fr", "yopmail.net", "temp-mail.org", "temp-mail.io", "tempmail.com",
    "tempmail.net", "tempmail.plus", "tempmailo.com", "tempr.email", "trashmail.com", "trashmail.de",
    "trashmail.net", "getnada.com", "nada.email", "maildrop.cc", "dispostable.com", "mailnesia.com",
    "mintemail.com", "minuteinbox.com", "emailondeck.com", "fakeinbox.com", "throwawaymail.com",
    "mohmal.com", "moakt.com", "mailcatch.com", "spamgourmet.com", "33mail.com", "mytemp.email",
    "inboxkitten.com", "burnermail.io", "discard.email", "mailpoof.com", "emailfake.com",
    "fakemail.net", "luxusmail.org", "cock.li", "byom.de", "tmail.ws", "tmpmail.org", "tmpmail.net",
    "1secmail.com", "1secmail.net", "1secmail.org", "dropmail.me", "10mail.org", "spambox.us",
    "mail.tm", "mailto.plus", "fexpost.com", "fextemp.com", "rover.info", "jetable.org",
    // 19.11.2026: goldfishgateway.com przeszedł; dalej najczęstsze domeny z otwartych list
    // adresów jednorazowych (disposable-email-domains), wpisane statycznie.
    "goldfishgateway.com", "10minutemail.co.uk", "10minutemail.de", "20minutemail.com",
    "20minutemail.it", "30minutemail.com", "my10minutemail.com", "anonbox.net", "anonymbox.com",
    "armyspy.com", "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu", "gustr.com", "jourrapide.com",
    "rhyta.com", "superrito.com", "teleworm.us", "fakemailgenerator.com", "binkmail.com", "bobmail.info",
    "chammy.info", "devnullmail.com", "letthemeatspam.com", "mailin8r.com", "mailinator.net",
    "mailinator2.com", "mailinater.com", "notmailinator.com", "reallymymail.com", "reconmail.com",
    "safetymail.info", "sendspamhere.com", "sogetthis.com", "spambooger.com", "spamherelots.com",
    "spamhereplease.com", "spamthisplease.com", "streetwisemail.com", "suremail.info",
    "thisisnotmyrealemail.com", "tradermail.info", "veryrealemail.com", "zippymail.info",
    "mailismagic.com", "mailtothis.com", "monumentmail.com", "putthisinyourspamdatabase.com",
    "spamavert.com", "guerrillamail.biz", "guerrillamail.de", "guerrillamail.info", "pokemail.net",
    "spam4.me", "cool.fr.nf", "jetable.fr.nf", "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj",
    "speed.1s.fr", "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf",
    "trashmail.at", "trashmail.me", "trashmail.io", "trashmail.ws", "trash-mail.com", "trashinbox.com",
    "trashymail.com", "mytrashmail.com", "trash-me.com", "wegwerfmail.de", "wegwerfmail.net",
    "wegwerfmail.org", "wegwerfemail.de", "wegwerfadresse.de", "einmalmail.de", "sofort-mail.de",
    "spoofmail.de", "kurzepost.de", "objectmail.com", "proxymail.eu", "rcpt.at", "0815.ru",
    "temp-mail.ru", "tempail.com", "tempinbox.com", "tempmailaddress.com", "temporary-mail.net",
    "tempomail.fr", "temporaryemail.net", "temporaryinbox.com", "tempemail.net", "getairmail.com",
    "mailnull.com", "spamex.com", "spamfree24.org", "spamfree24.de", "spaml.com", "spaml.de",
    "spammotel.com", "spamspot.com", "spamdecoy.net", "spamgourmet.net", "spamgourmet.org",
    "spambog.com", "spambog.de", "spambog.ru", "mailexpire.com", "mailmoat.com", "mailforspam.com",
    "mailnator.com", "mailhazard.com", "mail-temporaire.fr", "mailtemp.info", "incognitomail.com",
    "incognitomail.org", "meltmail.com", "emltmp.com", "harakirimail.com", "haltospam.com",
    "hidemail.de", "jetable.com", "jetable.net", "koszmail.pl", "mailsac.com", "mailslurp.com",
    "inboxbear.com", "emlpro.com", "emlhub.com", "yomail.info", "fexbox.org", "fexbox.ru",
    "mailbox.in.ua", "esiix.com", "wwjmp.com", "xojxe.com", "yoggm.com", "kzccv.com", "qiott.com",
    "vjuum.com", "laafd.com", "txcct.com", "dpptd.com", "icznn.com", "ezztt.com", "rteet.com",
    "dcctb.com", "bheps.com", "generator.email", "crazymailing.com", "discardmail.com",
    "discardmail.de", "throwam.com", "throwawayemailaddress.com", "mailmetrash.com", "mailscrap.com",
    "nospamfor.us", "nowmymail.com", "emailtemporario.com.br", "tmpbox.net"];
  var TESTOWE = ["example.com", "example.org", "example.net", "example.pl", "test.com", "test.pl",
    "test.test", "domena.pl", "domain.com", "localhost", "invalid", "email.pl", "mail.test",
    "twojafirma.pl", "firma.pl", "asd.pl", "asd.com", "asdf.com", "asdf.pl", "qwe.pl", "qwerty.pl",
    "aaa.pl", "aaa.com", "abc.pl", "xxx.pl", "xyz.pl"];
  var POPULARNE = ["gmail.com", "wp.pl", "o2.pl", "onet.pl", "interia.pl", "op.pl", "icloud.com",
    "outlook.com", "hotmail.com", "yahoo.com", "gazeta.pl", "tlen.pl", "vp.pl", "me.com", "live.com",
    "proton.me", "protonmail.com", "poczta.onet.pl", "interia.eu", "autograf.pl", "buziaczek.pl",
    "onet.eu", "poczta.onet.eu", "googlemail.com"];
  var LITEROWKI = { "gmail.pl": "gmail.com", "gmial.com": "gmail.com", "gmai.com": "gmail.com",
    "gmal.com": "gmail.com", "gamil.com": "gmail.com", "gnail.com": "gmail.com", "gmali.com": "gmail.com",
    "gmaill.com": "gmail.com", "gmail.co": "gmail.com", "gmail.con": "gmail.com", "gmail.cm": "gmail.com",
    "gmail.om": "gmail.com", "gmail.comm": "gmail.com", "gmail.c": "gmail.com", "googlemail.pl": "gmail.com",
    "bmail.com": "gmail.com", "gmil.com": "gmail.com", "gimail.com": "gmail.com",
    "wp.p": "wp.pl", "wp.com": "wp.pl", "wp.pll": "wp.pl", "o2.p": "o2.pl", "o2.com": "o2.pl",
    "onet.p": "onet.pl", "onet.com": "onet.pl", "interia.p": "interia.pl",
    "interia.com": "interia.pl", "intera.pl": "interia.pl", "interis.pl": "interia.pl",
    "op.p": "op.pl", "icloud.co": "icloud.com", "icloud.pl": "icloud.com", "iclod.com": "icloud.com",
    "iclould.com": "icloud.com", "icoud.com": "icloud.com", "outlok.com": "outlook.com",
    "outlook.pl": "outlook.com", "outlook.co": "outlook.com", "hotmial.com": "hotmail.com",
    "hotmail.pl": "hotmail.com", "hotmai.com": "hotmail.com", "yahoo.pl": "yahoo.com",
    "yahoo.co": "yahoo.com", "yaho.com": "yahoo.com" };
  /* Dostawca: jego jedyna prawdziwa końcówka. wp.pk, gmail.pl, onet.com = twarda blokada.
     outlook, hotmail i yahoo mają też prawdziwe końcówki krajowe (hotmail.co.uk,
     yahoo.de), więc u nich blokujemy tylko .pl i przekręcone .com. */
  var DOSTAWCY = { "wp": "wp.pl", "o2": "o2.pl", "onet": "onet.pl", "poczta.onet": "poczta.onet.pl",
    "interia": "interia.pl", "op": "op.pl", "vp": "vp.pl", "tlen": "tlen.pl", "gazeta": "gazeta.pl",
    "gmail": "gmail.com", "icloud": "icloud.com", "outlook": "outlook.com", "hotmail": "hotmail.com",
    "yahoo": "yahoo.com" };
  var KRAJOWE_KONCOWKI = ["outlook", "hotmail", "yahoo"];
  // Komórkowe zakresy krajowego planu numeracji (UKE). Stacjonarny nie przyjmie WhatsAppa.
  var KOMORKI_PL = ["45", "50", "51", "53", "57", "60", "66", "69", "72", "73", "78", "79", "88"];

  function odleglosc(a, b) {
    if (Math.abs(a.length - b.length) > 1) return 9;
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 0; j <= b.length; j++) { d[0][j] = j; }
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        var k = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + k);
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  }
  // 19.11.2026: +48660066000 przeszedł - polski numer z najwyżej 2 różnych cyfr to wzór, nie numer.
  function ileRoznych(t) {
    var z = {}, n = 0;
    for (var i = 0; i < t.length; i++) { if (!z[t.charAt(i)]) { z[t.charAt(i)] = 1; n++; } }
    return n;
  }
  function zle(pole, kod, komunikat) {
    return { ok: false, pole: pole, kod: kod, komunikat: komunikat, email: "", telefon: "", sugestia: "" };
  }

  // ---------- E-MAIL ----------
  var email = String(emailSurowy == null ? "" : emailSurowy)
    .replace(/[\s\u00a0\u200b\u200c\u200d\ufeff]+/g, "").replace(/\.+$/, "").toLowerCase();
  /* `tylkoObecne` (serwer): zapis cząstkowy jest celem /api/lead, więc puste
     pole nie jest błędem - sprawdzamy wyłącznie to, co przyszło. */
  if (!(o.tylkoObecne && !email)) {
  if (!email) return zle("email", "email_pusty", "Enter your email address.");
  var m = /^([a-z0-9!#$%&'*+\/=?^_`{|}~.-]{1,64})@([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24})$/.exec(email);
  if (!m || email.length > 254 || /\.\./.test(email) || /^\.|\.@/.test(email)) {
    return zle("email", "email_skladnia", "Check your email address - it looks incomplete.");
  }
  var lokal = m[1], domena = m[2];
  if (JEDNORAZOWE.indexOf(domena) >= 0) {
    return zle("email", "email_jednorazowy", "That is a temporary address. Use an email you check every day.");
  }
  if (TESTOWE.indexOf(domena) >= 0 || /\.(test|example|invalid|localhost|local)$/.test(domena)) {
    return zle("email", "email_testowy", "Use your real email address.");
  }
  if (/^(test|testy|testowy|asd|asdf|qwe|qwerty|aaa+|abc|xxx+|brak|nie|niemam|nomail|noemail|no-reply|noreply|null|spam)$/.test(lokal)) {
    return zle("email", "email_testowy", "Use your real email address.");
  }
  // Gmail przyjmuje wyłącznie nazwy 6-30 znaków z liter, cyfr i kropek.
  if ((domena === "gmail.com" || domena === "googlemail.com")) {
    var gl = lokal.split("+")[0].replace(/\./g, "");
    if (gl.length < 6 || gl.length > 30 || /[^a-z0-9]/.test(gl)) {
      return zle("email", "email_gmail", "Check your Gmail address - the name has 6 to 30 letters or digits.");
    }
  }
  var sugestia = "", twarda = false;
  if (POPULARNE.indexOf(domena) < 0) {
    var dn = /^(poczta\.onet|[a-z0-9-]+)\.(.+)$/.exec(domena);
    var cel = LITEROWKI[domena] || "";
    if (!cel && dn && DOSTAWCY.hasOwnProperty(dn[1]) && (KRAJOWE_KONCOWKI.indexOf(dn[1]) < 0 ||
        /^(pl|c|co|cm|om|con|comm|coom|cmo|ocm|vom|xom|cpm|clm|comn|ccom)$/.test(dn[2]))) cel = DOSTAWCY[dn[1]];
    twarda = !!cel;
    if (!cel && domena.length >= 8) {
      for (var p = 0; p < POPULARNE.length; p++) {
        if (POPULARNE[p].length >= 9 && odleglosc(domena, POPULARNE[p]) === 1) { cel = POPULARNE[p]; break; }
      }
    }
    if (cel) sugestia = lokal + "@" + cel;
  }
  if (sugestia && twarda) {
    var wt = zle("email", "email_zla_domena", "There is a typo in the email domain. Did you mean " + sugestia + "?");
    wt.sugestia = sugestia;
    return wt;
  }
  if (sugestia && o.akceptujEmail !== email) {
    var w = zle("email", "email_literowka", "Did you mean " + sugestia + "?");
    w.sugestia = sugestia;
    return w;
  }
  }

  // ---------- PHONE (EN / international) ----------
  /* English page: no default country. Numbers with + or 00 and a country code are accepted for any
     country (8-15 digits, E.164). Without a country code only US/Canada numbers are assumed
     (10 digits, or 11 starting with 1). Obvious placeholders (repeated digits, sequences) are rejected. */
  var surowy = String(telefonSurowy == null ? "" : telefonSurowy).replace(/[\u00a0\u2007\u202f]/g, " ").trim();
  if (o.tylkoObecne && !surowy) return { ok: true, pole: "", kod: "", komunikat: "", email: email, telefon: "", sugestia: "" };
  if (!surowy) return zle("telefon", "telefon_pusty", "Enter your phone number - we'll message you there.");
  if (/[a-z]/i.test(surowy)) return zle("telefon", "telefon_skladnia", "A phone number can only contain digits.");
  var plus = /^\s*(\+|00)/.test(surowy);
  var cyfry = surowy.replace(/\D/g, "");
  if (/^00/.test(surowy.replace(/[^\d+]/g, ""))) cyfry = cyfry.slice(2);
  var e164 = "";
  if (plus) {
    if (!/^[1-9]\d{7,14}$/.test(cyfry)) {
      return zle("telefon", "telefon_dlugosc", "Check the number - it looks incomplete. Include the country code, e.g. +1 555 123 4567.");
    }
    e164 = "+" + cyfry;
  } else if (cyfry.length === 10) { e164 = "+1" + cyfry; }
  else if (cyfry.length === 11 && cyfry.charAt(0) === "1") { e164 = "+" + cyfry; }
  else {
    return zle("telefon", "telefon_dlugosc", "Add your country code, e.g. +1 555 123 4567.");
  }
  var nsn = e164.slice(1);
  var krajowy = nsn.length > 10 ? nsn.slice(-10) : nsn;
  if (/^(\d)\1+$/.test(krajowy) || /(\d)\1{6,}/.test(nsn) || ileRoznych(krajowy) <= 2 ||
      /(0123456|1234567|2345678|3456789|9876543|8765432|7654321|6543210)/.test(krajowy)) {
    return zle("telefon", "telefon_wzor", "That number looks like a placeholder. Enter your own number.");
  }
  if (e164.indexOf("+1") === 0 && e164.length === 12 && /^[01]/.test(e164.slice(2))) {
    return zle("telefon", "telefon_wzor", "Check the area code - US and Canadian numbers don't start with 0 or 1.");
  }
  return { ok: true, pole: "", kod: "", komunikat: "", email: email, telefon: e164, sugestia: "" };
}

/* ⛔ DOMENA E-MAIL MUSI ISTNIEĆ (19.11.2026, polecenie właściciela verbatim:
   "zrób że fake maile i fake numery nie wchodza"). Przeszły m.in. adresy
   w domenach, które nie mają ani serwera poczty, ani adresu (wp.pk: NXDOMAIN).

   Domena bez rekordu MX i bez A/AAAA nie przechodzi; null MX ("0 .", RFC 7505)
   oznacza "ta domena nie przyjmuje poczty" i też nie przechodzi. Zapytanie
   idzie przez DNS over HTTPS Cloudflare (JSON), więc działa tak samo
   w przeglądarce Instagrama i w funkcji serwera.

   FAIL-OPEN: błąd sieci, kod DNS inny niż 0 i 3, odpowiedź HTTP inna niż 200
   albo przekroczenie limitu (domyślnie 1500 ms) = przepuszczamy. Awaria DNS
   nie może blokować prawdziwych ludzi. Odrzuca wyłącznie odpowiedź pewna:
   NXDOMAIN albo domena bez MX, A i AAAA.

   Popularne domeny pomijamy bez zapytania. Wynik pewny trafia do
   `opcje.pamiec[domena]` (przeglądarka trzyma jeden obiekt na odsłonę).
   Funkcja jest SAMOWYSTARCZALNA (strona wstrzykuje ją przez toString), ES5.
   Wynik: Promise<{ ok, kod, komunikat }>. */
function sprawdzDomeneEmail(emailSurowy, opcje) {
  var o = opcje || {};
  var POMIJANE = ["gmail.com", "googlemail.com", "wp.pl", "o2.pl", "onet.pl", "onet.eu", "poczta.onet.pl",
    "poczta.onet.eu", "interia.pl", "interia.eu", "op.pl", "vp.pl", "tlen.pl", "gazeta.pl", "icloud.com",
    "me.com", "mac.com", "outlook.com", "hotmail.com", "live.com", "msn.com", "yahoo.com", "proton.me",
    "protonmail.com", "autograf.pl", "buziaczek.pl", "spoko.pl", "int.pl"];
  var dobrze = { ok: true, kod: "", komunikat: "" };
  var email = String(emailSurowy == null ? "" : emailSurowy).replace(/\s+/g, "").replace(/\.+$/, "").toLowerCase();
  var domena = email.indexOf("@") > 0 ? email.slice(email.lastIndexOf("@") + 1) : "";
  if (!domena || POMIJANE.indexOf(domena) >= 0) return Promise.resolve(dobrze);
  var pamiec = o.pamiec;
  if (pamiec && pamiec[domena]) return Promise.resolve(pamiec[domena]);
  var pobierz = o.fetch || (typeof fetch === "function" ? fetch : null);
  if (!pobierz) return Promise.resolve(dobrze);
  var kontroler = typeof AbortController === "function" ? new AbortController() : null;

  function zapytaj(typ) {
    return pobierz("https://cloudflare-dns.com/dns-query?name=" + encodeURIComponent(domena) + "&type=" + typ, {
      headers: { accept: "application/dns-json" }, signal: kontroler ? kontroler.signal : undefined
    }).then(function (r) {
      if (!r || !r.ok) throw new Error("dns_http");
      return r.json();
    }).then(function (d) {
      if (!d || (d.Status !== 0 && d.Status !== 3)) throw new Error("dns_status");
      return d;
    });
  }
  function rekordy(d, numer) {
    var a = (d && d.Answer) || [], w = [];
    for (var i = 0; i < a.length; i++) { if (a[i] && a[i].type === numer) w.push(String(a[i].data || "")); }
    return w;
  }
  // true = domena przyjmuje pocztę albo ma adres, false = na pewno nie, wyjątek = nie wiadomo.
  var sprawdzenie = zapytaj("MX").then(function (mx) {
    if (mx.Status === 3) return false;
    var m = rekordy(mx, 15);
    if (m.length) {
      for (var i = 0; i < m.length; i++) { if (!/^\d+\s+\.?$/.test(m[i].trim())) return true; }
      return false;
    }
    return zapytaj("A").then(function (a) {
      if (rekordy(a, 1).length) return true;
      return zapytaj("AAAA").then(function (q) { return rekordy(q, 28).length > 0; });
    });
  });
  var czas = null;
  var limit = new Promise(function (gotowe) {
    czas = setTimeout(function () {
      try { if (kontroler) kontroler.abort(); } catch (e) {}
      gotowe(null);
    }, o.limitMs || 1500);
  });
  return Promise.race([sprawdzenie.then(null, function () { return null; }), limit]).then(function (istnieje) {
    if (czas) clearTimeout(czas);
    if (istnieje === false) {
      var zle = { ok: false, kod: "email_domena_nie_istnieje", komunikat: "That email domain does not exist. Check the address." };
      if (pamiec) pamiec[domena] = zle;
      return zle;
    }
    if (istnieje === true && pamiec) pamiec[domena] = dobrze;
    return dobrze;
  });
}
