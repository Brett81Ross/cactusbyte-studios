import {expect,test} from "@playwright/test";

const viewports=[
 {name:"Z Fold cover",width:360,height:748,mobile:true},
 {name:"Android phone",width:412,height:915,mobile:true},
 {name:"iPhone",width:390,height:844,mobile:true},
 {name:"Z Fold open portrait",width:884,height:1104,mobile:false},
 {name:"Z Fold open landscape",width:1104,height:884,mobile:false}
];

for(const viewport of viewports){
 test.describe(viewport.name,()=>{
  test.use({viewport:{width:viewport.width,height:viewport.height},userAgent:viewport.mobile?"Mozilla/5.0 (Linux; Android 16; Mobile) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36":undefined});
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
    const cardRects=Array.from(document.querySelectorAll(".card")).slice(0,4).map(element=>{const rect=element.getBoundingClientRect();return{left:Math.round(rect.left),right:Math.round(rect.right),width:Math.round(rect.width),top:Math.round(rect.top)}});
    const escapedImages=Array.from(document.querySelectorAll(".card img")).filter(visible).map(element=>{const image=element.getBoundingClientRect();const card=element.closest(".card")?.getBoundingClientRect();return{image,card}}).filter(({image,card})=>!card||image.left<card.left-1||image.right>card.right+1).length;
    return{overflow,controls,clippedDialogs,cardRects,escapedImages};
   });

   expect(audit.overflow,`horizontal overflow: ${audit.overflow}px`).toBeLessThanOrEqual(2);
   expect(audit.controls,`controls below the 48px target: ${JSON.stringify(audit.controls)}`).toEqual([]);
   expect(audit.clippedDialogs,"visible dialogs must stay in the viewport").toEqual([]);
   expect(audit.escapedImages,"app artwork must stay inside its card").toBe(0);
   expect(pageErrors,"uncaught browser errors").toEqual([]);

   if(viewport.width<=480){
    expect(new Set(audit.cardRects.slice(0,3).map(card=>card.left)).size,"cover/phone cards should be one column").toBe(1);
   }else if(viewport.width>=700){
    expect(new Set(audit.cardRects.slice(0,3).map(card=>card.left)).size,"Fold-open cards should use more than one column").toBeGreaterThan(1);
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
 expect(rect!.left).toBeGreaterThanOrEqual(0);
 expect(rect!.right??rect!.x+rect!.width).toBeUndefined();
 expect(rect!.x+rect!.width).toBeLessThanOrEqual(360);
 expect(rect!.y+rect!.height).toBeLessThanOrEqual(748);
 await expect(dialog.getByRole("button",{name:"Download Android App"})).toBeVisible();
 await expect(dialog).toContainText("Permanent-signing cutover remains separate");
});
