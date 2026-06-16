/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Dogma, ReligionTrait } from '../types';
import { BookOpen, Sparkles, HelpCircle, Check, ShieldAlert } from 'lucide-react';

interface DogmasPanelProps {
  dogmas: Dogma[];
  faith: number;
  fervor: number;
  trait: ReligionTrait;
  faithPhase: 1 | 2 | 3;
  onPurchaseDogma: (dogmaId: string) => void;
}

export default function DogmasPanel({ dogmas, faith, fervor, trait, faithPhase, onPurchaseDogma }: DogmasPanelProps) {

  // Categorise dogmas
  const universalDogmas = dogmas.filter((d) => !d.traitRequirement);
  const traitDogmas = dogmas.filter((d) => d.traitRequirement === trait);

  const traitLabels: Record<ReligionTrait, string> = {
    Mistical: 'Corações Místicos',
    Prophetic: 'Mentes Proféticas',
    Activist: 'Mártires Ativistas',
    Syncretist: 'Doutrinas Sincretistas'
  };

  const checkAffordable = (d: Dogma) => {
    return faith >= d.costFaith && fervor >= d.costFervor;
  };

  const phaseLabels: Record<number, string> = { 2: 'Credo Estabelecido', 3: 'Era da Transcendência' };
  const phaseColors: Record<number, string> = { 2: 'text-orange-400 border-orange-700/40', 3: 'text-red-400 border-red-700/40' };

  const renderDogmaCard = (d: Dogma) => {
    const isAffordable = checkAffordable(d);
    const isLocked = (d.phase ?? 1) > faithPhase;

    if (isLocked) {
      return (
        <div key={d.id} className="rounded-lg p-4 border border-zinc-800/50 bg-zinc-900/30 flex flex-col gap-2 relative opacity-60">
          <div className="absolute top-2 right-2">
            <ShieldAlert className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="flex items-start gap-2">
            <div>
              <span className="text-sm font-bold font-serif text-zinc-500">{d.name}</span>
              <div className={`text-[9px] font-mono px-1.5 py-0.5 rounded border mt-1 inline-block ${phaseColors[d.phase ?? 1]}`}>
                🔒 Requer: {phaseLabels[d.phase ?? 1]}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-600 italic leading-relaxed">"{d.description}"</p>
        </div>
      );
    }

    return (
      <div
        key={d.id}
        className={`rounded-lg p-4 border flex flex-col justify-between transition-all duration-300 relative ${
          d.purchased
            ? 'bg-[#1a2215] border-green-800/50 text-amber-100 shadow-inner'
            : isAffordable
            ? 'bg-[#292211] border-[#cfb53b]/50 hover:border-[#cfb53b] hover:bg-[#1e1a0c]/80 cursor-pointer'
            : 'bg-[#1b170d] border-zinc-900 text-zinc-500 opacity-75 cursor-not-allowed'
        }`}
        onClick={() => !d.purchased && isAffordable && onPurchaseDogma(d.id)}
        id={`dogma-card-${d.id}`}
      >
        {d.purchased && (
          <div className="absolute top-2 right-2 bg-[#406834] text-white p-0.5 rounded-full">
            <Check className="w-3 h-3" />
          </div>
        )}

        <div>
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <span className={`text-base font-bold font-serif ${d.purchased ? 'text-green-400' : 'text-[#cfb53b]'}`}>
              {d.name}
            </span>
          </div>

          <p className="text-xs text-[#dfcfa0]/75 leading-relaxed italic mb-2">
            "{d.description}"
          </p>

          <p className="text-[11px] text-amber-200/90 font-mono border-t border-[#cfb53b]/10 pt-2 mb-4 leading-normal">
            <span className="font-bold text-[#cfb53b]">Efeito:</span> {d.effect}
          </p>
        </div>

        {/* Cost display footer */}
        {!d.purchased && (
          <div className="flex gap-2.5 items-center justify-end text-xs font-mono border-t border-[#cfb53b]/10 pt-2">
            <span className="text-gray-400">Custo:</span>
            {d.costFaith > 0 && (
              <span className={faith >= d.costFaith ? 'text-[#cfb53b] font-bold' : 'text-red-500'}>
                {d.costFaith} Fé
              </span>
            )}
            {d.costFervor > 0 && (
              <span className={fervor >= d.costFervor ? 'text-red-400 font-bold' : 'text-red-500'}>
                {d.costFervor} Fervor
              </span>
            )}
          </div>
        )}

        {d.purchased && (
          <div className="text-[10px] uppercase font-mono tracking-widest text-green-400 text-right font-bold border-t border-green-800/50 pt-2">
            Dogma Adotado
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#1e1a0c] text-[#dfcfa0] font-sans flex flex-col gap-6" id="dogmas-panel-component">
      
      {/* Help Banner explaining Dogmas */}
      <div className="bg-[#241e0d] border border-[#cfb53b]/30 p-4 rounded-lg flex items-start gap-3">
        <BookOpen className="w-6 h-6 text-[#cfb53b] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#cfb53b] font-serif">
            Evolução de Dogmas e Revelações
          </h4>
          <p className="text-xs text-[#dfcfa0]/80 mt-1 leading-relaxed">
            Consagre novos mandamentos utilizando seus pontos de <strong className="text-[#cfb53b]">Fé</strong> ou <strong className="text-red-400">Fervor</strong> (ganhos sob tensão de autoridades opostas). Cada dogma expande as regras sistêmicas de conversão, abrevia hostilidades globais ou desbloqueia caminhos pacíficos fundamentais.
          </p>
        </div>
      </div>

      {/* Grid 1: Universal Dogmas */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold font-serif text-[#cfb53b] uppercase tracking-wider border-b border-[#cfb53b]/25 pb-1 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" /> Dogmas Universais (Acessíveis a todos)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {universalDogmas.map(renderDogmaCard)}
        </div>
      </div>

      {/* Grid 2: Unique Trait-locked Dogmas */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold font-serif text-[#cfb53b] uppercase tracking-wider border-b border-[#cfb53b]/25 pb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#cfb53b]" /> Dogmas de Revelação: {traitLabels[trait]}
        </h3>
        <div className="bg-[#241111]/30 border border-red-900/40 p-3 rounded-lg text-xs leading-relaxed text-amber-100/70 mb-1 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#cfb53b] shrink-0" />
          <span>Esses dogmas são bloqueados por sua herança doutrinária primordial. Eles dão efeitos dramáticos que combinam com seu objetivo de jogo escolhido!</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {traitDogmas.map(renderDogmaCard)}
        </div>
      </div>

    </div>
  );
}
