import React from 'react';
import { RotateCcw, Home, GraduationCap, Sparkles, Download, Share2 } from 'lucide-react';

interface VictoryModalProps {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
  onOpenShareAndInstall?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  onRestart,
  onMenu,
  onOpenShareAndInstall,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-30 overflow-y-auto">
      <div className="max-w-md w-full bg-slate-900/95 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col gap-5 my-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Graduation Cap Icon with Glow */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <GraduationCap className="w-9 h-9 text-slate-900" />
        </div>

        {/* Title and Congratulations */}
        <div className="space-y-1">
          <div className="text-amber-400 text-sm font-bold tracking-widest uppercase font-['Fredoka'] flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            🎓 SELAMAT!
            <Sparkles className="w-4 h-4" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Fredoka'] leading-tight">
            SKRIPSIMU AKHIRNYA ACC!
          </h2>
        </div>

        {/* Story Message */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/70 space-y-1 text-slate-200 text-xs sm:text-sm">
          <p className="font-semibold text-amber-300">
            “PERJUANGANMU SELESAI.”
          </p>
          <p className="text-slate-300">
            “SELAMAT, KAMU LULUS DAN SIAP MEMASUKI DUNIA NYATA!”
          </p>
        </div>

        {/* Final Academic Transcript */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800">
          <div className="text-center border-r border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Status</div>
            <div className="text-sm font-bold text-emerald-400 font-['Fredoka'] mt-0.5">WISUDA 🎓</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Skor Kelulusan</div>
            <div className="text-sm font-bold text-amber-400 font-['Fredoka'] mt-0.5">{score} Poin</div>
          </div>
        </div>

        {/* Action Buttons: MAIN LAGI & KEMBALI KE MENU */}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onRestart}
              className="w-full sm:flex-1 py-3.5 px-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 active:scale-98 text-slate-950 font-bold text-sm rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer font-['Fredoka']"
            >
              <RotateCcw className="w-4 h-4 text-slate-950" />
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
              className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 active:scale-98 text-amber-300 hover:text-white border border-slate-700 font-medium text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Download & Bagikan Bukti Kelulusan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
