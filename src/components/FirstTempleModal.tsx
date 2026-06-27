/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ReligionTrait } from '../types';

interface FirstTempleModalProps {
  religionName: string;
  trait: ReligionTrait;
  countryName: string;
  onClose: () => void;
}

const TRAIT_MESSAGE: Record<ReligionTrait, { title: string; body: string }> = {
  Mistical: {
    title: 'O Véu foi Rasgado',
    body: 'Um lugar sagrado se ergueu entre os mortais. Aqui, o invisível se torna palpável — transes, visões e relíquias guardarão a memória do milagre que você plantou.',
  },
  Prophetic: {
    title: 'A Profecia Ganhou Forma',
    body: 'O que foi revelado em palavras agora existe em pedra. Seu primeiro templo é o cumprimento de uma visão. O mundo começará a perceber que suas profecias não são sonhos — são destino.',
  },
  Activist: {
    title: 'Um Bastião da Esperança',
    body: 'Erguido não para Deus, mas para as pessoas. Este templo é um grito de resistência — um lugar onde os oprimidos encontram força, dignidade e um lar.',
  },
  Syncretist: {
    title: 'O Ponto de Encontro',
    body: 'Onde tradições se abraçam. Seu primeiro templo não exclui nenhuma crença — ele as acolhe todas. Este é o germe de uma fé que un o que o mundo insiste em separar.',
  },
};

export default function FirstTempleModal({ religionName, trait, countryName, onClose }: FirstTempleModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<'video' | 'message'>('video');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setPhase('message'));
    const onEnd = () => setPhase('message');
    video.addEventListener('ended', onEnd);
    return () => video.removeEventListener('ended', onEnd);
  }, []);

  const msg = TRAIT_MESSAGE[trait];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm">

      {/* VIDEO PHASE */}
      {phase === 'video' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            src="/first_temple.mp4"
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          {/* Skip button */}
          <button
            type="button"
            onClick={() => setPhase('message')}
            className="absolute bottom-8 right-6 text-[10px] font-mono text-white/40 hover:text-white/70 transition-colors uppercase tracking-widest"
          >
            Pular →
          </button>
        </div>
      )}

      {/* MESSAGE PHASE */}
      {phase === 'message' && (
        <div
          className="relative flex flex-col items-center text-center gap-6 px-8 py-10 max-w-sm animate-fade-in"
          style={{ animation: 'fadeInUp 0.6s ease both' }}
        >
          {/* Glow orb */}
          <div className="w-16 h-16 rounded-full bg-[#cfb53b]/20 border border-[#cfb53b]/40 flex items-center justify-center shadow-[0_0_40px_rgba(207,181,59,0.3)]">
            <span className="text-3xl">🏛️</span>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#cfb53b]/50">
              Primeiro Templo — {countryName}
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#cfb53b] leading-tight">
              {msg.title}
            </h2>
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-[#cfb53b]/40" />

          {/* Body */}
          <p className="text-sm text-[#dfcfa0]/75 leading-relaxed font-serif">
            {msg.body}
          </p>

          {/* Religion name */}
          <p className="text-[10px] font-mono text-[#dfcfa0]/35 uppercase tracking-widest">
            — {religionName}
          </p>

          {/* CTA */}
          <button
            type="button"
            onClick={onClose}
            className="mt-2 px-8 py-3 bg-[#cfb53b] text-[#1a1508] font-bold font-serif uppercase tracking-widest rounded-lg text-sm active:scale-[0.97] shadow-[0_0_20px_rgba(207,181,59,0.35)] transition-all"
          >
            Que a fé se expanda
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
