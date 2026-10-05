import React from 'react';
import { Play } from 'lucide-react';
import { LevelNotification } from '../types';

interface LevelUpModalProps {
  notification: LevelNotification | null;
  onContinue: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  notification,
  onContinue,
}) => {
  if (!notification || !notification.show) return null;

  const isFinal = notification.level >= 5;

  return (
    <div
      className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] flex items-center justify-center p-4 z-40 animate-in fade-in duration-150"
      onClick={onContinue}
    >
      {/* Compact Pop-up Modal Container */}
      <div
        className="w-full max-w-[280px] sm:max-w-[310px] bg-slate-900/95 border-2 border-amber-400/90 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/60 text-center flex flex-col items-center gap-3.5 transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title: 🎉 SELAMAT! */}
        <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-['Fredoka'] tracking-wide drop-shadow-md">
          🎉 SELAMAT!
        </h3>

        {/* Message: KAMU NAIK KE LEVEL [X]! */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg sm:text-xl font-extrabold text-white font-['Fredoka'] tracking-tight">
            KAMU NAIK KE LEVEL {notification.level}!
          </p>

          {isFinal && (
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider bg-rose-950/70 border border-rose-800/80 px-2.5 py-0.5 rounded-full mt-0.5">
              Sidang Skripsi Dosen Penguji
            </span>
          )}
        </div>

        {/* Action Button: [ LANJUT ] */}
        <button
          onClick={onContinue}
          autoFocus
          className="w-full mt-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-500/25 transition cursor-pointer font-['Fredoka'] tracking-wider flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          LANJUT
        </button>

        <span className="text-[10px] text-slate-400 font-medium">
          Tekan tombol atau [SPACE] untuk lanjut
        </span>
      </div>
    </div>
  );
};
