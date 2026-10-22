# CactusByte Studios™ SLB13 — approved cinematic artwork integration

**Status:** Awaiting Codespaces asset installation and actual Fold screenshot acceptance. PR #42 **Draft**. No Vercel or GitHub Actions. Cost $0.

## What the owner actually approved

The **13 original PNG illustrations** in this handoff were each generated and explicitly approved by the owner in the Oct 2026 conversation. They replace generic line-art in the storefront, **not app logos**. The additional **OrbitGather logo** is approved provisionally; it is not an approved OrbitGather poster. The newly prepared OrbitGather Earth-and-orbit image is an **unapproved concept** and is intentionally isolated outside the live `public` directory.

Exact owner-approved image sources are permanently saved in personal Library:

`/CactusByte Studios/Approved Storefront Art/Source Masters/`

The complete frozen package is also saved as:

`/CactusByte Studios/Approved Storefront Art/cactusbyte-slb13-approved-cinematic-art.zip`

Library package id: `libfile_e1fcc4a0d9f08191a9ad8a85962be44e`.

## Files and product mapping

| Product (actual registry ID) | Original owner-approved source | Web image |
|---|---|---|
| Acelynn Pro (`acelynn-pro`) | `neon_cyberpunk_headphone_interface.png` | `/cinematic/acelynn-pro.webp` |
| First Bearing (`first-bearing`) | `neon_compass_guiding_star_navigation.png` | `/cinematic/first-bearing.webp` |
| Fantasy Matrix (`fantasy-matrix`) | `neon_football_analytics_helmet.png` | `/cinematic/fantasy-matrix.webp` |
| SchismMatrix (`noproblem`) | `neon_cybernetic_targeting_hud.png` | `/cinematic/noproblem.webp` |
| ShadowNex Prime (`shadownex-prime`) | `neon_orbital_ai_eye.png` | `/cinematic/shadownex-prime.webp` |
| ScoutTrace (`scouttrace`) | `neon_sci_fi_radar_locator_hud.png` | `/cinematic/scouttrace.webp` |
| Rapid Takeoff (`rapid-takeoff`) | `neon_holographic_house_blueprint.png` | `/cinematic/rapid-takeoff.webp` |
| Hustle First (`hustle-first`) | `neon_crown_marketplace_emblem.png` | `/cinematic/hustle-first.webp` |
| MachZero (`machzero`) | `neon_cyberpunk_valuation_tag.png` | `/cinematic/machzero.webp` |
| PocketStomp (`pocketstomp`) | `neon_cyberpunk_skateboard_in_motion.png` | `/cinematic/pocketstomp.webp` |
| GhostLane (`ghostlane`) | `neon_cyberpunk_roadway_hud.png` | `/cinematic/ghostlane.webp` |
| TerraFlow Matrix (`terraflow-matrix`) | `neon_leaf_over_holographic_terrain.png` | `/cinematic/terraflow-matrix.webp` |
| RIVETEX (`rivetex`) | `neon_cyberpunk_crane_framework.png` | `/cinematic/rivetex.webp` |
| OrbitGather logo **only** (`orbitgather`) | `orbitgather_neon_radar_logo.png` | `/brand/orbitgather-icon.webp` (derived badge), full original under `/brand/orbitgather-approved.png` |

These are directly source-matched; there is **no generic city/mountain background** added to the art. `source-masters/` in the ZIP retains the original unchanged PNG bytes; browser delivery WebP versions are compressed renditions of those same files. No original `public/posters/*.svg` or verified app logos are deleted.

## Install only into the current Codespace

1. Download the approved ZIP attachment from ChatGPT, **not** from Vercel.
2. Open the existing Codespace for `Brett81Ross/cactusbyte-studios`, on branch `work/slb11-approved-showcase-fidelity`.
3. Drag `cactusbyte-slb13-approved-cinematic-art.zip` from your computer into the **root of the Explorer** (top level of the repository).
4. In a fresh terminal at `/workspaces/cactusbyte-studios`, run:

```sh
git pull --ff-only
unzip -o cactusbyte-slb13-approved-cinematic-art.zip -d .
npm run qa:cinematic
npm run qa
npm run build
npx playwright test tests/showcase-layout.spec.ts --project=chromium --reporter=list
```

5. Open the private Codespaces preview. Do not open a new Vercel deployment. If port 3003 already serves an old process, stop that port-3003 terminal, restart with `npm run start -- -H 0.0.0.0 -p 3003` after build.
6. Obtain owner screenshots for Fold cover and unfolded screens. **Owner appearance approval required.** Verify actual rendered WebP images show distinctive approved scenes and that all app Open/Details links still work.

If staging the artwork files to the **same draft PR** is desired, and after `npm run qa:cinematic` succeeds in Codespaces:

```sh
git add public/cinematic/*.webp public/brand/orbitgather-approved.png public/brand/orbitgather-icon.webp
git commit -m "SLB13: install approved cinematic artwork and OrbitGather provisional logo [skip ci]"
git push
```

Do **not** `git add .` — that could include large `source-masters/`, `node_modules`, `test-results`, or the original ZIP. Only the optimized browser assets above belong in GitHub. Assets under `unapproved-orbitgather-concept/` must **not** be published.

## Objective acceptance

- Source artwork checksums verified in package manifest.
- `npm run qa:cinematic` checks **13 exact published WebP hashes plus unchanged provisional OrbitGather logo**; explicitly rejects an unapproved `public/cinematic/orbitgather.webp`.
- Existing SVGs remain as a fail-safe until files are installed.
- No change to published production, independent app repos, paid services or app monetization.
- Current OrbitGather art status: **logo provisional approved; storefront poster still pending owner approval**.

The previous generic-SVG app screenshots are a failed visual gate, even though 12/12 browser geometry tests passed. This acceptance gate must include **rendered image content**, not test counters alone.
