# Working on Cascadian Synergetics

## The two sources are the product

`src/storybook.html` and `src/field-station.html` are published to Claude artifacts as they are. Keep each one a single file:

- No `<!doctype>`, `<html>`, `<head>` or `<body>`: the artifact host adds them. Start with `<title>`, then metas, font links and one `<style>`.
- External scripts come only from `https://cdnjs.cloudflare.com/`, pinned to an exact version (Three.js r128). Stylesheets only from Google Fonts. Everything else is inline.
- No `alert`, `confirm` or `prompt`; the host never shows them.
- Wrap every `localStorage` read and write in `try`/`catch`.

After any edit, run `node tools/build.mjs` and `node tests/check.mjs`, and commit `src/` together with the rebuilt `storybook/` and `field-station/`.

CI is local only: `node tools/ci.mjs` checks a clean export of a commit, and `.githooks/pre-push` runs it before every push (`git config core.hooksPath .githooks`). Do not add a GitHub Actions workflow; nothing here should depend on hosted runners or billing.

## Rules the grove keeps

- **No right angles.** Trunks lean and taper, the UI uses circles, soft blobs and 120-degree hex chips, and the viewport edge dissolves into mist. The only squares belong to the incursions, which are the thing being resolved.
- **Show, don't tell.** No screen explains the theme. Rangers talk about boots, coffee, elk and slugs; the radio carries deadpan bulletins. Nothing in the text names right angles, tension, timelessness or tetrahedron arithmetic; the world shows them. The action button names the action ("Raise lanterns", "Kneel"), not the idea.
- **True geometry.** Any synergetic quantity the games show must hold. `tests/check.mjs` checks the quadray conversion, the jitterbug and the cube decomposition against the functions the field station runs; extend it when you add geometry.
- **No fail state.** The patrol cannot be lost. Tasks wait; the beat loops.
- **Comfort.** Respect `prefers-reduced-motion`: no head bob, glitch flicker or forced camera moves.

## Testing in a browser

Serve the folder (`python3 -m http.server 8000`) and use the test hooks from the console:

- Storybook: `window.__oss.step(seconds)`, `teleport(x, z)`, `finishTasks()`.
- Field station: `window.__fs.step(seconds)`, `teleport(x, z, yaw)`, `face(x, z)`, `finishTasks()`, `info()` for draw calls and triangles, `ivmCheck()`, `quadCheck(x, y, z)`, `countFrames(ms)`, `visitor()`.

A hidden tab stops `requestAnimationFrame`, so drive time with `step()` and read state rather than trusting a screenshot of a hidden page.

## Where the layout lives

- Storybook: the beat is a 480 m loop (`LOOP`); places are listed in `ZONES`; objectives in `CUBES`, `MASTS`, `SLUGS`, `INSIG`.
- Field station: the Ring sits at the origin and the beat circles it at `BEAT_R` (48 m); places are constants near the top (`HQ`, `LOOKOUT`, `POOL`, `LAMP`, `CREEK`, `TETPOOL`, `ALBINO`).
