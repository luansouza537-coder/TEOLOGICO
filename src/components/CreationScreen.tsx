/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ReligionTrait, VictoryGoalType } from '../types';
import { ShieldCheck, Compass, Sparkles, MessageSquare, HandHelping, Globe, Eye, Landmark, ChevronRight } from 'lucide-react';

interface CreationScreenProps {
  onStart: (name: string, trait: ReligionTrait, goal: VictoryGoalType) => void;
}

export default function CreationScreen({ onStart }: CreationScreenProps) {
  const [name, setName] = useState('');
  const [trait, setTrait] = useState<ReligionTrait>('Mistical');
  const [goal, setGoal] = useState<VictoryGoalType>('GlobalEcstasy');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onStart(name.trim(), trait, goal);
  };

  const traits: { id: ReligionTrait; title: string; icon: React.ElementType; desc: string; perks: string[] }[] = [
    {
      id: 'Mistical',
      title: 'Mística',
      icon: Sparkles,
      desc: 'Experiências diretas, transes e relíquias misteriosas.',
      perks: ['Gera Fervor em rituais ativos', 'Êxtases concedem +50% Fé', 'Desbloqueia "Caminhos de Peregrinação"'],
    },
    {
      id: 'Prophetic',
      title: 'Profética',
      icon: MessageSquare,
      desc: 'Revelações escatológicas e prenúncios apocalípticos.',
      perks: ['Recebe profecias cósmicas periódicas', 'Surtos massivos em crises (+50%)', 'Avisos preventivos governamentais'],
    },
    {
      id: 'Activist',
      title: 'Ativista',
      icon: HandHelping,
      desc: 'Justiça social e auxílio humanitário radical.',
      perks: ['2.5× mais rápido em regimes opressores', 'Perseguição em democracias conservadoras', 'Ações sociais reduzem violência'],
    },
    {
      id: 'Syncretist',
      title: 'Sincretista',
      icon: Compass,
      desc: 'Flexível, mescla-se com cultos tradicionais.',
      perks: ['Resistência Global nunca ultrapassa 50%', 'Sem penalidades de tolerância cultural', 'Fundir deuses gera bônus'],
    },
  ];

  const goals: { id: VictoryGoalType; title: string; icon: React.ElementType; detail: string }[] = [
    { id: 'GlobalEcstasy', title: 'Êxtase Global', icon: Globe, detail: 'Converta 80% da humanidade' },
    { id: 'PerpetualPeace', title: 'Paz Perpétua', icon: ShieldCheck, detail: 'Violência < 20% nos 12 países' },
    { id: 'OneFlock', title: 'Um Só Rebanho', icon: Landmark, detail: 'Domine as 4 superpotências' },
    { id: 'TheEnlightened', title: 'O Iluminado', icon: Eye, detail: 'Infiltre todos os 12 líderes' },
  ];

  const selectedTrait = traits.find(t => t.id === trait)!;

  return (
    <div className="fixed inset-0 bg-[#0e0b04] text-[#dfcfa0] flex flex-col overflow-hidden">

      {/* Subtle dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#cfb53b_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] pointer-events-none" />

      {/* Scrollable content */}
      <form
        onSubmit={handleStart}
        className="relative z-10 flex flex-col flex-1 overflow-y-auto px-5 pt-8 pb-28 gap-7"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1 mb-1">
          <h1
            className="font-serif font-black uppercase tracking-[0.2em]"
            style={{ fontSize: 'clamp(2rem, 10vw, 3rem)', color: '#cfb53b' }}
          >
            CREDO
          </h1>
          <p className="text-[10px] font-mono text-[#dfcfa0]/35 tracking-widest uppercase">
            Defina seu credo antes de expandir
          </p>
        </div>

        {/* Religion name */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest font-mono text-[#cfb53b]/70 flex items-center gap-1.5">
            <Landmark className="w-3 h-3" /> Nome da sua religião
          </label>
          <input
            type="text"
            required
            maxLength={40}
            placeholder="Ex: Luz de Orion, Ordem do Entardecer…"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-[#171308] border border-[#cfb53b]/30 focus:border-[#cfb53b] rounded-lg px-4 py-3 text-base text-[#cfb53b] outline-none font-serif placeholder:text-[#dfcfa0]/20 transition-colors"
          />
        </div>

        {/* Trait selector */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-widest font-mono text-[#cfb53b]/70">Característica Doutrinária</span>

          {/* 2×2 grid of compact buttons */}
          <div className="grid grid-cols-2 gap-2">
            {traits.map(t => {
              const Icon = t.icon;
              const sel = trait === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTrait(t.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border transition-all text-center ${
                    sel
                      ? 'bg-[#cfb53b] border-[#cfb53b] text-[#1a1508]'
                      : 'bg-[#171308] border-[#cfb53b]/20 text-[#dfcfa0]/60 hover:border-[#cfb53b]/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${sel ? 'text-[#1a1508]' : 'text-[#cfb53b]'}`} />
                  <span className={`text-[11px] font-bold font-serif ${sel ? 'text-[#1a1508]' : 'text-[#cfb53b]'}`}>{t.title}</span>
                </button>
              );
            })}
          </div>

          {/* Expandable detail of selected trait */}
          <div className="bg-[#171308] border border-[#cfb53b]/20 rounded-lg px-3 py-2.5 flex flex-col gap-1.5">
            <p className="text-[10px] text-[#dfcfa0]/60 leading-relaxed">{selectedTrait.desc}</p>
            <div className="flex flex-col gap-0.5 mt-0.5">
              {selectedTrait.perks.map((p, i) => (
                <span key={i} className="text-[9px] font-mono text-[#cfb53b]/70 flex items-start gap-1">
                  <ChevronRight className="w-2.5 h-2.5 shrink-0 mt-0.5" />{p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Victory goal */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-widest font-mono text-[#cfb53b]/70">Objetivo de Vitória</span>
          <div className="flex flex-col gap-2">
            {goals.map(g => {
              const Icon = g.icon;
              const sel = goal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    sel
                      ? 'bg-[#1e1a0c] border-[#cfb53b] shadow-[0_0_12px_rgba(207,181,59,0.15)]'
                      : 'bg-[#171308] border-[#cfb53b]/15 hover:border-[#cfb53b]/35'
                  }`}
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${sel ? 'bg-[#cfb53b]' : 'bg-[#0e0b04]'}`}>
                    <Icon className={`w-4 h-4 ${sel ? 'text-[#1a1508]' : 'text-[#cfb53b]/60'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold font-serif ${sel ? 'text-[#cfb53b]' : 'text-[#dfcfa0]/70'}`}>{g.title}</span>
                    <span className="text-[9px] font-mono text-[#dfcfa0]/35">{g.detail}</span>
                  </div>
                  {sel && <div className="ml-auto w-2 h-2 rounded-full bg-[#cfb53b] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      {/* Fixed bottom button */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-4 bg-gradient-to-t from-[#0e0b04] via-[#0e0b04]/95 to-transparent">
        <button
          type="submit"
          form=""
          onClick={handleStart}
          disabled={!name.trim()}
          className={`w-full py-4 rounded-lg font-bold font-serif text-base uppercase tracking-widest transition-all ${
            name.trim()
              ? 'bg-[#cfb53b] text-[#1a1508] active:scale-[0.98] shadow-[0_0_24px_rgba(207,181,59,0.3)]'
              : 'bg-[#cfb53b]/25 text-[#dfcfa0]/30 cursor-not-allowed'
          }`}
        >
          Iniciar Missão
        </button>
      </div>
    </div>
  );
}
