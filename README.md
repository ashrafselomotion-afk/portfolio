# Ashraf Selo — Portfolio

An epic, single-page portfolio with a **scroll-driven hero** (your fluffy 3D "Portfolio" clip scrubs frame-by-frame as you scroll while the rope ties it together), then a cinematic dark body covering your four crafts, tools, experience, clients and contact — plus a **private `/admin`** to manage the work and videos.

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
│  └─ work.json        ← the 4 cards + their video links (edited via /admin)
├─ admin/
│  ├─ index.html       ← the private CMS login page  (yoursite.com/admin)
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

**Recommended: host reels on Vimeo and paste the link.** Keeps the site fast and there's no file-size limit to worry about. You never touch code — you do it in `/admin`.

---

## Going live (one-time setup, ~20 min)

You'll need three free accounts: **GitHub** (stores the site), **Cloudflare** (hosts it), **Vimeo** (your videos). I can't sign up as you, but here's the exact path:

**1. Put the site on GitHub**
- Create a new **private** repo (e.g. `portfolio`).
- Upload this whole `ashraf-portfolio` folder to it (GitHub's web "upload files" works, or `git push`).

**2. Host it on Cloudflare Pages**
- Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
- Framework preset: **None**. Build command: *(empty)*. Output dir: `/`.
- Deploy → you get a live `*.pages.dev` URL (and you can attach your own domain later).

**3. Point the admin at your repo**
- Edit `admin/config.yml` → set `repo: your-github-username/portfolio`.

**4. Turn on the private login**
- The `/admin` uses your **GitHub** account for auth, so only you can get in.
- Easiest route: in Sveltia's docs, enable GitHub auth via their hosted OAuth or a small Cloudflare Worker (5 min, copy-paste). *Ping me at this step and I'll give you the exact snippet for your setup.*

**5. Use it**
- Go to `yoursite.com/admin`, log in with GitHub.
- Open **Work & Reels**, pick a card, set source = **Vimeo**, paste your reel link, **Save**.
- Cloudflare rebuilds in ~20s and it's live. That's it.

> Nobody else can log in: auth is your GitHub account on your private repo. The `/admin` page itself is just a login screen with no content until authenticated, and it's marked `noindex`.

---

## Other tweaks
- **Hero clip** — re-extract frames at 12fps / 1440px into `assets/frames/` named `f_001.jpg …`, then set `const TOTAL = <count>` in the script in `index.html`.
- **Text / colors** — copy is inline in `index.html`; palette is the `:root` CSS variables (`--pink`, `--blue`, `--rope`, `--ink`, `--paper`).
- **Clients** — the `rowA/rowB/rowC` arrays in the marquee script.

*(Want experience, tools and clients editable in `/admin` too? They're currently in the HTML — I can move them into the CMS the same way as the work cards whenever you want.)*
