export type CelestialBody = 'MOON' | 'MARS';
export type Vec3 = [number, number, number];
export interface RelicPart {
  partId: string;
  label: string;
  shortLabel: string;
  material: string;
  status: string;
  telemetryCode: string;
  story: string;
  cameraOffset: Vec3;
  lookAtOffset: Vec3;
}
export interface Relic {
  id: string;
  name: string;
  shortName: string;
  mission: string;
  planet: CelestialBody;
  yearAbandoned: number;
  massKg: number;
  massNote: string;
  coordinates: { lat: number; lng: number; regionName: string };
  splineProgress: number;
  altitudeKm: number;
  heroQuote: string;
  scientificStory: string;
  whyAbandoned: string;
  environmentalThreat: string;
  archiveQuote: string;
  quoteAttribution: string;
  sourceUrl: string;
  sourceTitle: string;
  position: Vec3;
  parts: RelicPart[];
}

export const relicsData: Relic[] = [
  {
    id: 'eagle', name: 'Eagle descent stage', shortName: 'Eagle', mission: 'APOLLO 11', planet: 'MOON', yearAbandoned: 1969,
    massKg: 2034, massNote: 'Approximate descent-stage dry mass; excludes expended propellant.',
    coordinates: { lat: 0.6741, lng: 23.473, regionName: 'Mare Tranquillitatis' }, splineProgress: 0.45, altitudeKm: 0.001, position: [0, 0, 0],
    heroQuote: 'The first step needed something to leave behind.',
    scientificStory: 'On July 20, 1969, Eagle carried two people to the Sea of Tranquility. Its lower stage became a launchpad for their return. The gold-wrapped frame still marks the place where a human journey became an interplanetary one.',
    whyAbandoned: 'Every kilogram mattered. The descent stage had finished its job; only the ascent cabin, crew, and samples needed to return to lunar orbit.',
    environmentalThreat: 'Without air or rain, there is no ordinary rust. Ultraviolet radiation, extreme thermal cycles, charged dust, and micrometeorites slowly alter exposed materials.',
    archiveQuote: 'We came in peace for all mankind.', quoteAttribution: 'APOLLO 11 COMMEMORATIVE PLAQUE',
    sourceUrl: 'https://science.nasa.gov/resource/apollo-11-landing-site/', sourceTitle: 'NASA · Apollo 11 landing site',
    parts: [
      { partId: 'eagle-kapton', label: 'Kapton Gold Thermal Blanket', shortLabel: 'Thermal blanket', material: 'Aluminized multilayer insulation · Kapton', status: 'EXPOSED / PASSIVE', telemetryCode: 'LM-5 / MLI-01', story: 'Thin reflective layers helped keep tanks and electronics within operating temperatures. The gold appearance comes from the amber polymer film; it is insulation, not a solid gold skin. It remained wrapped around the structure after liftoff.', cameraOffset: [4, 2.6, 5], lookAtOffset: [0, 1.5, 0] },
      { partId: 'eagle-gear', label: 'Landing Gear & Commemorative Plaque', shortLabel: 'Gear & plaque', material: 'Aluminum struts · stainless-steel plaque', status: 'DEPLOYED / IN SITU', telemetryCode: 'LM-5 / LG-02', story: 'Four legs spread the landing load across the regolith. The forward leg carries a message from Earth. The legs and ladder stayed because they belong to the descent stage, making a functional structure into a permanent marker.', cameraOffset: [3, 1.7, 4], lookAtOffset: [1.8, 0.8, 0] },
      { partId: 'eagle-engine', label: 'Descent Propulsion Engine Bell', shortLabel: 'Engine bell', material: 'Ablative-lined combustion chamber', status: 'SHUT DOWN / FUEL SPENT', telemetryCode: 'LM-5 / DPS-03', story: 'The throttleable descent engine controlled the last approach. It never needed to fire again: a separate ascent engine lifted the crew away. The bell remains under the platform, close to the surface it helped reach.', cameraOffset: [3, 0.9, 4], lookAtOffset: [0, 0.7, 0] },
      { partId: 'eagle-battery', label: 'Outgassing Batteries & Deflector', shortLabel: 'Power & deflector', material: 'Silver-zinc battery cases · thermal shielding', status: 'DEENERGIZED / SEALED', telemetryCode: 'LM-5 / EPS-04', story: 'Descent-stage batteries powered the landing and surface stay. They were not return cargo. This reconstruction shows the cases and shielding; their present internal condition and any residual outgassing are not directly measured.', cameraOffset: [-3, 2.1, 4], lookAtOffset: [-1.2, 1.5, 0] },
    ],
  },
  {
    id: 'lrv', name: 'Lunar Roving Vehicle', shortName: 'LRV–1', mission: 'APOLLO 15', planet: 'MOON', yearAbandoned: 1971,
    massKg: 210, massNote: 'Approximate unloaded rover mass on Earth.',
    coordinates: { lat: 26.1322, lng: 3.6339, regionName: 'Hadley–Apennine' }, splineProgress: 0.65, altitudeKm: 0.001, position: [0, 0, -35],
    heroQuote: 'Its last passenger was a view of the way home.',
    scientificStory: 'The first lunar rover expanded the astronauts’ reach beyond walking distance. After almost 28 kilometers of travel, Scott and Irwin parked it to watch Falcon depart. The rover’s television camera transmitted the first live lunar liftoff.',
    whyAbandoned: 'The foldable electric rover was a one-way vehicle. The lunar module could carry people and samples back, but had no capacity to return the car.',
    environmentalThreat: 'Abrasive dust coats mesh, lenses, and hinges. Long hot days and cold nights stress joints and insulation; micrometeoroids add tiny impact scars over time.',
    archiveQuote: 'For the first time, the lunar liftoff was seen on Earth via the LRV television camera.', quoteAttribution: 'NASA · APOLLO 15 MISSION DETAILS',
    sourceUrl: 'https://www.nasa.gov/missions/apollo/apollo-15-mission-details/', sourceTitle: 'NASA · Apollo 15 mission details',
    parts: [
      { partId: 'lrv-wheels', label: 'Woven Zinc Piano-Wire Mesh Wheels', shortLabel: 'Mesh wheels', material: 'Zinc-coated steel wire · titanium chevrons', status: 'PARKED / DUST COATED', telemetryCode: 'LRV-1 / MOB-01', story: 'Flexible woven wheels grip soft ground without an air-filled tire. Titanium chevrons help transmit traction. The mesh remains a record of a practical answer to driving where punctures could not be repaired.', cameraOffset: [3, 1.2, 3.5], lookAtOffset: [1.1, 0.5, 0.9] },
      { partId: 'lrv-dish', label: 'High-Gain S-Band Dish Antenna', shortLabel: 'S-band dish', material: 'Conductive mesh · aluminum gimbal', status: 'UNPOWERED / EARTH LINK LOST', telemetryCode: 'LRV-1 / COM-02', story: 'The high-gain antenna linked television and data to Earth. Astronauts manually pointed the narrow beam. Once the batteries and mission ended, the dish became a silent directional instrument.', cameraOffset: [3.2, 3.7, 3.8], lookAtOffset: [0.9, 2.3, -0.3] },
      { partId: 'lrv-camera', label: 'Westinghouse Color TV Camera (that filmed liftoff)', shortLabel: 'TV camera', material: 'Optical glass · aluminum housing', status: 'TRANSMISSION ENDED', telemetryCode: 'LRV-1 / TV-03', story: 'Ground controllers could pan and tilt this camera. It broadcast Falcon’s departure, although the tilt mechanism did not track the full ascent. The camera stayed attached to the rover after its final audience watched from Earth.', cameraOffset: [-2.4, 2.6, 3], lookAtOffset: [-0.6, 1.9, -0.5] },
      { partId: 'lrv-fender', label: 'Lunar Dust Fender Extension', shortLabel: 'Dust fender', material: 'Fiberglass wheel fender', status: 'IN SITU / MISSION CONFIGURATION', telemetryCode: 'LRV-1 / DUST-04', story: 'Fenders limit the spray of abrasive dust from the wheels. This is the Apollo 15 fender assembly; the famous improvised map-and-tape extension belongs to Apollo 17 and is not attributed to LRV-1 here.', cameraOffset: [-3, 1.5, 3.2], lookAtOffset: [-1.1, 0.9, 0.9] },
    ],
  },
  {
    id: 'surveyor', name: 'Surveyor 3 robotic lander', shortName: 'Surveyor 3', mission: 'SURVEYOR PROGRAM', planet: 'MOON', yearAbandoned: 1967,
    massKg: 302, massNote: 'Approximate landed mass, before Apollo 12 removed samples.',
    coordinates: { lat: -3.0162, lng: -23.4216, regionName: 'Oceanus Procellarum' }, splineProgress: 0.85, altitudeKm: 0.001, position: [0, 0, -70],
    heroQuote: 'The machine that waited for a human visitor.',
    scientificStory: 'Surveyor 3 tested the Moon before the Apollo crews arrived. In 1969, Apollo 12 landed nearby. Its astronauts removed hardware for examination on Earth, turning a retired robot into a long-duration materials experiment.',
    whyAbandoned: 'Surveyor was built to land, photograph, and sample, with no ascent system. Its final contact came in May 1967; most of the lander remains where it settled.',
    environmentalThreat: 'Returned surfaces revealed radiation darkening and dust effects. Apollo 12’s landing plume also sandblasted the nearby hardware, adding human activity to natural weathering.',
    archiveQuote: 'Lunar dust and radiation darkening of Surveyor 3 surfaces', quoteAttribution: 'NASA MATERIALS ANALYSIS · 1972',
    sourceUrl: 'https://ntrs.nasa.gov/citations/19720019085', sourceTitle: 'NASA NTRS · Surveyor 3 materials analysis',
    parts: [
      { partId: 'surveyor-scoop', label: 'Surface Sampler Soil Scoop', shortLabel: 'Sampler scoop', material: 'Steel scoop · articulated aluminum arm', status: 'SAMPLE RETURNED / ARM REMAINS', telemetryCode: 'SV-3 / SMPL-01', story: 'The sampler dug into lunar soil to test its mechanical properties. Apollo 12 returned the scoop to Earth. The highlighted assembly marks its original position and the remaining arm; the ghosted scoop is a reconstruction.', cameraOffset: [3, 1.6, 3.7], lookAtOffset: [1.6, 0.5, 0.6] },
      { partId: 'surveyor-camera', label: 'Cut Camera Support Strut (retrieved by Apollo 12)', shortLabel: 'Cut camera strut', material: 'Aluminum support · severed tube', status: 'CAMERA RETURNED / CUT REMNANT', telemetryCode: 'SV-3 / CAM-02', story: 'Conrad and Bean removed the television camera and other samples. The severed support is evidence of that visit. The camera itself is on Earth; this model preserves the cut support rather than claiming it is still on the Moon.', cameraOffset: [-2.4, 2.8, 3], lookAtOffset: [-0.5, 2.1, 0] },
      { partId: 'surveyor-panels', label: 'Solar Radiation-Tanned White Panels', shortLabel: 'Tanned panels', material: 'White thermal paint · structural aluminum', status: 'DISCOLORED / EXPOSED', telemetryCode: 'SV-3 / THM-03', story: 'White surfaces reflected sunlight to control temperature. Returned samples let researchers investigate how illumination and dust changed their appearance. Weathered color here illustrates that process rather than measuring the lander today.', cameraOffset: [3, 2.7, 4], lookAtOffset: [0, 1.5, 0] },
      { partId: 'surveyor-thrusters', label: 'Vernier Descent Thrusters', shortLabel: 'Vernier thrusters', material: 'Metal thrust chambers · propellant lines', status: 'SHUT DOWN / LANDED', telemetryCode: 'SV-3 / VERN-04', story: 'Three small engines steered the final descent after the main braking phase. Their fine control was essential to reaching the ground intact. With no return stage, the propulsion hardware stayed on the surface.', cameraOffset: [-3, 1.4, 3], lookAtOffset: [-0.8, 0.7, 0] },
    ],
  },
  {
    id: 'opportunity', name: 'Opportunity rover', shortName: 'Opportunity', mission: 'MARS EXPLORATION ROVER · B', planet: 'MARS', yearAbandoned: 2018,
    massKg: 185, massNote: 'Approximate rover mass; mission formally concluded in 2019.',
    coordinates: { lat: -2.0465, lng: 354.7384, regionName: 'Perseverance Valley' }, splineProgress: 0.45, altitudeKm: 0.001, position: [0, 0, 0],
    heroQuote: 'Ninety days became fourteen years.',
    scientificStory: 'Built for a 90-sol mission, Opportunity explored for more than fourteen years. Its instruments read the minerals and layers of a once-wetter Mars. A planet-wide dust storm silenced the solar-powered rover in June 2018.',
    whyAbandoned: 'The storm blocked sunlight and communication stopped. After repeated recovery attempts, NASA ended the mission on February 13, 2019. No return capability had ever been part of the rover.',
    environmentalThreat: 'Airborne dust dims solar cells and settles into mechanisms. Wind can both bury and clean exposed surfaces; daily temperature swings stress structures. The exact current dust cover is unknown.',
    archiveQuote: 'NASA’s Record-Setting Opportunity Rover Mission on Mars Comes to End', quoteAttribution: 'NASA MISSION ANNOUNCEMENT · FEB 13, 2019',
    sourceUrl: 'https://www.nasa.gov/news-release/nasas-record-setting-opportunity-rover-mission-on-mars-comes-to-end/', sourceTitle: 'NASA · Opportunity mission conclusion',
    parts: [
      { partId: 'opportunity-solar', label: 'Dust-Buried GaAs Solar Wings', shortLabel: 'Solar wings', material: 'Multi-junction gallium-arsenide solar cells', status: 'UNPOWERED / DUST EXPOSURE', telemetryCode: 'MER-B / PWR-01', story: 'Solar wings powered the rover far beyond its planned lifetime. Storm opacity, not a measured photograph of burial, explains the last power crisis. The growing dust layer in this experience is an environmental illustration.', cameraOffset: [3.5, 3.4, 4], lookAtOffset: [0, 1.25, 0] },
      { partId: 'opportunity-pancam', label: 'Pancam Mast Assembly', shortLabel: 'Pancam mast', material: 'Stereo optics · aluminum mast', status: 'LAST CONTACT · JUN 2018', telemetryCode: 'MER-B / CAM-02', story: 'Two camera eyes recorded color panoramas and helped navigate rocks, dunes, and crater rims. The mast remains above the deck, aimed into a landscape it can no longer describe to Earth.', cameraOffset: [2.4, 3.2, 3], lookAtOffset: [0, 2.4, -0.5] },
      { partId: 'opportunity-arm', label: 'Robotic Arm (IDD) & Rock Abrasion Tool', shortLabel: 'Arm & abrasion tool', material: 'Aluminum joints · diamond grinding surface', status: 'PARKED / SCIENCE ENDED', telemetryCode: 'MER-B / IDD-03', story: 'The instrument deployment device placed tools against rocks. Its abrasion tool exposed fresh material beneath weathered surfaces, letting instruments examine the geology. NASA’s reference model shows the arm in its stowed pose, rather than its final science position.', cameraOffset: [-3, 1.6, 3], lookAtOffset: [-0.6, 0.8, 1.6] },
      { partId: 'opportunity-antenna', label: 'High-Gain Gimbal Antenna', shortLabel: 'High-gain antenna', material: 'X-band antenna · two-axis gimbal', status: 'EARTH LINK SILENT', telemetryCode: 'MER-B / HGA-04', story: 'This steerable antenna allowed direct communication with Earth. Other data traveled through Mars orbiters. After the final signal, both routes fell silent; the hardware is still part of the rover.', cameraOffset: [3, 2.8, 3], lookAtOffset: [0.9, 1.7, 0.3] },
    ],
  },
  {
    id: 'ingenuity', name: 'Ingenuity Mars helicopter', shortName: 'Ingenuity', mission: 'MARS 2020 · INGENUITY', planet: 'MARS', yearAbandoned: 2024,
    massKg: 1.8, massNote: 'Flight mass on Earth; no longer flight-capable after Flight 72.',
    coordinates: { lat: 18.4991, lng: 77.3156, regionName: 'Valinor Hills · Jezero Crater' }, splineProgress: 0.65, altitudeKm: 0.001, position: [0, 0, -35],
    heroQuote: 'A little of the first flight. A new world of firsts.',
    scientificStory: 'Ingenuity proved powered flight was possible on Mars. An experiment planned for five flights completed seventy-two. Rotor damage during its final landing on January 18, 2024 ended the flying mission in the dunes of Valinor Hills.',
    whyAbandoned: 'Damaged blades could no longer support flight. The helicopter remained upright, and its team prepared it to collect stationary data before Perseverance moved beyond communication range.',
    environmentalThreat: 'Dust, cold, and thermal cycling challenge electronics and solar charging. Rotor damage is observed; the later dust and structural changes shown by the slider are speculative.',
    archiveQuote: 'NASA Performs First Aircraft Accident Investigation on Another World', quoteAttribution: 'NASA / JPL-CALTECH · DEC 2024',
    sourceUrl: 'https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/', sourceTitle: 'NASA · Ingenuity Flight 72 investigation',
    parts: [
      { partId: 'ingenuity-rotor', label: 'Fractured Carbon-Fiber Rotor Blade (Flight 72)', shortLabel: 'Fractured rotor', material: 'Carbon-fiber composite · foam core', status: 'DAMAGED / FLIGHT 72', telemetryCode: 'MH-1 / ROT-01', story: 'The navigation system struggled over low-texture terrain during the last landing. Investigators concluded hard touchdown and blade damage ended flight. One blade detached; the shortened geometry shows the observed failure in simplified form.', cameraOffset: [2.6, 2.6, 3], lookAtOffset: [0, 1.9, 0] },
      { partId: 'ingenuity-fabric', label: '1903 Wright Flyer Wing Fabric Swatch', shortLabel: 'Wright Flyer fabric', material: 'Muslin fabric · protective mount', status: 'ENCLOSED / HISTORIC CARGO', telemetryCode: 'MH-1 / HIST-02', story: 'A small piece of fabric from the Wright brothers’ aircraft traveled aboard Ingenuity. Protected beneath the solar panel, it connected the first powered flight on Earth to the first on another planet. This view focuses on its enclosure; the tiny fabric swatch is not resolved in NASA’s model.', cameraOffset: [1.5, 2, 2.4], lookAtOffset: [0.3, 1.2, 0.35] },
      { partId: 'ingenuity-solar', label: 'Solar Array & Nav Antenna', shortLabel: 'Solar & antenna', material: 'Solar cells · radio antenna', status: 'STATIONARY / PASSIVE ARCHIVE', telemetryCode: 'MH-1 / PWR-03', story: 'A small panel above the rotors charged six lithium-ion cells. The radio linked to Perseverance rather than directly to Earth. The slender assembly supplied the energy and communication that made autonomous flight possible.', cameraOffset: [2.3, 3.2, 3], lookAtOffset: [0, 2.5, 0] },
      { partId: 'ingenuity-legs', label: 'Carbon-Fiber Landing Legs', shortLabel: 'Landing legs', material: 'Carbon-fiber tubes · compliant feet', status: 'GROUNDED / UPRIGHT', telemetryCode: 'MH-1 / LG-04', story: 'Four light, springy legs absorbed touchdown loads on unfamiliar terrain. They now hold the helicopter above the sand. Their slight simulated lean communicates exposure, not a measured change in its stance.', cameraOffset: [-2.4, 1.1, 3], lookAtOffset: [0, 0.5, 0] },
    ],
  },
  {
    id: 'edl', name: 'Perseverance EDL debris field', shortName: 'The landing debris', mission: 'MARS 2020 · ENTRY / DESCENT / LANDING', planet: 'MARS', yearAbandoned: 2021,
    massKg: 575, massNote: 'Approximate parachute-and-backshell assembly mass; excludes the separate sky crane.',
    coordinates: { lat: 18.38, lng: 77.43, regionName: 'Jezero Crater' }, splineProgress: 0.85, altitudeKm: 0.001, position: [0, 0, -70],
    heroQuote: 'Everything it took to arrive. Everything that stayed.',
    scientificStory: 'A heat-resistant shell, a supersonic parachute, and a rocket-powered sky crane delivered Perseverance in February 2021. Ingenuity later photographed the discarded backshell and canopy, giving engineers a new view of a successful landing.',
    whyAbandoned: 'Each stage separated after its task. The sky crane flew away after lowering the rover, while the backshell and parachute fell separately. Their arrangement here is a compressed exhibit, not one contiguous impact site.',
    environmentalThreat: 'Wind shifts loose fabric and transports sand around debris. Abrasion and ultraviolet exposure act on exposed polymers. Impact damage was immediate; long-term burial is represented schematically.',
    archiveQuote: 'Dare mighty things.', quoteAttribution: 'MESSAGE ENCODED IN THE MARS 2020 PARACHUTE',
    sourceUrl: 'https://www.jpl.nasa.gov/news/nasas-mars-helicopter-spots-gear-that-helped-perseverance-rover-land/', sourceTitle: 'NASA JPL · Ingenuity surveys the EDL hardware',
    parts: [
      { partId: 'edl-shell', label: 'Shattered Thermal Aeroshell Backshell', shortLabel: 'Shattered backshell', material: 'Composite structure · thermal protection', status: 'IMPACTED / FRAGMENTED', telemetryCode: 'M2020 / BKS-01', story: 'The cone-shaped backshell protected the rover during cruise and entry. After separation it struck Mars at roughly 126 km/h. Ingenuity’s images show the main shell and fragments; thermal protection appeared to survive entry.', cameraOffset: [4, 3.2, 5], lookAtOffset: [0, 0.8, 0] },
      { partId: 'edl-canopy', label: '21.5m “Dare Mighty Things” Binary Parachute Canopy', shortLabel: 'Binary parachute', material: 'Nylon · polyester · aramid suspension lines', status: 'COLLAPSED / DUST EXPOSED', telemetryCode: 'M2020 / CHUT-02', story: 'The orange-and-white pattern encoded a message. At 21.5 meters across, the canopy slowed the spacecraft in thin air. It is scaled down in this exhibit so its relationship to the separated shell can be explored.', cameraOffset: [-4, 4, 5], lookAtOffset: [-3.2, 0.2, 0.3] },
      { partId: 'edl-bridles', label: 'Sky Crane Descent Stage Bridles', shortLabel: 'Sky crane bridles', material: 'High-strength tethers · separation fittings', status: 'SEVERED / FLYAWAY COMPLETE', telemetryCode: 'M2020 / SKY-03', story: 'Tethers lowered the rover beneath its descent stage. After touchdown, the connections were cut and the stage flew to a separate impact point. The nearby bridle assembly is a contextual reconstruction of that system.', cameraOffset: [4, 2.5, 4], lookAtOffset: [3.2, 0.9, -0.5] },
      { partId: 'edl-honeycomb', label: 'Crushable Impact Honeycomb', shortLabel: 'Impact honeycomb', material: 'Lightweight aluminum honeycomb core', status: 'CRUSHED / STRUCTURE EXPOSED', telemetryCode: 'M2020 / CORE-04', story: 'Sandwich structures gain stiffness from a light honeycomb core. Broken edges reveal their construction. This detail is an engineering interpretation of impact-damaged composite hardware rather than a sampled material from the site.', cameraOffset: [2.8, 1.5, 3], lookAtOffset: [1.6, 0.35, 1.4] },
    ],
  },
];

export const getRelics = (planet: CelestialBody) => relicsData.filter(r => r.planet === planet);
export const getRelic = (id: string | null) => relicsData.find(r => r.id === id);
export function formatCoordinate(value: number, latitude = true) {
  const normalized = latitude ? value : ((value + 180) % 360 + 360) % 360 - 180;
  return `${Math.abs(normalized).toFixed(4)}° ${latitude ? normalized >= 0 ? 'N' : 'S' : normalized >= 0 ? 'E' : 'W'}`;
}
