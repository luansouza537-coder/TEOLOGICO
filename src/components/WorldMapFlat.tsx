/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Country } from '../types';
import { Eye, EyeOff, Map } from 'lucide-react';

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
};

function getMarkerColor(country: Country): string {
  const pct = country.population > 0 ? country.converts / country.population : 0;
  if (pct >= 0.5) return '#cfb53b';
  if (pct > 0) return '#b46f1f';
  return '#3a2e12';
}

function createCountryIcon(country: Country, isSelected: boolean, showLabels: boolean): L.DivIcon {
  const color = getMarkerColor(country);
  const border = isSelected ? '#ffffff' : '#cfb53b';
  const size = isSelected ? 18 : 14;
  const borderWidth = isSelected ? 3 : 1.5;

  const hasTemple = (country.templeLevel ?? 0) > 0;
  const hasLeader = (country.leaderInfiltration ?? 0) >= 100;

  const convertsStr = showLabels && country.converts >= 1_000
    ? (country.converts >= 1_000_000
      ? `${(country.converts / 1_000_000).toFixed(1)}M`
      : `${Math.round(country.converts / 1000)}K`)
    : '';

  const templeIcon = hasTemple ? `<span style="font-size:8px;position:absolute;top:-10px;left:50%;transform:translateX(-50%)">⛪</span>` : '';
  const leaderIcon = hasLeader ? `<span style="font-size:7px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff8dc">✦</span>` : '';

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      ${templeIcon}
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border:${borderWidth}px solid ${border};
        border-radius:50%;
        position:relative;
        box-shadow:0 0 ${isSelected ? '8px 2px' : '4px 1px'} ${color}88;
      ">${leaderIcon}</div>
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

export default function WorldMapFlat({ countries, selectedCountryId, onSelectCountry, floatingTexts = [] }: WorldMapFlatProps) {
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
      const icon = createCountryIcon(c, isSelected, showLabels);

      if (markersRef.current[c.id]) {
        markersRef.current[c.id].setIcon(icon);
      } else {
        const marker = L.marker([pos.lat, pos.lon], { icon })
          .addTo(map)
          .on('click', () => onSelectCountry(c.id));
        markersRef.current[c.id] = marker;
      }
    });
  }, [countries, selectedCountryId, onSelectCountry, showLabels]);

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

      {/* Leaflet map — fills remaining space */}
      <div ref={mapContainerRef} className="flex-1 min-h-0 w-full" />

      {/* Legend — below map */}
      <div className="shrink-0 flex justify-between items-center bg-[#0a0802] border-t border-[#cfb53b]/15 px-3 py-1 text-[8px] font-mono text-[#dfcfa0]/50 select-none">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3a2e12] border border-[#cfb53b]/50 inline-block" /> Inativo</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#b46f1f] border border-[#cfb53b] inline-block" /> Semeado</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#cfb53b] border border-white inline-block" /> Dominante</span>
        <span className="flex items-center gap-1">⛪ Templo</span>
        <span className="flex items-center gap-1">✦ Líder</span>
      </div>
    </div>
  );
}
