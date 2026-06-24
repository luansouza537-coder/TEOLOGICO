/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Country } from '../types';
import { Map, Eye, EyeOff, RotateCw } from 'lucide-react';

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
  mexico:       { lat: 23.63,  lon: -102.55,name: 'México' },
  saudi_arabia: { lat: 23.88,  lon: 45.07,  name: 'Arábia Saudita' },
  australia:    { lat: -25.27, lon: 133.77, name: 'Austrália' },
};

function project(lon: number, lat: number, w: number, h: number) {
  const px = 0.04;
  const py = 0.08;
  const x = px * w + ((lon + 180) / 360) * (w * (1 - px * 2));
  const minLat = -55, maxLat = 75;
  const clat = Math.max(minLat, Math.min(maxLat, lat));
  const y = py * h + (1 - (clat - minLat) / (maxLat - minLat)) * (h * (1 - py * 2));
  return { x, y };
}

export default function WorldMapFlat({ countries, selectedCountryId, onSelectCountry, floatingTexts = [] }: WorldMapFlatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const drawRef = useRef<() => void>(() => {});

  // Load GeoJSON
  useEffect(() => {
    let active = true;
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson')
      .then(r => r.json())
      .then(data => { if (active) { setGeoData(data); setIsLoading(false); } })
      .catch(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  // Resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = Math.max(300, container.clientWidth * 0.5);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Build draw function
  useEffect(() => {
    drawRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const W = canvas.width;
      const H = canvas.height;

      // Background
      ctx.fillStyle = '#0e0b04';
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = 'rgba(207,181,59,0.04)';
      ctx.lineWidth = 0.5;
      for (let lon = -180; lon <= 180; lon += 30) {
        const p1 = project(lon, -55, W, H);
        const p2 = project(lon, 75, W, H);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
      for (let lat = -50; lat <= 70; lat += 20) {
        const p1 = project(-180, lat, W, H);
        const p2 = project(180, lat, W, H);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }

      // World landmass — colored fill by conversion state, thin border
      if (geoData?.features) {
        // Build lookup: playable country id → state
        const stateMap: Record<string, typeof countries[0]> = {};
        countries.forEach(c => { stateMap[c.id] = c; });

        const getPlayableId = (name: string): string | null => {
          const n = name.toLowerCase();
          if (n.includes('united states')) return 'usa';
          if (n.includes('china')) return 'china';
          if (n.includes('india') && !n.includes('indiana')) return 'india';
          if (n.includes('germany')) return 'germany';
          if (n.includes('brazil')) return 'brazil';
          if (n.includes('russia')) return 'russia';
          if (n.includes('egypt')) return 'egypt';
          if (n.includes('south africa')) return 'south_africa';
          if (n.includes('japan')) return 'japan';
          if (n.includes('mexico')) return 'mexico';
          if (n.includes('saudi')) return 'saudi_arabia';
          if (n.includes('australia')) return 'australia';
          return null;
        };

        geoData.features.forEach((feature: any) => {
          const geom = feature.geometry;
          if (!geom) return;
          const pid = getPlayableId(feature.properties?.name || '');
          const cs = pid ? stateMap[pid] : null;
          const isSelected = pid === selectedCountryId;
          const isHovered = pid === hoveredId;

          let fill = 'rgba(180,160,100,0.03)';
          let stroke = 'rgba(120,100,60,0.07)';
          let strokeW = 0.3;

          if (cs) {
            const pct = cs.population > 0 ? cs.converts / cs.population : 0;
            if (pct >= 0.5) fill = 'rgba(207,181,59,0.18)';
            else if (pct > 0) fill = 'rgba(180,120,30,0.10)';
            else fill = 'rgba(100,80,30,0.06)';
            stroke = 'rgba(207,181,59,0.30)';
            strokeW = 0.7;
          }

          if (isSelected) { fill = 'rgba(207,181,59,0.28)'; stroke = 'rgba(255,255,255,0.6)'; strokeW = 1.2; }
          else if (isHovered) { fill = 'rgba(207,181,59,0.14)'; stroke = 'rgba(207,181,59,0.6)'; strokeW = 1.0; }

          const drawPoly = (coords: number[][]) => {
            ctx.beginPath();
            coords.forEach(([lon, lat], i) => {
              const p = project(lon, lat, W, H);
              i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
            });
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeW;
            ctx.stroke();
          };

          if (geom.type === 'Polygon') drawPoly(geom.coordinates[0]);
          else if (geom.type === 'MultiPolygon') geom.coordinates.forEach((p: any) => drawPoly(p[0]));
        });
      }

      // Draw country labels at center point (no circles)
      if (showLabels) {
        countries.forEach(c => {
          const geo = COUNTRY_POSITIONS[c.id];
          if (!geo) return;
          const p = project(geo.lon, geo.lat, W, H);
          const isSelected = selectedCountryId === c.id;
          const isHovered = hoveredId === c.id;
          const convertPct = c.population > 0 ? c.converts / c.population : 0;

          const labelColor = convertPct >= 0.5 ? '#cfb53b'
            : convertPct > 0 ? '#c8a84a'
            : '#7a6a4a';

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Highlight box for selected/hovered
          if (isSelected || isHovered) {
            ctx.save();
            ctx.font = 'bold 9px sans-serif';
            const tw = ctx.measureText(geo.name).width;
            ctx.fillStyle = isSelected ? 'rgba(207,181,59,0.25)' : 'rgba(207,181,59,0.12)';
            ctx.fillRect(p.x - tw/2 - 3, p.y - 7, tw + 6, 14);
            ctx.strokeStyle = isSelected ? 'rgba(207,181,59,0.7)' : 'rgba(207,181,59,0.3)';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(p.x - tw/2 - 3, p.y - 7, tw + 6, 14);
            ctx.restore();
          }

          // Country name
          ctx.font = `${isSelected ? 'bold' : ''} 9px sans-serif`;
          ctx.strokeStyle = 'rgba(0,0,0,0.95)';
          ctx.lineWidth = 3;
          ctx.strokeText(geo.name, p.x, p.y);
          ctx.fillStyle = isSelected ? '#ffffff' : labelColor;
          ctx.fillText(geo.name, p.x, p.y);

          // Convert count below name
          if (c.converts > 0) {
            const n = c.converts >= 1_000_000
              ? `${(c.converts / 1_000_000).toFixed(1)}M`
              : `${Math.round(c.converts / 1000)}K`;
            ctx.font = '7px monospace';
            ctx.strokeStyle = 'rgba(0,0,0,0.95)';
            ctx.lineWidth = 2;
            ctx.strokeText(n, p.x, p.y + 10);
            ctx.fillStyle = '#cfb53b';
            ctx.fillText(n, p.x, p.y + 10);
          }

          // Temple icon above name
          if (c.templeLevel > 0) {
            ctx.font = '8px serif';
            ctx.strokeStyle = 'rgba(0,0,0,0.9)';
            ctx.lineWidth = 2;
            ctx.strokeText('⛪', p.x, p.y - 10);
            ctx.fillStyle = '#cfb53b';
            ctx.fillText('⛪', p.x, p.y - 10);
          }

          // Leader converted
          if (c.leaderInfiltration >= 100) {
            ctx.font = '8px serif';
            ctx.fillStyle = '#fff8dc';
            ctx.fillText('✦', p.x + (c.templeLevel > 0 ? 8 : 0), p.y - 10);
          }
        });
      }

      // Floating texts
      floatingTexts.forEach(f => {
        const geo = f.countryId ? COUNTRY_POSITIONS[f.countryId] : null;
        if (!geo) return;
        const p = project(geo.lon, geo.lat, W, H);
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillStyle = f.colorClass.includes('red') ? '#f87171'
          : f.colorClass.includes('green') ? '#4ade80'
          : f.colorClass.includes('sky') ? '#38bdf8' : '#eab308';
        const drift = (f.id % 20) * 0.7;
        ctx.fillText(f.text, p.x, p.y - 18 - drift);
        ctx.shadowBlur = 0;
      });
    };
  }, [countries, selectedCountryId, hoveredId, geoData, showLabels, floatingTexts]);

  // rAF loop
  useEffect(() => {
    let id: number;
    const loop = () => { drawRef.current(); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  // Click handler
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    let best: string | null = null;
    let bestDist = 20;
    Object.entries(COUNTRY_POSITIONS).forEach(([id, geo]) => {
      const p = project(geo.lon, geo.lat, canvas.width, canvas.height);
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < bestDist) { bestDist = d; best = id; }
    });
    if (best) onSelectCountry(best);
  };

  // Hover handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    let best: string | null = null;
    let bestDist = 16;
    Object.entries(COUNTRY_POSITIONS).forEach(([id, geo]) => {
      const p = project(geo.lon, geo.lat, canvas.width, canvas.height);
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < bestDist) { bestDist = d; best = id; }
    });
    if (best !== hoveredId) setHoveredId(best);
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div ref={containerRef} className="relative w-full border border-[#cfb53b]/20 bg-[#0e0b04] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-[#cfb53b]" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#cfb53b]">Planisfério Político Plano</span>
        </div>
        <button
          type="button"
          className="pointer-events-auto p-1 rounded bg-black/60 border border-[#cfb53b]/20 text-[#cfb53b]/60 hover:text-[#cfb53b] transition-colors cursor-pointer"
          onClick={() => setShowLabels(v => !v)}
          title="Mostrar/ocultar labels"
        >
          {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-[#0e0b04]/90 flex flex-col items-center justify-center gap-2 z-30">
          <RotateCw className="w-5 h-5 text-[#cfb53b] animate-spin" />
          <p className="text-xs font-mono text-[#dfcfa0]/60">Carregando mapa...</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredId(null)}
        className="w-full block cursor-crosshair"
      />

      {/* Tooltip on hover */}
      {(() => {
        const hoveredCountry = hoveredId ? countries.find(c => c.id === hoveredId) : null;
        if (!hoveredId || !hoveredCountry) return null;
        const pct = hoveredCountry.population > 0 ? (hoveredCountry.converts / hoveredCountry.population * 100) : 0;
        const pctStr = pct >= 1 ? pct.toFixed(1) : pct.toFixed(3);
        const converts = hoveredCountry.converts >= 1_000_000
          ? `${(hoveredCountry.converts / 1_000_000).toFixed(1)}M`
          : hoveredCountry.converts >= 1000
            ? `${Math.round(hoveredCountry.converts / 1000)}K`
            : hoveredCountry.converts.toString();
        return (
          <div
            className="absolute pointer-events-none z-30 bg-[#1a1408]/95 border border-[#cfb53b]/40 rounded-lg px-3 py-2 text-xs font-mono"
            style={{
              left: Math.min(tooltipPos.x + 12, (containerRef.current?.clientWidth ?? 9999) - 160),
              top: Math.max(4, tooltipPos.y - 40),
            }}
          >
            <div className="text-[#cfb53b] font-bold">{hoveredCountry.name}</div>
            <div className="text-[#dfcfa0]/70">{converts} fiéis</div>
            <div className="text-[#cfb53b]/80">{pctStr}% convertido</div>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="absolute bottom-2 left-3 right-3 flex justify-between bg-black/70 border border-[#cfb53b]/10 px-3 py-1 rounded text-[8px] font-mono text-[#dfcfa0]/50 select-none">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#2a2210] border border-[#cfb53b]/50 inline-block" /> Inativo</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#7a4e10] border border-[#cfb53b] inline-block" /> Semeado</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#cfb53b] border border-white inline-block" /> Dominante</span>
        <span className="flex items-center gap-1">✦ Líder convertido</span>
      </div>
    </div>
  );
}
