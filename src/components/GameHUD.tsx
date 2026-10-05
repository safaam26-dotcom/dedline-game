import React from 'react';
import { Volume2, VolumeX, Flame, Heart, Download } from 'lucide-react';
import { TimeOfDay, ZoneType } from '../types';

interface GameHUDProps {
  isPlaying: boolean;
  lives?: number;
  score?: number;
  level?: number;
  zone?: ZoneType;
  timeOfDay?: TimeOfDay;
  bossHp?: number;
  bossMaxHp?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenShare?: () => void;
  isBossStage?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  isPlaying,
  lives = 3,
  score = 0,
  level = 1,
  zone = 'KAMPUS',
  timeOfDay = 'SIANG',
  bossHp,
  bossMaxHp = 5,
  isMuted = false,
  onToggleMute,
  onOpenShare,
  isBossStage = false,
}) => {
  // Format score with leading zeroes (e.g., 0040)
  const formattedScore = score.toString().padStart(4, '0');

  // Time of Day emoji & badge
  const timeLabels: Record<TimeOfDay, { label: string; icon: string; bg: string }> = {
    PAGI: { label: 'Pagi', icon: '🌅', bg: 'bg-amber-500/20 text-amber-200 border-amber-400/30' },
    SIANG: { label: 'Siang', icon: '☀️', bg: 'bg-sky-500/20 text-sky-200 border-sky-400/30' },
    SORE: { label: 'Sore', icon: '🌇', bg: 'bg-rose-500/20 text-rose-200 border-rose-400/30' },
    MALAM: { label: 'Malam', icon: '🌙', bg: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30' },
  };

  const zoneNames: Record<ZoneType, string> = {
    KAMPUS: 'Area Kampus',
    KOTA: 'Area Kota',
    SIDANG: 'Sidang Skripsi',
  };

  const isLevelFinal = level >= 5;

  return (
    <>
      <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-50 pointer-events-none">
        {/* 1. KIRI (JANGAN UBAH ISI INI, pertahankan logo MBD dan Nyawa/Stars yang sudah ada) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Render MBD Logo & Nyawa di sini */}
          <img 
            src="/logo-mbd.png" 
            alt="Logo MBD" 
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0" 
          />
          {isPlaying && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/85 backdrop-blur-md px-3 sm:px-3.5 py-2 rounded-2xl border border-slate-700/60 shadow-lg">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-amber-400 font-['Fredoka']">
                NYAWA:
              </span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[1, 2, 3].map((starIndex) => {
                  const isFilled = starIndex <= lives;
                  return (
                    <span
                      key={starIndex}
                      className={`text-lg sm:text-2xl transition-all duration-300 ${
                        isFilled
                          ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-105'
                          : 'text-slate-600 scale-90'
                      }`}
                      role="img"
                      aria-label={isFilled ? 'Bintang Nyawa Penuh' : 'Bintang Nyawa Habis'}
                    >
                      {isFilled ? '★' : '☆'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. TENGAH (Area Kampus / Waktu) */}
        <div className="flex items-center justify-center pointer-events-auto mt-2">
          {/* Render Area Kampus di sini */}
          {isPlaying && (
            <div className="hidden md:flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/60 shadow-lg">
              <span className="text-xs text-slate-300 font-semibold font-['Fredoka'] tracking-wide">
                {zoneNames[zone]}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${timeLabels[timeOfDay].bg}`}>
                {timeLabels[timeOfDay].icon} {timeLabels[timeOfDay].label}
              </span>
            </div>
          )}
        </div>

        {/* 3. KANAN (PERBAIKI BAGIAN INI - BERIKAN SPACE UNTUK LOGO ISTTS) */}
        {/* Gunakan flex dan gap-3 sm:gap-4 agar Score, Level, dan Logo berjejer ke samping, BUKAN menumpuk! */}
        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
          {isPlaying && (
            <>
              {/* Letakkan Panel Score di sini (jika state sedang bermain) */}
              <div className="bg-slate-900/85 backdrop-blur-md px-2.5 sm:px-3.5 py-2 rounded-2xl border border-slate-700/60 shadow-lg text-left">
                <div className="text-[10px] text-slate-400 leading-none">SCORE</div>
                <div className="text-xs sm:text-base font-bold text-amber-300 font-['Fredoka'] tracking-wider">
                  {formattedScore}
                </div>
              </div>

              {/* Letakkan Panel Level di sini (jika state sedang bermain) */}
              <div
                className={`px-2.5 sm:px-3.5 py-2 rounded-2xl border shadow-lg text-left backdrop-blur-md transition-all ${
                  isLevelFinal
                    ? 'bg-rose-950/85 border-rose-500/60 shadow-rose-500/20'
                    : 'bg-slate-900/85 border-slate-700/60'
                }`}
              >
                <div className="text-[10px] text-slate-400 leading-none">LEVEL</div>
                <div
                  className={`text-xs sm:text-sm font-extrabold font-['Fredoka'] flex items-center gap-1 ${
                    isLevelFinal ? 'text-rose-400 animate-pulse' : 'text-cyan-300'
                  }`}
                >
                  {isLevelFinal ? (
                    <>
                      <Flame className="w-3.5 h-3.5 fill-rose-400" />
                      FINAL
                    </>
                  ) : (
                    `LEVEL ${level}`
                  )}
                </div>
              </div>

              {/* Download & Share Button */}
              {onOpenShare && (
                <button
                  onClick={onOpenShare}
                  aria-label="Download & Bagikan Game"
                  title="Download & Bagikan Game"
                  className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-sky-400 hover:text-white hover:bg-slate-800 transition shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}

              {/* Audio Mute Button */}
              {onToggleMute && (
                <button
                  onClick={onToggleMute}
                  aria-label={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
                  className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-lg cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              )}
            </>
          )}

          {/* Letakkan Logo ISTTS di urutan PALING KANAN dengan styling murni */}
          <img 
            src="/logo-istts-full.png" 
            alt="Logo ISTTS" 
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
            style={{ border: 'none', outline: 'none', background: 'transparent' }} 
          />
        </div>
      </header>

      {/* Boss Health Bar if in Sidang Skripsi (Centered below header) */}
      {isPlaying && isBossStage && bossHp !== undefined && (
        <div className="absolute top-20 left-0 right-0 max-w-md mx-auto px-4 z-40 pointer-events-none">
          <div className="w-full bg-slate-950/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-rose-500/60 shadow-2xl flex flex-col items-center gap-1.5 pointer-events-auto">
            <div className="flex items-center justify-between w-full text-xs font-bold text-rose-300 font-['Fredoka']">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                DOSEN PENGUJI
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: bossMaxHp }).map((_, i) => {
                  const isFilled = i < bossHp;
                  return (
                    <div key={i} className="relative flex items-center justify-center">
                      <Heart
                        className={`w-5 h-5 transition-all duration-300 ${
                          isFilled
                            ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] scale-110'
                            : 'fill-slate-800 text-slate-600 scale-90 opacity-60'
                        }`}
                      />
                      {!isFilled && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-black">
                          ✕
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Health Bar track */}
            <div className="w-full bg-slate-800/90 h-3 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-full text-[11px] text-amber-200/90 font-medium">
              <span>
                Sisa HP: <b className="text-white font-['Fredoka'] text-xs">{bossHp}</b> / {bossMaxHp}
              </span>
              <span>
                Tekan <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-amber-300 font-mono text-xs font-bold">X</kbd> untuk Lempar Skripsi!
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameHUD;
