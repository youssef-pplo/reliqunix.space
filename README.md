# RELIQUNIX.SPACE

A scroll-driven 3D field archive for the NASA Space Apps [“Abandoned but not Forgotten” challenge](https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources). Twelve objects on the Moon and Mars connect the equipment left behind to its engineering, scientific discoveries, and human stories. Built with Next.js App Router, TypeScript, React Three Fiber, Three.js, Tailwind, GSAP, Lenis, Zustand, and Framer Motion.

## Run

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000). The project is already installed and its assets are generated. Node.js 20.9+ is required; the launcher automatically finds a modern installed NVM runtime if an older system Node shadows it. No API keys or external services are required to explore the archive.

```sh
npm run generate-assets  # NASA asset fetches with bounded timeouts + offline texture generation
npm test                # Archive, navigation, notebook, source/asset integrity + React hydration regression
npm run typecheck       # Strict TypeScript validation
npm run build           # Asset generation + optimized production build
npm start               # Serve the production build
```

Webpack is selected explicitly because Turbopack's CSS worker socket is restricted in the development environment. TypeScript build errors are never ignored.

## Explore

- Initialize with procedural audio or enter silently. Audio is synthesized with the Web Audio API and can be toggled at any time.
- Scroll through the journey, or select a mission, orbital beacon, radar node, or archive card to fly directly to a relic.
- Switch between the Moon and Mars in the fixed navigation.
- Open **Explore Archive** to search by object, mission, or location and filter by world. Its NASA sources tab explains which challenge resources support each part of the experience.
- Open a **NASA mission file** inside the collection or a surface story for sourced facts, a three-event timeline, and a learning takeaway. There are 36 facts and 36 timeline events across twelve files, linked to 27 NASA resources.
- Take the **Field Mission** through Eagle, Surveyor 3, and InSight. Read a component record or inspect it in 3D, answer a discovery question, and write a curator story tied to a selected NASA fact.
- Download a printable field report with local activity and learner writing, a classroom worksheet, or the NASA evidence pack. HTML exports open in a browser and support printing or saving as PDF. Evidence JSON excludes learner writing.
- Click a 3D component or a numbered component row to inspect its actual world-space target. The camera stays stable after each transition; pointer movement does not move or shake the view.
- Answer each object's discovery question to collect its entry in the Explorer Notebook. Inspected objects and correct answers are saved in this browser; repeated answers do not increase the count.
- Scrub environmental exposure from the recorded retirement or placement date through the present to an illustrative 50-year projection. Materials, pitting, dust color, and structural settling update immediately.
- Return to flight with the drawer button or Escape. The drawer and story panels scroll independently while flight is locked or when reading a long record.
- Reach the Monument Ledger at the end of the tour, or open it from the archive footer. Its twelve records can also switch worlds.

The layout adapts to narrow screens with an upper 3D view and a bottom inspection drawer. Reduced-motion preferences disable smooth wheel scrolling and decorative motion. Components and timeline controls are keyboard accessible. A field-guide fallback keeps archive content accessible when WebGL is unavailable.

| The Moon | Mars |
| --- | --- |
| Apollo 11 Eagle descent stage | Opportunity rover |
| Apollo 15 Lunar Roving Vehicle | Ingenuity helicopter |
| Surveyor 3 | Perseverance landing debris |
| Apollo 12 ALSEP science station | Spirit rover |
| Apollo 14 equipment cart | Sojourner rover |
| Apollo 11 television camera | InSight lander |

## Rendering and assets

Apollo’s descent stage, Opportunity, Spirit, and Ingenuity render NASA GLB geometry. Spirit and Opportunity share NASA's Mars Exploration Rover reference asset, with object-specific component labels and inspection groups. The complete Apollo source is filtered to the descent hardware; the ascent cabin is removed. Source meshes are merged by material and split into four independently selectable engineering groups, preserving textures and local inspection targets.

The other eight objects are interpretive reconstructions, labeled in the interface. They include the LRV's woven wheels and folding seats, Surveyor's remaining support structure, the ALSEP station and experiment instruments, a two-wheel equipment cart, a television camera and tripod, Sojourner's six-wheel chassis, InSight's circular solar arrays and surface instrument, and the EDL debris field. All 48 groups support hover, click, focused inspection, and projected telemetry pins. `TelemetryHtml.tsx` uses deferred DOM-root cleanup compatible with React 19.

Client instrumentation removes known extension bookkeeping (`bis_skin_checked`, `bis_register`, and body `__processed_*` markers) before React hydrates, including Next.js metadata nodes. Its temporary observer disconnects after hydration. A body-only hydration exception also tolerates late writes of dynamic `__processed_*` names; descendant hydration checks remain enabled. The regression test reproduces the original warning and verifies clean hydration after marker cleanup.

The asset pipeline runs automatically before production builds. `scripts/acquire-nasa-models.mjs` acquires official NASA files with five-second timeouts and caches them locally. Opportunity’s original 11.91 MB model becomes a 3.12 MB web edition with every geometry buffer byte preserved; source textures are converted to WebP, with lossless normal maps. Apollo is 717 KB and Ingenuity is 2.02 MB. Draco decoders are bundled locally, so runtime model loading needs no external CDN. Models load as the visitor approaches their chapter; the scene remains usable with an explicit loading indicator and procedural fallback if a file fails. The catalog records credits, original links, bounds, triangle counts, and hashes. Offline Moon/Mars 2048×1024 PNG maps are also generated.

Runtime CanvasTexture factories supply noise, crater rings, height/normal/roughness maps, thermal-foil crinkles, photovoltaic cell grids, and dust/pitting masks. Shader uniforms update decay without regenerating texture maps. Terrain extends along the collection's actual exhibit route, with flat display areas, instanced rocks, dust, Martian horizon haze, and stars. A low directional sun, local PMREM reflections, restrained sky fill, and stable shadow targets give hardware shape without full-screen effect passes. Rendering runs on demand at 1× resolution, with 1024px shadows and distant hardware culled. The scene stops rendering once camera and hover transitions settle.

Fonts are bundled locally: Barlow Condensed, Space Grotesk, and IBM Plex Mono, under their included SIL Open Font Licenses. No Google Fonts request is made by the running application.

## Historical scope and credits

This is an independent educational Space Apps project, not an official NASA product. The source hub distinguishes resources from the official challenge from supporting NASA records and maps each resource to the objects it informs. `src/data/challengeResources.ts` records those relationships; every object also carries its primary mission source.

Coordinates are approximate mission-site markers, not surveyed positions of individual small objects. The flight route compresses distant sites into an exhibit. Recorded masses have explicit scope notes. NASA reference geometry represents engineering models, not a present-day scan. The environmental timeline is an artistic simulation, not a measured condition report or calibrated forecast. Each record identifies whether hardware was retired or discarded.

The archive distinguishes hardware still in place from parts returned to Earth. Surveyor 3's camera and scoop were recovered by Apollo 12. The famous improvised map fender was on Apollo 17, not Apollo 15. Opportunity's final contact was in 2018 and its mission formally ended in 2019. Perseverance's sky crane is a separate impact location from the backshell and parachute. InSight's heat probe is not shown as having achieved its planned depth. AI assisted with code and editorial development; NASA mission evidence and model provenance remain linked.

Primary sources:

- [NASA — Apollo 11 landing site](https://science.nasa.gov/resource/apollo-11-landing-site/)
- [NASA — Apollo 15 mission details](https://www.nasa.gov/missions/apollo/apollo-15-mission-details/)
- [NASA NTRS — Surveyor 3 dust and radiation analysis](https://ntrs.nasa.gov/citations/19720019085)
- [NASA — Apollo 12 and Surveyor 3](https://science.nasa.gov/resource/apollo-12-and-surveyor-3/)
- [NASA — Opportunity mission conclusion](https://www.nasa.gov/news-release/nasas-record-setting-opportunity-rover-mission-on-mars-comes-to-end/)
- [NASA — Ingenuity Flight 72 investigation](https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/)
- [NASA JPL — Ingenuity surveys the landing hardware](https://www.jpl.nasa.gov/news/nasas-mars-helicopter-spots-gear-that-helped-perseverance-rover-land/)
- [NASA — Spirit and Opportunity](https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/)
- [NASA — Pathfinder and Sojourner](https://science.nasa.gov/mission/mars-pathfinder/)
- [NASA — InSight](https://science.nasa.gov/mission/insight/)
- [NASA — ALSEP operating history](https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_18-31_ALSEP_Arrays_and_Status.htm)
- [NASA NTRS — Apollo surface equipment and mobility](https://ntrs.nasa.gov/citations/20040200983)
- [NASA — Apollo 11 surface operations](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.summary.html)
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
  hud/               Boot screen, archive/source hub, notebook, stories, inspection, radar, cursor
src/data/            Twelve historical/engineering records, discovery questions, challenge sources
src/store/           Serializable interaction state and navigation actions
src/utils/           Canvas textures, live component registry, procedural sound
public/assets/       Local textures, fonts/licenses, live NASA models/decoders, provenance catalog, manifest
```

`npm test` checks continuous camera paths and globe clearance on desktop/mobile, all twelve flight destinations, all 48 inspection targets, source-to-claim mappings, guided learning completion, notebook and curator-note restoration, safe printable exports, NASA attribution, local GLB payloads, and geometry preservation during texture optimization. It also runs the injected-attribute hydration regression. Browser checks remain necessary to judge visual composition and graphics performance.

The [judging playbook](docs/JUDGING-PLAYBOOK.md) maps the five evaluation pillars to demonstrable features, includes a 90-second pitch, and describes a learner pilot. Local participation counts are not evidence of validated learning gain; no audience reach or educational effectiveness has been invented.

For a concise presentation sequence and evidence checklist, see [the demonstration guide](docs/DEMO-GUIDE.md).

## Deploy to Vercel

Import this project directory as a Next.js project. `vercel.json` sets `npm ci` and `npm run build`; Node.js 24 is selected by `package.json`. Leave the output directory at the framework default. No environment variables are required.

Include `public/assets` in your repository/upload: the NASA models, fonts, textures, and local Draco decoder are intentional deployment assets. Models are no longer Git-ignored, so deployment does not depend on NASA downloads succeeding during a build. The asset pipeline uses these cached files first and regenerates the optimized rover and provenance catalog. `.vercelignore` excludes local caches, screenshots, and editor metadata.

You can also deploy from the project root with the Vercel CLI. Project/account binding is created by Vercel when you deploy; no account identifiers or credentials are committed.
