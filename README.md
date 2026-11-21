# 🔍 Harbor Lights — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/kazuki-fortune88/makefun-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/kazuki-fortune88/makefun-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

An original spot-the-difference game that runs offline in a desktop browser.
Two near-identical hand-drawn scenes sit side by side; click the seven hidden
differences in each one before the timer runs out. Three cozy scenes —
**Lighthouse Cove** at dusk, **Grandma's Garden** in the sun, and the
**Lantern Market** at night — each drawn entirely in code on a 2D canvas.
No images, no libraries, no network requests, no build step.

## How to play

- **Click** a difference on either picture to circle it (green ring + check).
  Each find is worth 100 points; finishing a level adds a time bonus.
- **Wrong clicks** cost 20 points and shake the frame.
- **Hint (H)** rings one difference you haven't found yet in gold for two
  seconds. Three hints per level, 30 points each.
- **R** restarts the level; **Enter** starts / moves to the next scene.
- Find all 7 differences in a level to unlock the next scene. Clear all
  three scenes to win.

## How to run

```sh
node serve.ts
# open http://localhost:8080
```

Or open `game/index.html` from any static file server. The game needs only
a desktop browser; everything it loads lives under `game/`.

## Files

- `game/index.html` + `game/style.css` — page shell and styling
- `game/src/levels.js` — the three levels and their seven differences each
- `game/src/scenes.js` — the three scenes, drawn twice from one painter
  (left plain, right with the differences applied)
- `game/src/game.js` — state, input, timer, scoring, hints and rendering
- `game/src/audio.js` — synthesized Web Audio sounds (no audio files)
- `game/src/main.js` — boot and deterministic `?shot=` states for screenshots
- `main.ts` — the make.fun hand-in program (Node 22, stdlib only)
- `screenshots/` — real renders of the game in a browser

Built for the [make.fun](https://make.fun) bounty
**best-spot-the-difference-game-20261121-0451** — referral code `4fxhr3y1`.
