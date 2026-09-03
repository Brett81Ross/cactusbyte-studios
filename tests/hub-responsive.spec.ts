import {expect,test} from "@playwright/test";

const viewports=[
 {name:"Z Fold cover",width:360,height:748,touch:true},
 {name:"Android phone",width:412,height:915,touch:true},
 {name:"iPhone",width:390,height:844,touch:true},
 {name:"Z Fold open portrait",width:884,height:1104,touch:true},
 {name:"Z Fold open landscape",width:1104,height:884,touch:true},
 {name:"iPad Mini portrait",width:744,height:1133,touch:true},
 {name:"iPad Mini landscape",width:1133,height:744,touch:true},
 {name:"iPad Air Pro 11 portrait",width:834,height:1194,touch:true},
 {name:"iPad Air Pro 11 landscape",width:1194,height:834,touch:true},
 {name:"iPad Pro 12.9 portrait",width:1024,height:1366,touch:true},
 {name:"iPad Pro 12.9 landscape",width:1366,height:1024,touch:true},
 {name:"Galaxy Tab portrait",width:800,height:1280,touch:true},
 {name:"Galaxy Tab landscape",width:1280,height:800,touch:true},
 {name:"Large Galaxy Tab portrait",width:924,height:1480,touch:true},
 {name:"Large Galaxy Tab landscape",width:1480,height:924,touch:true,wideCap:true},
 {name:"Tablet split screen narrow",width:600,height:1024,touch:true},
 {name:"Tablet split screen landscape",width:800,height:768,touch:true},
 {name:"Samsung DeX",width:1440,height:900,touch:true,wideCap:true}
];

for(const viewport of viewports){
 test.describe(viewport.name,()=>{
  test.use({viewport:{width:viewport.width,height:viewport.height},hasTouch:viewport.touch});
  test("hub remains readable, touchable, and contained",async({page})=>{
   const pageErrors:string[]=[];
   page.on("pageerror",error=>pageErrors.push(error.message));
   const response=await page.goto("/",{waitUntil:"domcontentloaded"});
   expect(response).not.toBeNull();
   expect(response!.status()).toBeLessThan(500);
   await page.waitForTimeout(900);
   await expect(page.locator("body")).toBeVisible();

   const audit=await page.evaluate(()=>{
    const visible=(element:Element)=>{
     const style=getComputedStyle(element);
     const rect=element.getBoundingClientRect();
     return style.visibility!=="hidden"&&style.display!=="none"&&rect.width>0&&rect.height>0;
    };
    const doc=document.documentElement;
    const body=document.body;
    const overflow=Math.max(doc.scrollWidth,body.scrollWidth)-window.innerWidth;
    const controls=Array.from(document.querySelectorAll("button,.actions a,[role='button'],input:not([type='checkbox']):not([type='radio']),select"))
     .filter(visible)
     .map(element=>{const rect=element.getBoundingClientRect();return{label:(element.textContent||(element as HTMLInputElement).value||element.getAttribute("aria-label")||element.tagName).trim().slice(0,80),width:rect.width,height:rect.height}})
     .filter(control=>control.height<47.5||control.width<47.5);
    const clippedDialogs=Array.from(document.querySelectorAll("dialog,[role='dialog'],.modal"))
     .filter(visible)
     .map(element=>element.getBoundingClientRect())
     .filter(rect=>rect.left<-2||rect.top<-2||rect.right>window.innerWidth+2||rect.bottom>window.innerHeight+2)
     .map(rect=>({left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom}));
    const cardRects=Array.from(document.querySelectorAll(".card")).slice(0,12).map(element=>{const rect=element.getBoundingClientRect();return{left:Math.round(rect.left),right:Math.round(rect.right),width:Math.round(rect.width),top:Math.round(rect.top)}});
    const escapedImages=Array.from(document.querySelectorAll(".card img")).filter(visible).map(element=>{const image=element.getBoundingClientRect();const card=element.closest(".card")?.getBoundingClientRect();return{image,card}}).filter(({image,card})=>!card||image.left<card.left-1||image.right>card.right+1).length;
    const shell=document.querySelector(".shell")?.getBoundingClientRect();
    return{overflow,controls,clippedDialogs,cardRects,escapedImages,shellWidth:shell?.width||0};
   });

   expect(audit.overflow,`horizontal overflow: ${audit.overflow}px`).toBeLessThanOrEqual(2);
   expect(audit.controls,`controls below the 48px target: ${JSON.stringify(audit.controls)}`).toEqual([]);
   expect(audit.clippedDialogs,"visible dialogs must stay in the viewport").toEqual([]);
   expect(audit.escapedImages,"app artwork must stay inside its card").toBe(0);
   expect(pageErrors,"uncaught browser errors").toEqual([]);

   const columns=new Set(audit.cardRects.map(card=>card.left)).size;
   if(viewport.width<=480){
    expect(columns,"cover/phone cards should be one column").toBe(1);
   }else if(viewport.width>=700){
    expect(columns,"Fold/tablet cards should use more than one column").toBeGreaterThan(1);
   }
   if(viewport.wideCap){
    expect(audit.shellWidth,"large tablet/DeX content should remain bounded").toBeLessThanOrEqual(1200);
    expect(columns,"large tablet/DeX app grid should stay at four columns or fewer").toBeLessThanOrEqual(4);
   }
  });
 });
}

test("Android launch dialog fits the Fold cover",async({page})=>{
 await page.setViewportSize({width:360,height:748});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.getByRole("button",{name:/Android App/}).first().click();
 const dialog=page.getByRole("dialog",{name:/CactusByte Studios launch options/});
 await expect(dialog).toBeVisible();
 const rect=await dialog.boundingBox();
 expect(rect).not.toBeNull();
 expect(rect!.x).toBeGreaterThanOrEqual(0);
 expect(rect!.y).toBeGreaterThanOrEqual(0);
 expect(rect!.x+rect!.width).toBeLessThanOrEqual(360);
 expect(rect!.y+rect!.height).toBeLessThanOrEqual(748);
 await expect(dialog.getByRole("button",{name:"Download Android App"})).toBeVisible();
 await expect(dialog).toContainText("Permanent-signing cutover remains separate");
});

test("Native Launch dialog remains appropriately bounded on a large tablet",async({page})=>{
 await page.setViewportSize({width:1366,height:1024});
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.getByRole("button",{name:/Android App/}).first().click();
 const dialog=page.getByRole("dialog",{name:/CactusByte Studios launch options/});
 await expect(dialog).toBeVisible();
 const rect=await dialog.boundingBox();
 expect(rect).not.toBeNull();
 expect(rect!.width).toBeGreaterThanOrEqual(320);
 expect(rect!.width).toBeLessThanOrEqual(520);
 expect(rect!.x).toBeGreaterThanOrEqual(0);
 expect(rect!.x+rect!.width).toBeLessThanOrEqual(1366);
});

test.describe("iPad desktop-style UA and touch",()=>{
 test.use({
  viewport:{width:1024,height:1366},
  hasTouch:true,
  userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15"
 });
 test("iPad-as-Mac stays on web access and never offers the Android download",async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,"maxTouchPoints",{configurable:true,get:()=>5}));
  await page.goto("/",{waitUntil:"domcontentloaded"});
  const webApps=page.getByRole("button",{name:"Web Apps"}).first();
  await expect(webApps).toBeVisible();
  await webApps.click();
  await expect(page.getByRole("status")).toContainText("iPhone/iPad native distribution is not published yet");
  await expect(page.getByRole("button",{name:"Download Android App"})).toHaveCount(0);
 });
});
