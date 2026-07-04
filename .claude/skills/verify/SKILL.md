---
name: verify
description: Build/launch/drive recipe for verifying changes to johnfissel.com locally
---

# Verifying johnfissel.com

Static site — no build step, no dependencies. Serve the repo root and
drive it in a browser.

## Launch

```bash
python3 -m http.server 8734 --bind 127.0.0.1 &   # from the repo root
```

## Drive

Playwright with the preinstalled Chromium (`PLAYWRIGHT_BROWSERS_PATH`
already set; never run `playwright install`). The global module lives at
`/opt/node22/lib/node_modules/playwright`:

```js
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
```

Flows worth driving:

- **Hero**: screenshot at mobile (390×844) and desktop (1440×900) after
  `waitForTimeout(2000)` so the load animations settle.
- **Marquee pause** (`#marquee-toggle`): read the track position via
  `new DOMMatrixReadOnly(getComputedStyle(track).transform).m41` before
  pause, while paused, and after resume — position must be continuous
  (no snap) and frozen while paused. Rapid-fire the button to check
  state consistency.
- **Theme toggle** (`#theme-toggle`): `document.documentElement.dataset.theme`
  should flip and persist to localStorage.
- **Scroll**: parallax on `.hero-media img` (inline translate3d) and the
  `#readout-n` scroll index update on scroll.

## Gotchas

- Several glitches here are Safari-only (compositor-thread animations,
  layer memory). Chromium verifies logic and appearance, but WebKit
  behavior can only be confirmed on a real Mac/iPhone.
- Load animations run 0.6–1.6s; screenshots taken too early catch
  mid-animation frames.
- `hero.jpg` is intentionally a single-channel grayscale JPEG; CSS must
  not re-apply `filter: grayscale()` on the parallaxed image (Safari
  flashing / memory).
