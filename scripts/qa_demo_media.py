from pathlib import Path
import json, subprocess, sys, re

ROOT=Path(__file__).resolve().parents[1]
DEMO_DIR=ROOT/'public'/'demos'
# Read the same app registry source used by the CactusByte manifest.
# Preserve existing historical demo filenames for these three app IDs.
DEMO_SLUG_ALIASES = {
    'noproblem': 'no-problem-pressure-washing-matrix',
    'fantasy-matrix': 'fantasy-football-matrix',
    'scouttrace': 'acelynn-scouttrace',
}
registry_source = (ROOT/'src'/'data'/'apps.ts').read_text(encoding='utf-8')
app_ids = re.findall(r'\\{\\s*id\\s*:\\s*["\\\']([^"\\\']+)["\\\']', registry_source)
if not app_ids or len(app_ids) != len(set(app_ids)):
    sys.exit('DEMO MEDIA QA FAILED: registry missing or contains duplicate app IDs')
EXPECTED = {'cactusbyte-studios', *(DEMO_SLUG_ALIASES.get(app_id, app_id) for app_id in app_ids)}
if len(EXPECTED) != len(app_ids) + 1:
    sys.exit('DEMO MEDIA QA FAILED: demo filename aliases collide')
NEURAL_HANDLER='CactusByte American Male Neural Narration'
files=sorted(DEMO_DIR.glob('*-60-second-demo.mp4'))
seen={p.name.removesuffix('-60-second-demo.mp4') for p in files}
errors=[]
if seen!=EXPECTED:
    errors.append(f'demo set mismatch: missing={sorted(EXPECTED-seen)} extra={sorted(seen-EXPECTED)}')

for p in files:
    if p.stat().st_size < 100_000:
        errors.append(f'{p.name}: suspiciously small ({p.stat().st_size} bytes)')
        continue
    probe=subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)],capture_output=True,text=True)
    if probe.returncode:
        errors.append(f'{p.name}: ffprobe failed: {probe.stderr.strip()}')
        continue
    data=json.loads(probe.stdout)
    duration=float(data.get('format',{}).get('duration') or 0)
    streams=data.get('streams',[])
    v=next((s for s in streams if s.get('codec_type')=='video'),None)
    a=next((s for s in streams if s.get('codec_type')=='audio'),None)
    if not 59.5 <= duration <= 60.5: errors.append(f'{p.name}: duration {duration:.3f}s')
    if not v or v.get('codec_name')!='h264': errors.append(f'{p.name}: video codec is not H.264')
    if v and (v.get('width'),v.get('height'))!=(540,960): errors.append(f"{p.name}: resolution {v.get('width')}x{v.get('height')}")
    if not a or a.get('codec_name')!='aac': errors.append(f'{p.name}: audio codec is not AAC')
    if a and a.get('tags',{}).get('handler_name')!=NEURAL_HANDLER:
        errors.append(f"{p.name}: neural narration marker missing ({a.get('tags',{}).get('handler_name')!r})")
    raw=p.read_bytes()
    moov=raw.find(b'moov'); mdat=raw.find(b'mdat')
    if moov<0 or mdat<0 or moov>mdat: errors.append(f'{p.name}: MP4 is not fast-start/seek optimized')
    # Verify seeking near the middle and end produces decodable frames.
    for t in ('30','59'):
        seek=subprocess.run(['ffmpeg','-v','error','-ss',t,'-i',str(p),'-frames:v','1','-f','null','-'],capture_output=True,text=True)
        if seek.returncode:
            errors.append(f'{p.name}: seek/decode failed at {t}s: {seek.stderr.strip()}')
    print(f'OK {p.name}: {duration:.3f}s, {p.stat().st_size} bytes, H.264/AAC, neural narration, seekable')

if errors:
    print('\nDEMO MEDIA QA FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print(f'\nDEMO MEDIA QA PASSED: {len(files)} videos with American male neural narration')
