import React, { useState } from 'react';
import { Play, Sparkles, GraduationCap, ShieldAlert, Zap, Info, X } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface StartMenuProps {
  onStart: () => void;
  onOpenShareAndInstall?: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showLevels, setShowLevels] = useState(false);

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-30 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col gap-4 my-auto relative">
        {/* Game Title (Main Header - Right at the top) */}
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-semibold tracking-wide">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Mahasiswi Runner • MBD ISTTS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-['Fredoka'] drop-shadow-lg">
            DEADLINE <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-rose-400 to-amber-400">RUN</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Lari lewati deadline tugas, kumpulkan revisi ACC, dan hadapi <span className="text-amber-300 font-bold">Sidang Skripsi</span>!
          </p>
        </div>

        {/* Primary Action Buttons (Instant Start & Direct Download) */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            onClick={onStart}
            className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 active:scale-95 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition cursor-pointer font-['Fredoka'] tracking-wide"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>MULAI MAIN</span>
          </button>

          <PWAInstallButton />
        </div>

        {/* Quick Mobile Controls Tip */}
        <div className="bg-slate-950/70 rounded-xl px-3 py-2 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-center gap-2">
          <span>📱 <strong className="text-white">Ketuk Layar</strong> untuk Lompat</span>
          <span className="text-slate-600">•</span>
          <span>⌨️ <strong className="text-white">SPACE</strong> / <strong className="text-amber-300">X</strong></span>
        </div>

        {/* Collapsible Info Buttons (Keeps main screen clean & short!) */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Panduan & Item</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLevels(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Tingkat Level</span>
          </button>
        </div>

        {/* Landscape Hint */}
        <p className="text-[10px] text-slate-400">
          💡 Rekomendasi: Miringkan HP (Landscape) untuk pandangan lari terluas!
        </p>

        {/* MODAL 1: Panduan Item & Rintangan */}
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-left flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-['Fredoka'] font-bold text-white text-base">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Item & Rintangan</span>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ITEM POSITIF</span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>📚 Buku / Tugas Kuliah</span>
                    <span className="font-bold text-emerald-400">+10 Skor</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💻 Laptop / PPT Slide</span>
                    <span className="font-bold text-emerald-400">+10 Skor</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📝 Kertas ACC Dosen</span>
                    <span className="font-bold text-emerald-400">+15 Skor</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⭐ Bintang Bonus Prestasi</span>
                    <span className="font-bold text-amber-400">+25 Bonus</span>
                  </div>
                </div>
              </div>

              {/* Obstacles */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>HINDARI RINTANGAN (-1 NYAWA)</span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>🎮 Mabar Game Online</span>
                    <span className="text-rose-400">Lupa Waktu</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🛌 Kasur Empuk</span>
                    <span className="text-rose-400">Mager!</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📱 Scroll Medsos/TikTok</span>
                    <span className="text-rose-400">Fokus Pecah!</span>
                  </div>
                  <div className="flex justify-between">
                    <span>☕ Nongkrong Subuh</span>
                    <span className="text-rose-400">Kesiangan!</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold mt-1"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* MODAL 2: Tingkat Level */}
        {showLevels && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-left flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-['Fredoka'] font-bold text-white text-base">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Progresi Level Permainan</span>
                </div>
                <button
                  onClick={() => setShowLevels(false)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div className="font-bold text-emerald-400">LEVEL 1</div>
                  <div className="text-slate-400 text-[11px]">Skor 0–100</div>
                  <div className="text-slate-300 mt-1">Santai & rintangan jarang</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div className="font-bold text-sky-400">LEVEL 2</div>
                  <div className="text-slate-400 text-[11px]">Skor 101–250</div>
                  <div className="text-slate-300 mt-1">Tugas mulai banyak</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div className="font-bold text-amber-400">LEVEL 3 & 4</div>
                  <div className="text-slate-400 text-[11px]">Skor 251–700</div>
                  <div className="text-slate-300 mt-1">Deadline cepat & malam hari</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-rose-900/50">
                  <div className="font-bold text-rose-400">LEVEL FINAL</div>
                  <div className="text-slate-400 text-[11px]">Skor 701+</div>
                  <div className="text-rose-200 mt-1">Bos Sidang Skripsi!</div>
                </div>
              </div>

              <button
                onClick={() => setShowLevels(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold mt-1"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
