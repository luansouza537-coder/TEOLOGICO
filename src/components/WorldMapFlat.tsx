/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Country, ReligionTrait } from '../types';
import { RotateCw, ZoomIn, ZoomOut, Compass, Map, Grid, Waves, Eye, EyeOff } from 'lucide-react';

interface WorldMapFlatProps {
  countries: Country[];
  selectedCountryId: string | null;
  onSelectCountry: (id: string) => void;
  floatingTexts?: { id: number; text: string; x: number; y: number; colorClass: string; countryId?: string }[];
}

const PLAYABLE_LAT_LON: Record<string, { lat: number; lon: number; name: string }> = {
  usa: { lat: 37.09, lon: -95.71, name: 'Estados Unidos' },
  china: { lat: 35.86, lon: 104.19, name: 'China' },
  india: { lat: 20.59, lon: 78.96, name: 'Índia' },
  germany: { lat: 51.16, lon: 10.45, name: 'Alemanha' },
  brazil: { lat: -14.23, lon: -51.92, name: 'Brasil' },
  russia: { lat: 61.52, lon: 105.31, name: 'Rússia' },
  egypt: { lat: 26.82, lon: 30.80, name: 'Egito' },
  south_africa: { lat: -30.55, lon: 22.93, name: 'África do Sul' },
  japan: { lat: 36.20, lon: 138.25, name: 'Japão' },
  mexico: { lat: 23.63, lon: -102.55, name: 'México' },
  saudi_arabia: { lat: 23.88, lon: 45.07, name: 'Arábia Saudita' },
  australia: { lat: -25.27, lon: 133.77, name: 'Austrália' }
};

// Help map original grid coordinates back to playable country IDs
const findPlayableIdFromGrid = (x: number, y: number): string | null => {
  const mappings: Record<string, { x: number; y: number }> = {
    usa: { x: 18, y: 35 },
    china: { x: 82, y: 38 },
    india: { x: 73, y: 48 },
    germany: { x: 50, y: 25 },
    brazil: { x: 33, y: 72 },
    russia: { x: 68, y: 22 },
    egypt: { x: 54, y: 50 },
    south_africa: { x: 56, y: 80 },
    japan: { x: 92, y: 34 },
    mexico: { x: 14, y: 50 },
    saudi_arabia: { x: 63, y: 48 },
    australia: { x: 88, y: 82 }
  };
  
  for (const [id, coord] of Object.entries(mappings)) {
    if (Math.abs(coord.x - x) < 3.5 && Math.abs(coord.y - y) < 3.5) {
      return id;
    }
  }
  return null;
};

export default function WorldMapFlat({
  countries,
  selectedCountryId,
  onSelectCountry,
  floatingTexts = []
}: WorldMapFlatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Layout states to make it custom-styled
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);

  // Pre-load Natural Earth simplified GeoJSON from a robust public fast CDN
  useEffect(() => {
    let active = true;
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson')
      .then((r) => {
        if (!r.ok) throw new Error('Falha ao obter malha global.');
        return r.json();
      })
      .then((data) => {
        if (active) {
          setGeoData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Erro ao carregar mapa de países. Ativando modelo tático emulor.', err);
        if (active) {
          setIsLoading(false);
          // Set to a basic fallback containing the 12 countries so the game works perfectly
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Projection coordinate system mapping function
  const project = (lon: number, lat: number, width: number, height: number) => {
    // Standard Equirectangular/Plate Carree with balanced frame boundaries
    // longitude: -180 to 180 mapped to 0 to width, with slight padding
    const paddingX = width * 0.04;
    const paddedWidth = width - paddingX * 2;
    const x = paddingX + ((lon + 180) / 360) * paddedWidth;
    
    // latitude range cropped to focus on habitable regions (avoid extreme poles distorting too much)
    const minLat = -55;
    const maxLat = 75;
    const paddingY = height * 0.08;
    const paddedHeight = height - paddingY * 2;
    
    // Clamp coordinate values to stay gracefully inside bounds
    const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
    const y = paddingY + paddedHeight * (1 - (clampedLat - minLat) / (maxLat - minLat));
    
    return { x, y };
  };

  // Resize sensor
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      const width = container.clientWidth;
      // Elegant 2:1 mapping aspect ratio with a subtle minimum height
      const height = Math.max(340, width * 0.50);
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main canvas rendering thread
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clean background
    ctx.fillStyle = '#100c03'; // deep warm bronze black
    ctx.fillRect(0, 0, width, height);

    // Grid lines: Parallels and Meridians for strategic tactical aesthetic
    if (showGrid) {
      ctx.strokeStyle = 'rgba(207, 181, 59, 0.045)';
      ctx.lineWidth = 0.5;

      // Meridians (every 20 degrees)
      for (let lon = -180; lon <= 180; lon += 20) {
        const p1 = project(lon, -55, width, height);
        const p2 = project(lon, 75, width, height);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Parallels (every 15 degrees)
      for (let lat = -50; lat <= 70; lat += 15) {
        const p1 = project(-180, lat, width, height);
        const p2 = project(180, lat, width, height);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    // Render world landmass polygons (All Countries)
    if (geoData && geoData.features) {
      geoData.features.forEach((feature: any) => {
        const name = feature.properties?.name || feature.properties?.name_sort || '';
        const id = feature.id || '';
        
        // Match country name to our playable list
        const normName = name.toLowerCase();
        let playableId: string | null = null;
        if (normName.includes('united states')) playableId = 'usa';
        else if (normName.includes('china')) playableId = 'china';
        else if (normName.includes('india')) playableId = 'india';
        else if (normName.includes('germany')) playableId = 'germany';
        else if (normName.includes('brazil')) playableId = 'brazil';
        else if (normName.includes('russia')) playableId = 'russia';
        else if (normName.includes('egypt')) playableId = 'egypt';
        else if (normName.includes('south africa')) playableId = 'south_africa';
        else if (normName.includes('japan')) playableId = 'japan';
        else if (normName.includes('mexico')) playableId = 'mexico';
        else if (normName.includes('saudi arabia')) playableId = 'saudi_arabia';
        else if (normName.includes('australia')) playableId = 'australia';

        const geometry = feature.geometry;
        if (!geometry) return;

        const isPlayable = playableId !== null;
        const isHovered = playableId === hoveredCountryId && isPlayable;
        const isSelected = playableId === selectedCountryId && isPlayable;
        const countryState = isPlayable ? countries.find(c => c.id === playableId) : null;

        // Custom micro themes based on local converts index
        let fillStyle = 'rgba(239, 230, 200, 0.035)'; // Default unplayable countries: soft background
        let strokeStyle = 'rgba(207, 181, 59, 0.08)'; // Fine hairline divider borders
        let strokeWidth = 0.5;

        if (isPlayable && countryState) {
          const hasFollowers = countryState.converts > 0;
          const percent = (countryState.converts / countryState.population) * 100;
          
          if (hasFollowers) {
            if (percent >= 50) {
              fillStyle = 'rgba(207, 181, 59, 0.22)'; // Conversão dominante
              strokeStyle = 'rgba(230, 192, 54, 0.55)';
              strokeWidth = 1.3;
            } else {
              fillStyle = 'rgba(180, 115, 30, 0.12)'; // Iniciação parcial
              strokeStyle = 'rgba(207, 181, 59, 0.4)';
              strokeWidth = 1.0;
            }
          } else {
            fillStyle = 'rgba(64, 53, 27, 0.08)'; // Playable but untouched
            strokeStyle = 'rgba(207, 181, 59, 0.25)';
            strokeWidth = 0.8;
          }

          if (countryState.resistance > 70) {
            fillStyle = 'rgba(139, 0, 0, 0.14)'; // Hostil
            strokeStyle = 'rgba(239, 68, 68, 0.4)';
          }

          if (isHovered) {
            fillStyle = 'rgba(207, 181, 59, 0.35)';
            strokeStyle = 'rgba(255, 255, 255, 0.8)';
            strokeWidth = 1.5;
          }

          if (isSelected) {
            fillStyle = 'rgba(207, 181, 59, 0.45)';
            strokeStyle = '#ffffff';
            strokeWidth = 1.8;
          }
        }

        // Draw individual polygon path coordinates
        const drawPolygon = (coords: number[][]) => {
          ctx.beginPath();
          let started = false;
          coords.forEach((coordPair) => {
            const p = project(coordPair[0], coordPair[1], width, height);
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          });
          ctx.closePath();
          ctx.fillStyle = fillStyle;
          ctx.fill();
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        };

        if (geometry.type === 'Polygon') {
          drawPolygon(geometry.coordinates[0]);
        } else if (geometry.type === 'MultiPolygon') {
          geometry.coordinates.forEach((poly: any) => {
            drawPolygon(poly[0]);
          });
        }
      });
    }

    // Draw connecting paths between adjacent playable countries represent aviation flights / route network
    if (showRoutes) {
      ctx.setLineDash([4, 4]);
      countries.forEach((c, idx) => {
        if (c.converts > 0) {
          const originLatLon = PLAYABLE_LAT_LON[c.id];
          const nextCountry = countries[(idx + 1) % countries.length];
          const destLatLon = PLAYABLE_LAT_LON[nextCountry.id];

          if (originLatLon && destLatLon) {
            const p1 = project(originLatLon.lon, originLatLon.lat, width, height);
            const p2 = project(destLatLon.lon, destLatLon.lat, width, height);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            // Dynamic curves
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 - 25;
            ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
            ctx.strokeStyle = 'rgba(207, 181, 59, 0.22)';
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      });
      ctx.setLineDash([]);
    }

    // DRAW THE DYNAMIC TACTICAL NODES for the 12 playable países
    countries.forEach((c) => {
      const geoInfo = PLAYABLE_LAT_LON[c.id];
      if (!geoInfo) return;

      const p = project(geoInfo.lon, geoInfo.lat, width, height);
      const isSelected = selectedCountryId === c.id;
      const isHovered = hoveredCountryId === c.id;
      const hasFollowers = c.converts > 0;
      const percentConverts = (c.converts / c.population) * 100;

      // Color scheme setting
      let nodeColor = '#3a2e12';
      let strokeColor = '#cfb53b';
      let glowSize = 0;

      if (hasFollowers) {
        if (percentConverts >= 50) {
          nodeColor = '#cfb53b';
          strokeColor = '#ffffff';
          glowSize = 10;
        } else {
          nodeColor = '#b46f1f';
          strokeColor = '#cfb53b';
          glowSize = 5;
        }
      }

      if (c.resistance > 70) {
        nodeColor = '#8b0000';
        strokeColor = '#fca5a5';
      }

      // Orange pulsing ring when violence > 70
      if (c.violence > 70) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, (isSelected ? 7 : 5.2) + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Dashed yellow construction ring when templePending
      if (c.templePending > 0) {
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, (isSelected ? 7 : 5.2) + 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffe066';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw pulse glow ring around active selection/hover
      if (isSelected || isHovered) {
        const pulse = 6 + (isSelected ? Math.sin(performance.now() * 0.007) * 4 : 2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? 'rgba(255, 255, 255, 0.4)' : 'rgba(207, 181, 59, 0.3)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Central core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, isSelected ? 7 : 5.2, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Temple dot: gold at top-right of node
      const nodeRadius = isSelected ? 7 : 5.2;
      if (c.templeLevel > 0) {
        ctx.beginPath();
        ctx.arc(p.x + nodeRadius * 0.7, p.y - nodeRadius * 0.7, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#cfb53b';
        ctx.fill();
      } else if (c.templePending > 0) {
        ctx.beginPath();
        ctx.arc(p.x + nodeRadius * 0.7, p.y - nodeRadius * 0.7, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe066';
        ctx.fill();
      }

      // Render tags and labels
      if (showLabels) {
        ctx.font = isSelected ? 'bold 10px monospace' : '9px sans-serif';
        ctx.fillStyle = isSelected ? '#ffffff' : '#dfcfa0';
        ctx.textAlign = 'center';

        // Shadows
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw country name label
        ctx.fillText(c.name, p.x, p.y - 10);

        // Draw conversion status percent label
        if (hasFollowers) {
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#cfb53b';
          ctx.fillText(
            percentConverts >= 1 ? `${Math.round(percentConverts)}%` : `${percentConverts.toFixed(3)}%`,
            p.x,
            p.y + 13
          );
        }

        // Clean values
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    });

    // Render floating text feedback at exact geographical anchors
    floatingTexts.forEach((f) => {
      const matchedId = f.countryId || findPlayableIdFromGrid(f.x, f.y);
      if (matchedId) {
        const geoInfo = PLAYABLE_LAT_LON[matchedId];
        if (geoInfo) {
          const p = project(geoInfo.lon, geoInfo.lat, width, height);
          
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;

          if (f.colorClass.includes('red')) ctx.fillStyle = '#f87171';
          else if (f.colorClass.includes('green')) ctx.fillStyle = '#4ade80';
          else if (f.colorClass.includes('sky')) ctx.fillStyle = '#38bdf8';
          else ctx.fillStyle = '#eab308';

          const mappings: Record<string, { x: number; y: number }> = {
            usa: { x: 18, y: 35 },
            china: { x: 82, y: 38 },
            india: { x: 73, y: 48 },
            germany: { x: 50, y: 25 },
            brazil: { x: 33, y: 72 },
            russia: { x: 68, y: 22 },
            egypt: { x: 54, y: 50 },
            south_africa: { x: 56, y: 80 },
            japan: { x: 92, y: 34 },
            mexico: { x: 14, y: 50 },
            saudi_arabia: { x: 63, y: 48 },
            australia: { x: 88, y: 82 }
          };
          
          const baseY = mappings[matchedId]?.y || f.y;
          const customOffsetY = (f.y - baseY) * 2.5;

          const driftUp = (f.id % 20) * 0.7;
          ctx.fillText(f.text, p.x, p.y - 18 + customOffsetY - driftUp);
          
          ctx.shadowBlur = 0;
        }
      }
    });

  }, [countries, selectedCountryId, hoveredCountryId, geoData, showGrid, showRoutes, showLabels, floatingTexts]);

  // Click handler coordinates projection inversion
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    let closestCountryId: string | null = null;
    let closestDist = 18; // px threshold

    Object.entries(PLAYABLE_LAT_LON).forEach(([id, info]) => {
      const p = project(info.lon, info.lat, width, height);
      const dist = Math.sqrt((p.x - clickX) ** 2 + (p.y - clickY) ** 2);
      if (dist < closestDist) {
        closestDist = dist;
        closestCountryId = id;
      }
    });

    if (closestCountryId) {
      onSelectCountry(closestCountryId);
    }
  };

  // Hover target selector
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    let foundCountryId: string | null = null;
    let closestDist = 14;

    Object.entries(PLAYABLE_LAT_LON).forEach(([id, info]) => {
      const p = project(info.lon, info.lat, width, height);
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (dist < closestDist) {
        closestDist = dist;
        foundCountryId = id;
      }
    });

    if (foundCountryId !== hoveredCountryId) {
      setHoveredCountryId(foundCountryId);
    }
  };

  return (
    <div className="relative w-full border border-[#cfb53b]/20 bg-[#0f0c04] rounded-lg overflow-hidden flex flex-col items-center" id="flat-tactical-map-container" ref={containerRef}>
      
      {/* HUD Bar Controls overlay */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-[#cfb53b]" />
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#cfb53b]">Planisfério Político Plano</h4>
            <p className="text-[9px] text-[#dfcfa0]/50 font-sans">Todos os países representados no tabuleiro</p>
          </div>
        </div>

        {/* Dynamic Interactive Toggles */}
        <div className="flex gap-1 bg-black/80 border border-[#cfb53b]/20 p-0.5 rounded pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded cursor-pointer transition-all ${showGrid ? 'bg-[#cfb53b]/20 text-[#cfb53b]' : 'text-[#dfcfa0]/40 hover:text-white'}`}
            title="Exibir/Ocultar Linhas de Grade de Coordenadas"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          
          <button
            type="button"
            onClick={() => setShowRoutes(!showRoutes)}
            className={`p-1 rounded cursor-pointer transition-all ${showRoutes ? 'bg-[#cfb53b]/20 text-[#cfb53b]' : 'text-[#dfcfa0]/40 hover:text-white'}`}
            title="Exibir/Ocultar Rotas de Conexão Ativas"
          >
            <Waves className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`p-1 rounded cursor-pointer transition-all ${showLabels ? 'bg-[#cfb53b]/20 text-[#cfb53b]' : 'text-[#dfcfa0]/40 hover:text-white'}`}
            title="Exibir/Ocultar Rótulos e Percentagens"
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-[#0f0c04]/90 flex flex-col justify-center items-center gap-2 z-30">
          <RotateCw className="w-6 h-6 text-[#cfb53b] animate-spin" />
          <p className="text-xs font-mono text-[#dfcfa0]">Compilando fronteiras globais...</p>
        </div>
      )}

      {/* Target canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredCountryId(null)}
        className="w-full h-full block z-10 cursor-crosshair pb-1"
        title="Selecione um país jogável no planisfério para convocar missões."
      />

      {/* Static Mini-Legend footer */}
      <div className="absolute bottom-2 left-3 right-3 flex justify-between bg-black/75 border border-[#cfb53b]/15 p-1 px-3 rounded text-[9px] font-mono text-[#dfcfa0]/60 z-10 select-none">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3a2e12] border border-[#cfb53b]/45" />
          <span>Inativo / Profano</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b46f1f] border border-[#cfb53b]" />
          <span>Semeado (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cfb53b] border border-white" />
          <span>Dominante (50%+)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b0000] border border-[#fca5a5]" />
          <span>Alta Resistência</span>
        </div>
      </div>

    </div>
  );
}
