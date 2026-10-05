import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameState, LevelNotification, TimeOfDay, ZoneType } from './types';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { StartMenu } from './components/StartMenu';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { LevelUpModal } from './components/LevelUpModal';
import { ShareAndInstallModal } from './components/ShareAndInstallModal';
import { DownloadNotificationBanner } from './components/DownloadNotificationBanner';
import { sounds } from './game/audio';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [levelNotification, setLevelNotification] = useState<LevelNotification | null>(null);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  const [hud, setHud] = useState<{
    lives: number;
    score: number;
    level: number;
    zone: ZoneType;
    timeOfDay: TimeOfDay;
    bossHp?: number;
    bossMaxHp?: number;
  }>({
    lives: 3,
    score: 0,
    level: 1,
    zone: 'KAMPUS',
    timeOfDay: 'PAGI',
  });

  // Handle Resize smoothly
  const handleResize = useCallback(() => {
    if (!containerRef.current || !engineRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    engineRef.current.resize(w, h);
  }, []);

  // Initialize Game Engine on mount
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const w = Math.floor(rect.width) || 960;
    const h = Math.floor(rect.height) || 540;

    const engine = new GameEngine(canvasRef.current);
    engine.resize(w, h);
    engineRef.current = engine;

    engine.onStateChange = (newState) => {
      setGameState(newState);
    };

    engine.onHudUpdate = (data) => {
      setHud({ ...data });
    };

    engine.onLevelNotification = (notification) => {
      setLevelNotification(notification);
    };

    // Render initial static menu scene
    engine.render();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
    };
  }, [handleResize]);

  // Continue game after level up pop-up
  const handleContinueLevelUp = () => {
    if (!engineRef.current) return;
    engineRef.current.resumeAfterLevelUp();
    setLevelNotification(null);
  };

  // Global Keyboard event handlers (SPACE to Jump, X to Throw Skripsi, Space/Enter for Level Up)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      // When Level Up modal is showing, Space or Enter continues the game!
      if (levelNotification && levelNotification.show) {
        if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
          e.preventDefault();
          handleContinueLevelUp();
          return;
        }
      }

      if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'PLAYING' || gameState === 'BOSS') {
          engineRef.current.jump();
        } else if (gameState === 'MENU') {
          handleStartGame();
        }
      } else if (e.code === 'KeyX' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        if (gameState === 'BOSS') {
          engineRef.current.throwSkripsi();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, levelNotification]);

  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.start();
  };

  const handleRestart = () => {
    if (!engineRef.current) return;
    engineRef.current.start();
  };

  const handleBackToMenu = () => {
    if (!engineRef.current) return;
    engineRef.current.stop();
    engineRef.current.state = 'MENU';
    engineRef.current.reset();
    setGameState('MENU');
    setLevelNotification(null);
    engineRef.current.render();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const handleJump = () => {
    if (!engineRef.current) return;
    engineRef.current.jump();
  };

  const handleThrow = () => {
    if (!engineRef.current) return;
    engineRef.current.throwSkripsi();
  };

  return (
    <main className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center p-0 select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Game Screen Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-7xl max-h-[820px] bg-slate-900 overflow-hidden shadow-2xl rounded-none md:rounded-3xl border border-slate-800"
      >
        {/* The 2D Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-pointer touch-none"
          onClick={() => {
            if (gameState === 'PLAYING' || gameState === 'BOSS') {
              handleJump();
            }
          }}
          onTouchStart={(e) => {
            if (gameState === 'PLAYING' || gameState === 'BOSS') {
              e.preventDefault();
              handleJump();
            }
          }}
        />

        {/* Unified Top Header & HUD (MBD Logo, Nyawa, Area Kampus, Score, Level, Sound, ISTTS Logo) */}
        <GameHUD
          isPlaying={gameState === 'PLAYING' || gameState === 'BOSS'}
          lives={hud.lives}
          score={hud.score}
          level={hud.level}
          zone={hud.zone}
          timeOfDay={hud.timeOfDay}
          bossHp={hud.bossHp}
          bossMaxHp={hud.bossMaxHp}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenShare={() => setIsShareOpen(true)}
          isBossStage={gameState === 'BOSS'}
        />

        {/* Level Up Pop-up Modal (Pauses game, requires clicking LANJUT) */}
        <LevelUpModal
          notification={levelNotification}
          onContinue={handleContinueLevelUp}
        />

        {/* Touch Controls (Jump, Throw Skripsi) */}
        {(gameState === 'PLAYING' || gameState === 'BOSS') && (
          <TouchControls
            onJump={handleJump}
            onThrow={handleThrow}
            isBossStage={gameState === 'BOSS'}
          />
        )}

        {/* Start Menu Overlay */}
        {gameState === 'MENU' && (
          <StartMenu
            onStart={handleStartGame}
            onOpenShareAndInstall={() => setIsShareOpen(true)}
          />
        )}

        {/* Game Over Screen */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            score={hud.score}
            level={hud.level}
            onRestart={handleRestart}
            onMenu={handleBackToMenu}
            onOpenShareAndInstall={() => setIsShareOpen(true)}
          />
        )}

        {/* Final Ending / Victory Screen */}
        {gameState === 'VICTORY' && (
          <VictoryModal
            score={hud.score}
            onRestart={handleRestart}
            onMenu={handleBackToMenu}
            onOpenShareAndInstall={() => setIsShareOpen(true)}
          />
        )}

        {/* Share & Download / PWA Install Modal */}
        <ShareAndInstallModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />

        {/* Automatic Download & Install Notification Banner */}
        <DownloadNotificationBanner onOpenDetails={() => setIsShareOpen(true)} />
      </div>
    </main>
  );
}
