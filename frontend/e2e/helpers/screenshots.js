export async function capture(page, testInfo, name, viewport) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
}
