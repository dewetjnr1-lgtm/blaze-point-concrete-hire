# Blaze Point: Setup Plan (version 4)

**Owner:** Chris de Wet, sole trader (a business owned and run by just you), trading as Blaze Point Group
**First client:** Brad, Concrete Hire (Perth)
**Plan date:** 25 November 2026

Print this and tick the boxes as you go.

**The big idea of this plan: finish the demo we already have, get Brad's approval, and only then spend money.**

**Important: the demo is not being rebuilt.** Claude Code already made a good first version (https://dewetjnr1-lgtm.github.io/concrete-hire-demo/jobs/). We keep it, and change it step by step.

---

## 1. What we're building

A workshop system for Brad. Every machine gets a 3D-printed tag with an NFC chip inside. NFC (near field communication) is the tap-your-phone technology, like tap-to-pay.

### The workflow, step by step

1. **Machine arrives for service.** Whoever receives it **taps the tag** and the phone opens the **goods received note** (the form that records what came in, its condition, who brought it and when).
2. **The note is saved.** The machine now shows as "received" in the **technician app** on the technician's phone. Nobody needs to tap the tag again.
3. **The technician starts work** and logs **daily activities** on that machine (what was done, parts used, hours).
4. **The technician marks the job complete.** A **notification** goes to the admin.
5. **The admin** (on her computer, in her own section of the app) creates the **quote** and the **invoice**.

### What the existing demo already does
- Looks like Concrete Hire (logo, green and grey colours), made for phones.
- **Create new machine tag** makes a unique link for one machine (looks like `?m=M-7h8qjd`).
- Tapping that link opens the **Receive machine** form (step 1): Company, Contact name and phone, Machine name / ID, Model, Serial number, Received by, Fault reported by customer.
- A list of all jobs with a search box, and a button to download all history as a spreadsheet file (.csv).
- **The limit:** jobs are saved **only on the one phone**, so a technician's phone can't see what the receiver entered. Fixing that is the biggest change, and it's what Supabase is for.

### Other features from earlier (kept, lower priority)
- Cleaning instructions page (text and video) for customers
- Customer view of service history
- Machine booking

### The look (added after the basics work)
Smooth animated page transitions from receiving to invoicing, a unique touch on every page, and an animated character on the admin desktop that is "bored" when there are no jobs and jumps and waves when something needs quoting or invoicing.

---

## 2. The phases (and what each costs)

| Phase | What happens | Cost |
|---|---|---|
| **Phase 0: Finish the demo for Brad** | Take the existing demo and make your changes. Then add the technician and admin parts, and share data between phones. You preview it through a link. | **$0** (free Supabase plan, free preview link) |
| **Brad says yes** | Brad approves the demo and agrees the price in writing. | n/a |
| **Phase 1: Go live** | ABN, business name, domain, email, real hosting, paid Supabase. Write the real tags. | about $50 in year one, about $72 a year after, plus Supabase about US$25 to 35 a month |
| **Phase 2: Quotes and invoices** | Admin section builds quotes and invoices from the logged work. | Build time only (plus any accounting software Brad already uses) |
| **Phase 3: Animation and character** | Flowing animations and the animated desk character. | Build time only |

All prices are estimates. Check the real price on each website before you pay.

---

## 3. Decisions already made

- [x] Brand name: **Blaze Point** (no tagline, on purpose)
- [x] Registered business name (when you register): **Blaze Point Group**. Plain "Blaze Point" was not available on ASIC's check.
- [x] Structure: **sole trader under your own ABN** (not Busch's). Registering happens **after Brad approves the demo**, not now.
- [x] Email (when the domain is bought): **chris@blazepoint.com.au**
- [x] Brad's site address (when live): **concretehire.blazepoint.com.au**
- [x] Domain seller: **VentraIP** (domain only, no hosting)
- [x] Website host: Cloudflare Pages (free). Email: Zoho free.
- [x] Database: **Supabase, Sydney region**, one separate project per client company
- [x] Phone app: a **progressive web app** (a website you can add to the phone's home screen so it behaves like an app). No app store needed.
- [x] Computer: Mac, Claude Code already installed

---

## 4. Part A: Your jobs

### Step 1. Check with Brad (before anything else)
- [ ] Tell Brad the new idea: tap to receive, technician app, daily logs, notification to admin, quotes and invoices.
- [ ] Ask him: what accounting software does his admin use for invoices (for example Xero or MYOB)? This decides how Phase 2 works.
- [ ] Ask him: who receives machines, how many technicians, and does the admin use a computer all day?
- [ ] Ask him to look at the demo when it's ready and say yes or no **before you spend anything**.
- [ ] Write down his changes in Section 7.

### Step 2. Create your Supabase account (free)
**Time:** 15 minutes.

- [ ] Sign up at **supabase.com** (signing in with GitHub is easiest).
- [ ] Create an **organisation** called `Blaze Point` on the **Free** plan.
- [ ] Create a **project** called `concrete-hire`.
  - Region: **Sydney** (Oceania, `ap-southeast-2`). You can't easily change this later.
  - Database password: let it generate one and **save it in a password manager**. Never paste it into a chat.
- [ ] Open **Project Settings, then API** (or "API Keys") and write down:
  - [ ] The **Project URL** (looks like `https://abcd1234.supabase.co`)
  - [ ] The **publishable key** (may be called the `anon` public key). Safe to put in the website.
- [ ] **Never share the secret key** (called `service_role` or "secret").
- [ ] The free plan pauses after a week of no use. That's fine for a demo. Check supabase.com/pricing for current limits.

### Step 3. Get GitHub ready
- [ ] In Terminal, type `gh --version` and press Enter. If it says "command not found", Claude Code will help you install it.
- [ ] You log in to GitHub yourself when Claude Code asks.

### Step 4. Make the project folder
- [ ] In Finder, make a folder: `Documents/Blaze Point/concrete-hire`
- [ ] Put these two files in it: `BLAZE-POINT-PLAN.md` and `CLAUDE.md`.
- [ ] Have your **Project URL** and **publishable key** ready.

### Step 5. Run Claude Code (Part B below) and finish the demo
- [ ] Work in **small rounds**: you tell Claude Code one change, it does it, you look at the preview link, then the next change.
- [ ] Write the changes you want in Section 7 first, so nothing gets forgotten.
- [ ] You can do Prompts 1 and 2 **before** creating the Supabase account (Step 2). You only need Supabase when you reach Prompt 3, where phones start sharing information.

### Step 6. Show Brad the demo and get his approval
- [ ] Send Brad the preview link. Let him try it on his phone.
- [ ] Get his changes and his approval in writing (a text or email is fine).
- [ ] Agree the monthly price and what is included.

### Step 7. Only after Brad says yes: set up the business and the address
**Cost:** about $50 in year one.

- [ ] Read your Busch employment contract to make sure a side business is allowed.
- [ ] **ABN:** go to **abr.gov.au** yourself and apply as an **individual / sole trader**. It's free. Have your tax file number ready. You may need myID (the government's digital identity app). Use only the government site.
- [ ] **Business name:** register **Blaze Point Group** in the same application ($47 for 1 year). Re-check availability at ASIC first, since the earlier check was only guidance.
- [ ] GST (goods and services tax): I believe registration is only needed above $75,000 a year, but check the form or ask an accountant.
- [ ] **Domain:** ask VentraIP whether a sole trader with the registered business name Blaze Point Group can hold **blazepoint.com.au**. If yes, buy it, untick hosting and email extras, **check the renewal price** and turn on **auto-renew**. Backup: blazepoint.com.
- [ ] **Cloudflare:** create a free account, add the domain, and change the nameservers at VentraIP to the two Cloudflare ones.
- [ ] **Email:** create a free Zoho Mail account for the domain and make **chris@blazepoint.com.au**. Add the records Zoho gives you into Cloudflare. The free plan works in the app and website, not in Outlook.
- [ ] Move Supabase to the **Pro plan** (about US$25 a month plus about US$10 per project) so projects don't pause. Leave the spending cap on.

### Step 8. Tags
- [ ] **Don't lock any tag** until the domain is final. Tags can be rewritten if they aren't locked (I believe; check the NFC app you use).
- [ ] Write the final links only after the domain works.

---

## 5. Part B: Claude Code prompts (copy each in, one at a time)

Open Terminal, go to the project folder, and start Claude Code:

```
cd ~/Documents/"Blaze Point"/concrete-hire
claude
```

(`cd` means "change directory", which just means "go into this folder".)

Do one prompt at a time. Wait until Claude Code is finished and you've checked the preview link.

### Prompt 1: Get set up and learn what we already have
```
Read CLAUDE.md and BLAZE-POINT-PLAN.md in this folder first.
We are NOT rebuilding the demo. We are improving the one that already exists.
1. Check what's installed on my Mac that we need (git, the GitHub CLI "gh", Node) and help me install anything missing, explaining each step in plain words.
2. Help me log in to GitHub (I'll type my own login).
3. Download the existing demo from https://github.com/dewetjnr1-lgtm/concrete-hire-demo into a folder called old-demo. Don't change the old repository.
4. Read the demo's code and tell me, in plain words, what each page does, what is saved where, and what the limits are.
5. Create a new private GitHub repository called blaze-point-concrete-hire, copy the demo into the site folder, and connect it.
6. Give me a preview link to the copy so I can check it looks the same as the original.
Short summary at the end, and what's next. Don't change anything yet.
```

### Prompt 2: Make my changes (repeat this prompt as many times as you like)
Use this one for every round of changes. Fill in the change in the brackets. Keep each round small (one to three changes).
```
Keep the existing look and everything that already works. Make only these changes:
[WRITE YOUR CHANGES HERE, for example: "Add a field for ... ", "Move ... ", "Make the buttons bigger"]
Before you build, tell me in plain words what you plan to change and anything that might be a better way. Wait for my yes. After building, give me a preview link and tell me what to check. Then add one line to CLAUDE.md under "Decisions from our chats" for anything we settled.
```

### Prompt 3: Share information between phones (the biggest change)
Do this when you're happy with the receiving form. You need your Supabase Project URL and publishable key (Step 2).
```
Right now jobs are saved only on one phone. Change the demo so the receiver's phone, the technician's phone and the admin's computer all see the same jobs, using Supabase with the Project URL and publishable key I'll give you now: [PASTE PROJECT URL] and [PASTE PUBLISHABLE KEY].
First design the database from CLAUDE.md (machines, goods received notes, job cards, daily activity logs, notifications, staff with roles) and write it as a SQL file in the supabase folder with security rules (row level security). Explain each table in plain words and tell me exactly where to paste it in the Supabase dashboard and what I should see.
Add 5 sample machines, 2 technicians, 1 admin and some sample history.
Then build in this order, stopping after each so I can preview:
1. Tag link -> Receive machine form -> saved to Supabase.
2. Technician screen: list of received machines, open one, log daily activities, mark complete.
3. Admin screen: shows a notification when a job is complete.
Keep the existing look. Phone first, big buttons, readable in sunlight. After each step give me a preview link. Don't send me to GitHub.
```

### Prompt 4: Logins and roles
```
Set up logins for the receiver, technician and admin roles and walk me through creating test accounts in Supabase step by step.
Then give me a phone test that proves a customer who taps a tag can only see the goods received form, not job cards, and that each role only sees its own section.
```

### Prompt 5: Notifications
```
Add the "job complete" notification to the admin. First check the current best options and tell me what works on iPhone and on a computer, what each one costs, and what the limits are. Start with the simplest one that works (for example email or an on-screen alert) and tell me before adding anything that costs money.
```

### Prompt 6: Demo summary for Brad
```
Write me a one-page summary to show Brad with the preview link: what it does, how his staff use it step by step, what's included, what he needs to give me (machine list, photos, technician names, accounting software), and what happens next.
```

### Prompt 7 (only after Brad approves and the domain works): Go live
```
Help me publish the site on Cloudflare Pages, connected to the GitHub repository so every saved change goes live automatically, at concretehire.blazepoint.com.au.
Check the current Cloudflare docs before each step and tell me exactly what to click. Then give me the exact link for each tag and how to write them with the NFC Tools app (or whichever app is best, check first), plus a full phone test checklist.
```

### Prompt 8 (Phase 2): Quotes and invoices
```
Look at Brad's invoicing needs: [PASTE WHAT BRAD TOLD ME, INCLUDING HIS ACCOUNTING SOFTWARE]. First check the ATO's current requirements for a valid tax invoice and quote in Australia, and check whether it's better to build invoicing ourselves or connect to his accounting software. Tell me the options in plain words with costs, and wait for my choice before building.
```

### Prompt 9 (Phase 3): Animation and character
```
Add polish: smooth animated transitions between pages and a small unique touch on each page. Keep the technician pages fast and simple. On the admin desktop view only, add an original animated character (not any existing character) that looks bored when there are no jobs and waves and jumps when a job needs quoting or invoicing, and a character that follows the mouse. Check which animation tools are best and how they affect speed and phone battery, tell me the options, and respect the "reduce motion" setting for people who need it.
```

---

## 6. Safety rules (read once)

- Passwords and the Supabase **secret key** never go into chat, the website or GitHub.
- You make all payments and create all accounts yourself.
- Claude Code should ask before deleting anything or changing anything live.
- Once a tag is written, locked and stuck on a machine, its link must keep working. Don't change web addresses without asking Claude first.
- The system will hold customer names and phone numbers. Add a short privacy note before going live.

---

## 7. Changes to the demo (fill this in)

**My changes (Chris):**

1. 
2. 
3. 
4. 
5. 

**Brad's changes:**

1. 
2. 
3. 

Give these to Claude Code a few at a time using Prompt 2.

---

## 8. What I found when checking names (25 November 2026)

- **ASIC business name check:** "Blaze Point" is **not available** (BLAZE POINT PTY LTD and BLAZEPOINT (AUST) PTY LTD exist). "Blaze Point Group", "Blaze Point Digital" and "Blaze Point Co" were **currently available**. ASIC says its check does not guarantee a name.
- **IP Australia trade mark search:** "Blaze Point" and "Blazepoint" returned **zero results**. That doesn't prove there are no similar names.
- **Domain:** blazepoint.com.au and blazepoint.au were available on VentraIP.
- Names can be taken by someone else while you wait, so check again before registering.

---

## 9. Moving to a Pty Ltd later (optional)

- Official costs from 1 July 2026: company registration $636, then $342 a year to ASIC.
- A company needs its own ABN. You'd change the domain's registered owner, move your accounts, and sign your agreement with Brad again in the company's name. Get advice on that.
- The tags keep working, because they depend on the domain, not who owns it.

---

## 10. Things to confirm along the way

- Brad's approval and price (before spending).
- Busch employment contract allows a side business.
- ASIC name still available on the day you register.
- VentraIP confirms you can hold blazepoint.com.au.
- GST threshold, and tax on income. Talk to an accountant once Brad pays.
- Zoho free plan terms, Cloudflare Pages free business use, Supabase prices.
- How notifications work on iPhone (Prompt 5).
- The existing demo's code: Claude Code will check it in Prompt 1 and tell you if anything needs fixing before we build on it.
