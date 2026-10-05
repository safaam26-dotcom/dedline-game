import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstalled, isIframe, install } = usePWAInstall();
  const [downloading, setDownloading] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running as an installed standalone app, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);

    try {
      const success = await install();
      if (success) {
        setJustInstalled(true);
      }
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  if (justInstalled) {
    return (
      <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 font-['Fredoka']">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Aplikasi Berhasil Terpasang di HP!</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      title="Download & Pasang Game ke Layar HP"
      className={`inline-flex items-center justify-center gap-2 font-['Fredoka'] font-bold tracking-wide transition cursor-pointer active:scale-95 ${
        compact
          ? 'px-3 py-1.5 text-xs rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md border border-sky-400/30'
          : 'w-full py-3 px-4 text-sm sm:text-base rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-xl shadow-sky-600/30 border border-sky-400/40'
      }`}
    >
      <Smartphone className="w-4 h-4 text-sky-200" />
      <span className="flex items-center gap-1.5">
        <span>{downloading ? 'Sedang Mendownload...' : 'Download & Pasang ke HP'}</span>
        <Download className="w-4 h-4 text-sky-200 animate-bounce" />
      </span>
      {isIframe && (
        <span className="hidden sm:inline-block text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1 font-sans">
          Buka Penuh
        </span>
      )}
    </button>
  );
};
