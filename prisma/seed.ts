import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { DAY1_LOCATIONS } from "../lib/library/locations-day1";
import { DAY1_WEAPONS } from "../lib/library/weapons-day1";

const prisma = new PrismaClient();

type RosterSeed = {
  name: string;
  password: string;
}[];

const DEFAULT_ROSTER: RosterSeed = [
  { name: "Murph", password: "murph-pwd" },
  { name: "Max", password: "max-pwd" },
  { name: "Mango", password: "mango-pwd" },
  { name: "Patty", password: "patty-pwd" },
  { name: "Hippie", password: "hippie-pwd" },
  { name: "Pickle", password: "pickle-pwd" },
  { name: "Ryan", password: "ryan-pwd" },
  { name: "Parker", password: "parker-pwd" },
  { name: "Dan", password: "dan-pwd" },
  { name: "Hoag", password: "hoag-pwd" },
];

function loadRoster(): RosterSeed {
  const path = resolve(process.cwd(), "roster.seed.json");
  if (existsSync(path)) {
    const data = JSON.parse(readFileSync(path, "utf8")) as RosterSeed;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("roster.seed.json must be a non-empty array of { name, password }");
    }
    return data;
  }
  return DEFAULT_ROSTER;
}

async function seedRoster(roster: RosterSeed) {
  for (const entry of roster) {
    const hashedPassword = await bcrypt.hash(entry.password, 10);
    await prisma.friend.upsert({
      where: { name: entry.name },
      update: {},
      create: {
        name: entry.name,
        hashedPassword,
      },
    });
  }
  console.log(`Seeded ${roster.length} friends.`);
}

async function seedDay1Locations() {
  for (const loc of DAY1_LOCATIONS) {
    await prisma.location.upsert({
      where: { key: loc.key },
      update: {
        name: loc.name,
        blurb: loc.blurb,
        modifiers: loc.modifiers,
        environmentalAmmo: loc.environmentalAmmo,
      },
      create: {
        key: loc.key,
        name: loc.name,
        blurb: loc.blurb,
        modifiers: loc.modifiers,
        environmentalAmmo: loc.environmentalAmmo,
        source: "day1",
      },
    });
  }
  console.log(`Seeded ${DAY1_LOCATIONS.length} day-1 locations.`);
}

async function seedDay1Weapons() {
  for (const wpn of DAY1_WEAPONS) {
    await prisma.weapon.upsert({
      where: { key: wpn.key },
      update: {
        name: wpn.name,
        blurb: wpn.blurb,
        modifiers: wpn.modifiers,
        excludeLocations: wpn.excludeLocations ?? [],
        onlyLocations: wpn.onlyLocations ?? [],
        minDrunkenness: wpn.minDrunkenness ?? null,
        minGrit: wpn.minGrit ?? null,
      },
      create: {
        key: wpn.key,
        name: wpn.name,
        blurb: wpn.blurb,
        modifiers: wpn.modifiers,
        source: "day1",
        excludeLocations: wpn.excludeLocations ?? [],
        onlyLocations: wpn.onlyLocations ?? [],
        minDrunkenness: wpn.minDrunkenness ?? null,
        minGrit: wpn.minGrit ?? null,
      },
    });
  }
  console.log(`Seeded ${DAY1_WEAPONS.length} day-1 weapons.`);
}

async function main() {
  await seedRoster(loadRoster());
  await seedDay1Locations();
  await seedDay1Weapons();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
