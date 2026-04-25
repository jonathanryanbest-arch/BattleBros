-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "FriendStatus" AS ENUM ('locked', 'unlocked');

-- CreateEnum
CREATE TYPE "TraitContributionKind" AS ENUM ('submit', 'upvote');

-- CreateEnum
CREATE TYPE "FightStatus" AS ENUM ('spinning', 'locked', 'streaming', 'done');

-- CreateEnum
CREATE TYPE "Drunkenness" AS ENUM ('sober', 'buzzed', 'drunk', 'hammered');

-- CreateEnum
CREATE TYPE "LibrarySource" AS ENUM ('day1', 'emergent');

-- CreateEnum
CREATE TYPE "FightTurnKind" AS ENUM ('spin', 'narration', 'verdict');

-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "status" "FriendStatus" NOT NULL DEFAULT 'locked',
    "unlockedAt" TIMESTAMP(3),
    "cachedTraits" JSONB NOT NULL DEFAULT '[]',
    "cachedTraitsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendTraitContribution" (
    "id" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "displayTag" TEXT NOT NULL,
    "kind" "TraitContributionKind" NOT NULL,
    "claudeFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendTraitContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weapon" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "modifiers" JSONB NOT NULL,
    "source" "LibrarySource" NOT NULL DEFAULT 'day1',
    "derivedFromFriendId" TEXT,
    "fighterSpecificId" TEXT,
    "excludeLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "onlyLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minDrunkenness" "Drunkenness",
    "minGrit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "modifiers" JSONB NOT NULL,
    "environmentalAmmo" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" "LibrarySource" NOT NULL DEFAULT 'day1',
    "derivedFromFriendId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fight" (
    "id" TEXT NOT NULL,
    "fighterAId" TEXT NOT NULL,
    "fighterBId" TEXT NOT NULL,
    "cameoFriendId" TEXT,
    "locationKey" TEXT NOT NULL,
    "weaponAKey" TEXT,
    "weaponBKey" TEXT,
    "drunkennessA" "Drunkenness" NOT NULL DEFAULT 'buzzed',
    "drunkennessB" "Drunkenness" NOT NULL DEFAULT 'buzzed',
    "baseProbabilityA" INTEGER,
    "rolledWinnerId" TEXT,
    "status" "FightStatus" NOT NULL DEFAULT 'spinning',
    "finalBlow" TEXT,
    "tagline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FightTurn" (
    "id" TEXT NOT NULL,
    "fightId" TEXT NOT NULL,
    "ord" INTEGER NOT NULL,
    "kind" "FightTurnKind" NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FightTurn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friend_name_key" ON "Friend"("name");

-- CreateIndex
CREATE INDEX "FriendTraitContribution_friendId_tag_idx" ON "FriendTraitContribution"("friendId", "tag");

-- CreateIndex
CREATE INDEX "FriendTraitContribution_contributorId_friendId_kind_created_idx" ON "FriendTraitContribution"("contributorId", "friendId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "FriendTraitContribution_friendId_kind_idx" ON "FriendTraitContribution"("friendId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Weapon_key_key" ON "Weapon"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Location_key_key" ON "Location"("key");

-- CreateIndex
CREATE INDEX "FightTurn_fightId_idx" ON "FightTurn"("fightId");

-- CreateIndex
CREATE UNIQUE INDEX "FightTurn_fightId_ord_key" ON "FightTurn"("fightId", "ord");

-- AddForeignKey
ALTER TABLE "FriendTraitContribution" ADD CONSTRAINT "FriendTraitContribution_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Friend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendTraitContribution" ADD CONSTRAINT "FriendTraitContribution_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Friend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_derivedFromFriendId_fkey" FOREIGN KEY ("derivedFromFriendId") REFERENCES "Friend"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_derivedFromFriendId_fkey" FOREIGN KEY ("derivedFromFriendId") REFERENCES "Friend"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_fighterAId_fkey" FOREIGN KEY ("fighterAId") REFERENCES "Friend"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_fighterBId_fkey" FOREIGN KEY ("fighterBId") REFERENCES "Friend"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_cameoFriendId_fkey" FOREIGN KEY ("cameoFriendId") REFERENCES "Friend"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightTurn" ADD CONSTRAINT "FightTurn_fightId_fkey" FOREIGN KEY ("fightId") REFERENCES "Fight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

