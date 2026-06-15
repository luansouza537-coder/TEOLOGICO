/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ReligionTrait, VictoryGoalType, Country, Dogma, GameEvent, GameState } from './types';
import { INITIAL_COUNTRIES, INITIAL_DOGMAS, RANDOM_EVENTS_POOL } from './data/gameData';
import CreationScreen from './components/CreationScreen';
import WorldMap from './components/WorldMap';
import DogmasPanel from './components/DogmasPanel';
import LeadersPanel from './components/LeadersPanel';
import RivalPanel from './components/RivalPanel';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Gamepad2, Info, BookOpen, AlertTriangle } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('religion_simulator_state_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure reset doesn't freeze the screen if it was loaded as paused/gameover
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
      lastEventCycle: -99,
      lastEventTimestamp: 0,
      eventCooldowns: {}
    };
  });

  const [activeTab, setActiveTab] = useState<'map' | 'dogmas' | 'leaders' | 'rival'>('map');
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

        const usaLeaderConverted = isLeaderConverted('usa');
        const japanLeaderConverted = isLeaderConverted('japan');
        const brassilLeaderConverted = isLeaderConverted('brazil');
        const russiaLeaderConverted = isLeaderConverted('russia');
        const saudiLeaderConverted = isLeaderConverted('saudi_arabia');

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

          if (converts > 0) {
            // Base growth compound rate per cycle
            let growthFactor = 0.007;

            // Apply religion core trait influence
            if (prev.religionTrait === 'Syncretist') {
              // Slower globally but accepted in open societies
              if (['liberal', 'estavel', 'democracia'].includes(c.regimeType)) {
                growthFactor *= 0.78; // 0.65 * 1.2 ≈ slight boost in democracies vs oppressive
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

            // Core expansion factor hindered by local hostility (resistance slows down conversion)
            const hostilityMultiplier = 1 - (resistance / 100);
            
            // Calculate converts to add
            const addedConverts = Math.floor((pop - converts) * growthFactor * Math.max(0.01, hostilityMultiplier)) + 120;
            converts = Math.min(pop, converts + addedConverts);

            // Natural passive leader conversion (very slow)
            if (leaderInfiltration < 100) {
              let leaderGrowth = 0.2; // 0.2% basic conversion speed per cycle
              if (hasLobbyPolitico) leaderGrowth *= 2.0;
              if (hasEcumenicalAlliance) leaderGrowth *= 1.3;
              
              leaderInfiltration = Math.min(100, leaderInfiltration + leaderGrowth);
            }
          }

          // Limit resistance based on Syncretist doctrine rule (resistance global never crosses 60%, can set to 50% max with panteao_aberto)
          const limitResistance = hasPanteaoAberto ? 50 : 60;
          if (prev.religionTrait === 'Syncretist' && resistance > limitResistance) {
            resistance = limitResistance;
          }

          // Leaders converted affect resistance
          if (saudiLeaderConverted && c.id === 'saudi_arabia') {
            resistance = 0;
          }

          if (hasBorderSantiago && c.id === 'egypt') {
            // bypass Egito closed border penalty
          }

          totalConvertsCount += converts;
          totalPopCount += pop;
          totalResistanceSum += resistance;
          totalViolenceSum += violence;

          return { ...c, converts, resistance, violence, leaderInfiltration };
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
        if (connectedIds.length > 0 && Math.random() < 0.15) {
          const sourceId = connectedIds[Math.floor(Math.random() * connectedIds.length)];
          // Find candidates with 0 followers
          const candidates = updatedCountries.filter((c) => c.converts === 0);
          if (candidates.length > 0) {
            const target = candidates[Math.floor(Math.random() * candidates.length)];
            
            // Validate closed boundaries (Egito, Arabia Saudita, Australia require active transmission if dogmas aren't in place)
            let allowed = true;
            if (target.id === 'australia' && !hasBorderSantiago) allowed = false;
            if (target.id === 'egypt' && !hasBorderSantiago) allowed = false;
            
            if (allowed) {
              const targetIdx = updatedCountries.findIndex((c) => c.id === target.id);
              if (targetIdx !== -1) {
                updatedCountries[targetIdx] = { ...updatedCountries[targetIdx], converts: 100 };
              }
              prev.logs.unshift(`Dispersão: Missionários que cruzaram de ${sourceId.toUpperCase()} semearam os primeiros cultos em ${target.name}!`);
            }
          }
        }

        // 3. Currency accumulations
        // Base Faith gain: 4 + converters bonus
        const convertedRate = totalPopCount > 0 ? (totalConvertsCount / totalPopCount) : 0;
        let faithGained = 4;
        faithGained += Math.floor(totalConvertsCount / 10000000); // 1 point of faith for every 10M converts
        if (hasTemploAbrigo) faithGained += 5;
        if (hasDigitalPreaching) faithGained += 2;
        if (hasCirculosEstudo) faithGained += 5;
        if (hasSelosSolidariedade) faithGained += 5;
        if (hasMercadosPartilha) faithGained += 3;
        if (hasLigaBenfeitores) faithGained += 10;
        if (hasCronicasColapso) faithGained += 5;
        if (usaLeaderConverted) faithGained = Math.floor(faithGained * 1.4);
        if (japanLeaderConverted) faithGained = Math.floor(faithGained * 1.2);

        // Fervor gained: generated based on average global resistance (persecution turns values into power!)
        const avgResistance = totalResistanceSum / updatedCountries.length;
        let fervorGained = 0;
        if (avgResistance > 35) {
          fervorGained += Math.floor(avgResistance / 25);
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
        if (hasRelogioJuizo) fervorGained += 15;

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
        if (hasRelogioJuizo) rivalIncrement *= 0.7;

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
                // If value is positive, add proportional population or raw
                const mod = picked.actionEffects.countryConvertsMod[c.id];
                if (mod > 0) {
                  if (c.converts === 0) c.converts = 1000;
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

        const nextCycle = prev.cycle + 1;
        const updatedEventCooldowns = newlyTriggeredEvent
          ? { ...prev.eventCooldowns, [newlyTriggeredEvent.id]: prev.cycle }
          : prev.eventCooldowns;

        return {
          ...prev,
          cycle: nextCycle,
          faith: prev.faith + faithGained,
          fervor: prev.fervor + fervorGained,
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
      // Clean previous logs and followers
      if (c.id === 'usa') {
        return { ...c, converts: 120, leaderInfiltration: 5, resistance: 15, violence: 45 };
      }
      return { ...c, converts: 0, leaderInfiltration: 0 };
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
      lastEventCycle: -99,
      lastEventTimestamp: 0,
      eventCooldowns: {}
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
      countries: INITIAL_COUNTRIES.map(c => ({ ...c, converts: c.id === 'usa' ? 120 : 0, leaderInfiltration: c.id === 'usa' ? 5 : 0 })),
      logs: ['Espaço cósmico silencioso. Inicie seu Credo para ver o desenrolar da fé.'],
      eventActive: null,
      rivalProgress: 0,
      rivalName: 'A Ordem Tecnocrática',
      resistanceStreak: 0,
      isGameOver: false,
      gameOverReason: null,
      lastEventCycle: -99,
      lastEventTimestamp: 0,
      eventCooldowns: {}
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

    if (state.faith < cost) return;

    // Trigger visual floating text feedback on country coordinates
    addFloatingText(`-${cost} Fé`, countryObj.coordinates.x, countryObj.coordinates.y, "text-red-500 font-bold font-mono", countryObj.id);
    addFloatingText("+Semeado!", countryObj.coordinates.x, countryObj.coordinates.y - 5, "text-[#cfb53b] font-bold font-mono", countryObj.id);

    setState((prev) => {
      const country = prev.countries.find((c) => c.id === countryId);
      if (!country) return prev;

      const updated = prev.countries.map((c) => {
        if (c.id === countryId) {
          // If first seeding, set followers to 8,000, else add a solid pocket
          const currentConverts = c.converts;
          const newConverts = currentConverts === 0 ? 8000 : Math.min(c.population, currentConverts + 200000);
          return { ...c, converts: newConverts, resistance: Math.max(0, c.resistance - 2) };
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

  // Action callback 2: Pacify Country (reduce violence)
  const pacifyCountry = (countryId: string) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj || state.faith < 25) return;

    // Trigger visual floating text feedback on country coordinates
    addFloatingText("-25 Fé", countryObj.coordinates.x, countryObj.coordinates.y, "text-red-500 font-bold font-mono", countryObj.id);
    addFloatingText("Pacificado!", countryObj.coordinates.x, countryObj.coordinates.y - 5, "text-green-500 font-bold font-mono", countryObj.id);

    setState((prev) => {
      const country = prev.countries.find((c) => c.id === countryId);
      if (!country) return prev;

      const updated = prev.countries.map((c) => {
        if (c.id === countryId) {
          return { ...c, violence: Math.max(0, c.violence - 18) };
        }
        return c;
      });

      playSound('click');
      return {
        ...prev,
        faith: prev.faith - 25,
        countries: updated,
        logs: [`[AÇÃO] Púlpitos locais em ${country.name} proclamam harmonia social. Criminalidade cai!`, ...prev.logs]
      };
    });
  };

  // Action callback 3: Infiltrate Country Leader
  const infiltrateLeader = (countryId: string) => {
    const countryObj = state.countries.find((c) => c.id === countryId);
    if (!countryObj) return;

    let baseFaith = 40;
    let baseFervor = 15;
    if (countryObj.id === 'japan') baseFaith -= 10;
    if (countryObj.id === 'russia') baseFaith -= 5;

    // Grande Julgamento: -50% custo globalmente
    const hasGrandeJulgamento = state.dogmas.some(d => d.id === 'reforma_escatologica' && d.purchased);
    if (hasGrandeJulgamento) { baseFaith = Math.floor(baseFaith * 0.5); baseFervor = Math.floor(baseFervor * 0.5); }

    // Vidente das Nações: -25% custo adicional em opressores/autoritários
    const hasVidenteNacoesActive = state.dogmas.some(d => d.id === 'vidente_nacoes' && d.purchased);
    if (hasVidenteNacoesActive && ['opressor', 'autoritario'].includes(countryObj.regimeType)) {
      baseFaith = Math.floor(baseFaith * 0.75);
    }

    if (state.faith < baseFaith || state.fervor < baseFervor) return;

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
