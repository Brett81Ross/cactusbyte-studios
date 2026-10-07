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
  test("stays contained and product-led",async({page})=>{
   const errors:string[]=[];
   page.on("pageerror",error=>errors.push(error.message));
   const response=await page.goto("/",{waitUntil:"domcontentloaded"});
   expect(response).not.toBeNull();
   expect(response!.status()).toBeLessThan(500);

   await expect(page.getByText("FEATURED APP")).toBeVisible();
   await expect(page.locator("h1").filter({hasText:"Acelynn Pro"})).toBeVisible();
   await expect(page.getByRole("heading",{name:"Our Apps",exact:true})).toBeVisible();
   await expect(page.getByRole("heading",{name:"Categories",exact:true})).toBeVisible();
   await expect(page.locator("footer").getByText("Your apps. One launchpad.")).toBeVisible();
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
    const escapedImages=Array.from(document.images).filter(visible).filter(img=>{
      const r=img.getBoundingClientRect();
      const host=img.closest("article,button,a,[class*=logo],[class*=wordmark]")?.getBoundingClientRect();
      return !host||r.left<host.left-2||r.right>host.right+2||r.top<host.top-2||r.bottom>host.bottom+2;
    }).length;
    return{overflow,smallControls,escapedImages};
   });

   expect(audit.overflow,`horizontal overflow: ${audit.overflow}px`).toBeLessThanOrEqual(2);
   expect(audit.smallControls,`small controls: ${JSON.stringify(audit.smallControls)}`).toEqual([]);
   expect(audit.escapedImages).toBe(0);
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

test("PocketStomp never falls back to the rejected icon",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await expect(page.locator('img[src*="pocketstomp-icon.png"]')).toHaveCount(0);
 const pocketCard=page.locator("article").filter({hasText:"PocketStomp"}).last();
 await expect(pocketCard).toBeVisible();
 await pocketCard.getByRole("button",{name:/Details for PocketStomp/}).click();
 await expect(page.getByText("Official logo pending recovery. No substitute artwork is being used.")).toBeVisible();
});

test("Fold layout uses a side navigation rail instead of covering cards",async({page})=>{
 await page.setViewportSize({width:1104,height:884});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 const nav=page.getByRole("navigation",{name:"CactusByte sections"});
 const rect=await nav.boundingBox();
 expect(rect).not.toBeNull();
 expect(rect!.x).toBeLessThan(30);
 expect(rect!.y).toBeGreaterThan(70);
 expect(rect!.width).toBeGreaterThan(100);
 expect(rect!.width).toBeLessThan(180);
});

test("verified app cards expose official-logo labels",async({page})=>{
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await expect(page.getByAltText("Acelynn Pro official logo").first()).toBeVisible();
 await expect(page.getByAltText("SchismMatrix official logo").first()).toBeVisible();
 await expect(page.getByAltText("Fantasy Matrix official logo").first()).toBeVisible();
 await expect(page.getByAltText("First Bearing official logo").first()).toBeVisible();
 await expect(page.getByAltText("RIVETEX official logo").first()).toBeVisible();
});
