import React, { useState } from 'react';
import { Download, Share2, Copy, Check, ExternalLink, Smartphone, X, Globe, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ShareAndInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAndInstallModal: React.FC<ShareAndInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  // Primary shareable URL (using current window or canonical URL)
  const gameUrl = typeof window !== 'undefined' && window.location.href.startsWith('http')
    ? window.location.href
    : 'https://ais-dev-7bd6qht4qoipubogyqwlvo-393735408853.asia-southeast1.run.app';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(gameUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = gameUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Deadline Run - Game Mahasiswi ISTTS',
          text: 'Mainkan game Deadline Run! Bantu mahasiswi berlari melewati rintangan kuliah dan selesaikan Sidang Skripsi!',
          url: gameUrl,
        });
      } catch {
        // User cancelled or share failed, fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setInstallSuccess(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl text-white flex flex-col gap-5 overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Fredoka'] text-white">
                Download & Bagikan Game
              </h3>
              <p className="text-xs text-slate-400">
                Deadline Run • ISTTS Surabaya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Link Game */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-300 font-['Fredoka']">
              <Globe className="w-4 h-4 text-amber-400" />
              LINK GAME ONLINE
            </span>
            <span className="text-[11px] text-slate-400">Bisa dimainkan langsung di browser</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/70 rounded-xl p-2 px-3">
            <input
              type="text"
              readOnly
              value={gameUrl}
              className="bg-transparent text-xs text-slate-200 outline-none flex-1 font-mono truncate"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-md cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleNativeShare}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              Bagikan ke Teman
            </button>
            <a
              href={gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              Buka Tab Baru
            </a>
          </div>
        </div>

        {/* Section 2: Download / Install Game (PWA) */}
        <div className="bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-sky-950/40 border border-sky-500/30 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-sky-300 font-['Fredoka']">
                INSTALL / DOWNLOAD KE HP ATAU PC
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
              Bisa Offline
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Game ini dapat di-download ke beranda HP (Android & iPhone) maupun PC/Laptop tanpa perlu Google Play Store!
          </p>

          {isInstalled || installSuccess ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-2.5 text-emerald-300 text-xs font-semibold">
              <Check className="w-4 h-4 shrink-0" />
              <span>Aplikasi sudah ter-install di perangkat ini!</span>
            </div>
          ) : isInstallable ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download / Pasang Game Sekarang
            </button>
          ) : isIOS ? (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex flex-col gap-1.5">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Cara Download di iPhone / iPad:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Tekan tombol <strong>Share / Bagikan</strong> di menu Safari bawah.</li>
                <li>Pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.</li>
                <li>Ikon game akan muncul di layar iPhone dan bisa dimainkan offline!</li>
              </ol>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex flex-col gap-1.5">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Cara Pasang di Browser / PC / Android:
              </span>
              <p className="text-slate-400 text-[11px]">
                Tekan tombol titik tiga <strong>(⋮)</strong> di pojok kanan atas browser Anda, lalu pilih <strong>"Install Deadline Run"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
              </p>
            </div>
          )}
          {/* Download Direct ZIP File */}
          <div className="pt-1 border-t border-slate-800 flex flex-col gap-2">
            <a
              href="/deadline-run-game.zip"
              download="Deadline-Run-ISTTS.zip"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-98 border border-slate-750 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Paket Game (.ZIP Offline)</span>
            </a>
            <p className="text-[10px] text-slate-400 text-center leading-normal">
              💡 <em>Catatan Error 403:</em> Jika link dibagikan ke orang lain dan muncul 403 Forbidden, gunakan tombol <strong>"Share"</strong> di pojok kanan atas Google AI Studio untuk mengaktifkan akses publik.
            </p>
          </div>
        </div>

        {/* Footer Close */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default ShareAndInstallModal;
