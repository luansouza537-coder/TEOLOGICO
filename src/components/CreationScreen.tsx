/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ReligionTrait, VictoryGoalType } from '../types';
import { ShieldCheck, Compass, Sparkles, MessageSquare, HandHelping, Globe, Eye, Landmark } from 'lucide-react';

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

  const traits = [
    {
      id: 'Mistical' as ReligionTrait,
      title: 'Mística',
      icon: Sparkles,
      desc: 'Sua seita baseia-se em experiências místicas diretas, transes e relíquias misteriosas.',
      perks: [
        'Gera Fervor em rituais espirituais ativos.',
        'Eventos espontâneos de "Êxtase" concedem +50% Fé.',
        'Desbloqueia o dogma ritual "Caminhos de Peregrinação".'
      ]
    },
    {
      id: 'Prophetic' as ReligionTrait,
      title: 'Profética',
      icon: MessageSquare,
      desc: 'Orientada por revelações escatológicas, livros sagrados e prenúncios apocalípticos.',
      perks: [
        'Recebe profecias cósmicas periódicas.',
        'Surtos massivos de conversão (+50% acelerada) durante catástrofes ou crises financeiras.',
        'Exibe avisos preventivos sobre futuros percalços governamentais.'
      ]
    },
    {
      id: 'Activist' as ReligionTrait,
      title: 'Ativista',
      icon: HandHelping,
      desc: 'Foco em justiça social, igualdade civil e auxílio humanitário radical nas áreas marginalizadas.',
      perks: [
        'Converte 2.5x mais rápido em Regimes Opressores ou Autoritários.',
        'Sofre perseguição em democracias conservadoras devido ao seu teor revolucionário.',
        'Ações sociais reduzem drasticamente as taxas de violência nacional.'
      ]
    },
    {
      id: 'Syncretist' as ReligionTrait,
      title: 'Sincretista',
      icon: Compass,
      desc: 'Flexível e adaptativa, mescla-se com cultos tradicionais e adota divindades pré-existentes.',
      perks: [
        'Converte 30% mais lentamente, mas a Resistência Global nunca ultrapassa os 50%.',
        'Zera penalidades iniciais de tolerância cultural.',
        'Fundir deuses tradicionais gera bônus instantâneos.'
      ]
    }
  ];

  const goals = [
    {
      id: 'GlobalEcstasy' as VictoryGoalType,
      title: 'Êxtase Global (Conversão)',
      icon: Globe,
      desc: 'Seu objetivo é fazer com que sua palavra transcenda fronteiras físicas. Converta pelo menos 80% de toda a humanidade para vencer.'
    },
    {
      id: 'PerpetualPeace' as VictoryGoalType,
      title: 'Paz Perpétua (Pacifismo)',
      icon: ShieldCheck,
      desc: 'Semeie a harmonia profunda. Reduza a taxa de violência de TODOS os 12 países para menos de 20%, gerando harmonia ecumênica perpétua.'
    },
    {
      id: 'OneFlock' as VictoryGoalType,
      title: 'Um Só Rebanho (Superpotências)',
      icon: Landmark,
      desc: 'Conquiste a burocracia governamental. Domine e conquiste o poder político nas 4 superpotências globais: EUA, China, Índia e Alemanha.'
    },
    {
      id: 'TheEnlightened' as VictoryGoalType,
      title: 'O Iluminado (Infiltração)',
      icon: Eye,
      desc: 'Converse diretamente com as mentes controladoras. Infiltre-se e converta com sucesso os líderes de Estado de todos os 12 países a 100%.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1e1a0c] text-[#dfcfa0] font-sans flex items-center justify-center p-4 relative" id="creation-screen">
      {/* Scroll Background Effect Layer */}
      <div className="absolute inset-0 bg-radial-gradient opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#cfb53b_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      <div className="w-full max-w-4xl bg-[#2a2413] border-4 border-[#cfb53b] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative z-10">
        
        {/* Banner Title */}
        <div className="bg-[#cfb53b] text-[#1e1a0c] text-center py-6 px-4 border-b-4 border-[#2a2413]">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest uppercase font-serif">
            Gênese das Religiões
          </h1>
          <p className="text-xs md:text-sm tracking-widest uppercase italic font-medium mt-1">
            Plague Inc. Edition • Simulador de Expansão de Fé
          </p>
        </div>

        <form onSubmit={handleStart} className="p-6 md:p-8 flex-1 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
          {/* Section 1: Religion Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm uppercase tracking-wider font-semibold text-[#cfb53b] flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#cfb53b]" /> Nome do Credo Religioso:
            </label>
            <input
              type="text"
              required
              maxLength={40}
              placeholder="Ex: Luz de Orion, Ordem do Entardecer, O Caminho Cósmico..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#171308] border-2 border-[#dfcfa0]/30 hover:border-[#cfb53b] focus:border-[#cfb53b] rounded-lg p-3 text-lg text-[#cfb53b] outline-none font-serif placeholder:text-[#dfcfa0]/30 transition-all shadow-inner"
            />
          </div>

          <hr className="border-[#dfcfa0]/10" />

          {/* Section 2: Core Trait Selection */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base uppercase tracking-wider font-bold text-[#cfb53b]">
              1. Selecione a Característica Doutrinária:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {traits.map((t) => {
                const Icon = t.icon;
                const isSelected = trait === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTrait(t.id)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all flex gap-3 relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#1e1a0c] border-[#cfb53b] shadow-[0_0_15px_rgba(207,181,59,0.25)]'
                        : 'bg-[#231d0d] border-[#dfcfa0]/20 hover:border-[#dfcfa0]/50 hover:bg-[#1e1a0c]/60'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-[#cfb53b]" />
                    )}
                    <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${isSelected ? 'bg-[#cfb53b] text-[#1e1a0c]' : 'bg-[#171308] text-[#cfb53b]'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-[#cfb53b] font-serif">{t.title}</span>
                      <p className="text-xs text-[#dfcfa0]/80 mt-1 leading-relaxed">{t.desc}</p>
                      
                      {/* Bullet point list */}
                      <ul className="mt-2 flex flex-col gap-1 border-t border-[#dfcfa0]/10 pt-2">
                        {t.perks.map((p, idx) => (
                          <li key={idx} className="text-[10px] text-amber-100/70 flex items-start gap-1">
                            <span className="text-[#cfb53b]">•</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-[#dfcfa0]/10" />

          {/* Section 3: Victory Goal */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base uppercase tracking-wider font-bold text-[#cfb53b]">
              2. Defina o Sagrado Objetivo de Vitória:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((g) => {
                const Icon = g.icon;
                const isSelected = goal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all flex gap-3 relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#1e1a0c] border-[#cfb53b] shadow-[0_0_15px_rgba(207,181,59,0.25)]'
                        : 'bg-[#231d0d] border-[#dfcfa0]/20 hover:border-[#dfcfa0]/50 hover:bg-[#1e1a0c]/60'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-[#cfb53b]" />
                    )}
                    <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${isSelected ? 'bg-[#cfb53b] text-[#1e1a0c]' : 'bg-[#171308] text-[#cfb53b]'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-[#cfb53b] font-serif uppercase tracking-wide">{g.title}</span>
                      <p className="text-xs text-[#dfcfa0]/75 mt-1 leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Launch Button */}
          <button
            type="submit"
            disabled={!name.trim()}
            className={`w-full py-4 px-6 rounded-lg text-[#1e1a0c] font-bold text-lg uppercase tracking-widest mt-4 transition-all duration-300 font-serif shadow-lg border-2 border-transparent ${
              name.trim()
                ? 'bg-[#cfb53b] hover:bg-[#e6ca4a] cursor-pointer active:scale-[0.98] hover:shadow-[0_0_20px_rgba(207,181,59,0.4)]'
                : 'bg-[#cfb53b]/40 cursor-not-allowed opacity-50'
            }`}
          >
            Semear Crença no Mundo
          </button>
        </form>
      </div>
    </div>
  );
}
