import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const id = () => crypto.randomUUID().replace(/-/g, '').slice(0, 25);

const locations = [
  { key: "open-water", name: "Open water", blurb: "Ocean, lake, or pool. No walls, no footing, no weapons unless they float.", modifiers: ["low-stamina trait → -3 (can't tread water long)", "any melee weapon -2 (lost or soaked)", "can't-swim trait -5"], environmentalAmmo: ["A kayak oar", "An inflatable swan", "A jellyfish drifting through"] },
  { key: "antarctic-tundra", name: "Antarctic tundra", blurb: "Featureless frozen plain. No traction, no shelter, no dignity once someone slips.", modifiers: ["any charge or tackle -3 accuracy (slip risk)", "long fight -2/round (cold attrition)", "fast-mover trait ignores first slip"], environmentalAmmo: ["A jagged chunk of ice", "A fallen penguin", "A blinding snow flurry"] },
  { key: "golf-course", name: "Golf course", blurb: "Manicured fairways, pro shop, cart path. Every implement on the property is a weapon.", modifiers: ["best-golfer trait +3", "any club counts as a free equipped melee weapon", "golf-cart chase is a legal move"], environmentalAmmo: ["A golf ball (ranged)", "A sand wedge", "A stolen golf cart"] },
  { key: "costco-parking-lot", name: "Costco parking lot", blurb: "Fluorescent concrete flatland. Carts, TVs in boxes, rotisserie chicken visible through the doors, security guard 90 seconds out.", modifiers: ["tool-handler trait +3", "fight runs long → security-guard cameo check", "low charisma -1 (crowd disapproves)"], environmentalAmmo: ["A runaway shopping cart", "A rotisserie chicken", "Stacked patio chairs"] },
  { key: "ikea-showroom", name: "IKEA showroom", blurb: "Labyrinth of flat-pack furniture, yellow arrows, and Swedish meatballs. Every wall is pretend.", modifiers: ["flight-response trait -3 (can't find exit)", "Allen wrench as weapon -1 damage but high shame factor", "fake living rooms break easily (destruction is the point)"], environmentalAmmo: ["A BILLY bookcase", "A pillow named SKROBLA", "A tray of meatballs"] },
  { key: "dirty-woman-park", name: "Dirty Woman Park", blurb: "A shitty park with a name nobody will explain and a basketball court with half a net. Chain-link fence, one working streetlamp, a bench with a broken slat.", modifiers: ["basketball on scene → first to grab +2 (court control)", "low charisma irrelevant (no audience)", "exit-the-venue moves -2 (nowhere meaningful to leave to)"], environmentalAmmo: ["The basketball", "A chain-link fence", "A beer bottle nobody's proud of"] },
];

const weapons = [
  { key: "pool-noodle", name: "Pool noodle", blurb: "Foam cylinder. Zero damage, maximum humiliation.", modifiers: ["damage negligible", "high-charisma trait → +2", "vs anyone wielding a real weapon → useless"], excludeLocations: [], onlyLocations: [], minDrunkenness: null, minGrit: null },
  { key: "kitchen-knife", name: "Kitchen knife", blurb: "Real knife, real stakes.", modifiers: ["+4 damage", "low-grit fighter freezes on the draw", "'will actually stab you' trait → +6 damage"], excludeLocations: ["open-water"], onlyLocations: [], minDrunkenness: null, minGrit: 5 },
  { key: "louisville-slugger", name: "Louisville Slugger", blurb: '34" wooden bat.', modifiers: ["+3 damage", "low-grit fighter → one swing then dropped", "high-grit → sustained use, full damage"], excludeLocations: [], onlyLocations: [], minDrunkenness: null, minGrit: 4 },
  { key: "nerf-blaster", name: "Nerf blaster", blurb: "Loud, plastic, harmless. Good for setups.", modifiers: ["damage negligible", "first-shot surprise → +2 initiative", "chaos-agent trait → +1"], excludeLocations: [], onlyLocations: [], minDrunkenness: null, minGrit: null },
  { key: "folding-chair", name: "Folding chair", blurb: "Either way it's an attack.", modifiers: ["+2 damage", "two-handed → low-strength fighter -1 accuracy"], excludeLocations: [], onlyLocations: [], minDrunkenness: null, minGrit: null },
  { key: "bare-fists", name: "Bare fists", blurb: "No weapon. Honest option.", modifiers: ["strength trait drives damage directly", "emotional-cold trait +1", "wit-based fighters -2"], excludeLocations: [], onlyLocations: [], minDrunkenness: null, minGrit: null },
  { key: "laser-pointer", name: "Laser pointer", blurb: "Mostly symbolic.", modifiers: ["damage none", "reads-people trait +2", "pointed at opponent's signature quirk → critical-hit attempt"], excludeLocations: [], onlyLocations: [], minDrunkenness: null, minGrit: null },
  { key: "frying-pan", name: "Frying pan", blurb: "Cast iron. Great clang.", modifiers: ["+3 damage", "high-strength trait → +1 accuracy", "overlap with kitchen venues — don't double-count"], excludeLocations: ["open-water"], onlyLocations: [], minDrunkenness: null, minGrit: null },
];

for (const loc of locations) {
  await pool.query(
    `INSERT INTO "Location" (id, key, name, blurb, modifiers, "environmentalAmmo", source, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, 'day1', NOW())
     ON CONFLICT (key) DO NOTHING`,
    [id(), loc.key, loc.name, loc.blurb, JSON.stringify(loc.modifiers), loc.environmentalAmmo]
  );
  console.log('Location:', loc.name);
}

for (const w of weapons) {
  await pool.query(
    `INSERT INTO "Weapon" (id, key, name, blurb, modifiers, "excludeLocations", "onlyLocations", "minDrunkenness", "minGrit", source, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'day1', NOW())
     ON CONFLICT (key) DO NOTHING`,
    [id(), w.key, w.name, w.blurb, JSON.stringify(w.modifiers), w.excludeLocations, w.onlyLocations, w.minDrunkenness, w.minGrit]
  );
  console.log('Weapon:', w.name);
}

await pool.end();
console.log('Done');
