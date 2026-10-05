import React from 'react';
import { ArrowUp, BookOpen, Sparkles } from 'lucide-react';

interface TouchControlsProps {
  onJump: () => void;
  onThrow: () => void;
  isBossStage: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onJump,
  onThrow,
  isBossStage,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none z-20 p-3 sm:p-5 flex items-end justify-between select-none">
      {/* Pojok Kiri Bawah: Tombol Melingkar LOMPAT (Jempol Kiri) */}
      <div className="pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onJump();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onJump();
          }}
          aria-label="Lompat"
          className="group relative flex flex-col items-center justify-center w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-t from-sky-600 via-blue-600 to-sky-400 text-white shadow-2xl shadow-sky-600/50 border-3 border-sky-200/90 active:scale-90 active:brightness-125 transition-transform cursor-pointer touch-manipulation backdrop-blur-sm"
        >
          {/* Inner Gloss Ring */}
          <div className="absolute inset-1 rounded-full border border-white/35 pointer-events-none" />

          {/* Jump Arrow Icon */}
          <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8 text-white stroke-[3] drop-shadow-md -mt-1 group-active:-translate-y-1 transition-transform" />

          {/* Label */}
          <span className="text-[11px] sm:text-xs font-['Fredoka'] font-black tracking-wider text-white drop-shadow leading-none">
            LOMPAT
          </span>

          {/* Subtext Keyboard Hint */}
          <span className="text-[9px] font-sans text-sky-200/90 font-bold leading-none mt-0.5">
            SPACE
          </span>
        </button>
      </div>

      {/* Pojok Kanan Bawah: Tombol Melingkar SERANG (Jempol Kanan) */}
      <div className="pointer-events-auto relative flex flex-col items-center">
        {/* Glowing pulse ring during Boss Stage */}
        {isBossStage && (
          <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 opacity-75 blur-sm animate-pulse pointer-events-none" />
        )}

        {/* Level Final Floating Badge */}
        <div className="absolute -top-2.5 z-10 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 text-[9px] sm:text-[10px] font-black tracking-wider font-['Fredoka'] border border-amber-100 shadow-md uppercase whitespace-nowrap pointer-events-none">
          Level Final
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onThrow();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onThrow();
          }}
          aria-label="Serang Lempar Skripsi - Level Final"
          className={`group relative flex flex-col items-center justify-center w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-t from-rose-600 via-red-500 to-amber-500 text-white shadow-2xl shadow-rose-600/50 border-3 border-amber-200/90 active:scale-90 active:brightness-125 transition-transform cursor-pointer touch-manipulation backdrop-blur-sm ${
            isBossStage ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900' : ''
          }`}
        >
          {/* Inner Gloss Ring */}
          <div className="absolute inset-1 rounded-full border border-white/35 pointer-events-none" />

          {/* Attack Icon */}
          <div className="relative -mt-0.5">
            <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-amber-100 stroke-[2.5] drop-shadow-md group-active:scale-110 transition-transform" />
            {isBossStage && (
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-2 animate-bounce" />
            )}
          </div>

          {/* Label */}
          <span className="text-[11px] sm:text-xs font-['Fredoka'] font-black tracking-wider text-white drop-shadow leading-none">
            SERANG
          </span>

          {/* Subtext Keyboard Hint */}
          <span className="text-[8px] sm:text-[9px] font-sans text-amber-200 font-extrabold leading-none mt-0.5">
            Level Final (X)
          </span>
        </button>
      </div>
    </div>
  );
};
