from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


# 1) Preserve OrbitGather in the internal registry while filtering it from every
# customer-facing surface that imports `studioApps`.
apps_path = "src/data/apps.ts"
apps = read(apps_path)
if 'export type AppLifecycle = "active" | "shelved";' not in apps:
    apps = apps.replace(
        'export type AppStatus = "Live" | "Repository";\n',
        'export type AppStatus = "Live" | "Repository";\nexport type AppLifecycle = "active" | "shelved";\n',
        1,
    )
apps = re.sub(
    r'export type StudioApp = \{[^\n]+\};',
    'export type StudioApp = {id:string;name:string;shortName:string;description:string;category:string;platform:"Android + iOS"|"Web + Mobile";status:AppStatus;version:string;logo:string;syncSource?:string;url?:string;repo:string;linkSource:string;channel:"stable"|"beta"|"experimental";lifecycle?:AppLifecycle;customerVisible?:boolean;capabilities:Capability[];monetization?:{free:string;proPrice:string;checkoutUrl?:string}};',
    apps,
    count=1,
)
apps = apps.replace(
    'export const studioApps:StudioApp[]=[',
    'export const internalStudioApps:StudioApp[]=[',
    1,
)
lines = apps.splitlines()
for i, line in enumerate(lines):
    if line.startswith('{id:"orbitgather"'):
        line = line.replace(
            'linkSource:"Vercel verified · v0.5.0 package source",channel:"beta"',
            'linkSource:"Shelved 2026-09-01 · canonical project and recovery code retained",channel:"beta",lifecycle:"shelved",customerVisible:false',
        )
        lines[i] = line
        break
else:
    raise SystemExit("OrbitGather registry record not found")
apps = "\n".join(lines).rstrip() + "\n"
filter_line = 'export const studioApps:StudioApp[]=internalStudioApps.filter(a=>a.lifecycle!=="shelved"&&a.customerVisible!==false);\n'
if filter_line not in apps:
    apps += filter_line
write(apps_path, apps)

# 2) Keep the historical release record internally, but mark it shelved.
release_path = "src/data/releases.ts"
releases = read(release_path)
releases = re.sub(
    r'^\{appId:"orbitgather"[^\n]+$',
    '{appId:"orbitgather",version:"v0.5.0",channel:"beta",title:"Shelved internal release record",notes:["Shelved from customer-facing CactusByte surfaces on 2026-09-01","Recovery authority and app-side recovery code remain retained but inactive","Canonical repository, Vercel project, rollback history, and production Supabase remain untouched"],verified:true}',
    releases,
    count=1,
    flags=re.MULTILINE,
)
if 'title:"Shelved internal release record"' not in releases:
    raise SystemExit("OrbitGather release record was not updated")
write(release_path, releases)

# 3) Preserve the canonical production record and explicitly flag lifecycle.
registry_path = "PRODUCTION_REGISTRY.md"
registry = read(registry_path)
registry = registry.replace(
    '| OrbitGather™ | v0.5.0 | `orbitgather` |',
    '| OrbitGather™ | v0.5.0 · SHELVED | `orbitgather` |',
    1,
)
registry_note = '> OrbitGather lifecycle: **SHELVED** as of 2026-09-01. Keep its canonical project, repository, rollback deployment, and production Supabase untouched. Customer-facing CactusByte surfaces exclude it until explicit resurrection approval.\n\n'
if registry_note not in registry:
    marker = '## Duplicate-project hold\n'
    if marker not in registry:
        raise SystemExit("Production registry insertion point not found")
    registry = registry.replace(marker, registry_note + marker, 1)
write(registry_path, registry)

# 4) Lock the Phase 7 queue decision into the ABL without deleting recovery work.
abl_path = "ATOMIC_BUILD_LIST.md"
abl = read(abl_path)
shelving_block = '''- [x] **SHELVED 2026-09-01:** remove OrbitGather from the active Phase 7 runtime/device queue without deleting its repository, recovery implementation, signing identity, rollback history, or production Supabase project.\n- [x] Hide OrbitGather from customer-facing CactusByte hub/storefront, App Matrix, public registry/manifest, Release Center, Pulse destinations, and public app counts by retaining it only in the internal registry with `lifecycle: "shelved"` and `customerVisible: false`.\n- [x] Preserve the already-built OrbitGather recovery authority and app-side recovery code in source as inactive infrastructure for a future resurrection.\n- [x] Keep the production OrbitGather Supabase project untouched; no recovery Edge Function activation, staging runtime test, uninstall, APK publication, or signing cutover is authorized while shelved.\n- [x] Move the active Phase 7 implementation focus to **Acelynn Pro™**; previously code-ready apps remain pending their own device verification gates.\n- [ ] Re-activate OrbitGather only after explicit product-resurrection approval and a fresh audit of its core lead-generation value, data quality, and canonical runtime architecture.\n\n'''
heading = '## OrbitGather™ v0.5.0\n\n'
if shelving_block not in abl:
    if heading not in abl:
        raise SystemExit("OrbitGather ABL section not found")
    abl = abl.replace(heading, heading + shelving_block, 1)
old_gate = '- [ ] After explicit deployment/configuration approval only, configure the same server-only `ORBITGATHER_RECOVERY_BRIDGE_SECRET` in CactusByte and Supabase, protect the legacy installation before uninstall, then prove isolated clean-install restore preserves the exact UUID, rotates the secret, and retains saved searches/opportunity metadata.'
new_gate = '- [ ] **DEFERRED WHILE SHELVED:** if OrbitGather is explicitly resurrected, configure the same server-only `ORBITGATHER_RECOVERY_BRIDGE_SECRET` in CactusByte and Supabase only after a fresh approval gate, then protect the legacy installation before uninstall and prove isolated clean-install restore preserves the exact UUID, rotates the secret, and retains saved searches/opportunity metadata.'
if old_gate in abl:
    abl = abl.replace(old_gate, new_gate, 1)
write(abl_path, abl)

print("OrbitGather shelving patch applied deterministically.")
