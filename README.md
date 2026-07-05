# johnfissel.com

Single-page personal site for John Fissel — pure static HTML/CSS/JS, no build
step, no dependencies. Deploys to Cloudflare Pages straight from this repo.

## Preview locally

Any static file server works:

```sh
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed URL. (Security headers in `_headers` only apply on
Cloudflare Pages, not in local previews.)

## Deploying (Cloudflare Pages)

- **Framework preset:** None
- **Build command:** *(leave empty)*
- **Build output directory:** `/` (repo root)

Every push to the production branch deploys as-is. `_headers` configures
security headers (including the CSP) and cache lifetimes.

> **Editing the inline theme script?** The one-line `<script>` in
> `index.html`'s `<head>` is allow-listed in the CSP by its SHA-256 hash. If
> you change that script, recompute the hash and update
> `Content-Security-Policy` in `_headers`:
>
> ```sh
> python3 -c "import re,hashlib,base64;s=re.search(r'<script>(.*?)</script>',open('index.html').read(),16).group(1);print('sha256-'+base64.b64encode(hashlib.sha256(s.encode()).digest()).decode())"
> ```
>
> The same script is duplicated byte-for-byte in `404.html` — keep the two
> copies identical so one hash covers both.

## Analytics

Nothing is embedded in the pages. Since the site is hosted on Cloudflare,
turn on [Web Analytics](https://www.cloudflare.com/web-analytics/) from the
dashboard instead — Cloudflare injects its cookie-free beacon automatically
at serve time (Pages project → **Metrics**, or the account-level **Web
Analytics** section). The CSP in `_headers` already allow-lists
`static.cloudflareinsights.com` / `cloudflareinsights.com` so the injected
beacon isn't blocked; if you never enable analytics, those entries are
harmless.

## Editing the about text

The paragraph lives in `index.html` inside `<section id="about">` — it's the
single `<p class="lede">`. Contact links are in `<section id="contact">`.

## Where things live

| File | Purpose |
| --- | --- |
| `index.html` | All content and meta tags |
| `404.html` | Custom not-found page (served automatically by Cloudflare Pages) |
| `styles.css` | Design tokens (grayscale ramp), themes, layout, animations |
| `main.js` | Theme toggle, marquee pause, scroll reveals, parallax, scroll index, cursor dot |
| `assets/fonts/` | Self-hosted Space Grotesk + Inter (variable woff2, hashed filenames) |
| `assets/og.png` | 1200×630 social share image |
| `assets/icon.svg` / `assets/apple-touch-icon.png` / `favicon.ico` | Favicons |
| `_headers` | Cloudflare Pages security headers + caching |
| `robots.txt`, `sitemap.xml` | SEO plumbing |

Light/dark theme follows the system preference; the toggle in the fixed
bottom-left control cluster overrides it and persists the choice in
`localStorage`.
