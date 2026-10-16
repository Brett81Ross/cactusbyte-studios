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

test("storefront hero uses authentic Acelynn demo media",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await expect(page.locator('#home video[src="/demos/acelynn-pro-60-second-demo.mp4"]')).toHaveCount(1);
 await expect(page.locator('video[src*="no-problem-pressure-washing"]')).toHaveCount(0);
 await expect(page.locator('video[src*="pocketstomp"]')).toHaveCount(0);
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
