/* Showship website: theme toggle, copy buttons, docs search, "On this page" highlight.
   Every control this file drives is rendered `hidden` and shown here, so the site still reads fine without JS. */
(function () {
  "use strict";
  var root = document.documentElement;
  var siteRoot = root.getAttribute("data-root") || "./";

  /* ----- Mobile menu (hamburger). Below 760px the nav collapses behind the button; without JS it stays visible. ----- */
  var header = document.querySelector(".site-header");
  var menuBtn = document.getElementById("menu-toggle");
  var wide = window.matchMedia("(min-width: 760px)");
  function setMenu(open) {
    if (!header || !menuBtn) return;
    header.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
    header.querySelectorAll(".primary a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true" && !document.querySelector("dialog[open]")) { setMenu(false); menuBtn.focus(); }
    });
    wide.addEventListener("change", function () { if (wide.matches) setMenu(false); });
  }

  /* ----- Theme ----- */
  var toggle = document.getElementById("theme-toggle");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    return t === "light" || t === "dark" ? t : darkQuery.matches ? "dark" : "light";
  }
  function paintToggle() {
    if (!toggle) return;
    var next = currentTheme() === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", "Switch to " + next + " theme");
    toggle.title = "Switch to " + next + " theme";
  }
  if (toggle) {
    toggle.hidden = false;
    paintToggle();
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("showship-theme", next); } catch (e) { /* storage blocked: theme still applies for this visit */ }
      paintToggle();
    });
    darkQuery.addEventListener("change", paintToggle);
  }

  /* ----- Copy buttons ----- */
  var copyTimers = new WeakMap();
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); } finally { document.body.removeChild(ta); }
    });
  }
  function wireCopy(button, getText) {
    button.hidden = false;
    var label = button.textContent;
    button.addEventListener("click", function () {
      copyText(getText()).then(function () { flash("Copied"); }, function () { flash("Select and copy"); });
    });
    function flash(msg) {
      button.textContent = msg;
      clearTimeout(copyTimers.get(button));
      copyTimers.set(button, setTimeout(function () { button.textContent = label; }, 1600));
    }
  }
  document.querySelectorAll(".code .copy").forEach(function (b) {
    wireCopy(b, function () { return b.closest(".code").querySelector("code").textContent; });
  });
  document.querySelectorAll(".cmd .copy").forEach(function (b) {
    wireCopy(b, function () { return b.closest(".cmd").querySelector("code").textContent.trim(); });
  });

  /* ----- "On this page" highlight ----- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var heads = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var active = heads.filter(function (h) { return visible[h.id]; })[0];
      if (!active) return;
      tocLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
      byId[active.id].setAttribute("aria-current", "true");
    }, { rootMargin: "-80px 0px -65% 0px" });
    heads.forEach(function (h) { io.observe(h); });
  }

  /* ----- Demo video player: play/pause and mute/unmute only -----
     Without JS the video keeps the browser's own controls; this replaces them. */
  var VP = {
    play: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="6" y="5" width="4.5" height="14" rx="1" fill="currentColor"/><rect x="13.5" y="5" width="4.5" height="14" rx="1" fill="currentColor"/></svg>',
    sound: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 9.5v5h3.5l4.5 3.5V6L7.5 9.5H4Z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    muted: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 9.5v5h3.5l4.5 3.5V6L7.5 9.5H4Z" fill="currentColor"/><path d="m16 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };
  document.querySelectorAll(".video video").forEach(function (video) {
    var box = video.parentNode;
    function make(cls, label) {
      var b = document.createElement("button");
      b.type = "button"; b.className = cls; b.setAttribute("aria-label", label);
      return b;
    }
    video.removeAttribute("controls");
    box.classList.add("vp");
    var big = make("vp-big", "Play video");
    var bar = document.createElement("div"); bar.className = "vp-bar";
    var toggle = make("vp-btn", "Play video");
    var mute = make("vp-btn", "Mute video");
    var msg = document.createElement("p"); msg.className = "vp-msg"; msg.setAttribute("role", "alert"); msg.hidden = true;
    bar.appendChild(toggle); bar.appendChild(mute);
    box.appendChild(big); box.appendChild(bar); box.appendChild(msg);

    /* Visibility rules:
       before the first play: only the centre button
       playing:               nothing, until the pointer moves over the video or a control has focus
       paused or ended:       only the bottom controls */
    var started = false, idleTimer, px = 0, py = 0, ax = null, ay = null;
    function paintPlay() {
      var playing = !video.paused && !video.ended;
      if (playing && !box.classList.contains("is-playing")) {
        // Starting to play hides everything. The pointer has to actually move to bring the bar back.
        ax = px; ay = py; clearTimeout(idleTimer); box.classList.remove("show-ui");
      }
      if (playing) started = true;
      var label = playing ? "Pause video" : video.ended ? "Play video again" : "Play video";
      box.classList.toggle("is-playing", playing);
      box.classList.toggle("is-fresh", !started);
      toggle.innerHTML = playing ? VP.pause : VP.play;
      toggle.setAttribute("aria-label", label);
      big.setAttribute("aria-label", label);
      big.innerHTML = VP.play;
      big.hidden = started;
    }
    function wake() {
      box.classList.add("show-ui");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { box.classList.remove("show-ui"); }, 2500);
    }
    box.addEventListener("mousemove", function (e) {
      px = e.clientX; py = e.clientY;
      if (ax !== null && Math.abs(px - ax) + Math.abs(py - ay) < 8) return;
      ax = null;
      if (box.classList.contains("is-playing")) wake();
    });
    box.addEventListener("mouseleave", function () { clearTimeout(idleTimer); box.classList.remove("show-ui"); });
    function paintMute() {
      toggle.nextSibling.innerHTML = video.muted ? VP.muted : VP.sound;
      mute.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
    }
    function flip() {
      if (video.paused || video.ended) {
        if (video.ended) video.currentTime = 0;
        var p = video.play();
        if (p && p.catch) p.catch(function () { /* blocked or interrupted: state is repainted by the events below */ });
      } else video.pause();
    }
    big.addEventListener("click", flip);
    toggle.addEventListener("click", flip);
    video.addEventListener("click", flip);
    mute.addEventListener("click", function () { video.muted = !video.muted; });
    ["play", "pause", "ended"].forEach(function (e) { video.addEventListener(e, paintPlay); });
    video.addEventListener("volumechange", paintMute);
    // With a <source> child, load errors fire on the source and do not bubble, so listen in the capture phase.
    video.addEventListener("error", function () {
      big.hidden = true; bar.hidden = true; msg.hidden = false;
      msg.textContent = "The video could not be loaded. Use the download link next to it.";
    }, true);
    paintPlay(); paintMute();
  });

  /* ----- Image lightbox: docs links that point straight at an image, and any link marked data-lightbox, open in a dialog.
     Without JS they simply open the image. Ctrl/Cmd/Shift-click and middle-click keep their normal meaning. ----- */
  var imgLinks = document.querySelectorAll('.prose a[href$=".webp"], .prose a[href$=".png"], .prose a[href$=".jpg"], .prose a[href$=".jpeg"], a[data-lightbox]');
  if (imgLinks.length && typeof HTMLDialogElement !== "undefined") {
    var lbox = null;
    var buildLightbox = function () {
      var d = document.createElement("dialog");
      d.className = "lightbox";
      d.innerHTML = '<div class="lightbox-bar"><p class="lightbox-title"></p><button type="button" class="lightbox-close" aria-label="Close"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
        '<div class="lightbox-stage"><p class="lightbox-status" role="status"></p><img alt="" hidden></div>' +
        '<p class="lightbox-foot"><a rel="noopener" target="_blank">Open the image in a new tab</a></p>';
      document.body.appendChild(d);
      d.querySelector(".lightbox-close").addEventListener("click", function () { d.close(); });
      d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
      d.addEventListener("close", function () { d.querySelector("img").removeAttribute("src"); });
      return d;
    };
    imgLinks.forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        lbox = lbox || buildLightbox();
        var img = lbox.querySelector("img"), status = lbox.querySelector(".lightbox-status"), name = a.textContent.trim();
        lbox.querySelector(".lightbox-title").textContent = name;
        lbox.setAttribute("aria-label", name);
        lbox.querySelector(".lightbox-foot a").href = a.href;
        img.hidden = true; img.alt = name; status.hidden = false; status.textContent = "Loading the image.";
        img.onload = function () { status.hidden = true; img.hidden = false; };
        img.onerror = function () { status.hidden = false; status.textContent = "The image could not be loaded. Try opening it in a new tab."; };
        img.src = a.href;
        lbox.showModal();
      });
    });
  }

  /* ----- Search ----- */
  var dialog = document.getElementById("search-dialog");
  var openBtn = document.getElementById("search-open");
  if (!dialog || !openBtn || typeof dialog.showModal !== "function") return;
  var input = document.getElementById("search-input");
  var status = document.getElementById("search-status");
  var list = document.getElementById("search-results");
  var index = null, loading = false, failed = false;

  openBtn.hidden = false;
  function open() {
    if (!dialog.open) dialog.showModal();
    input.focus();
    input.select();
    if (!index && !loading) load();
  }
  openBtn.addEventListener("click", open);
  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(tag) && !(e.target && e.target.isContentEditable)) {
      e.preventDefault();
      open();
    }
  });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });

  function setStatus(text, withRetry) {
    status.textContent = text;
    if (withRetry) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = "Try again";
      b.addEventListener("click", load);
      status.appendChild(b);
    }
  }
  function load() {
    loading = true; failed = false;
    setStatus("Loading the search index.");
    fetch(siteRoot + "assets/search-index.json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { index = data; loading = false; run(); })
      .catch(function () {
        loading = false; failed = true; list.textContent = "";
        setStatus("The search index could not be loaded. Browse the pages in the documentation menu instead, or ", true);
      });
  }

  function terms(q) { return q.toLowerCase().split(/[^a-z0-9.]+/).filter(Boolean); }
  function score(entry, ts) {
    var title = entry.sec.h.toLowerCase(), page = entry.page.t.toLowerCase(), body = entry.sec.x.toLowerCase(), s = 0;
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i], hit = false;
      if (title.indexOf(t) > -1) { s += 6; hit = true; }
      if (page.indexOf(t) > -1) { s += 3; hit = true; }
      if (body.indexOf(t) > -1) { s += 1; hit = true; }
      if (!hit) return 0;
    }
    return s;
  }
  function snippet(text, ts) {
    var low = text.toLowerCase(), at = -1;
    for (var i = 0; i < ts.length && at < 0; i++) at = low.indexOf(ts[i]);
    var start = Math.max(0, at - 40);
    return (start > 0 ? "…" : "") + text.slice(start, start + 140) + (start + 140 < text.length ? "…" : "");
  }
  function markInto(el, text, ts) {
    var re = new RegExp("(" + ts.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")", "ig");
    text.split(re).forEach(function (part, i) {
      if (i % 2) { var m = document.createElement("mark"); m.textContent = part; el.appendChild(m); }
      else el.appendChild(document.createTextNode(part));
    });
  }
  function run() {
    if (!index) return;
    var q = input.value.trim(), ts = terms(q);
    list.textContent = "";
    if (!ts.length) { setStatus("Type to search the documentation."); return; }
    var hits = [];
    index.forEach(function (page) { page.s.forEach(function (sec) { var s = score({ page: page, sec: sec }, ts); if (s) hits.push({ s: s, page: page, sec: sec }); }); });
    hits.sort(function (a, b) { return b.s - a.s; });
    hits = hits.slice(0, 8);
    if (!hits.length) { setStatus("No pages match “" + q + "”. Try fewer or different words."); return; }
    setStatus(hits.length + (hits.length === 1 ? " result" : " results"));
    hits.forEach(function (h) {
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = siteRoot + h.page.u + (h.sec.i ? "#" + h.sec.i : "");
      var t = document.createElement("span"); t.className = "r-title"; markInto(t, h.sec.h, ts);
      var p = document.createElement("span"); p.className = "r-page"; p.textContent = h.page.g + " / " + h.page.t;
      var s = document.createElement("span"); s.className = "r-snippet"; markInto(s, snippet(h.sec.x, ts), ts);
      a.appendChild(t); a.appendChild(p); a.appendChild(s); li.appendChild(a); list.appendChild(li);
    });
  }
  input.addEventListener("input", function () { if (failed) return; run(); });
  input.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    var first = list.querySelector("a");
    if (first) first.click();
  });
  dialog.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    var links = Array.prototype.slice.call(list.querySelectorAll("a"));
    if (!links.length) return;
    e.preventDefault();
    var i = links.indexOf(document.activeElement);
    if (e.key === "ArrowDown") (links[i + 1] || links[0]).focus();
    else if (i <= 0) input.focus();
    else links[i - 1].focus();
  });
  dialog.addEventListener("close", function () { input.value = ""; list.textContent = ""; setStatus("Type to search the documentation."); openBtn.focus(); });

  /* ----- Cookie consent (rendered only when GA4 is configured). The page default is "denied"; Accept grants analytics storage.
     Accept is remembered across visits (localStorage). Decline is remembered for this visit only (sessionStorage),
     so anyone who has not accepted sees the banner again next time. ----- */
  var consent = document.getElementById("consent");
  var consentOpen = document.querySelector("[data-consent-open]");
  if (consent) {
    var KEY = "ss-consent";
    function read(store) { try { return window[store].getItem(KEY); } catch (e) { return null; } }
    function write(store, v) { try { window[store].setItem(KEY, v); } catch (e) {} }
    function clear(store) { try { window[store].removeItem(KEY); } catch (e) {} }
    function showConsent(show) { consent.hidden = !show; if (show) consent.querySelector("button").focus(); }
    consent.addEventListener("click", function (e) {
      var b = e.target.closest("[data-consent]");
      if (!b) return;
      var v = b.getAttribute("data-consent");
      if (v === "granted") { write("localStorage", "granted"); clear("sessionStorage"); }
      else { clear("localStorage"); write("sessionStorage", "denied"); }
      if (typeof window.gtag === "function") window.gtag("consent", "update", { analytics_storage: v });
      showConsent(false);
      if (consentOpen) consentOpen.focus();
    });
    consent.addEventListener("keydown", function (e) { if (e.key === "Escape") { showConsent(false); if (consentOpen) consentOpen.focus(); } });
    if (consentOpen) {
      consentOpen.hidden = false;
      consentOpen.addEventListener("click", function () { showConsent(true); });
    }
    if (read("localStorage") !== "granted" && read("sessionStorage") !== "denied") consent.hidden = false;
  }
})();
