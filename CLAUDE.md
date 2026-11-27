# CLAUDE.md: Blaze Point / Concrete Hire

Read this whole file before doing anything. Also read BLAZE-POINT-PLAN.md in this folder (Chris's plan and the prompts he will give you).

---

## 1. Who you're working with

- **Chris de Wet**, Perth, Western Australia. Qualified fitter and sales manager, **beginner at coding**.
- Runs this as his own side business, **Blaze Point**, as a **sole trader under his own ABN**, with the registered business name **Blaze Point Group** (registration happens only after Brad approves the demo). Keep business details (name, ABN, contact email) in the `config.js` settings file and not scattered through the pages, since Chris may later move to a company.
- Brad at Concrete Hire is the first client. **Brad has not yet approved the full scope. No money is spent until he does.**
- Uses a **Mac**. Chris types all passwords and makes all payments himself.

### How to talk to Chris (important)
- Use plain everyday words. **Explain every technical term the first time** you use it, in brackets or one short sentence. He stops reading when jargon appears unexplained.
- Compare new ideas to everyday things (a workshop, a filing room, a letterbox).
- Keep replies short. One step at a time. Tell him exactly what to click or type.
- When something is built, **give him a preview link to open**. Never tell him to look at the code on GitHub.
- **Double check for the best solution** before building. If you're unsure a tool, feature or setting exists or still works, check the current official docs first and say so.
- Write abbreviations in full the first time, with the short form in brackets.
- Don't use em dashes in any email you draft for him.

---

## 2. The project

Concrete Hire hires out concrete machinery and services machines in a workshop. Each machine gets a 3D-printed tag with an NFC chip (near field communication, the tap-your-phone technology). The tag holds a web link.

### The workflow (this is the core)
1. **Machine arrives for service.** The person receiving it **taps the tag**. The phone opens the **goods received note** (GRN): what came in, condition, who brought it, date, notes and photos.
2. **Once saved**, the machine appears in the **technician app** on the technician's phone as "received". Nobody needs to tap the tag again. (A tap on an already-received machine should open that machine's current status, not a blank form.)
3. **The technician** opens the machine, starts work, and logs **daily activities** (work done, parts used, hours).
4. **The technician marks the job complete.** The **admin** gets a **notification**.
5. **The admin** (on her computer, in her own section) creates the **quote** and the **invoice**.

### Roles
- **Receiver:** taps tag, fills in the goods received note.
- **Technician:** sees received machines, logs daily activities, marks complete.
- **Admin:** sees completed jobs, builds quotes and invoices (Phase 2).
- **Customer (public):** taps a tag on a hired machine to see cleaning instructions, limited service history and a booking button (lower priority, after the workshop flow).

### Phases
- **Phase 0 (now): finish the demo for Brad.** Start from the existing demo, make Chris's changes, then add the technician screen and a simple admin notification screen, and make phones share data through Supabase. Fake data, free tools only (Supabase free plan, free preview link).
- **Phase 1:** go live after Brad approves (domain, hosting, email, paid Supabase, real tags). Chris does the purchases.
- **Phase 2:** quotes and invoices.
- **Phase 3:** animation and the animated character (see Section 9).

### The existing demo (this is the starting point, do NOT rebuild it)
A good first version already exists at https://dewetjnr1-lgtm.github.io/concrete-hire-demo/jobs/ (code: github.com/dewetjnr1-lgtm/concrete-hire-demo). **Chris likes it and wants to change it, not replace it.** Keep its look (Concrete Hire logo, green and grey, phone first) and everything that already works.

What it does today (checked 25 Nov 2026):
- "Create new machine tag" makes a unique machine link (format like `?m=M-7h8qjd`).
- That link opens the **Receive machine** form (labelled "Step 1"): Company, Contact name and phone, Machine name / ID, Model, Serial number, Received by, Fault reported by customer. Button: "Save & receive machine".
- A list of "All jobs & history" with a search box (company, machine, model, serial or job number), and a "Download all history (.csv)" backup button.
- **Limit:** jobs are saved only on the phone that made them (the page says "sample data only"). Making all phones share the same data via Supabase is the biggest change.
- Read its code first and tell Chris in plain words what each page does before changing anything. If you find a problem, tell him before building on it.

### How we work (important)
- This file holds the **general guidelines and rules that don't change**. The **details of each screen are decided in conversation**, in small rounds: Chris asks for one to three changes, you say in plain words what you plan (and mention a better way if there is one), he says yes, you build, he checks the preview link.
- When something is settled for good, add one line under "Decisions from our chats" below. Don't copy chat details into this file otherwise.

### Decisions from our chats
_Add one line per settled decision, newest last._

1. (none yet)
2. 25 Nov 2026: new repo `blaze-point-concrete-hire` is temporarily **public** (not private as planned) so the free GitHub Pages preview link works before Supabase/customer data exist; Chris chose this over setting up Cloudflare Pages now. Switch back to private before any real data goes in.
3. 25 Nov 2026: tapping any tag now opens a "machine page" first (4 big rounded bars: Service history, Cleaning instructions, Book this machine, Technician login), styled after concretehire.com.au's real cards (diagonal photo-block + bold heading). Technician login is a single shared demo PIN (1234) for everyone until Prompt 4 sets up real per-person logins.
4. 26 Nov 2026: the old "All jobs / new machine tag / backup" screen is no longer public - it only shows after Technician login, and the phone remembers that login (no need to log in again until someone logs out). Logging in also asks for a name (kept with the PIN flag), which auto-fills "Received by" on the goods received form and "Tech name" on the job card, so we know who did what without typing it each time. This is still the shared demo PIN, not a real per-person login (that's Prompt 4).
5. 27 Nov 2026: Receive machine's Company field is a type-ahead box with 8 made-up sample companies (Ironbark Earthworks, Westside Demolition, Coastal Concrete Co, Hartley Civil Contracting, Bayview Builders, Redline Paving, Summit Structural, Narrows Infrastructure) - pick one or keep typing a new name. A name not in the sample list is flagged "Not in Xero yet" wherever that job shows up, so admin knows to add it in Xero before invoicing (see Phase 2 Xero plan). Swap the sample list for the real synced Xero list later with no other changes needed.
6. 27 Nov 2026: "Contact name & phone" split into Contact name, Mobile number and Contact email (ready for texting/emailing the customer later). Added a Machine hours field to Receive machine.
7. 27 Nov 2026: after Save & receive machine, technicians return to the "Received machines" home list (renamed from "All jobs & history") instead of straight into the job card. Tapping a job in that list now opens it directly - no more detour through the public 4-option page for someone already logged in as staff.
8. 27 Nov 2026: Husqvarna dealer portal link confirmed as https://portal.husqvarnagroup.com/au/ - opens in a new tab only, no login ever handled by this app.
9. 27 Nov 2026: the Company field uses our own type-ahead dropdown (built with plain JS) instead of the browser's native suggestion list, because that native list doesn't show up reliably on phones (iPhone Safari especially). Works the same way everywhere.
10. 27 Nov 2026: "Contact name" is now two fields, First name and Surname.
11. 27 Nov 2026: each work item on the job card now has: a Photos section (up to 3, shrunk down in the browser before saving, still phone-only until the shared database exists) and a Source field per part (Husqvarna / WORX / Other). The "Add to our parts list" tick box now saves the part's source too, so it's remembered next time.
12. 27 Nov 2026: picking or typing a company on Receive machine that we've already dealt with auto-fills First name, Surname, Mobile number and Contact email from the last job for that company - only filling in blanks, never overwriting what's already typed. Works for any company we've seen before, not just the 8 sample ones.

### Changes Chris and Brad want
_Chris will give these a few at a time. Keep this list up to date and tick them off when done._

1. ~~Company field is a type-ahead/search box~~ (done 27 Nov 2026, with a sample list for now). Still to do in Phase 2: swap the sample list for a synced, read-only copy of Brad's real Xero contacts, and save Xero's own contact ID alongside the typed name (not just the name) so invoicing later matches the exact Xero contact. Don't link the phones to Xero directly - keep a synced copy on our own private server/database, refreshed on a schedule, since Xero's access token must never be in the phone-facing website code. Confirm Xero API costs/limits at developer.xero.com/pricing before building.
2. ~~"Work to do" section on each job~~ (done 27 Nov 2026 - see decisions 9-11 above).

---

## 3. Decisions already made (don't change without asking Chris)

| Thing | Decision |
|---|---|
| Brand name | Blaze Point (no tagline, on purpose) |
| Registered business name | Blaze Point Group (sole trader). Use on anything legal, like invoices and agreements. |
| Domain (after Brad approves) | blazepoint.com.au (confirm what Chris actually bought) |
| Email (after domain) | chris@blazepoint.com.au on Zoho Mail free |
| Brad's site address (when live) | concretehire.blazepoint.com.au |
| Website host | Cloudflare Pages (free), connected to the GitHub repository so saved changes go live automatically |
| Database and logins | Supabase, **Sydney region (ap-southeast-2)** |
| Multiple clients | **One separate Supabase project per client company**, one subdomain per client. Build Brad's version so it can be copied for the next client by changing one settings file (name, logo, colours, Supabase URL and key). |
| Type of app | A **progressive web app** (a website that can be added to the phone's home screen). Plain HTML, CSS and JavaScript, no build step, unless there is a strong reason (explain it to Chris first). |
| Phone first | Most use is on phones in a workshop: big buttons, readable outdoors, works on slow mobile data, works with gloves. |
| GitHub repository | Private, named `blaze-point-concrete-hire` under Chris's account (dewetjnr1-lgtm) |

---

## 4. Tag links must never break

Once a link is written to a tag, locked and stuck on a machine, it must keep working for years.

- Tag link format: `https://concretehire.blazepoint.com.au/m/<TAG_CODE>`
- `TAG_CODE` is a short random code (e.g. `CH-7F3KQ`), **not** a number in order, so nobody can guess other machines' links.
- Use a rewrite rule so `/m/<anything>` loads the machine page (check current Cloudflare Pages docs for the right way).
- Never rename or move this path without asking Chris and explaining the impact.
- For the demo, use a temporary preview link and tell Chris **not to lock any tags** until the real domain is live.

---

## 5. Suggested database design (check and improve before building)

Write the setup as SQL in `supabase/schema.sql` and sample data in `supabase/seed.sql`.

- **machines**: id, tag_code (unique), name, type, photo_url, status (available / on hire / received / in service / complete), cleaning_steps, cleaning_video_url, created_at
- **goods_received_notes**: id, machine_id, received_at, received_by, delivered_by, condition_notes, reported_fault, photos, signature (optional)
- **job_cards**: id, machine_id, grn_id, status (open / in progress / complete), technician_id, opened_at, completed_at
- **daily_logs**: id, job_card_id, log_date, work_done, parts_used, hours, technician_id
- **notifications**: id, recipient_role or user, type (job_complete etc.), job_card_id, read (yes/no), created_at
- **service_records**: machine_id, date, summary, customer_visible (yes/no)
- **bookings**: id, machine_id, customer_name, phone, email, start_date, end_date, status
- **staff_profiles**: id (linked to the Supabase login), full_name, role (receiver / technician / admin)
- **Later (Phase 2):** quotes, quote_lines, invoices, invoice_lines, linked to job cards.

### Security (row level security: rules inside the database that decide who can see or change each row)
- Public (not logged in): can read a machine's public details and customer-visible records by tag code only.
- Public: may only reach the goods received form for a tag if Brad wants anyone to receive machines. Default to requiring a login for receiving, and explain the options to Chris.
- Receiver: create goods received notes.
- Technician: read received machines, create and edit job cards and daily logs.
- Admin: read everything for completed jobs; manage quotes and invoices; manage staff.
- Test every rule and show Chris a simple phone test proving each role only sees what it should.

### Notifications
- Start with the simplest thing that works (an in-app alert plus email) and **check current options** before adding anything that costs money, including what works on iPhone for web apps (I believe push notifications on iPhone need the app added to the home screen, but verify in current Apple and web docs).

### Quotes and invoices (Phase 2)
- Check the ATO's current rules for a valid tax invoice and quote first. Ask Chris which accounting software Brad's admin uses. Present the options (build our own or connect to his software) with costs, and wait for Chris's choice.
- Brad's admin uses Xero. Planned: Receive machine's Company field becomes a Xero-linked search box (pick existing company or type a new one); store Xero's contact ID, not just the name, so invoices match the right contact. Keep a synced copy of Xero contacts on our own server rather than linking phones to Xero directly (token security, reliability, usage limits). See item 1 under "Changes Chris and Brad want" above.

---

## 6. Folder layout (suggested)

```
concrete-hire/
  CLAUDE.md
  BLAZE-POINT-PLAN.md
  old-demo/            (untouched downloaded copy of the existing demo, reference only)
  site/                (starts as a copy of the existing demo; grow it, don't restart it)
    index.html
    m/index.html       (machine page opened by tags)
    receive/           (goods received note)
    tech/              (technician app)
    admin/             (notifications, later quotes and invoices)
    book/              (customer booking form)
    assets/
    config.js          (client name, colours, Supabase URL and publishable key)
    manifest.json      (lets the phone add it to the home screen)
    _redirects         (tag link rewrite rule, if that's the right method)
  supabase/
    schema.sql
    seed.sql
```

---

## 7. Hard rules

1. **Never** put the Supabase secret key (service_role / secret) in the website, in GitHub or in chat. Only the publishable (anon) key goes in `config.js`.
2. Never ask Chris to paste passwords into the chat.
3. Never make payments, upgrade plans or create paid services. Tell Chris what to do and the price, and let him do it.
4. Ask before deleting anything, changing live data, or changing anything already live.
5. Commit (save a version to GitHub) after each working step with a clear message.
6. Before relying on any service feature, price or limit, check the current official docs and tell Chris if anything differs from this file.
7. Customer names and phone numbers are stored: keep access tight and add a privacy note before going live.
8. After each prompt, finish with: what you did, a preview link if there is something to see, and the next step.

---

## 8. Definition of done

**Phase 0 (demo for Brad):**
- [ ] Existing demo copied over and looks the same as the original
- [ ] Chris's changes done (list above)
- [ ] Preview link works on Chris's phone
- [ ] Tap link -> goods received note -> saved -> machine shows in the technician app
- [ ] Technician logs a daily activity and marks the job complete
- [ ] Admin screen shows the notification
- [ ] Each role only sees its own section
- [ ] Brad's changes included
- [ ] One-page summary for Brad

**Phase 1 (live):** live at the real address, tags written and tested, paid Supabase plan, privacy note, written agreement with Brad.

**Phase 2:** admin can create a quote and an invoice from a completed job.

**Phase 3:** animations and character done without slowing the technician screens.

---

## 9. Animation and character (Phase 3 only)

Chris wants a modern, interactive feel: flowing animated transitions from receiving through to invoicing, a unique touch on every page, and on the admin desktop an **original** animated character that follows the mouse, looks bored when there are no jobs, and jumps and waves when a job needs quoting or invoicing.

- Do not copy or imitate any existing character or mascot. Design an original one.
- Keep technician and receiving screens fast and simple. Animation matters most on the admin desktop.
- Check which animation tools are best and how they affect speed and phone battery, explain the options in plain words, and respect the "reduce motion" setting.
- Don't start Phase 3 until the core flow works and Brad has approved it.
