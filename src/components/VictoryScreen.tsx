/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameState, VictoryGoalType, ReligionTrait } from '../types';

interface VictoryScreenProps {
  state: GameState;
  onNewGame: () => void;
  onViewWorld: () => void;
}

const GOAL_TITLES: Record<VictoryGoalType, string> = {
  GlobalEcstasy:   'O Êxtase Global',
  PerpetualPeace:  'A Paz Perpétua',
  OneFlock:        'Um Só Rebanho',
  TheEnlightened:  'Os Iluminados',
};

const GOAL_NARRATIVE: Record<VictoryGoalType, string> = {
  GlobalEcstasy:   'O êxtase espiritual consumiu o mundo. Cada alma, em cada canto do planeta, encontrou o divino em seu nome. A humanidade transcendeu.',
  PerpetualPeace:  'A última arma enferrujou. Os exércitos se dispersaram. A paz eterna foi selada sob os preceitos do seu credo — e nenhuma guerra jamais voltará a existir.',
  OneFlock:        'As quatro grandes potências dobraram o joelho. Onde havia rivalidade e orgulho nacional, agora há um só rebanho sob um só pastor.',
  TheEnlightened:  'Doze governantes. Doze coroas entregues voluntariamente ao divino. O mundo inteiro é agora o seu templo.',
};

const TRAIT_CLOSING: Record<ReligionTrait, string> = {
  Mistical:    'Os mistérios foram revelados. O véu entre o mundo e o sagrado foi levantado para sempre.',
  Prophetic:   'A profecia se cumpriu. Cada palavra que você pronunciou se tornou realidade diante dos olhos do mundo.',
  Activist:    'A luta terminou em vitória. Cada mártir, cada sacrifício — tudo valeu a pena.',
  Syncretist:  'As tradições se fundiram em harmonia. O que antes dividia agora une a humanidade inteira.',
};

const STAT_LABELS: { key: keyof GameState | 'totalConverts' | 'leadersConverted'; label: string }[] = [
  { key: 'cycle',                label: 'Ciclos até a vitória'     },
  { key: 'firstCountryConverted',label: 'Primeiro país convertido' },
  { key: 'peakFervor',           label: 'Pico de Fervor'           },
  { key: 'totalTemples',         label: 'Templos construídos'      },
  { key: 'totalConverts',        label: 'Fiéis no auge'            },
  { key: 'leadersConverted',     label: 'Líderes convertidos'      },
];

export default function VictoryScreen({ state, onNewGame, onViewWorld }: VictoryScreenProps) {
  const [phase, setPhase] = useState<'video' | 'content'>('video');
  const [videoFading, setVideoFading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const transitionToContent = () => {
    setVideoFading(true);
    setTimeout(() => {
      setPhase('content');
      setTimeout(() => setVisible(true), 50);
      setTimeout(() => setParticlesReady(true), 450);
    }, 800);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => transitionToContent()); // fallback if autoplay blocked
  }, []);


  const totalConverts = state.countries.reduce((s, c) => s + c.converts, 0);
  const leadersConverted = state.countries.filter(c => c.leaderInfiltration >= 100).length;

  const getStatValue = (key: string): string => {
    if (key === 'cycle')                 return `${state.cycle}`;
    if (key === 'firstCountryConverted') return state.firstCountryConverted ?? 'Desconhecido';
    if (key === 'peakFervor')            return `${state.peakFervor ?? 0}`;
    if (key === 'totalTemples')          return `${state.totalTemples}`;
    if (key === 'totalConverts')         return totalConverts >= 1_000_000
      ? `${(totalConverts / 1_000_000).toFixed(1)}M`
      : `${(totalConverts / 1_000).toFixed(0)}K`;
    if (key === 'leadersConverted')      return `${leadersConverted} / 12`;
    return '—';
  };

  // Generate deterministic particle positions from cycle seed
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: ((i * 137.5) % 100),
    y: ((i * 97.3) % 100),
    size: 2 + (i % 4),
    delay: (i * 0.18) % 3,
    duration: 2.5 + (i % 3) * 0.8,
  }));

  if (phase === 'video') {
    return (
      <div
        className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-700 ${videoFading ? 'opacity-0' : 'opacity-100'}`}
      >
        <video
          ref={videoRef}
          src="/victory.mp4"
          className="w-full h-full object-cover"
          onEnded={transitionToContent}
          playsInline
          muted
        />
        <button
          onClick={transitionToContent}
          className="absolute bottom-8 right-8 text-xs font-mono text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest border border-white/20 hover:border-white/50 px-4 py-2 rounded"
        >
          Pular →
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'radial-gradient(ellipse at center, #1a1200 0%, #0a0800 60%, #000 100%)' }}
    >
      {/* Animated gold particles */}
      {particlesReady && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full bg-[#cfb53b] opacity-0"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animation: `victoryPulse ${p.duration}s ${p.delay}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(207,181,59,0.08) 0%, transparent 70%)' }}
      />

      <div
        className={`relative w-full max-w-2xl flex flex-col gap-6 transition-transform duration-700 ${visible ? 'translate-y-0' : 'translate-y-8'}`}
      >
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <div className="text-5xl mb-1">✦</div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif text-[#cfb53b] uppercase tracking-widest drop-shadow-[0_0_20px_rgba(207,181,59,0.5)]">
            {GOAL_TITLES[state.victoryGoal]}
          </h1>
          <div className="text-lg font-serif text-[#dfcfa0]/70 tracking-wider italic mt-1">
            {state.religionName}
          </div>
        </div>

        {/* Narrative */}
        <div className="bg-[#1a1408]/80 border border-[#cfb53b]/30 rounded-xl p-5 text-center">
          <p className="text-sm md:text-base text-[#dfcfa0]/90 leading-relaxed font-serif italic">
            {GOAL_NARRATIVE[state.victoryGoal]}
          </p>
          <p className="text-xs text-[#dfcfa0]/50 leading-relaxed mt-3 font-serif italic">
            {TRAIT_CLOSING[state.religionTrait]}
          </p>
        </div>

        {/* Stats grid */}
        <div className="bg-[#161008]/70 border border-[#cfb53b]/20 rounded-xl p-5">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#cfb53b]/60 mb-4 text-center">
            Crônica da Run
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {STAT_LABELS.map(({ key, label }) => (
              <div key={key} className="bg-[#0e0b05]/60 rounded-lg p-3 flex flex-col gap-1 border border-[#cfb53b]/10">
                <span className="text-[10px] font-mono text-[#dfcfa0]/40 uppercase tracking-wider">{label}</span>
                <span className="text-base font-bold font-mono text-[#cfb53b]">{getStatValue(key)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onNewGame}
            className="py-3 px-8 bg-[#cfb53b] hover:bg-[#e6ca4a] text-[#1e1a0c] font-extrabold uppercase rounded-lg shadow-md cursor-pointer text-sm tracking-widest transition-all active:scale-95"
          >
            Nova Gênese
          </button>
          <button
            onClick={onViewWorld}
            className="py-3 px-8 bg-transparent border border-[#cfb53b]/40 hover:border-[#cfb53b] text-[#cfb53b] font-bold uppercase rounded-lg cursor-pointer text-sm tracking-widest transition-all active:scale-95"
          >
            Ver o Mundo
          </button>
        </div>
      </div>

      <style>{`
        @keyframes victoryPulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
