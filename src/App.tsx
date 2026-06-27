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
import VictoryScreen from './components/VictoryScreen';
import LeadersPanel from './components/LeadersPanel';
import RivalPanel from './components/RivalPanel';
import SplashScreen from './components/SplashScreen';
import MainMenu from './components/MainMenu';
import FirstTempleModal from './components/FirstTempleModal';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Gamepad2, Info, BookOpen, AlertTriangle, Map, ScrollText, Crown, Skull, Sparkles, Save, FolderOpen } from 'lucide-react';
import { calcPeaceEffectiveness } from './utils/peaceEffectiveness';
import { playFileSound } from './utils/sound';

// Geographic neighbors for aura_iluminada dogma effect
const COUNTRY_NEIGHBORS: Record<string, string[]> = {
  usa:          ['mexico', 'canada_proxy', 'cuba'],
  mexico:       ['usa', 'haiti', 'colombia', 'cuba'],
  brazil:       ['mexico', 'south_africa', 'nigeria', 'colombia'],
  germany:      ['russia', 'turkey', 'ukraine'],
  russia:       ['germany', 'china', 'iran', 'ukraine'],
  china:        ['russia', 'india', 'japan', 'south_korea'],
  india:        ['china', 'iran', 'indonesia'],
  japan:        ['china', 'australia', 'south_korea', 'indonesia', 'philippines'],
  egypt:        ['saudi_arabia', 'nigeria', 'turkey', 'ethiopia'],
  saudi_arabia: ['egypt', 'turkey', 'iran'],
  south_africa: ['brazil', 'nigeria'],
  australia:    ['japan', 'indonesia'],
  turkey:       ['germany', 'egypt', 'saudi_arabia', 'iran', 'ukraine'],
  iran:         ['saudi_arabia', 'turkey', 'russia', 'india'],
  south_korea:  ['japan', 'china', 'philippines'],
  indonesia:    ['japan', 'australia', 'india', 'philippines'],
  nigeria:      ['egypt', 'south_africa', 'brazil', 'ethiopia'],
  haiti:        ['mexico', 'usa', 'colombia', 'cuba'],
  ukraine:      ['germany', 'russia', 'turkey'],
  ethiopia:     ['egypt', 'nigeria'],
  philippines:  ['indonesia', 'south_korea', 'japan'],
  colombia:     ['mexico', 'brazil', 'haiti'],
  cuba:         ['usa', 'mexico', 'haiti'],
};

const TEMPLE_NAMES: Record<string, string[]> = {
  Mistical:   ['Gruta do Véu', 'Santuário dos Arcanos', 'Torre dos Mistérios', 'Abismo Sagrado'],
  Prophetic:  ['Posto da Palavra', 'Casa da Revelação', 'Tabernáculo do Oráculo', 'Trono da Profecia'],
  Activist:   ['Célula da Causa', 'Bastião do Povo', 'Fortaleza da Mudança', 'Cidadela da Nova Era'],
  Syncretist: ['Elo dos Caminhos', 'Confluência dos Ritos', 'Nexo das Tradições', 'Templo da Grande Fusão'],
};

const TEMPLE_COSTS = [
  { faith: 40, fervor: 10, tithe: 20 },
  { faith: 70, fervor: 20, tithe: 50 },
  { faith: 110, fervor: 35, tithe: 120 },
  { faith: 160, fervor: 55, tithe: 250 },
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
            // Migrate old single-temple saves to new multi-temple system
            temples: c.temples ?? (c.templeLevel > 0 ? [0,0,0,0].map((_,i) => i === (c.templeLevel-1) ? 1 : 0) : [0,0,0,0]),
            templesBuilding: c.templesBuilding ?? [0,0,0,0],
            templesBuildCycles: c.templesBuildCycles ?? (c.templePending > 0 ? [0,0,0,0].map((_,i) => i === (c.templePending-1) ? (c.templeBuildCyclesLeft ?? 0) : 0) : [0,0,0,0]),
            templeSpec: c.templeSpec ?? null,
            cyclesPresent: c.cyclesPresent ?? 0,
            lastConflictCycle: c.lastConflictCycle ?? -99,
            localReligionStrength: c.localReligionStrength ?? 0,
            tags: c.tags ?? ['Secular'],
            lastActionCycle: c.lastActionCycle ?? 0,
            convertsHistory: c.convertsHistory ?? [],
            coupDone: c.coupDone ?? false,
          }));
          // Migrate old saves: add new countries that didn't exist when the save was created
          const existingIds = new Set(parsed.countries.map((c: any) => c.id));
          INITIAL_COUNTRIES.forEach(initial => {
            if (!existingIds.has(initial.id)) {
              parsed.countries.push({ ...initial });
            }
          });
        }
        if (!parsed.doctrines) parsed.doctrines = INITIAL_DOCTRINES.map(d => ({ ...d, chosen: null }));
        if (parsed.tithe === undefined) parsed.tithe = 50;
        if (parsed.faithPhase === undefined) parsed.faithPhase = 1;
        if (parsed.peakFervor === undefined) parsed.peakFervor = parsed.fervor ?? 0;
        if (parsed.firstCountryConverted === undefined) parsed.firstCountryConverted = null;
        if (parsed.lastEventCycle === undefined) parsed.lastEventCycle = -99;
        if (parsed.lastEventTimestamp === undefined) parsed.lastEventTimestamp = 0;
        if (parsed.eventCooldowns === undefined) parsed.eventCooldowns = {};
        if (parsed.rivalName === undefined) parsed.rivalName = 'A Ordem Tecnocrática';
        if (parsed.lastEcstasyRitual === undefined) parsed.lastEcstasyRitual = -99;
        if (parsed.faithBankruptStreak === undefined) parsed.faithBankruptStreak = 0;
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
      faith: 60, // starting Faith
      fervor: 5,  // starting Fervor
      cycle: 0,
      paused: false,
      gameSpeed: 1,
      selectedCountryId: 'usa', // focus USA initially to show details
      dogmas: INITIAL_DOGMAS,
      countries: INITIAL_COUNTRIES,
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
      tithe: 200,
      faithPhase: 1,
      firstCountryConverted: null,
      peakFervor: 5,
      lastEcstasyRitual: -99,
      faithBankruptStreak: 0,
    };
  });

  const hasSave = !!localStorage.getItem('religion_simulator_state_v2');
  const [appScreen, setAppScreen] = useState<'splash' | 'menu' | 'creation' | 'game'>(() => 'splash');

  const [activeTab, setActiveTab] = useState<'map' | 'dogmas' | 'leaders' | 'rival' | 'faith' | 'guide'>('map');
  const [faithSubTab, setFaithSubTab] = useState<'visao' | 'doutrinas'>('visao');
  const [showTutorial, setShowTutorial] = useState(() => localStorage.getItem('tutorial_seen') !== 'true');
  const [tutorialStep, setTutorialStep] = useState(0); // #5: interactive tutorial step
  const [specChoiceQueue, setSpecChoiceQueue] = useState<string[]>([]);
  const specChoiceCountryId = specChoiceQueue[0] ?? null;
  const [phaseNotification, setPhaseNotification] = useState<2 | 3 | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => localStorage.getItem('audio_muted_v2') === 'true');
  const [newsText, setNewsText] = useState('CONEXÃO COLETIVA ESTÁVEL: Monitorando a disseminação teológica pelo globo...');
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number; colorClass: string; countryId?: string }[]>([]);
  const [saveToast, setSaveToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [firstTempleModal, setFirstTempleModal] = useState<{ countryName: string } | null>(null);
  const firstTempleShownRef = useRef(false);
  const soundtrackRef = useRef<HTMLAudioElement | null>(null);
  const splashMusicRef = useRef<HTMLAudioElement | null>(null);
  const alertPlayedThisCycleRef = useRef<number>(-1);
  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Splash music: try autoplay, fall back to first user touch anywhere
  useEffect(() => {
    const audio = new Audio('/splash-music.mp3');
    audio.loop = true;
    audio.volume = 0;
    splashMusicRef.current = audio;

    const fadeIn = () => {
      let v = 0;
      const step = setInterval(() => {
        v = Math.min(0.75, v + 0.05);
        audio.volume = v;
        if (v >= 0.75) clearInterval(step);
      }, 75);
    };

    const tryPlay = () => {
      audio.play().then(fadeIn).catch(() => {});
    };

    // Try immediately (works on desktop and some Android with user-gesture history)
    audio.play().then(fadeIn).catch(() => {
      // Blocked — start on very first touch/click anywhere on the page
      document.addEventListener('touchstart', tryPlay, { once: true, capture: true });
      document.addEventListener('click', tryPlay, { once: true, capture: true });
    });

    return () => {
      audio.pause();
      document.removeEventListener('touchstart', tryPlay, true);
      document.removeEventListener('click', tryPlay, true);
      splashMusicRef.current = null;
    };
  }, []);

  // Create soundtrack audio programmatically so ref exists before game screen mounts
  useEffect(() => {
    const audio = new Audio('/soundtrack.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = isMutedRef.current;
    soundtrackRef.current = audio;
    return () => { audio.pause(); soundtrackRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sound preference state persistence
  useEffect(() => {
    localStorage.setItem('audio_muted_v2', String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    if (soundtrackRef.current) soundtrackRef.current.muted = isMuted;
  }, [isMuted]);

  // Pause soundtrack on game over
  useEffect(() => {
    if (state.isGameOver && soundtrackRef.current) soundtrackRef.current.pause();
  }, [state.isGameOver]);

  // #9: Dynamic browser tab title
  useEffect(() => {
    if (state.started && state.religionName) {
      document.title = `${state.religionName} — Ciclo #${state.cycle} | TEOLOGICO`;
    } else {
      document.title = 'TEOLOGICO — Simulador de Religiões';
    }
  }, [state.started, state.religionName, state.cycle]);

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
    if (!state.isGameOver) {
      localStorage.setItem('religion_simulator_state_v2', JSON.stringify(state));
    }
  }, [state]);

  // Main Loop Manager
  useEffect(() => {
    if (!state.started || state.paused || state.isGameOver) return;

    // Speeds: 1x = 5000ms, 2x = 2500ms, 3x = 1200ms
    const intervalTime = state.gameSpeed === 1 ? 5000 : state.gameSpeed === 2 ? 2500 : 1200;

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

        // Economy: temples only function when Dízimo is sufficient
        const hasTithe = prev.tithe > 0;

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

        const decayLogs: string[] = [];
        let updatedCountries = prev.countries.map((c) => {
          let converts = c.converts;
          const pop = c.population;
          let resistance = c.resistance;
          let violence = c.violence;
          let leaderInfiltration = c.leaderInfiltration;

          let cyclesPresent = c.cyclesPresent ?? 0;
          let lastConflictCycle = c.lastConflictCycle ?? -99;
          let localReligionStrength = c.localReligionStrength ?? 0;

          // Declared here so Temple passive effects (outside if converts>0) can access them
          const _temples = c.temples ?? [0,0,0,0];
          const _hasAnyTemple = _temples.some(t => t > 0);

          if (converts > 0) {
            cyclesPresent += 1;

            // Base growth rate — logistic model: scales with existing convert base, not raw population
            let growthFactor = 0.05;

            // OBSTÁCULO 1 — BARREIRAS LINGUÍSTICAS E CULTURAIS
            const linguisticLen = (getDoc('doc_tradition') === 'B' || getDoc('doc_education') === 'A') ? 10 : 15;
            const barrierMod = getDoc('doc_culture') === 'A' ? 0.7 : getDoc('doc_culture') === 'B' ? 1.2 : 1.0;
            if (cyclesPresent < linguisticLen) {
              const barrierStrength = (prev.religionTrait === 'Syncretist' ? 0.25 : 0.5) * barrierMod;
              const barrier = Math.max(0, (linguisticLen - cyclesPresent) / linguisticLen) * barrierStrength;
              growthFactor *= (1 - barrier);
            }

            // OBSTÁCULO 2 — APEGO ÀS TRADIÇÕES LOCAIS
            const traditionModRaw = TRADITION_MODIFIER[prev.religionTrait]?.[c.regimeType] ?? 1.0;
            const traditionMod = getDoc('doc_culture') === 'A' ? 1 + (traditionModRaw - 1) * 0.5 : traditionModRaw;
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

            // Activist has +80% speed in oppressives, but -30% in stable democracies
            if (prev.religionTrait === 'Activist') {
              if (['opressor', 'autoritario', 'teocracia'].includes(c.regimeType)) {
                growthFactor *= 1.8; // reduced from 2.5 to prevent runaway stacking
              } else if (['liberal', 'estavel', 'democracia'].includes(c.regimeType)) {
                growthFactor *= 0.7; // reduced penalty so democracies aren't dead zones
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

            // Country special traits
            if (c.id === 'brazil') growthFactor *= 1.4; // Brasil: conversão orgânica 40% mais rápida
            if (c.id === 'south_africa' && activeDogmaIds.some(id => ['caridade_global', 'assistencia_medica', 'rede_ajuda_mutua'].includes(id))) growthFactor *= 1.5; // África do Sul: ações humanitárias triplicam impacto
            if (c.id === 'indonesia') {
              const convertFracIndo = c.population > 0 ? c.converts / c.population : 0;
              if (convertFracIndo >= 0.10) growthFactor *= 1.5; // crescimento viral após 10%
              else growthFactor *= 0.7; // resistência islâmica: 30% mais lenta antes de 10%
            }
            if (c.id === 'ethiopia' && prev.religionTrait === 'Mistical') growthFactor *= 1.3;
            if (c.id === 'colombia') {
              if (violence > 50) growthFactor *= 0.60;
              else if (violence < 30) growthFactor *= 1.60;
            }

            // Temple growth bonus (stacks per temple count per level)
            if (_hasAnyTemple && hasTithe) {
              const GROWTH_PER = [0.015, 0.025, 0.04, 0.06];
              const totalGrowthBonus = _temples.reduce((s, count, i) => s + count * GROWTH_PER[i], 0);
              growthFactor *= (1 + Math.min(totalGrowthBonus, 0.5));
              if (c.templeSpec === 'conversion') growthFactor *= 1.20;
            }

            // Leader converted — regional growth bonuses — must be before addedConverts
            if (chinaLeaderConverted && ['china', 'india', 'japan'].includes(c.id)) growthFactor *= 1.5;
            if (indiaLeaderConverted && ['india', 'south_africa', 'egypt'].includes(c.id)) growthFactor *= 1.3;

            // Cap growthFactor to prevent runaway stacking from dogma + doctrine combinations
            growthFactor = Math.min(growthFactor, 0.15);

            // Core expansion factor hindered by local hostility (resistance slows down conversion)
            const hostilityMultiplier = 1 - (resistance / 100);

            // Logistic growth: scales with existing converts × remaining space, not raw population
            // Small base → slow growth; large base → fast growth; near saturation → slows again
            const remainingFraction = (pop - converts) / pop;
            let addedConverts = Math.floor(converts * growthFactor * remainingFraction * Math.max(0.01, hostilityMultiplier));
            // TAG: Secular — harder to convert (-20%)
            if ((c.tags ?? []).includes('Secular')) addedConverts = Math.floor(addedConverts * 0.80);
            addedConverts = Math.max(converts > 0 ? 1 : 0, addedConverts);
            converts = Math.min(pop, converts + addedConverts);

            // INACTIVITY DECAY: fiéis se perdem quando o jogador ignora o país por muito tempo
            const cyclesSinceAction = prev.cycle - (c.lastActionCycle ?? 0);
            if (cyclesSinceAction > 15 && (_temples[2] === 0 && _temples[3] === 0)) {
              const decayRate = cyclesSinceAction > 30 ? 0.005 : 0.002;
              const decayed = Math.floor(converts * decayRate);
              converts = Math.max(0, converts - decayed);
              if (decayed > 0 && cyclesSinceAction === 16) {
                decayLogs.push(`⚠️ ALERTA: ${c.name} está perdendo fiéis por falta de atenção!`);
              }
            }

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

            // DYNAMIC localReligionStrength update
            const convertFrac = converts / pop;
            // TAG: Devoto — nationalism is 30% stronger (grows faster / decays slower)
            const devotoBonusMult = (c.tags ?? []).includes('Devoto') ? 1.3 : 1.0;
            if (convertFrac < 0.05 && !_hasAnyTemple && converts === 0) {
              localReligionStrength = Math.min(95, localReligionStrength + 0.3 * devotoBonusMult);
            } else if (convertFrac > 0.30 && _hasAnyTemple) {
              localReligionStrength = Math.max(5, localReligionStrength - 0.5 / devotoBonusMult);
            } else {
              localReligionStrength = localReligionStrength > 50
                ? Math.max(50, localReligionStrength - 0.1)
                : Math.min(50, localReligionStrength + 0.1);
            }
            // localReligionStrength is already a local variable and will be spread into result below

            // FASE 3 — ADAPTAÇÃO CULTURAL: após 20 ciclos de presença, resistência cai gradualmente
            if (cyclesPresent > 20) {
              // TAG: Progressista — resistance decays 20% faster
              const resistDecay = (c.tags ?? []).includes('Progressista') ? 0.12 : 0.1;
              resistance = Math.max(0, resistance - resistDecay);
            }

            // OBSTÁCULO 4 — CONFLITOS ENTRE GRUPOS
            // Alta violência + presença significativa gera conflito local esporádico
            const convertPctConflict = (converts / pop) * 100;
            if (violence > 50 && convertPctConflict > 15 && (prev.cycle - lastConflictCycle) > 10) {
              const conflictChance = (_temples[1] > 0 || _temples[2] > 0 || _temples[3] > 0) ? 0.04 : 0.08;
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
              if (prev.religionTrait === 'Prophetic' && _hasAnyTemple) {
                const totalLvl = _temples.reduce((s, count, i) => s + count * (i + 1), 0);
                leaderGrowth += Math.min(0.32, 0.08 * totalLvl);
              }
              leaderInfiltration = Math.min(100, leaderInfiltration + leaderGrowth);
            }
          }

          // SATURAÇÃO: governos reagem quando conversão cresce sem o líder convertido
          if (converts > 0 && leaderInfiltration < 100) {
            const convertPct = (converts / pop) * 100;
            if (convertPct > 75) resistance = Math.min(100, resistance + 0.8);
            else if (convertPct > 50) resistance = Math.min(100, resistance + 0.4);
            else if (convertPct > 25) resistance = Math.min(100, resistance + 0.2);
          }

          // Temple passive effects — stacks per temple count per level
          if (_hasAnyTemple && hasTithe) {
            const RESIST_PER = [0.15, 0.3, 0.5, 0.9];
            const totalResistDrop = _temples.reduce((s, count, i) => s + count * RESIST_PER[i], 0);
            resistance = Math.max(0, resistance - Math.min(totalResistDrop, 3.0));
            if (c.templeSpec === 'resistance') resistance = Math.max(0, resistance - 0.5);
            const totalTempleWeight = _temples.reduce((s, count, i) => s + count * (i + 1), 0);
            if (prev.religionTrait === 'Activist') {
              violence = Math.max(0, violence - (0.3 * totalTempleWeight));
            }
            if (prev.religionTrait === 'Mistical' && _temples[2] > 0) {
              resistance = Math.max(0, resistance - 0.3);
            }
            if (prev.religionTrait === 'Syncretist' && _temples[1] > 0) {
              resistance = Math.max(0, resistance - 0.2);
            }
          }

          // Limit resistance based on Syncretist doctrine rule (raised to 70% to add some tension, 55% with panteao_aberto)
          const limitResistance = hasPanteaoAberto ? 55 : 70;
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

          // TEMPLE CONSTRUCTION PHASE (A): per-level countdown, all pending at that level complete together
          const newTemples = [..._temples];
          const newBuilding = [...(c.templesBuilding ?? [0,0,0,0])];
          const newBuildCycles = [...(c.templesBuildCycles ?? [0,0,0,0])];
          let templeSpec = c.templeSpec;
          for (let lvl = 0; lvl < 4; lvl++) {
            if (newBuilding[lvl] > 0 && newBuildCycles[lvl] > 0) {
              newBuildCycles[lvl] -= 1;
              if (newBuildCycles[lvl] === 0) {
                const wasZero = newTemples[lvl] === 0;
                newTemples[lvl] += newBuilding[lvl];
                newBuilding[lvl] = 0;
                if (lvl === 1 && wasZero) setSpecChoiceQueue(q => [...q, c.id]);
              }
            }
          }

          // TEMPLE VULNERABILITY (E): high violence destroys one temple (highest level first)
          const _anyBuilt = newTemples.some(t => t > 0);
          if (_anyBuilt) {
            let destructionChance = violence > 90 ? 0.05 : violence > 70 ? 0.02 : 0;
            if (c.id === 'haiti') destructionChance *= 2;
            if (destructionChance > 0 && Math.random() < destructionChance) {
              for (let lvl = 3; lvl >= 0; lvl--) {
                if (newTemples[lvl] > 0) { newTemples[lvl] -= 1; break; }
              }
              if (!newTemples.slice(1).some(t => t > 0)) templeSpec = null;
            }
          }

          // TAG: Autoritário — violence regenerates +30% faster
          if ((c.tags ?? []).includes('Autoritário') && violence < c.violence) {
            // If violence was reduced this cycle, it bounces back more in autoritarian states
            violence = Math.min(c.violence, violence + (c.violence - violence) * 0.3);
          }
          // TAG: Militarista — base violence regeneration +30%
          if ((c.tags ?? []).includes('Militarista') && violence < 100) {
            violence = Math.min(100, violence + 0.3);
          }

          return { ...c, converts, resistance, violence, leaderInfiltration, cyclesPresent, lastConflictCycle, temples: newTemples, templesBuilding: newBuilding, templesBuildCycles: newBuildCycles, templeSpec, localReligionStrength };
        });

        // Post-map passive dogma effects

        // caridade_global: reduce violence -2 in the 3 most violent countries with converts
        if (hasGlobalCharity) {
          const withPresence = updatedCountries.filter(c => c.converts > 0).sort((a, b) => b.violence - a.violence);
          withPresence.slice(0, 3).forEach(topV => {
            const idx = updatedCountries.findIndex(x => x.id === topV.id);
            if (idx !== -1) updatedCountries[idx] = { ...updatedCountries[idx], violence: Math.max(0, updatedCountries[idx].violence - 2) };
          });
        }

        // combate_corrupcao: reduce resistance -0.4/cycle in liberal/democracia countries with converts
        if (activeDogmaIds.includes('combate_corrupcao')) {
          updatedCountries = updatedCountries.map(c =>
            c.converts > 0 && ['liberal', 'democracia'].includes(c.regimeType)
              ? { ...c, resistance: Math.max(0, c.resistance - 0.4) }
              : c
          );
        }

        // comparatismo_teologico: remove linguistic barrier for Syncretist (handled inline via hasSyncretizerHistory)
        // (barrierStrength already set to 0.25 for Syncretist; with this dogma it's fully zeroed)
        if (hasSyncretizerHistory) {
          updatedCountries = updatedCountries.map(c =>
            c.cyclesPresent < 15 && c.converts > 0
              ? { ...c, resistance: Math.max(0, c.resistance - 0.5) }
              : c
          );
        }

        // livro_revelacoes (Prophetic): slow resistance growth by -0.5/cycle in all active countries
        if (hasProphecyRevelations && prev.religionTrait === 'Prophetic') {
          updatedCountries = updatedCountries.map(c =>
            c.converts > 0 ? { ...c, resistance: Math.max(0, c.resistance - 0.5) } : c
          );
        }

        // aura_iluminada (Mystical): leader conversion generates 3% convert surge in neighbors each cycle
        if (activeDogmaIds.includes('aura_iluminada') && prev.religionTrait === 'Mistical') {
          const convertedLeaderIds = updatedCountries.filter(c => c.leaderInfiltration >= 100 && c.converts > 0).map(c => c.id);
          if (convertedLeaderIds.length > 0) {
            const neighborIds = new Set(convertedLeaderIds.flatMap(id => COUNTRY_NEIGHBORS[id] ?? []));
            updatedCountries = updatedCountries.map(c => {
              if (neighborIds.has(c.id) && c.converts > 0) {
                const surge = Math.floor(c.converts * 0.03);
                return { ...c, converts: Math.min(c.population, c.converts + surge) };
              }
              return c;
            });
          }
        }

        // iran passive: sem presença → +0.3% resistência global; com presença → -0.3% global
        const iranObj = updatedCountries.find(c => c.id === 'iran');
        if (iranObj) {
          const iranDelta = iranObj.converts > 0 ? -0.3 : 0.3;
          updatedCountries = updatedCountries.map(c =>
            c.id !== 'iran'
              ? { ...c, resistance: Math.min(100, Math.max(0, c.resistance + iranDelta)) }
              : c
          );
        }

        // nigeria: população cresce +50.000 por ciclo
        const nigeriaIdx = updatedCountries.findIndex(c => c.id === 'nigeria');
        if (nigeriaIdx !== -1) {
          updatedCountries[nigeriaIdx] = {
            ...updatedCountries[nigeriaIdx],
            population: updatedCountries[nigeriaIdx].population + 200000,
          };
        }

        // ukraine: violência cresce se Rússia não convertida, cai se convertida
        const ukraineIdx = updatedCountries.findIndex(c => c.id === 'ukraine');
        if (ukraineIdx !== -1 && updatedCountries[ukraineIdx].converts > 0) {
          const russiaConverted = updatedCountries.find(c => c.id === 'russia')?.leaderInfiltration >= 100;
          const vDelta = russiaConverted ? -0.5 : 0.8;
          updatedCountries[ukraineIdx] = {
            ...updatedCountries[ukraineIdx],
            violence: Math.max(0, Math.min(100, updatedCountries[ukraineIdx].violence + vDelta)),
          };
        }

        // ethiopia: Syncretist trait → resistência cresce +0.2/ciclo
        const ethiopiaIdx = updatedCountries.findIndex(c => c.id === 'ethiopia');
        if (ethiopiaIdx !== -1 && updatedCountries[ethiopiaIdx].converts > 0 && prev.religionTrait === 'Syncretist') {
          updatedCountries[ethiopiaIdx] = {
            ...updatedCountries[ethiopiaIdx],
            resistance: Math.min(100, updatedCountries[ethiopiaIdx].resistance + 0.2),
          };
        }

        // philippines: líder convertido → +1.5% converts na Indonésia e Coreia do Sul por ciclo
        const phObj = updatedCountries.find(c => c.id === 'philippines');
        if (phObj && phObj.leaderInfiltration >= 100) {
          ['indonesia', 'south_korea'].forEach(targetId => {
            const idx = updatedCountries.findIndex(c => c.id === targetId);
            if (idx !== -1 && updatedCountries[idx].converts > 0) {
              const surge = Math.floor(updatedCountries[idx].converts * 0.015);
              updatedCountries[idx] = {
                ...updatedCountries[idx],
                converts: Math.min(updatedCountries[idx].population, updatedCountries[idx].converts + surge),
              };
            }
          });
        }

        // cuba: a cada 15 ciclos de presença → culto clandestino (+30 fervor + 2% conversão)
        let cubaFervorBonus = 0;
        const cubaIdx = updatedCountries.findIndex(c => c.id === 'cuba');
        if (cubaIdx !== -1) {
          const cubaC = updatedCountries[cubaIdx];
          if (cubaC.converts > 0 && cubaC.cyclesPresent >= 15 && cubaC.cyclesPresent % 15 === 0) {
            const bonusConverts = Math.floor(cubaC.population * 0.02);
            updatedCountries[cubaIdx] = {
              ...cubaC,
              converts: Math.min(cubaC.population, cubaC.converts + bonusConverts),
            };
            cubaFervorBonus = 30;
          }
          // líder convertido → resistência zero
          if (cubaC.leaderInfiltration >= 100) {
            updatedCountries[cubaIdx] = { ...updatedCountries[cubaIdx], resistance: 0 };
          }
        }

        // south_korea: líder convertido → +1.5% converts no Japão e Indonésia por ciclo
        const skObj = updatedCountries.find(c => c.id === 'south_korea');
        if (skObj && skObj.leaderInfiltration >= 100) {
          ['japan', 'indonesia'].forEach(targetId => {
            const idx = updatedCountries.findIndex(c => c.id === targetId);
            if (idx !== -1 && updatedCountries[idx].converts > 0) {
              const surge = Math.floor(updatedCountries[idx].converts * 0.015);
              updatedCountries[idx] = {
                ...updatedCountries[idx],
                converts: Math.min(updatedCountries[idx].population, updatedCountries[idx].converts + surge),
              };
            }
          });
        }

        // Teocracias aliadas (resultado de golpe): geram +5 Fé/ciclo e reduzem resistência dos vizinhos -0.1/ciclo
        let theoFaithBonus = 0;
        updatedCountries
          .filter(c => c.coupDone === true && c.leaderInfiltration >= 100 && c.converts > 0)
          .forEach(theoC => {
            theoFaithBonus += 5;
            const neighborIds = COUNTRY_NEIGHBORS[theoC.id] ?? [];
            neighborIds.forEach(nId => {
              const nIdx = updatedCountries.findIndex(x => x.id === nId);
              if (nIdx !== -1) {
                updatedCountries[nIdx] = {
                  ...updatedCountries[nIdx],
                  resistance: Math.max(0, updatedCountries[nIdx].resistance - 0.1),
                };
              }
            });
          });

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
            }
          }
        }

        // 3. ECONOMY — Dízimo generation and maintenance
        let titheGained = 0;
        updatedCountries.forEach(c => {
          if (c.converts > 0) {
            // Opção A: renda base fixa por país com presença (incentiva expansão geográfica)
            titheGained += 0.3;
            // Opção B: curva de faixas — primeiros 200k rendem mais por cabeça
            const tier1 = Math.min(c.converts, 200_000);
            const tier2 = Math.min(Math.max(c.converts - 200_000, 0), 800_000);
            const tier3 = Math.max(c.converts - 1_000_000, 0);
            const localBase = tier1 / 800_000 + tier2 / 1_600_000 + tier3 / 2_000_000;
            const ct = c.temples ?? [0,0,0,0];
            const maxLvl = Math.max(0, ...ct.map((n, i) => n > 0 ? i + 1 : 0));
            const templeBonus = maxLvl === 0 ? 1.0 : maxLvl === 1 ? 1.3 : maxLvl === 2 ? 1.8 : maxLvl === 3 ? 2.5 : 4.0;
            const extraBonus = 1 + Math.max(0, ct[0] - 1) * 0.05 + Math.max(0, ct[1] - 1) * 0.08 + Math.max(0, ct[2] - 1) * 0.12 + Math.max(0, ct[3] - 1) * 0.18;
            titheGained += localBase * templeBonus * extraBonus;
          }
        });
        titheGained = Math.floor(titheGained);
        // Maintenance — missionaries reduced to 0.5/cycle (was 2, was killing early-game tithe)
        const missionaryMaintenance = updatedCountries.reduce((s, c) => s + (c.missionariesSent ?? 0) * 0.5, 0);
        const TEMPLE_MAINT_PER = [2, 5, 10, 18];
        const templeMaintenance = updatedCountries.reduce((s, c) =>
          s + (c.temples ?? [0,0,0,0]).reduce((sum, count, i) => sum + count * TEMPLE_MAINT_PER[i], 0)
        , 0);
        const rawNetTithe = titheGained - missionaryMaintenance - templeMaintenance;
        // Floor on net: when any converts exist, tithe always grows by at least +1
        const netTithe = totalConvertsCount > 0 ? Math.max(1, rawNetTithe) : rawNetTithe;

        // 4. Currency accumulations
        // Base Faith gain: scales with active presence, not flat over time
        const convertedRate = totalPopCount > 0 ? (totalConvertsCount / totalPopCount) : 0;
        const activeCountries = updatedCountries.filter(c => c.converts > 0).length;

        // Base faith: rewards geographic expansion more aggressively
        let fervorGained = 0;
        let faithGained = 3 + activeCountries * 2;
        faithGained += Math.floor(totalConvertsCount / 50000000);
        if (prev.fervor > 100) faithGained += Math.floor((prev.fervor - 100) / 100);

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
        // Temple global faith/fervor bonuses — scale with count at each level
        updatedCountries.forEach((c) => {
          const t = c.temples ?? [0,0,0,0];
          if (!t.some(n => n > 0)) return;
          if (prev.religionTrait === 'Mistical') faithGained += t[2] * 2 + t[3] * 4;
          if (prev.religionTrait === 'Prophetic') { const hi = t[2] + t[3]; faithGained += hi * 3; fervorGained += hi; }
          if (prev.religionTrait === 'Activist') faithGained += t[3] * 3;
          if (prev.religionTrait === 'Syncretist') faithGained += t[3] * 5;
        });

        // DOUTRINAS — efeitos globais de Fé e Fervor
        if (getDoc('doc_economy') === 'A') fervorGained += 5;
        faithGained += theoFaithBonus;
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

        // Fervor gained: baseline + persecution pressure
        const avgResistance = totalResistanceSum / updatedCountries.length;
        // For streak/defeat check: only count countries where player has presence (avoids early-game insta-loss)
        const activePresenceCountries = updatedCountries.filter(c => c.converts > 0);
        const avgResistanceActive = activePresenceCountries.length > 0
          ? activePresenceCountries.reduce((s, c) => s + c.resistance, 0) / activePresenceCountries.length
          : 0;
        // Small baseline so players can always progress doctrines (was 0 if resistance < 50%)
        fervorGained += 1;
        if (avgResistance > 50) {
          fervorGained += Math.floor((avgResistance - 50) / 15); // slightly more generous scaling
        }
        // Syncretist generates less fervor — coexistence avoids confrontation but weakens defensive power
        if (prev.religionTrait === 'Syncretist') {
          fervorGained = Math.floor(fervorGained * 0.7);
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
        fervorGained += cubaFervorBonus;

        // China special trait: fervor doubled from high-resistance countries (capped at +5/cycle to avoid exploit)
        const chinaObj = updatedCountries.find(c => c.id === 'china');
        if (chinaObj && chinaObj.converts > 0 && chinaObj.resistance > 40) {
          fervorGained += Math.min(5, Math.floor((chinaObj.resistance - 40) / 10));
        }

        // 4. Adversary Rival Artificial Intelligence Progression (reactive model)
        const activeCountriesCount = updatedCountries.filter(c => c.converts > 0).length;
        const convertedRate2 = totalPopCount > 0 ? (totalConvertsCount / totalPopCount) : 0;

        let rivalIncrement = 0.04; // base (symbolic pressure)

        // Grace period: rival frozen for first 60 cycles
        if (prev.cycle < 60) rivalIncrement = 0;

        // Rival retreats before established faith
        if (convertedRate2 > 0.5) rivalIncrement *= 0.3;
        else if (convertedRate2 > 0.25) rivalIncrement *= 0.5;

        // Each temple level ≥2 slows rival globally
        const establishedTemples = updatedCountries.filter(c => (c.temples?.[1] ?? 0) > 0 || (c.temples?.[2] ?? 0) > 0 || (c.temples?.[3] ?? 0) > 0).length;
        if (establishedTemples > 0) rivalIncrement *= Math.pow(0.92, establishedTemples);

        // Syncretist coexists better with rival ideologies
        if (prev.religionTrait === 'Syncretist') rivalIncrement *= 0.7;
        if (getDoc('doc_moral_source') === 'A') rivalIncrement *= 0.80;
        if (hasRelogioJuizo) rivalIncrement *= 0.7;
        // Prophetic L4 temple: rival slows globally per such temple
        const propheticL4Temples = updatedCountries.filter(c => prev.religionTrait === 'Prophetic' && (c.temples?.[3] ?? 0) > 0).length;
        if (propheticL4Temples > 0) rivalIncrement *= Math.pow(0.85, propheticL4Temples);

        const updatedRivalProgress = Math.min(100, prev.rivalProgress + rivalIncrement);

        // 4b. FAITH PHASE PROGRESSION
        const totalWorldPop = updatedCountries.reduce((s, c) => s + c.population, 0);
        const totalWorldConverts = updatedCountries.reduce((s, c) => s + c.converts, 0);
        const worldConvertPct = totalWorldPop > 0 ? totalWorldConverts / totalWorldPop : 0;
        const countriesAbove30 = updatedCountries.filter(c => c.converts / c.population >= 0.30).length;
        const allCountriesHavePresence = updatedCountries.every(c => c.converts > 0);

        let newFaithPhase = prev.faithPhase;
        if (prev.faithPhase === 1 && countriesAbove30 >= 5) {
          newFaithPhase = 2;
        } else if (prev.faithPhase === 2 && worldConvertPct >= 0.50 && allCountriesHavePresence) {
          newFaithPhase = 3;
        }
        const phaseAdvanced = newFaithPhase > prev.faithPhase;

        // 5. Evaluate Warning Streak — only triggers when player has established presence in 5+ countries
        const hasEstablishedPresence = activePresenceCountries.length >= 5;
        let newStreak = prev.resistanceStreak;
        if (hasEstablishedPresence && avgResistanceActive > 85) {
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
        } else if (prev.victoryGoal === 'TheEnlightened' && updatedCountries.filter((c) => c.leaderInfiltration >= 100).length >= 14) {
          isGameOver = true;
          gameOverReason = 'victory';
        }

        // Losses tests — only if victory not already triggered
        if (!isGameOver && newStreak >= 5) {
          isGameOver = true;
          gameOverReason = 'resistance';
        } else if (!isGameOver && updatedRivalProgress >= 100) {
          isGameOver = true;
          gameOverReason = 'rival';
        }
        // Bankruptcy: faith stays at or below 5 for 3 consecutive cycles with no converts
        const newFaithBankruptStreak = (prev.faith + faithGained) <= 5 && totalConvertsCount === 0
          ? (prev.faithBankruptStreak ?? 0) + 1
          : 0;
        if (!isGameOver && newFaithBankruptStreak >= 3) {
          isGameOver = true;
          gameOverReason = 'bankrupt';
        }

        if (isGameOver) {
          playSound(gameOverReason === 'victory' ? 'success' : 'gameover');
        }

        // 7. Narrative Random Event Dice roll (10% chance, 2-min global cooldown, 25-cycle individual cooldown)
        let newlyTriggeredEvent: GameEvent | null = null;

        const EVENT_GLOBAL_COOLDOWN_MS = 120000; // 2 minutes real time
        const EVENT_INDIVIDUAL_COOLDOWN_CYCLES = 25;
        const now = Date.now();
        const globalCooldownPassed = (now - prev.lastEventTimestamp) >= EVENT_GLOBAL_COOLDOWN_MS;

        if (Math.random() < 0.10 && !isGameOver && globalCooldownPassed) {
          // Filter by trait and individual cooldown
          const validEvents = RANDOM_EVENTS_POOL.filter((e) => {
            const traitOk = !e.traitRequirement || e.traitRequirement === prev.religionTrait;
            const lastFired = prev.eventCooldowns[e.id] ?? -999;
            const cooldownOk = (prev.cycle - lastFired) > EVENT_INDIVIDUAL_COOLDOWN_CYCLES;
            return traitOk && cooldownOk;
          });

          if (validEvents.length > 0) {
            const picked = validEvents[Math.floor(Math.random() * validEvents.length)];
            newlyTriggeredEvent = picked;
            playSound('event');

            // Apply immediately to country parameters (immutable map)
            updatedCountries = updatedCountries.map((c) => {
              const resistMod = picked.actionEffects?.countryResistanceMod?.[c.id];
              const violenceMod = picked.actionEffects?.countryViolenceMod?.[c.id];
              const convertsMod = picked.actionEffects?.countryConvertsMod?.[c.id];
              const convertsModPct = picked.actionEffects?.countryConvertsModPct?.[c.id];
              const globalConvertsModPct = picked.actionEffects?.globalConvertsModPct;
              let { converts, resistance, violence } = c;
              if (resistMod !== undefined) resistance = Math.max(0, Math.min(100, resistance + resistMod));
              if (violenceMod !== undefined) violence = Math.max(0, Math.min(100, violence + violenceMod));
              if (convertsMod !== undefined) {
                if (convertsMod > 0) {
                  if (converts > 0) converts = Math.min(c.population, Math.floor(converts + convertsMod));
                } else if (convertsMod < 0) {
                  converts = Math.max(0, Math.floor(converts + convertsMod));
                }
              }
              if (convertsModPct !== undefined && converts > 0) {
                converts = Math.max(0, Math.floor(converts * (1 + convertsModPct / 100)));
              }
              if (globalConvertsModPct !== undefined && converts > 0) {
                converts = Math.max(0, Math.floor(converts * (1 + globalConvertsModPct / 100)));
              }
              if (converts === c.converts && resistance === c.resistance && violence === c.violence) return c;
              return { ...c, converts, resistance, violence };
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

            // One-time faith drain from debuff events
            if (picked.actionEffects.globalFaithCostMod) {
              faithGained += picked.actionEffects.globalFaithCostMod; // negative value = drain
            }

            faithGained += eventFaithBonus;
            fervorGained += eventFervorBonus;
          }
        }

        // CONVERTS HISTORY: track rolling convert count for sparkline chart
        const countriesWithHistory = updatedCountries.map(c => ({
          ...c,
          convertsHistory: [...(c.convertsHistory ?? []).slice(-49), c.converts]
        }));

        // Sound: play alert if any decay log was added this cycle
        if (decayLogs.length > 0 && alertPlayedThisCycleRef.current !== prev.cycle) {
          alertPlayedThisCycleRef.current = prev.cycle;
          playFileSound('alert', isMutedRef.current);
        }

        const fervorFloor = getDoc('doc_destiny') === 'B' ? 5 : 0;
        const nextCycle = prev.cycle + 1;
        const updatedEventCooldowns = newlyTriggeredEvent
          ? { ...prev.eventCooldowns, [newlyTriggeredEvent.id]: prev.cycle }
          : prev.eventCooldowns;

        // Count temples completed this cycle (templePending > 0 → now 0 means it just finished)
        const countT = (c: { temples?: number[] }) => (c.temples ?? [0,0,0,0]).reduce((a,b)=>a+b,0);
        const justCompletedTemples = updatedCountries.filter((c, i) => countT(c) > countT(prev.countries[i]));
        const newlyCompletedTemples = justCompletedTemples.length;

        // First temple ever built — trigger celebration modal
        if (newlyCompletedTemples > 0 && prev.totalTemples === 0 && !firstTempleShownRef.current) {
          firstTempleShownRef.current = true;
          const firstTempleCountry = justCompletedTemples[0];
          setTimeout(() => setFirstTempleModal({ countryName: firstTempleCountry.name }), 400);
        }

        const newlyDestroyedTemples = updatedCountries.filter((c, i) => countT(c) < countT(prev.countries[i])).length;

        // Build phase advancement log
        const phaseNames = ['', 'Centelha Sagrada', 'Credo Estabelecido', 'Era da Transcendência'];
        const phaseDescs = ['', '', 'Dogmas e doutrinas intermediárias desbloqueadas. O mundo começa a notar sua presença.', 'Dogmas estratégicos desbloqueados. A metade do mundo foi alcançada pela fé!'];
        if (phaseAdvanced) {
          playSound('success');
          playFileSound('dogma', isMutedRef.current);
        }

        // Track run statistics for victory screen
        const newFervor = Math.max(fervorFloor, prev.fervor + fervorGained);
        const newPeakFervor = Math.max(prev.peakFervor ?? 0, newFervor);
        let newFirstCountry = prev.firstCountryConverted;
        if (!newFirstCountry) {
          const firstConverted = updatedCountries.find(c => c.converts / c.population >= 0.01);
          if (firstConverted) newFirstCountry = firstConverted.name;
        }

        return {
          ...prev,
          cycle: nextCycle,
          faith: prev.faith + faithGained,
          fervor: newFervor,
          tithe: Math.max(0, prev.tithe + netTithe),
          countries: countriesWithHistory,
          rivalProgress: updatedRivalProgress,
          resistanceStreak: newStreak,
          isGameOver,
          gameOverReason,
          totalTemples: updatedCountries.reduce((s, c) => s + countT(c), 0),
          faithPhase: newFaithPhase,
          eventActive: isGameOver ? null : (newlyTriggeredEvent || prev.eventActive),
          paused: isGameOver ? false : (phaseAdvanced ? true : (newlyTriggeredEvent ? true : prev.paused)),
          lastEventCycle: newlyTriggeredEvent ? prev.cycle : prev.lastEventCycle,
          lastEventTimestamp: newlyTriggeredEvent ? now : prev.lastEventTimestamp,
          eventCooldowns: updatedEventCooldowns,
          peakFervor: newPeakFervor,
          firstCountryConverted: newFirstCountry,
          faithBankruptStreak: newFaithBankruptStreak,
        };
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [state.started, state.paused, state.gameSpeed, state.isGameOver]);

  // Phase advancement notification
  const prevFaithPhaseRef = useRef<1 | 2 | 3>(state.faithPhase);
  useEffect(() => {
    if (state.faithPhase > prevFaithPhaseRef.current) {
      setPhaseNotification(state.faithPhase as 2 | 3);
    }
    prevFaithPhaseRef.current = state.faithPhase;
  }, [state.faithPhase]);

  // Dynamic World News Ticker
  const newsStateRef = useRef({ countries: state.countries, religionName: state.religionName, rivalProgress: state.rivalProgress, fervor: state.fervor });
  useEffect(() => {
    newsStateRef.current = { countries: state.countries, religionName: state.religionName, rivalProgress: state.rivalProgress, fervor: state.fervor };
  }, [state.countries, state.religionName, state.rivalProgress, state.fervor]);

  useEffect(() => {
    if (!state.started || state.paused || state.isGameOver) return;

    const interval = setInterval(() => {
      setNewsText(() => {
        const newsOptions: string[] = [];
        const activeCountries = newsStateRef.current.countries;
        const religion = newsStateRef.current.religionName || "Credo";

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
        if (newsStateRef.current.rivalProgress > 75) {
          newsOptions.push(`[SINAL INIMIGO] Dispositivos de sincronização neural de 'A Ordem Tecnocrática' estão transmitindo doutrina cética.`);
        } else if (newsStateRef.current.rivalProgress > 40) {
          newsOptions.push(`[FRENTE RIVAL] 'A Ordem Tecnocrática' rotula cultos de ${religion} como perigosos estorvos metafísicos.`);
        }

        // High Fervor or high cycle news
        if (newsStateRef.current.fervor > 80) {
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
  }, [state.started, state.paused, state.isGameOver]);

  // Handle Religion Initialization
  const handleStartGame = (name: string, trait: ReligionTrait, goal: VictoryGoalType, foundingDogmaIds: string[] = []) => {
    // Fresh countries initialization (giving focus to USA first)
    let presetCountries = INITIAL_COUNTRIES.map((c) => {
      if (c.id === 'usa') {
        return { ...c, converts: 120, leaderInfiltration: 5, resistance: 15, violence: 45, missionariesSent: 0, temples: [0,0,0,0], templesBuilding: [0,0,0,0], templesBuildCycles: [0,0,0,0], templeSpec: null, cyclesPresent: 1, lastConflictCycle: -99 };
      }
      return { ...c, converts: 0, leaderInfiltration: 0, missionariesSent: 0, temples: [0,0,0,0], templesBuilding: [0,0,0,0], templesBuildCycles: [0,0,0,0], templeSpec: null, cyclesPresent: 0, lastConflictCycle: -99 };
    });

    // Apply one-time founding pillar effects that normally fire on purchase
    if (foundingDogmaIds.includes('templos_sociais')) {
      presetCountries = presetCountries.map(c => ({ ...c, resistance: Math.max(0, c.resistance - 10) }));
    }

    // Fade out splash music then start soundtrack (all inside user gesture)
    const sm = splashMusicRef.current;
    if (sm && !sm.paused) {
      const fadeOut = setInterval(() => {
        sm.volume = Math.max(0, sm.volume - 0.1);
        if (sm.volume <= 0) { clearInterval(fadeOut); sm.pause(); }
      }, 50);
    }
    if (soundtrackRef.current && !isMuted) {
      soundtrackRef.current.volume = 0.35;
      soundtrackRef.current.currentTime = 0;
      soundtrackRef.current.play().catch(() => {});
    }

    setState({
      started: true,
      religionName: name,
      religionTrait: trait,
      victoryGoal: goal,
      faith: 60,
      fervor: 8,
      cycle: 1,
      paused: false,
      gameSpeed: 1,
      selectedCountryId: 'usa',
      dogmas: INITIAL_DOGMAS.map(d => ({ ...d, purchased: foundingDogmaIds.includes(d.id) })),
      countries: presetCountries,
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
      tithe: 200,
      faithPhase: 1,
      firstCountryConverted: null,
      peakFervor: 5,
    });
    playSound('success');
  };

  // Reset Game fully
  const handleResetGame = () => {
    playSound('alert');
    if (soundtrackRef.current) { soundtrackRef.current.pause(); soundtrackRef.current.currentTime = 0; }
    setPhaseNotification(null);
    localStorage.removeItem('religion_simulator_state_v2');
    setState({
      started: false,
      religionName: '',
      religionTrait: 'Mistical',
      victoryGoal: 'GlobalEcstasy',
      faith: 60,
      fervor: 5,
      cycle: 0,
      paused: false,
      gameSpeed: 1,
      selectedCountryId: 'usa',
      dogmas: INITIAL_DOGMAS.map(d => ({ ...d, purchased: false })),
      countries: INITIAL_COUNTRIES.map(c => ({ ...c, converts: c.id === 'usa' ? 120 : 0, leaderInfiltration: c.id === 'usa' ? 5 : 0, missionariesSent: 0, temples: [0,0,0,0], templesBuilding: [0,0,0,0], templesBuildCycles: [0,0,0,0], templeSpec: null, cyclesPresent: c.id === 'usa' ? 1 : 0, lastConflictCycle: -99 })),
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
      tithe: 200,
      faithPhase: 1,
      firstCountryConverted: null,
      peakFervor: 5,
    });
    setAppScreen('menu');
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
      if (docId === 'doc_culture' && choice === 'B') {
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
      };
    });
  };

  // Action callback 1: Send missionaries to speed up conversion
  const sendMissionary = (countryId: string) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj) return;

    let cost = 30;
    if (countryObj.id === 'japan') cost = Math.round(cost * 1.4); // Japão: ceticismo cultural +40% custo
    if (countryObj.id === 'china') cost = Math.round(cost * 1.5); // China: censura +50% custo
    if (countryObj.id === 'saudi_arabia') cost += 25;
    if (countryObj.id === 'cuba') cost = Math.round(cost * 1.80); // Cuba: regime opressor +80% custo (antes do escalonamento)
    // Escalating cost per missionary already sent (each costs 15 more than the last)
    cost += (countryObj.missionariesSent ?? 0) * 15;
    if (countryObj.id === 'haiti') cost = Math.round(cost * 0.5); // Haiti: receptividade extrema -50% custo (aplicado por último para incluir escalonamento)
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
      if (prev.faith < cost) return prev;

      const updated = prev.countries.map((c) => {
        if (c.id === countryId) {
          const sent = c.missionariesSent;
          // Missionaries establish presence, not mass conversion — temples do the converting
          let seedConverts: number;
          if (sent === 0) seedConverts = 50;        // 1st: initial contact
          else if (sent === 1) seedConverts = 200;  // 2nd: small cell formed
          else if (sent === 2) seedConverts = 500;  // 3rd: organized group
          else seedConverts = 1000;                 // 4th+: network between cities
          // TAG: Tribal — missionaries are 50% more effective
          if ((c.tags ?? []).includes('Tribal')) seedConverts = Math.floor(seedConverts * 1.5);
          const newConverts = Math.min(c.population, c.converts + seedConverts);
          // No resistance drop from missionaries — temples reduce resistance
          return { ...c, converts: newConverts, missionariesSent: c.missionariesSent + 1, lastActionCycle: prev.cycle };
        }
        return c;
      });

      playSound('click');
      return {
        ...prev,
        faith: prev.faith - cost,
        countries: updated,
      };
    });
  };

  // Action callback 2: Pacify Country (reduce violence) — 3 tiers based on violence level
  const pacifyCountry = (countryId: string, tier: 1 | 2 | 3) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj || countryObj.converts === 0) return;

    const costs = { 1: { faith: 15, fervor: 0 }, 2: { faith: 25, fervor: 5 }, 3: { faith: 40, fervor: 15 } };
    const baseEffects = { 1: { violence: -8, resistance: 0 }, 2: { violence: -20, resistance: -5 }, 3: { violence: -35, resistance: 5 } };
    const labels = { 1: 'Pregação de Paz', 2: 'Mobilização Comunitária', 3: 'Intervenção de Emergência' };

    const cost = costs[tier];
    const baseEffect = baseEffects[tier];
    if (state.faith < cost.faith || state.fervor < cost.fervor) return;

    const templeEffLevel = Math.max(0, ...(countryObj.temples ?? [0,0,0,0]).map((n,i) => n > 0 ? i+1 : 0));
    const eff = calcPeaceEffectiveness(
      countryObj.converts, countryObj.population,
      templeEffLevel, countryObj.leaderInfiltration,
      state.tithe
    );
    const scaledViolence = Math.round(baseEffect.violence * eff);
    const scaledResistance = baseEffect.resistance !== 0 ? Math.round(baseEffect.resistance * eff) : 0;
    const effPct = Math.round(eff * 100);

    addFloatingText(`-${cost.faith} Fé`, countryObj.coordinates.x, countryObj.coordinates.y, 'text-red-500 font-bold font-mono', countryObj.id);
    addFloatingText(`Paz (${effPct}%)`, countryObj.coordinates.x, countryObj.coordinates.y - 5, 'text-green-500 font-bold font-mono', countryObj.id);

    setState((prev) => {
      const country = prev.countries.find((c) => c.id === countryId);
      if (!country) return prev;
      if (prev.faith < cost.faith || prev.fervor < cost.fervor) return prev;

      const updated = prev.countries.map((c) => {
        if (c.id === countryId) {
          return {
            ...c,
            violence: Math.max(0, c.violence + scaledViolence),
            resistance: Math.min(100, Math.max(0, c.resistance + scaledResistance)),
            lastActionCycle: prev.cycle,
          };
        }
        return c;
      });

      playSound('click');
      return {
        ...prev,
        faith: prev.faith - cost.faith,
        fervor: prev.fervor - cost.fervor,
        countries: updated,
      };
    });
  };

  // Action callback 3: Infiltrate Country Leader
  // Leader conversion is a 4-stage process requiring religion infrastructure + high costs.
  const LEADER_STAGES = [
    { label: 'Ciente',       min: 0,  max: 25,  faith: 150, fervor: 0,   convertPct: 0.15, globalTemples: 5,  cyclesPresent: 0,  localTempleMinLevel: 0 },
    { label: 'Simpático',    min: 25, max: 50,  faith: 300, fervor: 300, convertPct: 0.30, globalTemples: 15, cyclesPresent: 10, localTempleMinLevel: 0 },
    { label: 'Comprometido', min: 50, max: 75,  faith: 500, fervor: 500, convertPct: 0.45, globalTemples: 25, cyclesPresent: 0,  localTempleMinLevel: 1 },
    { label: 'Convertido',   min: 75, max: 100, faith: 700, fervor: 700, convertPct: 0.60, globalTemples: 35, cyclesPresent: 0,  localTempleMinLevel: 2 },
  ];
  const SUPERPOWER_IDS = ['usa', 'china', 'india', 'germany'];
  const LEADER_SUCCESS_RATES: Record<string, number[]> = {
    opressor:    [0.45, 0.30, 0.20, 0.10],
    autoritario: [0.65, 0.50, 0.35, 0.20],
    teocracia:   [0.70, 0.60, 0.45, 0.30],
    democracia:  [0.85, 0.70, 0.55, 0.40],
    liberal:     [0.85, 0.70, 0.55, 0.40],
    vibrante:    [0.85, 0.70, 0.55, 0.40],
    estavel:     [0.85, 0.70, 0.55, 0.40],
  };

  // Returns the real cost and eligibility for infiltrating a leader — used by LeadersPanel for display
  const getLeaderCost = (countryId: string): { faith: number; fervor: number; canAct: boolean } => {
    const countryObj = state.countries.find(c => c.id === countryId);
    if (!countryObj || countryObj.leaderInfiltration >= 100) return { faith: 0, fervor: 0, canAct: false };
    const inf = countryObj.leaderInfiltration;
    const stageIdx = LEADER_STAGES.findIndex(s => inf >= s.min && inf < s.max);
    if (stageIdx === -1) return { faith: 0, fervor: 0, canAct: false };
    const stage = LEADER_STAGES[stageIdx];
    const isSuperpower = SUPERPOWER_IDS.includes(countryId);
    const requiredConvertPct = isSuperpower ? stage.convertPct * 2 : stage.convertPct;
    const requiredTemples = isSuperpower ? stage.globalTemples + 8 : stage.globalTemples;
    const actualConvertPct = countryObj.population > 0 ? countryObj.converts / countryObj.population : 0;
    const meetsLocalTemple = stage.localTempleMinLevel === 0 || (countryObj.temples?.[stage.localTempleMinLevel - 1] ?? 0) > 0;
    const canAct = actualConvertPct >= requiredConvertPct && state.totalTemples >= requiredTemples && countryObj.cyclesPresent >= stage.cyclesPresent && meetsLocalTemple;
    let baseFaith = stage.faith;
    let baseFervor = stage.fervor;
    const hasGJ = state.dogmas.some(d => d.id === 'reforma_escatologica' && d.purchased);
    if (hasGJ) { baseFaith = Math.floor(baseFaith * 0.5); baseFervor = Math.floor(baseFervor * 0.5); }
    const hasVN = state.dogmas.some(d => d.id === 'vidente_nacoes' && d.purchased);
    if (hasVN && ['opressor', 'autoritario'].includes(countryObj.regimeType)) baseFaith = Math.floor(baseFaith * 0.75);
    const russiaConv = (state.countries.find(c => c.id === 'russia')?.leaderInfiltration ?? 0) >= 100;
    if (russiaConv) { baseFaith = Math.round(baseFaith * 0.8); baseFervor = Math.round(baseFervor * 0.8); }
    return { faith: baseFaith, fervor: baseFervor, canAct };
  };

  const infiltrateLeader = (countryId: string) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj) return;

    const inf = countryObj.leaderInfiltration;
    if (inf >= 100) return;

    const stageIdx = LEADER_STAGES.findIndex(s => inf >= s.min && inf < s.max);
    if (stageIdx === -1) return;
    const stage = LEADER_STAGES[stageIdx];

    const isSuperpower = SUPERPOWER_IDS.includes(countryId);
    const requiredConvertPct = isSuperpower ? stage.convertPct * 2 : stage.convertPct;
    const requiredTemples = isSuperpower ? stage.globalTemples + 8 : stage.globalTemples;

    const actualConvertPct = countryObj.population > 0 ? countryObj.converts / countryObj.population : 0;
    const meetsConverts  = actualConvertPct >= requiredConvertPct;
    const meetsTemples   = state.totalTemples >= requiredTemples;
    const meetsCycles    = countryObj.cyclesPresent >= stage.cyclesPresent;
    const meetsTempleLocal = stage.localTempleMinLevel === 0 || (countryObj.temples?.[stage.localTempleMinLevel - 1] ?? 0) > 0;

    if (!meetsConverts || !meetsTemples || !meetsCycles || !meetsTempleLocal) return;

    let baseFaith = stage.faith;
    let baseFervor = stage.fervor;

    // Dogma discounts applied after stage cost
    const hasGrandeJulgamento = state.dogmas.some(d => d.id === 'reforma_escatologica' && d.purchased);
    if (hasGrandeJulgamento) { baseFaith = Math.floor(baseFaith * 0.5); baseFervor = Math.floor(baseFervor * 0.5); }

    const hasVidenteNacoes = state.dogmas.some(d => d.id === 'vidente_nacoes' && d.purchased);
    if (hasVidenteNacoes && ['opressor', 'autoritario'].includes(countryObj.regimeType)) {
      baseFaith = Math.floor(baseFaith * 0.75);
    }

    const russiaConverted = state.countries.find(c => c.id === 'russia')?.leaderInfiltration >= 100;
    if (russiaConverted) { baseFaith = Math.round(baseFaith * 0.8); baseFervor = Math.round(baseFervor * 0.8); }

    if (state.faith < baseFaith || state.fervor < baseFervor) return;

    // Success/failure roll
    const successRates = LEADER_SUCCESS_RATES[countryObj.regimeType] ?? LEADER_SUCCESS_RATES['democracia'];
    const successChance = successRates[stageIdx];
    const roll = Math.random();
    const isSuccess = roll < successChance;
    const isHostile = ['opressor', 'autoritario'].includes(countryObj.regimeType);

    addFloatingText(`-${baseFaith} Fé`, countryObj.coordinates.x, countryObj.coordinates.y, 'text-red-500 font-bold font-mono', countryObj.id);
    if (baseFervor > 0) addFloatingText(`-${baseFervor} Fervor`, countryObj.coordinates.x + 3, countryObj.coordinates.y + 3, 'text-red-400 font-bold font-mono', countryObj.id);

    if (isSuccess) {
      const isLobbyActive = state.dogmas.some((d) => d.id === 'lobby_politico' && d.purchased);
      const russiaConvertedBonus = state.countries.find(c => c.id === 'russia')?.leaderInfiltration >= 100;
      let gain = isLobbyActive ? 30 : 25;
      if (russiaConvertedBonus) gain = Math.round(gain * 1.25); // Rússia: infiltrações globais 25% mais eficazes
      addFloatingText('+Infiltração', countryObj.coordinates.x, countryObj.coordinates.y - 5, 'text-sky-400 font-bold font-mono', countryObj.id);
      setState((prev) => {
        const country = prev.countries.find((c) => c.id === countryId);
        if (!country) return prev;
        const updated = prev.countries.map((c) => {
          if (c.id !== countryId) return c;
          const nextVal = Math.min(100, c.leaderInfiltration + gain);
          return { ...c, leaderInfiltration: nextVal, lastActionCycle: prev.cycle };
        });
        const leaderConverted = (updated.find(c => c.id === countryId)?.leaderInfiltration ?? 0) >= 100;
        if (leaderConverted) {
          playSound('success');
          playFileSound('leader', isMutedRef.current);
        } else {
          playSound('click');
        }
        // Turkey special trait: converting leader reduces Egypt and Germany resistance by 8%
        let finalCountries = updated;
        if (leaderConverted && countryId === 'turkey') {
          finalCountries = finalCountries.map(c =>
            ['egypt', 'germany'].includes(c.id)
              ? { ...c, resistance: Math.max(0, c.resistance - 8) }
              : c
          );
        }
        return { ...prev, faith: prev.faith - baseFaith, fervor: prev.fervor - baseFervor, countries: finalCountries };
      });
    } else {
      // Failure: lose cost AND lose 20 infiltration progress
      const setback = 20;
      addFloatingText('FALHOU!', countryObj.coordinates.x, countryObj.coordinates.y - 5, 'text-orange-500 font-bold font-mono', countryObj.id);
      setState((prev) => {
        const country = prev.countries.find((c) => c.id === countryId);
        if (!country) return prev;
        const newInf = Math.max(0, country.leaderInfiltration - setback);
        const violenceIncrease = isHostile && inf >= 50 ? 15 : 0;
        const updated = prev.countries.map((c) => {
          if (c.id !== countryId) return c;
          return { ...c, leaderInfiltration: newInf, violence: Math.min(100, c.violence + violenceIncrease), lastActionCycle: prev.cycle };
        });
        return { ...prev, faith: prev.faith - baseFaith, fervor: prev.fervor - baseFervor, countries: updated };
      });
    }
  };

  // Action callback 4: Perform Ecstasy Ritual (Unique to Mística — requires transcendencia_fisica dogma)
  const ECSTASY_COOLDOWN_CYCLES = 8;
  const performEcstasyRitual = (countryId: string) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    const hasTranscendencia = state.dogmas.some(d => d.id === 'transcendencia_fisica' && d.purchased);
    const onCooldown = (state.cycle - (state.lastEcstasyRitual ?? -99)) < ECSTASY_COOLDOWN_CYCLES;
    if (!countryObj || state.faith < 50 || state.fervor < 10 || !hasTranscendencia || onCooldown) return;

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
          const addedConverts = Math.floor(c.population * 0.08);
          return {
            ...c,
            converts: Math.min(c.population, c.converts + addedConverts),
            resistance: Math.max(0, c.resistance - 10),
            lastActionCycle: prev.cycle,
          };
        }
        return c;
      });

      playSound('success');
      return {
        ...prev,
        faith: prev.faith - 50,
        fervor: prev.fervor - 10 + 15,
        countries: updated,
        lastEcstasyRitual: prev.cycle,
      };
    });
  };

  // Build cycles per temple level
  const TEMPLE_BUILD_CYCLES = [3, 6, 10, 15];
  // Minimum conversion % required to build each level
  const TEMPLE_PRESENCE_REQ = [0, 0.10, 0.25, 0.50];

  // Action callback 5: Build a temple of a specific level in a country
  const TEMPLE_MAX_PER_LEVEL = 5; // cap per level per country
  const TEMPLE_MISSION_REQ = [1, 3, 6, 10]; // missionaries required per level

  const openTemple = (countryId: string, level: number = 1) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj || level < 1 || level > 4) return;

    const temples = countryObj.temples ?? [0,0,0,0];
    const building = countryObj.templesBuilding ?? [0,0,0,0];

    // Missionary requirement
    if ((countryObj.missionariesSent ?? 0) < TEMPLE_MISSION_REQ[level - 1]) return;

    // Unlock gate: need at least 1 completed temple of previous level
    if (level > 1 && temples[level - 2] === 0) return;

    // Cap: max 5 built + in-progress per level per country
    if (temples[level - 1] + building[level - 1] >= TEMPLE_MAX_PER_LEVEL) return;

    // No new construction if a batch is already in progress for this level
    if (building[level - 1] > 0) return;

    // Presence requirement
    const presenceReq = TEMPLE_PRESENCE_REQ[level - 1];
    const convertPct = countryObj.converts / countryObj.population;
    if (convertPct < presenceReq) return;

    // Cycles present for levels 3+
    if (level === 3 && (countryObj.cyclesPresent ?? 0) < 25) return;
    if (level === 4 && (countryObj.cyclesPresent ?? 0) < 50) return;

    const cost = TEMPLE_COSTS[level - 1];
    if (state.faith < cost.faith || state.fervor < cost.fervor || state.tithe < cost.tithe) return;

    const templeName = TEMPLE_NAMES[state.religionTrait]?.[level - 1] ?? 'Templo';
    const buildCycles = TEMPLE_BUILD_CYCLES[level - 1];

    addFloatingText(`🏗️ ${templeName}...`, countryObj.coordinates.x, countryObj.coordinates.y - 8, 'text-yellow-400 font-bold font-serif', countryObj.id);
    addFloatingText(`-${cost.faith} Fé`, countryObj.coordinates.x, countryObj.coordinates.y, 'text-red-500 font-bold font-mono', countryObj.id);
    addFloatingText(`-${cost.tithe} Díz`, countryObj.coordinates.x, countryObj.coordinates.y + 5, 'text-emerald-400 font-bold font-mono', countryObj.id);

    setState((prev) => {
      const country = prev.countries.find(c => c.id === countryId);
      if (!country) return prev;
      if (prev.faith < cost.faith || prev.fervor < cost.fervor || prev.tithe < cost.tithe) return prev;
      const prevTemples = country.temples ?? [0,0,0,0];
      const prevBuilding = country.templesBuilding ?? [0,0,0,0];
      if (prevBuilding[level - 1] > 0) return prev; // double-click guard
      if (prevTemples[level - 1] + prevBuilding[level - 1] >= TEMPLE_MAX_PER_LEVEL) return prev;

      const newTemples = [...prevTemples];
      const newBuilding = [...prevBuilding];
      const newBuildCycles = [...(country.templesBuildCycles ?? [0,0,0,0])];
      newBuilding[level - 1] = 1;
      newBuildCycles[level - 1] = buildCycles;

      playSound('click');

      return {
        ...prev,
        faith: prev.faith - cost.faith,
        fervor: prev.fervor - cost.fervor,
        tithe: prev.tithe - cost.tithe,
        countries: prev.countries.map(c =>
          c.id === countryId ? { ...c, temples: newTemples, templesBuilding: newBuilding, templesBuildCycles: newBuildCycles, lastActionCycle: prev.cycle } : c
        ),
      };
    });
  };

  // Coup d'état — convert dictatorship to allied theocracy
  const stageCoup = (countryId: string) => {
    const countryObj = state.countries.find(c => c.id === countryId);
    if (!countryObj) return;
    const COUP_COST = { faith: 350, fervor: 150, tithe: 80 };
    if (state.faith < COUP_COST.faith || state.fervor < COUP_COST.fervor || state.tithe < COUP_COST.tithe) return;

    addFloatingText('⚔ Golpe!', countryObj.coordinates.x, countryObj.coordinates.y - 8, 'text-red-400 font-bold font-serif', countryObj.id);
    addFloatingText('Teocracia!', countryObj.coordinates.x, countryObj.coordinates.y, 'text-[#cfb53b] font-bold font-serif', countryObj.id);

    setState(prev => {
      const country = prev.countries.find(c => c.id === countryId);
      if (!country) return prev;
      if (prev.faith < COUP_COST.faith || prev.fervor < COUP_COST.fervor || prev.tithe < COUP_COST.tithe) return prev;

      const newTags = (country.tags ?? [])
        .filter(t => t !== 'Autoritário' && t !== 'Secular' && t !== 'Militarista')
        .concat(country.tags?.includes('Devoto') ? [] : ['Devoto']);

      const updatedCountry = {
        ...country,
        regimeType: 'teocracia' as const,
        resistance: 0,
        violence: Math.min(100, country.violence + 25),
        leaderInfiltration: 100,
        localReligionStrength: 10,
        tags: newTags,
        coupDone: true,
        lastActionCycle: prev.cycle,
      };

      playSound('success');
      return {
        ...prev,
        faith: prev.faith - COUP_COST.faith,
        fervor: prev.fervor - COUP_COST.fervor,
        tithe: prev.tithe - COUP_COST.tithe,
        countries: prev.countries.map(c => c.id === countryId ? updatedCountry : c),
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
      playFileSound('dogma', isMutedRef.current);
      return {
        ...prev,
        faith: prev.faith - targetDogma.costFaith,
        fervor: prev.fervor - targetDogma.costFervor,
        dogmas: updatedDogmas,
        countries: updatedCountries,
      };
    });
  };

  if (appScreen === 'splash') {
    return <SplashScreen onComplete={() => setAppScreen('menu')} />;
  }

  if (appScreen === 'menu') {
    return (
      <MainMenu
        hasSave={hasSave}
        onNewGame={() => setAppScreen('creation')}
        onLoadGame={() => {
          if (state.started) {
            setAppScreen('game');
            const sm = splashMusicRef.current;
            if (sm && !sm.paused) {
              const fadeOut = setInterval(() => {
                sm.volume = Math.max(0, sm.volume - 0.1);
                if (sm.volume <= 0) { clearInterval(fadeOut); sm.pause(); }
              }, 50);
            }
            if (soundtrackRef.current && !isMuted) {
              soundtrackRef.current.volume = 0.35;
              soundtrackRef.current.play().catch(() => {});
            }
          } else {
            setAppScreen('creation');
          }
        }}
      />
    );
  }

  if (appScreen === 'creation' || !state.started) {
    return <CreationScreen onStart={(name: string, trait: ReligionTrait, goal: VictoryGoalType, foundingDogmaIds: string[]) => { handleStartGame(name, trait, goal, foundingDogmaIds); setAppScreen('game'); }} />;
  }

  // Formatting helpers
  const totalWorldPopulation = state.countries.reduce((acc, curr) => acc + curr.population, 0);
  const totalConvertedWorld = state.countries.reduce((acc, curr) => acc + curr.converts, 0);
  const avgProgress = (totalConvertedWorld / totalWorldPopulation) * 100;

  // Victory pace indicator (#4)
  let victoryPaceText = '';
  if (state.victoryGoal === 'GlobalEcstasy') {
    const progress = totalWorldPopulation > 0 ? totalConvertedWorld / totalWorldPopulation : 0;
    const remaining = 0.8 - progress;
    const rate = state.cycle > 5 ? progress / state.cycle : 0;
    if (remaining <= 0) {
      victoryPaceText = 'Vitória próxima!';
    } else {
      const est = rate > 0 ? Math.ceil(remaining / rate) : 0;
      victoryPaceText = rate > 0 && est > 0 && est < 99999 ? `~${est} ciclos` : '—';
    }
  } else if (state.victoryGoal === 'OneFlock') {
    const superPowers = ['usa', 'china', 'india', 'germany'];
    const converted = state.countries.filter(c => superPowers.includes(c.id) && c.converts / c.population >= 0.5 && c.leaderInfiltration >= 100).length;
    victoryPaceText = `${converted}/4 potências`;
  } else if (state.victoryGoal === 'TheEnlightened') {
    const count = state.countries.filter(c => c.leaderInfiltration >= 100).length;
    victoryPaceText = `${count}/14 líderes`;
  } else if (state.victoryGoal === 'PerpetualPeace') {
    const peaceful = state.countries.filter(c => c.violence < 20).length;
    victoryPaceText = `${peaceful}/${state.countries.length} nações`;
  }

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
    <div className="bg-[#1e1a0c] text-[#dfcfa0] font-sans flex flex-col overflow-hidden" style={{ height: '100dvh' }} id="game-app-instance">
      
      {/* 1. STATUS HEADER — 2 compact rows */}
      <header className={`bg-[#171308] border-b-2 relative z-20 ${state.faithPhase === 3 ? 'border-[#8b1a1a]' : state.faithPhase === 2 ? 'border-[#e07820]' : 'border-[#cfb53b]'}`}>

        {/* ROW 1 — identity + 4 stats */}
        <div className="px-3 pt-2 pb-1.5 flex items-center gap-2">
          {/* Icon + name + trait */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="p-1 bg-[#cfb53b] text-[#1e1a0c] rounded shrink-0">
              <Gamepad2 className="w-3.5 h-3.5" />
            </div>
            <span
              className="font-bold font-serif text-[#cfb53b] uppercase tracking-wide leading-tight min-w-0"
              style={{ fontSize: `clamp(9px, ${Math.max(9, 14 - Math.max(0, state.religionName.length - 10))}px, 14px)` }}
            >{state.religionName}</span>
            <span className="text-[8px] uppercase px-1 py-0.5 bg-amber-950 text-[#cfb53b] font-bold border border-[#cfb53b]/30 rounded shrink-0">{traitNames[state.religionTrait]}</span>
          </div>

          {/* Progress badge */}
          {victoryPaceText && (
            <span className="text-[8px] font-mono px-1 py-0.5 rounded border border-green-700/40 bg-green-950/20 text-green-400 shrink-0">{victoryPaceText}</span>
          )}

          {/* Live dot */}
          <span title={newsText} className="w-2 h-2 rounded-full bg-red-500 animate-pulse cursor-help shrink-0 ml-auto" />
        </div>

        {/* ROW 2 — 4 stats */}
        <div className="px-3 pb-2 grid grid-cols-4 gap-1.5">
          <div title="Fiéis no mundo" className="flex items-center gap-1 bg-[#1a2010] border border-green-900/50 rounded px-2 py-1 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-[7px] font-mono text-[#dfcfa0]/40 uppercase">Fiéis</span>
              <span className="text-[11px] font-bold font-mono text-green-400 truncate">{totalConvertedWorld.toLocaleString()}</span>
            </div>
          </div>

          <div title="Dízimo: gerado pelos fiéis. Usado para templos." className={`flex items-center gap-1 rounded px-2 py-1 border min-w-0 ${state.tithe <= 0 ? 'bg-red-950/30 border-red-900/60' : 'bg-[#0d1a12] border-emerald-900/50'}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${state.tithe <= 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-[7px] font-mono text-[#dfcfa0]/40 uppercase">Dízimo</span>
              <span className={`text-[11px] font-bold font-mono truncate ${state.tithe <= 0 ? 'text-red-400' : 'text-emerald-400'}`}>{state.tithe.toLocaleString()}</span>
            </div>
          </div>

          <div title="Fé: moeda principal." className={`flex items-center gap-1 bg-[#241e0d] border border-[#cfb53b]/40 rounded px-2 py-1 min-w-0${state.faith >= 800 ? ' faith-overflow' : ''}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#cfb53b] shrink-0" />
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-[7px] font-mono text-[#dfcfa0]/40 uppercase">Fé</span>
              <span className="text-[11px] font-bold font-mono text-[#cfb53b] truncate">{state.faith.toLocaleString()}</span>
            </div>
          </div>

          <div title="Fervor: gerado pela resistência global." className="flex items-center gap-1 bg-[#241a1a] border border-red-900/40 rounded px-2 py-1 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-[7px] font-mono text-[#dfcfa0]/40 uppercase">Fervor</span>
              <span className="text-[11px] font-bold font-mono text-red-400 truncate">{state.fervor.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ROW 3 — controls toolbar */}
        <div className="border-t border-[#cfb53b]/15 px-3 py-1.5 flex items-center gap-1.5 bg-[#130f04]">
          {/* Save — download file to device */}
          <button
            onClick={() => {
              try {
                const saveData = JSON.stringify({ state, savedAt: Date.now() }, null, 2);
                const blob = new Blob([saveData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const date = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
                a.href = url;
                a.download = `teologico_${state.religionName.replace(/\s+/g, '_')}_${date}.json`;
                a.click();
                URL.revokeObjectURL(url);
                playSound('click');
                setSaveToast({ msg: 'Download iniciado!', ok: true });
                setTimeout(() => setSaveToast(null), 2000);
              } catch(_) {
                setSaveToast({ msg: 'Erro ao salvar', ok: false });
                setTimeout(() => setSaveToast(null), 2000);
              }
            }}
            className="flex items-center gap-1 px-2 py-1 rounded border border-[#cfb53b]/30 bg-[#1a1508] text-[#cfb53b]/70 hover:text-[#cfb53b] hover:bg-[#241e0a] transition-colors cursor-pointer text-[9px] font-mono uppercase tracking-wide"
            title="Salvar — baixar arquivo no dispositivo"
          >
            <Save className="w-3 h-3" /> Salvar
          </button>

          {/* Load — pick file from device */}
          <label
            className="flex items-center gap-1 px-2 py-1 rounded border border-[#cfb53b]/30 bg-[#1a1508] text-[#cfb53b]/70 hover:text-[#cfb53b] hover:bg-[#241e0a] transition-colors cursor-pointer text-[9px] font-mono uppercase tracking-wide"
            title="Carregar — escolher arquivo do dispositivo"
          >
            <FolderOpen className="w-3 h-3" /> Carregar
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const { state: saved } = JSON.parse(ev.target?.result as string);
                    if (!saved || !saved.religionName) throw new Error('invalid');
                    setState(saved);
                    playSound('click');
                    setSaveToast({ msg: `Carregado: ${saved.religionName}`, ok: true });
                    setTimeout(() => setSaveToast(null), 2500);
                  } catch(_) {
                    setSaveToast({ msg: 'Arquivo inválido', ok: false });
                    setTimeout(() => setSaveToast(null), 2000);
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </label>

          <div className="w-px h-4 bg-[#cfb53b]/20 mx-0.5" />

          {/* Speed */}
          <div className="flex h-6 bg-[#0e0b04] rounded border border-[#cfb53b]/20 overflow-hidden text-[9px]">
            {([1, 2, 3] as const).map((s) => (
              <button key={s} onClick={() => { playSound('click'); setState(p => ({ ...p, gameSpeed: s })); }}
                className={`px-2 font-bold cursor-pointer transition-colors ${state.gameSpeed === s ? 'bg-[#cfb53b] text-[#1e1a0c]' : 'text-[#dfcfa0]/60 hover:bg-neutral-900'}`}>
                {s}x
              </button>
            ))}
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => { playSound('click'); setState(p => ({ ...p, paused: !p.paused })); }}
            className={`p-1 rounded cursor-pointer border transition-colors ${state.paused ? 'bg-amber-950/40 border-[#cfb53b]/40 text-[#cfb53b]' : 'bg-[#cfb53b] border-amber-600 text-[#1e1a0c]'}`}
            title={state.paused ? 'Despausar' : 'Pausar'} id="play-pause-btn"
          >
            {state.paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Cycle */}
          <span className="text-[9px] font-mono text-[#cfb53b]/50 px-1">#{state.cycle}</span>

          <div className="flex items-center gap-1 ml-auto">
            {/* Mute */}
            <button
              onClick={() => {
                const targetMute = !isMuted;
                setIsMuted(targetMute);
                if (!targetMute && soundtrackRef.current) {
                  // Resume soundtrack directly inside user gesture
                  soundtrackRef.current.muted = false;
                  soundtrackRef.current.volume = 0.35;
                  soundtrackRef.current.play().catch(() => {});
                }
              }}
              className={`p-1 rounded cursor-pointer border transition-colors ${isMuted ? 'bg-[#1a1308] border-neutral-700 text-[#8b6b15]' : 'bg-amber-950/20 border-[#cfb53b]/40 text-[#cfb53b]'}`}
              title={isMuted ? 'Ativar som' : 'Mutar'} id="mute-toggle-btn"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Reset */}
            <button onClick={handleResetGame}
              className="p-1 rounded bg-red-950/20 hover:bg-red-950 border border-[#8b0000] text-red-400 cursor-pointer transition-all"
              title="Reiniciar jogo" id="reset-game-btn">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Rival progress bar — thin strip at bottom of header */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[#0e0804] border-t border-red-900/30">
          <span className="text-[8px] font-mono text-red-400/70 shrink-0 uppercase tracking-wider">⚔ Rival</span>
          <div className="flex-1 h-1.5 bg-black/60 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8b0000] to-red-500 transition-all duration-500"
              style={{ width: `${Math.min(100, state.rivalProgress)}%` }}
            />
          </div>
          <span className={`text-[8px] font-mono font-bold shrink-0 ${state.rivalProgress >= 75 ? 'text-red-400' : state.rivalProgress >= 40 ? 'text-orange-400' : 'text-red-400/50'}`}>
            {Math.round(state.rivalProgress)}%
          </span>
        </div>

        {/* Temple hint — shown when player can actually build (faith + conversion % met) */}
        {(() => {
          const templeReadyCountry = state.countries.find(c => {
            if (c.missionariesSent < 1 || (c.temples ?? []).some(t => t > 0) || (c.templesBuilding ?? []).some(t => t > 0)) return false;
            const convertPct = c.population > 0 ? c.converts / c.population : 0;
            return state.faith >= 40 && c.converts > 0;
          });
          if (!templeReadyCountry) return null;
          return (
            <div
              className="flex items-center gap-2 px-3 py-1 bg-[#1a1400] border-t border-[#cfb53b]/30 cursor-pointer"
              onClick={() => { setActiveTab('map'); }}
            >
              <span className="text-[8px] font-mono text-[#cfb53b] animate-pulse">💡</span>
              <span className="text-[8px] font-mono text-[#cfb53b]/80 flex-1">
                Pronto para construir um Templo em <strong className="text-[#cfb53b]">{templeReadyCountry.name}</strong> — toque no país → aba Templo
              </span>
            </div>
          );
        })()}

      </header>

      {/* Global Pause Alert */}
      {state.paused && !state.isGameOver && (
        <div className="shrink-0 bg-[#cfb53b]/10 border-b border-[#cfb53b]/30 text-[#cfb53b] px-4 py-2 text-xs flex items-center justify-between z-10">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-4 h-4 text-[#cfb53b]" /> Tempo pausado. Clique em ▶ para continuar.
          </span>
          <button
            onClick={() => setState(p => ({ ...p, paused: false }))}
            className="px-2 py-0.5 bg-[#cfb53b] text-[#1e1a0c] font-bold uppercase text-[10px] rounded cursor-pointer shrink-0"
          >
            Continuar
          </button>
        </div>
      )}

      {/* 2. MAIN PANEL — fills remaining height, scrolls internally */}
      <main className={`flex-1 min-h-0 relative z-10 ${activeTab === 'map' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>

        {/* Map tab — fills full remaining height */}
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
            onStageCoup={stageCoup}
            totalTemples={state.totalTemples}
            templeCosts={TEMPLE_COSTS}
            templeNames={TEMPLE_NAMES}
            floatingTexts={floatingTexts}
            tithe={state.tithe}
          />
        )}

        {/* All other tabs — with padding */}
        {activeTab !== 'map' && (
        <div className="max-w-7xl mx-auto p-3 md:p-4">

        {/* Guide tab — static manual */}
        {activeTab === 'guide' && (
          <div className="bg-[#1c1809] border border-[#cfb53b]/30 rounded-lg p-5 text-xs leading-relaxed">
            <h3 className="text-base font-bold font-serif text-[#cfb53b] uppercase tracking-wider mb-2">
              Manual Prático — Teológico
            </h3>
            <p className="text-[#dfcfa0]/80 mb-4">
              Você fundou uma nova religião. Lute por mentes e corações antes que a Ordem Tecnocrática convença o planeta de que tudo é matéria inorgânica.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-[#120f05] border border-[#cfb53b]/15 p-3 rounded">
                <h4 className="font-bold text-[#cfb53b] uppercase tracking-wide mb-1">Recursos</h4>
                <p className="text-[11px] text-[#dfcfa0]/75 leading-normal">
                  — <strong>Fé</strong>: moeda principal. Gasta em missões, pacificações e dogmas.<br />
                  — <strong>Fervor</strong>: moeda de resistência. Gerada quando governos hostis bloqueiam sua expansão.<br />
                  — <strong>Dízimo</strong>: renda passiva dos fiéis. Financia templos.
                </p>
              </div>
              <div className="bg-[#120f05] border border-[#cfb53b]/15 p-3 rounded">
                <h4 className="font-bold text-[#cfb53b] uppercase tracking-wide mb-1">Doutrinas</h4>
                <p className="text-[11px] text-[#dfcfa0]/75 leading-normal">
                  — <strong>Mística</strong>: bônus em eventos. Libera Êxtase Coletivo.<br />
                  — <strong>Profética</strong>: +50% conversão em crises.<br />
                  — <strong>Ativista</strong>: domina regimes opressores, sofre em democracias.<br />
                  — <strong>Sincretista</strong>: resistência nunca ultrapassa 60%.
                </p>
              </div>
              <div className="bg-[#120f05] border border-[#cfb53b]/15 p-3 rounded">
                <h4 className="font-bold text-[#cfb53b] uppercase tracking-wide mb-1">Ações</h4>
                <p className="text-[11px] text-[#dfcfa0]/75 leading-normal">
                  — <strong>Missionar</strong>: semeia fiéis iniciais.<br />
                  — <strong>Pacificar</strong>: reduz violência (vital para Paz Perpétua).<br />
                  — <strong>Líderes</strong>: converte governantes para bônus permanentes.<br />
                  — <strong>Templos</strong>: aceleram conversão e geram dízimo.
                </p>
              </div>
              <div className="bg-[#120f05] border border-[#cfb53b]/15 p-3 rounded">
                <h4 className="font-bold text-[#cfb53b] uppercase tracking-wide mb-1">Vitória e Derrota</h4>
                <p className="text-[11px] text-[#dfcfa0]/75 leading-normal">
                  — <strong>Vitória</strong>: complete os critérios do seu objetivo.<br />
                  — <strong>Derrota</strong>: resistência global &gt; 85% por 3+ ciclos, rival a 100%, ou sem fiéis e fundos.
                </p>
              </div>
            </div>

            {/* Interactive tutorial steps */}
            <div className="mt-5 border-t border-[#cfb53b]/15 pt-4">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#cfb53b]/60 mb-3">Tutorial Interativo</h4>
              {[
                `Seu objetivo: ${state.victoryGoal === 'GlobalEcstasy' ? 'converter 80% da humanidade' : state.victoryGoal === 'PerpetualPeace' ? 'reduzir violência abaixo de 20 em todas as nações' : state.victoryGoal === 'OneFlock' ? 'controlar as 4 superpotências' : 'converter todos os 12 líderes'}. Toque em um país no mapa para começar.`,
                'Use "Missionar" para enviar missionários e aumentar seus Fiéis.',
                'Acumule Fé realizando ações. Use Fé para comprar Dogmas.',
                'Construa Templos para acelerar a conversão e gerar Dízimos.',
                'Converta o Líder do país para ganhar bônus poderosos.',
              ].map((step, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#cfb53b]/20 border border-[#cfb53b]/40 text-[#cfb53b] text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="text-[11px] text-[#dfcfa0]/70 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab content rendering */}
        {activeTab !== 'guide' && (
        <div className="bg-[#211a0a] border border-[#cfb53b]/30 rounded-lg relative overflow-hidden">
          
          {activeTab === 'dogmas' && (
            <DogmasPanel
              dogmas={state.dogmas}
              faith={state.faith}
              fervor={state.fervor}
              trait={state.religionTrait}
              faithPhase={state.faithPhase}
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
              totalTemples={state.totalTemples}
              getLeaderCost={getLeaderCost}
              onInfiltrateLeader={infiltrateLeader}
            />
          )}

          {activeTab === 'rival' && (
            <RivalPanel
              countries={state.countries}
              rivalName={state.rivalName}
              rivalProgress={state.rivalProgress}
              cycle={state.cycle}
              victoryGoal={state.victoryGoal}
              resistanceStreak={state.resistanceStreak}
              religionTrait={state.religionTrait}
              dogmas={state.dogmas}
              doctrines={state.doctrines ?? []}
            />
          )}

          {activeTab === 'faith' && (() => {
            const totalMissionaries = state.countries.reduce((a, c) => a + (c.missionariesSent ?? 0), 0);
            const totalLeaders = state.countries.filter(c => c.leaderInfiltration >= 100).length;
            const totalTemplesList = state.countries.filter(c => (c.temples ?? []).some(t => t > 0));
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
            const phaseInfo = [
              null,
              { name: 'Centelha Sagrada', desc: 'Culto emergente. Alcance 5 países com >30% de conversão para avançar.', color: 'border-amber-700/40 bg-amber-950/20 text-amber-300', dot: 'bg-amber-500' },
              { name: 'Credo Estabelecido', desc: 'Religião organizada. Converta 50% do mundo com presença em todos os países para ascender.', color: 'border-orange-700/40 bg-orange-950/20 text-orange-300', dot: 'bg-orange-500' },
              { name: 'Era da Transcendência', desc: 'Metade da humanidade abraçou sua fé. O ápice foi alcançado.', color: 'border-red-700/40 bg-red-950/20 text-red-300', dot: 'bg-red-500' },
            ];
            const currentPhaseInfo = phaseInfo[state.faithPhase ?? 1]!;
            return (
              <div className="flex flex-col gap-3" id="faith-panel">

                {/* Sub-tab switcher */}
                <div className="flex gap-1">
                  {(['visao', 'doutrinas'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFaithSubTab(tab)}
                      className={`flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded border transition-all cursor-pointer ${
                        faithSubTab === tab
                          ? 'bg-[#cfb53b] text-[#1e1a0c] border-[#cfb53b] font-bold'
                          : 'bg-transparent text-[#cfb53b]/50 border-[#cfb53b]/20 hover:text-[#cfb53b]'
                      }`}
                    >
                      {tab === 'visao' ? 'Visão Geral' : 'Doutrinas'}
                    </button>
                  ))}
                </div>

                {faithSubTab === 'visao' && <>
                {/* Compact identity strip */}
                <div className="bg-[#1a1508] border border-[#cfb53b]/25 rounded-lg px-3 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold font-serif text-[#cfb53b] break-words">{state.religionName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-950 border border-[#cfb53b]/30 text-[#cfb53b] font-bold uppercase font-mono rounded">{traitNames[state.religionTrait]}</span>
                    </div>
                    <div className="text-[9px] text-[#dfcfa0]/45 font-mono mt-0.5">{goalNames[state.victoryGoal]}</div>
                  </div>
                  <div className={`shrink-0 flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-mono ${currentPhaseInfo.color}`}>
                    <span className={`w-2 h-2 rounded-full ${currentPhaseInfo.dot}`} />
                    <span className="font-bold">{currentPhaseInfo.name}</span>
                  </div>
                </div>

                {/* Global progress bar */}
                <div className="bg-[#171308] border border-[#cfb53b]/15 rounded-lg px-3 py-2">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-green-400">🌍 Alcance Global</span>
                    <span className="text-green-300 font-bold">{convPct.toFixed(3)}% · {totalConvertedWorld.toLocaleString()} fiéis</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded border border-green-900/30 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-800 to-green-500 transition-all duration-500" style={{ width: `${Math.min(100, convPct)}%` }} />
                  </div>
                  {(state.faithPhase ?? 1) < 3 && (
                    <div className="text-[9px] text-[#dfcfa0]/35 mt-1 font-mono">{currentPhaseInfo.desc}</div>
                  )}
                </div>

                {/* Stats grid — only non-redundant values */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Missionários', value: totalMissionaries, color: 'text-[#cfb53b]' },
                    { label: 'Líderes', value: `${totalLeaders}/12`, color: 'text-sky-400' },
                    { label: 'Templos', value: state.totalTemples, color: 'text-green-400' },
                    { label: 'Dogmas', value: `${activeDogmas.length}/${state.dogmas.length}`, color: 'text-amber-300' },
                    { label: 'Resistência', value: `${avgResistance.toFixed(1)}%`, color: 'text-red-500' },
                    { label: 'Violência', value: `${avgViolence.toFixed(1)}%`, color: 'text-orange-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#171308] border border-[#cfb53b]/10 rounded px-2 py-1.5">
                      <span className="text-[8px] uppercase font-mono text-[#dfcfa0]/40 block">{label}</span>
                      <span className={`text-base font-bold font-mono ${color} block`}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* A — Victory Goal Progress */}
                {(() => {
                  const superpowers = ['usa', 'china', 'india', 'germany'];
                  const totalInf = state.countries.filter(c => c.leaderInfiltration >= 100).length;
                  const conversionRate = totalWorldPopulation > 0 ? (totalConvertedWorld / totalWorldPopulation) * 100 : 0;

                  if (state.victoryGoal === 'OneFlock') {
                    return (
                      <div className="bg-[#171308] border border-[#cfb53b]/20 rounded-lg px-3 py-2.5">
                        <div className="text-[9px] font-mono text-[#cfb53b]/60 uppercase tracking-wider mb-2">🎯 Um Só Rebanho — Superpotências</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {superpowers.map(id => {
                            const c = state.countries.find(x => x.id === id)!;
                            const convPctC = c ? (c.converts / c.population) * 100 : 0;
                            const leaderOk = c?.leaderInfiltration >= 100;
                            const convOk = convPctC >= 50;
                            const done = leaderOk && convOk;
                            return (
                              <div key={id} className={`rounded px-2 py-1.5 border ${done ? 'border-[#cfb53b]/40 bg-amber-950/20' : 'border-zinc-800/40 bg-zinc-900/20'}`}>
                                <div className="flex justify-between items-center">
                                  <span className={`text-[10px] font-bold font-mono ${done ? 'text-[#cfb53b]' : 'text-zinc-400'}`}>{c?.name ?? id}</span>
                                  {done && <span className="text-[9px] text-[#cfb53b]">✓</span>}
                                </div>
                                <div className="flex gap-1 mt-1">
                                  <div className="flex-1">
                                    <div className="text-[8px] font-mono text-[#dfcfa0]/35 mb-0.5">Conv {convPctC.toFixed(1)}%</div>
                                    <div className="h-1 bg-zinc-800 rounded overflow-hidden"><div className={`h-full ${convOk ? 'bg-[#cfb53b]' : 'bg-zinc-600'} transition-all`} style={{ width: `${Math.min(100, convPctC)}%` }} /></div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-[8px] font-mono text-[#dfcfa0]/35 mb-0.5">Líder {c?.leaderInfiltration.toFixed(0)}%</div>
                                    <div className="h-1 bg-zinc-800 rounded overflow-hidden"><div className={`h-full ${leaderOk ? 'bg-sky-400' : 'bg-sky-800'} transition-all`} style={{ width: `${c?.leaderInfiltration ?? 0}%` }} /></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  if (state.victoryGoal === 'TheEnlightened') {
                    return (
                      <div className="bg-[#171308] border border-sky-900/30 rounded-lg px-3 py-2.5">
                        <div className="flex justify-between text-[9px] font-mono text-sky-400/70 uppercase tracking-wider mb-2">
                          <span>🎯 O Iluminado — Líderes</span>
                          <span>{totalInf}/12</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {state.countries.map(c => {
                            const done = c.leaderInfiltration >= 100;
                            return (
                              <div key={c.id} className={`rounded px-1.5 py-1 text-center border ${done ? 'border-sky-600/40 bg-sky-950/30' : 'border-zinc-800/30 bg-zinc-900/20'}`}>
                                <div className={`text-[8px] font-mono truncate ${done ? 'text-sky-300' : 'text-zinc-500'}`}>{c.name.split(' ')[0]}</div>
                                <div className={`text-[9px] font-bold font-mono ${done ? 'text-sky-400' : 'text-zinc-600'}`}>{done ? '✓' : `${c.leaderInfiltration.toFixed(0)}%`}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  if (state.victoryGoal === 'GlobalEcstasy') {
                    return (
                      <div className="bg-[#171308] border border-green-900/30 rounded-lg px-3 py-2.5">
                        <div className="text-[9px] font-mono text-green-400/70 uppercase tracking-wider mb-1.5">🎯 Êxtase Global — Meta: 80%</div>
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span className="text-[#dfcfa0]/50">Progresso</span>
                          <span className="text-green-300 font-bold">{conversionRate.toFixed(4)}% / 80%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-700 to-green-400 transition-all" style={{ width: `${Math.min(100, (conversionRate / 80) * 100)}%` }} />
                        </div>
                      </div>
                    );
                  }
                  if (state.victoryGoal === 'PerpetualPeace') {
                    const safe = state.countries.filter(c => c.violence < 20).length;
                    return (
                      <div className="bg-[#171308] border border-orange-900/30 rounded-lg px-3 py-2.5">
                        <div className="text-[9px] font-mono text-orange-400/70 uppercase tracking-wider mb-2">🎯 Paz Perpétua — Violência &lt; 20%</div>
                        <div className="grid grid-cols-4 gap-1">
                          {state.countries.map(c => {
                            const ok = c.violence < 20;
                            return (
                              <div key={c.id} className={`rounded px-1.5 py-1 text-center border ${ok ? 'border-orange-600/30 bg-orange-950/20' : 'border-zinc-800/30 bg-zinc-900/20'}`}>
                                <div className={`text-[8px] font-mono truncate ${ok ? 'text-orange-300' : 'text-zinc-500'}`}>{c.name.split(' ')[0]}</div>
                                <div className={`text-[9px] font-bold font-mono ${ok ? 'text-orange-400' : 'text-red-500'}`}>{c.violence.toFixed(0)}%</div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-[9px] font-mono text-[#dfcfa0]/40 mt-1.5">{safe}/12 países pacíficos</div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* B — Mini país grid */}
                <div className="bg-[#171308] border border-[#cfb53b]/15 rounded-lg px-3 py-2.5">
                  <div className="text-[9px] font-mono text-[#cfb53b]/60 uppercase tracking-wider mb-2">🗺️ Status por País</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {state.countries.map(c => {
                      const pct = c.population > 0 ? (c.converts / c.population) * 100 : 0;
                      const barColor = pct >= 50 ? 'bg-[#cfb53b]' : pct > 0 ? 'bg-amber-700' : 'bg-zinc-700';
                      const textColor = pct >= 50 ? 'text-[#cfb53b]' : pct > 0 ? 'text-amber-600' : 'text-zinc-600';
                      const hasTemple = (c.temples ?? []).some(t => t > 0);
                      const leaderDone = c.leaderInfiltration >= 100;
                      return (
                        <div key={c.id} className="bg-black/20 border border-[#cfb53b]/8 rounded px-1.5 py-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-mono text-[#dfcfa0]/50 truncate">{c.name}</span>
                            <span className="text-[8px] shrink-0 ml-0.5">
                              {leaderDone ? '👑' : hasTemple ? '⛪' : ''}
                            </span>
                          </div>
                          <div className={`text-[10px] font-bold font-mono ${textColor}`}>{pct >= 1 ? `${pct.toFixed(1)}%` : pct > 0 ? `${pct.toFixed(3)}%` : '—'}</div>
                          <div className="h-0.5 bg-zinc-800 rounded overflow-hidden mt-0.5">
                            <div className={`h-full ${barColor} transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                </>}

                {faithSubTab === 'doutrinas' && ((() => {
                  const doctrines = state.doctrines ?? [];
                  const costMap = { basic: { faith: 150, fervor: 30 }, intermediate: { faith: 250, fervor: 60 }, strategic: { faith: 400, fervor: 100 } };
                  const tierLabel = { basic: 'Básica', intermediate: 'Intermediária', strategic: 'Estratégica' };
                  const tierBg = { basic: 'border-amber-700/25 bg-amber-950/10', intermediate: 'border-orange-700/25 bg-orange-950/10', strategic: 'border-red-800/25 bg-red-950/10' };
                  const tierTag = { basic: 'text-amber-400 border-amber-700/40', intermediate: 'text-orange-400 border-orange-700/40', strategic: 'text-red-400 border-red-700/40' };
                  const universalDocs = doctrines.filter(d => d.section === 'universal');
                  const socialDocs = doctrines.filter(d => d.section === 'social');

                  // Map tier to required phase
                  const tierPhase: Record<string, number> = { basic: 1, intermediate: 2, strategic: 3 };
                  const phaseReqLabel: Record<number, string> = { 2: 'Credo Estabelecido', 3: 'Era da Transcendência' };

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

                  // Separate locked from unlocked per section
                  const renderSection = (docs: DoctrineChoice[], sectionLabel: string) => {
                    const unlocked = docs.filter(d => (tierPhase[d.tier] ?? 1) <= (state.faithPhase ?? 1));
                    const lockedByPhase: Record<number, DoctrineChoice[]> = {};
                    docs.filter(d => (tierPhase[d.tier] ?? 1) > (state.faithPhase ?? 1)).forEach(d => {
                      const ph = tierPhase[d.tier] ?? 2;
                      if (!lockedByPhase[ph]) lockedByPhase[ph] = [];
                      lockedByPhase[ph].push(d);
                    });
                    return (
                      <>
                        <p className="text-[9px] font-mono uppercase text-[#dfcfa0]/35 tracking-widest mb-2">{sectionLabel}</p>
                        {unlocked.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            {unlocked.map(renderDoc)}
                          </div>
                        )}
                        {Object.entries(lockedByPhase).map(([ph, locked]) => (
                          <div key={ph} className="mb-2 border border-zinc-800/40 rounded-lg px-3 py-2 bg-zinc-900/10">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">
                                🔒 {phaseReqLabel[Number(ph)]}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-700">{locked.length} posições bloqueadas</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {locked.map(d => (
                                <span key={d.id} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-600 border border-zinc-700/30">
                                  {d.topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    );
                  };

                  const chosenCount = doctrines.filter(d => d.chosen !== null).length;
                  return (
                    <div className="bg-[#171308] border border-[#cfb53b]/15 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#cfb53b] font-serif">⚖️ Posições Doutrinárias</h4>
                        <span className="text-[9px] font-mono text-[#dfcfa0]/40">{chosenCount} / {doctrines.length} definidas</span>
                      </div>
                      <p className="text-[10px] text-[#dfcfa0]/45 mb-4 leading-relaxed">Cada decisão é <strong className="text-[#cfb53b]/70">permanente e irreversível</strong>.</p>
                      {renderSection(universalDocs, 'Posições Universais (1–20)')}
                      <div className="mb-2" />
                      {renderSection(socialDocs, 'Estrutura Social (21–30)')}
                    </div>
                  );
                })())}
              </div>
            );
          })()}

        </div>
        )}
        </div>
        )}

      </main>

      {/* 4. BOTTOM NAVIGATION BAR */}
      <nav className="shrink-0 bg-[#0e0b04] border-t-2 border-[#cfb53b]/30 z-20">
        <div className="max-w-7xl mx-auto flex">
          {([
            { id: 'map',     icon: <Map className="w-5 h-5" />,       label: 'Mapa' },
            { id: 'dogmas',  icon: <ScrollText className="w-5 h-5" />, label: 'Dogmas' },
            { id: 'leaders', icon: <Crown className="w-5 h-5" />,      label: 'Poder' },
            { id: 'rival',   icon: <Skull className="w-5 h-5" />,      label: 'Rival' },
            { id: 'faith',   icon: <Sparkles className="w-5 h-5" />,   label: 'Fé' },
            { id: 'guide',   icon: <BookOpen className="w-5 h-5" />,   label: 'Guia' },
          ] as const).map(({ id, icon, label }) => {
            const isActive = activeTab === id;
            const hasDanger = id === 'rival' && state.rivalProgress > 75;
            return (
              <button
                key={id}
                onClick={() => { playSound('click'); setActiveTab(id); }}
                className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all cursor-pointer border-t-2 ${
                  isActive
                    ? 'border-t-[#cfb53b] text-[#cfb53b] bg-[#1a1508]'
                    : 'border-t-transparent text-[#dfcfa0]/40 hover:text-[#dfcfa0]/70 hover:bg-[#141108]/60'
                }`}
              >
                {hasDanger && (
                  <span className="absolute top-1.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
                <span className={isActive ? 'text-[#cfb53b]' : 'text-[#dfcfa0]/40'}>{icon}</span>
                <span className="text-[9px] font-mono uppercase tracking-wider">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* INTERACTIVE TUTORIAL OVERLAY */}
      {showTutorial && !state.isGameOver && (() => {
        const goalDescriptions: Record<string, string> = {
          GlobalEcstasy: 'converter 80% da humanidade',
          PerpetualPeace: 'reduzir violência abaixo de 20 em todas as nações',
          OneFlock: 'controlar as 4 superpotências (EUA, China, Índia, Alemanha)',
          TheEnlightened: 'converter todos os 12 líderes mundiais',
        };
        const steps = [
          `Bem-vindo ao TEOLOGICO! Você fundou uma nova religião. Seu objetivo: ${goalDescriptions[state.victoryGoal] ?? state.victoryGoal}. Clique em um país no mapa para começar.`,
          'Selecione um país e use "Missionar" para enviar missionários. Isso aumenta seus Fiéis.',
          'Acumule Fé realizando ações. Use Fé para comprar Dogmas na aba Dogmas.',
          'Construa Templos para acelerar a conversão e gerar Dízimos.',
          'Converta o Líder do país para ganhar bônus poderosos — mas é muito difícil!',
        ];
        const isLast = tutorialStep >= steps.length - 1;
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-[#1c1608] border-2 border-[#cfb53b] rounded-xl p-6 flex flex-col gap-4 shadow-[0_0_40px_rgba(207,181,59,0.3)]">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#cfb53b]/60">
                  Passo {tutorialStep + 1} / {steps.length}
                </span>
                <button onClick={() => { localStorage.setItem('tutorial_seen', 'true'); setShowTutorial(false); }} className="text-[#cfb53b]/40 hover:text-[#cfb53b] cursor-pointer transition-colors text-xs">✕</button>
              </div>
              <p className="text-sm text-[#dfcfa0]/90 leading-relaxed font-serif">
                {steps[tutorialStep]}
              </p>
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={() => setTutorialStep(s => Math.max(0, s - 1))}
                  disabled={tutorialStep === 0}
                  className="px-3 py-1.5 text-xs border border-[#cfb53b]/30 rounded text-[#dfcfa0]/60 hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>
                {isLast ? (
                  <button
                    onClick={() => { localStorage.setItem('tutorial_seen', 'true'); setShowTutorial(false); }}
                    className="px-4 py-1.5 text-xs bg-[#cfb53b] text-[#1e1a0c] font-bold rounded uppercase tracking-wider cursor-pointer hover:bg-[#e6ca4a] transition-colors"
                  >
                    Entendido
                  </button>
                ) : (
                  <button
                    onClick={() => setTutorialStep(s => Math.min(steps.length - 1, s + 1))}
                    className="px-4 py-1.5 text-xs bg-[#cfb53b] text-[#1e1a0c] font-bold rounded uppercase tracking-wider cursor-pointer hover:bg-[#e6ca4a] transition-colors"
                  >
                    Próximo →
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
                {state.eventActive.actionEffects.globalConvertsModPct !== undefined && (
                  <li className="text-red-400/90 font-mono">
                    • Devotos global: {state.eventActive.actionEffects.globalConvertsModPct}% (apostasia em massa)
                  </li>
                )}
                {Object.entries(state.eventActive.actionEffects.countryConvertsMod || {}).map(([cid, val]) => {
                  const cname = state.countries.find(c => c.id === cid)?.name || cid;
                  const numVal = val as number;
                  return (
                    <li key={cid} className={numVal > 0 ? "text-green-400/90 font-mono" : "text-red-400/90 font-mono"}>
                      • Devotos em {cname}: {numVal > 0 ? `+${numVal.toLocaleString()}` : `${numVal.toLocaleString()}`}
                    </li>
                  );
                })}
                {Object.entries(state.eventActive.actionEffects.countryConvertsModPct || {}).map(([cid, val]) => {
                  const cname = state.countries.find(c => c.id === cid)?.name || cid;
                  const numVal = val as number;
                  return (
                    <li key={cid} className={numVal > 0 ? "text-green-400/90 font-mono" : "text-red-400/90 font-mono"}>
                      • Devotos em {cname}: {numVal > 0 ? `+${numVal}%` : `${numVal}%`}
                    </li>
                  );
                })}
                {state.eventActive.actionEffects.globalFaithCostMod !== undefined && (
                  <li className="text-red-400/90 font-mono">
                    • Fé perdida: {state.eventActive.actionEffects.globalFaithCostMod}
                  </li>
                )}
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

      {/* FAITH PHASE ADVANCEMENT NOTIFICATION */}
      {phaseNotification && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fade-in">
          <div className={`w-full max-w-md border-2 p-6 rounded-xl text-center shadow-[0_0_60px_rgba(207,181,59,0.3)] flex flex-col gap-4 ${phaseNotification === 3 ? 'bg-[#1a0808] border-red-700' : 'bg-[#1a1208] border-orange-700'}`}>
            <div className={`text-[10px] uppercase font-bold tracking-widest font-mono ${phaseNotification === 3 ? 'text-red-400' : 'text-orange-400'}`}>
              ✨ Marco Histórico — Fase {phaseNotification} de 3
            </div>
            <div className={`text-2xl font-bold font-serif ${phaseNotification === 3 ? 'text-red-300' : 'text-orange-300'}`}>
              {phaseNotification === 2 ? 'Credo Estabelecido' : 'Era da Transcendência'}
            </div>
            <p className="text-sm text-[#dfcfa0]/80 leading-relaxed">
              {phaseNotification === 2
                ? 'Sua fé saiu das sombras e se tornou uma religião organizada. Dogmas e doutrinas intermediárias foram revelados. O mundo começa a reagir à sua presença.'
                : 'Metade da humanidade foi alcançada. Sua fé transcendeu fronteiras e culturas. Os dogmas mais poderosos estão agora ao seu alcance.'}
            </p>
            <div className={`text-xs font-mono px-3 py-2 rounded border ${phaseNotification === 3 ? 'border-red-800/50 bg-red-950/30 text-red-300' : 'border-orange-800/50 bg-orange-950/30 text-orange-300'}`}>
              {phaseNotification === 2 ? '🔓 Dogmas Intermediários desbloqueados\n🔓 Doutrinas Intermediárias reveladas' : '🔓 Dogmas Estratégicos desbloqueados\n🔓 Doutrinas Estratégicas reveladas'}
            </div>
            <button
              onClick={() => { setPhaseNotification(null); setState(prev => ({ ...prev, paused: false })); }}
              className={`py-2.5 px-6 font-extrabold uppercase rounded-lg text-xs tracking-widest mt-1 cursor-pointer transition-all ${phaseNotification === 3 ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-orange-700 hover:bg-orange-600 text-white'}`}
            >
              Continuar a Missão
            </button>
          </div>
        </div>
      )}

      {/* TEMPLE SPECIALIZATION CHOICE MODAL (C) */}
      {specChoiceCountryId && (() => {
        const specCountry = state.countries.find(c => c.id === specChoiceCountryId);
        if (!specCountry) return null;
        const specTempleLevel = Math.max(0, ...(specCountry.temples ?? [0,0,0,0]).map((n,i) => n > 0 ? i+1 : 0));
        const templeName = TEMPLE_NAMES[state.religionTrait]?.[specTempleLevel - 1] ?? 'Templo';
        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fade-in">
            <div className="w-full max-w-md bg-[#1a1208] border-2 border-[#cfb53b] p-6 rounded-xl text-center shadow-[0_0_40px_rgba(207,181,59,0.2)] flex flex-col gap-4">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#cfb53b] font-mono">Especialização de Templo</div>
              <div className="text-sm font-bold text-[#dfcfa0]">{templeName} concluído em {specCountry.name}!</div>
              <div className="text-xs text-[#dfcfa0]/70">Escolha o foco desta estrutura sagrada:</div>
              <div className="flex flex-col gap-3 mt-1">
                <button
                  onClick={() => {
                    setState(prev => ({ ...prev, countries: prev.countries.map(c => c.id === specChoiceCountryId ? { ...c, templeSpec: 'conversion' } : c) }));
                    setSpecChoiceQueue(q => q.slice(1));
                  }}
                  className="py-3 px-4 rounded-lg bg-[#1a2a1a] border border-green-700/50 text-green-300 text-xs font-bold hover:bg-[#213021] transition-all text-left flex flex-col gap-1"
                >
                  <span>⚡ Expansão da Fé</span>
                  <span className="text-[10px] text-green-400/70 font-normal">+20% velocidade de conversão neste país permanentemente</span>
                </button>
                <button
                  onClick={() => {
                    setState(prev => ({ ...prev, countries: prev.countries.map(c => c.id === specChoiceCountryId ? { ...c, templeSpec: 'resistance' } : c) }));
                    setSpecChoiceQueue(q => q.slice(1));
                  }}
                  className="py-3 px-4 rounded-lg bg-[#1a1a2a] border border-blue-700/50 text-blue-300 text-xs font-bold hover:bg-[#21213a] transition-all text-left flex flex-col gap-1"
                >
                  <span>🛡️ Bastião da Doutrina</span>
                  <span className="text-[10px] text-blue-400/70 font-normal">-0.5 resistência adicional por ciclo neste país permanentemente</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* First Temple celebration modal */}
      {firstTempleModal && (
        <FirstTempleModal
          religionName={state.religionName}
          trait={state.religionTrait}
          countryName={firstTempleModal.countryName}
          onClose={() => setFirstTempleModal(null)}
        />
      )}

      {/* 4a. VICTORY SCREEN — full immersive overlay */}
      {state.isGameOver && state.gameOverReason === 'victory' && (
        <VictoryScreen
          state={state}
          onNewGame={handleResetGame}
          onViewWorld={() => setState(prev => ({ ...prev, isGameOver: false, paused: true }))}
        />
      )}

      {/* 4b. DEFEAT SCREEN */}
      {state.isGameOver && state.gameOverReason !== 'victory' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="gameover-overlay">
          <div className="w-full max-w-lg bg-[#211a0c] border-4 border-[#cfb53b] p-6 rounded-xl text-center shadow-[0_0_50px_rgba(207,181,59,0.3)] flex flex-col gap-5">
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

            <button
              onClick={handleResetGame}
              className="py-3 px-6 bg-[#cfb53b] hover:bg-[#e6ca4a] text-[#1e1a0c] font-extrabold uppercase rounded-lg shadow-md cursor-pointer text-sm font-sans tracking-widest mt-2 active:scale-95 transition-all"
            >
              Iniciar Nova Gênese
            </button>
          </div>
        </div>
      )}

      {/* Save/Load toast notification */}
      {saveToast && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg border text-xs font-mono font-bold shadow-lg animate-fade-in pointer-events-none ${
          saveToast.ok
            ? 'bg-green-950 border-green-700/60 text-green-300'
            : 'bg-red-950 border-red-700/60 text-red-300'
        }`}>
          {saveToast.ok ? '✓' : '✗'} {saveToast.msg}
        </div>
      )}

    </div>
  );
}
