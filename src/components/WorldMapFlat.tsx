/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Country, ReligionTrait } from '../types';
import { Eye, EyeOff, Map } from 'lucide-react';

const TRAIT_PALETTE: Record<ReligionTrait, { accent: string; glow: string; symbol: string; label: string }> = {
  Mistical:   { accent: '#9b59b6', glow: '#9b59b6aa', symbol: '✦', label: 'Mística'    },
  Prophetic:  { accent: '#3b82f6', glow: '#3b82f6aa', symbol: '⚡', label: 'Profética'  },
  Activist:   { accent: '#ef4444', glow: '#ef4444aa', symbol: '✊', label: 'Ativista'   },
  Syncretist: { accent: '#14b8a6', glow: '#14b8a6aa', symbol: '☯', label: 'Sincretista' },
};

type MapStyle = 'voyager' | 'claro' | 'escuro' | 'satelite' | 'relevo';

const MAP_STYLES: { id: MapStyle; label: string; url: string; subdomains?: string; attribution: string }[] = [
  {
    id: 'escuro',
    label: 'ESC',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  {
    id: 'voyager',
    label: 'VOY',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  {
    id: 'claro',
    label: 'CLA',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  {
    id: 'satelite',
    label: 'SAT',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; Earthstar Geographics',
  },
  {
    id: 'relevo',
    label: 'REL',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    attribution: '&copy; OpenTopoMap &copy; OpenStreetMap',
  },
];

interface WorldMapFlatProps {
  countries: Country[];
  selectedCountryId: string | null;
  onSelectCountry: (id: string) => void;
  floatingTexts?: { id: number; text: string; x: number; y: number; colorClass: string; countryId?: string }[];
  trait: ReligionTrait;
  victoryProgress: { current: number; target: number; label: string };
}

const COUNTRY_POSITIONS: Record<string, { lat: number; lon: number; name: string }> = {
  usa:          { lat: 37.09,  lon: -95.71,  name: 'EUA' },
  china:        { lat: 35.86,  lon: 104.19,  name: 'China' },
  india:        { lat: 20.59,  lon: 78.96,   name: 'Índia' },
  germany:      { lat: 51.16,  lon: 10.45,   name: 'Alemanha' },
  brazil:       { lat: -14.23, lon: -51.92,  name: 'Brasil' },
  russia:       { lat: 61.52,  lon: 105.31,  name: 'Rússia' },
  egypt:        { lat: 26.82,  lon: 30.80,   name: 'Egito' },
  south_africa: { lat: -30.55, lon: 22.93,   name: 'África do Sul' },
  japan:        { lat: 36.20,  lon: 138.25,  name: 'Japão' },
  mexico:       { lat: 23.63,  lon: -102.55, name: 'México' },
  saudi_arabia: { lat: 23.88,  lon: 45.07,   name: 'Arábia Saudita' },
  australia:    { lat: -25.27, lon: 133.77,  name: 'Austrália' },
  turkey:       { lat: 38.96,  lon: 35.24,   name: 'Turquia' },
  iran:         { lat: 32.43,  lon: 53.69,   name: 'Irã' },
  south_korea:  { lat: 35.91,  lon: 127.77,  name: 'Coreia do Sul' },
  indonesia:    { lat: -0.79,  lon: 113.92,  name: 'Indonésia' },
  nigeria:      { lat: 9.08,   lon: 8.67,    name: 'Nigéria' },
  haiti:        { lat: 18.97,  lon: -72.28,  name: 'Haiti' },
  ukraine:      { lat: 48.38,  lon: 31.17,   name: 'Ucrânia' },
  ethiopia:     { lat: 9.14,   lon: 40.49,   name: 'Etiópia' },
  philippines:  { lat: 12.88,  lon: 121.77,  name: 'Filipinas' },
  colombia:     { lat: 4.57,   lon: -74.29,  name: 'Colômbia' },
  cuba:         { lat: 21.52,  lon: -77.78,  name: 'Cuba' },
};

function getMarkerColor(country: Country): string {
  const pct = country.population > 0 ? country.converts / country.population : 0;
  if (pct >= 0.5) return '#cfb53b';
  if (pct > 0) return '#b46f1f';
  return '#3a2e12';
}

function createCountryIcon(country: Country, isSelected: boolean, showLabels: boolean, trait: ReligionTrait): L.DivIcon {
  const color = getMarkerColor(country);
  const palette = TRAIT_PALETTE[trait];
  const border = isSelected ? palette.accent : '#cfb53b';
  const size = isSelected ? 18 : 14;
  const borderWidth = isSelected ? 3 : 1.5;
  const glowColor = isSelected ? palette.glow : `${color}88`;

  const hasTemple = (country.temples ?? []).some(t => t > 0);
  const hasLeader = (country.leaderInfiltration ?? 0) >= 100;
  const hasConverts = country.converts > 0;

  const convertsStr = showLabels && country.converts >= 1_000
    ? (country.converts >= 1_000_000
      ? `${(country.converts / 1_000_000).toFixed(1)}M`
      : `${Math.round(country.converts / 1000)}K`)
    : '';

  const templeIcon = hasTemple ? `<span style="font-size:8px;position:absolute;top:-10px;left:50%;transform:translateX(-50%)">⛪</span>` : '';
  // Leader icon takes priority; else show trait symbol on active countries
  const innerIcon = hasLeader
    ? `<span style="font-size:7px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff8dc">✦</span>`
    : (hasConverts && !hasLeader
      ? `<span style="font-size:6px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:${palette.accent};opacity:0.9">${palette.symbol}</span>`
      : '');

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      ${templeIcon}
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border:${borderWidth}px solid ${border};
        border-radius:50%;
        position:relative;
        box-shadow:0 0 ${isSelected ? '8px 2px' : '4px 1px'} ${glowColor};
      ">${innerIcon}</div>
      ${convertsStr ? `<div style="position:absolute;top:${size+1}px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:8px;font-family:monospace;color:#cfb53b;text-shadow:0 0 3px #000,0 0 3px #000;pointer-events:none">${convertsStr}</div>` : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size],
  });
}

export default function WorldMapFlat({ countries, selectedCountryId, onSelectCountry, floatingTexts = [], trait, victoryProgress }: WorldMapFlatProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyle>('escuro');

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 10],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      minZoom: 1,
      maxZoom: 6,
    });

    // Default tile layer (escuro)
    const defaultStyle = MAP_STYLES.find(s => s.id === 'escuro')!;
    const tile = L.tileLayer(defaultStyle.url, {
      attribution: defaultStyle.attribution,
      subdomains: defaultStyle.subdomains ?? '',
      maxZoom: 20,
    }).addTo(map);
    tileLayerRef.current = tile;

    // Attribution control (small, bottom right)
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when countries or selection or showLabels changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    countries.forEach(c => {
      const pos = COUNTRY_POSITIONS[c.id];
      if (!pos) return;
      const isSelected = c.id === selectedCountryId;
      const icon = createCountryIcon(c, isSelected, showLabels, trait);

      if (markersRef.current[c.id]) {
        markersRef.current[c.id].setIcon(icon);
      } else {
        const marker = L.marker([pos.lat, pos.lon], { icon })
          .addTo(map)
          .on('click', () => onSelectCountry(c.id));
        markersRef.current[c.id] = marker;
      }
    });
  }, [countries, selectedCountryId, onSelectCountry, showLabels, trait]);

  // Swap tile layer when mapStyle changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const style = MAP_STYLES.find(s => s.id === mapStyle)!;
    const tile = L.tileLayer(style.url, {
      attribution: style.attribution,
      subdomains: style.subdomains ?? '',
      maxZoom: 20,
    }).addTo(map);
    tileLayerRef.current = tile;
  }, [mapStyle]);

  // Pan to selected country
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCountryId) return;
    const pos = COUNTRY_POSITIONS[selectedCountryId];
    if (pos) map.panTo([pos.lat, pos.lon], { animate: true, duration: 0.5 });
  }, [selectedCountryId]);

  return (
    <div className="w-full flex flex-col bg-[#0e0b04]" style={{ height: '100%', minHeight: '220px' }}>

      {/* Toolbar — above map */}
      <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-[#0a0802] border-b border-[#cfb53b]/15">
        {MAP_STYLES.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => setMapStyle(s.id)}
            className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
              mapStyle === s.id
                ? 'bg-[#cfb53b] text-[#1e1a0c] border-[#cfb53b] font-bold'
                : 'bg-transparent text-[#cfb53b]/50 border-[#cfb53b]/20 hover:text-[#cfb53b]'
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          className="p-0.5 rounded border border-[#cfb53b]/20 text-[#cfb53b]/50 hover:text-[#cfb53b] transition-colors cursor-pointer ml-auto"
          onClick={() => setShowLabels(v => !v)}
          title="Mostrar/ocultar contagem de fiéis"
        >
          {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
      </div>

      {/* Leaflet map — fills remaining space, positioned relatively for HUD overlay */}
      <div className="relative flex-1 min-h-0 w-full">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Victory Progress HUD — top-right overlay above map tiles */}
        <div
          className="absolute top-2 right-2 z-[400] pointer-events-none
                     flex items-center gap-2 rounded-lg px-2.5 py-1.5"
          style={{ background: 'rgba(14,11,4,0.82)', border: `1px solid ${TRAIT_PALETTE[trait].accent}44`, backdropFilter: 'blur(4px)' }}
        >
          <span style={{ color: TRAIT_PALETTE[trait].accent, fontSize: '11px' }}>{TRAIT_PALETTE[trait].symbol}</span>
          <div className="flex flex-col gap-0.5" style={{ minWidth: '100px' }}>
            <span className="font-mono uppercase tracking-wider text-[#dfcfa0]/50" style={{ fontSize: '8px' }}>Meta de Vitória</span>
            <span className="font-mono font-bold text-[#cfb53b]" style={{ fontSize: '10px' }}>{victoryProgress.label}</span>
            <div className="rounded-full overflow-hidden border border-[#cfb53b]/10" style={{ height: '3px', background: '#1a1505' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (victoryProgress.current / victoryProgress.target) * 100)}%`,
                  background: `linear-gradient(90deg, ${TRAIT_PALETTE[trait].accent}, #cfb53b)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legend — below map */}
      <div className="shrink-0 flex justify-between items-center bg-[#0a0802] border-t px-3 py-1 text-[8px] font-mono text-[#dfcfa0]/50 select-none flex-wrap gap-y-0.5"
        style={{ borderColor: `${TRAIT_PALETTE[trait].accent}30` }}>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3a2e12] border border-[#cfb53b]/50 inline-block" /> Inativo</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#b46f1f] border border-[#cfb53b] inline-block" /> Semeado</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#cfb53b] border border-white inline-block" /> Dominante</span>
        <span className="flex items-center gap-1">⛪ Templo</span>
        <span className="flex items-center gap-1">✦ Líder</span>
        <span className="flex items-center gap-1" style={{ color: TRAIT_PALETTE[trait].accent }}>
          {TRAIT_PALETTE[trait].symbol} {TRAIT_PALETTE[trait].label}
        </span>
      </div>
    </div>
  );
}
