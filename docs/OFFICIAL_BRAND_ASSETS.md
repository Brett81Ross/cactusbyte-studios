# CactusByte Official Brand Asset Inventory

**ABL-CB-REDESIGN-01**  
Branch: `abl/cactusbyte-v1-7-0-storefront-redesign`

## Locked rule

The redesigned Cactus🌵Byte Studios™ UI may use only an owner-approved or canonically verified app mark.

- No AI-generated substitute logos.
- No "close enough" icons.
- No generic initials presented as an official app logo.
- If the approved asset cannot be verified, the logo remains unresolved and the UI must use a text-only treatment until the asset is recovered.
- Mockup artwork establishes layout/style only; it is not production branding evidence.

## Verified assets

| App | Status | Canonical asset |
|---|---|---|
| Cactus🌵Byte Studios™ | VERIFIED | `public/logo2.png` |
| SchismMatrix™ | VERIFIED | `Brett81Ross/noproblem.pws/assets/schismmatrix-symbol.svg` |
| MachZero™ | VERIFIED | `Brett81Ross/machzero/logo1.jpg` |
| Rapid Takeoff™ | VERIFIED | `Brett81Ross/blueprint_estimator-/app/icon.svg` |
| Acelynn Pro™ | VERIFIED | production `/acelynnpro.png` |
| GhostLane™ | VERIFIED | `Brett81Ross/ghostlane-app/logo-gl.png` |
| First Bearing™ | VERIFIED | `Brett81Ross/first-bearing/first-bearing-app-icon-512-v260.png` |
| Fantasy Football Matrix™ | VERIFIED | `Brett81Ross/fantasy-football-selector-matrix/icons/ffm-mark.svg` |
| Acelynn’s ScoutTrace™ | VERIFIED | `Brett81Ross/acelynn_scoutrace/scouttrace-icon.svg` |
| ShadowNex Prime™ | VERIFIED | `Brett81Ross/shadownex-prime/brand/shadownex-mark.webp` |
| TerraFlow Matrix™ | VERIFIED | `Brett81Ross/terraflow-matrix/assets/terraflow-icon.svg` |
| OrbitGather™ | VERIFIED | `Brett81Ross/orbitgather/public/favicon.svg` |
| RIVETEX™ | VERIFIED | `Brett81Ross/rivetex/assets/rivetex-app.webp` |

## Unresolved

### PocketStomp™

**Status: BLOCKED FOR LOGO USE**

The currently served production asset `/pocketstomp-icon.png` was explicitly rejected by the owner on 2026-10-06. The PocketStomp repository does not currently contain the previously approved mark. Until that exact asset is recovered, the storefront must not display a fabricated PocketStomp icon.

Allowed interim treatment: product name as text with an "Official logo pending recovery" note.

## Implementation note

`src/data/brand-assets.ts` is the production-facing source of truth for storefront artwork. The redesign must render app logos through this map rather than trusting legacy registry logo URLs.
