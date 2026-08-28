from pathlib import Path
import subprocess, textwrap, shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "demos"
WORK = ROOT / ".demo-work"
OUT.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)
W, H = 540, 960
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

APPS = [
("cactusbyte-studios","CactusByte Studios™","CB","00d5be",[
("YOUR APP ECOSYSTEM","One launchpad for the CactusByte apps you build, use, share, and grow."),
("STUDIO REGISTRY","See the current app lineup, versions, live status, capabilities, and launch links in one place."),
("ONE ID. MANY APPS.","CactusByte ID connects cloud features and app-specific Pro access without a separate account maze."),
("IDEAS + FEEDBACK","Idea Forge, feedback, community tools, releases, and ByteLink keep product work connected to the studio."),
("INSTALL + SHARE","Launch apps, share the studio, pin favorites, and organize the lineup from a phone-first interface."),
("ONE STUDIO. ONE LAUNCHPAD.","CactusByte Studios™ brings the ecosystem together. Build it. Ship it. Keep it connected.")]),
("no-problem-pressure-washing-matrix","No Problem Pressure Washing Matrix™","NP","ff7a1a",[
("QUOTE FASTER","Turn a pressure-washing job into a structured estimate without getting buried in paperwork."),
("CAPTURE THE JOB","Use the phone camera to document the property and the surfaces that actually need cleaning."),
("AI-ASSISTED ESTIMATING","Organize job details and generate a fast evidence-based quote around the selected work."),
("FIELD WORKFLOW","Keep service information, pricing context, job notes, and quote details together while you are on site."),
("REPORT + SHARE","Turn the estimate into something useful for the customer and share the result from a mobile-first workflow."),
("FROM CURB TO QUOTE","Built for speed, accuracy, and a cleaner path from inspection to estimate.")]),
("machzero","MachZero™","M0","00e5ff",[
("WHAT IS IT WORTH?","MachZero turns a photo of a resale item into a faster, smarter pricing decision."),
("QUICK OR ADVANCED","Choose Quick Scan for speed or Advanced Scan when you want deeper appraisal context."),
("AI ITEM ANALYSIS","Capture or upload the item so the app can identify it and organize the details that affect resale value."),
("REALISTIC PRICE RANGE","Review the estimated resale range plus the factors behind it, including condition and demand."),
("WHERE TO SELL","Use marketplace guidance and listing support to move from appraisal to a stronger selling decision."),
("SCAN. PRICE. SELL SMARTER.","MachZero is resale intelligence for the moment you need an answer.")]),
("rapid-takeoff","Rapid Takeoff™","RT","4aa3ff",[
("BLUEPRINTS TO NUMBERS","Turn plan sets into usable estimating information faster."),
("START WITH THE TRADE","Choose the trade, add project details, and capture or upload the plans you need analyzed."),
("AI-ASSISTED TAKEOFF","Organize quantities and scope so you can move from blueprint review toward a structured takeoff."),
("COST BREAKDOWN","Review materials, labor, assumptions, and cost information in one estimate-focused dashboard."),
("MOBILE TO REPORT","Use the workflow from a phone or browser, then print or share the result when ready."),
("TAKEOFF WITHOUT THE DRAG","Shorten the distance between a blueprint and a decision.")]),
("acelynn-pro","Acelynn Pro™","AP","b36bff",[
("SEE THE SIGNAL","Turn audio and frequency information into a mobile diagnostic view you can actually work with."),
("CAPTURE + ANALYZE","Use the analyzer workflow to inspect incoming audio and surface the frequency information that matters."),
("READ THE DETAILS","Move beyond a simple meter with structured diagnostic information designed for quick interpretation."),
("AI-ASSISTED INSIGHT","Use analysis tools to help organize what the readings mean instead of piecing every clue together manually."),
("KEEP THE RESULT","Save useful findings in report-friendly form and share what you learned from the phone."),
("AUDIO INTELLIGENCE, MOBILE","Frequency diagnostics and practical analysis in a focused pocket-sized workflow.")]),
("pocketstomp","PocketStomp™","PS","b6ff3b",[
("YOUR SESSION, MEASURED","Turn a skate session into usable coaching and performance intelligence."),
("RIDE WITH FEEDBACK","Capture what happened while you skate instead of trying to remember it later."),
("TRICK + SESSION METRICS","Track useful performance details around tricks, timing, movement, and the overall session."),
("COACHING CUES","Use rider feedback and coaching prompts to make the next attempt more informed than the last."),
("BUILD YOUR PROGRESSION","Review session intelligence over time so practice becomes a repeatable progression loop."),
("SKATE. LEARN. REPEAT.","A skate coach designed to live where the session happens: in your pocket.")]),
("ghostlane","GhostLane™","GL","ff4d5a",[
("PRIVACY-AWARE NAVIGATION","Add privacy-focused route awareness to the way you plan and understand a drive."),
("SEE ROUTE CONTEXT","Bring relevant roadside and route-awareness information into one navigation-focused view."),
("COMPARE BEFORE YOU GO","Use available context to understand how route choices may affect your privacy preferences."),
("MOBILE ROAD INTELLIGENCE","Keep navigation and route-awareness tools together instead of bouncing between unrelated sources."),
("SHARE THE APP","Use the built-in sharing flow when another driver needs the same privacy-focused toolkit."),
("DRIVE WITH MORE CONTEXT","Built around informed route choice, situational awareness, and privacy-conscious navigation.")]),
("first-bearing","First Bearing™","1°","35d6c7",[
("FIND YOUR BEARING","Recovery-focused daily support built around direction, connection, and the next right step."),
("DAILY SUPPORT","Open the app for structured guidance and recovery-focused tools designed to be useful in the moment."),
("SPONSOR MATRIX","Keep sponsor-oriented support and connection tools close when reaching out matters."),
("FRIENDS + FAMILY","Give trusted people a clearer way to understand and support the recovery process."),
("RECOVERY MODES","Use recovery-focused modes, notifications, and sharing features as part of a consistent routine."),
("ONE STEP. ONE DEGREE. ONE DAY.","Keep the focus on direction, support, and what you can do next.")]),
("fantasy-football-matrix","Fantasy Football Matrix™","FF","f4c542",[
("DRAFT WITH A SYSTEM","Turn draft-day choices into a faster player-selection workflow."),
("COMPARE THE BOARD","Use player and roster intelligence to evaluate options while the clock is running."),
("MAKE THE NEXT PICK","Focus on the decision in front of you instead of digging through scattered rankings and notes."),
("ROSTER AWARENESS","Keep the bigger roster picture visible so one strong pick does not create a weak overall build."),
("FAST ON DRAFT DAY","Designed for quick checks, quick comparisons, and quick decisions."),
("BUILD THE BETTER ROSTER","Give your draft a repeatable decision framework from the first pick to the last.")]),
("acelynn-scouttrace","Acelynn’s ScoutTrace™","ST","39d9ff",[
("KNOW YOUR DEVICE","Bring mobile diagnostics, scanning, and security-focused device intelligence into one workflow."),
("RUN A CHECK","Use the scan flow to review device information and surface indicators that deserve a closer look."),
("FOCUS ON SIGNALS","Organize security-relevant findings so useful clues are easier to separate from background noise."),
("DIAGNOSTIC REPORTING","Review findings in a structured format instead of relying on a vague pass-or-fail screen."),
("MOBILE + SHAREABLE","Keep the experience phone-first and share useful results when another person needs the information."),
("SCAN WITH CONTEXT","Make device diagnostics clearer, faster, and easier to act on.")]),
("terraflow-matrix","TerraFlow Matrix™","TF","5dd66f",[
("FIELD WORK, ORGANIZED","A mobile-first platform for landscaping, mowing, lawn care, and irrigation field work."),
("CAPTURE THE PROPERTY","Use the phone to document job conditions, service areas, and the information needed in the field."),
("STRUCTURE THE WORK","Keep important service details together so jobs do not depend on scattered notes and memory."),
("REPORT WHAT MATTERS","Turn field information into clear, reusable job records and reports."),
("SHARE FROM THE FIELD","Move useful job information to the people who need it without leaving the mobile workflow."),
("FROM PROPERTY TO PLAN","Turn site information into a more organized operating process.")]),
("orbitgather","OrbitGather™","OG","6c7bff",[
("FIND THE NEXT JOB","Turn scattered contractor opportunity data into a usable lead workflow."),
("SEARCH YOUR MARKET","Look for public and homeowner opportunities, then narrow the search by the location that matters."),
("OPEN THE LEAD","See lead details inside the app so you can understand the job before opening the source."),
("KEEP SOURCE TRANSPARENCY","The source stays available for verification while useful job context remains front and center."),
("MOVE FROM DATA TO ACTION","Spend less time hunting through websites and more time deciding which opportunities deserve follow-up."),
("GATHER BETTER OPPORTUNITIES","Make contractor lead discovery more focused, local, and actionable.")]),
("shadownex-prime","ShadowNex Prime™","SNX","c7f5ff",[
("GLOBAL SITUATIONAL INTELLIGENCE","Turn public-source spatial data into an interactive intelligence view on a 3D globe."),
("NEXVISION™","Switch intelligence layers on and off to focus on the contacts and feeds that matter."),
("PRIMESCOPE™ + SHADOWLENS™","Select a contact for focused detail, then change visual lenses for different analysis views."),
("NEXDRAW™","Mark points, build routes, define areas, and measure directly on the globe."),
("NEXCOMMAND™ + NEXPULSE™","Use command-driven navigation and briefings while feed-health indicators show source status."),
("SEE THE WORLD AS A SYSTEM","ShadowNex Prime v2.2.0 is a mobile-friendly global situational intelligence command surface.")])
]

def rgb(h):
    h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))

def wrap(draw,text,font,maxw):
    lines=[]; cur=''
    for word in text.split():
        trial=(cur+' '+word).strip()
        if draw.textbbox((0,0),trial,font=font)[2] <= maxw: cur=trial
        else:
            if cur: lines.append(cur)
            cur=word
    if cur: lines.append(cur)
    return '\n'.join(lines)

def slide(slug,name,mark,accent,idx,heading,body,path):
    ac=rgb(accent)
    im=Image.new('RGB',(W,H),(8,10,16)); d=ImageDraw.Draw(im)
    d.rounded_rectangle((24,24,W-24,H-24),radius=28,outline=ac,width=2)
    d.rectangle((24,24,W-24,31),fill=ac)
    d.rounded_rectangle((42,65,150,118),radius=16,outline=ac,width=2)
    mf=ImageFont.truetype(BOLD,34); nf=ImageFont.truetype(BOLD,20); sf=ImageFont.truetype(BOLD,16)
    hf=ImageFont.truetype(BOLD,34); bf=ImageFont.truetype(REG,23)
    bb=d.textbbox((0,0),mark,font=mf); d.text((96-(bb[2]-bb[0])/2,87-(bb[3]-bb[1])/2-2),mark,font=mf,fill=ac)
    d.text((42,145),name,font=nf,fill=(226,234,240))
    d.text((42,190),f'60 SECOND DEMO  •  {idx+1}/6',font=sf,fill=ac)
    ht=wrap(d,heading,hf,W-84); d.multiline_text((42,265),ht,font=hf,fill='white',spacing=6)
    hb=d.multiline_textbbox((42,265),ht,font=hf,spacing=6)
    bt=wrap(d,body,bf,W-84); d.multiline_text((42,hb[3]+42),bt,font=bf,fill=(204,214,224),spacing=10)
    d.text((42,H-78),f'{name}  •  CactusByte Studios™  •  All Rights Reserved',font=ImageFont.truetype(REG,12),fill=(218,228,235))
    im.save(path,quality=86)

def render(app):
    slug,name,mark,accent,scenes=app
    ad=WORK/slug; ad.mkdir(parents=True,exist_ok=True)
    pics=[]; narration=[]
    for i,(head,body) in enumerate(scenes):
        p=ad/f'scene_{i+1}.jpg'; slide(slug,name,mark,accent,i,head,body,p); pics.append(p)
        narration.append(f'{head}. {body}')
    txt=ad/'voice.txt'; txt.write_text(' '.join(narration),encoding='utf-8')
    wav=ad/'voice.wav'
    subprocess.run(['espeak-ng','-v','en-us','-s','145','-p','42','-f',str(txt),'-w',str(wav)],check=True)
    listing=ad/'slides.txt'; lines=[]
    for p in pics: lines += [f"file '{p.as_posix()}'",'duration 10']
    lines += [f"file '{pics[-1].as_posix()}'"]
    listing.write_text('\n'.join(lines),encoding='utf-8')
    out=OUT/f'{slug}-60-second-demo.mp4'
    subprocess.run([
      'ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(listing),'-i',str(wav),
      '-filter_complex','[0:v]fps=10,scale=540:960,format=yuv420p[v];[1:a]apad=pad_dur=60[a]',
      '-map','[v]','-map','[a]','-t','60','-c:v','libx264','-preset','veryfast','-crf','31',
      '-c:a','aac','-b:a','64k','-movflags','+faststart',str(out)
    ],check=True)
    print(out.name)

for app in APPS: render(app)
shutil.rmtree(WORK,ignore_errors=True)
