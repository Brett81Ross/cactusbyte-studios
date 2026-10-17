import {expect,test} from "@playwright/test";

const viewports=[
 {name:"Z Fold cover",width:360,height:748},
 {name:"Android phone",width:412,height:915},
 {name:"iPhone",width:390,height:844},
 {name:"Z Fold open portrait",width:884,height:1104},
 {name:"Z Fold open landscape",width:1104,height:884},
 {name:"Samsung DeX",width:1440,height:900}
];

for(const viewport of viewports){
 test.describe(`storefront · ${viewport.name}`,()=>{
  test.use({viewport:{width:viewport.width,height:viewport.height},hasTouch:true});
  test("stays contained and matches the approved product hierarchy",async({page})=>{
   const errors:string[]=[];
   page.on("pageerror",error=>errors.push(error.message));
   const response=await page.goto("/",{waitUntil:"domcontentloaded"});
   expect(response).not.toBeNull();
   expect(response!.status()).toBeLessThan(500);

   await expect(page.getByText("FEATURED APP",{exact:true})).toBeVisible();
   await expect(page.locator("h1").filter({hasText:"Acelynn Pro"})).toBeVisible();
   await expect(page.getByRole("heading",{name:"Featured Apps",exact:true})).toBeVisible();
   await expect(page.getByRole("heading",{name:"More from CactusByte Studios",exact:true})).toBeVisible();
   await expect(page.getByRole("heading",{name:"All Apps",exact:true})).toBeVisible();
   await expect(page.getByRole("button",{name:/Open App/})).toBeVisible();
   await expect(page.getByRole("button",{name:/Android App/})).toHaveCount(0);

   await page.waitForTimeout(900);

   const audit=await page.evaluate(()=>{
    const doc=document.documentElement,body=document.body;
    const overflow=Math.max(doc.scrollWidth,body.scrollWidth)-window.innerWidth;
    const visible=(el:Element)=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0};
    const smallControls=Array.from(document.querySelectorAll("button,a,input"))
      .filter(visible)
      .map(el=>{const r=el.getBoundingClientRect();return{label:(el.textContent||(el as HTMLInputElement).placeholder||"").trim().slice(0,70),width:r.width,height:r.height}})
      .filter(x=>x.height<38||x.width<38);
    const escapedImages=Array.from(document.images).filter(visible).flatMap(img=>{
      const r=img.getBoundingClientRect();
      const hostElement=img.closest("article,button,a,[class*=logo],[class*=wordmark]");
      const host=hostElement?.getBoundingClientRect();
      const escapes=!host||r.left<host.left-2||r.right>host.right+2||r.top<host.top-2||r.bottom>host.bottom+2;
      if(!escapes)return [];
      return [{
        src:img.getAttribute("src"),alt:img.alt,
        image:{x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)},
        host:hostElement?.tagName+"."+(hostElement?.className||""),
        bounds:host?{x:Math.round(host.x),y:Math.round(host.y),width:Math.round(host.width),height:Math.round(host.height)}:null
      }];
    });
    return{overflow,smallControls,escapedImages};
   });

   await page.screenshot({path:`/tmp/cactusbyte-storefront-${viewport.name.replace(/\\s+/g,"-").toLowerCase()}.png`,fullPage:true});

   expect(audit.overflow,`horizontal overflow: ${audit.overflow}px`).toBeLessThanOrEqual(2);
   expect(audit.smallControls,`small controls: ${JSON.stringify(audit.smallControls)}`).toEqual([]);
   expect(audit.escapedImages,"images escaping their assigned visual hosts").toEqual([]);
   expect(errors).toEqual([]);

   await page.screenshot({path:`/tmp/cactusbyte-storefront-${viewport.name.replace(/\s+/g,"-").toLowerCase()}.png`,fullPage:true});
  });
 });
}

test("storefront hero has no unrelated photo or autoplay video, and the verified Acelynn demo remains accessible",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await expect(page.locator('#home video')).toHaveCount(0);
 await expect(page.locator('#home [class*=heroWaveform]')).toHaveCount(1);
 await expect(page.locator('#home [class*=heroVinyl]')).toHaveCount(1);
 const bg=await page.locator('#home [class*=heroPortrait]').evaluate(el=>getComputedStyle(el).backgroundImage);
 expect(bg).not.toContain("unsplash");
 await page.locator('#home').getByRole("button",{name:/Watch Demo/}).click();
 await expect(page.locator('video[src="/demos/acelynn-pro-60-second-demo.mp4"]')).toHaveCount(1);
});

test("approved storefront uses verified app logos",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await expect(page.getByAltText("Acelynn Pro official logo").first()).toBeVisible();
 await expect(page.getByAltText("First Bearing official logo").first()).toBeVisible();
 await expect(page.getByAltText("Fantasy Matrix official logo").first()).toBeVisible();
 await expect(page.getByAltText("Hustle First official logo").first()).toBeVisible();
 await expect(page.getByAltText("RIVETEX official logo").first()).toBeVisible();
 await expect(page.getByAltText("ScoutTrace official logo").first()).toBeVisible();
});

test("PocketStomp never falls back to the rejected icon",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await expect(page.locator('img[src*="pocketstomp-icon.png"]')).toHaveCount(0);
 const pocketCard=page.locator("article").filter({hasText:"PocketStomp"}).last();
 await expect(pocketCard).toBeVisible();
 await pocketCard.getByRole("button",{name:/Details for PocketStomp/}).click();
 await expect(page.getByText("Official logo pending recovery. No substitute artwork is being used.")).toBeVisible();
});

test("Fold landscape keeps the CactusByte side rail without covering content",async({page})=>{
 await page.setViewportSize({width:1104,height:884});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const nav=page.getByRole("navigation",{name:"CactusByte sections"});
 const navRect=await nav.boundingBox();
 const heroRect=await page.locator("#home").boundingBox();
 expect(navRect).not.toBeNull();
 expect(heroRect).not.toBeNull();
 expect(navRect!.x).toBeLessThan(40);
 expect(navRect!.width).toBeGreaterThan(90);
 expect(heroRect!.x).toBeGreaterThan(navRect!.x+navRect!.width);
});

test("phone storefront becomes a full-width horizontal-shelf experience",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const nav=page.getByRole("navigation",{name:"CactusByte sections"});
 await expect(nav).toBeHidden();
 const featured=page.locator("section").filter({has:page.getByRole("heading",{name:"Featured Apps",exact:true})}).locator("article");
 expect(await featured.count()).toBeGreaterThan(1);
 const first=await featured.first().boundingBox();
 const second=await featured.nth(1).boundingBox();
 expect(first).not.toBeNull();
 expect(second).not.toBeNull();
 expect(second!.x).toBeGreaterThan(first!.x);
});

test("portfolio stays focused until the user asks for all apps",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const portfolio=page.locator("#all-apps");
 const viewAll=portfolio.getByRole("button",{name:/View All Apps/});
 await expect(viewAll).toBeVisible();
 await expect(portfolio.locator("article")).toHaveCount(8);
 await viewAll.click();
 const expandedCount=await portfolio.locator("article").count();
 expect(expandedCount).toBeGreaterThan(8);
 await expect(portfolio.getByRole("button",{name:/Show Less/})).toBeVisible();
});

test("storefront footer links to CactusByte and accurately shows release version and rights",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const footer=page.locator("footer");
 await expect(footer).toContainText("Cactus🌵Byte Studios™");
 await expect(footer).toContainText("v1.7.0");
 await expect(footer).toContainText("All Rights Reserved");
 await expect(footer.getByRole("link",{name:"CactusByte Studios app home"})).toHaveAttribute("href","/");
});

test("studio footer uses the same release version and tappable brand",async({page})=>{
 await page.goto("/studio",{waitUntil:"domcontentloaded"});
 const footer=page.locator("footer");
 await expect(footer).toContainText("Cactus🌵Byte Studios™ · v1.7.0 · All Rights Reserved");
 await expect(footer.getByRole("link",{name:"Cactus🌵Byte Studios™"})).toHaveAttribute("href","/");
});

test("SLB11 secondary category chips are initially hidden but fully accessible on the Fold cover",async({page})=>{
 await page.setViewportSize({width:360,height:748});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const strip=page.locator("#category-filter-options");
 await expect(strip).toBeHidden();
 const toggle=page.getByRole("button",{name:/More categories/});
 await expect(toggle).toHaveAttribute("aria-expanded","false");
 await toggle.click();
 await expect(strip).toBeVisible();
 await expect(page.getByRole("button",{name:/Hide categories/})).toHaveAttribute("aria-expanded","true");
 const buttons=strip.locator("button");
 const first=await buttons.nth(0).boundingBox();
 const second=await buttons.nth(1).boundingBox();
 expect(first).not.toBeNull();expect(second).not.toBeNull();
 expect(first!.width).toBeGreaterThan(65);
 expect(second!.x).toBeGreaterThanOrEqual(first!.x+first!.width);
 expect(await strip.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
 await page.getByRole("button",{name:/Hide categories/}).click();
 await expect(strip).toBeHidden();
});

test("all original app categories remain accessible through the visible More categories control",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.getByRole("button",{name:/More categories/}).click();
 const filters=page.locator("#category-filter-options");
 await filters.getByRole("button",{name:"Security"}).click();
 await expect(page.locator("#all-apps article")).toHaveCount(1);
 await expect(page.locator("#all-apps article[data-app='scouttrace']")).toHaveCount(1);
 await filters.getByRole("button",{name:"All Apps"}).click();
 await expect(page.locator("#all-apps article")).toHaveCount(8);
 await expect(page.locator("#categories").getByRole("button",{name:"All Apps"})).toBeVisible();
});

test("search filters actual apps and gives usable empty-state feedback",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 // Exercise a state transition first: WebKit can dispatch input before React has hydrated after DOMContentLoaded.
 const portfolio=page.locator("#all-apps");
 await portfolio.getByRole("button",{name:/View All Apps/}).click();
 await expect(portfolio.locator("article")).toHaveCount(14);
 await portfolio.getByRole("button",{name:/Show Less/}).click();
 await expect(portfolio.locator("article")).toHaveCount(8);
 const search=page.getByPlaceholder("Search apps, tools, creators...");
 await search.fill("MachZero");
 await expect(page.locator("#all-apps article")).toHaveCount(1);
 await expect(page.locator("#all-apps article[data-app='machzero']")).toHaveCount(1);
 await search.fill("nonexistent-cactusbyte-app-zzzz");
 await expect(page.locator("#all-apps article")).toHaveCount(0);
 await expect(page.getByRole("status")).toContainText("No apps match");
 await search.clear();
 await expect(page.locator("#all-apps article")).toHaveCount(8);
});

test("app details open the correct registry record and close without leaving storefront",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.locator("#all-apps").getByRole("button",{name:"Details for SchismMatrix™"}).click();
 const detail=page.locator('section[data-app="noproblem"]');
 await expect(detail.getByRole("heading",{name:"SchismMatrix™"})).toBeVisible();
 await expect(detail).toContainText("v1.1.0");
 await detail.getByRole("button",{name:"Close details"}).click();
 await expect(detail).toHaveCount(0);
});

test("updates and settings links open the intended Studio screens",async({page})=>{
 await page.goto("/studio#releases",{waitUntil:"domcontentloaded"});
 await expect(page.getByRole("heading",{name:"Current release records"})).toBeVisible();
 await page.goto("/studio#settings",{waitUntil:"domcontentloaded"});
 await expect(page.getByRole("heading",{name:"My CactusByte™"})).toBeVisible();
});

test("North Star featured shelf uses six actual apps with poster artwork",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const featured=page.locator("#featured article");
 await expect(featured).toHaveCount(6);
 await expect(featured.nth(0)).toHaveAttribute("data-app","acelynn-pro");
 await expect(featured.nth(1)).toHaveAttribute("data-app","noproblem");
 await expect(featured.nth(5)).toHaveAttribute("data-app","pocketstomp");
 const image=await featured.first().locator("[class*=posterArt]").evaluate(el=>getComputedStyle(el).backgroundImage);
 expect(image).toContain("/posters/acelynn-pro.svg");
 await expect(page.getByText("Firstep Kitchen")).toHaveCount(0);
});

test("North Star category tiles filter the verified app catalog",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const category=page.locator('[data-category="Beta Labs"]');
 await category.click();
 const apps=page.locator("#all-apps article");
 expect(await apps.count()).toBeGreaterThan(0);
 expect(await apps.count()).toBeLessThan(14);
 await page.locator('[data-category="All Apps"]').click();
 await expect(apps).toHaveCount(8);
});

test("North Star phone navigation has five distinct working destinations",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const nav=page.getByRole("navigation",{name:"CactusByte navigation"});
 await expect(nav.getByRole("link")).toHaveCount(5);
 await expect(nav.getByRole("link",{name:/Studio/})).toHaveAttribute("href","/studio");
 await expect(nav.getByRole("link",{name:/Updates/})).toHaveAttribute("href","/studio#releases");
 await expect(nav.getByRole("link",{name:/Profile/})).toHaveAttribute("href","/studio#settings");
 const y=await nav.evaluate(el=>Math.round(el.getBoundingClientRect().bottom));
 expect(y).toBe(844);
});

test("North Star artwork is individually bundled and decodes as images",async({page})=>{
 const ids=["acelynn-pro","noproblem","fantasy-matrix","first-bearing","rivetex","pocketstomp","shadownex-prime","scouttrace","rapid-takeoff","terraflow-matrix","machzero","orbitgather","ghostlane","hustle-first"];
 for(const id of ids){
  const asset=await page.request.get(`/posters/${id}.svg`);
  expect(asset.status(),id).toBe(200);
  expect(await asset.text()).toContain('viewBox="0 0 600 780"');
 }
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const scene=await page.locator('#featured article[data-app="acelynn-pro"]').locator("[class*=posterArt]").evaluate(el=>getComputedStyle(el).backgroundImage);
 expect(scene).toContain("/posters/acelynn-pro.svg");
 const decoded=await page.evaluate(async()=>{
  const img=new Image();img.src="/posters/acelynn-pro.svg";await img.decode();return{w:img.naturalWidth,h:img.naturalHeight};
 });
 expect(decoded).toEqual({w:600,h:780});
});


test("SLB10 poster artwork paints from the shipped SVG files, independent of branded logos",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 for(const id of ["acelynn-pro","noproblem","fantasy-matrix","first-bearing","rivetex","pocketstomp"]){
  const card=page.locator('#featured article[data-app="'+id+'"]');
  const poster=card.locator('[class*=posterArt] img');
  await expect(poster).toHaveAttribute("src",'/posters/'+id+'.svg');
  const pixels=await poster.evaluate(async(el)=>{
   const img=el as HTMLImageElement;
   await img.decode();
   const styles=getComputedStyle(img);
   return{width:img.naturalWidth,height:img.naturalHeight,fit:styles.objectFit,opacity:styles.opacity};
  });
  expect(pixels.width,id+" image width").toBe(600);
  expect(pixels.height,id+" image height").toBe(780);
  expect(pixels.fit).toBe("cover");
  expect(pixels.opacity).not.toBe("0");
 }
 await expect(page.getByAltText("Acelynn Pro official logo").first()).toBeVisible();
 await expect(page.locator('img[src*="pocketstomp-icon.png"]')).toHaveCount(0);
});

test("SLB10 Fold cover displays three featured cards without shrinking the tap targets",async({page})=>{
 await page.setViewportSize({width:360,height:748});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const shelf=page.locator("#featured").locator('[class*=featuredGrid]');
 const cards=shelf.locator("article");
 await expect(cards).toHaveCount(6);
 const geometry=await shelf.evaluate(el=>{
  const r=el.getBoundingClientRect();
  const cardRects=Array.from(el.querySelectorAll("article")).slice(0,4).map(card=>card.getBoundingClientRect());
  return{shelfRight:r.right,thirdRight:cardRects[2].right,fourthLeft:cardRects[3].left,widths:cardRects.map(card=>card.width)};
 });
 expect(geometry.thirdRight).toBeLessThanOrEqual(geometry.shelfRight+2);
 expect(geometry.fourthLeft).toBeGreaterThanOrEqual(geometry.shelfRight-2);
 expect(Math.min(...geometry.widths)).toBeGreaterThan(95);
});

test("SLB11 Fold landscape displays all six mockup feature cards and uses its side rail",async({page})=>{
 await page.setViewportSize({width:1104,height:884});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await expect(page.getByRole("navigation",{name:"CactusByte navigation"})).toBeHidden();
 await expect(page.getByRole("navigation",{name:"CactusByte sections"})).toBeVisible();
 const geometry=await page.locator("#featured").locator('[class*=featuredGrid]').evaluate(el=>{
  const r=el.getBoundingClientRect();
  const cards=Array.from(el.querySelectorAll("article")).map(card=>card.getBoundingClientRect());
  return {right:r.right,sixthRight:cards[5].right,count:cards.length};
 });
 expect(geometry.count).toBe(6);
 expect(geometry.sixthRight).toBeLessThanOrEqual(geometry.right+2);
});

test("SLB10 phone bottom navigation has its own row, with a scrollable content region",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const geometry=await page.evaluate(()=>{
  const shell=document.querySelector('[class*=shell]')!.getBoundingClientRect();
  const nav=document.querySelector('nav[aria-label="CactusByte navigation"]')!.getBoundingClientRect();
  const scroll=document.querySelector('[class*=shell]')! as HTMLElement;
  return{shellBottom:shell.bottom,navTop:nav.top,navBottom:nav.bottom,overflowY:getComputedStyle(scroll).overflowY,scrollHeight:scroll.scrollHeight,clientHeight:scroll.clientHeight};
 });
 expect(geometry.navTop).toBeGreaterThanOrEqual(geometry.shellBottom-1);
 expect(Math.abs(geometry.navBottom-844)).toBeLessThanOrEqual(1);
 expect(geometry.overflowY).toBe("auto");
 expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight);
 const allApps=page.locator("#all-apps");
 await allApps.getByRole("button",{name:/View All Apps/}).click();
 await expect(allApps.locator("article")).toHaveCount(14);
 await page.locator("footer").scrollIntoViewIfNeeded();
 await expect(page.locator("footer")).toBeInViewport();
 await expect(page.getByRole("navigation",{name:"CactusByte navigation"})).toBeVisible();
});

test("SLB11 phone shows actual Acelynn audio capabilities and About rather than a stock portrait",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await expect(page.getByRole("region",{name:"Acelynn Pro capabilities"})).toBeVisible();
 await expect(page.getByRole("region",{name:"About Acelynn Pro"})).toBeVisible();
 await expect(page.getByText("A/B Compare",{exact:true})).toBeVisible();
 await expect(page.getByText("Mic Analysis",{exact:true})).toBeVisible();
 await expect(page.getByText("Audio Files",{exact:true})).toBeVisible();
 await expect(page.getByText("Frequency",{exact:true})).toBeVisible();
 await expect(page.getByRole("navigation",{name:"CactusByte navigation"})).toBeVisible();
 await expect(page.locator("#home img[alt*='official logo']")).toBeVisible();
});


test("SLB11 all app cards retain their independent launch and details targets",async({page})=>{
 await page.setViewportSize({width:360,height:748});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const featured=page.locator("#featured article");
 await expect(featured).toHaveCount(6);
 const first=featured.first();
 await expect(first.getByRole("button",{name:"Open Acelynn Pro™"})).toHaveCount(1);
 const details=first.getByRole("button",{name:"Details for Acelynn Pro™"});
 await details.scrollIntoViewIfNeeded();
 const target=await details.evaluate(el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return{width:r.width,height:r.height,opacity:s.opacity,events:s.pointerEvents}});
 expect(target.width).toBeGreaterThanOrEqual(44);
 expect(target.height).toBeGreaterThanOrEqual(44);
 expect(target.opacity).toBe("1");
 expect(target.events).toBe("auto");
 await details.click();
 await expect(page.getByRole("heading",{name:"Acelynn Pro™"})).toBeVisible();
 await page.getByRole("button",{name:"Close details"}).click();
});
test("SLB11 poster layers remain above their card background with room for legible copy",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const card=page.locator('#featured article[data-app="fantasy-matrix"]');
 await expect(card).toHaveCount(1);
 const visual=await card.evaluate(async el=>{
  const art=el.querySelector('[class*=posterArt]')! as HTMLElement;
  const shade=el.querySelector('[class*=posterShade]')! as HTMLElement;
  const img=art.querySelector("img")! as HTMLImageElement;
  await img.decode();
  const a=art.getBoundingClientRect(),b=el.getBoundingClientRect(),p=getComputedStyle(art),z=getComputedStyle(shade);
  return{widthRatio:a.width/b.width,heightRatio:a.height/b.height,artZ:Number(p.zIndex),shadeZ:Number(z.zIndex),naturalWidth:img.naturalWidth,opacity:p.opacity};
 });
 expect(visual.naturalWidth).toBe(600);
 expect(visual.widthRatio).toBeGreaterThan(0.98);
 expect(visual.heightRatio).toBeGreaterThan(0.98);
 expect(visual.artZ).toBeGreaterThanOrEqual(1);
 expect(visual.shadeZ).toBeGreaterThan(visual.artZ);
 expect(visual.opacity).not.toBe("0");
});


test("SLB11 all-apps portfolio uses compact swipeable artwork instead of oversized 2-column panels on phones",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const grid=page.locator("#all-apps").locator('[class*=allGrid]');
 await expect(grid.locator("article")).toHaveCount(8);
 const metrics=await grid.evaluate(el=>{
  const a=Array.from(el.querySelectorAll("article")).map(card=>card.getBoundingClientRect());
  return{display:getComputedStyle(el).display,viewport:el.clientWidth,scroll:el.scrollWidth,first:a[0].width,secondX:a[1].x,firstX:a[0].x};
 });
 expect(metrics.display).toBe("flex");
 expect(metrics.first).toBeLessThan(metrics.viewport/2);
 expect(metrics.secondX).toBeGreaterThan(metrics.firstX);
 expect(metrics.scroll).toBeGreaterThan(metrics.viewport);
});
test("SLB11 dedicated Fold sidebar preserves a readable CactusByte wordmark",async({page})=>{
 for(const width of [884,1104]){
  await page.setViewportSize({width,height:884});
  await page.goto("/",{waitUntil:"domcontentloaded"});
  const lockup=page.locator('[class*=brandLockup]').first();
  await expect(lockup).toBeVisible();
  await expect(lockup).toContainText("Cactus🌵Byte");
  const metrics=await lockup.evaluate(el=>{
   const title=el.querySelector("b")!;
   const r=el.getBoundingClientRect(),t=title.getBoundingClientRect();
   return {right:r.right,titleRight:t.right,titleWidth:t.width,display:getComputedStyle(title.parentElement!).display};
  });
  expect(metrics.display).not.toBe("none");
  expect(metrics.titleRight).toBeLessThanOrEqual(metrics.right+1);
 }
});


test("SLB11 desktop Details remains visible and clickable without mouse hover",async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const card=page.locator('#featured article[data-app="acelynn-pro"]');
 const button=card.getByRole("button",{name:"Details for Acelynn Pro™"});
 const state=await button.evaluate(el=>({opacity:getComputedStyle(el).opacity,events:getComputedStyle(el).pointerEvents,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));
 expect(state.opacity).toBe("1");
 expect(state.events).toBe("auto");
 expect(state.width).toBeGreaterThanOrEqual(44);
 expect(state.height).toBeGreaterThanOrEqual(44);
 await button.click();
 await expect(page.locator('section[data-app="acelynn-pro"]')).toBeVisible();
 await page.getByRole("button",{name:"Close details"}).click();
});
test("SLB11 card design uses official logo artwork without repeated category pill overlays",async({page})=>{
 await page.setViewportSize({width:1104,height:884});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const card=page.locator('#featured article[data-app="fantasy-matrix"]');
 await expect(card.locator('[class*=posterTop] img')).toHaveCount(1);
 const pill=card.locator('[class*=posterTop]>span');
 await expect(pill).toBeHidden();
});


test("SLB11 corrupted saved-app history never crashes the storefront",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const values=['{"not":"an array"}','{malformed json','[null,4,"missing-app","noproblem","noproblem"]'];
 for(const raw of values){
  await page.evaluate(value=>localStorage.setItem("cb-storefront-recent-v4",value),raw);
  await page.reload({waitUntil:"domcontentloaded"});
  await expect(page.getByRole("heading",{name:"Featured Apps",exact:true})).toBeVisible();
  await expect(page.locator('#featured article[data-app="noproblem"]')).toHaveCount(1);
 }
 await expect(page.getByRole("heading",{name:"Continue Using",exact:true})).toBeVisible();
 await expect(page.locator('section').filter({has:page.getByRole("heading",{name:"Continue Using",exact:true})}).locator('article')).toHaveCount(1);
});
test("SLB11 mobile search is accessible and still filters the app registry",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const open=page.getByRole("button",{name:"Search apps"});
 await expect(open).toHaveAttribute("aria-expanded","false");
 await open.click();
 const close=page.getByRole("button",{name:"Close search"});
 await expect(close).toHaveAttribute("aria-expanded","true");
 const search=page.getByPlaceholder("Search apps...",{exact:true});
 await expect(search).toBeVisible();
 await search.fill("MachZero");
 await expect(page.locator("#all-apps article")).toHaveCount(1);
 await expect(page.locator('#all-apps article[data-app="machzero"]')).toHaveCount(1);
 await close.click();
 await expect(search).toHaveCount(0);
 await expect(page.locator("#all-apps article")).toHaveCount(8);
});
test("SLB11 mobile category navigation leaves results below the sticky header",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.getByRole("button",{name:/More categories/}).click();
 await page.locator("#category-filter-options").getByRole("button",{name:"Security"}).click();
 await expect(page.locator('#all-apps article[data-app="scouttrace"]')).toHaveCount(1);
 const coords=async()=>page.evaluate(()=>{
  const target=document.querySelector("#all-apps")!.getBoundingClientRect();
  const header=document.querySelector("header")!.getBoundingClientRect();
  return {gap:target.top-header.bottom,top:target.top};
 });
 await expect.poll(async()=>(await coords()).gap,{timeout:5000}).toBeGreaterThanOrEqual(-2);
 await expect.poll(async()=>(await coords()).top,{timeout:5000}).toBeLessThan(400);
});
test("SLB11 compact phone card copy stays inside its poster",async({page})=>{
 await page.setViewportSize({width:360,height:748});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const cards=page.locator("#all-apps article");
 for(let i=0;i<await cards.count();i++){
  const bounds=await cards.nth(i).evaluate(el=>{
   const card=el.getBoundingClientRect();
   const body=el.querySelector('[class*=posterBody]')!.getBoundingClientRect();
   const title=el.querySelector("h3")!.getBoundingClientRect();
   const cta=el.querySelector('[class*=posterCta]')!.getBoundingClientRect();
   return {left:body.left-card.left,right:card.right-body.right,bottom:card.bottom-body.bottom,
     titleRight:title.right-card.right,ctaRight:cta.right-card.right};
  });
  expect(bounds.left).toBeGreaterThanOrEqual(6);
  expect(bounds.right).toBeGreaterThanOrEqual(6);
  expect(bounds.bottom).toBeGreaterThanOrEqual(4);
  expect(bounds.titleRight).toBeLessThanOrEqual(0);
  expect(bounds.ctaRight).toBeLessThanOrEqual(0);
 }
});


test("SLB11 selected category tiles and expanded filter chips reflect the active result set",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const sports=page.locator('[data-category="Sports"]');
 const all=page.locator('[data-category="All Apps"]');
 await expect(all).toHaveAttribute("aria-pressed","true");
 await expect(sports).toHaveAttribute("aria-pressed","false");
 await sports.click();
 await expect(sports).toHaveAttribute("aria-pressed","true");
 await expect(all).toHaveAttribute("aria-pressed","false");
 await expect(page.locator("#all-apps article")).toHaveCount(2);
 await page.getByRole("button",{name:/More categories/}).click();
 await expect(page.locator("#category-filter-options").getByRole("button",{name:"Sports"})).toHaveAttribute("aria-pressed","true");
 await all.click();
 await expect(all).toHaveAttribute("aria-pressed","true");
 await expect(page.locator("#all-apps article")).toHaveCount(8);
});


test("SLB11 search shows immediate results and restores the complete storefront",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.getByRole("button",{name:"Search apps"}).click();
 const field=page.getByPlaceholder("Search apps...",{exact:true});
 await field.fill("  MachZero  ");
 await expect(page.getByRole("heading",{name:"Search results"})).toBeVisible();
 await expect(page.locator('#all-apps article[data-app="machzero"]')).toHaveCount(1);
 await expect(page.locator("#featured")).toHaveCount(0);
 await expect(page.locator("#home")).toHaveCount(0);
 const geometry=await page.evaluate(()=>{
  const header=document.querySelector("header")!.getBoundingClientRect();
  const results=document.querySelector("#all-apps")!.getBoundingClientRect();
  return{headerBottom:header.bottom,resultsTop:results.top};
 });
 expect(geometry.resultsTop).toBeGreaterThanOrEqual(geometry.headerBottom-2);
 expect(geometry.resultsTop-geometry.headerBottom).toBeLessThan(90);
 await field.clear();
 await expect(page.getByRole("heading",{name:"Featured Apps",exact:true})).toBeVisible();
 await expect(page.locator("#home")).toHaveCount(1);
});
test("SLB11 search is global even after filtering by category",async({page})=>{
 await page.setViewportSize({width:412,height:915});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.locator('[data-category="Sports"]').click();
 await expect(page.locator("#all-apps article")).toHaveCount(2);
 await page.getByRole("button",{name:"Search apps"}).click();
 await page.getByPlaceholder("Search apps...",{exact:true}).fill("MachZero");
 await expect(page.getByRole("heading",{name:"Search results"})).toBeVisible();
 await expect(page.locator('#all-apps article[data-app="machzero"]')).toHaveCount(1);
 await page.getByRole("button",{name:"Close search"}).click();
 await expect(page.getByRole("heading",{name:"Sports",exact:true})).toBeVisible();
 await expect(page.locator("#all-apps article")).toHaveCount(2);
});
test("SLB11 details and demo dialogs are labeled, dismissible and never stacked",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.locator('#featured article[data-app="acelynn-pro"]').getByRole("button",{name:/Details for Acelynn Pro/}).click();
 const details=page.getByRole("dialog",{name:"Acelynn Pro™"});
 await expect(details).toBeVisible();
 await expect(details).toHaveAttribute("aria-modal","true");
 await page.keyboard.press("Escape");
 await expect(page.getByRole("dialog")).toHaveCount(0);
 await page.locator('#featured article[data-app="acelynn-pro"]').getByRole("button",{name:/Details for Acelynn Pro/}).click();
 await page.getByRole("dialog").getByRole("button",{name:/Watch Demo/}).click();
 await expect(page.getByRole("dialog")).toHaveCount(1);
 await expect(page.getByRole("dialog",{name:"Acelynn Pro™"}).locator('video[src="/demos/acelynn-pro-60-second-demo.mp4"]')).toHaveCount(1);
 await page.keyboard.press("Escape");
 await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("SLB11 sidebar browse links restore shelves from search mode",async({page})=>{
 await page.setViewportSize({width:1104,height:884});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.getByPlaceholder("Search apps, tools, creators...").fill("MachZero");
 await expect(page.locator("#featured")).toHaveCount(0);
 await page.getByRole("navigation",{name:"CactusByte sections"}).getByRole("link",{name:/Discover/}).click();
 await expect(page.getByRole("heading",{name:"Featured Apps",exact:true})).toBeVisible();
 await expect(page.getByPlaceholder("Search apps, tools, creators...")).toHaveValue("");
});


test("SLB11 header Profile and mobile Profile resolve to the same settings screen",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await expect(page.locator('header a[aria-label="Profile"]')).toHaveAttribute("href","/studio#settings");
 await expect(page.getByRole("navigation",{name:"CactusByte navigation"}).getByRole("link",{name:/Profile/})).toHaveAttribute("href","/studio#settings");
 await page.locator('header a[aria-label="Profile"]').click();
 await expect(page).toHaveURL(/\/studio#settings$/);
 await expect(page.getByRole("heading",{name:"My CactusByte™"})).toBeVisible();
});


test("SLB11 visible Details affordance is compact without sacrificing accessible tap area",async({page})=>{
 for(const viewport of [{width:360,height:748},{width:390,height:844},{width:1104,height:884}]){
  await page.setViewportSize(viewport);
  await page.goto("/",{waitUntil:"domcontentloaded"});
  const article=page.locator('#featured article[data-app="acelynn-pro"]');
  const detail=article.getByRole("button",{name:/Details for Acelynn Pro/});
  const geometry=await detail.evaluate(el=>{
   const target=el.getBoundingClientRect();
   const icon=getComputedStyle(el,"::before");
   const button=getComputedStyle(el);
   return{width:target.width,height:target.height,iconWidth:icon.width,iconHeight:icon.height,display:icon.display,pointerEvents:button.pointerEvents};
  });
  expect(geometry.width).toBeGreaterThanOrEqual(44);
  expect(geometry.height).toBeGreaterThanOrEqual(44);
  expect(geometry.iconWidth).toBe("28px");
  expect(geometry.iconHeight).toBe("28px");
  expect(geometry.display).toBe("grid");
  expect(geometry.pointerEvents).toBe("auto");
  await detail.click();
  await expect(page.getByRole("dialog",{name:/Acelynn Pro/})).toBeVisible();
  await page.getByRole("button",{name:"Close details"}).click();
 }
});


test("SLB11 mobile showcase menu opens, provides real routes, and closes without overlay leakage",async({page})=>{
 for(const width of [360,390,412]){
  await page.setViewportSize({width,height:844});
  await page.goto("/",{waitUntil:"domcontentloaded"});
  const trigger=page.getByRole("button",{name:"Open menu"});
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded","false");
  await trigger.click();
  const menu=page.getByRole("navigation",{name:"CactusByte mobile menu"});
  await expect(menu).toBeVisible();
  await expect(page.getByRole("button",{name:"Close menu"})).toHaveAttribute("aria-expanded","true");
  await expect(menu.getByRole("link",{name:/Home/})).toHaveAttribute("href","#home");
  await expect(menu.getByRole("link",{name:/Categories/})).toHaveAttribute("href","#categories");
  await expect(menu.getByRole("link",{name:/All Apps/})).toHaveAttribute("href","#all-apps");
  await expect(menu.getByRole("link",{name:/Studio/})).toHaveAttribute("href","/studio");
  await expect(menu.getByRole("link",{name:/Updates/})).toHaveAttribute("href","/studio#releases");
  await expect(menu.getByRole("link",{name:/Profile/})).toHaveAttribute("href","/studio#settings");
  const bounds=await menu.evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,viewport:innerWidth}});
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewport+1);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await trigger.click();
  await page.getByRole("navigation",{name:"CactusByte mobile menu"}).getByRole("link",{name:/Categories/}).click();
  await expect(page.getByRole("navigation",{name:"CactusByte mobile menu"})).toHaveCount(0);
  await expect(page.getByRole("heading",{name:"Explore Categories"})).toBeVisible();
 }
});
test("SLB11 verified CactusByte wordmark survives the corrupt legacy PNG",async({page})=>{
 await page.route("**/logo2.png",route=>route.abort());
 for(const width of [360,884,1104]){
  await page.setViewportSize({width,height:844});
  await page.goto("/",{waitUntil:"domcontentloaded"});
  const brand=width<760?page.locator('[class*=mobileBrand]').first():page.locator('[class*=brandLockup]').first();
  await expect(brand).toBeVisible();
  await expect(brand).toContainText("Cactus🌵Byte");
  const img=brand.locator('img[src="/logo2.png"]');
  await expect(img).toHaveCount(0);
  const label=brand.locator("b");
  const bounds=await label.evaluate(el=>{const r=el.getBoundingClientRect();return{width:r.width,right:r.right,viewport:innerWidth}});
  expect(bounds.width).toBeGreaterThan(40);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewport+1);
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await expect(page.locator('header a[aria-label="Profile"]')).toContainText("♙");
});
test("SLB11 phone menu and search never remain open together",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.getByRole("button",{name:"Open menu"}).click();
 await page.getByRole("button",{name:"Search apps"}).click();
 await expect(page.getByRole("navigation",{name:"CactusByte mobile menu"})).toHaveCount(0);
 await expect(page.getByPlaceholder("Search apps...",{exact:true})).toBeVisible();
 await page.getByRole("button",{name:"Open menu"}).click();
 await expect(page.getByPlaceholder("Search apps...",{exact:true})).toHaveCount(0);
 await expect(page.getByRole("navigation",{name:"CactusByte mobile menu"})).toBeVisible();
});


test("SLB11 3-up phone art cards reserve text and CTA space without overshooting the shelf",async({page})=>{
 for(const width of [360,390,412]){
  await page.setViewportSize({width,height:844});
  await page.goto("/",{waitUntil:"domcontentloaded"});
  const metrics=await page.locator("#featured [class*=featuredGrid]").evaluate(el=>{
   const root=el.getBoundingClientRect();
   const cards=Array.from(el.querySelectorAll("article")).slice(0,3);
   return cards.map(card=>{
    const cr=card.getBoundingClientRect();
    const title=card.querySelector("h3")! as HTMLElement;
    const description=card.querySelector("p")! as HTMLElement;
    const cta=card.querySelector("[class*=posterCta]")! as HTMLElement;
    const image=card.querySelector("[class*=posterArt] img")! as HTMLImageElement;
    const t=title.getBoundingClientRect(),d=description.getBoundingClientRect(),a=cta.getBoundingClientRect();
    return {width:cr.width,height:cr.height,cardRight:cr.right,railRight:root.right,
      ctaBottom:cr.bottom-a.bottom,titleBottom:t.bottom,descTop:d.top,ctaTop:a.top,
      ctaHeight:a.height,lineClamp:getComputedStyle(title).webkitLineClamp,
      imageLoaded:image.complete&&image.naturalWidth===600};
   });
  });
  expect(metrics).toHaveLength(3);
  for(const item of metrics){
   expect(item.width).toBeGreaterThan(95);
   expect(item.height).toBeGreaterThanOrEqual(215);
   expect(item.cardRight).toBeLessThanOrEqual(item.railRight+1);
   expect(item.ctaBottom).toBeGreaterThanOrEqual(5);
   expect(item.ctaTop).toBeGreaterThanOrEqual(item.descTop);
   expect(item.titleBottom).toBeLessThanOrEqual(item.ctaTop);
   expect(item.ctaHeight).toBeGreaterThanOrEqual(30);
   expect(item.lineClamp).toBe("2");
   expect(item.imageLoaded).toBe(true);
  }
 }
});
test("SLB11 six-up Fold landscape keeps genuine poster art and readable bottom actions",async({page})=>{
 await page.setViewportSize({width:1104,height:884});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const metrics=await page.locator("#featured [class*=featuredGrid]").evaluate(el=>{
  const right=el.getBoundingClientRect().right;
  return Array.from(el.querySelectorAll("article")).map(card=>{
   const r=card.getBoundingClientRect();
   const button=card.querySelector("[class*=posterCta]")!.getBoundingClientRect();
   const img=card.querySelector("[class*=posterArt] img")! as HTMLImageElement;
   return {width:r.width,right:r.right,railRight:right,bottom:r.bottom,ctaBottom:button.bottom,loaded:img.complete&&img.naturalWidth===600};
  });
 });
 expect(metrics).toHaveLength(6);
 for(const m of metrics){
  expect(m.width).toBeGreaterThan(100);
  expect(m.right).toBeLessThanOrEqual(m.railRight+2);
  expect(m.ctaBottom).toBeLessThanOrEqual(m.bottom);
  expect(m.loaded).toBe(true);
 }
});


test("SLB11 Acelynn hero displays the real headphone vector instead of a photograph at every target width",async({page})=>{
 for(const viewport of [{width:360,height:748},{width:390,height:844},{width:412,height:915},{width:884,height:1104},{width:1104,height:884},{width:1440,height:900}]){
  await page.setViewportSize(viewport);
  await page.goto("/",{waitUntil:"domcontentloaded"});
  const hero=page.locator("#home");
  const scene=hero.locator('img[src="/posters/acelynn-pro.svg"]');
  await expect(scene).toHaveCount(1);
  const geometry=await scene.evaluate(async el=>{
   const img=el as HTMLImageElement;
   await img.decode();
   const a=img.getBoundingClientRect(),h=img.closest("section")!.getBoundingClientRect();
   const style=getComputedStyle(img);
   return {naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
     visualWidth:Math.max(0,Math.min(a.right,h.right)-Math.max(a.left,h.left)),
     visualHeight:Math.max(0,Math.min(a.bottom,h.bottom)-Math.max(a.top,h.top)),
     heroWidth:h.width,heroHeight:h.height,pointerEvents:style.pointerEvents,opacity:Number(style.opacity)};
  });
  expect(geometry.naturalWidth).toBe(600);
  expect(geometry.naturalHeight).toBe(780);
  expect(geometry.visualWidth).toBeGreaterThan(70);
  expect(geometry.visualHeight).toBeGreaterThan(100);
  expect(geometry.heroHeight).toBeGreaterThan(250);
  expect(geometry.pointerEvents).toBe("none");
  expect(geometry.opacity).toBeGreaterThan(0.9);
  expect(await hero.locator("video").count()).toBe(0);
 }
});
test("SLB11 feature-stage buttons remain clickable above the decorative headphone scene",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.locator("#home").getByRole("button",{name:/Watch Demo/}).click();
 await expect(page.getByRole("dialog",{name:/Acelynn Pro/})).toBeVisible();
 await expect(page.getByRole("dialog").locator('video[src="/demos/acelynn-pro-60-second-demo.mp4"]')).toHaveCount(1);
 await page.getByRole("button",{name:"Close demo"}).click();
 await expect(page.getByRole("dialog")).toHaveCount(0);
});


test("SLB11 promotional View All actually reveals every registered application in a readable phone grid",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const catalog=page.locator("#all-apps");
 await expect(catalog.locator("article")).toHaveCount(8);
 await page.locator("#featured").getByRole("link",{name:/View All/}).click();
 await expect(catalog.locator("article")).toHaveCount(14);
 await expect(page.locator("#all-apps [class*=allGridExpanded]")).toHaveCount(1);
 const layout=await catalog.locator('[class*=allGridExpanded]').evaluate(el=>{
  const cards=[...el.querySelectorAll("article")].map(card=>card.getBoundingClientRect());
  const style=getComputedStyle(el);
  return{display:style.display,cols:style.gridTemplateColumns.split(" ").length,
    firstRow:[cards[0].top,cards[1].top],secondRow:cards[2].top,firstBottom:cards[0].bottom,
    overflowX:document.documentElement.scrollWidth-document.documentElement.clientWidth};
 });
 expect(layout.display).toBe("grid");
 expect(layout.cols).toBe(2);
 expect(layout.firstRow[0]).toBeCloseTo(layout.firstRow[1],0);
 expect(layout.secondRow).toBeGreaterThanOrEqual(layout.firstBottom);
 expect(layout.overflowX).toBeLessThanOrEqual(2);
 await page.getByRole("button",{name:/Show Less/}).click();
 await expect(catalog.locator("article")).toHaveCount(8);
 await expect(page.locator("#all-apps [class*=allGridExpanded]")).toHaveCount(0);
});
test("SLB11 category filters show complete matching apps instead of sideways-hidden results",async({page})=>{
 await page.setViewportSize({width:360,height:748});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.locator('[data-category="Sports"]').click();
 const grid=page.locator("#all-apps [class*=allGridExpanded]");
 await expect(grid).toBeVisible();
 await expect(grid.locator("article")).toHaveCount(2);
 await expect(grid).toHaveCSS("display","grid");
 await expect(page.locator('[data-category="Sports"]')).toHaveAttribute("aria-pressed","true");
});
