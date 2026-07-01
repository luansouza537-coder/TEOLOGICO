/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SoundEffect = 'dogma' | 'leader' | 'alert' | 'temple';

export function playFileSound(name: SoundEffect, isMuted: boolean): void {
  if (isMuted) return;
  try {
    const audio = new Audio(`/sfx_${name}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {}
}
