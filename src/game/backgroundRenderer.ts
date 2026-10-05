import { Cloud, BackgroundCar, Particle, TimeOfDay, ZoneType } from '../types';

/**
 * Parallax Background, Day-Night Cycle, and Biome Renderer.
 * Handles seamless environmental transitions from Kampus Asri to Kota Rame and Sidang Skripsi.
 *
 * Features:
 * - Natural Day-Night cycle with generous dwelling periods ("jeda") and smooth gradual easing ("pelan-pelan").
 * - Diverse realistic tree species: Beringin Rimbun, Cemara Pinus, Tabebuya Pink Blossom, Palem Raja, and Columnar Poplar/Birch.
 */

export interface TimeInfo {
  timeOfDay: TimeOfDay;
  nextTimeOfDay: TimeOfDay;
  blend: number;          // 0 during jeda / dwell, 0 -> 1 during transition
  isTransitioning: boolean;
  nightFactor: number;    // 0 to 1 smooth darkness scalar
  sunsetFactor: number;   // 0 to 1 smooth sunset warm glow scalar
  sunAlpha: number;
  sunXRatio: number;
  sunY: number;
  sunColor: string;
  sunCoronaColor: string;
  moonAlpha: number;
  moonXRatio: number;
  moonY: number;
  starsAlpha: number;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
}

// ==================== COLOR & INTERPOLATION HELPERS ====================

const colorCache = new Map<string, [number, number, number]>();

function parseColor(c: string): [number, number, number] {
  const cached = colorCache.get(c);
  if (cached) return cached;

  let res: [number, number, number] = [100, 100, 100];
  if (c.startsWith('#')) {
    const hex = c.replace('#', '');
    if (hex.length === 3) {
      res = [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    } else {
      res = [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
  } else if (c.startsWith('rgb')) {
    const matches = c.match(/\d+/g);
    if (matches && matches.length >= 3) {
      res = [parseInt(matches[0], 10), parseInt(matches[1], 10), parseInt(matches[2], 10)];
    }
  }
  colorCache.set(c, res);
  return res;
}

export function lerpColor(c1: string, c2: string, t: number): string {
  const clampedT = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = parseColor(c1);
  const [r2, g2, b2] = parseColor(c2);
  const r = Math.round(r1 + (r2 - r1) * clampedT);
  const g = Math.round(g1 + (g2 - g1) * clampedT);
  const b = Math.round(b1 + (b2 - b1) * clampedT);
  return `rgb(${r}, ${g}, ${b})`;
}

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

// 4 distinct sky palettes for each period
const SKY_PALETTES = [
  // 0: PAGI - Fresh morning blue with warm golden peach dawn horizon
  {
    top: '#2563eb',
    mid: '#60a5fa',
    bottom: '#fed7aa',
  },
  // 1: SIANG - Clear brilliant azure with bright airy horizon
  {
    top: '#0284c7',
    mid: '#38bdf8',
    bottom: '#bae6fd',
  },
  // 2: SORE - Vibrant dusk twilight: deep indigo -> rich magenta-purple -> golden sunset orange
  {
    top: '#1e1b4b',
    mid: '#9333ea',
    bottom: '#fb923c',
  },
  // 3: MALAM - Deep cosmic midnight navy with horizon glow
  {
    top: '#020617',
    mid: '#0f172a',
    bottom: '#1e1b4b',
  },
];

const PHASES: TimeOfDay[] = ['PAGI', 'SIANG', 'SORE', 'MALAM'];

/**
 * Calculates current time of day with a comfortable dwell time ("jeda")
 * and a smooth, gradual transition ("pelan-pelan") into the next period.
 */
export function getTimeOfDay(progress: number): { timeOfDay: TimeOfDay; blend: number; timeInfo: TimeInfo } {
  // Total cycle covers 16,000 distance units (~48-52 seconds of running)
  // Each of the 4 periods gets 4,000 distance units.
  const CYCLE_DISTANCE = 16000;
  const PHASE_DISTANCE = 4000;

  const cyclePos = ((progress % CYCLE_DISTANCE) + CYCLE_DISTANCE) % CYCLE_DISTANCE;
  const currIdx = Math.floor(cyclePos / PHASE_DISTANCE); // 0: PAGI, 1: SIANG, 2: SORE, 3: MALAM
  const nextIdx = (currIdx + 1) % 4;
  const phaseProgress = (cyclePos % PHASE_DISTANCE) / PHASE_DISTANCE; // 0.0 to 1.0

  // 70% dwell ("jeda") where current time of day stays stable and relaxing
  // 30% gradual ease ("pelan-pelan") into the next time of day
  const DWELL_LIMIT = 0.70;
  let t = 0;
  let isTransitioning = false;

  if (phaseProgress > DWELL_LIMIT) {
    const rawT = (phaseProgress - DWELL_LIMIT) / (1.0 - DWELL_LIMIT);
    t = smoothstep(rawT);
    isTransitioning = true;
  }

  // Label changes smoothly when halfway through transition
  const displayTimeOfDay = t < 0.5 ? PHASES[currIdx] : PHASES[nextIdx];

  // Continuous smooth factors for night darkness and sunset glow
  let nightFactor = 0;
  let sunsetFactor = 0;

  if (currIdx === 1) {
    // SIANG -> SORE transition
    sunsetFactor = t;
  } else if (currIdx === 2) {
    // SORE
    sunsetFactor = 1 - t;
    nightFactor = t;
  } else if (currIdx === 3) {
    // MALAM
    nightFactor = 1 - t;
  }

  // Interpolate Sky colors smoothly
  const skyTop = lerpColor(SKY_PALETTES[currIdx].top, SKY_PALETTES[nextIdx].top, t);
  const skyMid = lerpColor(SKY_PALETTES[currIdx].mid, SKY_PALETTES[nextIdx].mid, t);
  const skyBottom = lerpColor(SKY_PALETTES[currIdx].bottom, SKY_PALETTES[nextIdx].bottom, t);

  // Celestial bodies configuration based on phase & transition
  let sunAlpha = 1.0;
  let sunXRatio = 0.5;
  let sunY = 70;
  let sunColor = '#fef08a';
  let sunCoronaColor = 'rgba(254, 240, 138, 0.45)';

  let moonAlpha = 0;
  let moonXRatio = 0.82;
  let moonY = 80;
  let starsAlpha = 0;

  if (currIdx === 0) {
    // PAGI
    // Sun rises from east/left towards zenith
    sunXRatio = 0.22 + (0.5 - 0.22) * t;
    sunY = 115 + (65 - 115) * t;
    sunColor = lerpColor('#fef08a', '#fef9c3', t);
    sunCoronaColor = 'rgba(254, 240, 138, 0.5)';
    sunAlpha = 1.0;
    moonAlpha = 0;
    starsAlpha = 0;
  } else if (currIdx === 1) {
    // SIANG
    // Sun travels from zenith down towards west/sunset horizon
    sunXRatio = 0.5 + (0.78 - 0.5) * t;
    sunY = 65 + (130 - 65) * t;
    sunColor = lerpColor('#fef9c3', '#f97316', t);
    sunCoronaColor = lerpColor('rgba(253, 224, 71, 0.5)', 'rgba(249, 115, 22, 0.65)', t);
    sunAlpha = 1.0;
    moonAlpha = 0;
    starsAlpha = t * 0.15; // faint evening star
  } else if (currIdx === 2) {
    // SORE
    // Setting sun slowly sinks below horizon, moon & stars emerge
    sunXRatio = 0.78 + 0.05 * t;
    sunY = 130 + (220 - 130) * t;
    sunAlpha = Math.max(0, 1.0 - t);
    sunColor = '#f97316';
    sunCoronaColor = 'rgba(249, 115, 22, 0.65)';

    moonAlpha = 0.1 + (1.0 - 0.1) * t;
    starsAlpha = 0.15 + (0.95 - 0.15) * t;
  } else {
    // MALAM
    // Starry night with golden crescent moon
    sunAlpha = t; // Dawn sun peeks up near end of night
    sunXRatio = 0.22;
    sunY = 160 + (115 - 160) * t;
    sunColor = '#fef08a';
    sunCoronaColor = 'rgba(254, 240, 138, 0.45)';

    moonAlpha = Math.max(0, 1.0 - t);
    starsAlpha = Math.max(0, 0.95 * (1.0 - t));
  }

  const timeInfo: TimeInfo = {
    timeOfDay: displayTimeOfDay,
    nextTimeOfDay: PHASES[nextIdx],
    blend: t,
    isTransitioning,
    nightFactor,
    sunsetFactor,
    sunAlpha,
    sunXRatio,
    sunY,
    sunColor,
    sunCoronaColor,
    moonAlpha,
    moonXRatio,
    moonY,
    starsAlpha,
    skyTop,
    skyMid,
    skyBottom,
  };

  return {
    timeOfDay: displayTimeOfDay,
    blend: t,
    timeInfo,
  };
}

// ==================== MAIN BACKGROUND RENDERER ====================

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  cameraX: number,
  zone: ZoneType,
  transitionRatio: number, // 0 = 100% Kampus, 1 = 100% Kota
  clouds: Cloud[],
  cars: BackgroundCar[],
  particles: Particle[],
  timeOfDay: TimeOfDay,
  timeBlend: number,
  timeInfo?: TimeInfo
) {
  // Ensure we have high-precision smooth time information
  const info = timeInfo || getTimeOfDay(cameraX).timeInfo;

  // 1. Dynamic Smooth Sky Gradient
  drawSky(ctx, width, height, info);

  // 2. Celestial bodies (Rising/Midday/Setting Sun, Glowing Crescent Moon, Twinkling Stars)
  drawCelestialBodies(ctx, width, info, cameraX);

  // 3. Soft Multi-Puff Clouds with daytime, sunset and night tinting
  drawClouds(ctx, clouds, cameraX * 0.05, info);

  // 4. Far Background Silhouettes (Lush mountains vs distant high-rise city)
  drawFarSilhouettes(ctx, width, groundY, cameraX, zone, transitionRatio, info);

  // 5. Midground (Campus university halls & DIVERSE TREES vs city commercial blocks)
  drawMidground(ctx, width, groundY, cameraX, zone, transitionRatio, cars, info);

  // 6. Transition Signpost ("MEMASUKI AREA KOTA")
  drawTransitionBanners(ctx, width, groundY, cameraX, zone, transitionRatio);

  // 7. Ground / Running Track (Cobblestone & grass vs asphalt & sidewalk)
  drawGroundTrack(ctx, width, height, groundY, cameraX, zone, transitionRatio, info);

  // 8. Environmental Particles (Floating leaves, cherry petals, sparkles)
  drawParticles(ctx, particles);
}

/** 1. Dynamic Sky Gradient with Seamless Transitions */
function drawSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  info: TimeInfo
) {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, info.skyTop);
  grad.addColorStop(0.55, info.skyMid);
  grad.addColorStop(1, info.skyBottom);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/** 2. Sun, Moon & Twinkling Stars */
function drawCelestialBodies(
  ctx: CanvasRenderingContext2D,
  width: number,
  info: TimeInfo,
  cameraX: number
) {
  ctx.save();

  // A. Twinkling Night Stars
  if (info.starsAlpha > 0.02) {
    ctx.fillStyle = `rgba(255, 255, 255, ${info.starsAlpha})`;
    for (let i = 0; i < 45; i++) {
      const sx = ((i * 137.5 + (cameraX * 0.02)) % width + width) % width;
      const sy = (i * 47) % 220 + 20;
      const twinkle = Math.sin(Date.now() / 400 + i) > 0.3 ? 1.8 : 0.9;
      ctx.fillRect(sx, sy, twinkle, twinkle);
    }
  }

  // B. Glowing Crescent Moon
  if (info.moonAlpha > 0.02) {
    ctx.save();
    ctx.globalAlpha = info.moonAlpha;

    const moonX = width * info.moonXRatio;
    const moonY = info.moonY;

    // Soft celestial halo
    const mg = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 52);
    mg.addColorStop(0, 'rgba(254, 240, 138, 0.38)');
    mg.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 52, 0, Math.PI * 2);
    ctx.fill();

    // Golden Moon disk
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
    ctx.fill();

    // Dark carve out for crescent shape blending with sky mid tone
    ctx.fillStyle = info.skyMid;
    ctx.beginPath();
    ctx.arc(moonX - 9, moonY - 5, 19, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // C. Sun with Corona Flare
  if (info.sunAlpha > 0.02) {
    ctx.save();
    ctx.globalAlpha = info.sunAlpha;

    const sunX = width * info.sunXRatio;
    const sunY = info.sunY;

    // Glowing sun rays / corona
    const sg = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 80);
    sg.addColorStop(0, info.sunCoronaColor);
    sg.addColorStop(0.5, 'rgba(254, 240, 138, 0.22)');
    sg.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
    ctx.fill();

    // Sun disk
    ctx.fillStyle = info.sunColor;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/** 3. Soft Realistic Multi-Puff Clouds */
function drawClouds(
  ctx: CanvasRenderingContext2D,
  clouds: Cloud[],
  scrollOffset: number,
  info: TimeInfo
) {
  ctx.save();

  // Cloud tones smoothly interpolate between daytime, sunset, and night
  const dayCloud = 'rgba(255, 255, 255, 0.9)';
  const sunsetCloud = 'rgba(254, 205, 211, 0.88)';
  const nightCloud = 'rgba(148, 163, 184, 0.35)';

  const dayShade = 'rgba(226, 232, 240, 0.75)';
  const sunsetShade = 'rgba(244, 114, 182, 0.72)';
  const nightShade = 'rgba(71, 85, 105, 0.3)';

  let cloudColor = lerpColor(dayCloud, sunsetCloud, info.sunsetFactor);
  cloudColor = lerpColor(cloudColor, nightCloud, info.nightFactor);

  let shadeColor = lerpColor(dayShade, sunsetShade, info.sunsetFactor);
  shadeColor = lerpColor(shadeColor, nightShade, info.nightFactor);

  (clouds || []).forEach((cloud) => {
    if (!cloud) return;
    const cx = ((cloud.x - scrollOffset) % 1800 + 1800) % 1800 - 200;
    const cy = cloud.y;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(cloud.scale, cloud.scale);

    // Draw cloud shadow base
    ctx.fillStyle = shadeColor;
    cloud.puffs.forEach((puff) => {
      ctx.beginPath();
      ctx.arc(puff.offsetX, puff.offsetY + 4, puff.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw white fluffy tops
    ctx.fillStyle = cloudColor;
    cloud.puffs.forEach((puff) => {
      ctx.beginPath();
      ctx.arc(puff.offsetX, puff.offsetY, puff.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  });

  ctx.restore();
}

/** 4. Far Parallax Silhouettes (Mountains or Skyline) */
function drawFarSilhouettes(
  ctx: CanvasRenderingContext2D,
  width: number,
  groundY: number,
  cameraX: number,
  zone: ZoneType,
  transitionRatio: number,
  info: TimeInfo
) {
  ctx.save();
  const scrollFar = cameraX * 0.12;

  // Mountain & city colors adapt smoothly to sunset and night
  const dayMountain = '#1e3a8a';
  const sunsetMountain = '#431407';
  const nightMountain = '#09152a';

  let mountainColor = lerpColor(dayMountain, sunsetMountain, info.sunsetFactor);
  mountainColor = lerpColor(mountainColor, nightMountain, info.nightFactor);

  const dayCity = '#334155';
  const sunsetCity = '#1e1b4b';
  const nightCity = '#090e1a';

  let cityFarColor = lerpColor(dayCity, sunsetCity, info.sunsetFactor);
  cityFarColor = lerpColor(cityFarColor, nightCity, info.nightFactor);

  // Kampus mountain ridge (fades out as transitionRatio reaches 1)
  if (transitionRatio < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - transitionRatio;
    ctx.fillStyle = mountainColor;

    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = -100; x <= width + 100; x += 60) {
      const worldX = x + scrollFar;
      const my = groundY - 140 - Math.sin(worldX * 0.003) * 60 - Math.cos(worldX * 0.007) * 35;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(width + 100, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Kota high-rise silhouette (fades in as transitionRatio increases)
  if (transitionRatio > 0) {
    ctx.save();
    ctx.globalAlpha = transitionRatio;
    ctx.fillStyle = cityFarColor;

    const buildingWidth = 70;
    const startX = -((scrollFar) % buildingWidth);

    for (let bx = startX - 100; bx < width + 100; bx += buildingWidth) {
      const seed = Math.abs(Math.sin((bx + scrollFar) * 0.05));
      const bHeight = 110 + seed * 90;
      ctx.fillRect(bx, groundY - bHeight, buildingWidth - 6, bHeight);

      // Distant window lights that gradually illuminate in late sore & night
      if (info.nightFactor > 0.05 || info.sunsetFactor > 0.6) {
        const winAlpha = Math.max(info.nightFactor, info.sunsetFactor * 0.6) * 0.45;
        ctx.fillStyle = `rgba(254, 240, 138, ${winAlpha})`;
        for (let wy = groundY - bHeight + 15; wy < groundY - 20; wy += 20) {
          ctx.fillRect(bx + 12, wy, 8, 10);
          ctx.fillRect(bx + 32, wy, 8, 10);
        }
        ctx.fillStyle = cityFarColor;
      }
    }

    ctx.restore();
  }

  ctx.restore();
}

/**
 * 5. Midground Layer:
 * - Campus Hall & Clock Tower in distance
 * - DIVERSE REALISTIC TREES along the campus walkway:
 *   Species 0: Pohon Rindang Rimbun (Beringin Tropis)
 *   Species 1: Pohon Cemara / Pinus (Conical Evergreen)
 *   Species 2: Pohon Tabebuya Merah Muda (Flowering Campus Blossom)
 *   Species 3: Pohon Palem Raja (Royal Garden Palm Tree)
 *   Species 4: Pohon Ramping Kolom (Columnar Birch / Asoka)
 */
function drawMidground(
  ctx: CanvasRenderingContext2D,
  width: number,
  groundY: number,
  cameraX: number,
  zone: ZoneType,
  transitionRatio: number,
  cars: BackgroundCar[],
  info: TimeInfo
) {
  ctx.save();
  const scrollMid = cameraX * 0.35;

  // --- KAMPUS MIDGROUND (Diverse trees & Classic Campus Clock Tower) ---
  if (transitionRatio < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - transitionRatio;

    const treeSpacing = 160;
    const startTreeX = -((scrollMid) % treeSpacing);

    for (let tx = startTreeX - 80; tx < width + 120; tx += treeSpacing) {
      const treeIdx = Math.abs(Math.floor((tx + scrollMid) / treeSpacing));

      // Campus building in background behind every 5th tree
      if (treeIdx % 5 === 0) {
        // Red brick / modern campus hall
        const hallColor = lerpColor(
          lerpColor('#334155', '#451a03', info.sunsetFactor),
          '#1e293b',
          info.nightFactor
        );
        ctx.fillStyle = hallColor;
        ctx.beginPath();
        ctx.roundRect(tx + 35, groundY - 148, 95, 148, 4);
        ctx.fill();

        // Campus clock tower cupola
        const cupolaColor = lerpColor(
          lerpColor('#0369a1', '#701a75', info.sunsetFactor),
          '#0f172a',
          info.nightFactor
        );
        ctx.fillStyle = cupolaColor;
        ctx.beginPath();
        ctx.moveTo(tx + 35, groundY - 148);
        ctx.lineTo(tx + 82, groundY - 188);
        ctx.lineTo(tx + 130, groundY - 148);
        ctx.closePath();
        ctx.fill();

        // Clock face
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(tx + 82, groundY - 162, 8, 0, Math.PI * 2);
        ctx.fill();

        // Windows with smooth nighttime & dusk illumination
        const winLit = info.nightFactor > 0.05 || info.sunsetFactor > 0.5;
        const winColor = winLit
          ? lerpColor('#cbd5e1', '#fef08a', Math.max(info.nightFactor, info.sunsetFactor * 0.8))
          : '#e2e8f0';
        ctx.fillStyle = winColor;
        for (let wy = groundY - 128; wy < groundY - 20; wy += 26) {
          ctx.fillRect(tx + 48, wy, 16, 16);
          ctx.fillRect(tx + 100, wy, 16, 16);
        }
      }

      // Draw distinct realistic tree species (rock-solid rooted at groundY, zero jitter)
      drawDiverseTree(ctx, tx, groundY, treeIdx, info.nightFactor, info.sunsetFactor);
    }

    ctx.restore();
  }

  // --- KOTA MIDGROUND (Avenue buildings, neon advertisements, animated road cars) ---
  if (transitionRatio > 0) {
    ctx.save();
    ctx.globalAlpha = transitionRatio;

    const blockWidth = 140;
    const startBlockX = -((scrollMid) % blockWidth);

    const billboards = [
      { text: 'KOPI SENJA', color: '#f59e0b' },
      { text: 'FOTOCOPY 24 JAM', color: '#06b6d4' },
      { text: 'FREE WIFI', color: '#ec4899' },
      { text: 'SEMINAR SKRIPSI', color: '#10b981' },
      { text: 'KOST MAHASISWA', color: '#8b5cf6' },
    ];

    for (let bx = startBlockX - 100; bx < width + 100; bx += blockWidth) {
      const idx = Math.abs(Math.floor((bx + scrollMid) / blockWidth));
      const bHeight = 160 + (idx % 3) * 45;

      // Modern city commercial building
      const dayBuilding = ['#475569', '#64748b', '#334155'][idx % 3];
      const nightBuilding = ['#0f172a', '#1e293b', '#18181b'][idx % 3];
      ctx.fillStyle = lerpColor(dayBuilding, nightBuilding, info.nightFactor);
      ctx.fillRect(bx, groundY - bHeight, blockWidth - 10, bHeight);

      // Roof antenna / AC condenser
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(bx + 20, groundY - bHeight - 14, 4, 14);
      ctx.fillRect(bx + blockWidth - 35, groundY - bHeight - 10, 16, 10);

      // Windows
      for (let wy = groundY - bHeight + 35; wy < groundY - 25; wy += 28) {
        for (let wx = bx + 12; wx < bx + blockWidth - 25; wx += 24) {
          const isLit = (idx + wx + wy) % 3 !== 0;
          if (info.nightFactor > 0.1 && isLit) {
            ctx.fillStyle = lerpColor('#cbd5e1', '#fef08a', info.nightFactor);
          } else {
            ctx.fillStyle = lerpColor('#cbd5e1', '#1e293b', info.nightFactor);
          }
          ctx.fillRect(wx, wy, 14, 16);
        }
      }

      // Billboard sign on some buildings
      if (idx % 2 === 0) {
        const bb = billboards[(idx / 2) % billboards.length];
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(bx + 10, groundY - bHeight + 8, blockWidth - 30, 20, 4);
        ctx.fill();
        ctx.strokeStyle = bb.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = bb.color;
        ctx.font = 'bold 8px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bb.text, bx + (blockWidth - 10) / 2, groundY - bHeight + 18);
      }

      // Street light pole
      ctx.fillStyle = '#334155';
      ctx.fillRect(bx + blockWidth - 14, groundY - 70, 4, 70);
      ctx.fillRect(bx + blockWidth - 18, groundY - 70, 12, 3);

      if (info.nightFactor > 0.05 || info.sunsetFactor > 0.6) {
        const lampAlpha = Math.max(info.nightFactor, info.sunsetFactor * 0.7);
        // Glowing street lamp
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(bx + blockWidth - 12, groundY - 67, 5, 0, Math.PI * 2);
        ctx.fill();

        // Downward light cone
        const lg = ctx.createLinearGradient(0, groundY - 67, 0, groundY);
        lg.addColorStop(0, `rgba(253, 224, 71, ${0.32 * lampAlpha})`);
        lg.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(bx + blockWidth - 12, groundY - 67);
        ctx.lineTo(bx + blockWidth + 24, groundY);
        ctx.lineTo(bx + blockWidth - 48, groundY);
        ctx.closePath();
        ctx.fill();
      }

      // Classic city sidewalk fire hydrant (pure urban, no plants)
      if (idx % 2 === 1) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(bx + 20, groundY - 18, 10, 18, 2);
        ctx.fill();

        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(bx + 18, groundY - 14, 14, 4);

        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(bx + 25, groundY - 18, 4, Math.PI, 0);
        ctx.fill();
      }
    }

    // Animated cars driving in background roadway
    (cars || []).forEach((car) => {
      if (!car) return;
      drawBackgroundCar(ctx, car, groundY - 14, info.nightFactor > 0.3);
    });

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws realistic diverse campus trees.
 * 5 distinct species firmly rooted at ground level without any jitter:
 * 0: Pohon Rindang Rimbun (Beringin Tropis)
 * 1: Pohon Cemara / Pinus (Conical Evergreen)
 * 2: Pohon Tabebuya Merah Muda (Flowering Campus Blossom)
 * 3: Pohon Palem Raja (Royal Garden Palm Tree)
 * 4: Pohon Ramping Kolom (Columnar Birch / Asoka)
 */
function drawDiverseTree(
  ctx: CanvasRenderingContext2D,
  tx: number,
  groundY: number,
  treeIdx: number,
  nightFactor: number,
  sunsetFactor: number
) {
  const species = treeIdx % 5;
  ctx.save();

  switch (species) {
    case 0: {
      // ==========================================
      // 0. POHON RINDANG RIMBUN (Beringin Tropis)
      // Grand dome canopy with multi-layered leafy clouds and sturdy trunk
      // ==========================================
      const treeHeight = 135;
      const trunkWidth = 14;

      // Roots hugging ground
      ctx.fillStyle = lerpColor('#451a03', '#1e293b', nightFactor);
      ctx.beginPath();
      ctx.moveTo(tx - trunkWidth - 6, groundY);
      ctx.lineTo(tx - trunkWidth / 2, groundY - 20);
      ctx.lineTo(tx + trunkWidth / 2, groundY - 20);
      ctx.lineTo(tx + trunkWidth + 6, groundY);
      ctx.closePath();
      ctx.fill();

      // Main trunk
      ctx.fillRect(tx - trunkWidth / 2, groundY - treeHeight + 35, trunkWidth, treeHeight - 35);

      // Branch splits
      ctx.beginPath();
      ctx.moveTo(tx - trunkWidth / 2, groundY - treeHeight + 60);
      ctx.lineTo(tx - 26, groundY - treeHeight + 25);
      ctx.lineTo(tx - 18, groundY - treeHeight + 22);
      ctx.lineTo(tx - 2, groundY - treeHeight + 48);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(tx + trunkWidth / 2, groundY - treeHeight + 60);
      ctx.lineTo(tx + 26, groundY - treeHeight + 25);
      ctx.lineTo(tx + 18, groundY - treeHeight + 22);
      ctx.lineTo(tx + 2, groundY - treeHeight + 48);
      ctx.closePath();
      ctx.fill();

      // Foliage layers
      const deepColor = lerpColor(
        sunsetFactor > 0.3 ? '#14532d' : '#064e3b',
        '#022c22',
        nightFactor
      );
      const midColor = lerpColor(
        sunsetFactor > 0.3 ? '#15803d' : '#059669',
        '#064e3b',
        nightFactor
      );
      const brightColor = lerpColor(
        sunsetFactor > 0.3 ? '#84cc16' : '#10b981',
        '#065f46',
        nightFactor
      );

      // Deep background foliage
      ctx.fillStyle = deepColor;
      ctx.beginPath();
      ctx.arc(tx - 26, groundY - treeHeight + 15, 30, 0, Math.PI * 2);
      ctx.arc(tx + 26, groundY - treeHeight + 15, 30, 0, Math.PI * 2);
      ctx.arc(tx, groundY - treeHeight - 5, 36, 0, Math.PI * 2);
      ctx.fill();

      // Midground foliage puffs
      ctx.fillStyle = midColor;
      ctx.beginPath();
      ctx.arc(tx - 16, groundY - treeHeight + 5, 26, 0, Math.PI * 2);
      ctx.arc(tx + 18, groundY - treeHeight + 8, 27, 0, Math.PI * 2);
      ctx.arc(tx, groundY - treeHeight - 12, 30, 0, Math.PI * 2);
      ctx.fill();

      // Top sun highlight puffs
      ctx.fillStyle = brightColor;
      ctx.beginPath();
      ctx.arc(tx - 6, groundY - treeHeight - 16, 20, 0, Math.PI * 2);
      ctx.arc(tx + 14, groundY - treeHeight - 6, 18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 1: {
      // ==========================================
      // 1. POHON CEMARA / PINUS (Conical Pine)
      // Stepped tiered triangular evergreen foliage tapering to sharp tip
      // ==========================================
      const treeHeight = 148;
      const trunkWidth = 10;

      // Tall straight trunk
      ctx.fillStyle = lerpColor('#78350f', '#1e293b', nightFactor);
      ctx.fillRect(tx - trunkWidth / 2, groundY - 45, trunkWidth, 45);

      // 4 tiered scalloped pine triangles (from bottom to top)
      const tiers = [
        { y: groundY - 35, width: 68, height: 35 },
        { y: groundY - 62, width: 56, height: 34 },
        { y: groundY - 88, width: 44, height: 32 },
        { y: groundY - 114, width: 30, height: 34 },
      ];

      tiers.forEach((tier, i) => {
        const tierColor = lerpColor(
          i === 3 ? '#059669' : i === 2 ? '#047857' : '#065f46',
          '#022c22',
          nightFactor
        );
        ctx.fillStyle = tierColor;
        ctx.beginPath();
        ctx.moveTo(tx, tier.y - tier.height);
        ctx.lineTo(tx + tier.width / 2, tier.y);
        ctx.lineTo(tx - tier.width / 2, tier.y);
        ctx.closePath();
        ctx.fill();

        // Edge needle fringe highlights
        ctx.fillStyle = lerpColor('#10b981', '#064e3b', nightFactor);
        ctx.beginPath();
        ctx.arc(tx - tier.width / 4, tier.y, 4, 0, Math.PI);
        ctx.arc(tx + tier.width / 4, tier.y, 4, 0, Math.PI);
        ctx.fill();
      });
      break;
    }

    case 2: {
      // ==========================================
      // 2. POHON TABEBUYA MERAH MUDA (Blossoming Campus Sakura)
      // Soft blushing pink blossoms, graceful artistic branches
      // ==========================================
      const treeHeight = 126;

      // Artistic wooden trunk
      ctx.fillStyle = lerpColor('#57534e', '#1c1917', nightFactor);
      ctx.beginPath();
      ctx.moveTo(tx - 6, groundY);
      ctx.lineTo(tx - 3, groundY - treeHeight + 35);
      ctx.lineTo(tx + 4, groundY - treeHeight + 35);
      ctx.lineTo(tx + 6, groundY);
      ctx.closePath();
      ctx.fill();

      // Branch forks
      ctx.beginPath();
      ctx.moveTo(tx, groundY - treeHeight + 50);
      ctx.lineTo(tx - 22, groundY - treeHeight + 20);
      ctx.lineTo(tx - 16, groundY - treeHeight + 18);
      ctx.lineTo(tx + 2, groundY - treeHeight + 42);
      ctx.closePath();
      ctx.fill();

      // Billowing blossom clusters
      const deepBlossom = lerpColor('#be185d', '#4c0519', nightFactor);
      const midBlossom = lerpColor('#ec4899', '#831843', nightFactor);
      const brightBlossom = lerpColor('#f472b6', '#9d174d', nightFactor);
      const lightBlossom = lerpColor('#fbcfe8', '#be185d', nightFactor);

      // Base floral cluster
      ctx.fillStyle = deepBlossom;
      ctx.beginPath();
      ctx.arc(tx - 24, groundY - treeHeight + 16, 26, 0, Math.PI * 2);
      ctx.arc(tx + 24, groundY - treeHeight + 16, 26, 0, Math.PI * 2);
      ctx.arc(tx, groundY - treeHeight - 4, 32, 0, Math.PI * 2);
      ctx.fill();

      // Mid floral puffs
      ctx.fillStyle = midBlossom;
      ctx.beginPath();
      ctx.arc(tx - 14, groundY - treeHeight + 6, 23, 0, Math.PI * 2);
      ctx.arc(tx + 16, groundY - treeHeight + 8, 24, 0, Math.PI * 2);
      ctx.arc(tx, groundY - treeHeight - 12, 26, 0, Math.PI * 2);
      ctx.fill();

      // Highlights
      ctx.fillStyle = brightBlossom;
      ctx.beginPath();
      ctx.arc(tx - 6, groundY - treeHeight - 16, 17, 0, Math.PI * 2);
      ctx.arc(tx + 12, groundY - treeHeight - 8, 16, 0, Math.PI * 2);
      ctx.fill();

      // Scattered flower petal highlights
      ctx.fillStyle = lightBlossom;
      const petalOffsets = [
        [-20, 10], [18, 15], [-8, -20], [8, -12], [24, -2], [-16, -6]
      ];
      petalOffsets.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(tx + px, groundY - treeHeight + py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 3: {
      // ==========================================
      // 3. POHON PALEM RAJA (Royal Campus Palm Tree)
      // Slender ringed trunk with flared base & graceful arching tropical fronds
      // ==========================================
      const treeHeight = 152;

      // Flared trunk base
      ctx.fillStyle = lerpColor('#854d0e', '#1c1917', nightFactor);
      ctx.beginPath();
      ctx.moveTo(tx - 10, groundY);
      ctx.lineTo(tx - 5, groundY - 20);
      ctx.lineTo(tx + 5, groundY - 20);
      ctx.lineTo(tx + 10, groundY);
      ctx.closePath();
      ctx.fill();

      // Slender tall trunk with curved lean
      const crownX = tx + 4;
      const crownY = groundY - treeHeight + 25;

      ctx.beginPath();
      ctx.moveTo(tx - 5, groundY - 20);
      ctx.quadraticCurveTo(tx - 1, (groundY + crownY) / 2, crownX - 4, crownY);
      ctx.lineTo(crownX + 4, crownY);
      ctx.quadraticCurveTo(tx + 5, (groundY + crownY) / 2, tx + 5, groundY - 20);
      ctx.closePath();
      ctx.fill();

      // Trunk segment rings
      ctx.strokeStyle = lerpColor('#a16207', '#292524', nightFactor);
      ctx.lineWidth = 1.5;
      for (let ry = groundY - 25; ry > crownY + 8; ry -= 12) {
        const ringX = tx + ((groundY - ry) / (groundY - crownY)) * 4;
        ctx.beginPath();
        ctx.moveTo(ringX - 4, ry);
        ctx.lineTo(ringX + 4, ry);
        ctx.stroke();
      }

      // Coconut / date fruit bunch at the crown
      ctx.fillStyle = lerpColor('#713f12', '#1e293b', nightFactor);
      ctx.beginPath();
      ctx.arc(crownX - 4, crownY + 4, 4.5, 0, Math.PI * 2);
      ctx.arc(crownX + 4, crownY + 4, 4.5, 0, Math.PI * 2);
      ctx.arc(crownX, crownY + 7, 4, 0, Math.PI * 2);
      ctx.fill();

      // 7 Arching Palm Fronds cascading outward
      const fronds = [
        { cpx: -38, cpy: -22, endX: -54, endY: 8, w: 9 },   // Far left down
        { cpx: -34, cpy: -36, endX: -46, endY: -18, w: 10 }, // Left up
        { cpx: -16, cpy: -44, endX: -22, endY: -38, w: 9 },  // Top left
        { cpx: 4, cpy: -48, endX: 6, endY: -42, w: 8 },      // Center crest
        { cpx: 24, cpy: -44, endX: 30, endY: -36, w: 9 },   // Top right
        { cpx: 40, cpy: -34, endX: 52, endY: -14, w: 10 },  // Right up
        { cpx: 42, cpy: -18, endX: 58, endY: 12, w: 9 },    // Far right down
      ];

      const frondColor = lerpColor('#15803d', '#052e16', nightFactor);
      const frondHighlight = lerpColor('#22c55e', '#064e3b', nightFactor);

      fronds.forEach((f) => {
        ctx.strokeStyle = frondColor;
        ctx.lineWidth = f.w;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(crownX, crownY);
        ctx.quadraticCurveTo(crownX + f.cpx, crownY + f.cpy, crownX + f.endX, crownY + f.endY);
        ctx.stroke();

        // Frond blade ridge highlight
        ctx.strokeStyle = frondHighlight;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(crownX, crownY);
        ctx.quadraticCurveTo(crownX + f.cpx * 0.9, crownY + f.cpy * 0.9, crownX + f.endX, crownY + f.endY);
        ctx.stroke();
      });
      break;
    }

    case 4: {
      // ==========================================
      // 4. POHON RAMPING KOLOM (Columnar Birch / Asoka)
      // Slender upright pale trunk with elegant tall oval/egg canopy
      // ==========================================
      const treeHeight = 132;
      const trunkWidth = 9;

      // Pale birch bark trunk
      ctx.fillStyle = lerpColor('#d6d3d1', '#334155', nightFactor);
      ctx.fillRect(tx - trunkWidth / 2, groundY - 45, trunkWidth, 45);

      // Bark dark flecks
      ctx.fillStyle = lerpColor('#78716c', '#1e293b', nightFactor);
      ctx.fillRect(tx - trunkWidth / 2, groundY - 36, 4, 2);
      ctx.fillRect(tx + 1, groundY - 24, 3, 2);
      ctx.fillRect(tx - trunkWidth / 2 + 1, groundY - 14, 4, 2);

      // Tall oval / egg-shaped crown
      const deepOlive = lerpColor('#4d7c0f', '#064e3b', nightFactor);
      const midOlive = lerpColor('#65a30d', '#047857', nightFactor);
      const lightChartreuse = lerpColor('#84cc16', '#059669', nightFactor);

      // Base oval
      ctx.fillStyle = deepOlive;
      ctx.beginPath();
      ctx.ellipse(tx, groundY - treeHeight + 35, 22, 48, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mid oval
      ctx.fillStyle = midOlive;
      ctx.beginPath();
      ctx.ellipse(tx, groundY - treeHeight + 30, 18, 42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top cluster highlights
      ctx.fillStyle = lightChartreuse;
      ctx.beginPath();
      ctx.ellipse(tx - 3, groundY - treeHeight + 18, 12, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  // Small flower shrub or grassy patch at tree base
  if (treeIdx % 2 === 0) {
    const shrubColor = lerpColor('#16a34a', '#064e3b', nightFactor);
    ctx.fillStyle = shrubColor;
    ctx.beginPath();
    ctx.arc(tx - 12, groundY - 6, 9, 0, Math.PI);
    ctx.arc(tx + 10, groundY - 5, 8, 0, Math.PI);
    ctx.arc(tx - 2, groundY - 8, 10, 0, Math.PI);
    ctx.fill();

    // Small flower dots
    const flowerColor = treeIdx % 4 === 0 ? '#facc15' : '#ffffff';
    ctx.fillStyle = flowerColor;
    ctx.beginPath();
    ctx.arc(tx - 8, groundY - 10, 2, 0, Math.PI * 2);
    ctx.arc(tx + 6, groundY - 9, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Animated cars driving in distance */
function drawBackgroundCar(
  ctx: CanvasRenderingContext2D,
  car: BackgroundCar,
  roadY: number,
  isNight: boolean
) {
  if (!car) return;
  ctx.save();
  ctx.translate(car.x, roadY);

  // Car chassis
  ctx.fillStyle = car.color;
  ctx.beginPath();
  ctx.roundRect(0, -car.height, car.width, car.height, 4);
  ctx.fill();

  // Car cabin
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(car.width * 0.2, -car.height - 7, car.width * 0.55, 8, 3);
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(car.width * 0.25, 0, 4, 0, Math.PI * 2);
  ctx.arc(car.width * 0.75, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  // Headlights & Taillights
  if (isNight) {
    if (car.speed > 0) {
      // Facing right
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(car.width - 2, -car.height + 4, 3, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-1, -car.height + 4, 2, 4);
    } else {
      // Facing left
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-1, -car.height + 4, 3, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(car.width - 1, -car.height + 4, 2, 4);
    }
  }

  ctx.restore();
}

/** 6. Transition Signpost ("MEMASUKI AREA KOTA") */
function drawTransitionBanners(
  ctx: CanvasRenderingContext2D,
  width: number,
  groundY: number,
  cameraX: number,
  zone: ZoneType,
  transitionRatio: number
) {
  if (transitionRatio > 0.1 && transitionRatio < 0.9) {
    ctx.save();
    const signX = width * 0.6;
    const signY = groundY - 110;

    // Wooden / metal post
    ctx.fillStyle = '#475569';
    ctx.fillRect(signX - 3, signY + 36, 6, 74);

    // Green highway signboard
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.roundRect(signX - 85, signY, 170, 38, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MEMASUKI AREA KOTA', signX, signY + 14);

    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('Level 3 — Suasana Lebih Sibuk', signX, signY + 28);

    ctx.restore();
  }
}

/** 7. Ground / Running Track */
function drawGroundTrack(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  cameraX: number,
  zone: ZoneType,
  transitionRatio: number,
  info: TimeInfo
) {
  ctx.save();
  const trackHeight = height - groundY;

  // --- KAMPUS TRACK (Cobblestone path, green grassy curbs, pebbles) ---
  if (transitionRatio < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - transitionRatio;

    // Earth foundation adapting to night smoothly
    const earthColor = lerpColor('#15803d', '#14532d', info.nightFactor);
    ctx.fillStyle = earthColor;
    ctx.fillRect(0, groundY, width, trackHeight);

    // Cobblestone walkway surface
    const walkColor = lerpColor('#cbd5e1', '#334155', info.nightFactor);
    ctx.fillStyle = walkColor;
    ctx.fillRect(0, groundY, width, 24);

    // Top grassy edge tufts
    const tuftColor = lerpColor('#22c55e', '#166534', info.nightFactor);
    ctx.fillStyle = tuftColor;
    const tuftSpacing = 24;
    const startTuftX = -((cameraX) % tuftSpacing);
    for (let gx = startTuftX - 20; gx < width + 20; gx += tuftSpacing) {
      ctx.beginPath();
      ctx.arc(gx, groundY, 4, Math.PI, 0);
      ctx.fill();
    }

    // Cobblestone pavers pattern
    ctx.strokeStyle = lerpColor('#94a3b8', '#1e293b', info.nightFactor);
    ctx.lineWidth = 1.2;
    const paverWidth = 32;
    const startPaverX = -((cameraX) % paverWidth);
    for (let px = startPaverX - 20; px < width + 20; px += paverWidth) {
      ctx.beginPath();
      ctx.moveTo(px, groundY);
      ctx.lineTo(px, groundY + 24);
      ctx.stroke();
    }

    // Small pebbles & dirt specks
    ctx.fillStyle = lerpColor('#14532d', '#052e16', info.nightFactor);
    for (let i = 0; i < 20; i++) {
      const px = ((i * 89 + cameraX * 0.9) % width + width) % width;
      const py = groundY + 32 + (i * 17) % (trackHeight - 40);
      ctx.fillRect(px, py, 3, 2);
    }

    ctx.restore();
  }

  // --- KOTA TRACK (Asphalt road, yellow/white lane dashes, sidewalk curb, cracks) ---
  if (transitionRatio > 0) {
    ctx.save();
    ctx.globalAlpha = transitionRatio;

    // Dark asphalt road
    const roadColor = lerpColor('#18181b', '#09090b', info.nightFactor);
    ctx.fillStyle = roadColor;
    ctx.fillRect(0, groundY, width, trackHeight);

    // Sidewalk curb band
    const curbColor = lerpColor('#71717a', '#27272a', info.nightFactor);
    ctx.fillStyle = curbColor;
    ctx.fillRect(0, groundY, width, 14);

    // Curb lines
    ctx.strokeStyle = lerpColor('#a1a1aa', '#3f3f46', info.nightFactor);
    ctx.lineWidth = 1.5;
    const curbSpacing = 40;
    const startCurbX = -((cameraX) % curbSpacing);
    for (let cx = startCurbX - 20; cx < width + 20; cx += curbSpacing) {
      ctx.beginPath();
      ctx.moveTo(cx, groundY);
      ctx.lineTo(cx, groundY + 14);
      ctx.stroke();
    }

    // Yellow broken lane markings
    ctx.fillStyle = '#facc15';
    const dashLength = 45;
    const dashGap = 35;
    const cycle = dashLength + dashGap;
    const startDashX = -((cameraX) % cycle);

    for (let dx = startDashX - 40; dx < width + 40; dx += cycle) {
      ctx.fillRect(dx, groundY + 44, dashLength, 5);
    }

    // Small pavement cracks
    ctx.strokeStyle = lerpColor('#27272a', '#18181b', info.nightFactor);
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const crackX = ((i * 180 + cameraX) % width + width) % width;
      ctx.beginPath();
      ctx.moveTo(crackX, groundY + 22);
      ctx.lineTo(crackX + 12, groundY + 28);
      ctx.lineTo(crackX + 18, groundY + 24);
      ctx.stroke();
    }

    ctx.restore();
  }

  ctx.restore();
}

/** 8. Ambient Flying Leaves, Sparkles, and Dust */
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  ctx.save();

  (particles || []).forEach((p) => {
    if (!p) return;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    if (p.rotation) {
      ctx.rotate(p.rotation);
    }

    if (p.type === 'leaf') {
      // Falling autumn leaf or Tabebuya blossom petal
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'confetti') {
      // Victory graduation confetti
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
    } else if (p.type === 'star' || p.type === 'sparkle') {
      // Sparkle cross
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Running foot dust
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  ctx.restore();
}
