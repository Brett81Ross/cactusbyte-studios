# Cactus🌵Byte Studios™ Production Registry

Reconciled again on 2026-10-06 for CactusByte v1.6.2 Registry Truth. The canonical CactusByte hub is live at `cactusbyte-studios.vercel.app` on v1.6.2. SchismMatrix™ production is v1.1.0, Fantasy Football Matrix™ production is v1.7.4, and TerraFlow Matrix™ remains v1.7.0 live with newer work staged separately. This registry records verified production truth and preserves deployment/rollback evidence; staged repository work is not promoted to production truth without a verified deployment.

| App | Version | Canonical Vercel project | Production domain | Source repository | Verified production / rollback deployment |
| --- | --- | --- | --- | --- | --- |
| Cactus🌵Byte Studios™ | v1.6.2 live; v1.7.0 staged | `cactusbyte-studios` | `cactusbyte-studios.vercel.app` | `Brett81Ross/cactusbyte-studios` | LIVE `dpl_CXKjaxvWqjXL16Z5vP1hQQ8jAo92` (`38517865dc7c6f5970fcdf7ff3876feb15874793`); prior READY rollback `dpl_6EuSrgFV4SCWDkzpbM87RBjMnBiP` |
| SchismMatrix™ | v1.1.0 | `noproblem-pws` | `noproblem-pws.vercel.app` | `Brett81Ross/noproblem.pws` | `dpl_9gsBxE429wPha5RiHr3R5EZrdJCu` (READY; rollback candidate) |
| MachZero™ | v1.4.1 | `machzero` | `machzero-beta.vercel.app` | `Brett81Ross/machzero` | `dpl_5t8AKxs6k63T9mGHZEAPiZTBLsaP` |
| Rapid Takeoff™ | v0.3.0 | `blueprint-estimator` | `blueprint-estimator.vercel.app` | `Brett81Ross/blueprint_estimator-` | `dpl_9W2ZV2dzc5kRLivsQruRgAR4TyqC` |
| Acelynn Pro™ | v1.2.0 | `acelynn` | `acelynn.vercel.app` | `Brett81Ross/Acelynn` | `dpl_7LUbYit3LkdPYBPdoLM7eMyCYUwj` |
| PocketStomp™ | v1.0.0 | `pocketstomp-v2-brett81ross` | `pocketstomp-v2-brett81ross.vercel.app` | `Brett81Ross/pocketstomp` | `dpl_9RozD8FT12vvssxbDeVG3AayDyEg` |
| GhostLane™ | v1.7.4 | `ghostlane-app` | `ghostlane-app.vercel.app` | `Brett81Ross/ghostlane-app` | `dpl_5BZVwAY5cYQPaxqGGSbCyRygABpE` |
| First Bearing™ | v3.0.0 | `first-bearing` | `first-bearing.vercel.app` | `Brett81Ross/first-bearing` | `dpl_7tsye4FnVfV3UWmctGjh5wZQMErG` (READY; rollback candidate) |
| Fantasy Football Matrix™ | v1.7.4 | `fantasy-football-selector-matrix` | `fantasy-football-selector-matrix.vercel.app` | `Brett81Ross/fantasy-football-selector-matrix` | `dpl_FCtie3H1N2j8YPaXmeSJyeYNRsPL` (READY; rollback candidate) |
| Acelynn’s ScoutTrace™ | v1.2.1 | `acelynn-scoutrace` | `acelynn-scoutrace.vercel.app` | `Brett81Ross/acelynn_scoutrace` | `dpl_BYVPu6i8Xrbcts697rRCc1Mfpp7Q` |
| ShadowNex Prime™ | v2.2.0 | `shadownex-prime` | `shadownex-prime.vercel.app` | `Brett81Ross/shadownex-prime` | `dpl_DEn8svsz4WxeXpp5Pqz2i12JinnC` |
| TerraFlow Matrix™ | v1.7.0 live; v1.15.0 staged | `terraflow-matrix` | `terraflow-matrix.vercel.app` | `Brett81Ross/terraflow-matrix` | `dpl_784aR3rSMoze7BMFuweYc5fDE6AR` |
| OrbitGather™ | v0.5.0 | `orbitgather` | `orbitgather-wahh.vercel.app` | `Brett81Ross/orbitgather` | `dpl_7EWSQfWGDyJAGs2hJanjwC7LCt8E` |
| RIVETEX™ | v0.18.0 | `rivetex` | `rivetex.cactusbytestudios.com` | `Brett81Ross/rivetex` | `dpl_Gi6ak3qMcXZgLZpfYvbRyFH2SPtS` (READY; rollback candidate) |

## CactusByte production verification

- Current canonical deployment: `dpl_CXKjaxvWqjXL16Z5vP1hQQ8jAo92`.
- Current deployment Git SHA: `38517865dc7c6f5970fcdf7ff3876feb15874793`.
- Canonical domain: `https://cactusbyte-studios.vercel.app/`.
- Live hub reports v1.6.2; post-deploy truth reconciliation is recorded in main.
- Registry truth preserves Acelynn Pro web v1.2.0, Fantasy Football Matrix v1.7.4, SchismMatrix v1.1.0, and TerraFlow v1.7.0 while keeping unreleased/staged work separate.
- Owner Health remains fail-closed when unauthenticated (`OWNER_REQUIRED`).
- No Vercel runtime errors were found in the release smoke-test window.
- The project deployment gate was restored to `git.deploymentEnabled=false` after the production deployment.
- Runtime Vercel API deployment verification is currently fail-closed/unavailable unless `VERCEL_ACCESS_TOKEN` and `VERCEL_TEAM_ID` are configured in production; no status is falsely promoted to verified when those credentials are absent.
- Android permanent-signing cutover and Google Play publication were not performed by this release.

## Duplicate-project hold

These projects are not part of the canonical release path. Their current ready deployment and generated domains have been recorded below. None has the canonical production domain for its app family. Keep them intact until their recovery value is reviewed; do not deploy or delete them as part of an app feature batch.

| App family | Non-canonical project | Generated domain | Ready deployment |
| --- | --- | --- | --- |
| Cactus🌵Byte Studios™ | `cactusbyte-studios-l6rj` | `cactusbyte-studios-l6rj.vercel.app` | `dpl_ANULbaMxtnyuj1uLMjmpz1rSxfAR` |
| TerraFlow Matrix™ | `terraflow-matrix-dui4` | `terraflow-matrix-dui4.vercel.app` | `dpl_9xBMdwvSrJhz4mNxsHaaWx8UzyPS` |
| PocketStomp™ | `pocketstomp` | `pocketstomp.vercel.app` | `dpl_E7CQMUcUBjgEWhLNp5FbHjLvMK1A` |
| PocketStomp™ | `pocketstomp-z6yl` | `pocketstomp-z6yl.vercel.app` | `dpl_FcunZtu7kjRurU3XvbrXWSomr7vU` |
