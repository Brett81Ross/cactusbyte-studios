import { expect, test } from "@playwright/test";

for (const viewport of [{name:"Fold cover",width:360,height:748},{name:"Android",width:412,height:915},{name:"iPhone",width:390,height:844},{name:"Fold unfolded",width:884,height:1104},{name:"Fold landscape",width:1104,height:884}]) {
  test(`Acelynn beta renders and works on ${viewport.name}`, async ({page}) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto("/acelynn-beta");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading",{name:"Help test Acelynn Pro™"})).toBeVisible();
    const logo = page.getByAltText("Acelynn Pro microphone logo");
    await expect(logo).toBeVisible();
    expect(await logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(page.getByRole("heading",{level:2})).toHaveCount(4);
    await expect(page.getByRole("link",{name:"Get Acelynn Pro",exact:true})).toHaveAttribute("href","https://play.google.com/apps/testing/com.cactusbyte.acelynnpro");
    await expect(page.getByRole("link",{name:"Join Tester Group",exact:true})).toHaveAttribute("href","https://groups.google.com/g/acelynn-pro-testers");
    await expect(page.getByRole("button",{name:"Owner Health"})).toHaveCount(0);
    await expect(page.getByRole("button",{name:"Settings",exact:true})).toHaveCount(0);
    await expect(page.locator("footer")).toContainText("All Rights Reserved");
    await expect(page.locator("footer")).toContainText("Beta page v1.2.2");
    const audit = await page.evaluate(() => {
      const main = document.querySelector("main")!;
      const rect = main.getBoundingClientRect();
      const bad = [...main.querySelectorAll("nav a, nav button")].map(e=>e.getBoundingClientRect()).filter(r=>r.height<48||r.width<48||r.left<0||r.right>innerWidth+1);
      const overflow = document.documentElement.scrollWidth-innerWidth;
      const title = document.querySelector("h1")!.getBoundingClientRect();
      return {bad:bad.length,overflow,titleFits:title.left>=0&&title.right<=innerWidth+1,mainFits:rect.width<=innerWidth+1};
    });
    expect(audit).toEqual({bad:0,overflow:0,titleFits:true,mainFits:true});
    await page.screenshot({path:`/tmp/acelynn-beta-${viewport.width}.png`,fullPage:true});
    await page.getByRole("button",{name:"QR Code",exact:true}).click();
    const dialog = page.getByRole("dialog",{name:"Share Acelynn Pro™"});
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("svg")).toHaveCount(1);
    const dialogRect = await dialog.boundingBox();
    expect(dialogRect!.x).toBeGreaterThanOrEqual(0);
    expect(dialogRect!.x+dialogRect!.width).toBeLessThanOrEqual(viewport.width);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("button",{name:"QR Code",exact:true})).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test("Share sends the beta page and QR contains that same URL",async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,"share",{value:async(data:ShareData)=>{(window as unknown as {shared:ShareData}).shared=data;}});
  });
  await page.goto("/acelynn-beta");
  await page.getByRole("button",{name:"Share",exact:true}).click();
  expect(await page.evaluate(()=>(window as unknown as {shared:ShareData}).shared.url)).toBe("https://cactusbyte-studios.vercel.app/acelynn-beta");
});
