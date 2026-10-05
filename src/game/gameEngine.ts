import {
  Boss,
  Cloud,
  CollectibleItem,
  FloatingText,
  GameState,
  ItemKind,
  LevelNotification,
  Obstacle,
  ObstacleKind,
  Particle,
  Player,
  Projectile,
  TimeOfDay,
  ZoneType,
} from '../types';
import { sounds } from './audio';
import { drawCharacter } from './characterRenderer';
import { drawItem, drawObstacle } from './assetRenderer';
import { drawBackground, getTimeOfDay, TimeInfo } from './backgroundRenderer';
import { drawBoss, drawProjectile } from './bossRenderer';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public state: GameState = 'MENU';
  public width: number = 960;
  public height: number = 540;
  public groundY: number = 440;

  // Camera & World
  public cameraX: number = 0;
  public speed: number = 300; // pixels per second (initial relaxed speed)
  public distanceTraveled: number = 0;
  private distanceScoreAccumulator: number = 0;

  // Progression
  public currentZone: ZoneType = 'KAMPUS';
  public transitionRatio: number = 0; // 0 to 1
  public level: number = 1; // 1 (0-100), 2 (101-250), 3 (251-450), 4 (451-700), 5 (Final: 701+)
  public timeOfDay: TimeOfDay = 'PAGI';
  public timeBlend: number = 0;
  public timeInfo: TimeInfo = getTimeOfDay(0).timeInfo;

  // Entities
  public player: Player;
  public obstacles: Obstacle[] = [];
  public items: CollectibleItem[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public clouds: Cloud[] = [];
  public projectiles: Projectile[] = [];
  public boss: Boss | null = null;

  // Timers & Spawners
  private lastTime: number = 0;
  private spawnObstacleTimer: number = 0;
  private spawnItemTimer: number = 0;
  private animFrameId: number | null = null;
  private isPaused: boolean = false;
  private levelNotificationTimeout: ReturnType<typeof setTimeout> | null = null;

  // Callbacks for UI sync
  public onStateChange?: (state: GameState) => void;
  public onLevelNotification?: (notification: LevelNotification) => void;
  public onHudUpdate?: (data: {
    lives: number;
    score: number;
    level: number;
    zone: ZoneType;
    timeOfDay: TimeOfDay;
    bossHp?: number;
    bossMaxHp?: number;
  }) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.player = this.createDefaultPlayer();
    this.initClouds();
    this.resize(this.width, this.height);
  }

  private createDefaultPlayer(): Player {
    return {
      x: 120,
      y: this.groundY - 70,
      width: 48,
      height: 70,
      vy: 0,
      isGrounded: true,
      jumpCount: 0,
      runCycle: 0,
      hairOffset: 0,
      isHit: false,
      hitTimer: 0,
      lives: 3,
      score: 0,
      level: 1,
      state: 'running',
      throwAnimationTimer: 0,
    };
  }

  private initClouds() {
    this.clouds = [];
    for (let i = 0; i < 7; i++) {
      this.clouds.push(this.generateCloud(i * 260 + Math.random() * 80));
    }
  }

  private generateCloud(startX: number): Cloud {
    const puffs = [];
    const numPuffs = 4 + Math.floor(Math.random() * 4);
    for (let p = 0; p < numPuffs; p++) {
      puffs.push({
        offsetX: p * 18 - 25 + Math.random() * 10,
        offsetY: Math.sin((p / numPuffs) * Math.PI) * -12 + (Math.random() * 6 - 3),
        radius: 18 + Math.random() * 14,
      });
    }

    return {
      x: startX,
      y: 40 + Math.random() * 120,
      scale: 0.8 + Math.random() * 0.5,
      speed: 15 + Math.random() * 20,
      puffs,
    };
  }

  public resize(w: number, h: number) {
    this.width = w;
    this.height = h;

    const isPortrait = h > w * 1.15;
    if (isPortrait) {
      this.groundY = Math.floor(h * 0.70);
      this.player.x = Math.max(45, Math.floor(w * 0.12));
    } else {
      this.groundY = h - Math.min(110, Math.max(75, Math.floor(h * 0.18)));
      this.player.x = Math.min(120, Math.max(60, Math.floor(w * 0.14)));
    }

    this.canvas.width = w;
    this.canvas.height = h;
    if (this.player.isGrounded) {
      this.player.y = this.groundY - this.player.height;
    }
  }

  public start() {
    this.stop();
    this.state = 'PLAYING';
    this.reset();
    this.lastTime = performance.now();
    sounds.startBGM();
    if (this.onStateChange) this.onStateChange(this.state);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public reset() {
    this.cameraX = 0;
    this.distanceTraveled = 0;
    this.distanceScoreAccumulator = 0;
    this.speed = 300;
    this.currentZone = 'KAMPUS';
    this.transitionRatio = 0;
    this.level = 1;
    this.timeOfDay = 'PAGI';
    this.timeBlend = 0;
    this.timeInfo = getTimeOfDay(0).timeInfo;

    if (this.levelNotificationTimeout) {
      clearTimeout(this.levelNotificationTimeout);
      this.levelNotificationTimeout = null;
    }
    if (this.onLevelNotification) {
      this.onLevelNotification({ show: false, level: 1, title: '', subtitle: '', isFinal: false });
    }

    this.player = this.createDefaultPlayer();
    const isPortrait = this.height > this.width * 1.15;
    this.player.x = isPortrait ? Math.max(45, Math.floor(this.width * 0.12)) : Math.min(120, Math.max(60, Math.floor(this.width * 0.14)));
    if (this.player.isGrounded) {
      this.player.y = this.groundY - this.player.height;
    }
    this.obstacles = [];
    this.items = [];
    this.particles = [];
    this.floatingTexts = [];
    this.projectiles = [];
    this.boss = null;
    this.spawnObstacleTimer = 2.0;
    this.spawnItemTimer = 0.8;

    this.initClouds();
    this.syncHud();
  }

  public jump() {
    if (this.state !== 'PLAYING' && this.state !== 'BOSS') return;

    // Standard or double jump
    if (this.player.isGrounded || this.player.jumpCount < 2) {
      this.player.vy = -680;
      this.player.isGrounded = false;
      this.player.jumpCount++;
      this.player.state = 'jumping';
      sounds.playJump();

      // Jump dust puff particles
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: this.player.x + this.player.width / 2 + (Math.random() * 20 - 10),
          y: this.groundY,
          vx: Math.random() * 60 - 30,
          vy: -Math.random() * 40,
          size: 3 + Math.random() * 3,
          color: 'rgba(203, 213, 225, 0.8)',
          life: 0,
          maxLife: 0.35,
          alpha: 0.8,
          type: 'dust',
        });
      }
    }
  }

  public throwSkripsi() {
    if ((this.state !== 'BOSS' && this.state !== 'PLAYING') || this.isPaused) return;

    this.player.throwAnimationTimer = 0.25;
    sounds.playThrowSkripsi();

    // Spawn player thesis projectile aiming accurately towards the boss
    const spawnX = this.player.x + this.player.width;
    const spawnY = this.player.y + 16;
    let aimVy = -30;

    if (this.boss) {
      const targetCenterX = this.boss.x + this.boss.width / 2;
      const targetCenterY = this.boss.y + this.boss.height * 0.35;
      const dx = Math.max(100, targetCenterX - spawnX);
      const dy = targetCenterY - spawnY;
      const flightTime = dx / 720;
      aimVy = Math.max(-260, Math.min(180, dy / flightTime));
    }

    this.projectiles.push({
      id: Math.random().toString(),
      x: spawnX,
      y: spawnY,
      prevX: spawnX,
      prevY: spawnY,
      vx: 720,
      vy: aimVy,
      width: 32,
      height: 22,
      type: 'SKRIPSI_PLAYER',
      rotation: 0,
      vRot: 10,
    });
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
  }

  // ==================== MAIN UPDATE & LOOP ====================

  private loop = (currentTime: number) => {
    if (!this.animFrameId) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.08); // cap delta to prevent tunneling
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.update(dt);
    }
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sounds.stopBGM();
  }

  private update(dt: number) {
    if (this.state === 'MENU' || this.state === 'GAME_OVER' || this.state === 'VICTORY') {
      this.updateParticlesOnly(dt);
      return;
    }

    // Advance camera & world progression
    const currentSpeed = this.state === 'BOSS' ? this.speed * 0.75 : this.speed;
    this.cameraX += currentSpeed * dt;
    this.distanceTraveled += currentSpeed * dt;

    // Accumulate distance score gradually (adds ~2.5 points per second)
    if (this.state === 'PLAYING') {
      this.distanceScoreAccumulator += currentSpeed * dt;
      if (this.distanceScoreAccumulator >= 120) {
        this.player.score += 1;
        this.distanceScoreAccumulator -= 120;
      }
    }

    // Day-Night progression
    const tod = getTimeOfDay(this.distanceTraveled);
    this.timeOfDay = tod.timeOfDay;
    this.timeBlend = tod.blend;
    this.timeInfo = tod.timeInfo;

    // Level progression based on Score & distance
    this.updateProgression();

    // Update Player physics & animations
    this.updatePlayer(dt);

    // Update Clouds
    this.updateClouds(dt);

    // Update Particles
    this.updateParticles(dt);

    // Update Floating Texts
    this.updateFloatingTexts(dt);

    if (this.state === 'PLAYING') {
      // Spawn & update obstacles
      this.updateObstacles(dt);
      // Spawn & update items
      this.updateItems(dt);
      // Update player thrown projectiles
      this.updateProjectiles(dt);
    } else if (this.state === 'BOSS') {
      // Boss battle mode
      this.updateBoss(dt);
      this.updateProjectiles(dt);
    }

    this.syncHud();
  }

  private updateProgression() {
    const score = this.player.score;
    let nextLevel = 1;

    // Exact level thresholds
    if (score < 101) {
      nextLevel = 1;
    } else if (score < 251) {
      nextLevel = 2;
    } else if (score < 451) {
      nextLevel = 3;
    } else if (score < 701) {
      nextLevel = 4;
    } else {
      nextLevel = 5; // LEVEL FINAL
    }

    // Check if player leveled up
    if (nextLevel > this.level && this.state === 'PLAYING') {
      this.level = nextLevel;
      this.player.level = nextLevel;
      sounds.playLevelUp();
      this.spawnCelebrationConfetti();

      // Pause game completely (character, obstacles, and background freeze)
      this.isPaused = true;

      // Trigger pop-up modal
      this.triggerLevelNotification({
        show: true,
        level: nextLevel,
        title: '🎉 SELAMAT!',
        subtitle: `KAMU NAIK KE LEVEL ${nextLevel}!`,
        isFinal: nextLevel >= 5,
      });
    }

    // Adjust speed and biome transitions according to Level
    switch (this.level) {
      case 1:
        this.speed = 300;
        this.currentZone = 'KAMPUS';
        this.transitionRatio = Math.max(0, this.transitionRatio - 0.5 * 0.016);
        break;
      case 2:
        this.speed = 360;
        this.currentZone = 'KAMPUS';
        this.transitionRatio = Math.max(0, this.transitionRatio - 0.5 * 0.016);
        break;
      case 3:
        this.speed = 420;
        this.currentZone = 'KOTA';
        // Smoothly transition background into city
        this.transitionRatio = Math.min(1, this.transitionRatio + 0.6 * 0.016);
        break;
      case 4:
        this.speed = 480;
        this.currentZone = 'KOTA';
        this.transitionRatio = 1;
        break;
      case 5:
        if (this.state !== 'BOSS') {
          this.speed = 520;
        }
        break;
    }
  }

  public triggerLevelNotification(notification: LevelNotification) {
    if (this.onLevelNotification) {
      this.onLevelNotification(notification);
    }
  }

  public resumeAfterLevelUp() {
    this.isPaused = false;
    this.lastTime = performance.now(); // Reset timing to prevent sudden dt delta jump

    if (this.onLevelNotification) {
      this.onLevelNotification({
        show: false,
        level: this.level,
        title: '',
        subtitle: '',
        isFinal: false,
      });
    }

    // If level 5 is reached, commence Sidang Skripsi (Boss fight)
    if (this.level >= 5 && this.state !== 'BOSS') {
      this.triggerBossEncounter();
    }
  }

  public spawnCelebrationConfetti() {
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#a855f7', '#fbbf24', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: this.width * 0.5 + (Math.random() * 260 - 130),
        y: this.height * 0.45 + (Math.random() * 80 - 40),
        vx: (Math.random() - 0.5) * 360,
        vy: -Math.random() * 260 - 60,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 1.8,
        alpha: 1,
        type: 'confetti',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 12,
      });
    }
  }

  public triggerBossEncounter() {
    this.state = 'BOSS';
    this.level = 5;
    this.currentZone = 'SIDANG';
    this.speed = 280;

    // Clear regular obstacles & items
    this.obstacles = [];
    this.items = [];

    // Spawn Dosen Penguji
    this.boss = {
      x: this.width - 150,
      y: this.groundY - 80,
      width: 52,
      height: 80,
      hp: 5,
      maxHp: 5,
      state: 'idle',
      attackCooldown: 1.5,
      animTimer: 0,
      hitTimer: 0,
      targetY: this.groundY - 80,
      dodgeCooldown: 1.5,
      dodgeTimer: 0,
    };

    this.addFloatingText(
      'SIDANG SKRIPSI: DOSEN PENGUJI!',
      this.width / 2,
      this.height * 0.35,
      '#ef4444',
      1.8,
      3
    );

    if (this.onStateChange) this.onStateChange(this.state);
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Gravity
    const gravity = 1800;
    p.vy += gravity * dt;
    p.y += p.vy * dt;

    // Ground check
    if (p.y >= this.groundY - p.height) {
      p.y = this.groundY - p.height;
      p.vy = 0;
      p.isGrounded = true;
      p.jumpCount = 0;
      if (p.state !== 'graduated') {
        p.state = 'running';
      }
    } else {
      p.isGrounded = false;
      if (p.vy > 0 && p.state !== 'graduated') {
        p.state = 'falling';
      }
    }

    // Running cycle & hair sway
    p.runCycle += 14 * dt;
    p.hairOffset = Math.sin(p.runCycle) * 4;

    // Hit timer
    if (p.hitTimer > 0) {
      p.hitTimer -= dt;
      if (p.hitTimer <= 0) {
        p.isHit = false;
      }
    }

    // Throw animation timer
    if (p.throwAnimationTimer > 0) {
      p.throwAnimationTimer -= dt;
    }

    // Ambient running dust when grounded
    if (p.isGrounded && Math.random() < 0.25) {
      this.particles.push({
        x: p.x + 8,
        y: this.groundY,
        vx: -80 - Math.random() * 40,
        vy: -Math.random() * 25,
        size: 2.5 + Math.random() * 2,
        color: 'rgba(226, 232, 240, 0.7)',
        life: 0,
        maxLife: 0.3,
        alpha: 0.7,
        type: 'dust',
      });
    }
  }

  // ==================== OBSTACLES ====================

  private updateObstacles(dt: number) {
    // Spawning pacing based on Level
    this.spawnObstacleTimer -= dt;
    if (this.spawnObstacleTimer <= 0) {
      this.spawnObstacle();
      // Level 1: 2.8 - 3.8s (santai, jarang)
      // Level 2: 2.1 - 2.8s (mulai lebih sering)
      // Level 3: 1.7 - 2.3s (variasi & kombinasi)
      // Level 4: 1.3 - 1.8s (cukup cepat, timing penting)
      // Level 5+: 1.1 - 1.5s
      let minInterval = 2.8;
      let maxInterval = 3.8;

      if (this.level === 2) {
        minInterval = 2.1;
        maxInterval = 2.8;
      } else if (this.level === 3) {
        minInterval = 1.7;
        maxInterval = 2.3;
      } else if (this.level === 4) {
        minInterval = 1.3;
        maxInterval = 1.8;
      } else if (this.level >= 5) {
        minInterval = 1.1;
        maxInterval = 1.5;
      }

      this.spawnObstacleTimer = minInterval + Math.random() * (maxInterval - minInterval);
    }

    // Movement & Collision
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (!obs) continue;
      obs.x -= this.speed * dt;

      // Check collision with player
      if (!this.player.isHit && this.checkCollision(this.player, obs)) {
        this.handleObstacleHit(obs);
      }

      // Despawn when off screen
      if (obs.x + obs.width < -100) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  private spawnObstacle() {
    const kinds: ObstacleKind[] = ['GAME_ONLINE', 'KASUR', 'TIKTOK', 'NONGKRONG'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];

    let width = 54;
    let height = 54;
    let label = '';
    let message = '';

    switch (kind) {
      case 'GAME_ONLINE':
        width = 52;
        height = 56;
        label = 'Mabar Game Online';
        message = 'Lupa Waktu';
        break;
      case 'KASUR':
        width = 64;
        height = 48;
        label = 'Kasur Empuk';
        message = 'Mager!';
        break;
      case 'TIKTOK':
        width = 46;
        height = 58;
        label = 'Scroll TikTok / Drakor';
        message = 'Fokus Pecah!';
        break;
      case 'NONGKRONG':
        width = 50;
        height = 54;
        label = 'Nongkrong Sampai Subuh';
        message = 'Kesiangan!';
        break;
    }

    this.obstacles.push({
      id: Math.random().toString(),
      kind,
      x: this.width + 50,
      y: this.groundY - height,
      width,
      height,
      label,
      message,
      passed: false,
      wobble: 0,
    });
  }

  private handleObstacleHit(obs: Obstacle) {
    if (!obs || !this.player) return;
    this.player.isHit = true;
    this.player.hitTimer = 1.6; // Invincible flashing for 1.6s
    this.player.lives--;
    sounds.playHit();

    // Floating reaction
    this.addFloatingText(obs.message || 'Nabrak!', obs.x, obs.y - 20, '#ef4444', 1.3);

    // Screen shake / burst particles
    for (let p = 0; p < 12; p++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        vx: Math.random() * 200 - 100,
        vy: Math.random() * 200 - 100,
        size: 3 + Math.random() * 4,
        color: '#ef4444',
        life: 0,
        maxLife: 0.5,
        alpha: 1,
        type: 'sparkle',
      });
    }

    if (this.player.lives <= 0) {
      this.gameOver();
    }
  }

  // ==================== ITEMS ====================

  private updateItems(dt: number) {
    this.spawnItemTimer -= dt;
    if (this.spawnItemTimer <= 0) {
      this.spawnItemPattern();
      this.spawnItemTimer = 1.0 + Math.random() * 1.5;
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (!item) continue;
      item.x -= this.speed * dt;
      item.floatOffset += 5 * dt;

      // Collision check
      if (!item.collected && this.checkItemCollision(this.player, item)) {
        this.collectItem(item);
      }

      if (item.x + item.width < -100) {
        this.items.splice(i, 1);
      }
    }
  }

  private spawnItemPattern() {
    const kinds: ItemKind[] = ['TUGAS', 'SLIDE', 'REVISI_ACC', 'BINTANG_IPK'];
    // Weighted choice: IPK 4.0 is rarer
    const rand = Math.random();
    let kind: ItemKind = 'TUGAS';
    if (rand < 0.35) kind = 'TUGAS';
    else if (rand < 0.65) kind = 'SLIDE';
    else if (rand < 0.88) kind = 'REVISI_ACC';
    else kind = 'BINTANG_IPK';

    let scoreValue = 10;
    let name = 'Tugas Selesai';

    switch (kind) {
      case 'TUGAS':
        scoreValue = 10;
        name = '+10 Score';
        break;
      case 'SLIDE':
        scoreValue = 10;
        name = '+10 Score';
        break;
      case 'REVISI_ACC':
        scoreValue = 15;
        name = '+15 Score';
        break;
      case 'BINTANG_IPK':
        scoreValue = 25;
        name = '+25 Bonus!';
        break;
    }

    // High item (requiring jump) or low item
    const isHigh = Math.random() > 0.45;
    const yPos = isHigh ? this.groundY - 160 : this.groundY - 80;

    this.items.push({
      id: Math.random().toString(),
      kind,
      x: this.width + 60,
      y: yPos,
      width: 36,
      height: 36,
      scoreValue,
      name,
      collected: false,
      floatOffset: Math.random() * Math.PI,
      rotation: 0,
    });
  }

  private collectItem(item: CollectibleItem) {
    if (!item) return;
    item.collected = true;
    const isBonus = item.kind === 'BINTANG_IPK';
    sounds.playCollect(isBonus);

    this.player.score += item.scoreValue;

    // Floating score tag
    const textColor = isBonus ? '#facc15' : item.kind === 'REVISI_ACC' ? '#22c55e' : '#38bdf8';
    this.addFloatingText(
      item.name,
      item.x,
      item.y - 15,
      textColor,
      isBonus ? 1.4 : 1.1
    );

    // Sparkles
    for (let p = 0; p < 8; p++) {
      this.particles.push({
        x: item.x + item.width / 2,
        y: item.y + item.height / 2,
        vx: Math.random() * 140 - 70,
        vy: Math.random() * 140 - 70,
        size: 3 + Math.random() * 3,
        color: textColor,
        life: 0,
        maxLife: 0.4,
        alpha: 1,
        type: 'sparkle',
      });
    }
  }

  // ==================== BOSS BATTLE ====================

  private updateBoss(dt: number) {
    if (!this.boss) return;
    const b = this.boss;

    b.animTimer += dt;
    if (b.hitTimer > 0) b.hitTimer -= dt;

    // Cooldown management for evasive dodges
    if (b.dodgeCooldown === undefined) b.dodgeCooldown = 0;
    if (b.dodgeCooldown > 0) b.dodgeCooldown -= dt;

    if (b.dodgeTimer && b.dodgeTimer > 0) {
      b.dodgeTimer -= dt;
      if (b.dodgeTimer <= 0 && b.state === 'dodging') {
        b.state = 'idle';
      }
    }

    // Check for incoming player skripsi to execute an evasive dodge!
    // ("bikin dosennya tu ngehindar dari serangan kita tp kalau pas kita serang dia dan kena ya yaudah berkurang itu hati")
    if (b.dodgeCooldown <= 0 && b.hitTimer <= 0 && b.state !== 'hit' && b.state !== 'defeated') {
      const incomingSkripsi = this.projectiles.find(
        (p) => p.type === 'SKRIPSI_PLAYER' && p.x > b.x - 320 && p.x < b.x - 70
      );

      if (incomingSkripsi) {
        // 60% chance to attempt a swift evasive dodge
        if (Math.random() < 0.6) {
          b.state = 'dodging';
          b.dodgeTimer = 0.45;
          // Set a clear cooldown window (2.2s - 2.8s) so player can reliably hit on follow-up throws
          b.dodgeCooldown = 2.2 + Math.random() * 0.6;

          // Intelligently dodge away from projectile trajectory
          const dodgeUp = b.y > this.groundY - 150 || (incomingSkripsi.y >= b.y && b.y > 130);
          b.targetY = dodgeUp ? this.groundY - 250 : this.groundY - 95;

          const quotes = ['Hap! Menghindar!', 'Eits! Belum Tepat!', 'Revisi Dulu!'];
          const quote = quotes[Math.floor(Math.random() * quotes.length)];
          this.addFloatingText(quote, b.x - 10, b.y - 30, '#38bdf8', 1.25, 0.9);

          // Evasive wind particles
          for (let k = 0; k < 6; k++) {
            this.particles.push({
              x: b.x + b.width / 2,
              y: b.y + b.height / 2,
              vx: -130 - Math.random() * 60,
              vy: (Math.random() - 0.5) * 80,
              size: 3 + Math.random() * 3,
              color: '#38bdf8',
              life: 0,
              maxLife: 0.4,
              alpha: 0.8,
              type: 'dust',
            });
          }
        } else {
          // If boss does not dodge this time, give a small delay before checking again
          b.dodgeCooldown = 0.9;
        }
      }
    }

    // Periodic dynamic altitude changes ("bisa keatas-atas gitu")
    // Boss shifts between High (groundY - 250), Mid (groundY - 180), and Low (groundY - 95)
    if (!b.targetY || Math.random() < 0.008) {
      const altitudes = [
        this.groundY - 250, // High aerial flight (player must jump to hit)
        this.groundY - 180, // Mid level
        this.groundY - 95,  // Ground hover
      ];
      b.targetY = altitudes[Math.floor(Math.random() * altitudes.length)];
    }

    // Smooth ease towards target altitude (faster during evasive dodge)
    const easeSpeed = b.state === 'dodging' ? 7.5 : 3.4;
    const targetWithBob = b.targetY + Math.sin(b.animTimer * 2.8) * 16;
    b.y += (targetWithBob - b.y) * Math.min(1, easeSpeed * dt);

    // Keep within comfortable bounds
    b.y = Math.max(85, Math.min(this.groundY - 80, b.y));

    // Boss Attack Timer
    b.attackCooldown -= dt;
    if (b.attackCooldown <= 0) {
      this.triggerBossAttack();
      b.attackCooldown = 1.6 + Math.random() * 1.2;
    }
  }

  private triggerBossAttack() {
    if (!this.boss) return;
    const b = this.boss;

    // Angle trajectory towards player depending on current boss height
    const dy = (this.player.y + 15) - (b.y + 20);
    const aimVy = Math.max(-130, Math.min(130, dy * 0.85));

    // Three attack types:
    // 1. Revisi Skripsi: "REVISI!" flying sheet
    // 2. Pertanyaan Sidang: Floating sharp question
    // 3. Spam Revisi: multi sheets
    const rand = Math.random();

    if (rand < 0.4) {
      // 1. Revisi sheet
      b.state = 'throwing';
      setTimeout(() => {
        if (this.boss) this.boss.state = 'idle';
      }, 300);

      this.projectiles.push({
        id: Math.random().toString(),
        x: b.x - 20,
        y: b.y + 20,
        vx: -420,
        vy: aimVy + (Math.random() * 40 - 20),
        width: 44,
        height: 28,
        type: 'REVISI_BOSS',
        rotation: 0,
        vRot: -4,
      });
    } else if (rand < 0.75) {
      // 2. Pertanyaan Sidang
      const questions = [
        'KENAPA METODE INI?',
        'SUMBER DATA DARI MANA?',
        'KENAPA HASILNYA BEGINI?',
        'APA KELEMAHAN PENELITIAN INI?',
      ];
      const qText = questions[Math.floor(Math.random() * questions.length)];

      this.projectiles.push({
        id: Math.random().toString(),
        x: b.x - 40,
        y: b.y + 15,
        vx: -370,
        vy: aimVy * 0.5,
        width: 140,
        height: 28,
        type: 'QUESTION_BOSS',
        text: qText,
        rotation: 0,
        vRot: 0,
      });
    } else {
      // 3. Spam Revisi barrage
      [-25, 10, 45].forEach((yOffset, idx) => {
        setTimeout(() => {
          if (this.state === 'BOSS' && this.boss) {
            const currentDy = (this.player.y + 15) - (this.boss.y + yOffset);
            this.projectiles.push({
              id: Math.random().toString(),
              x: this.boss.x - 20,
              y: this.boss.y + yOffset,
              vx: -410 - idx * 30,
              vy: Math.max(-140, Math.min(140, currentDy * 0.75)) + (yOffset / 50) * 30,
              width: 40,
              height: 26,
              type: 'REVISI_BOSS',
              rotation: 0,
              vRot: -5,
            });
          }
        }, idx * 120);
      });
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!p) continue;

      // Track previous position for swept collision check
      p.prevX = p.x;
      p.prevY = p.y;

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;

      if (p.type === 'SKRIPSI_PLAYER') {
        // Check hit against boss using generous, swept hit detection
        if (this.boss && this.checkPlayerProjectileHitsBoss(p, this.boss)) {
          this.handleBossHit();
          this.projectiles.splice(i, 1);
          continue;
        }

        // Destroy regular obstacles when playing
        if (this.state === 'PLAYING') {
          const hitObsIdx = this.obstacles.findIndex((obs) => this.checkCollision(p, obs));
          if (hitObsIdx !== -1) {
            const hitObs = this.obstacles[hitObsIdx];
            this.obstacles.splice(hitObsIdx, 1);
            this.projectiles.splice(i, 1);
            sounds.playCollect(true);
            this.addFloatingText('HANCUR! +20', hitObs.x, hitObs.y - 10, '#38bdf8', 1.3, 0.85);
            this.player.score += 20;
            for (let k = 0; k < 6; k++) {
              this.particles.push({
                x: hitObs.x + hitObs.width / 2,
                y: hitObs.y + hitObs.height / 2,
                vx: Math.random() * 80 - 40,
                vy: -Math.random() * 80 - 20,
                size: 3 + Math.random() * 3,
                color: '#38bdf8',
                life: 0,
                maxLife: 0.35,
                alpha: 0.9,
                type: 'dust',
              });
            }
            continue;
          }
        }
      } else {
        // Boss projectile hits player
        if (!this.player.isHit && this.checkCollision(this.player, p)) {
          this.handlePlayerHitByBoss(p);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Offscreen despawn
      if (p.x < -200 || p.x > this.width + 200 || p.y < -80 || p.y > this.height + 50) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  /**
   * Generous and accurate collision detection for player thesis against the lecturer boss.
   * Covers visual head, body, arms, clipboard and checks swept path to avoid tunneling.
   */
  private checkPlayerProjectileHitsBoss(p: Projectile, boss: Boss): boolean {
    if (!boss || boss.hp <= 0) return false;

    // Visual bounds of boss:
    // Torso/Legs: boss.x to boss.x + boss.width (plus arms/clipboard ~18px margin)
    // Head: reaches up to boss.y - 24px
    // Feet: reaches boss.y + boss.height + 6px
    const bossLeft = boss.x - 16;
    const bossRight = boss.x + boss.width + 18;
    const bossTop = boss.y - 25;
    const bossBottom = boss.y + boss.height + 8;

    // 1. Direct bounding box overlap
    const pLeft = p.x;
    const pRight = p.x + p.width;
    const pTop = p.y;
    const pBottom = p.y + p.height;

    const directHit =
      pLeft < bossRight &&
      pRight > bossLeft &&
      pTop < bossBottom &&
      pBottom > bossTop;

    if (directHit) return true;

    // 2. Swept-line check between (prevX, prevY) and (x, y) to prevent frame skips
    if (p.prevX !== undefined && p.prevY !== undefined) {
      const minX = Math.min(p.prevX, p.x);
      const maxX = Math.max(p.prevX + p.width, p.x + p.width);
      const minY = Math.min(p.prevY, p.y);
      const maxY = Math.max(p.prevY + p.height, p.y + p.height);

      if (minX < bossRight && maxX > bossLeft && minY < bossBottom && maxY > bossTop) {
        return true;
      }
    }

    return false;
  }

  private handleBossHit() {
    if (!this.boss) return;
    const b = this.boss;

    // Definitively decrement boss health
    b.hp--;
    b.hitTimer = 0.5;
    b.state = 'hit';
    sounds.playBossHit();

    const remainingHp = Math.max(0, b.hp);

    // Floating text showing remaining HP with clear feedback
    this.addFloatingText(
      `-1 HP! (Sisa ${remainingHp})`,
      b.x + b.width / 2,
      b.y - 35,
      '#ef4444',
      1.5,
      1.3
    );

    // Prevent immediate re-dodge so the player can execute combo hits
    b.dodgeCooldown = 1.8;

    // Shake camera / screen slightly for impact punch
    // Dynamic altitude response upon taking a hit ("bisa keatas-atas gitu")
    const dodgeHeights = [this.groundY - 250, this.groundY - 180, this.groundY - 95];
    const availableHeights = dodgeHeights.filter((h) => Math.abs(h - b.targetY) > 50);
    b.targetY = availableHeights[Math.floor(Math.random() * availableHeights.length)] || (this.groundY - 230);

    // Sparkles and impact burst particles
    for (let i = 0; i < 18; i++) {
      this.particles.push({
        x: b.x + b.width / 2,
        y: b.y + b.height / 2,
        vx: Math.random() * 260 - 130,
        vy: Math.random() * 260 - 130,
        size: 3 + Math.random() * 4,
        color: i % 2 === 0 ? '#ef4444' : '#facc15',
        life: 0,
        maxLife: 0.5,
        alpha: 1,
        type: 'sparkle',
      });
    }

    // Immediately synchronize HUD so React updates the health bar and hearts
    this.syncHud();

    // Check for boss defeat / victory
    if (b.hp <= 0) {
      b.state = 'defeated';
      this.addFloatingText(
        'SKRIPSI ACC! LULUS!',
        this.width / 2,
        this.height * 0.4,
        '#10b981',
        2.2,
        2.5
      );
      this.triggerVictory();
    }
  }

  private handlePlayerHitByBoss(p: Projectile) {
    this.player.isHit = true;
    this.player.hitTimer = 1.6;
    this.player.lives--;
    sounds.playHit();

    const msg = p.text ? 'Pertanyaan Telak!' : 'Revisi Menumpuk!';
    this.addFloatingText(msg, this.player.x, this.player.y - 20, '#ef4444', 1.3);

    if (this.player.lives <= 0) {
      this.gameOver();
    }
  }

  // ==================== VICTORY & GAME OVER ====================

  private triggerVictory() {
    this.state = 'VICTORY';
    this.player.state = 'graduated';
    this.speed = 0;
    this.projectiles = [];
    sounds.stopBGM();
    sounds.playVictory();

    // Spawn massive graduation confetti!
    const colors = ['#facc15', '#38bdf8', '#f43f5e', '#10b981', '#a855f7', '#fb923c'];
    for (let c = 0; c < 120; c++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: -10 - Math.random() * 200,
        vx: Math.random() * 60 - 30,
        vy: 80 + Math.random() * 120,
        size: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 5,
        alpha: 1,
        type: 'confetti',
        rotation: Math.random() * Math.PI,
        vRot: Math.random() * 6 - 3,
      });
    }

    if (this.onStateChange) this.onStateChange(this.state);
  }

  private gameOver() {
    this.state = 'GAME_OVER';
    this.speed = 0;
    sounds.stopBGM();
    sounds.playGameOver();

    if (this.onStateChange) this.onStateChange(this.state);
  }

  // ==================== PARTICLES & TEXTS ====================

  private updateParticles(dt: number) {
    this.updateParticlesOnly(dt);
  }

  private updateParticlesOnly(dt: number) {
    if (this.particles.length > 40) {
      this.particles.splice(0, this.particles.length - 40);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.rotation !== undefined && p.vRot) {
        p.rotation += p.vRot * dt;
      }
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife || p.y > this.height + 20) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      if (!ft) continue;
      ft.timer += dt;
      ft.y += ft.vy * dt;
      ft.opacity = Math.max(0, 1 - ft.timer / ft.duration);

      if (ft.timer >= ft.duration) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private addFloatingText(
    text: string,
    x: number,
    y: number,
    color: string,
    scale: number = 1,
    duration: number = 1.2
  ) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      vy: -45,
      opacity: 1,
      color,
      scale,
      duration,
      timer: 0,
    });
  }

  private updateClouds(dt: number) {
    (this.clouds || []).forEach((cloud) => {
      if (!cloud) return;
      cloud.x -= cloud.speed * dt;
      if (cloud.x < -300) {
        cloud.x = this.width + 100 + Math.random() * 200;
      }
    });
  }

  // ==================== COLLISION HELPERS ====================

  private checkCollision(
    a: { x: number; y: number; width: number; height: number } | null | undefined,
    b: { x: number; y: number; width: number; height: number } | null | undefined
  ): boolean {
    if (!a || !b) return false;
    // Generous inset hitboxes for player fairness
    const insetA = 6;
    const insetB = 6;

    return (
      a.x + insetA < b.x + b.width - insetB &&
      a.x + a.width - insetA > b.x + insetB &&
      a.y + insetA < b.y + b.height - insetB &&
      a.y + a.height - insetA > b.y + insetB
    );
  }

  private checkItemCollision(
    player: Player | null | undefined,
    item: CollectibleItem | null | undefined
  ): boolean {
    if (!player || !item) return false;
    const pad = 10;
    return (
      player.x < item.x + item.width + pad &&
      player.x + player.width > item.x - pad &&
      player.y < item.y + item.height + pad &&
      player.y + player.height > item.y - pad
    );
  }

  private syncHud() {
    if (this.onHudUpdate) {
      this.onHudUpdate({
        lives: this.player.lives,
        score: this.player.score,
        level: this.level,
        zone: this.currentZone,
        timeOfDay: this.timeOfDay,
        bossHp: this.boss ? this.boss.hp : undefined,
        bossMaxHp: this.boss ? this.boss.maxHp : undefined,
      });
    }
  }

  // ==================== RENDER ====================

  public render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Background, Parallax, Day-Night, and Ground Track
    drawBackground(
      ctx,
      this.width,
      this.height,
      this.groundY,
      this.cameraX,
      this.currentZone,
      this.transitionRatio,
      this.clouds || [],
      [], // animated background cars
      this.particles || [],
      this.timeOfDay,
      this.timeBlend,
      this.timeInfo
    );

    // 2. Obstacles
    (this.obstacles || []).forEach((obs) => {
      if (obs) drawObstacle(ctx, obs, this.groundY);
    });

    // 3. Collectibles
    (this.items || []).forEach((item) => {
      if (item) drawItem(ctx, item);
    });

    // 4. Player Character
    if (this.player) {
      drawCharacter(ctx, this.player, this.groundY);
    }

    // 5. Boss
    if (this.state === 'BOSS' && this.boss) {
      drawBoss(ctx, this.boss, this.groundY);
    }

    // 6. Projectiles
    (this.projectiles || []).forEach((proj) => {
      if (proj) drawProjectile(ctx, proj);
    });

    // 7. Floating Text Popups
    this.renderFloatingTexts();
  }

  private renderFloatingTexts() {
    const ctx = this.ctx;
    ctx.save();
    (this.floatingTexts || []).forEach((ft) => {
      if (!ft) return;
      ctx.save();
      ctx.globalAlpha = ft.opacity;
      ctx.font = `bold ${Math.round(14 * ft.scale)}px "Fredoka", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Dark shadow stroke for high contrast readability
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      ctx.strokeText(ft.text, ft.x, ft.y);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
    ctx.restore();
  }
}
