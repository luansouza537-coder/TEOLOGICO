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

      // World landmass — uniform subtle fill, thin gold border
      if (geoData?.features) {
        geoData.features.forEach((feature: any) => {
          const geom = feature.geometry;
          if (!geom) return;

          const normName = (feature.properties?.name || '').toLowerCase();
          let isPlayable = false;
          for (const key of Object.keys(COUNTRY_POSITIONS)) {
            const n = COUNTRY_POSITIONS[key].name.toLowerCase();
            if (normName.includes(n) || (key === 'usa' && normName.includes('united states')) ||
                (key === 'russia' && normName.includes('russia')) ||
                (key === 'south_africa' && normName.includes('south africa')) ||
                (key === 'saudi_arabia' && normName.includes('saudi'))) {
              isPlayable = true; break;
            }
          }

          const drawPoly = (coords: number[][]) => {
            ctx.beginPath();
            coords.forEach(([lon, lat], i) => {
              const p = project(lon, lat, W, H);
              i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
            });
            ctx.closePath();
            ctx.fillStyle = 'transparent';
            ctx.fill();
            ctx.strokeStyle = isPlayable ? 'rgba(207,181,59,0.20)' : 'rgba(150,130,80,0.06)';
            ctx.lineWidth = isPlayable ? 0.7 : 0.3;
            ctx.stroke();
          };

          if (geom.type === 'Polygon') drawPoly(geom.coordinates[0]);
          else if (geom.type === 'MultiPolygon') geom.coordinates.forEach((p: any) => drawPoly(p[0]));
        });
      }

      // Draw country nodes
      countries.forEach(c => {
        const geo = COUNTRY_POSITIONS[c.id];
        if (!geo) return;
        const p = project(geo.lon, geo.lat, W, H);
        const isSelected = selectedCountryId === c.id;
        const isHovered = hoveredId === c.id;
        const convertPct = c.population > 0 ? c.converts / c.population : 0;

        const R = 7; // fixed small radius for all nodes

        // Node fill color based on conversion
        let fill = '#2a2210';
        let stroke = '#cfb53b';
        let strokeW = 1.5;

        if (convertPct >= 0.5) {
          fill = '#cfb53b';
          stroke = '#fff8dc';
          strokeW = 2;
        } else if (convertPct > 0) {
          fill = '#7a4e10';
          stroke = '#cfb53b';
          strokeW = 1.5;
        }

        if (isSelected) {
          stroke = '#ffffff';
          strokeW = 2.5;
        } else if (isHovered) {
          stroke = 'rgba(255,255,255,0.6)';
          strokeW = 2;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeW;
        ctx.stroke();

        // Leader converted: star inside
        if (c.leaderInfiltration >= 100) {
          ctx.save();
          ctx.fillStyle = '#fff8dc';
          ctx.font = '7px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✦', p.x, p.y);
          ctx.restore();
        }

        // Temple icon: tiny triangle above node
        if (c.templeLevel > 0) {
          const ts = Math.min(5 + c.templeLevel, 8);
          const tx = p.x - ts / 2;
          const ty = p.y - R - ts - 1;
          ctx.save();
          ctx.fillStyle = '#cfb53b';
          ctx.beginPath();
          ctx.moveTo(tx + ts / 2, ty);
          ctx.lineTo(tx, ty + ts * 0.55);
          ctx.lineTo(tx + ts, ty + ts * 0.55);
          ctx.closePath();
          ctx.fill();
          ctx.fillRect(tx + ts * 0.2, ty + ts * 0.55, ts * 0.6, ts * 0.45);
          ctx.restore();
        } else if (c.templePending > 0) {
          // Tiny pending dot above node
          ctx.save();
          ctx.fillStyle = 'rgba(255,224,102,0.7)';
          ctx.beginPath();
          ctx.arc(p.x, p.y - R - 4, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Labels
        if (showLabels) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';

          const name = geo.name;
          ctx.font = 'bold 9px sans-serif';
          ctx.strokeStyle = 'rgba(0,0,0,0.9)';
          ctx.lineWidth = 2.5;
          ctx.strokeText(name, p.x, p.y + R + 11);
          ctx.fillStyle = convertPct > 0.3 ? '#cfb53b' : '#9a8a6a';
          ctx.fillText(name, p.x, p.y + R + 11);

          if (c.converts > 0) {
            const n = c.converts >= 1_000_000
              ? `${(c.converts / 1_000_000).toFixed(1)}M`
              : `${Math.round(c.converts / 1000)}K`;
            ctx.font = '8px monospace';
            ctx.strokeStyle = 'rgba(0,0,0,0.9)';
            ctx.lineWidth = 2;
            ctx.strokeText(n, p.x, p.y + R + 21);
            ctx.fillStyle = '#cfb53b';
            ctx.fillText(n, p.x, p.y + R + 21);
          }
        }
      });

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
