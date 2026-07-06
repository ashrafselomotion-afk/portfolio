# Ashraf Selo — Portfolio

An epic, single-page portfolio with a **scroll-driven hero** (your fluffy 3D "Portfolio" clip scrubs frame-by-frame as you scroll while the rope ties it together), then a cinematic dark body covering your four crafts, tools, experience, clients and contact — plus a **private `/ashrafiko`** to manage the work and videos.

## Run it locally
```bash
cd ashraf-portfolio
python3 -m http.server 4599
# open http://localhost:4599
```

## Structure
```
ashraf-portfolio/
├─ index.html          ← the site (HTML + CSS + JS, no build step)
├─ content/
│  └─ work.json        ← the 4 cards + their video links (edited via /ashrafiko)
├─ ashrafiko/
│  ├─ index.html       ← the private CMS login page  (yoursite.com/ashrafiko)
│  └─ config.yml       ← CMS config — set your GitHub repo here
├─ assets/
│  ├─ frames/          ← 120 JPGs = the scroll-scrub hero
│  ├─ poster.jpg       ← first frame (fallback)
│  ├─ showreel.mp4     ← your 3D rope clip, looping in the Motion card
│  └─ uploads/         ← media you upload through the admin lands here
└─ README.md
```

## How adding a video works
The four discipline cards read from `content/work.json`. Each card has:
- `media_type`: `vimeo` · `youtube` · `file` · `none`
- `media_value`: the link (Vimeo/YouTube) or path (`assets/uploads/clip.mp4`)

**Recommended: host reels on Vimeo and paste the link.** Keeps the site fast and there's no file-size limit to worry about. You never touch code — you do it in `/ashrafiko`.

---

## It's already live

- **Site:** https://ashrafselomotion-afk.github.io/portfolio/
- **Admin:** https://ashrafselomotion-afk.github.io/portfolio/ashrafiko/
- **Repo:** https://github.com/ashrafselomotion-afk/portfolio (GitHub Pages, `main` branch)

Any change pushed to `main` auto-redeploys in ~1 minute.

### The admin (Pages CMS)
The `/ashrafiko` page sends you to **[Pages CMS](https://pagescms.org)** — a free, hosted editor that signs you in with **your GitHub account**, so only you can edit. It reads the schema in `.pages.yml` and saves to `content/work.json`.

**First-time connect (once):** open `/ashrafiko` → **Sign in with GitHub** → install the Pages CMS GitHub app on your account → pick the **portfolio** repo. After that, `/ashrafiko` drops you straight into the editor.

**Add a reel:** Editor → **Work & Reels** → pick a card → set *Video source* = **Vimeo** → paste the link → **Save**. Live in ~1 min.

> Prefer no third party? You can also edit content directly (login-gated by GitHub):
> https://github.com/ashrafselomotion-afk/portfolio/edit/main/content/work.json

---

## Other tweaks
- **Hero clip** — re-extract frames at 12fps / 1440px into `assets/frames/` named `f_001.jpg …`, then set `const TOTAL = <count>` in the script in `index.html`.
- **Text / colors** — copy is inline in `index.html`; palette is the `:root` CSS variables (`--pink`, `--blue`, `--rope`, `--ink`, `--paper`).
- **Clients** — the `rowA/rowB/rowC` arrays in the marquee script.

*(Want experience, tools and clients editable in `/ashrafiko` too? They're currently in the HTML — I can move them into the CMS the same way as the work cards whenever you want.)*
