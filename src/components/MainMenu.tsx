/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, FolderOpen, Info } from 'lucide-react';

interface MainMenuProps {
  hasSave: boolean;
  onNewGame: () => void;
  onLoadGame: () => void;
}

export default function MainMenu({ hasSave, onNewGame, onLoadGame }: MainMenuProps) {
  const [showCredits, setShowCredits] = useState(false);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-between overflow-hidden">

      {/* Background video — looping ambient */}
      <video
        src="/splash.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.25 }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />

      {/* Top area — logo */}
      <div className="relative z-10 flex flex-col items-center pt-20 pb-4 px-8 text-center">
        <div className="text-[9px] uppercase tracking-[0.5em] font-mono text-[#cfb53b]/50 mb-4">
          Simulador de Expansão de Fé
        </div>
        <h1
          className="font-serif font-black uppercase tracking-[0.2em]"
          style={{
            fontSize: 'clamp(3.5rem, 20vw, 7rem)',
            color: '#cfb53b',
            textShadow: '0 0 80px rgba(207,181,59,0.4), 0 0 160px rgba(207,181,59,0.15)',
          }}
        >
          CREDO
        </h1>
        <div className="w-24 h-px bg-[#cfb53b]/30 mt-2 mb-3" />
        <p className="text-[11px] text-[#dfcfa0]/40 font-mono italic">
          "Uma ideia pode mudar tudo."
        </p>
      </div>

      {/* Center — buttons */}
      <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs px-8">

        <button
          onClick={onNewGame}
          className="w-full py-4 rounded-lg font-bold font-serif text-base tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #cfb53b, #a8922e)',
            color: '#1a1508',
            boxShadow: '0 0 30px rgba(207,181,59,0.3)',
          }}
        >
          <Play className="w-4 h-4" />
          Novo Jogo
        </button>

        {hasSave && (
          <button
            onClick={onLoadGame}
            className="w-full py-3.5 rounded-lg font-bold font-serif text-sm tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 border border-[#cfb53b]/40 text-[#cfb53b] hover:bg-[#cfb53b]/10"
            style={{ background: 'rgba(207,181,59,0.05)' }}
          >
            <FolderOpen className="w-4 h-4" />
            Continuar
          </button>
        )}

        <button
          onClick={() => setShowCredits(true)}
          className="w-full py-2.5 rounded-lg text-xs font-mono tracking-wider text-[#dfcfa0]/30 flex items-center justify-center gap-1.5 transition-all hover:text-[#dfcfa0]/50"
        >
          <Info className="w-3 h-3" />
          Créditos
        </button>
      </div>

      {/* Bottom version */}
      <div className="relative z-10 pb-8 text-[8px] font-mono text-white/15 tracking-widest text-center">
        CREDO · v1.0 · 2026
      </div>

      {/* Credits overlay */}
      {showCredits && (
        <div
          className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center p-8 text-center"
          onClick={() => setShowCredits(false)}
        >
          <h2 className="font-serif text-xl text-[#cfb53b] mb-4 tracking-widest">CRÉDITOS</h2>
          <div className="flex flex-col gap-2 text-[11px] text-[#dfcfa0]/60 font-mono">
            <p>Design & Desenvolvimento</p>
            <p className="text-[#dfcfa0]/90 text-sm">Luan Souza</p>
            <div className="w-12 h-px bg-[#cfb53b]/20 mx-auto my-3" />
            <p className="text-[9px] text-[#dfcfa0]/30">Inspirado em Plague Inc.</p>
            <p className="text-[9px] text-[#dfcfa0]/30">Música: Ambiente Épico</p>
          </div>
          <p className="text-[9px] text-[#dfcfa0]/20 font-mono mt-8">Toque para fechar</p>
        </div>
      )}
    </div>
  );
}
