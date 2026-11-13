export type CelestialBody = 'MOON' | 'MARS';
export type Vec3 = [number, number, number];
export interface LearningQuestion {
  question: string;
  options: [string, string, string];
  answer: number;
  explanation: string;
}
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
  disposition?: 'retired' | 'discarded' | 'passive';
  learningQuestion?: LearningQuestion;
}

export const relicsData: Relic[] = [
  {
    id: 'eagle', name: 'Eagle descent stage', shortName: 'Eagle', mission: 'APOLLO 11', planet: 'MOON', yearAbandoned: 1969,
    massKg: 2034, massNote: 'Approximate descent-stage dry mass; excludes expended propellant.',
    coordinates: { lat: 0.6741, lng: 23.473, regionName: 'Mare Tranquillitatis' }, splineProgress: 0.42, altitudeKm: 0.001, position: [0, 0, 0],
    disposition: 'discarded',
    learningQuestion: { question: 'Why did Eagle’s lower stage stay on the Moon?', options: ['It became the launchpad for the ascent cabin.', 'The astronauts forgot to switch it on.', 'It needed wind to take off.'], answer: 0, explanation: 'A separate ascent engine lifted the cabin, crew, and samples. Carrying the finished descent hardware home would have required more fuel.' },
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
    coordinates: { lat: 26.1322, lng: 3.6339, regionName: 'Hadley–Apennine' }, splineProgress: 0.51, altitudeKm: 0.001, position: [0, 0, -28],
    disposition: 'retired',
    learningQuestion: { question: 'What did the rover’s wheels use instead of air-filled tires?', options: ['Solid glass', 'Woven metal mesh', 'Inflatable fabric'], answer: 1, explanation: 'Flexible wire mesh supported the rover on the soil. There was no tire air to leak into the lunar vacuum.' },
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
    coordinates: { lat: -3.0162, lng: -23.4216, regionName: 'Oceanus Procellarum' }, splineProgress: 0.60, altitudeKm: 0.001, position: [0, 0, -56],
    disposition: 'retired',
    learningQuestion: { question: 'What made Surveyor 3 an unusual materials experiment?', options: ['It flew back to Earth by itself.', 'It was completely buried before landing.', 'Apollo 12 returned some of its exposed parts.'], answer: 2, explanation: 'Astronauts recovered the camera, scoop, and other samples after more than two years on the Moon. Researchers could study their actual exposure on Earth.' },
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
    coordinates: { lat: -2.0465, lng: 354.7384, regionName: 'Perseverance Valley' }, splineProgress: 0.42, altitudeKm: 0.001, position: [0, 0, 0],
    disposition: 'retired',
    learningQuestion: { question: 'Why was a huge dust storm dangerous to Opportunity?', options: ['Dust blocked the sunlight needed for power.', 'Rain flooded its engine.', 'The storm removed all gravity.'], answer: 0, explanation: 'Opportunity used solar panels. The 2018 storm darkened the sky and interrupted its energy supply; its last contact was in June 2018.' },
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
    coordinates: { lat: 18.4991, lng: 77.3156, regionName: 'Valinor Hills · Jezero Crater' }, splineProgress: 0.51, altitudeKm: 0.001, position: [0, 0, -28],
    disposition: 'retired',
    learningQuestion: { question: 'What ended Ingenuity’s flying mission?', options: ['Its planned fifth flight', 'Damage to its rotor blades after Flight 72', 'A return flight to Earth'], answer: 1, explanation: 'Ingenuity flew 72 times. Its damaged blades could no longer support flight after the January 2024 landing, although the helicopter remained upright.' },
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
    coordinates: { lat: 18.38, lng: 77.43, regionName: 'Jezero Crater' }, splineProgress: 0.60, altitudeKm: 0.001, position: [0, 0, -56],
    disposition: 'discarded',
    learningQuestion: { question: 'Why did Perseverance leave landing hardware behind?', options: ['The rover needed a place to park.', 'All the parts had failed before landing.', 'Different stages separated after completing their jobs.'], answer: 2, explanation: 'The parachute, backshell, and rocket-powered descent stage served different parts of the landing. Discarding them let the rover reach the ground safely.' },
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
  {
    id: 'alsep', name: 'Apollo 12 science station', shortName: 'ALSEP', mission: 'APOLLO 12 · LUNAR SCIENCE', planet: 'MOON', yearAbandoned: 1977,
    massKg: 113.4, massNote: 'Approximate complete Apollo 12 ALSEP package mass (250 lb); the model shows selected assemblies.',
    coordinates: { lat: -3.0098, lng: -23.4249, regionName: 'Oceanus Procellarum' }, splineProgress: 0.69, altitudeKm: 0.001, position: [0, 0, -84],
    disposition: 'retired',
    heroQuote: 'The astronauts left. The listening continued.',
    scientificStory: 'In November 1969, Conrad and Bean set up a small scientific station. Its instruments measured moonquakes, particles, and the lunar environment long after the crew went home. Apollo 12’s station kept sending data until ground controllers switched it off in September 1977.',
    whyAbandoned: 'The station was deliberately left to work without astronauts. Its observing program eventually ended; it had no means of returning to Earth.',
    environmentalThreat: 'Lunar temperature cycles and micrometeorite impacts expose the cables, insulation, and instruments to long-term wear. The exhibit’s aging is illustrative.',
    archiveQuote: 'ALSEP: Scientific Station on the Moon', quoteAttribution: 'NASA · APOLLO EXPEDITIONS TO THE MOON',
    sourceUrl: 'https://www.nasa.gov/wp-content/uploads/static/history/SP-350/ch-12-7.html', sourceTitle: 'NASA · ALSEP scientific station',
    learningQuestion: { question: 'How did ALSEP keep working through the long lunar night?', options: ['Wind turned a turbine.', 'A radioisotope generator supplied electricity.', 'Astronauts changed its batteries daily.'], answer: 1, explanation: 'Its generator converted heat from radioactive decay into electricity, so the station did not depend on sunlight.' },
    parts: [
      { partId: 'alsep-station', label: 'Central Station', shortLabel: 'Central station', material: 'Metal structure · thermal insulation', status: 'COMMANDED OFF / SEP 1977', telemetryCode: 'A12 / HUB-01', story: 'The central station gathered instrument readings and sent them to Earth. Cables made the separate instruments into one remote laboratory.', cameraOffset: [3, 2.2, 4], lookAtOffset: [0, 0.55, 0] },
      { partId: 'alsep-rtg', label: 'SNAP-27 Power Generator', shortLabel: 'Power generator', material: 'Finned metal radiator · thermoelectric elements', status: 'RETIRED / IN SITU', telemetryCode: 'A12 / PWR-02', story: 'A radioactive heat source powered thermoelectric elements. Cooling fins released unused heat. This was a heat-to-electricity generator, not a small nuclear reactor.', cameraOffset: [-3, 1.7, 3], lookAtOffset: [-2.45, 0.76, -0.5] },
      { partId: 'alsep-seismometer', label: 'Passive Seismic Experiment', shortLabel: 'Moonquake sensor', material: 'Seismometer · reflective thermal cover', status: 'RECORDING ENDED', telemetryCode: 'A12 / PSE-03', story: 'Sensitive instruments registered ground motion from moonquakes and impacts. Those signals helped scientists investigate layers hidden beneath the surface.', cameraOffset: [3, 1.5, 3.6], lookAtOffset: [2.25, 0.3, 1.45] },
      { partId: 'alsep-antenna', label: 'Earth-Pointing Antenna', shortLabel: 'Antenna', material: 'Metal mast · radio antenna', status: 'TRANSMISSION ENDED', telemetryCode: 'A12 / COM-04', story: 'The astronauts aligned the antenna toward Earth. The carrying bar used to transport the equipment became its mast: one piece performed two jobs.', cameraOffset: [2, 3, 3], lookAtOffset: [0.25, 2.4, -0.22] },
    ],
  },
  {
    id: 'met', name: 'Modular Equipment Transporter', shortName: 'Moon cart', mission: 'APOLLO 14 · SURFACE MOBILITY', planet: 'MOON', yearAbandoned: 1971,
    massKg: 13.6, massNote: 'Approximate unloaded cart mass (30 lb), excluding tools, cameras, and samples.',
    coordinates: { lat: -3.6459, lng: -17.4719, regionName: 'Fra Mauro · mission-site marker' }, splineProgress: 0.78, altitudeKm: 0.001, position: [0, 0, -112],
    disposition: 'retired',
    heroQuote: 'Before the Moon had a car, it had a handcart.',
    scientificStory: 'Shepard and Mitchell pulled this two-wheeled cart across Fra Mauro in 1971. It carried tools, cameras, and samples, freeing their hands for exploration. The humble transporter helped turn a moonwalk into a moving geology workshop.',
    whyAbandoned: 'The cart was surface equipment, not return cargo. The crew brought their samples home and left the transporter. Apollo 14 was the only mission to use it.',
    environmentalThreat: 'Sunlight and extreme temperature changes act on its synthetic rubber tires. Dust and small impacts affect exposed surfaces; no modern close-up condition survey is implied.',
    archiveQuote: 'Modularized Equipment Transporter', quoteAttribution: 'NASA · LUNAR SURFACE EQUIPMENT HISTORY',
    sourceUrl: 'https://ntrs.nasa.gov/citations/20040200983', sourceTitle: 'NASA NTRS · Lunar surface equipment',
    learningQuestion: { question: 'What powered the Apollo 14 equipment cart?', options: ['An astronaut pulling its handle', 'A gasoline engine', 'A rocket motor'], answer: 0, explanation: 'The cart had no drive motor. Its two wheels helped the astronauts carry their equipment during the walking traverses.' },
    parts: [
      { partId: 'met-wheels', label: 'Pneumatic Wheels', shortLabel: 'Rubber tires', material: 'Synthetic rubber tires · metal wheels', status: 'PARKED / EXPOSED', telemetryCode: 'A14 / MOB-01', story: 'Unlike the later rover’s wire wheels, the cart used two air-filled tires made with rubber selected for low temperatures.', cameraOffset: [2.8, 1.1, 3], lookAtOffset: [0, 0.52, 0.1] },
      { partId: 'met-tray', label: 'Equipment Frame & Tray', shortLabel: 'Equipment tray', material: 'Tubular aluminum frame · equipment supports', status: 'IN SITU', telemetryCode: 'A14 / LOAD-02', story: 'The foldable frame carried equipment and could serve as a workbench. Its storage spaces kept a small field laboratory organized.', cameraOffset: [2.2, 2.8, 3], lookAtOffset: [0, 1.03, 0] },
      { partId: 'met-handle', label: 'Astronaut Pull Handle', shortLabel: 'Pull handle', material: 'Metal tubing · triangular grip', status: 'UNATTENDED', telemetryCode: 'A14 / GRIP-03', story: 'A triangular handle helped a suited astronaut pull without continuously squeezing a grip. Working against pressurized gloves was tiring.', cameraOffset: [-2, 2, 3], lookAtOffset: [0, 1.43, 2.5] },
      { partId: 'met-tools', label: 'Geology Tool Stowage', shortLabel: 'Tool stowage', material: 'Tool holders · sample-container supports', status: 'INTERPRETIVE MISSION LOAD', telemetryCode: 'A14 / GEO-04', story: 'Holders organized sampling and photographic equipment. The displayed tools illustrate a working load; they are not a verified inventory of everything left in the cart.', cameraOffset: [2, 2.2, 2.8], lookAtOffset: [0.3, 1.6, -0.5] },
    ],
  },
  {
    id: 'camera', name: 'Apollo 11 lunar television camera', shortName: 'First-step camera', mission: 'APOLLO 11 · LIVE FROM THE MOON', planet: 'MOON', yearAbandoned: 1969,
    massKg: 3.29, massNote: 'Approximate camera mass (7.25 lb); excludes its tripod and cable.',
    coordinates: { lat: 0.6742, lng: 23.4731, regionName: 'Tranquility Base · mission-site marker' }, splineProgress: 0.87, altitudeKm: 0.001, position: [0, 0, -140],
    disposition: 'retired',
    heroQuote: 'A small lens made the whole world a witness.',
    scientificStory: 'This black-and-white television camera showed Armstrong stepping onto the Moon. He later placed it on a tripod away from Eagle to cover the astronauts’ work. A device left on another world helped people everywhere share one moment.',
    whyAbandoned: 'Its job was to send the moonwalk home as a radio signal. The camera did not need to return with the astronauts and their samples.',
    environmentalThreat: 'Dust, sunlight, temperature changes, and tiny impacts can affect optics and insulation. The model reconstructs mission equipment, not a newly photographed condition.',
    archiveQuote: 'The camera did its job.', quoteAttribution: 'NASA · APOLLO 11 TELEMETRY DATA RECORDINGS REPORT',
    sourceUrl: 'https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.summary.html', sourceTitle: 'NASA · Apollo 11 Lunar Surface Journal',
    learningQuestion: { question: 'How did the TV camera send the moonwalk to Earth?', options: ['Astronauts mailed its film.', 'It stored the only copy inside the tripod.', 'Its video signal traveled through the lunar module’s communications system.'], answer: 2, explanation: 'The camera used a cable to Eagle. The spacecraft’s radio link carried the television signal to receiving stations on Earth.' },
    parts: [
      { partId: 'camera-body', label: 'Black-and-White Camera Body', shortLabel: 'Camera body', material: 'Metal housing · television electronics', status: 'TRANSMISSION ENDED', telemetryCode: 'A11 / TV-01', story: 'The compact camera transmitted a slow-scan picture: 320 lines, ten times a second. Earth stations converted it for television audiences.', cameraOffset: [2.2, 2.5, 3], lookAtOffset: [0, 1.65, 0] },
      { partId: 'camera-lens', label: 'Lunar Television Lens', shortLabel: 'Lens', material: 'Optical glass · bayonet mount', status: 'EXPOSED / UNPOWERED', telemetryCode: 'A11 / OPT-02', story: 'Interchangeable lenses allowed different views of the surface. The mount was designed so an astronaut could handle it while wearing gloves.', cameraOffset: [1.6, 2, 2.5], lookAtOffset: [0, 1.65, 0.8] },
      { partId: 'camera-tripod', label: 'Surface Tripod', shortLabel: 'Tripod', material: 'Metal support legs', status: 'DEPLOYED / IN SITU', telemetryCode: 'A11 / MNT-03', story: 'After the first steps, Armstrong moved the camera onto a tripod. Three legs held a steady view while both astronauts worked.', cameraOffset: [-2.4, 1.5, 3], lookAtOffset: [0, 0.65, 0] },
      { partId: 'camera-cable', label: 'Power & Video Cable', shortLabel: 'Video cable', material: 'Electrical conductors · insulation', status: 'LINK INACTIVE', telemetryCode: 'A11 / LINK-04', story: 'A cable joined the camera to the lunar module for electricity and video. Its curved layout here is illustrative, not a surveyed cable route.', cameraOffset: [3, 1.4, 3], lookAtOffset: [2.4, 0.1, -0.3] },
    ],
  },
  {
    id: 'spirit', name: 'Spirit rover', shortName: 'Spirit', mission: 'MARS EXPLORATION ROVER · A', planet: 'MARS', yearAbandoned: 2010,
    massKg: 185, massNote: 'Approximate rover mass; last contact in 2010, recovery attempts ended in 2011.',
    coordinates: { lat: -14.6, lng: 175.5, regionName: 'Gusev Crater · approximate site' }, splineProgress: 0.69, altitudeKm: 0.001, position: [0, 0, -84],
    disposition: 'retired',
    heroQuote: 'Even a broken wheel could uncover a discovery.',
    scientificStory: 'Spirit explored Gusev Crater for more than six years. A dragging wheel exposed silica-rich soil, a clue to past water. Later, trapped in soft ground near Home Plate, the rover could not reach a favorable winter tilt. Its final signal arrived in March 2010.',
    whyAbandoned: 'Efforts to free Spirit and restore contact did not succeed. NASA ended recovery attempts in May 2011. The rover was built to explore Mars, with no return vehicle.',
    environmentalThreat: 'Dust and winter darkness limited solar power. Wind sometimes cleaned the panels. The model’s dust layer is an illustration; its exact condition today is unknown.',
    archiveQuote: 'Clues of Past Water', quoteAttribution: 'NASA SCIENCE · SPIRIT MISSION OBJECTIVE',
    sourceUrl: 'https://science.nasa.gov/mission/mer-spirit/', sourceTitle: 'NASA Science · Spirit mission history',
    learningQuestion: { question: 'How did Spirit’s broken wheel help science?', options: ['It grew a replacement wheel.', 'It scraped away soil and exposed silica-rich material.', 'It sent samples directly to Earth.'], answer: 1, explanation: 'The dragging wheel uncovered material that helped scientists investigate ancient water-related environments. An engineering problem unexpectedly revealed a clue.' },
    parts: [
      { partId: 'spirit-solar', label: 'Solar-Power Wings', shortLabel: 'Solar wings', material: 'Solar cells · supporting panels', status: 'SILENT / WINTER EXPOSURE', telemetryCode: 'MER-A / PWR-01', story: 'Solar panels supplied electricity. Their angle toward the winter Sun mattered, especially once the rover could no longer drive out of soft soil.', cameraOffset: [3.5, 3.4, 4], lookAtOffset: [0, 1.25, 0] },
      { partId: 'spirit-pancam', label: 'Panoramic Camera Mast', shortLabel: 'Pancam mast', material: 'Stereo optics · metal mast', status: 'LAST CONTACT / MAR 2010', telemetryCode: 'MER-A / CAM-02', story: 'Two panoramic cameras examined the landscape in color and stereo. Their views helped scientists choose where to drive and which rocks to study.', cameraOffset: [2.4, 3.2, 3], lookAtOffset: [0, 2.4, -0.5] },
      { partId: 'spirit-arm', label: 'Robotic Geology Arm', shortLabel: 'Geology arm', material: 'Metal joints · science instrument turret', status: 'SCIENCE ENDED', telemetryCode: 'MER-A / IDD-03', story: 'The arm positioned instruments against rocks and soil. The NASA reference model shows a stowed engineering pose, not Spirit’s measured final pose.', cameraOffset: [-3, 1.6, 3], lookAtOffset: [-0.6, 0.8, 1.6] },
      { partId: 'spirit-antenna', label: 'High-Gain Antenna', shortLabel: 'Radio antenna', material: 'Directional antenna · gimbal', status: 'EARTH LINK SILENT', telemetryCode: 'MER-A / COM-04', story: 'The steerable antenna supported direct Earth communication. Spirit also used Mars orbiters as relays during its mission.', cameraOffset: [3, 2.8, 3], lookAtOffset: [0.9, 1.7, 0.3] },
    ],
  },
  {
    id: 'sojourner', name: 'Sojourner microrover', shortName: 'Sojourner', mission: 'MARS PATHFINDER · 1997', planet: 'MARS', yearAbandoned: 1997,
    massKg: 10.6, massNote: 'Approximate rover mass; excludes the Pathfinder lander and landing system.',
    coordinates: { lat: 19.1, lng: -33.2, regionName: 'Ares Vallis · approximate site' }, splineProgress: 0.78, altitudeKm: 0.001, position: [0, 0, -112],
    disposition: 'retired',
    heroQuote: 'A little rover opened a very long road.',
    scientificStory: 'In 1997, the microwave-oven-sized Sojourner became the first rover to explore Mars. It approached rocks, photographed them, and measured their chemistry. A technology demonstration helped establish the foundations for the larger rovers that followed.',
    whyAbandoned: 'Sojourner talked to Earth through the Pathfinder lander. When that link was lost in September 1997, communication with the rover stopped too. Neither machine could return home.',
    environmentalThreat: 'Blowing dust, thermal cycling, and solar exposure act on the small rover. Its displayed final location and dust cover are approximate interpretations.',
    archiveQuote: 'Mars Pathfinder & Sojourner Rover', quoteAttribution: 'NASA SCIENCE · MISSION ARCHIVE',
    sourceUrl: 'https://science.nasa.gov/mission/mars-pathfinder/', sourceTitle: 'NASA Science · Mars Pathfinder and Sojourner',
    learningQuestion: { question: 'Why did losing the Pathfinder lander’s link also silence Sojourner?', options: ['The rover used the lander to relay its messages.', 'The rover had no science instruments.', 'They shared the same wheels.'], answer: 0, explanation: 'Sojourner’s radio communicated locally with Pathfinder. The lander supplied the connection to operators on Earth.' },
    parts: [
      { partId: 'sojourner-wheels', label: 'Six-Wheel Rocker-Bogie Suspension', shortLabel: 'Six-wheel suspension', material: 'Aluminum wheels · metal cleats', status: 'PARKED / UNPOWERED', telemetryCode: 'MPF / MOB-01', story: 'The suspension spread the rover’s load across six wheels and helped it climb uneven ground. The front and rear wheels could steer.', cameraOffset: [2.6, 1, 3], lookAtOffset: [0, 0.4, 0] },
      { partId: 'sojourner-solar', label: 'Top-Mounted Solar Array', shortLabel: 'Solar deck', material: 'Solar cells · structural panel', status: 'NO COMMUNICATION', telemetryCode: 'MPF / PWR-02', story: 'A flat solar array supplied daytime electricity. Non-rechargeable batteries supplemented its early operations.', cameraOffset: [2, 2.6, 3], lookAtOffset: [0, 0.95, 0] },
      { partId: 'sojourner-camera', label: 'Front Navigation Cameras', shortLabel: 'Navigation cameras', material: 'Camera optics · electronics housings', status: 'IMAGING ENDED', telemetryCode: 'MPF / NAV-03', story: 'A pair of front cameras viewed obstacles in stereo. A rear camera recorded the areas examined by its chemistry instrument.', cameraOffset: [1.7, 1.5, 2.5], lookAtOffset: [0, 0.73, 1] },
      { partId: 'sojourner-apxs', label: 'Alpha Proton X-Ray Spectrometer', shortLabel: 'Rock chemistry sensor', material: 'Spectrometer head · deployment mechanism', status: 'SCIENCE ENDED', telemetryCode: 'MPF / APXS-04', story: 'This rear-mounted instrument was placed against rocks and soil to investigate which elements they contained. Close contact made the tiny rover a useful field scientist.', cameraOffset: [-2, 1.3, -2.5], lookAtOffset: [0, 0.4, -1.3] },
    ],
  },
  {
    id: 'insight', name: 'InSight geophysical lander', shortName: 'InSight', mission: 'INSIGHT · INTERIOR OF MARS', planet: 'MARS', yearAbandoned: 2022,
    massKg: 358, massNote: 'Approximate lander mass; excludes cruise stage, aeroshell, and launch propellant.',
    coordinates: { lat: 4.5, lng: 135.9, regionName: 'Elysium Planitia · approximate site' }, splineProgress: 0.87, altitudeKm: 0.001, position: [0, 0, -140],
    disposition: 'retired',
    heroQuote: 'It never drove a meter. It explored a planet’s heart.',
    scientificStory: 'InSight listened for vibrations instead of driving across Mars. Its sensitive seismometer detected 1,319 marsquakes, helping scientists study the crust, mantle, and core. Dust gradually reduced its solar power, and NASA ended the mission in December 2022.',
    whyAbandoned: 'The lander could no longer generate enough power for operations. Its instruments and platform remain on the surface, while the recorded data continues to support research.',
    environmentalThreat: 'Dust accumulation was observed during the mission. Wind can move that dust afterward; future coverage and material wear in this exhibit are illustrative.',
    archiveQuote: 'Study Mars’ interior structure', quoteAttribution: 'NASA SCIENCE · INSIGHT MISSION OBJECTIVE',
    sourceUrl: 'https://science.nasa.gov/mission/insight/', sourceTitle: 'NASA Science · InSight lander',
    learningQuestion: { question: 'How could a stationary lander explore deep inside Mars?', options: ['It drilled all the way to the core.', 'Its cameras saw through rock.', 'It measured seismic waves traveling through the planet.'], answer: 2, explanation: 'Marsquakes send vibrations through the interior. Their timing and behavior reveal clues about layers that a camera cannot see.' },
    parts: [
      { partId: 'insight-solar', label: 'Circular Solar Arrays', shortLabel: 'Solar fans', material: 'Photovoltaic cells · folding supports', status: 'DUST LIMITED / RETIRED', telemetryCode: 'INS / PWR-01', story: 'Two round arrays unfolded after landing. Dust reduced the sunlight reaching their cells, gradually shrinking the energy available to the instruments.', cameraOffset: [4, 3.1, 4], lookAtOffset: [0, 1.1, 0] },
      { partId: 'insight-seis', label: 'SEIS & Wind and Thermal Shield', shortLabel: 'Marsquake sensor', material: 'Seismometer · protective dome', status: 'ON SURFACE / SCIENCE ENDED', telemetryCode: 'INS / SEIS-02', story: 'The French-led SEIS instrument sat on the ground beneath a protective cover. Shielding it from wind and temperature swings helped it detect extremely small ground motions.', cameraOffset: [-3, 1.5, 3.5], lookAtOffset: [0, 0.4, 2.7] },
      { partId: 'insight-arm', label: 'Instrument Deployment Arm', shortLabel: 'Deployment arm', material: 'Metal arm · joints · grapple', status: 'DEPLOYMENT COMPLETE', telemetryCode: 'INS / ARM-03', story: 'The robotic arm placed the seismometer and its shield on the ground. It gave a stationary lander a way to arrange its scientific workspace.', cameraOffset: [2.5, 2.5, 3.4], lookAtOffset: [-0.7, 1.8, -0.5] },
      { partId: 'insight-antenna', label: 'Radio Science Antennas', shortLabel: 'Radio antennas', material: 'Radio antennas · electronics', status: 'LINK SILENT', telemetryCode: 'INS / RISE-04', story: 'Precise radio tracking helped measure tiny variations in Mars’ rotation. That motion supplied another clue to the planet’s interior.', cameraOffset: [2, 2.3, 3], lookAtOffset: [0.6, 1.65, -0.4] },
    ],
  },
];

export const getRelics = (planet: CelestialBody) => relicsData.filter(r => r.planet === planet);
export const getRelic = (id: string | null) => relicsData.find(r => r.id === id);
export function formatCoordinate(value: number, latitude = true) {
  const normalized = latitude ? value : ((value + 180) % 360 + 360) % 360 - 180;
  return `${Math.abs(normalized).toFixed(4)}° ${latitude ? normalized >= 0 ? 'N' : 'S' : normalized >= 0 ? 'E' : 'W'}`;
}
