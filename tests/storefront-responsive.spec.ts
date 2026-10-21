import {expect,test} from "@playwright/test";

/**
 * PR #42 Neon Showcase / SLB14 responsive regression contract.
 * Replaces obsolete SLB10 6-card, 8-default-card, 5-nav tests.
 * Genuine SLB13 binary-art installation is separately gated by qa:cinematic.
 * No test may deploy, trigger GitHub Actions, or alter production.
 */
const viewports=[
  {name:"Z Fold cover",width:360,height:748},
  {name:"Android phone",width:412,height:915},
  {name:"iPhone-sized",width:390,height:844},
  {name:"Z Fold open portrait",width:884,height:1104},
  {name:"Z Fold open landscape",width:1104,height:884},
  {name:"Samsung DeX",width:1440,height:900}
];

for(const viewport of viewports){
  test("Approved Neon Showcase · "+viewport.name,async({page})=>{
    const errors:string[]=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    const response=await page.goto("/",{waitUntil:"domcontentloaded"});
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading",{name:"Acelynn Pro",exact:true}).first()).toBeVisible();
    await expect(page.getByRole("heading",{name:"Featured Apps",exact:true})).toBeVisible();
    await expect(page.getByRole("heading",{name:"More from CactusByte Studios",exact:true})).toBeVisible();
    const featured=page.locator("#featured article[data-app]");
    await expect(featured).toHaveCount(5);
    await expect(page.locator('[class*="moreGrid"] article[data-app]')).toHaveCount(6);
    const ids=await featured.evaluateAll(els=>els.map(el=>el.getAttribute("data-app")));
    expect(ids).toEqual(["acelynn-pro","first-bearing","fantasy-matrix","hustle-first","noproblem"]);
    const more=await page.locator('[class*="moreGrid"] article[data-app]').evaluateAll(els=>els.map(el=>el.getAttribute("data-app")));
    expect(more).toEqual(["rivetex","shadownex-prime","scouttrace","rapid-takeoff","terraflow-matrix","pocketstomp"]);
    const rail=page.getByRole("navigation",{name:"CactusByte sections"});
    if(viewport.width>=760){
      await expect(rail).toBeVisible();
      const bounds=await page.evaluate(()=>{
        const aside=document.querySelector("aside")!.getBoundingClientRect();
        const shell=document.querySelector('[class*="shell"]')!.getBoundingClientRect();
        return {sidebarRight:aside.right,shellLeft:shell.left};
      });
      expect(bounds.shellLeft,"sidebar must not cover the Fold/desktop storefront").toBeGreaterThanOrEqual(bounds.sidebarRight);
    }else{
      await expect(rail).toBeHidden();
      const visible=await featured.evaluateAll(els=>els.filter(el=>getComputedStyle(el).display!=="none").map(el=>el.getAttribute("data-app")));
      expect(visible.slice(0,3)).toEqual(["first-bearing","fantasy-matrix","hustle-first"]);
    }
    const nav=page.getByRole("navigation",{name:"CactusByte navigation"});
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link")).toHaveCount(6);
    const bounds=await page.evaluate(()=>({viewport:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
    expect(Math.max(bounds.doc,bounds.body)-bounds.viewport,"no root horizontal overflow").toBeLessThanOrEqual(2);
    await expect(page.getByRole("link",{name:"CactusByte Studios app home"})).toBeVisible();
    await expect(page.getByText("All Rights Reserved")).toBeVisible();
    expect(errors,"no uncaught browser errors").toEqual([]);
  });
}

test("Phone menu, categories and search do not leave conflicting overlays",async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto("/");
  await page.getByRole("button",{name:"Open menu"}).click();
  await expect(page.getByRole("navigation",{name:"CactusByte mobile menu"})).toBeVisible();
  await page.getByRole("button",{name:"Search apps",exact:true}).click();
  await expect(page.getByRole("navigation",{name:"CactusByte mobile menu"})).toHaveCount(0);
  await page.getByRole("textbox",{name:"Search apps"}).last().fill("MachZero");
  await expect(page.locator('#all-apps article[data-app="machzero"]')).toHaveCount(1);
  await page.getByRole("button",{name:"Close search"}).click();
  await expect(page.locator("#featured")).toBeVisible();
});

test("Search is global and empty results are explained",async({page})=>{
  await page.setViewportSize({width:1104,height:884});await page.goto("/");
  const query=page.getByRole("textbox",{name:"Search apps"});
  await query.fill("rapid takeoff");
  await expect(page.locator('#all-apps article[data-app="rapid-takeoff"]')).toHaveCount(1);
  await query.fill("definitely-not-a-cactusbyte-product");
  await expect(page.locator("#all-apps article")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("No apps match");
  await query.clear();
  await expect(page.locator("#featured")).toBeVisible();
});

test("Catalog stays collapsed until View All, then exposes all verified registry entries",async({page})=>{
  await page.goto("/");
  await expect(page.locator("#all-apps article")).toHaveCount(0);
  await page.getByRole("button",{name:/View All Apps/}).click();
  await expect(page.locator("#all-apps article")).toHaveCount(14);
  await page.getByRole("button",{name:/Show Less/}).click();
  await expect(page.locator("#all-apps article")).toHaveCount(0);
});

test("More categories reveals real filters, selects Security and returns to All Apps",async({page})=>{
  await page.goto("/");
  const more=page.getByRole("button",{name:/More categories/});
  await expect(more).toHaveAttribute("aria-expanded","false");
  await more.click();
  const extras=page.locator("#category-extra-options");
  await expect(extras).toBeVisible();
  await extras.getByRole("button",{name:"Security"}).click();
  await expect(page.locator('#all-apps article[data-app="scouttrace"]')).toHaveCount(1);
  await expect(extras.getByRole("button",{name:"Security"})).toHaveAttribute("aria-pressed","true");
  await page.locator("#category-filter-options").getByRole("button",{name:"All Apps"}).click();
  await expect(page.locator("#all-apps article")).toHaveCount(14);
});

test("Category filters include Beta Labs without inventing apps",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:/More categories/}).click();
  await page.locator("#category-extra-options").getByRole("button",{name:"Beta Labs"}).click();
  const count=await page.locator("#all-apps article").count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(14);
});

test("Real card Details modal shows registry data, supports Escape and preserves launch button",async({page})=>{
  await page.goto("/");
  await page.locator('#featured article[data-app="first-bearing"]').getByRole("button",{name:"Details for First Bearing™"}).click();
  const dialog=page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading",{name:"First Bearing™"})).toBeVisible();
  await expect(dialog.getByRole("button",{name:"Open App"})).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("Acelynn hero opens authentic demo and closes it without stacked dialogs",async({page})=>{
  await page.goto("/");
  const hero=page.locator("#home");
  await expect(hero.getByRole("button",{name:/Open App/})).toBeVisible();
  await hero.getByRole("button",{name:/Watch Demo/}).click();
  const dialog=page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('video[src="/demos/acelynn-pro-60-second-demo.mp4"]')).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("Every card separates Open from accessible Details without overlapping verified logo",async({page})=>{
  for(const width of [360,390,884,1104,1440]){
    await page.setViewportSize({width,height:900});await page.goto("/");
    const card=page.locator('#featured article[data-app="first-bearing"]');
    await expect(card.getByRole("button",{name:"Open First Bearing™"})).toHaveCount(1);
    const button=card.getByRole("button",{name:"Details for First Bearing™"});
    const d=await card.evaluate(el=>{
      const logo=el.querySelector('[class*="posterTop"] [class*="logo"]')!.getBoundingClientRect();
      const info=el.querySelector('[class*="posterDetails"]')!.getBoundingClientRect();
      const overlap=Math.max(0,Math.min(logo.right,info.right)-Math.max(logo.left,info.left))*Math.max(0,Math.min(logo.bottom,info.bottom)-Math.max(logo.top,info.top));
      return {overlap,width:info.width,height:info.height};
    });
    expect(d.overlap,"logo and info overlap at "+width).toBe(0);
    expect(d.width).toBeGreaterThanOrEqual(44);
    expect(d.height).toBeGreaterThanOrEqual(44);
    await expect(button).toHaveAttribute("aria-label","Details for First Bearing™");
  }
});

test("Approved cinematic artwork uses a local fallback while binary assets are staged",async({page})=>{
  await page.goto("/");
  const images=page.locator('#featured article[data-app="first-bearing"] [class*="posterArt"] img');
  await expect(images).toHaveCount(1);
  await expect(images).toHaveAttribute("src",/\/(cinematic\/first-bearing\.webp|posters\/first-bearing\.svg)$/);
  const image=images.first();
  await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("navigation",{name:"CactusByte navigation"}).getByRole("link",{name:/My Apps/}).click();
  await expect(page.locator('#all-apps article[data-app="orbitgather"] [class*="posterArt"] img')).toHaveAttribute("src","/posters/orbitgather.svg");
});

test("No rejected PocketStomp logo or external stock-photo background is introduced",async({page})=>{
  await page.goto("/");
  await expect(page.locator('img[src*="pocketstomp-icon.png"]')).toHaveCount(0);
  await expect(page.locator('img[src*="unsplash"]')).toHaveCount(0);
  const bg=await page.locator('#home [class*="heroPortrait"]').evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(bg).not.toContain("unsplash");
});

test("Bottom navigation opens catalog and leaves the legal footer reachable on Fold cover",async({page})=>{
  await page.setViewportSize({width:360,height:748});await page.goto("/");
  await page.getByRole("navigation",{name:"CactusByte navigation"}).getByRole("link",{name:/My Apps/}).click();
  await expect(page.locator("#all-apps article")).toHaveCount(14);
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  const b=await page.evaluate(()=>{
    const footer=document.querySelector("footer")!.getBoundingClientRect();
    const dock=document.querySelector('nav[aria-label="CactusByte navigation"]')!.getBoundingClientRect();
    return {footerBottom:footer.bottom,dockTop:dock.top,doc:document.documentElement.scrollHeight};
  });
  expect(b.footerBottom,"footer is not hidden behind the bottom dock").toBeLessThanOrEqual(b.dockTop+2);
});

test("Mobile category links restore real shelves after searching",async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto("/");
  await page.getByRole("button",{name:"Search apps",exact:true}).click();
  await page.getByRole("textbox",{name:"Search apps"}).last().fill("SchismMatrix");
  await expect(page.locator('#all-apps article[data-app="noproblem"]')).toHaveCount(1);
  await page.getByRole("navigation",{name:"CactusByte navigation"}).getByRole("link",{name:/Categories/}).click();
  await expect(page.locator("#categories")).toBeVisible();
  await expect(page.locator("#featured")).toBeVisible();
});

test("Studio settings and update actions stay attached to the real destination",async({page})=>{
  await page.goto("/");
  const nav=page.getByRole("navigation",{name:"CactusByte navigation"});
  await expect(nav.getByRole("link",{name:"Settings"})).toHaveAttribute("href","/studio#settings");
  await expect(nav.getByRole("link",{name:"Updates"})).toHaveAttribute("href","/studio#releases");
});

test("CactusByte footer displays accurate version and clickable studio identity",async({page})=>{
  await page.goto("/");
  const footer=page.locator("footer");
  await expect(footer).toContainText("v1.7.0");
  await expect(footer).toContainText("All Rights Reserved");
  await expect(footer.getByRole("link",{name:"CactusByte Studios app home"})).toHaveAttribute("href","/");
});

test("Visible storefront controls meet mobile touch-size minimums",async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto("/");
  const targets=page.locator("#category-filter-options button, #home [class*='heroActions'] button, #featured [class*='posterDetails']");
  const sizes=await targets.evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();return {name:el.textContent?.trim()||el.getAttribute("aria-label"),width:r.width,height:r.height}}));
  expect(sizes.length).toBeGreaterThan(4);
  expect(sizes.filter(item=>item.width<44||item.height<44),"undersized controls: "+JSON.stringify(sizes)).toEqual([]);
});

test("No modal is simultaneously shown with another dialog",async({page})=>{
  await page.goto("/");
  await page.locator('#featured article[data-app="fantasy-matrix"]').getByRole("button",{name:"Details for Fantasy Football Matrix™"}).click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await page.getByRole("dialog").getByRole("button",{name:/Watch Demo/}).click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(page.getByRole("dialog").locator("video")).toHaveCount(1);
});
