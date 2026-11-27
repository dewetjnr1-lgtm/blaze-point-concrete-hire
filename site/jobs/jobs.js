// =====================================================================
// To connect the private database later: replace load()/save()/loadExtra()/saveExtra()
// below (the only places data is read or written). Everything else stays the same.
// Workshop job cards – PROOF OF CONCEPT
// Data is saved in this phone's browser only (localStorage), so use
// SAMPLE DATA ONLY. A real version needs a private shared database.
// =====================================================================
const ACCOUNTS_EMAIL = "accounts@example.com";   // change to the accounts person's email
const BOOKING_EMAIL = "accounts@example.com";    // change to the address booking requests go to
const PORTAL_URL = "https://portal.husqvarnagroup.com/au/"; // Husqvarna dealer portal - opens in a new tab only, no login handled by this app
const KEY = "ch_jobcards_v1";
// DEMO ONLY: a single shared PIN for all staff. Real logins (one per person) come later (Prompt 4).
// DEMO ONLY: sample company list for the Company field. Later this gets replaced
// with a read-only copy of Brad's real Xero contacts (see Phase 2 in CLAUDE.md) -
// swap this array for that list and the rest of the Company field needs no change.
const SAMPLE_COMPANIES = ["Ironbark Earthworks", "Westside Demolition", "Coastal Concrete Co", "Hartley Civil Contracting", "Bayview Builders", "Redline Paving", "Summit Structural", "Narrows Infrastructure"];
const isKnownCompany = name => SAMPLE_COMPANIES.some(c => c.toLowerCase() === name.trim().toLowerCase());
const STAFF_PIN = "1234";
const STAFF_KEY = "ch_staff_v1";
const STAFF_NAME_KEY = "ch_staff_name_v1";
const isStaff = () => localStorage.getItem(STAFF_KEY) === "1";
const staffName = () => localStorage.getItem(STAFF_NAME_KEY) || "";

const ICONS = {
  history: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  drop: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.5 4 6 7.2 6 10.5A6 6 0 0 1 6 13.5C6 10.2 8.5 7 12 3Z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg>',
  tag: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 12l9 9a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8L12 2Z"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'
};

const app = document.getElementById("app");
const STATUS = { received: "Received", diagnosing: "In diagnosis", ready: "Ready to quote", quoted: "Quoted" };
let SPARES = [];

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const newId = () => "M-" + Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join("");

function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.machines && d.jobs) return d; } catch (e) {}
  return { machines: {}, jobs: [], next: 1 };
}
let db = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
// -- Parts added by techs ("Add to our parts list"). Same idea: this phone only until the database is connected.
const EXTRA_KEY = "ch_extra_parts_v1";
function loadExtra() { try { const d = JSON.parse(localStorage.getItem(EXTRA_KEY)); if (Array.isArray(d)) return d; } catch (e) {} return []; }
function saveExtra(l) { try { localStorage.setItem(EXTRA_KEY, JSON.stringify(l)); } catch (e) {} }
let EXTRA = loadExtra();
const allParts = () => SPARES.concat(EXTRA);
function refreshParts() {}   // search list is built on demand (see showSugg)
const hay = p => p._h || (p._h = (p.description + " " + p.partNumber + " " + (p.brand || "") + " " + (p.cat || "")).toLowerCase());

const params = new URLSearchParams(location.search);
const machineId = params.get("m");
// The tag this session started on, if any. Stays fixed as staff browse around via
// Current jobs / Search, so "Receive machine" and "Back to staff menu" always refer
// to the machine they actually walked up and tapped.
let currentTag = machineId;

fetch("spares.json").then(r => r.json()).then(l => {
  SPARES = l; refreshParts();
}).catch(() => {}).finally(route);

function route() { machineId ? renderHub(machineId) : (isStaff() ? renderStaffMenu() : renderStaffLogin(null)); }
const link = id => location.origin + location.pathname + "?m=" + id;
const jobsOf = id => db.jobs.filter(j => j.machineId === id).sort((a, b) => b.n - a.n);
const openJob = id => jobsOf(id).find(j => j.status !== "quoted");
const money = n => "$" + Number(n).toFixed(2);
const jobNo = j => "JC-" + String(j.n).padStart(4, "0");
// Shrinks a photo in the phone's browser before saving (keeps it small; nothing uploaded anywhere yet).
function resizeImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) { if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; } else { w = Math.round(w * maxDim / h); h = maxDim; } }
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject; img.src = reader.result;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}
const contactName = j => [j.contactFirst, j.contactSurname].filter(Boolean).join(" ");
const contactLine = j => [contactName(j), j.contactPhone, j.contactEmail].filter(Boolean).join(" • ");
// A clickable row for a job in any staff list (Current jobs, Search). Always
// opens that machine's own page, which shows its current job and full history.
function jobRowHtml(j) {
  const m = db.machines[j.machineId] || {};
  return `<a class="jobrow" href="?m=${esc(j.machineId)}" data-m="${esc(j.machineId)}"><span><b>${jobNo(j)} &ndash; ${esc(j.company)}</b>${j.inXero === false ? ' <span class="pill received">Not in Xero</span>' : ""}<small>${esc(m.name)} ${esc(m.model)} &bull; ${esc(j.date)}</small></span><span class="pill ${j.status}">${STATUS[j.status]}</span></a>`;
}
function wireJobRows(list) {
  list.querySelectorAll("a[data-m]").forEach(a => a.onclick = e => { e.preventDefault(); history.pushState(null, "", "?m=" + a.dataset.m); renderStaffArea(a.dataset.m); });
}

// -------------------------------------------------------- STAFF MENU
// Shown after every Technician login, whether or not staff arrived via a tag.
// Not reachable without logging in first - tags are the only way anyone else gets in.
function staffHomeBarHtml() {
  return `<div class="staffbar"><span class="muted">Logged in${staffName() ? " as " + esc(staffName()) : ""}</span><a href="#" class="logoutlink" id="stafflogout">Log out</a></div>`;
}
function renderStaffMenu() {
  app.innerHTML = staffHomeBarHtml() + `<div class="hub"></div>`;
  const hub = app.querySelector(".hub");
  hub.appendChild(hubCard("Receive machine / open new job card", ICONS.tag, "", () => {
    if (currentTag) { renderStaffArea(currentTag); }
    else { const nid = newId(); currentTag = nid; history.pushState(null, "", "?m=" + nid); renderIntake(nid, null); }
  }));
  hub.appendChild(hubCard("View current jobs", ICONS.history, "alt", () => renderCurrentJobs()));
  hub.appendChild(hubCard("Search", ICONS.search, "", () => renderSearch()));
  document.getElementById("stafflogout").onclick = e => { e.preventDefault(); localStorage.removeItem(STAFF_KEY); currentTag ? renderHub(currentTag) : renderStaffLogin(null); };
}
function renderCurrentJobs() {
  app.innerHTML = staffBarHtml() + `
    <section class="panel">
      <h2>Current jobs</h2>
      <p class="muted">Received or in progress. Tap a job to open it.</p>
      <div id="list"></div>
    </section>`;
  wireStaffBar();
  const list = db.jobs.filter(j => j.status === "received" || j.status === "diagnosing").sort((a, b) => b.n - a.n);
  const listEl = document.getElementById("list");
  listEl.innerHTML = list.length ? list.map(jobRowHtml).join("") : `<p class="empty">No current jobs.</p>`;
  wireJobRows(listEl);
}
function renderSearch() {
  app.innerHTML = staffBarHtml() + `
    <section class="panel">
      <h2>Search</h2>
      <p class="muted">Search by company, machine name, model, serial number or job number.</p>
      <input id="q" type="search" placeholder="Search…" autocomplete="off">
      <div id="list"></div>
    </section>`;
  wireStaffBar();
  const listEl = document.getElementById("list");
  const draw = () => {
    const q = document.getElementById("q").value.trim().toLowerCase();
    if (!q) { listEl.innerHTML = `<p class="empty">Type to search.</p>`; return; }
    const hits = db.jobs.filter(j => {
      const m = db.machines[j.machineId] || {};
      return [jobNo(j), j.company, m.name, m.model, m.serial].join(" ").toLowerCase().includes(q);
    }).sort((a, b) => b.n - a.n);
    listEl.innerHTML = hits.length ? hits.map(jobRowHtml).join("") : `<p class="empty">Nothing matches.</p>`;
    wireJobRows(listEl);
  };
  document.getElementById("q").oninput = draw; draw();
}

// ------------------------------------------------------------------ HUB
// First page for any tag, whether the machine has been received before or not.
function hubCard(label, icon, cls, onclick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "hubcard" + (cls ? " " + cls : "");
  b.innerHTML = `<span class="ico">${icon}</span><span class="lbl">${esc(label)}</span>`;
  b.onclick = onclick;
  return b;
}
// First page for any tag, registered or not - the 4 options are always here.
// The small code in the corner is the tag's own reference, so staff can tell
// tags apart even before one is registered (nothing else to show yet).
function renderHub(id) {
  const m = db.machines[id];
  // The company only shows to logged-in staff - this page is public, and who
  // currently has a machine is customer information, not something to show
  // to anyone who taps the tag.
  const latestJob = isStaff() ? (openJob(id) || jobsOf(id)[0]) : null;
  app.innerHTML = `
    <div class="hubtop">
      <div>
        <h2 class="hubtitle">${m ? esc(m.name) + (m.model ? " " + esc(m.model) : "") : "New machine"}</h2>
        ${latestJob ? `<p class="hubcompany">${esc(latestJob.company)}</p>` : ""}
      </div>
      <span class="tagref">${esc(id)}</span>
    </div>
    <div class="hub"></div>`;
  const hub = app.querySelector(".hub");
  hub.appendChild(hubCard("Service history", ICONS.history, "", () => renderHistory(id)));
  hub.appendChild(hubCard("Cleaning instructions", ICONS.drop, "alt", () => renderCleaning(id)));
  hub.appendChild(hubCard("Book this machine", ICONS.calendar, "", () => renderBooking(id)));
  hub.appendChild(hubCard("Technician login", ICONS.lock, "staff", () => isStaff() ? renderStaffMenu() : renderStaffLogin(id)));
}
function backLink(id) {
  const a = document.createElement("a");
  a.href = "#"; a.className = "backlink"; a.textContent = "← Back";
  a.onclick = e => { e.preventDefault(); renderHub(id); };
  return a;
}

// -------------------------------------------------------- SERVICE HISTORY
// Customer-facing: dates only. No fault notes, parts or prices.
function renderHistory(id) {
  const done = jobsOf(id).filter(j => j.status === "quoted");
  app.innerHTML = "";
  app.appendChild(backLink(id));
  const p = document.createElement("section"); p.className = "panel";
  p.innerHTML = `<h2>Service history</h2>` + (done.length
    ? done.map(j => `<div class="jobrow"><span>Serviced</span><span class="muted">${esc(j.date)}</span></div>`).join("")
    : `<p class="empty">No service history yet.</p>`);
  app.appendChild(p);
}

// ------------------------------------------------------- CLEANING
function renderCleaning(id) {
  const m = db.machines[id] || {};
  const steps = m.cleaningSteps || "1. Remove all dust and debris with a brush or vacuum.\n2. Wipe down all surfaces with a damp cloth.\n3. Check and clean air filters.\n4. Coil up cords and hoses neatly.\n5. Report any damage on the booking form.";
  app.innerHTML = "";
  app.appendChild(backLink(id));
  const p = document.createElement("section"); p.className = "panel";
  p.innerHTML = `<h2>Cleaning instructions</h2><p class="cleantext">${esc(steps)}</p>` +
    (m.cleaningVideoUrl ? `<a class="btn2" href="${esc(m.cleaningVideoUrl)}" target="_blank" rel="noopener">Watch cleaning video</a>` : `<p class="muted">No video yet.</p>`);
  app.appendChild(p);
}

// ------------------------------------------------------- BOOK THIS MACHINE
function renderBooking(id) {
  const m = db.machines[id] || {};
  app.innerHTML = "";
  app.appendChild(backLink(id));
  const p = document.createElement("section"); p.className = "panel";
  p.innerHTML = `
    <h2>Book this machine</h2>
    <p class="muted">Send a booking request. This opens your email app &ndash; press send to complete it.</p>
    <form id="bf" novalidate>
      <label>Your name<input name="name" autocomplete="name"></label>
      <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
      <label>Start date<input name="start" type="date" min="${today()}"></label>
      <label>End date<input name="end" type="date" min="${today()}"></label>
      <p class="error" id="berr" role="alert"></p>
      <button class="btn" type="submit">Send booking request</button>
    </form>`;
  app.appendChild(p);
  document.getElementById("bf").onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    const err = document.getElementById("berr");
    if (!f.name.trim()) return err.textContent = "Please enter your name.";
    if (!f.phone.trim()) return err.textContent = "Please enter your phone number.";
    if (!f.start) return err.textContent = "Please choose a start date.";
    if (!f.end) return err.textContent = "Please choose an end date.";
    if (f.end < f.start) return err.textContent = "End date cannot be before the start date.";
    const subject = "Booking request: " + (m.name || "Machine " + id);
    const body = [
      "Hi Concrete Hire team,", "I'd like to book this machine.", "",
      "Machine: " + (m.name || "(new machine)") + (m.model ? " " + m.model : ""),
      "Tag link: " + link(id),
      "Name: " + f.name.trim(), "Phone: " + f.phone.trim(),
      "Start date: " + f.start, "End date: " + f.end
    ].join("\n");
    window.location.href = "mailto:" + BOOKING_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  };
}

// --------------------------------------------------- TECHNICIAN LOGIN (demo)
// Logging in once is remembered on this phone from then on (no PIN next time),
// so this only comes up again after someone logs out. Real per-person logins
// (no shared PIN) come later - see Prompt 4 in BLAZE-POINT-PLAN.md.
function renderStaffLogin(id) {
  app.innerHTML = "";
  if (id) app.appendChild(backLink(id));
  const p = document.createElement("section"); p.className = "panel";
  p.innerHTML = `
    <h2>Technician login</h2>
    <p class="muted">Staff only. Log in once &ndash; this phone will remember you after that. Demo PIN for now, real logins for each person come later.</p>
    <form id="lf" novalidate>
      <label>Your name<input name="who" value="${esc(staffName())}" autocomplete="name"></label>
      <label>PIN<input name="pin" type="tel" inputmode="numeric" autocomplete="off"></label>
      <p class="error" id="lerr" role="alert"></p>
      <button class="btn" type="submit">Log in</button>
    </form>`;
  app.appendChild(p);
  document.getElementById("lf").onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    const err = document.getElementById("lerr");
    if (!f.who.trim()) { err.textContent = "Please enter your name."; return; }
    if (f.pin.trim() !== STAFF_PIN) { err.textContent = "Wrong PIN."; return; }
    localStorage.setItem(STAFF_KEY, "1");
    localStorage.setItem(STAFF_NAME_KEY, f.who.trim());
    renderStaffMenu();
  };
}

// ------------------------------------------------------------- MACHINE
function staffBarHtml() {
  return `<div class="staffbar"><a href="#" class="backlink" id="hubback">← Back to staff menu</a><a href="#" class="logoutlink" id="stafflogout">Log out of technician mode</a></div>`;
}
function wireStaffBar() {
  // Always back to the staff menu - this bar only ever shows to someone already
  // logged in as staff, and the menu always refers to the tag they started on.
  const b = document.getElementById("hubback"); if (b) b.onclick = e => { e.preventDefault(); history.pushState(null, "", currentTag ? "?m=" + currentTag : location.pathname); renderStaffMenu(); };
  const o = document.getElementById("stafflogout"); if (o) o.onclick = e => { e.preventDefault(); localStorage.removeItem(STAFF_KEY); history.pushState(null, "", currentTag ? "?m=" + currentTag : location.pathname); currentTag ? renderHub(currentTag) : renderStaffLogin(null); };
}
function renderStaffArea(id) {
  const m = db.machines[id];
  if (!m) return renderIntake(id, null);
  const open = openJob(id);
  const latest = open || jobsOf(id)[0];
  const metaParts = [];
  if (latest) {
    metaParts.push(esc(latest.company) + (latest.inXero === false ? ' <span class="pill received">Not in Xero yet</span>' : ""));
    if (contactLine(latest)) metaParts.push(esc(contactLine(latest)));
  }
  if (m.serial) metaParts.push("Serial " + esc(m.serial));
  if (latest && latest.machineHours) metaParts.push(esc(latest.machineHours) + " hrs");
  let html = staffBarHtml() + `
    <section class="panel">
      <h2>${esc(m.name)} ${esc(m.model)}</h2>
      <p class="muted">${metaParts.join(" &bull; ")}</p>
      <div class="taglink">Tag link: ${esc(link(id))}</div>
      <a href="#" id="delmachine" class="dellink">Delete this machine</a>
    </section>`;
  app.innerHTML = html;
  wireStaffBar();
  // No longer repairable, or registered by mistake - this frees the tag's code
  // so it can be written onto a different machine. Removes the machine and
  // every job ever logged against it, so it asks twice before doing it.
  document.getElementById("delmachine").onclick = e => {
    e.preventDefault();
    if (!confirm(`Delete "${m.name}${m.model ? " " + m.model : ""}" and all ${jobsOf(id).length} job(s) against it? This can't be undone.`)) return;
    delete db.machines[id];
    db.jobs = db.jobs.filter(j => j.machineId !== id);
    save();
    renderStaffMenu();
  };
  if (open) {
    const box = document.createElement("div"); app.appendChild(box);
    open.status === "ready" ? renderAccounts(box, open, m) : renderTech(box, open, m);
  } else {
    const p = document.createElement("section"); p.className = "panel";
    p.innerHTML = `<h2>Receive this machine again</h2><p class="muted">No open job. Start a new one when it comes in for repair.</p><button class="btn" id="again" type="button">Receive for a new repair</button>`;
    app.appendChild(p);
    p.querySelector("#again").onclick = () => renderIntake(id, m);
  }
  const hist = jobsOf(id).filter(j => !open || j.n !== open.n);
  if (hist.length) {
    const h = document.createElement("section"); h.className = "panel";
    h.innerHTML = `<h2>Repair history</h2>` + hist.map(j => `<div class="jobrow"><span><b>${jobNo(j)}</b><small>${esc(j.date)} &bull; ${esc(j.company)} &bull; ${esc(j.fault)}</small></span><span><span class="pill ${j.status}">${STATUS[j.status]}</span> <a class="btn2" href="#" data-n="${j.n}">View</a></span></div>`).join("");
    app.appendChild(h);
    h.querySelectorAll("a[data-n]").forEach(a => a.onclick = e => { e.preventDefault(); const j = db.jobs.find(x => x.n == a.dataset.n); const box = document.createElement("div"); h.replaceWith(box); renderAccounts(box, j, m, true); });
  }
}

// -------------------------------------------------------------- INTAKE
// m (the machine's permanent identity - name/model/serial) is remembered on the
// tag itself from here on; only the customer, fault, hours and received-by are
// new every visit. lastJob suggests the last customer, which staff can change.
function renderIntake(id, m) {
  m = m || {};
  const lastJob = jobsOf(id)[0] || {};
  app.innerHTML = staffBarHtml() + `
    <section class="panel">
      <h2>Receive machine</h2>
      <p class="muted">${m.name ? "Confirm the details below and add what's new." : "Step 1 &ndash; fill this in when the machine arrives."}</p>
      <form id="f" novalidate>
        <div class="grid2">
          <label>Company<input name="company" id="company" value="${esc(lastJob.company)}" autocomplete="off"><div class="sugg" id="companysugg" hidden></div></label>
          <label>First name<input name="contactFirst" value="${esc(lastJob.contactFirst)}" autocomplete="off"></label>
          <label>Surname<input name="contactSurname" value="${esc(lastJob.contactSurname)}" autocomplete="off"></label>
          <label>Mobile number<input name="contactPhone" type="tel" value="${esc(lastJob.contactPhone)}" autocomplete="off"></label>
          <label>Contact email<input name="contactEmail" type="email" value="${esc(lastJob.contactEmail)}" autocomplete="off"></label>
          <label>Machine name / ID<input name="name" value="${esc(m.name)}" autocomplete="off"></label>
          <label>Model<input name="model" value="${esc(m.model)}" autocomplete="off"></label>
          <label>Serial number<input name="serial" value="${esc(m.serial)}" autocomplete="off"></label>
          <label>Machine hours<input name="machineHours" type="number" inputmode="decimal" min="0" step="0.1"></label>
          <label>Received by<input name="by" value="${esc(staffName())}" autocomplete="off"></label>
        </div>
        <label>Fault reported by customer<textarea name="fault" rows="4"></textarea></label>
        <p class="error" id="err" role="alert"></p>
        <button class="btn" type="submit">Save &amp; receive machine</button>
      </form>
    </section>`;
  wireStaffBar();
  wireCompanyAutocomplete(document.getElementById("company"), document.getElementById("companysugg"));
  document.getElementById("f").onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    const miss = [["company", "company"], ["name", "machine name"], ["fault", "fault reported"]].find(([k]) => !f[k].trim());
    if (miss) { document.getElementById("err").textContent = "Please enter the " + miss[1] + "."; return; }
    db.machines[id] = { name: f.name.trim(), model: f.model.trim(), serial: f.serial.trim(), cleaningSteps: m.cleaningSteps, cleaningVideoUrl: m.cleaningVideoUrl };
    db.jobs.push({ n: db.next++, machineId: id, date: today(), status: "received", company: f.company.trim(), inXero: isKnownCompany(f.company), contactFirst: f.contactFirst.trim(), contactSurname: f.contactSurname.trim(), contactPhone: f.contactPhone.trim(), contactEmail: f.contactEmail.trim(), machineHours: f.machineHours.trim(), receivedBy: f.by.trim(), fault: f.fault.trim(), tech: staffName(), items: [{ fault: "", work: "", hours: "", parts: [{ desc: "", pn: "", qty: "" }] }] });
    save(); renderStaffArea(id);
  };
}
// Every company name we've seen before (the 8 sample ones plus any typed in
// for a real job), so the dropdown and the contact-details prefill both work
// for companies that aren't in the sample Xero list yet.
function knownCompanyNames() {
  const byLower = new Map();
  SAMPLE_COMPANIES.forEach(c => byLower.set(c.toLowerCase(), c));
  db.jobs.forEach(j => { if (j.company && j.company.trim() && !byLower.has(j.company.trim().toLowerCase())) byLower.set(j.company.trim().toLowerCase(), j.company.trim()); });
  return [...byLower.values()];
}
// Finds that company's most recently used contact details, if we have any.
// DEMO ONLY: a made-up contact for one sample company, so the auto-fill has
// something to show before any real jobs exist. Later this comes from Xero's
// own contact details instead, same as the company list itself.
const SAMPLE_CONTACTS = {
  "westside demolition": { contactFirst: "Dave", contactSurname: "Thompson", contactPhone: "0422 334 455", contactEmail: "dave@westsidedemolition.com.au" }
};
function lookupContact(companyName) {
  const q = companyName.trim().toLowerCase();
  if (!q) return null;
  const byJobDesc = db.jobs.slice().sort((a, b) => b.n - a.n);
  for (const j of byJobDesc) {
    if (j.company && j.company.trim().toLowerCase() === q && (j.contactFirst || j.contactSurname || j.contactPhone || j.contactEmail)) {
      return { contactFirst: j.contactFirst || "", contactSurname: j.contactSurname || "", contactPhone: j.contactPhone || "", contactEmail: j.contactEmail || "" };
    }
  }
  return SAMPLE_CONTACTS[q] || null;
}
// Own dropdown rather than the browser's native <datalist> suggestions,
// which don't show up reliably on phones (notably iPhone Safari).
function wireCompanyAutocomplete(input, list) {
  const form = input.closest("form");
  const prefillContact = name => {
    const c = lookupContact(name);
    if (!c) return;
    ["contactFirst", "contactSurname", "contactPhone", "contactEmail"].forEach(field => {
      const el = form.elements[field];
      if (el && !el.value.trim() && c[field]) el.value = c[field];
    });
  };
  const hide = () => { list.hidden = true; };
  const show = () => {
    const q = input.value.trim().toLowerCase();
    const names = knownCompanyNames();
    const exact = names.find(c => c.toLowerCase() === q);
    if (exact) prefillContact(exact);  // fills in as soon as it matches, no need to tap away first
    const hits = names.filter(c => c.toLowerCase().includes(q));
    if (!hits.length) return hide();
    list.innerHTML = hits.map((c, n) => `<button type="button" data-n="${n}">${esc(c)}</button>`).join("");
    list.hidden = false;
    list.querySelectorAll("button").forEach(btn => btn.onclick = () => { input.value = hits[+btn.dataset.n]; hide(); prefillContact(input.value); });
  };
  input.addEventListener("focus", show);
  input.addEventListener("input", show);
  input.addEventListener("blur", () => prefillContact(input.value));
  document.addEventListener("click", e => { if (e.target !== input && !list.contains(e.target)) hide(); });
}

// ---------------------------------------------------------------- TECH
function hoursOptions(v) {
  let o = `<option value="">Hours…</option>`;
  for (let h = 0.25; h <= 16; h += 0.25) o += `<option value="${h}"${String(v) === String(h) ? " selected" : ""}>${h} h</option>`;
  return o;
}
function renderTech(box, job, m) {
  const draw = () => {
    box.innerHTML = `
      <section class="panel">
        <h2>${jobNo(job)} <span class="pill ${job.status}">${STATUS[job.status]}</span></h2>
        <p class="muted">Step 2 &ndash; technician. Received ${esc(job.date)}${job.receivedBy ? " by " + esc(job.receivedBy) : ""}.</p>
        <h3>Fault reported</h3><p style="margin:0">${esc(job.fault)}</p>
        <label>Tech name<input data-job="tech" value="${esc(job.tech)}" autocomplete="off"></label>
        <h3>Work items</h3>
        ${job.items.map((it, i) => `
          <div class="item">
            <h4>#${i + 1}</h4>
            <label>Fault found / work to do<textarea rows="3" data-i="${i}" data-f="fault">${esc(it.fault)}</textarea></label>
            <label>Work completed / notes<textarea rows="4" data-i="${i}" data-f="work">${esc(it.work)}</textarea></label>
            <label>Hours<select data-i="${i}" data-f="hours">${hoursOptions(it.hours)}</select></label>
            <h3>Photos (up to 3)</h3>
            <div class="photos">
              ${(it.photos || []).map((src, pi) => `<div class="photo"><img src="${src}" alt=""><button type="button" class="photox" data-rmphoto="${i}.${pi}" aria-label="Remove photo">&times;</button></div>`).join("")}
              ${(it.photos || []).length < 3 ? `<label class="photoadd"><input type="file" accept="image/*" capture="environment" hidden data-addphoto="${i}">+<span>Add photo</span></label>` : ""}
            </div>
            <p class="muted" style="margin:0 0 4px">${(it.photos || []).length} of 3 photos added. Saved on this phone only for now.</p>
            <h3>Parts used</h3>
            <button type="button" class="btn browse" data-browse="${i}">Browse Worx+ parts by category</button>
            ${it.parts.map((p, k) => `
              <div class="partwrap"><div class="part">
                <input placeholder="Search parts or type one"  value="${esc(p.desc)}" data-i="${i}" data-p="${k}" data-f="desc" autocomplete="off">
                <input placeholder="Part number" value="${esc(p.pn)}" data-i="${i}" data-p="${k}" data-f="pn" autocomplete="off">
                <select data-i="${i}" data-p="${k}" data-f="source">
                  <option value=""${!p.source ? " selected" : ""}>Source…</option>
                  <option value="Husqvarna"${p.source === "Husqvarna" ? " selected" : ""}>Husqvarna</option>
                  <option value="WORX"${p.source === "WORX" ? " selected" : ""}>WORX</option>
                  <option value="Other"${p.source === "Other" ? " selected" : ""}>Other</option>
                </select>
                <input type="number" inputmode="numeric" min="1" placeholder="Qty" value="${esc(p.qty)}" data-i="${i}" data-p="${k}" data-f="qty">
                <button type="button" class="x" aria-label="Remove part" data-rm="${i}.${k}">&times;</button>
              </div>
              <div class="sugg" hidden></div>
              <label class="chk"><input type="checkbox" data-save="${i}.${k}"> <span>Add to our parts list</span></label></div>`).join("")}
            <div class="actions"><button type="button" class="btn2" data-addpart="${i}">+ Add part</button>${job.items.length > 1 ? `<button type="button" class="btn2" data-rmitem="${i}">Remove item #${i + 1}</button>` : ""}</div>
          </div>`).join("")}
        <button type="button" class="btn2" id="additem" style="width:100%">+ Add another work item</button>
        <a class="portal" href="${esc(PORTAL_URL)}" target="_blank" rel="noopener">Look up a part in the Husqvarna portal &#8599;</a>
        <p class="error" id="err" role="alert"></p>
        <div class="actions">
          <button type="button" class="btn2" id="saveprog">Save progress</button>
          <button type="button" class="btn" id="done" style="margin-top:0">Finished &ndash; ready to quote</button>
        </div>
      </section>`;
    wire();
  };
  const wire = () => {
    box.querySelectorAll("[data-job]").forEach(el => el.oninput = () => { job[el.dataset.job] = el.value; save(); });
    box.querySelectorAll("[data-i]").forEach(el => {
      const it = job.items[+el.dataset.i], f = el.dataset.f;
      const set = () => {
        if (el.dataset.p != null) {
          const p = it.parts[+el.dataset.p]; p[f] = el.value;
          if (f === "desc") { const s = allParts().find(x => x.description === el.value); p.rrp = s && s.rrp != null ? s.rrp : ""; if (s) { p.pn = s.partNumber; const pn = box.querySelector(`[data-i="${el.dataset.i}"][data-p="${el.dataset.p}"][data-f="pn"]`); if (pn) pn.value = s.partNumber; } }
        } else it[f] = el.value;
        if (job.status === "received") job.status = "diagnosing";
        save();
      };
      el.addEventListener("input", set); el.addEventListener("change", set);
      if (f === "desc" && el.dataset.p != null) el.addEventListener("input", () => showSugg(el));
    });
    const hideAll = () => box.querySelectorAll(".sugg").forEach(x => x.hidden = true);
    const showSugg = el => {
      const wrap = el.closest(".partwrap"), list = wrap.querySelector(".sugg");
      const toks = el.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (el.value.trim().length < 2) { list.hidden = true; return; }
      const hits = allParts().filter(p => toks.every(t => hay(p).includes(t)));
      if (!hits.length) { list.hidden = true; return; }
      list.innerHTML = hits.slice(0, 8).map((p, n) => `<button type="button" data-n="${n}"><span>${esc(p.description)}</span><small>${esc(p.partNumber)}${p.brand ? " &bull; " + esc(p.brand) : ""}${p.rrp != null ? " &bull; RRP " + money(p.rrp) : ""}</small></button>`).join("")
        + (hits.length > 8 ? `<p class="more">${hits.length - 8} more &ndash; keep typing to narrow it down</p>` : "");
      list.hidden = false;
      list.querySelectorAll("button").forEach(btn => btn.onclick = () => {
        const sel = hits[+btn.dataset.n], p = job.items[+el.dataset.i].parts[+el.dataset.p];
        p.desc = sel.description; p.pn = sel.partNumber; p.rrp = sel.rrp != null ? sel.rrp : "";
        el.value = sel.description;
        wrap.querySelector('[data-f="pn"]').value = sel.partNumber;
        if (job.status === "received") job.status = "diagnosing";
        save(); list.hidden = true;
        const q = wrap.querySelector('[data-f="qty"]'); if (q) q.focus();
      });
    };
    document.addEventListener("click", e => { if (!e.target.closest(".partwrap")) hideAll(); });
    box.querySelectorAll('[data-f="desc"]').forEach(el => el.addEventListener("paste", e => {
      const t = (e.clipboardData || window.clipboardData).getData("text");
      if (!/[\t\n]/.test(t)) return;                       // plain text: paste normally
      const bits = t.split(/\t|\r?\n/).map(x => x.trim()).filter(Boolean);
      e.preventDefault();
      const p = job.items[+el.dataset.i].parts[+el.dataset.p];
      p.desc = bits[0] || ""; if (bits[1]) p.pn = bits[1];
      const hit = allParts().find(x => x.partNumber === p.pn); p.rrp = hit && hit.rrp != null ? hit.rrp : "";
      save(); draw();
    }));
    box.querySelectorAll("[data-save]").forEach(c => c.onchange = () => {
      const [i, k] = c.dataset.save.split(".").map(Number); const p = job.items[i].parts[k];
      const label = c.parentElement.querySelector("span");
      if (!c.checked) return;
      if (!p.desc.trim()) { c.checked = false; label.textContent = "Enter the part first"; return; }
      if (!allParts().some(x => x.description === p.desc.trim())) { EXTRA.push({ description: p.desc.trim(), partNumber: p.pn.trim(), source: p.source || "Other" }); saveExtra(EXTRA); refreshParts(); }
      label.textContent = "Added to parts list \u2713";
    });
    box.querySelectorAll("[data-browse]").forEach(b => b.onclick = () => {
      const i = +b.dataset.browse;
      openBrowser(sel => {
        const it = job.items[i];
        let p = it.parts.find(x => !x.desc && !x.pn && !x.qty);       // first empty row, else add one
        if (!p) { p = { desc: "", pn: "", qty: "" }; it.parts.push(p); }
        p.desc = sel.description; p.pn = sel.partNumber; p.rrp = sel.rrp != null ? sel.rrp : "";
        if (job.status === "received") job.status = "diagnosing";
        save(); draw();
      });
    });
    box.querySelectorAll("[data-addpart]").forEach(b => b.onclick = () => { job.items[+b.dataset.addpart].parts.push({ desc: "", pn: "", qty: "" }); save(); draw(); });
    box.querySelectorAll("[data-addphoto]").forEach(inp => inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      const it = job.items[+inp.dataset.addphoto];
      it.photos = it.photos || [];
      if (it.photos.length >= 3) return;
      try { it.photos.push(await resizeImage(file, 900, 0.6)); save(); draw(); } catch (e) {}
    });
    box.querySelectorAll("[data-rmphoto]").forEach(b => b.onclick = () => {
      const [i, pi] = b.dataset.rmphoto.split(".").map(Number);
      job.items[i].photos.splice(pi, 1); save(); draw();
    });
    box.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { const [i, k] = b.dataset.rm.split(".").map(Number); const ps = job.items[i].parts; ps.splice(k, 1); if (!ps.length) ps.push({ desc: "", pn: "", qty: "" }); save(); draw(); });
    box.querySelectorAll("[data-rmitem]").forEach(b => b.onclick = () => { job.items.splice(+b.dataset.rmitem, 1); save(); draw(); });
    box.querySelector("#additem").onclick = () => { job.items.push({ fault: "", work: "", hours: "", parts: [{ desc: "", pn: "", qty: "" }] }); save(); draw(); };
    box.querySelector("#saveprog").onclick = () => { job.status = "diagnosing"; save(); box.querySelector("#err").innerHTML = `<span class="ok">Saved.</span>`; };
    box.querySelector("#done").onclick = () => {
      const err = box.querySelector("#err");
      if (!job.tech.trim()) return err.textContent = "Please enter the tech name.";
      const bad = job.items.findIndex(it => !it.work.trim() || !it.hours);
      if (bad >= 0) return err.textContent = "Work item #" + (bad + 1) + " needs 'work completed' and hours.";
      job.status = "ready"; save(); renderStaffArea(job.machineId);
    };
  };
  draw();
}

// ------------------------------------------------------ CATEGORY BROWSER
// Categories come from the supplier's own price list ("Parts|Grinders|Bearings").
const TOP_FIRST = ["Parts", "Accessories"];       // the ones techs use most for repairs
function buildTree() {
  const mk = name => ({ name, kids: new Map(), parts: [], n: 0 });
  const root = mk("All parts");
  allParts().forEach(p => {
    let n = root; n.n++;
    (p.cat || "Added by our techs").split("|").map(x => x.trim()).filter(Boolean).forEach(seg => {
      if (!n.kids.has(seg)) n.kids.set(seg, mk(seg));
      n = n.kids.get(seg); n.n++;
    });
    n.parts.push(p);
  });
  return root;
}
function sortedKids(n, isRoot) {
  const all = [...n.kids.values()];
  if (!isRoot) return all;
  return TOP_FIRST.map(t => all.find(k => k.name === t)).filter(Boolean).concat(all.filter(k => !TOP_FIRST.includes(k.name)));
}
function openBrowser(pick) {
  const stack = [buildTree()];
  const ov = document.createElement("div"); ov.className = "overlay"; document.body.appendChild(ov);
  const close = () => { ov.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = e => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  let filter = "";
  const drawList = () => {
    const n = stack[stack.length - 1], list = ov.querySelector(".blist");
    const q = filter.toLowerCase().split(/\s+/).filter(Boolean);
    const kids = q.length ? [] : sortedKids(n, stack.length === 1);
    const parts = n.parts.filter(p => q.every(t => hay(p).includes(t)));
    list.innerHTML = kids.map((k, i) => `<button type="button" class="folder" data-k="${i}"><span>${esc(k.name)}</span><small>${k.n}</small></button>`).join("")
      + parts.map((p, i) => `<button type="button" class="partbtn" data-p="${i}"><span>${esc(p.description)}</span><small>${esc(p.partNumber)}${p.rrp != null ? " &bull; RRP " + money(p.rrp) : ""}</small></button>`).join("")
      + (!kids.length && !parts.length ? `<p class="empty">Nothing matches.</p>` : "");
    list.querySelectorAll(".folder").forEach(b => b.onclick = () => { stack.push(kids[+b.dataset.k]); filter = ""; drawAll(); });
    list.querySelectorAll(".partbtn").forEach(b => b.onclick = () => { const sel = parts[+b.dataset.p]; close(); pick(sel); });
  };
  const drawAll = () => {
    const n = stack[stack.length - 1];
    ov.innerHTML = `<div class="sheet browser">
      <button class="close" type="button" aria-label="Close">&times;</button>
      <h2>Browse parts</h2>
      <p class="rate crumbs">${esc(stack.map(x => x.name).join(" \u203a "))}</p>
      ${stack.length > 1 ? `<button class="btn2 back" type="button">&larr; Back</button>` : ""}
      ${n.parts.length > 5 ? `<input class="bfilter" type="search" placeholder="Filter this list…" autocomplete="off">` : ""}
      <div class="blist"></div>
    </div>`;
    ov.querySelector(".close").onclick = close;
    const back = ov.querySelector(".back"); if (back) back.onclick = () => { stack.pop(); filter = ""; drawAll(); };
    const f = ov.querySelector(".bfilter"); if (f) f.oninput = () => { filter = f.value; drawList(); };
    drawList();
  };
  drawAll();
}

// ------------------------------------------------------------ ACCOUNTS
const CSV_HEAD = ["Job No", "Date", "Company", "In Xero", "Contact first name", "Contact surname", "Contact phone", "Contact email", "Machine", "Model", "Serial", "Machine hours", "Tech", "Work item", "Fault found", "Work completed", "Hours", "Part description", "Part number", "Part source", "Qty", "RRP each"];
const toCsv = rows => "\ufeff" + rows.map(r => r.map(v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"').join(",")).join("\r\n");
function download(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
}
function rowsFor(job, m) {
  const rows = [];
  job.items.forEach((it, i) => {
    const parts = it.parts.filter(p => p.desc || p.pn || p.qty);
    (parts.length ? parts : [{ desc: "", pn: "", qty: "" }]).forEach(p => rows.push([jobNo(job), job.date, job.company, job.inXero === false ? "No" : "Yes", job.contactFirst, job.contactSurname, job.contactPhone, job.contactEmail, m.name, m.model, m.serial, job.machineHours, job.tech, i + 1, it.fault, it.work, it.hours, p.desc, p.pn, p.source, p.qty, p.rrp == null ? "" : p.rrp]));
  });
  return rows;
}
const csvFor = (job, m) => toCsv([CSV_HEAD].concat(rowsFor(job, m)));
function renderAccounts(box, job, m, readonly) {
  const totalHours = job.items.reduce((s, it) => s + (parseFloat(it.hours) || 0), 0);
  const subject = "Job ready to quote: " + jobNo(job) + " - " + job.company + " - " + m.name;
  const body = "Job " + jobNo(job) + " is ready to quote.\n\nOpen the job: " + link(job.machineId);
  box.innerHTML = `
    <section class="panel">
      <h2>${jobNo(job)} <span class="pill ${job.status}">${STATUS[job.status]}</span></h2>
      <p class="muted">Step 3 &ndash; accounts. Everything for quoting is below.</p>
      <table class="sum">
        <tr><th>Company</th><td>${esc(job.company)}${job.inXero === false ? ' <span class="pill received">Not in Xero yet</span>' : ""}</td></tr>
        <tr><th>Contact</th><td>${esc(contactLine(job))}</td></tr>
        <tr><th>Machine</th><td>${esc(m.name)} ${esc(m.model)}${m.serial ? " (serial " + esc(m.serial) + ")" : ""}</td></tr>
        <tr><th>Received</th><td>${esc(job.date)}</td></tr>
        <tr><th>Tech</th><td>${esc(job.tech)}</td></tr>
        <tr><th>Fault reported</th><td>${esc(job.fault)}</td></tr>
        <tr><th>Total hours</th><td><b>${totalHours}</b></td></tr>
      </table>
      ${job.items.map((it, i) => `
        <h3>Work item #${i + 1} &ndash; ${it.hours ? esc(it.hours) + " h" : "no hours"}</h3>
        ${it.fault ? `<p class="muted"><b>Found:</b> ${esc(it.fault)}</p>` : ""}
        <p style="margin:0 0 8px;white-space:pre-wrap">${esc(it.work)}</p>
        ${it.parts.some(p => p.desc || p.pn) ? `<table class="partsum"><tr><th>Part</th><th>Number</th><th>Source</th><th>Qty</th><th>RRP</th></tr>${it.parts.filter(p => p.desc || p.pn).map(p => `<tr><td>${esc(p.desc)}</td><td>${esc(p.pn)}</td><td>${esc(p.source)}</td><td>${esc(p.qty)}</td><td>${p.rrp !== "" && p.rrp != null ? esc(money(p.rrp)) : "&ndash;"}</td></tr>`).join("")}</table>` : `<p class="muted">No parts.</p>`}
        ${(it.photos || []).length ? `<div class="photos">${it.photos.map(src => `<div class="photo"><img src="${src}" alt=""></div>`).join("")}</div>` : ""}`).join("")}
      <div class="actions">
        <button class="btn" id="csv" type="button" style="margin-top:0">Download Excel file (.csv)</button>
        ${readonly ? "" : `<a class="btn2" href="mailto:${esc(ACCOUNTS_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Email accounts the link</a>`}
      </div>
      ${readonly || job.status === "quoted" ? "" : `<div class="actions"><button class="btn2" id="reopen" type="button">Send back to tech</button><button class="btn2" id="quoted" type="button">Mark as quoted</button></div>`}
    </section>`;
  box.querySelector("#csv").onclick = () => {
    download(jobNo(job) + ".csv", csvFor(job, m));
  };
  const ro = box.querySelector("#reopen"); if (ro) ro.onclick = () => { job.status = "diagnosing"; save(); renderStaffArea(job.machineId); };
  const q = box.querySelector("#quoted"); if (q) q.onclick = () => { job.status = "quoted"; save(); renderStaffArea(job.machineId); };
}
