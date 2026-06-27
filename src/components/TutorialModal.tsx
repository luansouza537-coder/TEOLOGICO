/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VictoryGoalType } from '../types';
import { Zap, Church, Users, Target, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface TutorialModalProps {
  victoryGoal: VictoryGoalType;
  onClose: () => void;
}

const GOAL_LABELS: Record<VictoryGoalType, { name: string; desc: string }> = {
  GlobalEcstasy: { name: 'Êxtase Global', desc: 'Converta 80% da população mundial para vencer.' },
  PerpetualPeace: { name: 'Paz Perpétua', desc: 'Reduza a violência global a zero em todos os países.' },
  OneFlock: { name: 'Um Rebanho', desc: 'Converta o líder de todos os países do mundo.' },
  TheEnlightened: { name: 'Os Iluminados', desc: 'Construa templos de nível 4 em 5 países diferentes.' },
};

const STEPS = [
  {
    icon: <Zap className="w-8 h-8 text-[#cfb53b]" />,
    title: 'Recursos',
    items: [
      { label: 'Fé', desc: 'Moeda principal. Ganha a cada ciclo com base nos seus fiéis.' },
      { label: 'Fervor', desc: 'Energia espiritual. Sobe com rituais, cai com perseguições.' },
      { label: 'Dízimo', desc: 'Recurso financeiro gerado pelos fiéis. Usado em templos.' },
      { label: 'Ciclo', desc: 'O tempo avança em ciclos automáticos. Use a velocidade 1×/2×/3×.' },
    ],
  },
  {
    icon: <Church className="w-8 h-8 text-[#cfb53b]" />,
    title: 'Ações no Mapa',
    items: [
      { label: 'Missionário', desc: 'Envia um missionário a um país para começar conversões.' },
      { label: 'Templo', desc: 'Constrói infraestrutura religiosa. Aumenta conversões por ciclo.' },
      { label: 'Líder', desc: 'Infiltra o líder do país. Ao atingir 100%, ele adota sua fé.' },
      { label: 'Pacificar', desc: 'Reduz a violência e resistência em países instáveis.' },
    ],
  },
  {
    icon: <Users className="w-8 h-8 text-[#cfb53b]" />,
    title: 'Resistência & Rival',
    items: [
      { label: 'Resistência', desc: 'Alta resistência bloqueia conversões. Reduza com ações e dogmas.' },
      { label: 'Rel. Local', desc: 'Compete com sua fé. Diminui conforme você cresce no país.' },
      { label: 'Rival', desc: 'Outra religião avança pelo mundo. Se chegar a 100%, você perde.' },
      { label: 'Dogmas', desc: 'Compre poderes especiais na aba Dogmas para potencializar sua fé.' },
    ],
  },
];

export default function TutorialModal({ victoryGoal, onClose }: TutorialModalProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length;
  const goal = GOAL_LABELS[victoryGoal];

  return (
    <div className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center px-4">
      <div className="bg-[#1a1408] border border-[#cfb53b]/30 rounded-xl max-w-sm w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#cfb53b]/40 hover:text-[#cfb53b] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-1.5 mb-5">
          {[...Array(STEPS.length + 1)].map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all"
              style={{ background: i <= step ? '#cfb53b' : '#cfb53b22' }}
            />
          ))}
        </div>

        {!isLast ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              {STEPS[step].icon}
              <h2 className="text-[#cfb53b] font-bold text-lg font-serif">{STEPS[step].title}</h2>
            </div>
            <ul className="space-y-3 mb-6">
              {STEPS[step].items.map(item => (
                <li key={item.label} className="flex flex-col gap-0.5">
                  <span className="text-[#cfb53b] font-bold font-mono text-xs">{item.label}</span>
                  <span className="text-[#dfcfa0]/70 text-xs leading-relaxed pl-2">{item.desc}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-[#cfb53b]" />
              <h2 className="text-[#cfb53b] font-bold text-lg font-serif">Sua Missão</h2>
            </div>
            <div className="bg-[#cfb53b]/10 border border-[#cfb53b]/20 rounded-lg p-4 mb-6">
              <div className="text-[#cfb53b] font-bold text-sm mb-1">{goal.name}</div>
              <div className="text-[#dfcfa0]/80 text-xs leading-relaxed">{goal.desc}</div>
            </div>
            <p className="text-[#dfcfa0]/50 text-xs mb-6">
              Expanda pelo mapa, compre dogmas e converta líderes. Boa sorte, profeta.
            </p>
          </>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => setStep(s => s - 1)}
            className={`flex items-center gap-1 text-xs text-[#cfb53b]/50 hover:text-[#cfb53b] transition-colors ${step === 0 ? 'invisible' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          {!isLast ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 bg-[#cfb53b] text-[#1e1a0c] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#dfc84b] transition-colors"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-[#cfb53b] text-[#1e1a0c] font-bold text-xs px-5 py-2 rounded-lg hover:bg-[#dfc84b] transition-colors"
            >
              Começar a jogar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
