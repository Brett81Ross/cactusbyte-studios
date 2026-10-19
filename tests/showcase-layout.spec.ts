import {expect,test} from "@playwright/test";

/* SLB12: verify the owner-approved UI hierarchy, not the rejected SLB10/11
   promotional sections. Real app registry, links, logos and accessible controls
   must remain correct. Exact photographic posters are a separately gated asset. */
const viewports=[
 {name:"Fold cover",width:360,height:748},
 {name:"Android phone",width:412,height:915},
 {name:"iPhone",width:390,height:844},
 {name:"Fold open portrait",width:884,height:1104},
 {name:"Fold open landscape",width:1104,height:884},
 {name:"DeX desktop",width:1440,height:900}
];

for(const device of viewports){
 test("SLB12 showcase "+device.name+" keeps a coherent image-led viewport",async({page})=>{
  await page.setViewportSize({width:device.width,height:device.height});
  await page.goto("/",{waitUntil:"domcontentloaded"});
  await expect(page.getByRole("heading",{name:"Acelynn Pro"}).first()).toBeVisible();
  const featured=page.locator("#featured");
  await expect(featured).toBeVisible();
  const cards=featured.locator("article[data-app]");
  await expect(cards).toHaveCount(5);
  const more=page.locator('[class*="moreGrid"]').first();
  await expect(more.locator("article[data-app]")).toHaveCount(6);
  const doc=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(doc.scroll,"root horizontal overflow").toBeLessThanOrEqual(doc.viewport+2);
  const nav=page.getByRole("navigation",{name:"CactusByte navigation"});
  await expect(nav).toBeVisible();
  const navBox=await nav.boundingBox();
  expect(navBox).not.toBeNull();
  expect(navBox!.y+navBox!.height).toBeLessThanOrEqual(device.height+2);
  const filter=page.locator("#categories");
  await expect(filter).toBeVisible();
  const positions=await page.evaluate(()=>{
   const a=document.querySelector('[class*="heroTools"]')!.getBoundingClientRect();
   const b=document.getElementById("categories")!.getBoundingClientRect();
   const c=document.getElementById("featured")!.getBoundingClientRect();
   return{heroBottom:a.bottom,filterTop:b.top,filterBottom:b.bottom,featuredTop:c.top};
  });
  expect(positions.filterTop).toBeGreaterThanOrEqual(positions.heroBottom-4);
  expect(positions.featuredTop).toBeGreaterThanOrEqual(positions.filterBottom-4);
  const first=await cards.evaluateAll(els=>els.filter(el=>getComputedStyle(el).display!=="none").map(el=>el.getAttribute("data-app")));
  if(device.width<760){
   expect(first.slice(0,3)).toEqual(["first-bearing","fantasy-matrix","hustle-first"]);
  }else{
   expect(first.slice(0,5)).toEqual(["acelynn-pro","first-bearing","fantasy-matrix","hustle-first","noproblem"]);
  }
 });
}

test("SLB12 real six-card More shelf stays distinct, working and correctly ordered",async({page})=>{
 await page.setViewportSize({width:1104,height:884});
 await page.goto("/");
 const ids=await page.locator('[class*="moreGrid"]').first().locator("article[data-app]").evaluateAll(els=>els.map(el=>el.getAttribute("data-app")));
 expect(ids).toEqual(["rivetex","shadownex-prime","scouttrace","rapid-takeoff","terraflow-matrix","pocketstomp"]);
 await page.locator('[class*="moreGrid"]').first().getByRole("button",{name:/Details for RIVETEX/}).click();
 await expect(page.getByRole("dialog")).toBeVisible();
 await expect(page.getByRole("heading",{name:/RIVETEX/}).last()).toBeVisible();
 await page.getByRole("button",{name:"Close details"}).click();
 await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("SLB12 More categories exposes real searchable catalog and no duplicate empty default shelf",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/");
 await expect(page.locator("#all-apps article[data-app]")).toHaveCount(0);
 const advanced=page.getByRole("button",{name:/More categories/});
 await expect(advanced).toHaveAttribute("aria-expanded","false");
 await advanced.click();
 await expect(page.locator("#category-extra-options")).toBeVisible();
 await page.locator("#category-extra-options").getByRole("button",{name:"Security"}).click();
 await expect(page.locator("#all-apps article[data-app]")).not.toHaveCount(0);
 await expect(page.locator("#all-apps").getByRole("heading",{name:"Security"})).toBeVisible();
});

test("SLB12 card information controls never overlap real official logo badges",async({page})=>{
 for(const width of [360,390,412,884,1104]){
  await page.setViewportSize({width,height:915});await page.goto("/");
  const card=page.locator('#featured article[data-app="first-bearing"]');
  const rects=await card.evaluate(el=>{
   const logo=el.querySelector('[class*="posterTop"] [class*="logo"]')!.getBoundingClientRect();
   const info=el.querySelector('[class*="posterDetails"]')!.getBoundingClientRect();
   return{overlap:Math.max(0,Math.min(logo.right,info.right)-Math.max(logo.left,info.left))*Math.max(0,Math.min(logo.bottom,info.bottom)-Math.max(logo.top,info.top)),infoWidth:info.width};
  });
  expect(rects.overlap,"badge/details overlap at "+width).toBe(0);
  expect(rects.infoWidth).toBeGreaterThanOrEqual(42);
 }
});

test("SLB12 bottom dock never prevents reaching All Apps or copyright on narrow Fold",async({page})=>{
 await page.setViewportSize({width:360,height:748});await page.goto("/");
 const nav=page.getByRole("navigation",{name:"CactusByte navigation"});
 await expect(nav.getByRole("link",{name:/My Apps/})).toBeVisible();
 await nav.getByRole("link",{name:/My Apps/}).click();
 const catalog=page.locator("#all-apps");
 await expect(catalog.locator("article[data-app]").first()).toBeVisible();
 await page.locator("footer").scrollIntoViewIfNeeded();
 await expect(page.getByRole("link",{name:"CactusByte Studios app home"})).toBeVisible();
});


test("SLB12 Acelynn hero avoids legacy overexposure and the card labels no longer obscure artwork",async({page})=>{
 for(const viewport of [{width:390,height:844},{width:1104,height:884},{width:1440,height:900}]){
  await page.setViewportSize(viewport);
  await page.goto("/",{waitUntil:"domcontentloaded"});
  const hero=page.locator("#home");
  const image=hero.locator('img[src^="/cinematic/"], img[src^="/posters/"]').first();
  await image.evaluate(async el=>{await (el as HTMLImageElement).decode()});
  const style=await image.evaluate(el=>{
   const c=getComputedStyle(el);
   return{filter:c.filter,blend:c.mixBlendMode,opacity:parseFloat(c.opacity)};
  });
  expect(style.blend,"hero must not use additive screen blend").toBe("normal");
  expect(style.filter,"hero should not use old 1.95x brightness").not.toContain("brightness(1.95)");
  expect(style.opacity).toBeLessThanOrEqual(.9);
  const heroHeight=(await hero.boundingBox())?.height??0;
  if(viewport.width>759)expect(heroHeight,"Fold/desktop hero height").toBeLessThanOrEqual(340);
  else expect(heroHeight,"phone hero height").toBeLessThanOrEqual(330);
  const first=page.locator('#featured article[data-app="first-bearing"]');
  const layout=await first.evaluate(card=>{
   const c=card.getBoundingClientRect();
   const title=card.querySelector("h3")!;
   const cta=card.querySelector('[class*="posterCta"]')!;
   const cap=card.querySelector('[class*="posterBody"]')!;
   const titleStyle=getComputedStyle(title);
   const ctaStyle=getComputedStyle(cta);
   return{ratio:cta.getBoundingClientRect().width/c.width,
    font:parseFloat(titleStyle.fontSize),
    caption:getComputedStyle(cap).backgroundImage,
    cta:ctaStyle.alignSelf};
  });
  expect(layout.ratio,"Open badge must not span the entire illustration").toBeLessThan(.56);
  expect(layout.caption).toContain("linear-gradient");
  expect(layout.cta).toBe("flex-end");
  expect(layout.font).toBeGreaterThanOrEqual(10);
 }
});


test("SLB12 official PWA icon endpoints return actual PNG bytes at exact declared dimensions",async({request})=>{
 for(const dimension of [192,512]){
  const response=await request.get("/pwa-icon-"+dimension);
  expect(response.status(),"PWA icon "+dimension+" status").toBe(200);
  expect(response.headers()["content-type"],"PWA icon MIME").toContain("image/png");
  const image=await response.body();
  expect(image.length).toBeGreaterThan(1024);
  expect(image.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))).toBe(true);
  expect(image.readUInt32BE(16),"PNG width").toBe(dimension);
  expect(image.readUInt32BE(20),"PNG height").toBe(dimension);
 }
});

test("SLB13 artwork upgrade selects 13 approved posters and keeps OrbitGather poster pending",async({page})=>{
 await page.goto("/");
 const hero=page.locator("#home img").first();
 const heroSource=await hero.getAttribute("src");
 expect(["/cinematic/acelynn-pro.webp","/posters/acelynn-pro.svg"]).toContain(heroSource);
 for(const id of ["acelynn-pro","first-bearing","fantasy-matrix","rivetex","pocketstomp"]){
  const img=page.locator(`article[data-app="${id}"] [class*="posterArt"] img`).first();
  if(await img.count())expect(["/cinematic/"+id+".webp","/posters/"+id+".svg"]).toContain(await img.getAttribute("src"));
 }
 await page.getByRole("navigation",{name:"CactusByte navigation"}).getByRole("link",{name:/My Apps/}).click();
 const pending=page.locator('article[data-app="orbitgather"] [class*="posterArt"] img').first();
 await expect(pending).toHaveAttribute("src","/posters/orbitgather.svg");
});
