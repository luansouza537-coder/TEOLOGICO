/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dogma, ReligionTrait } from '../types';
import { Sparkles, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface DogmasPanelProps {
  dogmas: Dogma[];
  faith: number;
  fervor: number;
  trait: ReligionTrait;
  faithPhase: 1 | 2 | 3;
  onPurchaseDogma: (dogmaId: string) => void;
}

export default function DogmasPanel({ dogmas, faith, fervor, trait, faithPhase, onPurchaseDogma }: DogmasPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const universalDogmas = dogmas.filter((d) => !d.traitRequirement);
  const traitDogmas = dogmas.filter((d) => d.traitRequirement === trait);

  const traitLabels: Record<ReligionTrait, string> = {
    Mistical: 'Corações Místicos',
    Prophetic: 'Mentes Proféticas',
    Activist: 'Mártires Ativistas',
    Syncretist: 'Doutrinas Sincretistas'
  };

  const phaseLabels: Record<number, string> = { 2: 'Credo Estabelecido', 3: 'Era da Transcendência' };
  const phaseColors: Record<number, string> = { 2: 'text-orange-400 border-orange-700/40', 3: 'text-red-400 border-red-700/40' };

  const renderDogma = (d: Dogma) => {
    const isAffordable = faith >= d.costFaith && fervor >= d.costFervor;
    const isLocked = (d.phase ?? 1) > faithPhase;
    const isExpanded = expandedId === d.id;

    if (isLocked) {
      return (
        <div key={d.id} className="flex items-center justify-between px-2 py-1.5 rounded border border-zinc-800/30 bg-zinc-900/20">
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wide truncate">{d.name}</span>
          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border shrink-0 ml-2 ${phaseColors[d.phase ?? 2]}`}>
            🔒 {phaseLabels[d.phase ?? 2] ?? 'Bloqueado'}
          </span>
        </div>
      );
    }

    if (d.purchased) {
      return (
        <div key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded border border-green-800/30 bg-[#1a2215]">
          <Check className="w-3 h-3 text-green-400 shrink-0" />
          <span className="text-[10px] font-mono text-green-400 flex-1 truncate">{d.name}</span>
          <span className="text-[9px] text-[#dfcfa0]/35 font-mono truncate hidden sm:block">{d.effect.slice(0, 40)}{d.effect.length > 40 ? '…' : ''}</span>
        </div>
      );
    }

    return (
      <div key={d.id} className="rounded border border-[#cfb53b]/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setExpandedId(isExpanded ? null : d.id)}
          className={`w-full flex items-center gap-2 px-2.5 py-2 text-left transition-colors cursor-pointer ${
            isAffordable ? 'bg-[#1e1a0a] hover:bg-[#252010]' : 'bg-[#171308] opacity-60'
          }`}
        >
          {isExpanded
            ? <ChevronDown className="w-3 h-3 text-[#cfb53b]/60 shrink-0" />
            : <ChevronRight className="w-3 h-3 text-[#cfb53b]/40 shrink-0" />}
          <span className="flex-1 text-[11px] font-bold font-serif text-[#cfb53b] truncate">{d.name}</span>
          <span className="shrink-0 text-[9px] font-mono flex gap-1">
            {d.costFaith > 0 && <span className={faith >= d.costFaith ? 'text-[#cfb53b]' : 'text-red-500'}>{d.costFaith}Fé</span>}
            {d.costFervor > 0 && <span className={fervor >= d.costFervor ? 'text-red-400' : 'text-red-500'}>{d.costFervor}Fv</span>}
          </span>
        </button>

        {isExpanded && (
          <div className="px-3 pb-3 pt-1.5 bg-[#141108] border-t border-[#cfb53b]/10 flex flex-col gap-2">
            <p className="text-[10px] text-amber-200/80 leading-relaxed">
              <span className="text-[#cfb53b] font-bold">Efeito:</span> {d.effect}
            </p>
            <button
              onClick={() => { onPurchaseDogma(d.id); setExpandedId(null); }}
              disabled={!isAffordable}
              className={`py-1.5 px-3 rounded text-[10px] font-bold transition-all ${
                isAffordable
                  ? 'bg-[#cfb53b] text-[#1e1a0c] hover:bg-[#e6ca4a] cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isAffordable ? 'Consagrar Dogma' : 'Fé/Fervor insuficiente'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const purchased = dogmas.filter(d => d.purchased).length;

  return (
    <div className="flex flex-col gap-4" id="dogmas-panel-component">

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold uppercase font-mono text-[#cfb53b]/70 tracking-wider">Dogmas Universais</span>
          <span className="text-[9px] font-mono text-[#dfcfa0]/35">{purchased}/{dogmas.length} consagrados</span>
        </div>
        {universalDogmas.map(renderDogma)}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Sparkles className="w-3 h-3 text-[#cfb53b]/70" />
          <span className="text-[10px] font-bold uppercase font-mono text-[#cfb53b]/70 tracking-wider">Revelações: {traitLabels[trait]}</span>
        </div>
        {traitDogmas.map(renderDogma)}
      </div>

    </div>
  );
}
