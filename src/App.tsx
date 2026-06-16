/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ReligionTrait, VictoryGoalType, Country, Dogma, GameEvent, GameState, DoctrineChoice } from './types';
import { INITIAL_COUNTRIES, INITIAL_DOGMAS, RANDOM_EVENTS_POOL, INITIAL_DOCTRINES } from './data/gameData';
import CreationScreen from './components/CreationScreen';
import WorldMap from './components/WorldMap';
import DogmasPanel from './components/DogmasPanel';
import LeadersPanel from './components/LeadersPanel';
import RivalPanel from './components/RivalPanel';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Gamepad2, Info, BookOpen, AlertTriangle } from 'lucide-react';

const TEMPLE_NAMES: Record<string, string[]> = {
  Mistical:   ['Gruta Sagrada', 'Círculo de Visões', 'Torre dos Sonhos', 'Catedral do Êxtase'],
  Prophetic:  ['Sala das Escrituras', 'Torre do Vigia', 'Arquivo das Profecias', 'Templo do Apocalipse'],
  Activist:   ['Centro Comunitário', 'Hospital da Fé', 'Academia Popular', 'Sede da Revolução Pacífica'],
  Syncretist: ['Espaço Intercultural', 'Mesclário dos Povos', 'Biblioteca Universal', 'Templo da Harmonia Eterna'],
};

const TEMPLE_COSTS = [
  { faith: 40, fervor: 10 },
  { faith: 70, fervor: 20 },
  { faith: 110, fervor: 35 },
  { faith: 160, fervor: 55 },
];

// Tradition compatibility: trait × regime growth modifier
const TRADITION_MODIFIER: Record<string, Record<string, number>> = {
  Mistical:   { teocracia: 0.6, opressor: 0.8, liberal: 1.1, vibrante: 1.2, estavel: 0.9, democracia: 1.0, autoritario: 0.9 },
  Prophetic:  { teocracia: 0.8, opressor: 0.7, liberal: 0.9, vibrante: 1.1, estavel: 0.7, democracia: 0.95, autoritario: 0.85 },
  Activist:   { teocracia: 0.4, opressor: 1.2, liberal: 0.8, vibrante: 1.3, estavel: 0.6, democracia: 0.85, autoritario: 1.1 },
  Syncretist: { teocracia: 0.9, opressor: 0.9, liberal: 1.3, vibrante: 1.2, estavel: 1.1, democracia: 1.2, autoritario: 0.95 },
};

const TEMPLE_MILESTONE_MESSAGES: Record<number, string> = {
  3:  'Os alicerces do Sagrado se firmam no mundo.',
  6:  'Seis Pilares da Fé guardam os continentes.',
  10: 'A Era dos Templos chegou — a doutrina é arquitetura.',
  16: 'O mundo foi santificado. Cada nação abriga a Luz Eterna!',
};

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('religion_simulator_state_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old saves: fill missing fields added in later versions
        if (parsed.totalTemples === undefined) parsed.totalTemples = 0;
        if (parsed.countries) {
          parsed.countries = parsed.countries.map((c: any) => ({
            ...c,
            missionariesSent: c.missionariesSent ?? 0,
            templeLevel: c.templeLevel ?? 0,
            cyclesPresent: c.cyclesPresent ?? 0,
            lastConflictCycle: c.lastConflictCycle ?? -99,
            localReligionStrength: c.localReligionStrength ?? 0,
          }));
        }
        if (!parsed.doctrines) parsed.doctrines = INITIAL_DOCTRINES.map(d => ({ ...d, chosen: null }));
        return parsed;
      } catch (e) {
        console.error('Falha ao restaurar dados de localStorage:', e);
      }
    }
    return {
      started: false,
      religionName: '',
      religionTrait: 'Mistical',
      victoryGoal: 'GlobalEcstasy',
      faith: 25, // starting Faith
      fervor: 5,  // starting Fervor
      cycle: 0,
      paused: false,
      gameSpeed: 1,
      selectedCountryId: 'usa', // focus USA initially to show details
      dogmas: INITIAL_DOGMAS,
      countries: INITIAL_COUNTRIES,
      logs: ['Espaço cósmico silencioso. Inicie seu Credo para ver o desenrolar da fé.'],
      eventActive: null,
      rivalProgress: 0,
      rivalName: 'A Ordem Tecnocrática',
      resistanceStreak: 0,
      isGameOver: false,
      gameOverReason: null,
      totalTemples: 0,
      lastEventCycle: -99,
      lastEventTimestamp: 0,
      eventCooldowns: {},
      doctrines: INITIAL_DOCTRINES.map(d => ({ ...d, chosen: null })),
    };
  });

  const [activeTab, setActiveTab] = useState<'map' | 'dogmas' | 'leaders' | 'rival' | 'faith'>('map');
  const [showTutorial, setShowTutorial] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => localStorage.getItem('audio_muted_v2') === 'true');
  const [newsText, setNewsText] = useState('CONEXÃO COLETIVA ESTÁVEL: Monitorando a disseminação teológica pelo globo...');
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number; colorClass: string; countryId?: string }[]>([]);

  // Sound preference state persistence
  useEffect(() => {
    localStorage.setItem('audio_muted_v2', String(isMuted));
  }, [isMuted]);

  const addFloatingText = (text: string, x: number, y: number, colorClass = "text-[#cfb53b]", countryId?: string) => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, text, x, y, colorClass, countryId }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  };

  // Sound cues (synthesized using standard Web Audio API for maximum browser compatibility and immersion)
  const playSound = (type: 'click' | 'success' | 'alert' | 'event' | 'gameover') => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(554.37, audioCtx.currentTime); // C#5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'event') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } else if (type === 'gameover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.7);
      }
    } catch (e) {
      // Browser limits audio until user gesture - safe to suppress
    }
  };

  // Turn state preservation
  useEffect(() => {
    localStorage.setItem('religion_simulator_state_v2', JSON.stringify(state));
  }, [state]);

  // Main Loop Manager
  useEffect(() => {
    if (!state.started || state.paused || state.isGameOver) return;

    // Speeds: 1x = 2500ms, 2x = 1500ms, 3x = 800ms
    const intervalTime = state.gameSpeed === 1 ? 2500 : state.gameSpeed === 2 ? 1500 : 800;

    const timer = setInterval(() => {
      setState((prev) => {
        // 1. Calculate active dogmas
        const activeDogmaIds = prev.dogmas.filter((d) => d.purchased).map((d) => d.id);
        const hasDigitalPreaching = activeDogmaIds.includes('evangelismo_digital');
        const hasGlobalCharity = activeDogmaIds.includes('caridade_global');
        const hasTemploAbrigo = activeDogmaIds.includes('templos_sociais');
        const hasLobbyPolitico = activeDogmaIds.includes('lobby_politico');
        const hasRadioComunitaria = activeDogmaIds.includes('radio_comunitaria');
        const hasAssistenciaMedica = activeDogmaIds.includes('assistencia_medica');
        const hasEmbaixadasFe = activeDogmaIds.includes('embaixadas_fe');
        const hasRedeAjudaMutua = activeDogmaIds.includes('rede_ajuda_mutua');
        const hasCirculosEstudo = activeDogmaIds.includes('circulos_estudo');
        const hasJornadasPeregrinacao = activeDogmaIds.includes('jornadas_peregrinacao');
        const hasClubesJovens = activeDogmaIds.includes('clubes_jovens');
        const hasSelosSolidariedade = activeDogmaIds.includes('selos_solidariedade');
        const hasGuardioesMemoria = activeDogmaIds.includes('guardioes_memoria');
        const hasMercadosPartilha = activeDogmaIds.includes('mercados_partilha');
        const hasLigaBenfeitores = activeDogmaIds.includes('liga_benfeitores');
        const hasBorderSantiago = activeDogmaIds.includes('camino_santiago');
        const hasMiracleRelics = activeDogmaIds.includes('reliquias_sagradas');
        const hasProphecyRevelations = activeDogmaIds.includes('livro_revelacoes');
        const hasCelestialSigns = activeDogmaIds.includes('sinais_celestes');
        const hasOraclesIndia = activeDogmaIds.includes('mensageiros_divinos');
        const hasCadernosApocalipse = activeDogmaIds.includes('cadernos_apocalipse');
        const hasSinaisCeus = activeDogmaIds.includes('sinais_ceus');
        const hasProfeciaSeca = activeDogmaIds.includes('profecia_seca');
        const hasRolosFogo = activeDogmaIds.includes('rolos_fogo');
        const hasVidenteNacoes = activeDogmaIds.includes('vidente_nacoes');
        const hasRelogioJuizo = activeDogmaIds.includes('relogio_juizo');
        const hasEcoTrombetas = activeDogmaIds.includes('eco_trombetas');
        const hasPergaminhoTerremotos = activeDogmaIds.includes('pergaminho_terremotos');
        const hasCronicasColapso = activeDogmaIds.includes('cronicas_colapso');
        const hasCaliceRedencao = activeDogmaIds.includes('calice_redencao');
        const hasJusticeCommissions = activeDogmaIds.includes('comissoes_justica');
        const hasMartyrsFervor = activeDogmaIds.includes('martires_revolucao');
        const hasPeaceActions = activeDogmaIds.includes('reconciliacao_nações');
        const hasSyncretizerHistory = activeDogmaIds.includes('comparatismo_teologico');
        const hasFestivalsFusion = activeDogmaIds.includes('festivais_sagrados');
        const hasPanteaoAberto = activeDogmaIds.includes('panteao_aberto');
        const hasEcumenicalAlliance = activeDogmaIds.includes('alianca_universal');

        // Leader conversion helper flags
        const isLeaderConverted = (cid: string) => {
          const check = prev.countries.find((c) => c.id === cid);
          return check ? check.leaderInfiltration >= 100 : false;
        };

        // Doctrine choice helper
        const getDoc = (id: string): 'A' | 'B' | null =>
          prev.doctrines?.find(d => d.id === id)?.chosen ?? null;

        const usaLeaderConverted = isLeaderConverted('usa');
        const japanLeaderConverted = isLeaderConverted('japan');
        const brassilLeaderConverted = isLeaderConverted('brazil');
        const russiaLeaderConverted = isLeaderConverted('russia');
        const saudiLeaderConverted = isLeaderConverted('saudi_arabia');
        const chinaLeaderConverted = isLeaderConverted('china');
        const indiaLeaderConverted = isLeaderConverted('india');
        const germanyLeaderConverted = isLeaderConverted('germany');
        const egyptLeaderConverted = isLeaderConverted('egypt');
        const southAfricaLeaderConverted = isLeaderConverted('south_africa');
        const mexicoLeaderConverted = isLeaderConverted('mexico');
        const australiaLeaderConverted = isLeaderConverted('australia');

        // 2. Perform Country conversions and status updates
        let totalConvertsCount = 0;
        let totalPopCount = 0;
        let totalResistanceSum = 0;
        let totalViolenceSum = 0;

        const updatedCountries = prev.countries.map((c) => {
          let converts = c.converts;
          const pop = c.population;
          let resistance = c.resistance;
          let violence = c.violence;
          let leaderInfiltration = c.leaderInfiltration;

          let cyclesPresent = c.cyclesPresent ?? 0;
          let lastConflictCycle = c.lastConflictCycle ?? -99;

          if (converts > 0) {
            cyclesPresent += 1;

            // Base growth compound rate per cycle
            let growthFactor = 0.002;

            // OBSTÁCULO 1 — BARREIRAS LINGUÍSTICAS E CULTURAIS
            const linguisticLen = (getDoc('doc_tradition') === 'B' || getDoc('doc_education') === 'A') ? 10 : 15;
            const barrierMod = getDoc('doc_culture') === 'A' ? 0.7 : getDoc('doc_culture') === 'B' ? 1.2 : getDoc('doc_cultures') === 'A' ? 0.5 : 1.0;
            if (cyclesPresent < linguisticLen) {
              const barrierStrength = (prev.religionTrait === 'Syncretist' ? 0.25 : 0.5) * barrierMod;
              const barrier = Math.max(0, (linguisticLen - cyclesPresent) / linguisticLen) * barrierStrength;
              growthFactor *= (1 - barrier);
            }

            // OBSTÁCULO 2 — APEGO ÀS TRADIÇÕES LOCAIS
            const traditionModRaw = TRADITION_MODIFIER[prev.religionTrait]?.[c.regimeType] ?? 1.0;
            const traditionMod = getDoc('doc_cultures') === 'A' ? 1 + (traditionModRaw - 1) * 0.5 : traditionModRaw;
            growthFactor *= traditionMod;

            // FASE 2 — NUCLEAÇÃO: crescimento lento até atingir massa crítica mínima
            const convertPctNucl = (converts / pop) * 100;
            if (convertPctNucl < 1) growthFactor *= 0.3;
            else if (convertPctNucl < 5) growthFactor *= 0.7;

            // Apply religion core trait influence
            if (prev.religionTrait === 'Syncretist') {
              // Slower globally but accepted in open societies
              if (['liberal', 'estavel', 'democracia'].includes(c.regimeType)) {
                growthFactor *= 0.78;
              } else {
                growthFactor *= 0.65;
              }
            }

            // Apply active relevant dogmas and government regimes modifiers
            if (hasDigitalPreaching && ['liberal', 'estavel', 'democracia'].includes(c.regimeType)) {
              growthFactor *= 1.35;
            }

            // Universal new dogmas
            if (hasRadioComunitaria && c.regimeType === 'vibrante') growthFactor *= 1.3;
            if (hasRedeAjudaMutua && ['vibrante', 'autoritario'].includes(c.regimeType)) growthFactor *= 1.1;
            if (hasCirculosEstudo && ['democracia', 'liberal', 'estavel'].includes(c.regimeType)) growthFactor *= 1.15;
            if (hasJornadasPeregrinacao) growthFactor *= 1.3;
            if (hasClubesJovens && c.regimeType === 'vibrante') growthFactor *= 1.25;
            if (hasSelosSolidariedade && ['liberal', 'estavel', 'democracia'].includes(c.regimeType)) growthFactor *= 1.1;
            if (hasLigaBenfeitores && ['liberal', 'democracia'].includes(c.regimeType)) resistance = Math.max(0, resistance - 0.5);

            if (hasJusticeCommissions && ['opressor', 'autoritario'].includes(c.regimeType)) {
              growthFactor *= 2.2;
            }

            // Sinais Celestiais: bônus apenas no ciclo imediatamente após o evento disparar
            if (hasCelestialSigns && prev.cycle - prev.lastEventCycle === 1) {
              growthFactor *= 1.5;
            }

            if (hasBorderSantiago && ['liberal', 'vibrante'].includes(c.regimeType)) {
              growthFactor *= 1.4;
            }

            if (hasOraclesIndia && c.id === 'india') {
              growthFactor *= 1.5;
            }

            // Prophetic new dogmas
            if (hasCadernosApocalipse) growthFactor *= 1.10;
            if (hasProfeciaSeca && ['brazil', 'india', 'egypt', 'south_africa'].includes(c.id)) growthFactor *= 1.3;
            if (hasRolosFogo && prev.cycle - prev.lastEventCycle === 1) growthFactor *= 1.4;
            if (hasEcoTrombetas && ['china', 'india', 'usa', 'brazil'].includes(c.id)) growthFactor *= 1.25;
            if (hasCronicasColapso && ['democracia', 'teocracia'].includes(c.regimeType)) resistance = Math.max(0, resistance - 1);
            if (hasCaliceRedencao && leaderInfiltration >= 80) growthFactor *= 2.0;

            if (hasFestivalsFusion && prev.religionTrait === 'Syncretist') {
              growthFactor *= 1.45;
            }

            // Activist has +150% speed in oppressives, but -40% in stable democracies
            if (prev.religionTrait === 'Activist') {
              if (['opressor', 'autoritario', 'teocracia'].includes(c.regimeType)) {
                growthFactor *= 2.5; // +150% speed bonus
              } else if (['liberal', 'estavel', 'democracia'].includes(c.regimeType)) {
                growthFactor *= 0.6; // -40% speed penalty
              }
            }

            // DOUTRINAS — efeitos por ciclo (crescimento, resistência, liderança)
            if (getDoc('doc_conversion') === 'A') growthFactor *= 1.08;
            if (getDoc('doc_conversion') === 'B') growthFactor *= 0.7;
            if (getDoc('doc_violence') === 'A') violence = Math.max(0, violence - 0.3);
            if (getDoc('doc_violence') === 'B' && ['opressor', 'autoritario'].includes(c.regimeType)) growthFactor *= 1.15;
            if (getDoc('doc_tradition') === 'A' && ['estavel', 'teocracia'].includes(c.regimeType)) growthFactor *= 1.05;
            if (getDoc('doc_culture') === 'B') growthFactor *= 1.12;
            if (getDoc('doc_destiny') === 'A' && ['liberal', 'democracia'].includes(c.regimeType)) growthFactor *= 1.10;
            if (getDoc('doc_leadership') === 'A' && leaderInfiltration < 100 && (converts / pop) > 0.05) leaderInfiltration = Math.min(100, leaderInfiltration + 0.15);
            if (getDoc('doc_gender') === 'A' && ['autoritario', 'teocracia'].includes(c.regimeType)) growthFactor *= 1.15;
            if (getDoc('doc_gender') === 'B' && ['democracia', 'liberal', 'vibrante'].includes(c.regimeType)) growthFactor *= 1.10;
            if (getDoc('doc_science') === 'A' && ['estavel', 'autoritario', 'teocracia'].includes(c.regimeType)) growthFactor *= 1.10;
            if (getDoc('doc_science') === 'A' && ['liberal', 'democracia'].includes(c.regimeType)) resistance = Math.min(100, resistance + 0.1);
            if (getDoc('doc_science') === 'B' && ['democracia', 'liberal'].includes(c.regimeType)) resistance = Math.max(0, resistance - 0.1);
            if (getDoc('doc_afterlife') === 'B') resistance = Math.max(0, resistance - 0.1);
            if (getDoc('doc_interfaith') === 'B') growthFactor *= 1.20;
            if (getDoc('doc_morality') === 'A' && ['estavel', 'autoritario'].includes(c.regimeType)) growthFactor *= 1.10;
            if (getDoc('doc_morality') === 'B' && ['vibrante', 'liberal'].includes(c.regimeType)) { growthFactor *= 1.10; resistance = Math.max(0, resistance - 0.1); }
            if (getDoc('doc_ritual') === 'A') growthFactor *= 1.08;
            if (getDoc('doc_ritual') === 'B') growthFactor *= 0.95;
            if (getDoc('doc_expansion') === 'A') growthFactor *= 1.10;
            if (getDoc('doc_expansion') === 'B') growthFactor *= c.id === 'usa' ? 1.25 : 0.80;
            if (getDoc('doc_authority') === 'B' && leaderInfiltration < 100 && (converts / pop) > 0.05) leaderInfiltration = Math.min(100, leaderInfiltration + 0.25);
            if (getDoc('doc_truth') === 'A') { growthFactor *= 1.10; resistance = Math.min(100, resistance + 0.05); }
            if (getDoc('doc_truth') === 'B' && ['liberal', 'democracia', 'estavel'].includes(c.regimeType)) growthFactor *= 1.05;
            if (getDoc('doc_organization') === 'A' && leaderInfiltration < 100 && (converts / pop) > 0.05) leaderInfiltration = Math.min(100, leaderInfiltration + 0.12);
            if (getDoc('doc_moral_source') === 'B' && ['liberal', 'estavel', 'democracia'].includes(c.regimeType)) growthFactor *= 1.05;
            if (getDoc('doc_gov_ideal') === 'A') {
              if (c.regimeType === 'teocracia') growthFactor *= 1.30;
              if (c.regimeType === 'autoritario') growthFactor *= 1.20;
            }
            if (getDoc('doc_gov_ideal') === 'B' && ['democracia', 'liberal', 'estavel'].includes(c.regimeType)) resistance = Math.max(0, resistance - 0.1);
            if (getDoc('doc_family') === 'A' && ['autoritario', 'estavel'].includes(c.regimeType)) growthFactor *= 1.10;
            if (getDoc('doc_family') === 'B' && ['vibrante', 'liberal', 'democracia'].includes(c.regimeType)) growthFactor *= 1.10;
            if (getDoc('doc_obedience') === 'A' && leaderInfiltration < 100 && (converts / pop) > 0.05) leaderInfiltration = Math.min(100, leaderInfiltration + 0.20);
            if (getDoc('doc_world') === 'B') violence = Math.max(0, violence - 0.4);
            if (getDoc('doc_miracles') === 'A' && (prev.cycle - prev.lastEventCycle) === 1) growthFactor *= 1.20;
            if (getDoc('doc_unity') === 'B') { resistance = Math.max(0, resistance - 0.1); growthFactor *= 1.05; }
            if (getDoc('doc_human_nature') === 'B') violence = Math.max(0, violence - 0.2);

            // FASE 7 — INFLUÊNCIA GRADUAL DO LÍDER: bônus intermediários antes da conversão total
            if (leaderInfiltration >= 75) {
              // Líder simpatizante ativo: reduz resistência e violência, acelera crescimento
              growthFactor *= 1.12;
              resistance = Math.max(0, resistance - 0.4);
              violence = Math.max(0, violence - 0.3);
            } else if (leaderInfiltration >= 50) {
              // Líder receptivo: pequena redução de resistência e leve crescimento
              growthFactor *= 1.08;
              resistance = Math.max(0, resistance - 0.2);
            }

            // FASE 5 — LÍDERES COMUNITÁRIOS: rede de líderes locais acelera a difusão
            const convertPctLocal = (converts / pop);
            if (convertPctLocal > 0.10) growthFactor *= 1.10;

            // FASE 6 — MASSA CRÍTICA: efeito de rede social quando credo é dominante
            if (convertPctLocal > 0.25 && !isLeaderConverted(c.id)) growthFactor *= 1.20;

            // Cap growthFactor to prevent runaway stacking from dogma + doctrine combinations
            growthFactor = Math.min(growthFactor, 0.20);

            // Core expansion factor hindered by local hostility (resistance slows down conversion)
            const hostilityMultiplier = 1 - (resistance / 100);

            // Calculate converts to add (Phase 2: removed artificial +120 floor)
            const addedConverts = Math.floor((pop - converts) * growthFactor * Math.max(0.01, hostilityMultiplier));
            converts = Math.min(pop, converts + addedConverts);

            // APOSTASIA: fiéis abandonam a fé sob violência e resistência cultural alta
            let apostasyMult = 1.0;
            if (getDoc('doc_salvation') === 'B') apostasyMult *= 0.5;
            if (getDoc('doc_authority') === 'A') apostasyMult *= 0.7;
            if (getDoc('doc_obedience') === 'B') apostasyMult *= 0.95;
            if (getDoc('doc_unity') === 'A') apostasyMult *= 0.6;
            const apostasyRate = ((violence / 100) * 0.004 + (resistance / 100) * 0.002) * apostasyMult;
            const apostasyLost = Math.floor(converts * apostasyRate);
            converts = Math.max(0, converts - apostasyLost);

            // OBSTÁCULO 3 — NACIONALISMO RELIGIOSO
            // Religião/ideologia local remove fiéis ativamente; agrava acima de 30% de conversão
            if (!isLeaderConverted(c.id)) {
              const localStrength = c.localReligionStrength ?? 0;
              let nationalismRate = (localStrength / 100) * 0.003;
              const convertPctNat = (converts / pop) * 100;
              if (convertPctNat > 30) nationalismRate *= 1.6; // establishment reage à ameaça crescente
              const nationalismLost = Math.floor(converts * nationalismRate);
              converts = Math.max(0, converts - nationalismLost);
            }

            // FASE 3 — ADAPTAÇÃO CULTURAL: após 20 ciclos de presença, resistência cai gradualmente
            if (cyclesPresent > 20) {
              resistance = Math.max(0, resistance - 0.1);
            }

            // OBSTÁCULO 4 — CONFLITOS ENTRE GRUPOS
            // Alta violência + presença significativa gera conflito local esporádico
            const convertPctConflict = (converts / pop) * 100;
            if (violence > 50 && convertPctConflict > 15 && (prev.cycle - lastConflictCycle) > 10) {
              const conflictChance = c.templeLevel >= 2 ? 0.04 : 0.08;
              if (Math.random() < conflictChance) {
                const conflictLoss = Math.floor(converts * 0.07);
                converts = Math.max(0, converts - conflictLoss);
                violence = Math.min(100, violence + 10);
                lastConflictCycle = prev.cycle;
              }
            }

            // Natural passive leader conversion (requires real presence)
            if (leaderInfiltration < 100) {
              let leaderGrowth = 0.03; // very slow base — player must actively infiltrate
              if (hasLobbyPolitico) leaderGrowth *= 2.0;
              if (hasEcumenicalAlliance) leaderGrowth *= 1.3;
              if (prev.religionTrait === 'Prophetic' && c.templeLevel > 0) {
                leaderGrowth += 0.08 * c.templeLevel;
              }
              leaderInfiltration = Math.min(100, leaderInfiltration + leaderGrowth);
            }
            // Temple growth bonus (inside converts > 0 block so growthFactor exists)
            if (c.templeLevel > 0) {
              growthFactor *= (1 + 0.03 * c.templeLevel);
            }

            // Leader converted — growth bonuses (inside converts > 0 so growthFactor exists)
            if (chinaLeaderConverted && ['china', 'india', 'japan'].includes(c.id)) growthFactor *= 1.5;
            if (indiaLeaderConverted && ['india', 'south_africa', 'egypt'].includes(c.id)) growthFactor *= 1.3;
          }

          // SATURAÇÃO: governos reagem quando conversão cresce sem o líder convertido
          if (converts > 0 && leaderInfiltration < 100) {
            const convertPct = (converts / pop) * 100;
            if (convertPct > 75) resistance = Math.min(100, resistance + 0.8);
            else if (convertPct > 50) resistance = Math.min(100, resistance + 0.4);
            else if (convertPct > 25) resistance = Math.min(100, resistance + 0.2);
          }

          // Temple passive effects — universal resistance reduction (temples are the main conversion engine)
          if (c.templeLevel > 0) {
            const templeResistDrop = c.templeLevel === 1 ? 0.2 : c.templeLevel === 2 ? 0.4 : c.templeLevel === 3 ? 0.7 : 1.2;
            resistance = Math.max(0, resistance - templeResistDrop);
            // Trait-specific bonuses on top
            if (prev.religionTrait === 'Activist') {
              violence = Math.max(0, violence - (0.5 * c.templeLevel));
            }
            if (prev.religionTrait === 'Mistical' && c.templeLevel >= 3) {
              resistance = Math.max(0, resistance - 0.3);
            }
            if (prev.religionTrait === 'Syncretist' && c.templeLevel >= 2) {
              resistance = Math.max(0, resistance - 0.2);
            }
          }

          // Limit resistance based on Syncretist doctrine rule (resistance global never crosses 60%, can set to 50% max with panteao_aberto)
          const limitResistance = hasPanteaoAberto ? 50 : 60;
          if (prev.religionTrait === 'Syncretist' && resistance > limitResistance) {
            resistance = limitResistance;
          }

          // Leaders converted — non-growth passive bonuses
          if (saudiLeaderConverted && c.id === 'saudi_arabia') resistance = 0;
          if (germanyLeaderConverted && ['germany', 'russia'].includes(c.id)) resistance = Math.max(0, resistance * 0.7);
          if (southAfricaLeaderConverted && c.id === 'south_africa') violence = Math.min(5, violence);
          if (mexicoLeaderConverted && ['mexico', 'usa', 'brazil'].includes(c.id)) violence = Math.max(0, violence - 1);

          totalConvertsCount += converts;
          totalPopCount += pop;
          totalResistanceSum += resistance;
          totalViolenceSum += violence;

          return { ...c, converts, resistance, violence, leaderInfiltration, cyclesPresent, lastConflictCycle };
        });

        // Post-map passive dogma effects
        if (hasAssistenciaMedica) {
          const sorted = [...updatedCountries].sort((a, b) => b.violence - a.violence);
          sorted.slice(0, 2).forEach(topViolent => {
            const idx = updatedCountries.findIndex(x => x.id === topViolent.id);
            if (idx !== -1) updatedCountries[idx] = { ...updatedCountries[idx], violence: Math.max(0, updatedCountries[idx].violence - 2) };
          });
        }
        if (hasEmbaixadasFe && updatedCountries.length > 0) {
          const mostResistant = updatedCountries.reduce((max, c) => c.resistance > max.resistance ? c : max, updatedCountries[0]);
          const idx = updatedCountries.findIndex(x => x.id === mostResistant.id);
          if (idx !== -1) updatedCountries[idx] = { ...updatedCountries[idx], resistance: Math.max(0, updatedCountries[idx].resistance - 1) };
        }

        // Neighbor passive dispersion (15% chance per cycle to seed neighbor)
        const connectedIds = updatedCountries.filter(c => c.converts >= c.population * 0.08).map(c => c.id);
        const dispersalChance = getDoc('doc_salvation') === 'A' ? 0.25 : 0.15;
        if (connectedIds.length > 0 && Math.random() < dispersalChance) {
          const sourceId = connectedIds[Math.floor(Math.random() * connectedIds.length)];
          // Find candidates with 0 followers
          const candidates = updatedCountries.filter((c) => c.converts === 0);
          if (candidates.length > 0) {
            const target = candidates[Math.floor(Math.random() * candidates.length)];
            
            // Validate closed boundaries
            let allowed = true;
            if (target.id === 'australia' && !hasBorderSantiago && !australiaLeaderConverted) allowed = false;
            if (target.id === 'egypt' && !hasBorderSantiago && !egyptLeaderConverted) allowed = false;
            if (target.id === 'saudi_arabia' && !hasBorderSantiago && !egyptLeaderConverted) allowed = false;
            
            // Dispersal only seeds countries where player has already sent at least 1 missionary
            if (allowed && target.missionariesSent >= 1) {
              const targetIdx = updatedCountries.findIndex((c) => c.id === target.id);
              if (targetIdx !== -1) {
                updatedCountries[targetIdx] = { ...updatedCountries[targetIdx], converts: 10 };
              }
              prev.logs.unshift(`Dispersão: Missionários que cruzaram de ${sourceId.toUpperCase()} semearam os primeiros cultos em ${target.name}!`);
            }
          }
        }

        // Logs ocasionais de apostasia e saturação (5% de chance por ciclo para não poluir)
        if (Math.random() < 0.05) {
          const apostasyCountry = updatedCountries.find(c => {
            const rate = (c.violence / 100) * 0.004 + (c.resistance / 100) * 0.002;
            return c.converts > 50000 && rate > 0.003;
          });
          if (apostasyCountry) {
            prev.logs.unshift(`[APOSTASIA] Fiéis em ${apostasyCountry.name} questionam a doutrina — violência e resistência cultural geram deserções.`);
          }
        }
        if (Math.random() < 0.05) {
          const saturatedCountry = updatedCountries.find(c =>
            c.leaderInfiltration < 100 && (c.converts / c.population) > 0.5
          );
          if (saturatedCountry) {
            prev.logs.unshift(`[REAÇÃO ESTATAL] O governo de ${saturatedCountry.name} intensifica restrições — a ascensão do credo gera alarme político.`);
          }
        }

        // 3. Currency accumulations
        // Base Faith gain: scales with active presence, not flat over time
        const convertedRate = totalPopCount > 0 ? (totalConvertsCount / totalPopCount) : 0;
        const activeCountries = updatedCountries.filter(c => c.converts > 0).length;

        // Base: 1 Fé + 1 per active country (max ~13). Replaces flat +4.
        let faithGained = 1 + activeCountries;
        faithGained += Math.floor(totalConvertsCount / 50000000); // 1 per 50M converts (was 10M)

        // Dogma bonuses reduced to avoid runaway stacking
        if (hasTemploAbrigo) faithGained += 2;     // was +5
        if (hasDigitalPreaching) faithGained += 1;  // was +2
        if (hasCirculosEstudo) faithGained += 2;    // was +5
        if (hasSelosSolidariedade) faithGained += 2; // was +5
        if (hasMercadosPartilha) faithGained += 2;  // was +3
        if (hasLigaBenfeitores) faithGained += 4;   // was +10
        if (hasCronicasColapso) faithGained += 2;   // was +5

        // Maintenance cost: active missions and temples consume faith each cycle
        const maintenanceCost = activeCountries + Math.floor(prev.totalTemples * 0.5);
        faithGained = Math.max(0, faithGained - maintenanceCost);
        // Temple global faith/fervor bonuses (reduced to prevent runaway accumulation)
        updatedCountries.forEach((c) => {
          if (c.templeLevel === 0) return;
          if (prev.religionTrait === 'Mistical') {
            if (c.templeLevel >= 3) faithGained += c.templeLevel >= 4 ? 4 : 2;
          }
          if (prev.religionTrait === 'Prophetic') {
            if (c.templeLevel >= 3) { faithGained += 3; fervorGained += 1; }
          }
          if (prev.religionTrait === 'Activist') {
            if (c.templeLevel >= 4) faithGained += 3;
          }
          if (prev.religionTrait === 'Syncretist') {
            if (c.templeLevel >= 4) faithGained += 5;
          }
        });

        // DOUTRINAS — efeitos globais de Fé e Fervor
        if (getDoc('doc_economy') === 'A') fervorGained += 5;
        if (getDoc('doc_economy') === 'B') faithGained += 4;
        if (getDoc('doc_charity') === 'B') faithGained += 2;
        if (getDoc('doc_world') === 'A') fervorGained += 4;
        if (getDoc('doc_miracles') === 'B') faithGained += 5;
        if (getDoc('doc_conversion') === 'B') faithGained += 3;
        if (getDoc('doc_state') === 'A') faithGained += 3;
        if (getDoc('doc_afterlife') === 'A' && (totalResistanceSum / updatedCountries.length) > 40) fervorGained += 3;
        if (getDoc('doc_human_nature') === 'A' && updatedCountries.some(c => c.violence > 50)) fervorGained += 3;

        // Caridade Obrigatória: -0.5 violência nos 2 países mais violentos
        if (getDoc('doc_charity') === 'A') {
          const sorted = [...updatedCountries].sort((a, b) => b.violence - a.violence);
          sorted.slice(0, 2).forEach(topV => {
            const idx = updatedCountries.findIndex(x => x.id === topV.id);
            if (idx !== -1) updatedCountries[idx] = { ...updatedCountries[idx], violence: Math.max(0, updatedCountries[idx].violence - 0.5) };
          });
        }

        if (usaLeaderConverted) faithGained = Math.floor(faithGained * 1.4);
        if (japanLeaderConverted) faithGained = Math.floor(faithGained * 1.2);
        if (russiaLeaderConverted) faithGained = Math.floor(faithGained * 1.1); // centralização aumenta Fé

        // Fervor gained: only under real persecution pressure (was too easy to accumulate)
        const avgResistance = totalResistanceSum / updatedCountries.length;
        let fervorGained = 0;
        if (avgResistance > 50) {
          fervorGained += Math.floor((avgResistance - 50) / 20); // requires >50% avg resistance now
        }
        // Syncretist generates less fervor — coexistence avoids confrontation but weakens defensive power
        if (prev.religionTrait === 'Syncretist') {
          fervorGained = Math.floor(fervorGained * 0.5);
        }
        if (hasMartyrsFervor && prev.religionTrait === 'Activist') {
          // Additional fervor from oppressive regimes under resistance
          const oppressedResistCount = updatedCountries.filter(
            (c) => ['opressor', 'autoritario'].includes(c.regimeType) && c.resistance > 40
          ).length;
          fervorGained += oppressedResistCount * 3;
        }
        if (brassilLeaderConverted) {
          fervorGained += 3;
        }
        if (hasRelogioJuizo) fervorGained += 5;

        // 4. Adversary Rival Artificial Intelligence Progression (reactive model)
        const activeCountriesCount = updatedCountries.filter(c => c.converts > 0).length;
        const convertedRate2 = totalPopCount > 0 ? (totalConvertsCount / totalPopCount) : 0;

        let rivalIncrement = 0.4; // base reduced from 0.6

        // Rival thrives when faith is weak or resistance is high
        if (avgResistance > 60) rivalIncrement += 0.8;
        else if (avgResistance > 40) rivalIncrement += 0.4;

        // Rival fills the void when player has little presence
        if (activeCountriesCount < 3) rivalIncrement += 0.4;

        // Rival retreats before established faith
        if (convertedRate2 > 0.5) rivalIncrement *= 0.5;
        else if (convertedRate2 > 0.25) rivalIncrement *= 0.75;

        // Syncretist coexists better with rival ideologies
        if (prev.religionTrait === 'Syncretist') rivalIncrement *= 0.7;
        if (getDoc('doc_moral_source') === 'A') rivalIncrement *= 0.80;
        if (hasRelogioJuizo) rivalIncrement *= 0.7;
        // Prophetic L4 temple: rival slows globally per such temple
        const propheticL4Temples = updatedCountries.filter(c => prev.religionTrait === 'Prophetic' && c.templeLevel >= 4).length;
        if (propheticL4Temples > 0) rivalIncrement *= Math.pow(0.85, propheticL4Temples);

        const updatedRivalProgress = Math.min(100, prev.rivalProgress + rivalIncrement);

        // 5. Evaluate Warning Streak (governos contra você se resistência > 85%)
        let newStreak = prev.resistanceStreak;
        if (avgResistance > 85) {
          newStreak += 1;
        } else {
          newStreak = 0;
        }

        // 6. Check game loss or victory conditions
        let isGameOver = false;
        let gameOverReason: 'victory' | 'resistance' | 'bankrupt' | 'rival' | null = null;

        // Victory tests
        if (prev.victoryGoal === 'GlobalEcstasy' && convertedRate >= 0.8) {
          isGameOver = true;
          gameOverReason = 'victory';
        } else if (prev.victoryGoal === 'PerpetualPeace' && updatedCountries.every((c) => c.violence < 20)) {
          isGameOver = true;
          gameOverReason = 'victory';
        } else if (prev.victoryGoal === 'OneFlock') {
          const superPowers = ['usa', 'china', 'india', 'germany'];
          const controlledCount = updatedCountries.filter(
            (c) => superPowers.includes(c.id) && c.converts >= c.population * 0.5 && c.leaderInfiltration >= 100
          ).length;
          if (controlledCount >= 4) {
            isGameOver = true;
            gameOverReason = 'victory';
          }
        } else if (prev.victoryGoal === 'TheEnlightened' && updatedCountries.every((c) => c.leaderInfiltration >= 100)) {
          isGameOver = true;
          gameOverReason = 'victory';
        }

        // Losses tests
        if (newStreak >= 3) {
          isGameOver = true;
          gameOverReason = 'resistance';
        } else if (updatedRivalProgress >= 100) {
          isGameOver = true;
          gameOverReason = 'rival';
        } else if (prev.faith <= 0 && prev.fervor <= 0 && totalConvertsCount === 0) {
          isGameOver = true;
          gameOverReason = 'bankrupt';
        }

        if (isGameOver) {
          playSound(gameOverReason === 'victory' ? 'success' : 'gameover');
        }

        // 7. Narrative Random Event Dice roll (10% chance, 2-min global cooldown, 25-cycle individual cooldown)
        let newlyTriggeredEvent: GameEvent | null = null;
        let updatedLogs = [...prev.logs];

        const EVENT_GLOBAL_COOLDOWN_MS = 120000; // 2 minutes real time
        const EVENT_INDIVIDUAL_COOLDOWN_CYCLES = 25;
        const now = Date.now();
        const globalCooldownPassed = (now - prev.lastEventTimestamp) >= EVENT_GLOBAL_COOLDOWN_MS;

        if (Math.random() < 0.10 && !isGameOver && globalCooldownPassed) {
          // Filter by trait and individual cooldown
          const validEvents = RANDOM_EVENTS_POOL.filter((e) => {
            const traitOk = !e.traitRequirement || e.traitRequirement === prev.religionTrait;
            const lastFired = prev.eventCooldowns[e.id] ?? -999;
            const cooldownOk = (prev.cycle - lastFired) >= EVENT_INDIVIDUAL_COOLDOWN_CYCLES;
            return traitOk && cooldownOk;
          });

          if (validEvents.length > 0) {
            const picked = validEvents[Math.floor(Math.random() * validEvents.length)];
            newlyTriggeredEvent = picked;
            playSound('event');

            // Apply immediately to country parameters
            updatedCountries.forEach((c) => {
              if (picked.actionEffects.countryResistanceMod?.[c.id]) {
                c.resistance = Math.max(0, Math.min(100, c.resistance + (picked.actionEffects.countryResistanceMod[c.id] || 0)));
              }
              if (picked.actionEffects.countryViolenceMod?.[c.id]) {
                c.violence = Math.max(0, Math.min(100, c.violence + (picked.actionEffects.countryViolenceMod[c.id] || 0)));
              }
              if (picked.actionEffects.countryConvertsMod?.[c.id]) {
                // If value is positive, only apply if player already has presence
                const mod = picked.actionEffects.countryConvertsMod[c.id];
                if (mod > 0) {
                  if (c.converts === 0) return; // no presence = event has no effect here
                  c.converts = Math.min(c.population, Math.floor(c.converts + mod));
                } else if (mod < 0) {
                  // loss (persecution removes the exact mod amount from followers)
                  c.converts = Math.max(0, Math.floor(c.converts + mod));
                }
              }
            });

            // Apply global currency modifiers of event
            let eventFaithBonus = picked.actionEffects.globalFaithMod || 0;
            let eventFervorBonus = picked.actionEffects.globalFervorMod || 0;

            if (hasMiracleRelics && picked.impactType === 'ecstasy') {
              eventFaithBonus = Math.floor(eventFaithBonus * 1.5);
              eventFervorBonus += 30;
            }
            if (hasGuardioesMemoria && ['ecstasy', 'prophecy'].includes(picked.impactType)) {
              eventFaithBonus = Math.floor(eventFaithBonus * 1.5);
            }
            if (hasSinaisCeus) eventFervorBonus += 20;
            if (hasPergaminhoTerremotos && ['penalty', 'neutral'].includes(picked.impactType)) {
              eventFervorBonus += 40;
            }

            // Push to logs
            updatedLogs.unshift(`[EVENTO NARRATIVO] ${picked.title}: ${picked.description}`);
            faithGained += eventFaithBonus;
            fervorGained += eventFervorBonus;
          }
        }

        // Limit log queue size to avoid rendering bottlenecks
        if (updatedLogs.length > 20) {
          updatedLogs = updatedLogs.slice(0, 20);
        }

        const fervorFloor = getDoc('doc_destiny') === 'B' ? 5 : 0;
        const nextCycle = prev.cycle + 1;
        const updatedEventCooldowns = newlyTriggeredEvent
          ? { ...prev.eventCooldowns, [newlyTriggeredEvent.id]: prev.cycle }
          : prev.eventCooldowns;

        return {
          ...prev,
          cycle: nextCycle,
          faith: prev.faith + faithGained,
          fervor: Math.max(fervorFloor, prev.fervor + fervorGained),
          countries: updatedCountries,
          rivalProgress: updatedRivalProgress,
          resistanceStreak: newStreak,
          isGameOver,
          gameOverReason,
          eventActive: isGameOver ? null : (newlyTriggeredEvent || prev.eventActive),
          paused: isGameOver ? false : (newlyTriggeredEvent ? true : prev.paused),
          lastEventCycle: newlyTriggeredEvent ? prev.cycle : prev.lastEventCycle,
          lastEventTimestamp: newlyTriggeredEvent ? now : prev.lastEventTimestamp,
          eventCooldowns: updatedEventCooldowns,
          logs: updatedLogs
        };
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [state.started, state.paused, state.gameSpeed, state.isGameOver]);

  // Dynamic World News Ticker
  useEffect(() => {
    if (!state.started || state.paused || state.isGameOver) return;

    const interval = setInterval(() => {
      setNewsText(() => {
        const newsOptions: string[] = [];
        const activeCountries = state.countries;
        const religion = state.religionName || "Credo";

        // Build list of converting countries
        const converting = activeCountries.filter(c => c.converts > 0);
        if (converting.length > 0) {
          const randomC = converting[Math.floor(Math.random() * converting.length)];
          const pct = (randomC.converts / randomC.population) * 100;
          if (pct > 55) {
            newsOptions.push(`[ALERTA DE FÉ] População de ${randomC.name} declara lealdade quase absoluta ao credo ${religion}!`);
          } else if (pct > 15) {
            newsOptions.push(`[NOTÍCIAS] ${randomC.name} registra explosão de templos e reuniões dedicadas a ${religion}.`);
          } else {
            newsOptions.push(`[SOCIOLOGIA] Investigadores em ${randomC.name} tentam desvendar mistério de devotos de ${religion}.`);
          }
        }

        // Build list of high-resistance countries
        const resisting = activeCountries.filter(c => c.resistance > 50);
        if (resisting.length > 0) {
          const randomR = resisting[Math.floor(Math.random() * resisting.length)];
          newsOptions.push(`[ALERTA] Autoridades de ${randomR.name} ativam táticas de isolamento para conter pregações.`);
        }

        // Build list of highly violent countries
        const violent = activeCountries.filter(c => c.violence > 50);
        if (violent.length > 0) {
          const randomV = violent[Math.floor(Math.random() * violent.length)];
          newsOptions.push(`[CONFLITO] Surtos de convulsão social ameaçam os novos templos de ${religion} em ${randomV.name}.`);
        }

        // Rival status
        if (state.rivalProgress > 75) {
          newsOptions.push(`[SINAL INIMIGO] Dispositivos de sincronização neural de '${state.rivalName}' estão transmitindo doutrina cética.`);
        } else if (state.rivalProgress > 40) {
          newsOptions.push(`[FRENTE RIVAL] '${state.rivalName}' rotula cultos de ${religion} como perigosos estorvos metafísicos.`);
        }

        // High Fervor or high cycle news
        if (state.fervor > 80) {
          newsOptions.push(`[ALERTA SAGRADO] Onda global de fervor cria um senso de destino divino inegável pelas massas.`);
        }

        // Pure flavor news
        newsOptions.push(`[CIÊNCIA ESTELAR] Astrônomos observam cometa brilhante; adeptos de ${religion} dizem ser sinal do Éden.`);
        newsOptions.push(`[CULTURA] Livros sagrados esgotam das prateleiras mundiais com a ascensão espiritual de ${religion}.`);
        newsOptions.push(`[ECONOMIA] Queda de indústrias de jogos céticos enquanto a meditação devocional vira hobby mundial.`);

        // Pick one at random
        return newsOptions[Math.floor(Math.random() * newsOptions.length)];
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [state.started, state.paused, state.isGameOver, state.countries, state.religionName, state.rivalProgress, state.fervor]);

  // Handle Religion Initialization
  const handleStartGame = (name: string, trait: ReligionTrait, goal: VictoryGoalType) => {
    // Fresh countries initialization (giving focus to USA first)
    const presetCountries = INITIAL_COUNTRIES.map((c) => {
      if (c.id === 'usa') {
        return { ...c, converts: 120, leaderInfiltration: 5, resistance: 15, violence: 45, missionariesSent: 0, templeLevel: 0, cyclesPresent: 1, lastConflictCycle: -99 };
      }
      return { ...c, converts: 0, leaderInfiltration: 0, missionariesSent: 0, templeLevel: 0, cyclesPresent: 0, lastConflictCycle: -99 };
    });

    setState({
      started: true,
      religionName: name,
      religionTrait: trait,
      victoryGoal: goal,
      faith: 30, // reasonable starting point
      fervor: 8,
      cycle: 1,
      paused: false,
      gameSpeed: 1,
      selectedCountryId: 'usa',
      dogmas: INITIAL_DOGMAS.map(d => ({ ...d, purchased: false })),
      countries: presetCountries,
      logs: [`O credo "${name}" foi revelado ao mundo. Iniciando dispersão divina pelo globo!`],
      eventActive: null,
      rivalProgress: 0,
      rivalName: 'A Ordem Tecnocrática',
      resistanceStreak: 0,
      isGameOver: false,
      gameOverReason: null,
      totalTemples: 0,
      lastEventCycle: -99,
      lastEventTimestamp: 0,
      eventCooldowns: {},
      doctrines: INITIAL_DOCTRINES.map(d => ({ ...d, chosen: null })),
    });
    playSound('success');
  };

  // Reset Game fully
  const handleResetGame = () => {
    playSound('alert');
    localStorage.removeItem('religion_simulator_state_v2');
    setState({
      started: false,
      religionName: '',
      religionTrait: 'Mistical',
      victoryGoal: 'GlobalEcstasy',
      faith: 25,
      fervor: 5,
      cycle: 0,
      paused: false,
      gameSpeed: 1,
      selectedCountryId: 'usa',
      dogmas: INITIAL_DOGMAS.map(d => ({ ...d, purchased: false })),
      countries: INITIAL_COUNTRIES.map(c => ({ ...c, converts: c.id === 'usa' ? 120 : 0, leaderInfiltration: c.id === 'usa' ? 5 : 0, missionariesSent: 0, templeLevel: 0, cyclesPresent: c.id === 'usa' ? 1 : 0, lastConflictCycle: -99 })),
      logs: ['Espaço cósmico silencioso. Inicie seu Credo para ver o desenrolar da fé.'],
      eventActive: null,
      rivalProgress: 0,
      rivalName: 'A Ordem Tecnocrática',
      resistanceStreak: 0,
      isGameOver: false,
      gameOverReason: null,
      totalTemples: 0,
      lastEventCycle: -99,
      lastEventTimestamp: 0,
      eventCooldowns: {},
      doctrines: INITIAL_DOCTRINES.map(d => ({ ...d, chosen: null })),
    });
  };

  // Doctrine purchase callback
  const purchaseDoctrine = (docId: string, choice: 'A' | 'B') => {
    setState((prev) => {
      const doc = prev.doctrines?.find(d => d.id === docId);
      if (!doc || doc.chosen !== null) return prev;
      const costs = { basic: { faith: 150, fervor: 30 }, intermediate: { faith: 250, fervor: 60 }, strategic: { faith: 400, fervor: 100 } };
      const cost = costs[doc.tier];
      if (prev.faith < cost.faith || prev.fervor < cost.fervor) return prev;

      let updatedCountries = [...prev.countries];
      if (docId === 'doc_interfaith') {
        if (choice === 'A') updatedCountries = updatedCountries.map(c => ({ ...c, violence: Math.max(0, c.violence - 8) }));
        if (choice === 'B') updatedCountries = updatedCountries.map(c => ({ ...c, violence: Math.min(100, c.violence + 15) }));
      }
      if (docId === 'doc_cultures' && choice === 'B') {
        updatedCountries = updatedCountries.map(c => ({ ...c, resistance: Math.max(0, c.resistance - 10) }));
      }
      if (docId === 'doc_state' && choice === 'A') {
        updatedCountries = updatedCountries.map(c =>
          c.regimeType === 'democracia' ? { ...c, resistance: Math.min(100, c.resistance + 10) } : c
        );
      }
      if (docId === 'doc_state' && choice === 'B') {
        updatedCountries = updatedCountries.map(c => ({ ...c, resistance: Math.max(0, c.resistance - 5) }));
      }
      if (docId === 'doc_truth' && choice === 'B') {
        updatedCountries = updatedCountries.map(c => ({ ...c, resistance: Math.max(0, c.resistance - 5) }));
      }

      const updatedDoctrines = prev.doctrines.map(d => d.id === docId ? { ...d, chosen: choice } : d);
      const chosenLabel = choice === 'A' ? doc.optionA.label : doc.optionB.label;
      playSound('success');
      return {
        ...prev,
        faith: prev.faith - cost.faith,
        fervor: prev.fervor - cost.fervor,
        doctrines: updatedDoctrines,
        countries: updatedCountries,
        logs: [`[DOUTRINA] "${doc.topic}" definida: ${chosenLabel} — um pilar do credo firmado para sempre.`, ...prev.logs]
      };
    });
  };

  // Action callback 1: Send missionaries to speed up conversion
  const sendMissionary = (countryId: string) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj) return;

    let cost = 30;
    if (countryObj.id === 'japan') cost += 15;
    if (countryObj.id === 'china') cost += 20;
    if (countryObj.id === 'saudi_arabia') cost += 25;
    // Doctrine modifiers on missionary cost
    if (state.doctrines?.find(d => d.id === 'doc_ritual')?.chosen === 'A') cost += 10;
    if (state.doctrines?.find(d => d.id === 'doc_ritual')?.chosen === 'B') cost = Math.max(5, cost - 10);
    if (state.doctrines?.find(d => d.id === 'doc_organization')?.chosen === 'B') cost = Math.round(cost * 0.9);
    if (state.doctrines?.find(d => d.id === 'doc_leadership')?.chosen === 'B') cost = Math.round(cost * 0.85);
    if (state.doctrines?.find(d => d.id === 'doc_education')?.chosen === 'B') cost = Math.max(5, cost - 10);

    if (state.faith < cost) return;

    // Trigger visual floating text feedback on country coordinates
    addFloatingText(`-${cost} Fé`, countryObj.coordinates.x, countryObj.coordinates.y, "text-red-500 font-bold font-mono", countryObj.id);
    addFloatingText("+Presença!", countryObj.coordinates.x, countryObj.coordinates.y - 5, "text-[#cfb53b] font-bold font-mono", countryObj.id);

    setState((prev) => {
      const country = prev.countries.find((c) => c.id === countryId);
      if (!country) return prev;

      const updated = prev.countries.map((c) => {
        if (c.id === countryId) {
          const sent = c.missionariesSent;
          // Missionaries establish presence, not mass conversion — temples do the converting
          let seedConverts: number;
          if (sent === 0) seedConverts = 50;        // 1st: initial contact
          else if (sent === 1) seedConverts = 200;  // 2nd: small cell formed
          else if (sent === 2) seedConverts = 500;  // 3rd: organized group
          else seedConverts = 1000;                 // 4th+: network between cities
          const newConverts = Math.min(c.population, c.converts + seedConverts);
          // No resistance drop from missionaries — temples reduce resistance
          return { ...c, converts: newConverts, missionariesSent: c.missionariesSent + 1 };
        }
        return c;
      });

      playSound('click');
      return {
        ...prev,
        faith: prev.faith - cost,
        countries: updated,
        logs: [`[AÇÃO] Missionários desembarcam em ${country.name}. Semeação espiritual intensificada!`, ...prev.logs]
      };
    });
  };

  // Action callback 2: Pacify Country (reduce violence) — 3 tiers based on violence level
  const pacifyCountry = (countryId: string, tier: 1 | 2 | 3) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj || countryObj.converts === 0) return;

    const costs = { 1: { faith: 15, fervor: 0 }, 2: { faith: 25, fervor: 5 }, 3: { faith: 40, fervor: 15 } };
    const effects = { 1: { violence: -8, resistance: 0 }, 2: { violence: -20, resistance: -5 }, 3: { violence: -35, resistance: 5 } };
    const labels = { 1: 'Pregação de Paz', 2: 'Mobilização Comunitária', 3: 'Intervenção de Emergência' };

    const cost = costs[tier];
    const effect = effects[tier];
    if (state.faith < cost.faith || state.fervor < cost.fervor) return;

    addFloatingText(`-${cost.faith} Fé`, countryObj.coordinates.x, countryObj.coordinates.y, 'text-red-500 font-bold font-mono', countryObj.id);
    addFloatingText('Pacificado!', countryObj.coordinates.x, countryObj.coordinates.y - 5, 'text-green-500 font-bold font-mono', countryObj.id);

    setState((prev) => {
      const country = prev.countries.find((c) => c.id === countryId);
      if (!country) return prev;

      const updated = prev.countries.map((c) => {
        if (c.id === countryId) {
          return {
            ...c,
            violence: Math.max(0, c.violence + effect.violence),
            resistance: Math.min(100, Math.max(0, c.resistance + effect.resistance)),
          };
        }
        return c;
      });

      const logMsg = tier === 3
        ? `[INTERVENÇÃO] ${labels[tier]} em ${country.name} — violência cede, mas o governo observa com desconfiança.`
        : `[AÇÃO] ${labels[tier]} em ${country.name} — comunidades respondem ao chamado de paz.`;

      playSound('click');
      return {
        ...prev,
        faith: prev.faith - cost.faith,
        fervor: prev.fervor - cost.fervor,
        countries: updated,
        logs: [logMsg, ...prev.logs]
      };
    });
  };

  // Action callback 3: Infiltrate Country Leader
  const infiltrateLeader = (countryId: string) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj) return;

    // Custo escalado por resistência e regime
    const baseResistance = countryObj.resistance;
    let baseFaith = Math.round(30 + Math.max(0, baseResistance - 30) * 0.8);
    let baseFervor = Math.round(10 + Math.max(0, baseResistance - 30) * 0.3);
    if (['opressor', 'teocracia'].includes(countryObj.regimeType)) {
      baseFaith = Math.round(baseFaith * 1.5);
      baseFervor = Math.round(baseFervor * 1.5);
    }
    // Mais barato quando já está quase convertido (> 50%)
    if (countryObj.leaderInfiltration > 50) {
      baseFaith = Math.round(baseFaith * 0.7);
      baseFervor = Math.round(baseFervor * 0.7);
    }

    // Rússia convertida: infiltrações globais 20% mais baratas
    const russiaLeaderActive = state.countries.find(c => c.id === 'russia')?.leaderInfiltration >= 100;
    if (russiaLeaderActive) { baseFaith = Math.round(baseFaith * 0.8); baseFervor = Math.round(baseFervor * 0.8); }

    // Grande Julgamento: -50% custo globalmente
    const hasGrandeJulgamento = state.dogmas.some(d => d.id === 'reforma_escatologica' && d.purchased);
    if (hasGrandeJulgamento) { baseFaith = Math.floor(baseFaith * 0.5); baseFervor = Math.floor(baseFervor * 0.5); }

    // Vidente das Nações: -25% custo em opressores/autoritários
    const hasVidenteNacoesActive = state.dogmas.some(d => d.id === 'vidente_nacoes' && d.purchased);
    if (hasVidenteNacoesActive && ['opressor', 'autoritario'].includes(countryObj.regimeType)) {
      baseFaith = Math.floor(baseFaith * 0.75);
    }

    if (state.faith < baseFaith || state.fervor < baseFervor) return;

    // Contra-inteligência: chance de ser detectado baseada na resistência
    const isHardRegime = ['opressor', 'teocracia'].includes(countryObj.regimeType);
    let counterIntelChance = 0;
    if (baseResistance > 60) counterIntelChance = 0.30;
    else if (baseResistance > 40) counterIntelChance = 0.15;

    if (Math.random() < counterIntelChance) {
      const faithPenalty = Math.max(5, Math.floor(baseFaith * 0.3));
      addFloatingText('DETECTADO!', countryObj.coordinates.x, countryObj.coordinates.y, 'text-red-500 font-bold font-mono', countryObj.id);
      addFloatingText(`-${faithPenalty} Fé`, countryObj.coordinates.x, countryObj.coordinates.y + 5, 'text-red-400 font-bold font-mono', countryObj.id);
      setState(prev => ({
        ...prev,
        faith: prev.faith - faithPenalty,
        fervor: prev.fervor + (isHardRegime ? 20 : 0),
        countries: prev.countries.map(c => c.id === countryId
          ? { ...c, resistance: Math.min(100, c.resistance + 10) }
          : c),
        logs: [
          `[CONTRA-INTELIGÊNCIA] Agentes em ${countryObj.name} detectaram a operação! Resistência sobe +10.${isHardRegime ? ' Perseguição gera +20 Fervor.' : ''}`,
          ...prev.logs
        ]
      }));
      return;
    }

    // Trigger visual floating text feedback on country coordinates
    addFloatingText(`-${baseFaith} Fé`, countryObj.coordinates.x, countryObj.coordinates.y, "text-red-500 font-bold font-mono", countryObj.id);
    addFloatingText(`-${baseFervor} Fervor`, countryObj.coordinates.x + 3, countryObj.coordinates.y + 3, "text-red-400 font-bold font-mono", countryObj.id);
    addFloatingText("+Infiltração", countryObj.coordinates.x, countryObj.coordinates.y - 5, "text-sky-400 font-bold font-mono", countryObj.id);

    setState((prev) => {
      const country = prev.countries.find((c) => c.id === countryId);
      if (!country) return prev;

      const isLobbyActive = prev.dogmas.some((d) => d.id === 'lobby_politico' && d.purchased);
      let infiltrationGain = 20;
      if (isLobbyActive) infiltrationGain = 40; // Double speed due to Lobby

      const updated = prev.countries.map((c) => {
        if (c.id === countryId) {
          const nextVal = Math.min(100, c.leaderInfiltration + infiltrationGain);
          return { ...c, leaderInfiltration: nextVal };
        }
        return c;
      });

      const leaderConverted = (updated.find(c => c.id === countryId)?.leaderInfiltration || 0) >= 100;

      playSound('click');
      const messages = [...prev.logs];
      messages.unshift(`[INFILTRAÇÃO] Encontros secretos convertem parte do círculo interno do governante de ${country.name}.`);
      if (leaderConverted) {
         playSound('success');
         messages.unshift(`[LÍDER CONVERTIDO] ${country.leaderName} foi completamente ILUMINADO! Um bônus passivo permanente foi ativado.`);
      }

      return {
        ...prev,
        faith: prev.faith - baseFaith,
        fervor: prev.fervor - baseFervor,
        countries: updated,
        logs: messages
      };
    });
  };

  // Action callback 4: Perform Ecstasy Ritual (Unique to Mística)
  const performEcstasyRitual = (countryId: string) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj || state.faith < 50 || state.fervor < 10) return;

    // Trigger visual floating text feedback on country coordinates
    addFloatingText("-50 Fé", countryObj.coordinates.x, countryObj.coordinates.y, "text-red-500 font-bold font-mono", countryObj.id);
    addFloatingText("-10 Fervor", countryObj.coordinates.x + 3, countryObj.coordinates.y + 3, "text-red-400/80 font-bold font-mono", countryObj.id);
    addFloatingText("+15 Fervor Extra!", countryObj.coordinates.x, countryObj.coordinates.y - 10, "text-green-400 font-mono", countryObj.id);
    addFloatingText("RITUAL DE ÊXTASE", countryObj.coordinates.x, countryObj.coordinates.y - 5, "text-[#cfb53b] font-bold tracking-wider font-serif", countryObj.id);

    setState((prev) => {
      const country = prev.countries.find((c) => c.id === countryId);
      if (!country) return prev;

      const updated = prev.countries.map((c) => {
        if (c.id === countryId) {
          // instant converts
          const addedConverts = Math.floor(c.population * 0.12);
          return {
            ...c,
            converts: Math.min(c.population, c.converts + addedConverts),
            resistance: Math.max(0, c.resistance - 10)
          };
        }
        return c;
      });

      playSound('success');
      return {
        ...prev,
        faith: prev.faith - 50,
        fervor: prev.fervor - 10 + 15, // generates fervor
        countries: updated,
        logs: [`[RITUAL] Cânticos transcendentais atraem arrebatamento massivo em ${country.name}! +15 Fervor extra gerado!`, ...prev.logs]
      };
    });
  };

  // Action callback 5: Open Temple in a country
  const openTemple = (countryId: string) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj) return;

    const nextLevel = countryObj.templeLevel + 1;
    if (nextLevel > 4) return;

    const cost = TEMPLE_COSTS[nextLevel - 1];
    if (state.faith < cost.faith || state.fervor < cost.fervor) return;

    const templeName = TEMPLE_NAMES[state.religionTrait]?.[nextLevel - 1] ?? 'Templo';

    addFloatingText(`🏛️ ${templeName}!`, countryObj.coordinates.x, countryObj.coordinates.y - 8, 'text-[#cfb53b] font-bold font-serif', countryObj.id);
    addFloatingText(`-${cost.faith} Fé`, countryObj.coordinates.x, countryObj.coordinates.y, 'text-red-500 font-bold font-mono', countryObj.id);

    setState((prev) => {
      const newTotalTemples = prev.totalTemples + 1;
      const updatedCountries = prev.countries.map((c) =>
        c.id === countryId ? { ...c, templeLevel: nextLevel } : c
      );

      const logs = [...prev.logs];
      logs.unshift(`[TEMPLO] Uma ${templeName} foi erguida em ${countryObj.name}! A fé se materializa em pedra e doutrina.`);

      const milestoneMsg = TEMPLE_MILESTONE_MESSAGES[newTotalTemples];
      if (milestoneMsg) {
        logs.unshift(`[MARCO SAGRADO] ${milestoneMsg}`);
        playSound('success');
      } else {
        playSound('click');
      }

      return {
        ...prev,
        faith: prev.faith - cost.faith,
        fervor: prev.fervor - cost.fervor,
        totalTemples: newTotalTemples,
        countries: updatedCountries,
        logs: logs.slice(0, 20),
      };
    });
  };

  // Dogma upgrade purchaser callback
  const purchaseDogma = (dogmaId: string) => {
    setState((prev) => {
      const targetDogma = prev.dogmas.find((d) => d.id === dogmaId);
      if (!targetDogma || targetDogma.purchased) return prev;

      if (prev.faith < targetDogma.costFaith || prev.fervor < targetDogma.costFervor) return prev;

      // Update countries resistance directly if buying specific resistance reducing dogmas
      const updatedCountries = prev.countries.map((c) => {
        let resistance = c.resistance;
        let violence = c.violence;
        if (dogmaId === 'templos_sociais') {
          resistance = Math.max(0, resistance - 10);
        }
        if (dogmaId === 'alianca_universal') {
          return { ...c, leaderInfiltration: Math.min(100, c.leaderInfiltration + 20) };
        }
        if (dogmaId === 'reconciliacao_nações') {
          return { ...c, violence: Math.min(10, c.violence), resistance: Math.max(0, resistance - 15) };
        }
        if (dogmaId === 'mercados_partilha') {
          resistance = Math.max(0, resistance - 5);
        }
        if (dogmaId === 'arca_alianca_profetica') {
          resistance = Math.max(0, resistance - 20);
          violence = Math.min(100, violence + 5);
        }
        return { ...c, resistance, violence };
      });

      // Update list
      const updatedDogmas = prev.dogmas.map((d) => {
        if (d.id === dogmaId) {
          return { ...d, purchased: true };
        }
        return d;
      });

      playSound('success');
      return {
        ...prev,
        faith: prev.faith - targetDogma.costFaith,
        fervor: prev.fervor - targetDogma.costFervor,
        dogmas: updatedDogmas,
        countries: updatedCountries,
        logs: [`[DOGMA REVELADO] Consagrado dogma: "${targetDogma.name}". Novas bênçãos decretadas!`, ...prev.logs]
      };
    });
  };

  if (!state.started) {
    return <CreationScreen onStart={handleStartGame} />;
  }

  // Formatting helpers
  const totalWorldPopulation = state.countries.reduce((acc, curr) => acc + curr.population, 0);
  const totalConvertedWorld = state.countries.reduce((acc, curr) => acc + curr.converts, 0);
  const avgProgress = (totalConvertedWorld / totalWorldPopulation) * 100;

  const traitNames: Record<ReligionTrait, string> = {
    Mistical: 'Mística',
    Prophetic: 'Profética',
    Activist: 'Ativista',
    Syncretist: 'Sincretista'
  };

  const goalNames: Record<VictoryGoalType, string> = {
    GlobalEcstasy: 'Êxtase Global (80% humanidade)',
    PerpetualPeace: 'Paz Perpétua (Violência < 20%)',
    OneFlock: 'Um Só Rebanho (Burocracia de 4 Superpotências)',
    TheEnlightened: 'O Iluminado (Todos os 12 líderes)'
  };

  return (
    <div className="min-h-screen bg-[#1e1a0c] text-[#dfcfa0] font-sans flex flex-col justify-between" id="game-app-instance">
      
      {/* 1. STATUS HEADER */}
      <header className="bg-[#171308] border-b-2 border-[#cfb53b] px-4 py-3 md:px-6 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Religion Identification */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#cfb53b] text-[#1e1a0c] rounded-lg">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-serif text-[#cfb53b] uppercase tracking-wide">
                  {state.religionName}
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-950 text-[#cfb53b] font-bold border border-[#cfb53b]/30 rounded">
                  {traitNames[state.religionTrait]}
                </span>
              </div>
              <p className="text-xs text-[#dfcfa0]/60 mt-0.5 flex items-center gap-1">
                <Info className="w-3 h-3 text-[#cfb53b]" /> Objetivo: <strong className="text-amber-100">{goalNames[state.victoryGoal]}</strong>
              </p>
            </div>
          </div>

          {/* Resources Status Display (Golden Faith, Crimson Fervor) */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            
            {/* Faithful Counter */}
            <div className="bg-[#1a2010] border border-green-900/50 rounded-lg py-1 px-3 flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              <div>
                <span className="text-[9px] uppercase font-mono text-[#dfcfa0]/50 block">Fiéis no Mundo</span>
                <span className="text-md font-bold font-mono text-green-400">{totalConvertedWorld.toLocaleString()}</span>
              </div>
            </div>

            {/* Faith Indicator */}
            <div className="bg-[#241e0d] border border-[#cfb53b]/40 rounded-lg py-1 px-3 flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#cfb53b] shadow-[0_0_8px_#cfb53b]" />
              <div>
                <span className="text-[9px] uppercase font-mono text-[#dfcfa0]/50 block">Poder de Fé</span>
                <span className="text-md font-bold font-mono text-[#cfb53b]">{state.faith}</span>
              </div>
            </div>

            {/* Fervor Indicator */}
            <div className="bg-[#241a1a] border border-red-900/40 rounded-lg py-1 px-3 flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_#8b0000]" />
              <div>
                <span className="text-[9px] uppercase font-mono text-xs text-red-400 block pb-0">Poder de Fervor</span>
                <span className="text-md font-bold font-mono text-red-400">{state.fervor}</span>
              </div>
            </div>

            {/* Time cycle controls & play buttons */}
            <div className="flex items-center gap-2 border-l border-[#cfb53b]/20 pl-4 md:pl-6">
              
              <div className="flex flex-col text-right pr-2 mr-1">
                <span className="text-[9px] uppercase font-mono text-zinc-500">Ciclo</span>
                <span className="text-sm font-bold font-mono font-serif text-amber-100">#{state.cycle}</span>
              </div>

              {/* Pause/Play Toggle */}
              <button
                onClick={() => { playSound('click'); setState(p => ({ ...p, paused: !p.paused })); }}
                className={`p-2 rounded cursor-pointer border transition-colors ${
                  state.paused 
                    ? 'bg-amber-950/40 border-[#cfb53b]/40 text-[#cfb53b] hover:bg-[#cfb53b]/10' 
                    : 'bg-[#cfb53b] border-amber-600 text-[#1e1a0c] hover:bg-[#e6ca4a]'
                }`}
                title={state.paused ? 'Despausar jogo' : 'Pausar jogo'}
                id="play-pause-btn"
              >
                {state.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              {/* Speeds 1x, 2x, 3x */}
              <div className="flex h-8 bg-[#120f05] rounded border border-[#cfb53b]/20 overflow-hidden text-xs">
                {([1, 2, 3] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { playSound('click'); setState(p => ({ ...p, gameSpeed: s })); }}
                    className={`px-2.5 font-bold cursor-pointer transition-colors ${
                      state.gameSpeed === s
                        ? 'bg-[#cfb53b] text-[#1e1a0c]'
                        : 'text-[#dfcfa0]/75 hover:bg-neutral-900'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Reset Game Button */}
              <button
                onClick={handleResetGame}
                className="p-2 rounded bg-red-950/20 hover:bg-red-950 border border-[#8b0000] text-red-400 cursor-pointer transition-all ml-1"
                title="Zerar e reiniciar criação"
                id="reset-game-btn"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Sound preference Toggle button */}
              <button
                onClick={() => {
                  const targetMute = !isMuted;
                  setIsMuted(targetMute);
                  if (!targetMute) {
                    // Play a quick visual cue sound immediately so the user knows they unmuted!
                    setTimeout(() => {
                      try {
                        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
                        osc.start();
                        osc.stop(audioCtx.currentTime + 0.1);
                      } catch(_) {}
                    }, 50);
                  }
                }}
                className={`p-2 rounded cursor-pointer border transition-colors ${
                  isMuted 
                    ? 'bg-[#1a1308] border-neutral-700 text-[#8b6b15] hover:text-[#cfb53b]' 
                    : 'bg-amber-950/20 border-[#cfb53b]/40 text-[#cfb53b] hover:bg-[#cfb53b]/10'
                }`}
                title={isMuted ? 'Ativar Efeitos Sonoros' : 'Mutar Efeitos Sonoros'}
                id="mute-toggle-btn"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Dynamic News Ticker Tape */}
      <div className="bg-black/95 border-b border-[#cfb53b]/20 py-1.5 px-4 overflow-hidden select-none relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-red-500 animate-pulse bg-red-950/40 px-2 py-0.5 border border-red-900/30 rounded shrink-0">
              ● TRANSMISSÃO GLOBAL
            </span>
            <div className="text-[11px] font-mono text-[#dfcfa0]/95 font-semibold tracking-wide truncate">
              {newsText}
            </div>
          </div>
          <span className="text-[9px] font-mono text-[#cfb53b]/50 uppercase shrink-0 tracking-widest hidden sm:inline">
            Status: Sincronizado
          </span>
        </div>
      </div>

      {/* 2. MAIN HUB WINDOWS AND NAVIGATION */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 relative z-10 overflow-y-auto">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#cfb53b]/30 gap-1 overflow-x-auto select-none">
          <button
            onClick={() => { playSound('click'); setActiveTab('map'); }}
            className={`px-4 py-2.5 font-serif font-bold text-sm uppercase tracking-wider rounded-t-lg border-t-2 border-x transition-all shrink-0 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-[#211a0a] border-t-[#cfb53b] border-x-[#cfb53b]/40 text-[#cfb53b]'
                : 'bg-[#141108]/60 border-t-transparent border-x-transparent text-[#dfcfa0]/60 hover:text-white'
            }`}
          >
            🗺️ Mapa-Múndi
          </button>
          
          <button
            onClick={() => { playSound('click'); setActiveTab('dogmas'); }}
            className={`px-4 py-2.5 font-serif font-bold text-sm uppercase tracking-wider rounded-t-lg border-t-2 border-x transition-all shrink-0 cursor-pointer ${
              activeTab === 'dogmas'
                ? 'bg-[#211a0a] border-t-[#cfb53b] border-x-[#cfb53b]/40 text-[#cfb53b]'
                : 'bg-[#141108]/60 border-t-transparent border-x-transparent text-[#dfcfa0]/60 hover:text-white'
            }`}
          >
            📜 Evolução de Dogmas
          </button>

          <button
            onClick={() => { playSound('click'); setActiveTab('leaders'); }}
            className={`px-4 py-2.5 font-serif font-bold text-sm uppercase tracking-wider rounded-t-lg border-t-2 border-x transition-all shrink-0 cursor-pointer ${
              activeTab === 'leaders'
                ? 'bg-[#211a0a] border-t-[#cfb53b] border-x-[#cfb53b]/40 text-[#cfb53b]'
                : 'bg-[#141108]/60 border-t-transparent border-x-transparent text-[#dfcfa0]/60 hover:text-white'
            }`}
          >
            👑 Círculos de Poder
          </button>

          <button
            onClick={() => { playSound('click'); setActiveTab('rival'); }}
            className={`px-4 py-2.5 font-serif font-bold text-sm uppercase tracking-wider rounded-t-lg border-t-2 border-x transition-all shrink-0 cursor-pointer relative ${
              activeTab === 'rival'
                ? 'bg-[#211a0a] border-t-[#cfb53b] border-x-[#cfb53b]/40 text-[#cfb53b]'
                : 'bg-[#141108]/60 border-t-transparent border-x-transparent text-[#dfcfa0]/60 hover:text-white'
            }`}
          >
            👹 Adversário e Métricas
            {state.rivalProgress > 75 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => { playSound('click'); setActiveTab('faith'); }}
            className={`px-4 py-2.5 font-serif font-bold text-sm uppercase tracking-wider rounded-t-lg border-t-2 border-x transition-all shrink-0 cursor-pointer ${
              activeTab === 'faith'
                ? 'bg-[#211a0a] border-t-[#cfb53b] border-x-[#cfb53b]/40 text-[#cfb53b]'
                : 'bg-[#141108]/60 border-t-transparent border-x-transparent text-[#dfcfa0]/60 hover:text-white'
            }`}
          >
            ✨ Sua Fé
          </button>

          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="ml-auto px-3 py-1 bg-amber-950/30 hover:bg-amber-950 border border-[#cfb53b]/30 text-xs font-serif text-amber-200 uppercase tracking-widest rounded transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#cfb53b]" /> {showTutorial ? 'Fechar Guia' : 'Guia de Jogo'}
          </button>
        </div>

        {/* Global Pause Alert */}
        {state.paused && !state.isGameOver && (
          <div className="bg-[#cfb53b]/10 border border-[#cfb53b]/30 text-[#cfb53b] px-4 py-2 rounded text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-4 h-4 text-[#cfb53b]" /> O tempo está pausado. Seus crentes pararam o proselitismo temporariamente. Clique no botão de play no cabeçalho para continuar!
            </span>
            <button
              onClick={() => setState(p => ({ ...p, paused: false }))}
              className="px-2 py-0.5 bg-[#cfb53b] text-[#1e1a0c] font-bold uppercase text-[10px] rounded cursor-pointer"
            >
              Continuar tempo
            </button>
          </div>
        )}

        {/* Game Tutorial Manual Box */}
        {showTutorial && (
          <div className="bg-[#1c1809] border-2 border-[#cfb53b]/40 rounded-lg p-5 relative overflow-hidden text-xs leading-relaxed">
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute top-3 right-3 text-sm text-[#cfb53b] hover:text-white cursor-pointer font-bold"
            >
              x
            </button>
            <h3 className="text-base font-bold font-serif text-[#cfb53b] uppercase tracking-wider mb-2">
              Manual Prático Teológico de Credo Inc.
            </h3>
            <p className="text-[#dfcfa0]/80 mb-3">
              Como criador do credo religioso original, você luta por mentes e corações antes que a hostilidade global feche suas linhas teológicas ou a Ordem Tecnocrática convença o planeta de que tudo é matéria inorgânica.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-2">
              <div className="bg-[#120f05] border border-[#cfb53b]/15 p-3 rounded">
                <h4 className="font-bold text-[#cfb53b] uppercase tracking-wide">Moedas e Fontes</h4>
                <p className="text-[11px] text-[#dfcfa0]/75 mt-1 leading-normal">
                  - <strong>Fé</strong>: Moeda ativa primária. Gasta enviando missionários, ajudas de pacificação social e conversões políticas.<br />
                  - <strong>Fervor</strong>: Moeda base militar/defensiva. Gasta em dogmas avançados de combate político e infiltração mental. Gerada quando governos hostis colocam barreiras.
                </p>
              </div>

              <div className="bg-[#120f05] border border-[#cfb53b]/15 p-3 rounded">
                <h4 className="font-bold text-[#cfb53b] uppercase tracking-wide">Tipos de Doutrina</h4>
                <p className="text-[11px] text-[#dfcfa0]/75 mt-1 leading-normal">
                  - <strong>Mística</strong>: Perfeita para eventos. Libera o Ritual de Êxtase Coletivo.<br />
                  - <strong>Profética</strong>: Seitas ganham bônus maciços silenciosos (+50%) de conversão em eventos catastróficos e crises mundiais.<br />
                  - <strong>Ativista</strong>: Domina regimes opressores rapidamente, porém sofre nas democracias consolidadas.<br />
                  - <strong>Sincretista</strong>: Evolução lenta adaptável. Nenhum país conseguirá ultrapassar 60% de resistência.
                </p>
              </div>

              <div className="bg-[#120f05] border border-[#cfb53b]/15 p-3 rounded">
                <h4 className="font-bold text-[#cfb53b] uppercase tracking-wide">Ações de Conversão</h4>
                <p className="text-[11px] text-[#dfcfa0]/75 mt-1 leading-normal">
                  - <strong>Missões</strong>: Semeia seguidores iniciais e reconforta os já devotos.<br />
                  - <strong>Pacificar</strong>: Essencial para o objetivo "Paz Perpétua" ao reduzir a agressividade comunitária.<br />
                  - <strong>Líderes</strong>: Dá vantagens massivas permanentes do país inteiro se iluminar o seu governante.
                </p>
              </div>

              <div className="bg-[#120f05] border border-[#cfb53b]/15 p-3 rounded">
                <h4 className="font-bold text-[#cfb53b] uppercase tracking-wide">Como Vencer e Perder</h4>
                <p className="text-[11px] text-[#dfcfa0]/75 mt-1 leading-normal">
                  - <strong>Vitória</strong>: Conclua os critérios exatos descritos no seu objetivo principal.<br />
                  - <strong>Derrota</strong>: Resistência Média Global persistir acima de 85% por mais de 3 ciclos, frentes concorrentes dominarem o planeta (Rival 100%), ou se você ficar sem fundos e seguidores ativos completamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab content rendering */}
        <div className="bg-[#211a0a] border border-[#cfb53b]/30 p-4 md:p-6 rounded-lg relative overflow-hidden">
          
          {activeTab === 'map' && (
            <WorldMap
              countries={state.countries}
              selectedCountryId={state.selectedCountryId}
              onSelectCountry={(id) => setState(p => ({ ...p, selectedCountryId: id }))}
              faith={state.faith}
              fervor={state.fervor}
              trait={state.religionTrait}
              onSendMissionary={sendMissionary}
              onPacifyCountry={pacifyCountry}
              onInfiltrateLeader={infiltrateLeader}
              onPerformEcstasyRitual={performEcstasyRitual}
              onOpenTemple={openTemple}
              totalTemples={state.totalTemples}
              templeCosts={TEMPLE_COSTS}
              templeNames={TEMPLE_NAMES}
              floatingTexts={floatingTexts}
            />
          )}

          {activeTab === 'dogmas' && (
            <DogmasPanel
              dogmas={state.dogmas}
              faith={state.faith}
              fervor={state.fervor}
              trait={state.religionTrait}
              onPurchaseDogma={purchaseDogma}
            />
          )}

          {activeTab === 'leaders' && (
            <LeadersPanel
              countries={state.countries}
              faith={state.faith}
              fervor={state.fervor}
              hasGrandeJulgamento={state.dogmas.some(d => d.id === 'reforma_escatologica' && d.purchased)}
              hasVidenteNacoes={state.dogmas.some(d => d.id === 'vidente_nacoes' && d.purchased)}
              russiaConverted={(state.countries.find(c => c.id === 'russia')?.leaderInfiltration ?? 0) >= 100}
              onInfiltrateLeader={infiltrateLeader}
            />
          )}

          {activeTab === 'rival' && (
            <RivalPanel
              countries={state.countries}
              rivalName={state.rivalName}
              rivalProgress={state.rivalProgress}
              victoryGoal={state.victoryGoal}
              resistanceStreak={state.resistanceStreak}
            />
          )}

          {activeTab === 'faith' && (() => {
            const totalMissionaries = state.countries.reduce((a, c) => a + (c.missionariesSent ?? 0), 0);
            const totalLeaders = state.countries.filter(c => c.leaderInfiltration >= 100).length;
            const totalTemplesList = state.countries.filter(c => (c.templeLevel ?? 0) > 0);
            const activeDogmas = state.dogmas.filter(d => d.purchased);
            const convPct = totalWorldPopulation > 0 ? (totalConvertedWorld / totalWorldPopulation * 100) : 0;
            const avgViolence = state.countries.reduce((a, c) => a + c.violence, 0) / state.countries.length;
            const avgResistance = state.countries.reduce((a, c) => a + c.resistance, 0) / state.countries.length;
            const traitDescriptions: Record<string, string> = {
              Mistical: 'Sua fé é mística e transcendente. Rituais de êxtase, visões e experiências espirituais profundas formam o núcleo da doutrina.',
              Prophetic: 'Sua fé é profética e apocalíptica. Revelações, sinais dos tempos e a urgência do fim dos dias impulsionam a conversão.',
              Activist: 'Sua fé é ativista e transformadora. Justiça social, libertação dos oprimidos e confronto direto com o poder são seus pilares.',
              Syncretist: 'Sua fé é sincretista e inclusiva. A harmonia entre tradições, o diálogo inter-religioso e a coexistência são sua marca.',
            };
            return (
              <div className="flex flex-col gap-6" id="faith-panel">
                {/* Header identidade */}
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 bg-[#241e0d] border border-[#cfb53b]/30 rounded-lg p-5">
                    <span className="text-[9px] uppercase font-mono text-[#dfcfa0]/50 tracking-widest">Seu Credo</span>
                    <h2 className="text-3xl font-bold font-serif text-[#cfb53b] mt-1">{state.religionName}</h2>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-amber-950 border border-[#cfb53b]/30 text-[#cfb53b] text-[10px] font-bold uppercase font-mono rounded">
                      {traitNames[state.religionTrait]}
                    </span>
                    <p className="text-xs text-[#dfcfa0]/70 mt-3 leading-relaxed italic">
                      {traitDescriptions[state.religionTrait]}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="bg-[#171308] border border-[#cfb53b]/15 rounded p-3">
                      <span className="text-[9px] uppercase font-mono text-[#dfcfa0]/50 block">Objetivo</span>
                      <span className="text-xs font-bold text-amber-200 mt-0.5 block">{goalNames[state.victoryGoal]}</span>
                    </div>
                    <div className="bg-[#171308] border border-[#cfb53b]/15 rounded p-3">
                      <span className="text-[9px] uppercase font-mono text-[#dfcfa0]/50 block">Ciclos de Existência</span>
                      <span className="text-2xl font-bold font-mono text-[#cfb53b]">#{state.cycle}</span>
                    </div>
                  </div>
                </div>

                {/* Barra de progresso global */}
                <div className="bg-[#171308] border border-[#cfb53b]/20 rounded-lg p-4">
                  <div className="flex justify-between items-center text-xs font-mono font-bold mb-2">
                    <span className="text-green-400">🌍 Alcance Global da Fé</span>
                    <span className="text-green-300">{totalConvertedWorld.toLocaleString()} fiéis — {convPct.toFixed(3)}% da humanidade</span>
                  </div>
                  <div className="w-full h-3 bg-black/60 rounded border border-green-900/30 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-800 to-green-500 transition-all duration-500" style={{ width: `${Math.min(100, convPct)}%` }} />
                  </div>
                </div>

                {/* Grade de estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Missionários Enviados', value: totalMissionaries, color: 'text-[#cfb53b]' },
                    { label: 'Líderes Convertidos', value: `${totalLeaders} / 12`, color: 'text-sky-400' },
                    { label: 'Templos Erguidos', value: state.totalTemples, color: 'text-green-400' },
                    { label: 'Dogmas Consagrados', value: `${activeDogmas.length} / ${state.dogmas.length}`, color: 'text-amber-300' },
                    { label: 'Poder de Fé', value: state.faith, color: 'text-[#cfb53b]' },
                    { label: 'Poder de Fervor', value: state.fervor, color: 'text-red-400' },
                    { label: 'Resistência Média', value: `${avgResistance.toFixed(1)}%`, color: 'text-[#8b0000]' },
                    { label: 'Violência Média', value: `${avgViolence.toFixed(1)}%`, color: 'text-orange-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#171308] border border-[#cfb53b]/10 rounded p-3">
                      <span className="text-[9px] uppercase font-mono text-[#dfcfa0]/45 block">{label}</span>
                      <span className={`text-xl font-bold font-mono ${color} block mt-0.5`}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Países com templo */}
                {totalTemplesList.length > 0 && (
                  <div className="bg-[#171308] border border-[#cfb53b]/15 rounded-lg p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#cfb53b] mb-3 font-serif">🏛️ Templos no Mundo</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                      {totalTemplesList.map(c => {
                        const templeName = TEMPLE_NAMES[state.religionTrait]?.[c.templeLevel - 1] ?? 'Templo';
                        return (
                          <div key={c.id} className="bg-black/30 rounded px-2 py-1.5 border border-[#cfb53b]/10">
                            <span className="text-[9px] font-mono text-[#dfcfa0]/50 block">{c.name}</span>
                            <span className="text-[10px] font-bold text-[#cfb53b]">{templeName}</span>
                            <span className="text-[9px] text-[#dfcfa0]/40 block">Nível {c.templeLevel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dogmas ativos */}
                {activeDogmas.length > 0 && (
                  <div className="bg-[#171308] border border-[#cfb53b]/15 rounded-lg p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#cfb53b] mb-3 font-serif">📜 Dogmas Revelados</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeDogmas.map(d => (
                        <span key={d.id} className="text-[10px] px-2 py-1 bg-amber-950/50 border border-[#cfb53b]/20 text-amber-200 rounded font-mono">
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posições Doutrinárias */}
                {(() => {
                  const doctrines = state.doctrines ?? [];
                  const costMap = { basic: { faith: 150, fervor: 30 }, intermediate: { faith: 250, fervor: 60 }, strategic: { faith: 400, fervor: 100 } };
                  const tierLabel = { basic: 'Básica', intermediate: 'Intermediária', strategic: 'Estratégica' };
                  const tierBg = { basic: 'border-amber-700/25 bg-amber-950/10', intermediate: 'border-orange-700/25 bg-orange-950/10', strategic: 'border-red-800/25 bg-red-950/10' };
                  const tierTag = { basic: 'text-amber-400 border-amber-700/40', intermediate: 'text-orange-400 border-orange-700/40', strategic: 'text-red-400 border-red-700/40' };
                  const universalDocs = doctrines.filter(d => d.section === 'universal');
                  const socialDocs = doctrines.filter(d => d.section === 'social');

                  const renderDoc = (doc: DoctrineChoice) => {
                    const cost = costMap[doc.tier];
                    const canAfford = state.faith >= cost.faith && state.fervor >= cost.fervor;
                    const chosen = doc.chosen;
                    return (
                      <div key={doc.id} className={`rounded-lg border p-3 ${chosen ? 'border-[#cfb53b]/35 bg-[#1a1508]' : tierBg[doc.tier]}`}>
                        <div className="flex justify-between items-start mb-2 gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-[#cfb53b] font-serif leading-tight">{doc.topic}</span>
                          {chosen
                            ? <span className="text-[8px] font-mono text-[#cfb53b]/50 uppercase shrink-0">Definida</span>
                            : <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${tierTag[doc.tier]}`}>{tierLabel[doc.tier]} · {cost.faith}Fé {cost.fervor}Ferv</span>
                          }
                        </div>
                        {chosen ? (
                          <div className="text-[9px] px-2 py-1.5 bg-[#cfb53b]/10 border border-[#cfb53b]/25 rounded">
                            <span className="font-bold text-[#cfb53b]">✓ {chosen === 'A' ? doc.optionA.label : doc.optionB.label}</span>
                            <span className="block text-[#dfcfa0]/50 mt-0.5">{chosen === 'A' ? doc.optionA.effectDesc : doc.optionB.effectDesc}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {(['A', 'B'] as const).map(opt => {
                              const option = opt === 'A' ? doc.optionA : doc.optionB;
                              return (
                                <button key={opt} onClick={() => purchaseDoctrine(doc.id, opt)} disabled={!canAfford}
                                  className={`text-left px-2 py-1.5 rounded border text-[9px] transition-all ${canAfford ? 'border-[#cfb53b]/25 hover:border-[#cfb53b]/60 hover:bg-[#cfb53b]/8 text-[#dfcfa0]/80 cursor-pointer' : 'border-zinc-700/25 text-zinc-500 cursor-not-allowed'}`}>
                                  <span className="font-bold text-[10px] text-[#cfb53b]/80">{option.label}</span>
                                  <span className="block text-[#dfcfa0]/45 mt-0.5 leading-relaxed">{option.effectDesc}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  };

                  const chosen = doctrines.filter(d => d.chosen !== null).length;
                  return (
                    <div className="bg-[#171308] border border-[#cfb53b]/15 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#cfb53b] font-serif">⚖️ Posições Doutrinárias</h4>
                        <span className="text-[9px] font-mono text-[#dfcfa0]/40">{chosen} / {doctrines.length} definidas</span>
                      </div>
                      <p className="text-[10px] text-[#dfcfa0]/45 mb-4 leading-relaxed">Cada decisão é <strong className="text-[#cfb53b]/70">permanente e irreversível</strong>. Define a identidade teológica do seu credo para sempre.</p>
                      <p className="text-[9px] font-mono uppercase text-[#dfcfa0]/35 tracking-widest mb-2">Posições Universais (1–20)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {universalDocs.map(renderDoc)}
                      </div>
                      <p className="text-[9px] font-mono uppercase text-[#dfcfa0]/35 tracking-widest mb-2">Estrutura Social (21–30)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {socialDocs.map(renderDoc)}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}

        </div>

      </main>

      {/* 3. CONSOLE LOG EVENTS DISPLAY PANEL (Bottom scrolling ledger) */}
      <footer className="bg-[#120f05] border-t-2 border-[#cfb53b]/30 p-4 min-h-[120px] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[#cfb53b]/60 font-mono">
            <span>Pergaminho de Eventos Globais e Despachos</span>
            <span>Estabilidade Estrita da Sé</span>
          </div>
          
          {/* Scrollable event listings items */}
          <div className="bg-black/40 rounded border border-[#cfb53b]/10 p-3 h-24 overflow-y-auto flex flex-col gap-1 text-xs font-mono">
            {state.logs.map((log, index) => {
              let cl = 'text-[#dfcfa0]';
              if (log.startsWith('[EVENTO NARRATIVO]')) cl = 'text-[#cfb53b] font-bold';
              else if (log.startsWith('[AÇÃO]')) cl = 'text-green-400';
              else if (log.startsWith('[LÍDER CONVERTIDO]')) cl = 'text-sky-300 font-bold';
              else if (log.startsWith('Dispersão:')) cl = 'text-amber-500 italic';
              
              return (
                <div key={index} className={`border-b border-[#cfb53b]/5 pb-1 leading-relaxed ${cl}`}>
                  • {log}
                </div>
              );
            })}
          </div>
        </div>
      </footer>

      {/* 5. ACTIVE NARRATIVE EVENT OVERLAY POPUP */}
      {state.eventActive && !state.isGameOver && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fade-in" id="event-active-overlay">
          <div className="w-full max-w-lg bg-[#211a0c] border-[3px] border-[#cfb53b] p-6 rounded-xl text-center shadow-[0_0_40px_rgba(207,181,59,0.25)] flex flex-col gap-4 relative overflow-hidden">
            {/* Ancient parchment corner backgrounds */}
            <div className="absolute inset-0 bg-[radial-gradient(#cfb53b_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
            
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#cfb53b] bg-[#cfb53b]/10 border border-[#cfb53b]/30 px-3 py-1 rounded-full font-mono">
                {(() => {
                  switch (state.eventActive.impactType) {
                    case 'bonus': return '✦ Bênção Celestial / Prodígio';
                    case 'penalty': return '⚠ Tribulação Mundial / Praga';
                    case 'neutral': return '✦ Acontecimento Geopolítico';
                    case 'prophecy': return '✦ Profecia Cumprida';
                    case 'ecstasy': return '✨ Êxtase Divino / Revelação';
                    case 'persecution': return '☠ Inquisição / Perseguição';
                    default: return '✦ Revelação Divina';
                  }
                })()}
              </span>
              <h2 className="text-2xl font-extrabold font-serif text-[#cfb53b] tracking-wide mt-1 leading-snug">
                {state.eventActive.title}
              </h2>
            </div>

            <hr className="border-[#cfb53b]/20" />

            <p className="text-sm leading-relaxed text-[#dfcfa0]/90 italic font-serif px-2">
              "{state.eventActive.description}"
            </p>

            {/* Visualizer of Event Influence */}
            <div className="bg-[#120f05] rounded border border-[#cfb53b]/15 p-3 flex flex-col gap-1.5 text-xs text-left text-[#dfcfa0]/80">
              <span className="text-[10px] uppercase font-mono font-bold text-[#cfb53b]/80 animate-pulse">Impacto no Plano Cósmico:</span>
              <ul className="flex flex-col gap-1 list-none pl-0">
                {state.eventActive.actionEffects.globalFaithMod && (
                  <li className="text-green-400 font-mono">
                    • Fé Global de Entrada: +{state.eventActive.actionEffects.globalFaithMod} Poder de Fé
                  </li>
                )}
                {state.eventActive.actionEffects.globalFervorMod && (
                  <li className="text-red-400 font-mono">
                    • Fervor de Oposição: +{state.eventActive.actionEffects.globalFervorMod} Poder de Fervor
                  </li>
                )}
                {/* Specific countries affected */}
                {Object.entries(state.eventActive.actionEffects.countryConvertsMod || {}).map(([cid, val]) => {
                  const cname = state.countries.find(c => c.id === cid)?.name || cid;
                  const numVal = val as number;
                  return (
                    <li key={cid} className={numVal > 0 ? "text-green-400/90 font-mono" : "text-red-400/90 font-mono"}>
                      • Devotos em {cname}: {numVal > 0 ? `+${numVal.toLocaleString()}` : 'Rebeldes dispersaram 50% dos seguidores'}
                    </li>
                  );
                })}
                {Object.entries(state.eventActive.actionEffects.countryResistanceMod || {}).map(([cid, val]) => {
                  const cname = state.countries.find(c => c.id === cid)?.name || cid;
                  const numVal = val as number;
                  return (
                    <li key={cid} className={numVal < 0 ? "text-green-400/90 font-mono" : "text-red-400/90 font-mono"}>
                      • Resistência em {cname}: {numVal > 0 ? `+${numVal}%` : `${numVal}%`}
                    </li>
                  );
                })}
                {Object.entries(state.eventActive.actionEffects.countryViolenceMod || {}).map(([cid, val]) => {
                  const cname = state.countries.find(c => c.id === cid)?.name || cid;
                  const numVal = val as number;
                  return (
                    <li key={cid} className={numVal < 0 ? "text-green-400/90 font-mono" : "text-orange-400/90 font-mono"}>
                      • Violência em {cname}: {numVal > 0 ? `+${numVal}%` : `${numVal}%`}
                    </li>
                  );
                })}
              </ul>
            </div>

            <button
              onClick={() => {
                playSound('success');
                setState((prev) => ({ ...prev, eventActive: null, paused: false }));
              }}
              className="py-2.5 px-6 bg-[#cfb53b] hover:bg-[#e6ca4a] text-[#1e1a0c] font-extrabold uppercase rounded-lg shadow-md cursor-pointer text-xs font-sans tracking-widest mt-2 hover:shadow-[0_0_15px_rgba(207,181,59,0.35)] transition-all"
            >
              Aceitar Desígnio Celestial
            </button>
          </div>
        </div>
      )}

      {/* 4. GAME OVER SCREEN (Victory/Defeat Dialog overlay popup) */}
      {state.isGameOver && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="gameover-overlay">
          <div className="w-full max-w-lg bg-[#211a0c] border-4 border-[#cfb53b] p-6 rounded-xl text-center shadow-[0_0_50px_rgba(207,181,59,0.3)] flex flex-col gap-5">
            
            {state.gameOverReason === 'victory' ? (
              <>
                <span className="text-[#cfb53b] text-6xl block justify-center font-serif">🏆</span>
                <h2 className="text-3xl font-extrabold font-serif text-[#cfb53b] tracking-wider uppercase">
                  O Alinhamento Transcendental!
                </h2>
                <div className="text-sm leading-relaxed text-[#dfcfa0]/90">
                  Parabéns! Sua fé original <strong>"{state.religionName}"</strong> superou todas as barreiras físicas, consolidou as doutrinas corretas e completou com sucesso o sagrado objetivo de <strong>{goalNames[state.victoryGoal]}</strong>.
                  <p className="mt-3 text-xs italic text-amber-100/70">
                    A humanidade agora caminha unida sob os preceitos de {state.religionName}. A escuridão espiritual foi debelada para sempre.
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="text-red-500 text-6xl block justify-center font-serif">💀</span>
                <h2 className="text-3xl font-extrabold font-serif text-red-500 tracking-wider uppercase">
                  Ruína do Credo
                </h2>
                <div className="text-sm leading-relaxed text-[#dfcfa0]/90">
                  {state.gameOverReason === 'resistance' && (
                    <p>
                      Seu proselitismo agressivo e a alta hostilidade desregulada forçaram a comunidade internacional a promulgar uma inquisição mundial totalitária. Todos os seus templos e relíquias foram banidos e destruídos devido à resistência persistente superior a 85%!
                    </p>
                  )}
                  {state.gameOverReason === 'rival' && (
                    <p>
                      <strong>{state.rivalName}</strong> provou suas teorias pragmáticas e ergueu uma utopia tecnológica. A humanidade perdeu a capacidade de professar o invisível, condenando sua divindade ao esquecimento definitivo.
                    </p>
                  )}
                  {state.gameOverReason === 'bankrupt' && (
                    <p>
                      Tanto a Fé quanto o Fervor zeraram inteiramente de forma irreversível e você não possui mais seguidores orgânicos ativos para gerar dízimos comunitários. O credo ruiu por letargia estrutural.
                    </p>
                  )}
                </div>
              </>
            )}

            <button
              onClick={handleResetGame}
              className="py-3 px-6 bg-[#cfb53b] hover:bg-[#e6ca4a] text-[#1e1a0c] font-extrabold uppercase rounded-lg shadow-md cursor-pointer text-sm font-sans tracking-widest mt-2 active:scale-95 transition-all"
            >
              Iniciar Nova Gênese
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
