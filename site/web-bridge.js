/*
 * Model Release – Web-Version (iPhone, iPad, Windows, Mac)
 * Ersetzt die Android-Brücke: Daten liegen in IndexedDB des Browsers,
 * Teilen läuft über das Teilen-Menü des Geräts.
 */
(function(){
  "use strict";
  window.__webMode = true;
  window.__deferStart = true;
  const VERSION = "web-__BUILD__";

  /* ---------- Speicher: IndexedDB mit Zwischenspeicher im Arbeitsspeicher ---------- */
  const DB_NAME = "model-release", STORE = "kv";
  let db = null;
  const cache = { contracts: {}, kv: {}, imports: {}, settings: "" };
  function openDb(){
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  function put(key, val){
    if(!db) return;
    try{ db.transaction(STORE, "readwrite").objectStore(STORE).put(val, key); }catch(e){ console.warn(e); }
  }
  function del(key){
    if(!db) return;
    try{ db.transaction(STORE, "readwrite").objectStore(STORE).delete(key); }catch(e){}
  }
  function loadAll(){
    return new Promise(res => {
      const tx = db.transaction(STORE, "readonly"), st = tx.objectStore(STORE);
      const req = st.openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if(!c){ res(); return; }
        const k = String(c.key), v = c.value;
        if(k.startsWith("c:")) cache.contracts[k.slice(2)] = v;
        else if(k.startsWith("kv:")) cache.kv[k.slice(3)] = v;
        else if(k.startsWith("imp:")) cache.imports[k.slice(4)] = v;
        else if(k === "settings") cache.settings = v;
        c.continue();
      };
      req.onerror = () => res();
    });
  }

  /* ---------- Geräte-ID: einmal zufällig erzeugt ---------- */
  function deviceId(){
    let id = cache.kv["__deviceId"];
    if(!id){
      const a = new Uint8Array(8); crypto.getRandomValues(a);
      id = "w" + [...a].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 15);
      cache.kv["__deviceId"] = id; put("kv:__deviceId", id);
    }
    return id;
  }

  /* ---------- Hilfen ---------- */
  function b64ToBlob(b64, type){ const bin = atob(b64); const a = new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type }); }
  function toast(msg){ const t = document.getElementById("toast"); if(!t) return; t.textContent = msg; t.classList.add("on"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), 3000); }
  function cb(id, ok, text){ setTimeout(() => window.__nativeCb && window.__nativeCb(id, ok, text), 0); }

  /* Teilen braucht auf iOS einen frischen Tipp. Wenn der Browser das Teilen nach dem
     Erstellen der PDF ablehnt, erscheint ein Knopf „Jetzt teilen“. */
  let pendingShare = null;
  function shareSheet(file, text){
    const data = { files: [file] };
    if(text) data.text = text;
    if(!(navigator.canShare && navigator.canShare({ files: [file] }))){ downloadFile(file); return; }
    navigator.share(data).catch(err => {
      if(err && err.name === "AbortError") return;
      pendingShare = data; showShareButton(file.name);
    });
  }
  function showShareButton(name){
    let box = document.getElementById("webShareBox");
    if(!box){
      box = document.createElement("div"); box.id = "webShareBox"; box.className = "modal";
      box.innerHTML = '<div class="modal-box"><h3>PDF ist bereit</h3><p id="webShareName"></p><div class="modal-acts"><button class="btn pri" id="webShareGo">Jetzt teilen</button><button class="btn ghost" id="webShareNo">Abbrechen</button></div></div>';
      document.body.appendChild(box);
      document.getElementById("webShareNo").onclick = () => { box.hidden = true; pendingShare = null; };
      document.getElementById("webShareGo").onclick = () => {
        box.hidden = true; const d = pendingShare; pendingShare = null;
        if(d) navigator.share(d).catch(e => { if(!(e && e.name === "AbortError")) downloadFile(d.files[0]); });
      };
    }
    document.getElementById("webShareName").textContent = name;
    box.hidden = false;
  }
  function downloadFile(file){
    const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
  }

  /* ---------- Die Brücke mit denselben Funktionen wie auf Android ---------- */
  window.AndroidBridge = {
    listContracts: () => JSON.stringify(Object.values(cache.contracts).map(v => { try{ return JSON.parse(v); }catch(e){ return null; } }).filter(Boolean)),
    saveContract: (id, json) => { cache.contracts[id] = json; put("c:" + id, json); return true; },
    deleteContract: (id) => { delete cache.contracts[id]; del("c:" + id); return true; },
    getSettings: () => cache.settings || "",
    setSettings: (json) => { cache.settings = json; put("settings", json); return true; },
    kvGet: (k) => cache.kv[k] || "",
    kvSet: (k, v) => { cache.kv[k] = v; put("kv:" + k, v); return true; },
    saveImport: (id, b64) => { cache.imports[id] = b64; put("imp:" + id, b64); return true; },
    readImport: (id) => cache.imports[id] || "",
    deleteImport: (id) => { delete cache.imports[id]; del("imp:" + id); return true; },
    openImport: (id) => { const b = cache.imports[id]; if(!b){ toast("PDF nicht gefunden"); return; } window.open(URL.createObjectURL(b64ToBlob(b, "application/pdf")), "_blank"); },
    deleteContractFiles: () => 0,
    appInfo: () => JSON.stringify({ versionCode: 0, versionName: VERSION, deviceId: deviceId() }),
    saveFile: (b64, name, mime) => {
      const file = new File([b64ToBlob(b64, mime)], name, { type: mime });
      // iPhone: über das Teilen-Menü („In Dateien sichern“), sonst normaler Download
      if(/iPhone|iPad|iPod/.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) shareSheet(file, "");
      else { downloadFile(file); toast("PDF wird gespeichert"); }
      return true;
    },
    shareFile: (b64, name, mime, phone, text) => {
      const file = new File([b64ToBlob(b64, mime)], name, { type: mime });
      try{ if(text && navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); }catch(e){}
      shareSheet(file, text);
    },
    openChat: (b64, name, mime, phone, text) => {
      window.open("https://wa.me/" + encodeURIComponent(phone) + "?text=" + encodeURIComponent(text || ""), "_blank");
    },
    openUrl: (url) => { if(String(url).startsWith("https://")) window.open(url, "_blank", "noopener"); },
    copyText: (t) => { if(navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast("Kopiert")).catch(() => {}); },
    fetchText: (url, id) => {
      fetch(url, { cache: "no-store", redirect: "follow" })
        .then(r => r.ok ? r.text().then(t => cb(id, true, t)) : cb(id, false, "HTTP " + r.status))
        .catch(e => cb(id, false, "Keine Verbindung"));
    },
    setSystemBars: (dark) => { const m = document.querySelector('meta[name="theme-color"]'); if(m) m.content = dark ? "#16181B" : "#EEEEEA"; },
    takeIncoming: () => ""
  };

  /* ---------- Hinweis „Zum Home-Bildschirm hinzufügen“ ---------- */
  function installHint(){
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const standalone = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;
    if(!ios || standalone || cache.kv["__hintClosed"]) return;
    const bar = document.createElement("div");
    bar.className = "banner"; bar.style.cssText = "margin:0 0 18px;align-items:flex-start";
    bar.innerHTML = '<p style="margin:0;flex:1"><b>Als App installieren:</b> Tippe unten auf <b>Teilen</b> <span aria-hidden="true">⬆︎</span> und dann auf <b>„Zum Home-Bildschirm“</b>. So startet Model Release wie eine App und deine Daten bleiben sicher gespeichert.</p><button class="btn ghost" style="padding:6px 12px">OK</button>';
    bar.querySelector("button").onclick = () => { bar.remove(); cache.kv["__hintClosed"] = "1"; put("kv:__hintClosed", "1"); };
    const home = document.getElementById("v-home"); if(home) home.prepend(bar);
  }

  /* ---------- „App installieren“ für Android/Windows/Mac (Chrome, Edge) ---------- */
  let installEvt = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; showInstallButton(); });
  window.addEventListener("appinstalled", () => { installEvt = null; const b = document.getElementById("webInstallBar"); if(b) b.remove(); toast("Model Release ist installiert."); });
  function showInstallButton(){
    if(document.getElementById("webInstallBar") || cache.kv["__installClosed"]) return;
    const home = document.getElementById("v-home"); if(!home) return;
    const bar = document.createElement("div"); bar.id = "webInstallBar";
    bar.className = "banner"; bar.style.cssText = "margin:0 0 18px";
    bar.innerHTML = '<p style="margin:0;flex:1"><b>Model Release als App installieren</b><br><span class="hint">Startet wie ein normales Programm, auch offline.</span></p><button class="btn pri" id="webInstallGo">Installieren</button><button class="btn ghost" id="webInstallNo" aria-label="Schließen" style="padding:6px 12px">✕</button>';
    home.prepend(bar);
    document.getElementById("webInstallGo").onclick = async () => {
      if(!installEvt) return; installEvt.prompt();
      try{ const r = await installEvt.userChoice; if(r && r.outcome === "accepted") bar.remove(); }catch(e){}
      installEvt = null;
    };
    document.getElementById("webInstallNo").onclick = () => { bar.remove(); cache.kv["__installClosed"] = "1"; put("kv:__installClosed", "1"); };
  }

  /* ---------- Start: Speicher laden, dann die App starten ---------- */
  async function start(){
    try{ db = await openDb(); await loadAll(); }
    catch(e){ console.warn("IndexedDB nicht verfügbar", e); }
    try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist(); }catch(e){}
    if(typeof window.__startApp === "function") window.__startApp();
    installHint();
    if(installEvt) showInstallButton();
    if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
