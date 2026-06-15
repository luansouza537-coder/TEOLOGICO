/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ReligionTrait = 'Mistical' | 'Prophetic' | 'Activist' | 'Syncretist';

export type VictoryGoalType = 'GlobalEcstasy' | 'PerpetualPeace' | 'OneFlock' | 'TheEnlightened';

export interface Country {
  id: string;
  name: string;
  population: number;
  converts: number;         // raw count of followers
  resistance: number;       // from 0 to 100 (percentage)
  violence: number;         // from 0 to 100 (percentage)
  leaderInfiltration: number; // 0 to 100 (progress of leader conversion)
  leaderName: string;
  regimeType: 'opressor' | 'teocracia' | 'democracia' | 'autoritario' | 'liberal' | 'vibrante' | 'estavel';
  specialTrait: string;
  specialTraitDesc: string;
  coordinates: { x: number; y: number }; // for map visual rendering
}

export interface Dogma {
  id: string;
  name: string;
  description: string;
  costFaith: number;
  costFervor: number;
  purchased: boolean;
  traitRequirement?: ReligionTrait;
  effect: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  impactType: 'bonus' | 'penalty' | 'neutral' | 'prophecy' | 'ecstasy' | 'persecution';
  traitRequirement?: ReligionTrait;
  actionEffects: {
    globalFaithMod?: number;
    globalFervorMod?: number;
    countryConvertsMod?: { [countryId: string]: number }; // percentage or absolute
    countryResistanceMod?: { [countryId: string]: number };
    countryViolenceMod?: { [countryId: string]: number };
  };
}

export interface GameState {
  started: boolean;
  religionName: string;
  religionTrait: ReligionTrait;
  victoryGoal: VictoryGoalType;
  faith: number;
  fervor: number;
  cycle: number;
  paused: boolean;
  gameSpeed: 1 | 2 | 3;
  selectedCountryId: string | null;
  dogmas: Dogma[];
  countries: Country[];
  logs: string[];
  eventActive: GameEvent | null;
  rivalProgress: number; // 0 to 100 % towards rival victory
  rivalName: string;
  resistanceStreak: number; // counts consecutive cycles with global average resistance > 85%
  isGameOver: boolean;
  gameOverReason: 'victory' | 'resistance' | 'bankrupt' | 'rival' | null;
  lastEventCycle: number; // cycle number when the last random event was triggered
}
