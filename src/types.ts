export type GameState = 'MENU' | 'PLAYING' | 'TRANSITION' | 'BOSS' | 'GAME_OVER' | 'VICTORY';

export type TimeOfDay = 'PAGI' | 'SIANG' | 'SORE' | 'MALAM';

export type ZoneType = 'KAMPUS' | 'KOTA' | 'SIDANG';

export type ObstacleKind = 'GAME_ONLINE' | 'KASUR' | 'TIKTOK' | 'NONGKRONG';

export type ItemKind = 'TUGAS' | 'SLIDE' | 'REVISI_ACC' | 'BINTANG_IPK';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  isGrounded: boolean;
  jumpCount: number;
  runCycle: number;
  hairOffset: number;
  isHit: boolean;
  hitTimer: number;
  lives: number;
  score: number;
  level: number;
  state: 'running' | 'jumping' | 'falling' | 'throwing' | 'hit' | 'graduated';
  throwAnimationTimer: number;
}

export interface LevelNotification {
  show: boolean;
  level: number;
  title: string;
  subtitle: string;
  isFinal: boolean;
}

export interface Obstacle {
  id: string;
  kind: ObstacleKind;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  message: string;
  passed: boolean;
  wobble: number;
}

export interface CollectibleItem {
  id: string;
  kind: ItemKind;
  x: number;
  y: number;
  width: number;
  height: number;
  scoreValue: number;
  name: string;
  collected: boolean;
  floatOffset: number;
  rotation: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  opacity: number;
  color: string;
  scale: number;
  duration: number;
  timer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
  type: 'leaf' | 'sparkle' | 'star' | 'dust' | 'confetti';
  rotation?: number;
  vRot?: number;
}

export interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  puffs: { offsetX: number; offsetY: number; radius: number }[];
}

export interface BackgroundCar {
  x: number;
  y: number;
  speed: number;
  color: string;
  width: number;
  height: number;
  isLeft: boolean;
}

export interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  state: 'idle' | 'charging' | 'throwing' | 'hit' | 'defeated' | 'dodging';
  attackCooldown: number;
  animTimer: number;
  hitTimer: number;
  targetY: number;
  dodgeCooldown?: number;
  dodgeTimer?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  prevX?: number;
  prevY?: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: 'SKRIPSI_PLAYER' | 'REVISI_BOSS' | 'QUESTION_BOSS';
  text?: string;
  rotation: number;
  vRot: number;
}

export interface LevelConfig {
  levelNumber: number;
  semesterRange: string;
  title: string;
  zone: ZoneType;
  baseSpeed: number;
  obstacleFrequency: number;
  itemFrequency: number;
  minDistance: number;
  description: string;
}
