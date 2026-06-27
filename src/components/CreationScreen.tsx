/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ReligionTrait, VictoryGoalType } from '../types';
import { ShieldCheck, Compass, Sparkles, MessageSquare, HandHelping, Globe, Eye, Landmark, ChevronRight, ChevronLeft, Heart, BookOpen, Stethoscope, Radio, Send, Handshake, Flame, ScrollText, Star } from 'lucide-react';

interface CreationScreenProps {
  onStart: (name: string, trait: ReligionTrait, goal: VictoryGoalType, foundingDogmaIds: string[]) => void;
}

// ─── Founding Pillars ───────────────────────────────────────────────────────
// 3 groups, player picks 1 per group. IDs map to existing INITIAL_DOGMAS.
const FOUNDING_GROUPS = [
  {
    label: 'Como sua fé serve',
    subtitle: 'O que seus seguidores fazem pelo mundo',
    pillars: [
      {
        id: 'caridade_global',
        icon: Heart,
        name: 'Caridade',
        desc: 'Alimentamos os famintos e acolhemos os sem-teto. Quem recebe, ouve.',
        effect: 'Reduz violência e converte imediatamente em países com crise social.',
      },
      {
        id: 'assistencia_medica',
        icon: Stethoscope,
        name: 'Cura',
        desc: 'Nossos médicos chegam onde o governo não chega. A fé cura corpo e alma.',
        effect: 'Reduz -2 de violência por ciclo nos países mais violentos do mundo.',
      },
      {
        id: 'circulos_estudo',
        icon: BookOpen,
        name: 'Educação',
        desc: 'Ensinamos a ler com nossa palavra. Conhecimento e fé andam juntos.',
        effect: '+15% conversão em países democráticos e liberais.',
      },
    ],
  },
  {
    label: 'Como sua fé se espalha',
    subtitle: 'A forma de levar sua mensagem ao mundo',
    pillars: [
      {
        id: 'evangelismo_digital',
        icon: Radio,
        name: 'Pregação',
        desc: 'Nossa voz alcança milhões de telas e rádios. A palavra não tem fronteiras.',
        effect: '+25% conversão em países abertos e seculares.',
      },
      {
        id: 'radio_comunitaria',
        icon: Send,
        name: 'Missões',
        desc: 'Enviamos mensageiros para os confins da terra. Ninguém está fora do alcance.',
        effect: '+30% conversão em países vibrantes como Brasil, México e Nigéria.',
      },
      {
        id: 'embaixadas_fe',
        icon: Handshake,
        name: 'Diálogo',
        desc: 'Conversamos com quem nos teme. O tempo e a paciência abrandam até o mais hostil.',
        effect: 'A cada ciclo, o país mais resistente perde -1 ponto de hostilidade.',
      },
    ],
  },
  {
    label: 'O que move seus fiéis',
    subtitle: 'A essência espiritual da sua religião',
    pillars: [
      {
        id: 'reliquias_sagradas',
        icon: Star,
        name: 'Milagres',
        desc: 'O inexplicável acontece entre nós. Quem testemunha um milagre, nunca esquece.',
        effect: 'Eventos de êxtase concedem +50% Fé e +30 Fervor bônus.',
      },
      {
        id: 'cronicas_colapso',
        icon: ScrollText,
        name: 'Profecia',
        desc: 'Anunciamos o que está por vir. O mundo nos escuta quando as crises chegam.',
        effect: '-1 resistência por ciclo em democracias e teocracias.',
      },
      {
        id: 'templos_sociais',
        icon: Flame,
        name: 'Êxtase',
        desc: 'Nossos ritos elevam o espírito. Quem experimenta uma vez, não volta atrás.',
        effect: '+2 Fé por ciclo e -10% resistência global permanentemente.',
      },
    ],
  },
];

export default function CreationScreen({ onStart }: CreationScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [trait, setTrait] = useState<ReligionTrait>('Mistical');
  const [goal, setGoal] = useState<VictoryGoalType>('GlobalEcstasy');
  // one selection per group (index 0, 1, 2)
  const [pillars, setPillars] = useState<[string, string, string]>(['caridade_global', 'evangelismo_digital', 'reliquias_sagradas']);

  const selectPillar = (groupIdx: number, id: string) => {
    setPillars(prev => {
      const next = [...prev] as [string, string, string];
      next[groupIdx] = id;
      return next;
    });
  };

  const handleFinish = () => {
    if (!name.trim()) return;
    onStart(name.trim(), trait, goal, pillars);
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
    { id: 'TheEnlightened', title: 'O Iluminado', icon: Eye, detail: 'Infiltre todos os 14 líderes' },
  ];

  const selectedTrait = traits.find(t => t.id === trait)!;

  // ── Step labels for progress indicator
  const STEPS = ['Identidade', 'Pilares', 'Missão'];

  return (
    <div className="fixed inset-0 bg-[#0e0b04] text-[#dfcfa0] flex flex-col overflow-hidden">

      {/* Subtle dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#cfb53b_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] pointer-events-none" />

      {/* Step progress bar */}
      <div className="relative z-20 shrink-0 flex items-center gap-2 px-5 pt-5 pb-3">
        {STEPS.map((label, i) => {
          const stepNum = (i + 1) as 1 | 2 | 3;
          const active = step === stepNum;
          const done = step > stepNum;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-0.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono border transition-all ${
                  done ? 'bg-[#cfb53b] border-[#cfb53b] text-[#1a1508]'
                  : active ? 'bg-transparent border-[#cfb53b] text-[#cfb53b]'
                  : 'bg-transparent border-[#dfcfa0]/20 text-[#dfcfa0]/30'
                }`}>
                  {done ? '✓' : stepNum}
                </div>
                <span className={`text-[8px] font-mono uppercase tracking-wider ${active ? 'text-[#cfb53b]' : 'text-[#dfcfa0]/25'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mb-3 transition-all ${done ? 'bg-[#cfb53b]/60' : 'bg-[#dfcfa0]/10'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex flex-col flex-1 overflow-y-auto px-5 pb-28 gap-7">

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1">
          <h1
            className="font-serif font-black uppercase tracking-[0.2em]"
            style={{ fontSize: 'clamp(2rem, 10vw, 3rem)', color: '#cfb53b' }}
          >
            CREDO
          </h1>
          <p className="text-[10px] font-mono text-[#dfcfa0]/35 tracking-widest uppercase">
            {step === 1 && 'Dê nome e personalidade à sua fé'}
            {step === 2 && 'Escolha os pilares que definem sua doutrina'}
            {step === 3 && 'O que sua religião busca no mundo?'}
          </p>
        </div>

        {/* ── STEP 1: Nome + Trait ── */}
        {step === 1 && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest font-mono text-[#cfb53b]/70 flex items-center gap-1.5">
                <Landmark className="w-3 h-3" /> Nome da sua religião
              </label>
              <input
                type="text"
                maxLength={40}
                placeholder="Ex: Luz de Orion, Ordem do Entardecer…"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#171308] border border-[#cfb53b]/30 focus:border-[#cfb53b] rounded-lg px-4 py-3 text-base text-[#cfb53b] outline-none font-serif placeholder:text-[#dfcfa0]/20 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#cfb53b]/70">Característica Doutrinária</span>
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
          </>
        )}

        {/* ── STEP 2: Founding Pillars ── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            {FOUNDING_GROUPS.map((group, gi) => (
              <div key={gi} className="flex flex-col gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-[#cfb53b]/70">{group.label}</span>
                  <p className="text-[9px] text-[#dfcfa0]/35 mt-0.5">{group.subtitle}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {group.pillars.map(p => {
                    const Icon = p.icon;
                    const sel = pillars[gi] === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPillar(gi, p.id)}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                          sel
                            ? 'bg-[#1e1a0c] border-[#cfb53b] shadow-[0_0_12px_rgba(207,181,59,0.15)]'
                            : 'bg-[#171308] border-[#cfb53b]/15 hover:border-[#cfb53b]/35'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5 ${sel ? 'bg-[#cfb53b]' : 'bg-[#0e0b04]'}`}>
                          <Icon className={`w-4 h-4 ${sel ? 'text-[#1a1508]' : 'text-[#cfb53b]/60'}`} />
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className={`text-sm font-bold font-serif ${sel ? 'text-[#cfb53b]' : 'text-[#dfcfa0]/70'}`}>{p.name}</span>
                          <span className="text-[9px] text-[#dfcfa0]/45 leading-relaxed">{p.desc}</span>
                          <span className={`text-[9px] font-mono mt-0.5 ${sel ? 'text-[#cfb53b]/80' : 'text-[#dfcfa0]/25'}`}>⚡ {p.effect}</span>
                        </div>
                        {sel && <div className="w-2 h-2 rounded-full bg-[#cfb53b] shrink-0 mt-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Summary strip */}
            <div className="bg-[#171308] border border-[#cfb53b]/15 rounded-lg px-3 py-2 flex flex-wrap gap-2">
              <span className="text-[8px] font-mono text-[#dfcfa0]/35 w-full uppercase tracking-wider mb-0.5">Seus 3 pilares fundadores</span>
              {pillars.map((id, i) => {
                const pillar = FOUNDING_GROUPS[i].pillars.find(p => p.id === id)!;
                return (
                  <span key={i} className="text-[9px] font-mono text-[#cfb53b] bg-[#cfb53b]/10 px-2 py-0.5 rounded border border-[#cfb53b]/20">
                    {pillar.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Victory Goal ── */}
        {step === 3 && (
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
        )}
      </div>

      {/* Fixed bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-4 bg-gradient-to-t from-[#0e0b04] via-[#0e0b04]/95 to-transparent flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
            className="flex items-center gap-1.5 py-4 px-5 rounded-lg font-bold font-serif text-sm uppercase tracking-wider border border-[#cfb53b]/30 text-[#cfb53b]/70 hover:border-[#cfb53b]/60 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => { if (step === 1 && !name.trim()) return; setStep(s => (s + 1) as 1 | 2 | 3); }}
            disabled={step === 1 && !name.trim()}
            className={`flex-1 py-4 rounded-lg font-bold font-serif text-base uppercase tracking-widest transition-all ${
              step === 1 && !name.trim()
                ? 'bg-[#cfb53b]/25 text-[#dfcfa0]/30 cursor-not-allowed'
                : 'bg-[#cfb53b] text-[#1a1508] active:scale-[0.98] shadow-[0_0_24px_rgba(207,181,59,0.3)]'
            }`}
          >
            Avançar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 py-4 rounded-lg font-bold font-serif text-base uppercase tracking-widest bg-[#cfb53b] text-[#1a1508] active:scale-[0.98] shadow-[0_0_24px_rgba(207,181,59,0.3)] transition-all"
          >
            Iniciar Missão
          </button>
        )}
      </div>
    </div>
  );
}
