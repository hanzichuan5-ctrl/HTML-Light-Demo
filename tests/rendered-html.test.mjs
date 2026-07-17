import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the HZC light experience shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>菠萝包 &amp; さと — HZC<\/title>/i);
  assert.match(html, /Interactive HZC detective light playroom/);
  assert.match(html, /菠萝包/);
  assert.match(html, /さと/);
  assert.match(html, /侦探搭档/);
  assert.match(html, /はじめましてよろしくお願いします/);
  assert.match(html, /CASE LIVE/);
});

test("keeps the light, controls, and simulation in the shipped source", async () => {
  const [experience, canvas, surface, detectiveExperience, detectiveEggs, detectiveStorage, compatibility, config, page, layout, packageJson, worker] = await Promise.all([
    readFile(new URL("../app/MorsLightExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/light/MorsLightCanvas.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/light/MorsPageSurface.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/light/DetectiveExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/light/detective-eggs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/light/detective-storage.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/light/three-html-compatibility.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/light/config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
  ]);

  assert.match(experience, /dynamic\(/);
  assert.match(experience, /ssr: false/);
  assert.match(experience, /loading: MorsLightLoading/);
  assert.doesNotMatch(experience, /from "three"/);
  assert.match(canvas, /new THREE\.HTMLTexture/);
  assert.match(compatibility, /function installThreeHtmlTextureCompatibility/);
  assert.match(compatibility, /value: function texElementImage2D\(/);
  assert.match(canvas, /new THREE\.HemisphereLight/);
  assert.match(canvas, /new THREE\.DirectionalLight/);
  assert.match(canvas, /new THREE\.SpotLight/);
  assert.doesNotMatch(canvas, /ConeGeometry/);
  assert.match(canvas, /event\.button === 2/);
  assert.match(canvas, /Math\.round\(beamStartAngle \+ movementX \* 0\.14\)/);
  assert.match(canvas, /shouldCycleColor/);
  assert.match(canvas, /contextmenu/);
  assert.match(canvas, /const BASE_LIGHT_DIRECTION = DOWN\.clone\(\)/);
  assert.match(canvas, /const sceneCenterY/);
  assert.match(canvas, /const fixedStep = 1 \/ 120/);
  assert.match(canvas, /function updatePointerTarget/);
  assert.match(canvas, /pullStrength/);
  assert.match(canvas, /intersectPlane/);
  assert.doesNotMatch(canvas, /isInteractiveTarget/);
  assert.doesNotMatch(canvas, /event\.preventDefault\(\)/);
  assert.match(canvas, /width < 760 \? 1\.25 : 1\.5/);
  assert.match(surface, /LIGHT_MODES/);
  assert.match(surface, /FOUND CLUE/);
  assert.match(surface, /SEARCHING/);
  assert.match(surface, /CLUE_DETECTION_RADIUS/);
  assert.doesNotMatch(surface, /clue-marker/);
  assert.doesNotMatch(surface, /inspector-light/);
  assert.match(surface, /20260716-231908\.jpg/);
  assert.match(surface, /菠萝包/);
  assert.match(surface, /さと/);
  assert.match(surface, />BEAM</);
  assert.match(surface, /BRIGHTNESS/);
  assert.match(surface, />COLOR</);
  assert.match(config, /"#ffffff"/);
  assert.match(config, /案件/);
  assert.match(surface, /function MorsLightPreview/);
  assert.match(detectiveExperience, /fingerprint-unlock/);
  assert.match(detectiveExperience, /侦探手册/);
  assert.match(detectiveEggs, /createRoundEggs/);
  assert.match(detectiveEggs, /PHRASE_EGGS/);
  assert.match(detectiveEggs, /ENVIRONMENT_EGGS/);
  assert.match(detectiveStorage, /indexedDB\.open/);
  assert.match(page, /<MorsLightExperience \/>/);
  assert.match(layout, /HZC/);
  assert.match(layout, /Noto_Sans_JP/);
  assert.match(layout, /20260716-231908\.jpg/);
  assert.match(packageJson, /"three-html-render"/);
  assert.doesNotMatch(packageJson, /tailwindcss/);
  assert.doesNotMatch(worker, /image-optimization/);
});

test("keeps the GitHub Pages static deployment configured", async () => {
  const [nextConfig, workflow, readme, surface] = await Promise.all([
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../app/light/MorsPageSurface.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(nextConfig, /output: "export"/);
  assert.match(nextConfig, /basePath/);
  assert.match(surface, /NEXT_PUBLIC_BASE_PATH/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v5/);
  assert.match(readme, /https:\/\/hanzichuan5-ctrl\.github\.io\/HTML-Light-Demo\//);
});
