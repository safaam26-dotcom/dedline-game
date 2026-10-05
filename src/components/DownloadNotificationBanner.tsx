import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone, Check, Gamepad2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DownloadNotificationBannerProps {
  onOpenDetails: () => void;
}

export const DownloadNotificationBanner: React.FC<DownloadNotificationBannerProps> = ({ onOpenDetails }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // If already installed as standalone PWA, do not show the banner
    if (isInstalled) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('deadline_run_install_dismissed');
    if (!isDismissed) {
      // Show after a brief delay (1 second) so it animates smoothly when page opens
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('deadline_run_install_dismissed', 'true');
  };

  const handleDownloadClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstalledSuccess(true);
        setTimeout(() => setIsVisible(false), 3000);
        return;
      }
    }
    // If iOS or browser doesn't support direct trigger, open the detailed modal
    onOpenDetails();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in slide-in-from-top-6 fade-in duration-300 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-sky-500/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-sky-500/20 text-white flex items-center justify-between gap-3">
        {/* Left: Gamepad Badge */}
        <div className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 border border-sky-400/50 flex items-center justify-center shadow-md">
          <Gamepad2 className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-extrabold text-white font-['Fredoka'] truncate">
              Download Deadline Run
            </span>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded font-semibold uppercase">
              Gratis
            </span>
          </div>
          <p className="text-[11px] text-slate-300 truncate mt-0.5">
            {installedSuccess
              ? '✅ Aplikasi berhasil dipasang!'
              : 'Pasang ke layar HP atau PC untuk main offline!'}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {installedSuccess ? (
            <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Terpasang</span>
            </div>
          ) : (
            <button
              onClick={handleDownloadClick}
              className="py-2 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Tutup notifikasi"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadNotificationBanner;
