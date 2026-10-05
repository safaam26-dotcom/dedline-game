import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __pwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return typeof window !== 'undefined' ? window.__pwaPrompt || null : null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    // Check if in standalone mode (already installed app)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iframe (e.g. inside AI Studio preview)
    const inIframe = window.self !== window.top;
    setIsIframe(inIframe);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check early prompt
    if (window.__pwaPrompt) {
      setDeferredPrompt(window.__pwaPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handlePromptReady = () => {
      if (window.__pwaPrompt) {
        setDeferredPrompt(window.__pwaPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      window.__pwaPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-installed-success', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-installed-success', handleAppInstalled);
    };
  }, []);

  // Function to create and download standalone launcher file
  const downloadLauncherFile = useCallback(() => {
    const directUrl = window.location.href;
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>DEADLINE RUN: Game Mahasiswi ISTTS</title>
  <link rel="manifest" href="${window.location.origin}/manifest.json">
  <meta name="theme-color" content="#0b192c">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="apple-touch-icon" href="${window.location.origin}/app-icon.png">
  <style>
    body {
      margin: 0;
      background: #0b192c;
      color: white;
      font-family: system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 20px;
    }
    .card {
      background: #1e293b;
      padding: 24px;
      border-radius: 24px;
      max-width: 360px;
      border: 1px solid #334155;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    img {
      width: 96px;
      height: 96px;
      border-radius: 20px;
      margin-bottom: 16px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    }
    h1 { margin: 0 0 8px; font-size: 20px; }
    p { color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
    a.btn {
      display: block;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: white;
      text-decoration: none;
      font-weight: bold;
      padding: 14px 20px;
      border-radius: 16px;
      box-shadow: 0 4px 14px rgba(2,132,199,0.4);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>DEADLINE RUN</h1>
    <p>Game Mahasiswi ISTTS</p>
    <a class="btn" href="${directUrl}">▶ Buka & Mainkan Game</a>
  </div>
  <script>
    // Auto redirect to game
    setTimeout(function() {
      window.location.href = "${directUrl}";
    }, 500);
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Deadline-Run-ISTTS.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const install = async () => {
    const promptToUse = deferredPrompt || window.__pwaPrompt;
    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const { outcome } = await promptToUse.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          window.__pwaPrompt = null;
          return true;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }

    // If in iframe (e.g. AI Studio preview), open in new tab directly so Chrome can prompt natively
    if (isIframe) {
      window.open(window.location.href, '_blank');
    }

    // Always trigger direct file download to fulfill the user's download request
    downloadLauncherFile();
    return false;
  };

  return {
    isInstallable: !!deferredPrompt || !!window.__pwaPrompt,
    isInstalled,
    isIOS,
    isIframe,
    install,
    downloadLauncherFile,
  };
}
