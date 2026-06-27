/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'video' | 'logo' | 'done'>('video');
  const [logoVisible, setLogoVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/splash-music.mp3');
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Fade in music volume over 1.5s
  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => {});
    let v = 0;
    const step = setInterval(() => {
      v = Math.min(0.75, v + 0.05);
      audio.volume = v;
      if (v >= 0.75) clearInterval(step);
    }, 75);
  };

  // Fade out music volume over 800ms then stop
  const stopMusic = (cb?: () => void) => {
    const audio = audioRef.current;
    if (!audio) { cb?.(); return; }
    const step = setInterval(() => {
      audio.volume = Math.max(0, audio.volume - 0.08);
      if (audio.volume <= 0) {
        clearInterval(step);
        audio.pause();
        cb?.();
      }
    }, 50);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('logo');
      setTimeout(() => setLogoVisible(true), 50);
      setTimeout(() => {
        setPhase('done');
        stopMusic(() => setTimeout(onComplete, 300));
      }, 2800);
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    if (phase === 'done') return;
    // First touch starts music; second touch skips
    const audio = audioRef.current;
    if (!audio || audio.paused) {
      startMusic();
      return;
    }
    setPhase('done');
    stopMusic(() => setTimeout(onComplete, 200));
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-pointer overflow-hidden"
      onClick={handleSkip}
      style={{ opacity: phase === 'done' ? 0 : 1, transition: 'opacity 0.6s ease' }}
    >
      {/* Background video — muted, music comes from audio element */}
      <video
        ref={videoRef}
        src="/splash.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.6 }}
      />

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />

      {/* Logo overlay — appears after video plays for a bit */}
      <div
        className="relative z-10 flex flex-col items-center gap-3 text-center px-8"
        style={{
          opacity: phase === 'logo' || phase === 'done' ? (logoVisible ? 1 : 0) : 0,
          transform: logoVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1.2s ease, transform 1.2s ease',
        }}
      >
        <div className="text-[10px] uppercase tracking-[0.4em] font-mono text-[#cfb53b]/60 mb-2">
          Uma ideia pode mudar tudo
        </div>
        <h1
          className="font-serif font-black tracking-[0.15em] uppercase"
          style={{
            fontSize: 'clamp(3rem, 16vw, 6rem)',
            color: '#cfb53b',
            textShadow: '0 0 60px rgba(207,181,59,0.5), 0 0 120px rgba(207,181,59,0.2)',
            letterSpacing: '0.2em',
          }}
        >
          CREDO
        </h1>
        <div className="w-16 h-px bg-[#cfb53b]/40 mt-1" />
        <p className="text-[10px] text-[#dfcfa0]/40 font-mono tracking-widest mt-2">
          TOQUE PARA CONTINUAR
        </p>
      </div>

      {/* Skip / touch hint */}
      {phase === 'video' && (
        <div className="absolute bottom-8 right-6 text-[9px] text-white/25 font-mono tracking-widest">
          TOQUE PARA COMEÇAR
        </div>
      )}
    </div>
  );
}
