(() => {
  "use strict";

  // ---------- Constants & helpers ----------
  const COLORS = [
    ["Tomato", "#d50000"], ["Flamingo", "#e67c73"], ["Tangerine", "#f4511e"],
    ["Banana", "#f6bf26"], ["Sage", "#33b679"], ["Basil", "#0b8043"],
    ["Peacock", "#039be5"], ["Blueberry", "#3f51b5"], ["Lavender", "#7986cb"],
    ["Grape", "#8e24aa"], ["Graphite", "#616161"],
  ];
  const DEFAULT_COLOR = "#039be5";
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  const HOUR = 48; // px per hour in week/day view (matches --hour)

  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, "0");
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYmd = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const startOfWeek = d => addDays(d, -d.getDay());
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const toMin = t => { const [h, m] = (t || "0:0").split(":").map(Number); return h * 60 + m; };
  const toHHMM = min => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

  function fmtTime(min) {
    const h = Math.floor(min / 60) % 24, m = min % 60;
    const h12 = h % 12 || 12;
    return `${h12}${m ? ":" + pad(m) : ""}${h < 12 ? "am" : "pm"}`;
  }

  function h(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function textColorFor(hex) {
    const n = parseInt(hex.slice(1), 16);
    const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.62 ? "#1f1f1f" : "#ffffff";
  }

  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

  // ---------- State ----------
  const state = {
    view: store.get("gc-view", "month"),
    cursor: today(),
    mini: null,
    events: [],
    backend: false,
    scrollTop: null,
  };
  state.mini = new Date(state.cursor.getFullYear(), state.cursor.getMonth(), 1);

  // ---------- Storage ----------
  async function loadEvents() {
    try {
      const r = await fetch("/api/events", { cache: "no-store" });
      if (!r.ok) throw new Error(r.status);
      state.events = await r.json();
      state.backend = true;
    } catch {
      state.events = store.get("gc-events", []);
    }
  }

  async function persist() {
    store.set("gc-events", state.events); // local backup copy
    if (!state.backend) return;
    try {
      const r = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-George": "1" },
        body: JSON.stringify(state.events),
      });
      if (!r.ok) throw new Error(r.status);
    } catch {
      showAlert({ title: "Couldn't save to disk", when: "Your change is kept in this window; try again in a moment." });
    }
  }

  // ---------- Event queries ----------
  function occursOn(ev, ds) {
    if (ds < ev.date) return false;
    if (ds === ev.date) return true;
    const a = parseYmd(ev.date), b = parseYmd(ds);
    switch (ev.repeat) {
      case "daily": return true;
      case "weekly": return a.getDay() === b.getDay();
      case "monthly": return a.getDate() === b.getDate();
      case "yearly": return a.getDate() === b.getDate() && a.getMonth() === b.getMonth();
      default: return false;
    }
  }

  function eventsOn(ds) {
    return state.events
      .filter(ev => occursOn(ev, ds))
      .sort((a, b) => (b.allDay - a.allDay) || (toMin(a.start) - toMin(b.start)) || a.title.localeCompare(b.title));
  }

  function eventRange(ev) {
    const s = toMin(ev.start);
    let e = toMin(ev.end);
    if (e <= s) e = Math.min(s + 60, 24 * 60);
    return [s, e];
  }

  // ---------- Rendering ----------
  const main = $("main");

  function render() {
    document.querySelectorAll(".view-switch button").forEach(b =>
      b.classList.toggle("active", b.dataset.view === state.view));
    renderTitle();
    renderMini();
    renderMonkey();
    if (state.view === "month") renderMonth();
    else if (state.view === "week") renderTimeGrid([...Array(7)].map((_, i) => addDays(startOfWeek(state.cursor), i)));
    else renderTimeGrid([state.cursor]);
  }

  function renderTitle() {
    const c = state.cursor;
    let t;
    if (state.view === "month") {
      t = `${MONTHS[c.getMonth()]} ${c.getFullYear()}`;
    } else if (state.view === "week") {
      const a = startOfWeek(c), b = addDays(a, 6);
      if (a.getMonth() === b.getMonth()) t = `${MONTHS[a.getMonth()]} ${a.getFullYear()}`;
      else if (a.getFullYear() === b.getFullYear()) t = `${MONTHS[a.getMonth()].slice(0, 3)} – ${MONTHS[b.getMonth()].slice(0, 3)} ${b.getFullYear()}`;
      else t = `${MONTHS[a.getMonth()].slice(0, 3)} ${a.getFullYear()} – ${MONTHS[b.getMonth()].slice(0, 3)} ${b.getFullYear()}`;
    } else {
      t = `${MONTHS[c.getMonth()]} ${c.getDate()}, ${c.getFullYear()}`;
    }
    $("periodTitle").textContent = t;
  }

  function renderMini() {
    const m = state.mini;
    $("miniTitle").textContent = `${MONTHS[m.getMonth()]} ${m.getFullYear()}`;
    const grid = $("miniGrid");
    grid.innerHTML = "";
    "SMTWTFS".split("").forEach(l => grid.append(h("div", "dow", l)));
    const start = startOfWeek(m);
    const t = ymd(today()), sel = ymd(state.cursor);
    for (let i = 0; i < 42; i++) {
      const d = addDays(start, i), ds = ymd(d);
      const b = h("button", "", d.getDate());
      if (d.getMonth() !== m.getMonth()) b.classList.add("other");
      if (ds === t) b.classList.add("today");
      else if (ds === sel) b.classList.add("selected");
      const hol = Holidays.on(ds);
      if (hol.length) { b.classList.add("holiday"); b.title = "🍌 " + hol.join(", "); }
      b.onclick = () => goTo(d);
      grid.append(b);
    }
  }

  function renderMonkey() {
    const mi = state.cursor.getMonth();
    const mk = Monkeys[mi];
    const card = $("monkeyCard");
    card.innerHTML = mk.svg +
      `<div class="mc-body"><div class="mc-label">${MONTHS[mi]}'s monkey</div>` +
      `<div class="mc-name"></div><div class="mc-fact"></div></div>`;
    card.querySelector(".mc-name").textContent = mk.name;
    card.querySelector(".mc-fact").textContent = mk.fact;
  }

  function holidayChip(name) {
    const c = h("div", "chip holiday");
    c.title = name;
    c.append(h("span", "banana", "🍌"), h("span", "label", name));
    return c;
  }

  function eventChip(ev, ds) {
    const c = h("div", "chip");
    const color = ev.color || DEFAULT_COLOR;
    if (ev.allDay) {
      c.classList.add("allday");
      c.style.background = color;
      c.style.color = textColorFor(color);
      c.append(h("span", "label", ev.title));
    } else {
      const dot = h("span", "dot");
      dot.style.background = color;
      c.append(dot, h("span", "time", fmtTime(toMin(ev.start))), h("span", "label", ev.title));
    }
    c.title = ev.title;
    c.onclick = e => { e.stopPropagation(); openEditor(ev, ds); };
    return c;
  }

  function renderMonth() {
    main.innerHTML = "";
    const c = state.cursor, y = c.getFullYear(), m = c.getMonth();
    const first = new Date(y, m, 1);
    const start = addDays(first, -first.getDay());
    const weeks = Math.ceil((first.getDay() + daysInMonth(y, m)) / 7);
    const t = ymd(today());

    const wrap = h("div", "month");
    const dows = h("div", "month-dows");
    DOW.forEach(d => dows.append(h("div", "", d.toUpperCase())));
    const grid = h("div", "month-grid");
    grid.style.gridTemplateRows = `repeat(${weeks}, minmax(0, 1fr))`;
    wrap.append(dows, grid);
    main.append(wrap);

    const cells = [];
    for (let i = 0; i < weeks * 7; i++) {
      const d = addDays(start, i), ds = ymd(d);
      const cell = h("div", "cell");
      if (d.getMonth() !== m) cell.classList.add("other");
      if (ds === t) cell.classList.add("today");
      const num = h("button", "daynum", d.getDate() === 1 ? `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}` : d.getDate());
      num.title = "Open day view";
      num.onclick = e => { e.stopPropagation(); state.view = "day"; goTo(d); };
      cell.append(num);
      cell.onclick = () => openEditor(null, ds);
      grid.append(cell);
      cells.push([cell, ds, d]);
    }

    // Fill after layout so we know how many chips fit in each cell.
    for (const [cell, ds, d] of cells) {
      const items = [
        ...Holidays.on(ds).map(name => () => holidayChip(name)),
        ...eventsOn(ds).map(ev => () => eventChip(ev, ds)),
      ];
      const room = Math.max(0, Math.floor((cell.clientHeight - 30) / 22));
      const fits = items.length <= room;
      const show = fits ? items.length : Math.max(0, room - 1);
      items.slice(0, show).forEach(make => cell.append(make()));
      if (!fits) {
        const more = h("button", "more", `${items.length - show} more`);
        more.onclick = e => { e.stopPropagation(); state.view = "day"; goTo(d); };
        cell.append(more);
      }
    }
  }

  function layoutColumns(items) {
    items.sort((a, b) => a.s - b.s || b.e - a.e);
    const clusters = [];
    let cur = [], curEnd = -1;
    for (const it of items) {
      if (cur.length && it.s >= curEnd) { clusters.push(cur); cur = []; curEnd = -1; }
      cur.push(it);
      curEnd = Math.max(curEnd, it.ve);
    }
    if (cur.length) clusters.push(cur);
    for (const cl of clusters) {
      const colEnds = [];
      for (const it of cl) {
        let k = colEnds.findIndex(end => end <= it.s);
        if (k < 0) { k = colEnds.length; colEnds.push(it.ve); } else colEnds[k] = it.ve;
        it.col = k;
      }
      cl.forEach(it => (it.ncols = colEnds.length));
    }
    return items;
  }

  function renderTimeGrid(days) {
    const prevBody = main.querySelector(".tg-body");
    if (prevBody) state.scrollTop = prevBody.scrollTop;
    main.innerHTML = "";
    const t = ymd(today());
    const cols = `56px repeat(${days.length}, minmax(0, 1fr))`;

    const tg = h("div", "tg");
    const head = h("div", "tg-head");
    head.style.gridTemplateColumns = cols;
    head.append(h("div"));
    const allday = h("div", "tg-allday");
    allday.style.gridTemplateColumns = cols;
    allday.append(h("div", "gutter-label", "all day"));

    const body = h("div", "tg-body");
    const inner = h("div", "tg-body-inner");
    inner.style.gridTemplateColumns = cols;
    const gutter = h("div", "tg-gutter");
    for (let i = 0; i < 24; i++) gutter.append(h("div", "hl", i === 0 ? "" : fmtTime(i * 60).toUpperCase()));
    inner.append(gutter);

    for (const d of days) {
      const ds = ymd(d);
      // header
      const ch = h("div", "colhead" + (ds === t ? " today" : ""));
      ch.append(h("div", "dow", DOW[d.getDay()]));
      const num = h("button", "num", d.getDate());
      num.onclick = () => { state.view = "day"; goTo(d); };
      ch.append(num);
      head.append(ch);

      // all-day strip
      const adcol = h("div", "adcol");
      Holidays.on(ds).forEach(n => adcol.append(holidayChip(n)));
      const evs = eventsOn(ds);
      evs.filter(ev => ev.allDay).forEach(ev => adcol.append(eventChip(ev, ds)));
      adcol.onclick = () => openEditor(null, ds, null, true);
      allday.append(adcol);

      // timed events
      const col = h("div", "tg-col");
      col.onclick = e => {
        if (e.target !== col) return;
        const min = Math.floor((e.offsetY / HOUR) * 2) * 30;
        openEditor(null, ds, Math.min(min, 23 * 60));
      };
      const items = evs.filter(ev => !ev.allDay).map(ev => {
        const [s, e] = eventRange(ev);
        return { ev, s, e, ve: Math.max(e, s + 25) };
      });
      for (const it of layoutColumns(items)) {
        const box = h("div", "tg-event");
        const color = it.ev.color || DEFAULT_COLOR;
        box.style.background = color;
        box.style.color = textColorFor(color);
        box.style.top = `${(it.s / 60) * HOUR}px`;
        box.style.height = `${Math.max(((it.e - it.s) / 60) * HOUR - 2, 18)}px`;
        box.style.left = `calc(${(it.col / it.ncols) * 100}% + 1px)`;
        box.style.width = `calc(${100 / it.ncols}% - 6px)`;
        box.append(h("div", "t", it.ev.title));
        if (it.e - it.s >= 40) box.append(h("div", "s", `${fmtTime(it.s)} – ${fmtTime(it.e)}`));
        box.title = `${it.ev.title}\n${fmtTime(it.s)} – ${fmtTime(it.e)}`;
        box.onclick = e => { e.stopPropagation(); openEditor(it.ev, ds); };
        col.append(box);
      }
      if (ds === t) {
        const line = h("div", "now-line");
        col.append(line);
      }
      inner.append(col);
    }

    body.append(inner);
    tg.append(head, allday, body);
    main.append(tg);
    tg.style.setProperty("--sbw", `${body.offsetWidth - body.clientWidth}px`);
    updateNowLine();
    body.scrollTop = state.scrollTop ?? HOUR * 7.5;
  }

  function updateNowLine() {
    const line = main.querySelector(".now-line");
    if (!line) return;
    const n = new Date();
    line.style.top = `${((n.getHours() * 60 + n.getMinutes()) / 60) * HOUR}px`;
  }

  // ---------- Navigation ----------
  function goTo(d) {
    state.cursor = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    state.mini = new Date(d.getFullYear(), d.getMonth(), 1);
    store.set("gc-view", state.view);
    render();
  }

  function step(dir) {
    const c = state.cursor;
    if (state.view === "month") {
      const t = new Date(c.getFullYear(), c.getMonth() + dir, 1);
      const y = t.getFullYear(), m = t.getMonth();
      goTo(new Date(y, m, Math.min(c.getDate(), daysInMonth(y, m))));
    } else {
      goTo(addDays(c, state.view === "week" ? 7 * dir : dir));
    }
  }

  function setView(v) {
    state.view = v;
    state.scrollTop = null;
    goTo(state.cursor);
  }

  // ---------- Editor ----------
  let editing = null;      // event being edited (null = new)
  let chosenColor = DEFAULT_COLOR;

  function buildSwatches() {
    const wrap = $("swatches");
    wrap.innerHTML = "";
    for (const [name, hex] of COLORS) {
      const b = h("button", "swatch");
      b.type = "button";
      b.title = name;
      b.style.background = hex;
      b.dataset.color = hex;
      b.onclick = () => selectColor(hex);
      wrap.append(b);
    }
  }
  function selectColor(hex) {
    chosenColor = hex;
    document.querySelectorAll(".swatch").forEach(s => s.classList.toggle("selected", s.dataset.color === hex));
  }

  function syncAllDay() {
    $("timeFields").classList.toggle("hidden", $("fAllDay").checked);
  }

  function openEditor(ev, ds, startMin = null, allDay = false) {
    editing = ev;
    $("modalHeading").textContent = ev ? "Edit event" : "New event";
    $("deleteBtn").classList.toggle("hidden", !ev);
    if (ev) {
      $("fTitle").value = ev.title;
      $("fDate").value = ev.date;
      $("fAllDay").checked = !!ev.allDay;
      $("fStart").value = ev.start || "09:00";
      $("fEnd").value = ev.end || "10:00";
      $("fRepeat").value = ev.repeat || "none";
      $("fReminder").value = String(ev.reminder ?? -1);
      $("fDesc").value = ev.description || "";
      selectColor(ev.color || DEFAULT_COLOR);
    } else {
      if (startMin == null) {
        const n = new Date();
        startMin = ds === ymd(today()) ? Math.min((n.getHours() + 1) * 60, 23 * 60) : 9 * 60;
      }
      $("fTitle").value = "";
      $("fDate").value = ds;
      $("fAllDay").checked = allDay;
      $("fStart").value = toHHMM(startMin);
      $("fEnd").value = toHHMM(Math.min(startMin + 60, 23 * 60 + 59));
      $("fRepeat").value = "none";
      $("fReminder").value = "10";
      $("fDesc").value = "";
      selectColor(DEFAULT_COLOR);
    }
    syncAllDay();
    $("modalBackdrop").classList.remove("hidden");
    setTimeout(() => $("fTitle").focus(), 0);
  }

  function closeEditor() {
    $("modalBackdrop").classList.add("hidden");
    editing = null;
  }

  async function saveEditor(e) {
    e.preventDefault();
    if (!$("fDate").value) { $("fDate").focus(); return; }
    let start = $("fStart").value || "09:00";
    let end = $("fEnd").value || "10:00";
    if (toMin(end) <= toMin(start)) end = toHHMM(Math.min(toMin(start) + 60, 23 * 60 + 59));
    const data = {
      title: $("fTitle").value.trim() || "(No title)",
      date: $("fDate").value,
      allDay: $("fAllDay").checked,
      start, end,
      repeat: $("fRepeat").value,
      reminder: Number($("fReminder").value),
      color: chosenColor,
      description: $("fDesc").value.trim(),
    };
    if (editing) Object.assign(editing, data);
    else state.events.push({ id: newId(), ...data });

    if (data.reminder >= 0 && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    closeEditor();
    goTo(parseYmd(data.date));
    await persist();
    checkReminders();
  }

  async function deleteEditing() {
    if (!editing) return;
    if (editing.repeat && editing.repeat !== "none" &&
        !confirm(`"${editing.title}" repeats. Delete all of its occurrences?`)) return;
    state.events = state.events.filter(ev => ev !== editing);
    closeEditor();
    render();
    await persist();
  }

  // ---------- Reminders ----------
  function untilLabel(startMs) {
    const mins = Math.round((startMs - Date.now()) / 60000);
    if (mins <= 0) return "Happening now";
    if (mins < 60) return `In ${mins} minute${mins === 1 ? "" : "s"}`;
    if (mins < 24 * 60) { const hr = Math.round(mins / 60); return `In ${hr} hour${hr === 1 ? "" : "s"}`; }
    const days = Math.round(mins / 1440);
    return days === 1 ? "Tomorrow" : `In ${days} days`;
  }

  function chime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [660, 880, 990].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f;
        const t0 = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
        o.connect(g).connect(ctx.destination);
        o.start(t0); o.stop(t0 + 0.4);
      });
      setTimeout(() => ctx.close(), 1500);
    } catch { /* no audio */ }
  }

  function showAlert({ title, when, onOpen }) {
    const a = h("div", "alert");
    const img = h("img"); img.src = "logo.svg"; img.alt = "";
    const txt = h("div");
    txt.append(h("div", "a-title", title), h("div", "a-when", when));
    if (onOpen) { txt.style.cursor = "pointer"; txt.onclick = () => { onOpen(); a.remove(); }; }
    const x = h("button", "icon-btn small a-close", "✕");
    x.onclick = () => a.remove();
    a.append(img, txt, x);
    $("alerts").append(a);
  }

  let titleFlash = null;
  function flashTitle(msg) {
    clearInterval(titleFlash);
    let on = false;
    titleFlash = setInterval(() => { document.title = (on = !on) ? msg : "George's Calendar App"; }, 1000);
  }
  window.addEventListener("focus", () => { clearInterval(titleFlash); document.title = "George's Calendar App"; });

  function fireReminder(ev, d, startMs) {
    const timeTxt = ev.allDay ? "All day" : fmtTime(toMin(ev.start));
    const dateTxt = `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
    const when = `${ev.allDay ? "" : untilLabel(startMs) + " · "}${dateTxt} · ${timeTxt}`;
    const open = () => { window.focus(); state.view = "day"; goTo(d); };

    showAlert({ title: "🔔 " + ev.title, when, onOpen: open });
    chime();
    flashTitle("🔔 " + ev.title);
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const n = new Notification(`🍌 ${ev.title}`, { body: when, icon: "icon.png", requireInteraction: true, tag: ev.id + d });
        n.onclick = () => { open(); n.close(); };
      } catch { /* in-app alert is enough */ }
    }
  }

  function checkReminders() {
    const now = Date.now();
    const fired = store.get("gc-fired", {});
    const t0 = today();
    for (let i = -1; i <= 8; i++) {
      const d = addDays(t0, i), ds = ymd(d);
      for (const ev of state.events) {
        if (ev.reminder == null || ev.reminder < 0 || !occursOn(ev, ds)) continue;
        const startMin = ev.allDay ? 9 * 60 : toMin(ev.start); // all-day reminders are based on 9am
        const startMs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, startMin).getTime();
        const remindMs = startMs - ev.reminder * 60000;
        const key = `${ev.id}|${ds}|${ev.reminder}|${startMin}`;
        if (fired[key]) continue;
        if (now >= remindMs && now < Math.max(startMs, remindMs + 10 * 60000)) {
          fired[key] = now;
          fireReminder(ev, d, startMs);
        }
      }
    }
    for (const k in fired) if (now - fired[k] > 30 * 864e5) delete fired[k];
    store.set("gc-fired", fired);
  }

  // ---------- Wiring ----------
  $("todayBtn").onclick = () => goTo(today());
  $("prevBtn").onclick = () => step(-1);
  $("nextBtn").onclick = () => step(1);
  document.querySelectorAll(".view-switch button").forEach(b => (b.onclick = () => setView(b.dataset.view)));
  $("createBtn").onclick = () => openEditor(null, ymd(state.cursor));
  $("miniPrev").onclick = () => { state.mini = new Date(state.mini.getFullYear(), state.mini.getMonth() - 1, 1); renderMini(); };
  $("miniNext").onclick = () => { state.mini = new Date(state.mini.getFullYear(), state.mini.getMonth() + 1, 1); renderMini(); };
  $("eventForm").onsubmit = saveEditor;
  $("closeModal").onclick = closeEditor;
  $("cancelBtn").onclick = closeEditor;
  $("deleteBtn").onclick = deleteEditing;
  $("fAllDay").onchange = syncAllDay;
  $("modalBackdrop").addEventListener("mousedown", e => { if (e.target === $("modalBackdrop")) closeEditor(); });
  $("fStart").addEventListener("change", () => {
    // keep the same duration when the start time moves, like Google Calendar
    const s = toMin($("fStart").value);
    if (toMin($("fEnd").value) <= s) $("fEnd").value = toHHMM(Math.min(s + 60, 23 * 60 + 59));
  });

  document.addEventListener("keydown", e => {
    const modalOpen = !$("modalBackdrop").classList.contains("hidden");
    if (modalOpen) { if (e.key === "Escape") closeEditor(); return; }
    if (e.ctrlKey || e.altKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === "t") goTo(today());
    else if (k === "m") setView("month");
    else if (k === "w") setView("week");
    else if (k === "d") setView("day");
    else if (k === "c") { e.preventDefault(); openEditor(null, ymd(state.cursor)); }
    else if (k === "arrowleft" || k === "k") step(-1);
    else if (k === "arrowright" || k === "j") step(1);
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (state.view === "month") renderMonth(); }, 80);
  });

  // Tick: reminders, the red "now" line, and rolling over at midnight.
  let lastDay = ymd(today());
  setInterval(() => {
    checkReminders();
    updateNowLine();
    const d = ymd(today());
    if (d !== lastDay) { lastDay = d; render(); }
  }, 15000);

  // ---------- Start ----------
  (async () => {
    buildSwatches();
    await loadEvents();
    render();
    checkReminders();
    if (state.backend) {
      // Heartbeat so the launcher knows the window is still open.
      setInterval(() => fetch("/api/ping", { cache: "no-store" }).catch(() => {}), 5000);
      fetch("/api/ping", { cache: "no-store" }).catch(() => {});
      window.addEventListener("pagehide", () => navigator.sendBeacon("/api/bye"));
    }
  })();
})();
