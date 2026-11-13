export interface MissionFact { label:string; value:string; detail:string; sourceId:string; }
export interface MissionEvent { date:string; title:string; detail:string; sourceId:string; }
export interface MissionEvidence { facts:MissionFact[]; timeline:MissionEvent[]; takeaway:string; }

const fact=(label:string,value:string,detail:string,sourceId:string):MissionFact=>({label,value,detail,sourceId});
const event=(date:string,title:string,detail:string,sourceId:string):MissionEvent=>({date,title,detail,sourceId});

// Historical measurements belong to the complete mission or the named subsystem,
// as stated in each detail; they are not measurements of today's 3D reconstructions.
export const missionEvidence:Record<string,MissionEvidence>={
  eagle:{
    facts:[
      fact('Surface crew','2 astronauts','Neil Armstrong and Buzz Aldrin landed; Michael Collins remained in lunar orbit.','apollo11-overview'),
      fact('Landing system','2 stages','The lower stage handled descent; the upper stage returned the crew to orbit.','apollo11-overview'),
      fact('Destination','Sea of Tranquility','The first crewed lunar landing reached Mare Tranquillitatis.','apollo11-overview'),
    ],
    timeline:[
      event('16 JUL 1969','Leaving Earth','Apollo 11 launched on a Saturn V.','apollo11-overview'),
      event('20 JUL 1969','Eagle lands','Armstrong and Aldrin reached the lunar surface.','apollo11-overview'),
      event('21 JUL 1969','The return begins','The ascent cabin lifted off, leaving the descent stage as its launch platform.','apollo11-overview'),
    ],
    takeaway:'A spacecraft can finish its role in flight and still preserve the engineering decisions that made a return possible.',
  },
  lrv:{
    facts:[
      fact('Surface travel','17.5 miles','NASA’s Apollo 15 summary reports roughly 28 kilometers of rover travel.','apollo15-history'),
      fact('Surface excursions','3 moonwalks','Scott and Irwin explored on July 31, August 1, and August 2.','apollo15-history'),
      fact('Exploration time','18 h 37 min','Combined Apollo 15 moonwalk time; this is not continuous driving time.','apollo15-history'),
    ],
    timeline:[
      event('30 JUL 1971','Landing at Hadley','Falcon landed near Hadley Rille and the Apennine mountains.','apollo15-history'),
      event('31 JUL–02 AUG 1971','A wider field of science','Three excursions extended sampling and geological observations.','apollo15-history'),
      event('02 AUG 1971','A final view of liftoff','The parked rover’s TV camera relayed Falcon’s departure to Earth.','apollo15-history'),
    ],
    takeaway:'Mobility changed what astronauts could investigate. The vehicle that stayed behind helped carry a richer scientific record home.',
  },
  surveyor:{
    facts:[
      fact('Images transmitted','6,326','Television pictures documented the landing area and soil experiments.','surveyor'),
      fact('Sampler reach','1.5 meters','The sampling mechanism could reach away from the lander.','surveyor'),
      fact('Digging capability','18 centimeters','The instrument was designed to dig beneath the visible surface.','surveyor'),
    ],
    timeline:[
      event('20 APR 1967','A bumpy arrival','Surveyor 3 settled in Oceanus Procellarum after bouncing twice.','surveyor'),
      event('04 MAY 1967','The link falls silent','NASA records the lander’s last contact after lunar night began.','surveyor'),
      event('NOV 1969','A human return visit','Apollo 12 astronauts recovered hardware, including the camera, for exposure studies.','surveyor'),
    ],
    takeaway:'Surveyor connected robotic reconnaissance to human exploration. Returned parts became evidence of how lunar exposure affects hardware.',
  },
  alsep:{
    facts:[
      fact('Power supply','≈70 watts','A SNAP-27 radioisotope generator powered the station and connected instruments.','alsep-system'),
      fact('Design lifetime','365 days','The planned lifetime of Apollo 12’s ALSEP array.','apollo-stations'),
      fact('Earth downlink','2,278.5 MHz','The Apollo 12 central station transmitted its scientific data at this frequency.','apollo-stations'),
    ],
    timeline:[
      event('19 NOV 1969','Science switches on','The central station began operations at 14:21 GMT.','apollo-stations'),
      event('14 JUN 1974','One instrument retires','The lunar surface magnetometer was commanded off.','apollo-stations'),
      event('30 SEP 1977','The station shuts down','The array’s operating history extended far beyond its one-year design.','apollo-stations'),
    ],
    takeaway:'Equipment left on the Moon was not always discarded immediately. ALSEP continued making measurements long after its crew returned home.',
  },
  met:{
    facts:[
      fact('Transport method','Hand-pulled cart','Apollo 14’s MET carried surface tools and samples on two wheels.','apollo-cart'),
      fact('Crew excursions','2 moonwalks','Shepard and Mitchell used their surface time to investigate the Fra Mauro region.','apollo14-history'),
      fact('Surface work','9 h 24 min','Combined Apollo 14 moonwalk duration, not the cart’s driving time.','apollo14-history'),
    ],
    timeline:[
      event('31 JAN 1971','A mission begins','Apollo 14 launched with the equipment for two lunar excursions.','apollo14-history'),
      event('05 FEB 1971','Working at Fra Mauro','The crew began exploring the landing region.','apollo14-history'),
      event('06 FEB 1971','Toward Cone crater','The second excursion investigated higher terrain before the crew returned to Antares.','apollo14-history'),
    ],
    takeaway:'A small cart illustrates a large problem in exploration: how to move scientific equipment while keeping an astronaut’s hands and energy available.',
  },
  camera:{
    facts:[
      fact('Normal scan rate','10 frames / second','The lunar TV camera used a slow-scan black-and-white format.','apollo11-press'),
      fact('Normal image format','320 lines / frame','The lunar signal differed from the broadcast television format on Earth.','apollo11-press'),
      fact('Electrical demand','6.5 watts','The press kit specifies the lunar camera’s power requirement.','apollo11-press'),
    ],
    timeline:[
      event('JUL 1969','Packed for the first step','The camera rode in the descent stage’s equipment stowage assembly.','apollo11-press'),
      event('20–21 JUL 1969','The moonwalk is televised','The camera brought surface activity to Earth across the UTC date boundary.','apollo-tv'),
      event('21 JUL 1969','The crew departs','Eagle’s ascent cabin left the television equipment on the surface.','apollo11-overview'),
    ],
    takeaway:'The engineering tradeoff was bandwidth: a modest camera made an extraordinary shared human experience possible.',
  },
  opportunity:{
    facts:[
      fact('Primary design','90 sols','A sol is a Martian day. The original mission plan covered about three Earth months.','opportunity-history'),
      fact('Distance traveled','45.16 kilometers','The rover’s final traverse total; its landing site and resting place are different locations.','opportunity-history'),
      fact('Operating career','Almost 15 years','The solar-powered rover greatly exceeded its planned lifetime.','opportunity-history'),
    ],
    timeline:[
      event('JAN 2004','Landing in Eagle crater','Opportunity began exploring Meridiani Planum.','opportunity-history'),
      event('10 JUN 2018','Last communication','A planet-wide dust storm cut the sunlight available to the rover.','opportunity-history'),
      event('13 FEB 2019','Recovery campaign closes','NASA formally declared the mission complete after attempts to reestablish contact.','opportunity-history'),
    ],
    takeaway:'The distinction between last contact and formal mission end matters: the team kept trying after the rover fell silent.',
  },
  ingenuity:{
    facts:[
      fact('Flights completed','72','The original technology demonstration planned no more than five flights.','ingenuity'),
      fact('Vehicle mass','1.8 kilograms','A lightweight aircraft designed for an exceptionally thin atmosphere.','ingenuity'),
      fact('Rotor span','≈1.2 meters','Tip-to-tip rotor length reported by NASA.','ingenuity'),
    ],
    timeline:[
      event('19 APR 2021','First powered flight','Ingenuity demonstrated controlled flight on another planet.','ingenuity'),
      event('18 JAN 2024','Flight 72','The helicopter made its final flight.','ingenuity'),
      event('25 JAN 2024','Flight mission concludes','NASA announced the end of flight operations.','ingenuity'),
    ],
    takeaway:'A technology demonstration became a scouting partner, showing how a small experiment can change future exploration.',
  },
  edl:{
    facts:[
      fact('Parachute diameter','21.5 meters','Full deployed canopy diameter; only part of the collapsed parachute was visible in the images.','edl'),
      fact('Suspension lines','80','High-strength lines connected the parachute to the backshell.','edl'),
      fact('Aerial survey','10 color images','Ingenuity recorded the backshell and parachute during Flight 26.','edl'),
    ],
    timeline:[
      event('18 FEB 2021','Landing hardware separates','Perseverance’s entry system completed its job during descent.','edl'),
      event('19 APR 2022','Flight 26 revisits the scene','Ingenuity photographed the backshell, parachute, and nearby debris.','edl'),
      event('27 APR 2022','NASA publishes the survey','Engineers described the images as evidence that could improve future landing systems.','edl'),
    ],
    takeaway:'Discarded hardware can become a test result. Damage and surviving structures help engineers compare a real landing with their expectations.',
  },
  spirit:{
    facts:[
      fact('Distance traveled','≈7.73 kilometers','Spirit investigated the plains and hills around Gusev crater.','spirit-history'),
      fact('Operating career','More than 6 years','The rover operated over 25 times longer than its intended lifetime.','spirit-history'),
      fact('Science clue','Silica-rich soil','A patch exposed by a dragging wheel pointed to ancient hot springs or steam vents.','spirit-history'),
    ],
    timeline:[
      event('JAN 2004','Exploring Gusev crater','Spirit began its surface mission.','spirit-history'),
      event('01 MAY 2009','Soft soil stops the rover','Loss of traction eventually led to plans for a stationary science mission.','spirit-history'),
      event('22 MAR 2010','Last contact','NASA later ended recovery efforts on May 25, 2011.','spirit-history'),
    ],
    takeaway:'Even a failed wheel contributed to discovery: the disturbed soil exposed a clue about a wetter Martian past.',
  },
  sojourner:{
    facts:[
      fact('Rover mass','10.6 kilograms','The small rover was delivered by the Pathfinder lander.','pathfinder'),
      fact('Mission architecture','Lander + rover','The two vehicles provided scientific observations and engineering data.','pathfinder'),
      fact('Science targets','Rocks, soil, weather','The complete Pathfinder mission studied geology, rock chemistry, atmosphere, and climate.','pathfinder'),
    ],
    timeline:[
      event('04 DEC 1996','Pathfinder launches','A technology demonstration set out to deliver a rover to Mars.','pathfinder'),
      event('04 JUL 1997','Landing in Ares Vallis','The mission delivered Sojourner to the Martian surface.','pathfinder'),
      event('27 SEP 1997','The mission ends','NASA records the conclusion of Pathfinder’s surface operations.','pathfinder'),
    ],
    takeaway:'A modest rover established a new way to explore: investigate multiple nearby rocks rather than observe from one stationary platform.',
  },
  insight:{
    facts:[
      fact('Detected marsquakes','1,319','The mission’s seismic record included vibrations from meteoroid impacts.','insight-retirement'),
      fact('Deployment arm','≈1.8 meters','The arm placed instruments from the deck onto the surface.','insight'),
      fact('Science destination','Inside Mars','Seismic and radio measurements investigated the structure beneath the landing site.','insight'),
    ],
    timeline:[
      event('26 NOV 2018','Landing at Elysium','InSight reached Elysium Planitia.','insight'),
      event('15 DEC 2022','Final communication','Dust accumulation had reduced the available solar energy.','insight-retirement'),
      event('21 DEC 2022','NASA retires the mission','Two consecutive missed communications supported the end-of-mission decision.','insight-retirement'),
    ],
    takeaway:'A stationary spacecraft explored a hidden world. Its archived measurements keep informing research after its power supply is exhausted.',
  },
};
