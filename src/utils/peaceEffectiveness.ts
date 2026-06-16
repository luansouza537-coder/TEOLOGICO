/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates the effectiveness multiplier (0–1) of a peace action in a country.
 * Based on the religion's real influence: faithful share, temple level,
 * leader infiltration, and economic strength (tithe).
 */
export function calcPeaceEffectiveness(
  converts: number,
  population: number,
  templeLevel: number,
  leaderInfiltration: number,
  tithe: number
): number {
  const convertPct = population > 0 ? converts / population : 0;
  const faithWeight   = Math.min(1, convertPct / 0.35) * 0.40;
  const templeWeight  = (templeLevel / 4) * 0.30;
  const leaderWeight  = (leaderInfiltration / 100) * 0.20;
  const titheWeight   = (tithe > 50 ? 1 : tithe / 50) * 0.10;
  const raw = faithWeight + templeWeight + leaderWeight + titheWeight;
  return Math.max(0.30, raw); // minimum 30% so early game always works
}

export function peaceEffectivenessLabel(eff: number): string {
  if (eff >= 0.90) return 'Dominante';
  if (eff >= 0.70) return 'Forte';
  if (eff >= 0.50) return 'Moderada';
  if (eff >= 0.35) return 'Fraca';
  return 'Mínima';
}

export function peaceEffectivenessColor(eff: number): string {
  if (eff >= 0.70) return 'text-green-400';
  if (eff >= 0.50) return 'text-yellow-400';
  if (eff >= 0.35) return 'text-orange-400';
  return 'text-red-400';
}
