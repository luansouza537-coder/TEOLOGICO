/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Country } from '../types';
import { Eye, EyeOff, Map } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface WorldMapFlatProps {
  countries: Country[];
  selectedCountryId: string | null;
  onSelectCountry: (id: string) => void;
  floatingTexts?: { id: number; text: string; x: number; y: number; colorClass: string; countryId?: string }[];
}

const COUNTRY_POSITIONS: Record<string, { lat: number; lon: number; name: string }> = {
  usa:          { lat: 37.09,  lon: -95.71, name: 'EUA' },
  china:        { lat: 35.86,  lon: 104.19, name: 'China' },
  india:        { lat: 20.59,  lon: 78.96,  name: 'Índia' },
  germany:      { lat: 51.16,  lon: 10.45,  name: 'Alemanha' },
  brazil:       { lat: -14.23, lon: -51.92, name: 'Brasil' },
  russia:       { lat: 61.52,  lon: 105.31, name: 'Rússia' },
  egypt:        { lat: 26.82,  lon: 30.80,  name: 'Egito' },
  south_africa: { lat: -30.55, lon: 22.93,  name: 'África do Sul' },
  japan:        { lat: 36.20,  lon: 138.25, name: 'Japão' },
  mexico:       { lat: 23.63,  lon: -102.55, name: 'México' },
  saudi_arabia: { lat: 23.88,  lon: 45.07,  name: 'Arábia Saudita' },
  australia:    { lat: -25.27, lon: 133.77, name: 'Austrália' },
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
  const [showLabels, setShowLabels] = useState(true);

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

    // CartoDB Dark Matter tiles (free, no API key needed)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

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

  // Pan to selected country
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCountryId) return;
    const pos = COUNTRY_POSITIONS[selectedCountryId];
    if (pos) map.panTo([pos.lat, pos.lon], { animate: true, duration: 0.5 });
  }, [selectedCountryId]);

  return (
    <div className="relative w-full border border-[#cfb53b]/20 rounded-lg overflow-hidden bg-[#0e0b04]" style={{ height: '320px' }}>
      {/* Header */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between z-[1000] pointer-events-none">
        <div className="flex items-center gap-2 bg-black/70 px-2 py-1 rounded border border-[#cfb53b]/20">
          <Map className="w-3.5 h-3.5 text-[#cfb53b]" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#cfb53b]">Planisfério Político</span>
        </div>
        <button
          type="button"
          className="pointer-events-auto p-1 rounded bg-black/70 border border-[#cfb53b]/20 text-[#cfb53b]/60 hover:text-[#cfb53b] transition-colors cursor-pointer"
          onClick={() => setShowLabels(v => !v)}
          title="Mostrar/ocultar contagem de fiéis"
        >
          {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
      </div>

      {/* Leaflet map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-2 left-3 right-3 flex justify-between bg-black/70 border border-[#cfb53b]/10 px-3 py-1 rounded text-[8px] font-mono text-[#dfcfa0]/50 select-none z-[1000] pointer-events-none">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3a2e12] border border-[#cfb53b]/50 inline-block" /> Inativo</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#b46f1f] border border-[#cfb53b] inline-block" /> Semeado</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#cfb53b] border border-white inline-block" /> Dominante</span>
        <span className="flex items-center gap-1">⛪ Templo &nbsp; ✦ Líder</span>
      </div>
    </div>
  );
}
