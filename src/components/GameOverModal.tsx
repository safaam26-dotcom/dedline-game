import React from 'react';
import { RotateCcw, Home, Download } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  level: number;
  onRestart: () => void;
  onMenu: () => void;
  onOpenShareAndInstall?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  level,
  onRestart,
  onMenu,
  onOpenShareAndInstall,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-30">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Sad Stars */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl text-slate-500 tracking-widest">
            ☆ ☆ ☆
          </div>
          <div className="text-xs text-rose-400 font-semibold tracking-wide uppercase font-['Fredoka']">
            NYAWA HABIS
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-white font-['Fredoka']">
            LARI TERHENTI
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Terlalu banyak distraksi kuliah! Jangan menyerah, atur waktu lebih baik dan coba lagi.
          </p>
        </div>

        {/* Stats card */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 grid grid-cols-2 gap-3">
          <div className="text-center border-r border-slate-700/60">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Tingkat Level</div>
            <div className="text-xl font-bold text-sky-400 font-['Fredoka']">
              {level >= 5 ? 'LEVEL FINAL' : `LEVEL ${level}`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Skor Akhir</div>
            <div className="text-xl font-bold text-amber-400 font-['Fredoka']">{score}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onRestart}
              className="w-full sm:flex-1 py-3.5 px-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer font-['Fredoka']"
            >
              <RotateCcw className="w-4 h-4" />
              MAIN LAGI
            </button>

            <button
              onClick={onMenu}
              className="w-full sm:w-auto py-3.5 px-5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 hover:text-white font-semibold text-xs rounded-2xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              KEMBALI KE MENU
            </button>
          </div>

          {onOpenShareAndInstall && (
            <button
              onClick={onOpenShareAndInstall}
              type="button"
              className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 active:scale-98 text-sky-300 hover:text-white border border-slate-700 font-medium text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download & Bagikan Link Game</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
