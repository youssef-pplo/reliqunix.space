# RELIQUNIX.SPACE

A scroll-driven 3D field archive for the NASA Space Apps “Abandoned but not Forgotten” challenge. Built locally with Next.js App Router, TypeScript, React Three Fiber, Three.js, Tailwind, GSAP, Lenis, Zustand, and Framer Motion.

## Run

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000). The project is already installed and its assets are generated. Node.js 20.9+ is required; the launcher automatically finds a modern installed NVM runtime if an older system Node shadows it. No API keys or external services are required to explore the archive.

```sh
npm run generate-assets  # NASA asset fetches with bounded timeouts + offline texture generation
npm test                # Archive integrity and injected-attribute React hydration regression
npm run typecheck       # Strict TypeScript validation
npm run build           # Asset generation + optimized production build
npm start               # Serve the production build
```

Webpack is selected explicitly because Turbopack's CSS worker socket is restricted in the development environment. TypeScript build errors are never ignored.

## Explore

- Initialize with procedural audio or enter silently. Audio is synthesized with the Web Audio API and can be toggled at any time.
- Scroll through a 600vh journey, or select a mission, orbital beacon, or radar node to fly directly to a relic.
- Switch between the Moon and Mars in the fixed navigation.
- Click a 3D component or a numbered component row to inspect its actual world-space target. The camera stays stable after each transition; pointer movement does not move or shake the view.
- Scrub environmental exposure from the abandonment date through the present to an illustrative 50-year projection. Materials, pitting, dust color, and structural settling update immediately.
- Return to flight with the drawer button or Escape. The drawer and story panels scroll independently while flight is locked or when reading a long record.
- Reach the Monument Ledger at the end of the tour, or use “The Ledger” on desktop. Its six records can also switch worlds.

The layout adapts to narrow screens with an upper 3D view and a bottom inspection drawer. Reduced-motion preferences disable smooth wheel scrolling and decorative motion. Components and timeline controls are keyboard accessible. A field-guide fallback keeps archive content accessible when WebGL is unavailable.

## Rendering and assets

Apollo’s descent stage, Opportunity, and Ingenuity now render authentic NASA GLB geometry. The complete Apollo source is filtered to the descent hardware; the ascent cabin is removed. Source meshes are merged by material and split into four independently selectable engineering groups, preserving textures and local inspection targets. The LRV, Surveyor 3, and EDL field are detailed interpretive reconstructions, clearly labeled in the interface. The rover reconstruction includes curved fenders, suspended fabric seats, and a tubular seat frame. All 24 groups support hover, click, focused inspection, and projected telemetry pins. `TelemetryHtml.tsx` uses a deferred DOM-root cleanup compatible with React 19, avoiding a synchronous unmount issue in the upstream HTML projection helper.

Client instrumentation removes known extension bookkeeping (`bis_skin_checked`, `bis_register`, and body `__processed_*` markers) before React hydrates, including Next.js metadata nodes. Its temporary observer disconnects after hydration. A body-only hydration exception also tolerates late writes of dynamic `__processed_*` names; descendant hydration checks remain enabled. The regression test reproduces the original warning and verifies clean hydration after marker cleanup.

The asset pipeline runs automatically before production builds. `scripts/acquire-nasa-models.mjs` acquires official NASA files with five-second timeouts and caches them locally. Opportunity’s original 11.91 MB model becomes a 3.12 MB web edition with every geometry buffer byte preserved; source textures are converted to WebP, with lossless normal maps. Apollo is 717 KB and Ingenuity is 2.02 MB. Draco decoders are bundled locally, so runtime model loading needs no external CDN. Models load as the visitor approaches their chapter; the scene remains usable with an explicit loading indicator and procedural fallback if a file fails. The catalog records credits, original links, bounds, triangle counts, and hashes. Offline Moon/Mars 2048×1024 PNG maps are also generated.

Runtime CanvasTexture factories supply six-octave noise, crater rings, height/normal/roughness maps, Voronoi thermal-foil crinkles, photovoltaic cell grids, and dust/pitting masks. Shader uniforms update decay without regenerating texture maps. Terrain includes a displaced 14,000-vertex plane, fine regolith PBR maps, 640 instanced rocks, dust, a Martian horizon haze shader, and a star field. A low directional sun, local PMREM reflections, restrained sky fill, and stable shadow targets give hardware shape without full-screen effect passes. Rendering runs on demand at 1× resolution, with 1024px shadows, distant hardware culled, and costly full-screen post-processing removed. The scene stops rendering once camera and hover transitions settle.

Fonts are bundled locally: Barlow Condensed, Space Grotesk, and IBM Plex Mono, under their included SIL Open Font Licenses. No Google Fonts request is made by the running application.

## Historical scope and credits

This is an independent educational Space Apps project, not an official NASA product. Site coordinates follow the supplied challenge brief and are approximate. The flight route compresses distant sites into an exhibit. Dry masses have explicit scope notes in the dataset. The environmental timeline is an artistic simulation, not a measured condition report or calibrated forecast.

The archive distinguishes hardware still in place from parts returned to Earth. Surveyor 3's camera and scoop were recovered by Apollo 12. The famous improvised map fender was on Apollo 17, not Apollo 15. Opportunity's final contact was in 2018 and its mission formally ended in 2019. Perseverance's sky crane is a separate impact location from the backshell and parachute.

Primary sources:

- [NASA — Apollo 11 landing site](https://science.nasa.gov/resource/apollo-11-landing-site/)
- [NASA — Apollo 15 mission details](https://www.nasa.gov/missions/apollo/apollo-15-mission-details/)
- [NASA NTRS — Surveyor 3 dust and radiation analysis](https://ntrs.nasa.gov/citations/19720019085)
- [NASA — Apollo 12 and Surveyor 3](https://science.nasa.gov/resource/apollo-12-and-surveyor-3/)
- [NASA — Opportunity mission conclusion](https://www.nasa.gov/news-release/nasas-record-setting-opportunity-rover-mission-on-mars-comes-to-end/)
- [NASA — Ingenuity Flight 72 investigation](https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/)
- [NASA JPL — Ingenuity surveys the landing hardware](https://www.jpl.nasa.gov/news/nasas-mars-helicopter-spots-gear-that-helped-perseverance-rover-land/)
- [NASA SVS — CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), color/elevation maps: NASA SVS, Ernie Wright, LRO/LROC/LOLA.
- [NASA Apollo Lunar Module](https://science.nasa.gov/3d-resources/apollo-lunar-module/), NASA / Michael D. Carbajal.
- [NASA Ingenuity Mars Helicopter](https://science.nasa.gov/3d-resources/ingenuity-mars-helicopter/), NASA / Brian E. Kumanchik.
- [NASA Spirit and Opportunity rover model](https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/), NASA / JPL-Caltech.
- [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources); detailed file provenance is bundled in `public/assets/nasa-model-catalog.json`.

## Project structure

```text
scripts/             Asset generation, runtime launcher, archive verification
src/app/             App shell, smooth-scroll coordination, visual system, ledger
src/components/
  canvas/            Globe, terrain, hardware, camera, telemetry projection, effects
  hud/               Boot screen, navigation, stories, inspection, radar, cursor
src/data/            Six curated historical and engineering records
src/store/           Serializable interaction state and navigation actions
src/utils/           Canvas textures, live component registry, procedural sound
public/assets/       Local textures, fonts/licenses, live NASA models/decoders, provenance catalog, manifest
```

## Deploy to Vercel

Import this project directory as a Next.js project. `vercel.json` sets `npm ci` and `npm run build`; Node.js 24 is selected by `package.json`. Leave the output directory at the framework default. No environment variables are required.

Include `public/assets` in your repository/upload: the NASA models, fonts, textures, and local Draco decoder are intentional deployment assets. Models are no longer Git-ignored, so deployment does not depend on NASA downloads succeeding during a build. The asset pipeline uses these cached files first and regenerates the optimized rover and provenance catalog. `.vercelignore` excludes local caches, screenshots, and editor metadata.

You can also deploy from the project root with the Vercel CLI. Project/account binding is created by Vercel when you deploy; no account identifiers or credentials are committed.
