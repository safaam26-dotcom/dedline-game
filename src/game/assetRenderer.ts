import { CollectibleItem, Obstacle } from '../types';

/**
 * 2D Asset Renderer for Items & Obstacles.
 * Clean, cute, colorful vector art crafted specifically for Deadline Run.
 */

// ==================== COLLECTIBLE ITEMS ====================

export function drawItem(ctx: CanvasRenderingContext2D, item: CollectibleItem) {
  if (!item || item.collected) return;

  ctx.save();
  const cx = item.x + item.width / 2;
  const cy = item.y + item.height / 2 + Math.sin(item.floatOffset) * 6;

  ctx.translate(cx, cy);

  // Gentle bobbing and subtle rotation
  ctx.rotate(Math.sin(item.floatOffset * 0.7) * 0.1);

  // Soft glowing halo behind items
  const glowGradient = ctx.createRadialGradient(0, 0, 8, 0, 0, 32);
  glowGradient.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
  glowGradient.addColorStop(1, 'rgba(253, 224, 71, 0)');
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fill();

  switch (item.kind) {
    case 'TUGAS':
      drawTugasIcon(ctx);
      break;
    case 'SLIDE':
      drawSlideIcon(ctx);
      break;
    case 'REVISI_ACC':
      drawRevisiAccIcon(ctx);
      break;
    case 'BINTANG_IPK':
      drawBintangIpkIcon(ctx, item.floatOffset);
      break;
  }

  ctx.restore();
}

/** 📚 Tugas Selesai: Stack of neat colorful textbook binders with bookmark */
function drawTugasIcon(ctx: CanvasRenderingContext2D) {
  // Bottom book (Blue)
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.roundRect(-16, 2, 32, 10, 3);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-14, 4, 28, 4);

  // Middle book (Emerald green)
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.roundRect(-14, -6, 28, 9, 3);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-12, -4, 24, 4);

  // Top book (Orange-amber)
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.roundRect(-15, -14, 30, 9, 3);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-13, -12, 26, 4);

  // Ribbon bookmark dangling down
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(4, -14);
  ctx.lineTo(8, -14);
  ctx.lineTo(8, 14);
  ctx.lineTo(6, 11);
  ctx.lineTo(4, 14);
  ctx.closePath();
  ctx.fill();

  // Checkmark on book spine
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-11, -10);
  ctx.lineTo(-9, -8);
  ctx.lineTo(-6, -11);
  ctx.stroke();
}

/** 💻 Slide Presentasi: Sleek open laptop displaying colorful pie chart */
function drawSlideIcon(ctx: CanvasRenderingContext2D) {
  // Laptop display casing
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(-16, -14, 32, 22, 3);
  ctx.fill();

  // Glowing screen
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-14, -12, 28, 18);

  // Slide content: Bar chart / pie chart on screen
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-11, -2, 5, 6);
  ctx.fillStyle = '#34d399';
  ctx.fillRect(-4, -6, 5, 10);
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(3, -9, 5, 13);

  // Slide title header bar
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-11, -10, 16, 2);

  // Laptop keyboard base
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.roundRect(-20, 8, 40, 5, 2);
  ctx.fill();

  // Trackpad
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-4, 9, 8, 3);
}

/** 📝 Revisi ACC: Manuscript paper stamped with bright green "ACC" */
function drawRevisiAccIcon(ctx: CanvasRenderingContext2D) {
  // White paper sheet with folded corner
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(-14, -16, 28, 32, 3);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Ruled text lines
  ctx.fillStyle = '#94a3b8';
  [-9, -5, -1, 3, 7].forEach((ly) => {
    ctx.fillRect(-10, ly, ly === 7 ? 12 : 20, 1.8);
  });

  // Green "ACC" approval stamp badge
  ctx.save();
  ctx.translate(2, 4);
  ctx.rotate(-0.25);

  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-11, -7, 22, 14, 4);
  ctx.stroke();

  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 9px "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ACC ✓', 0, 0);

  ctx.restore();
}

/** ⭐ Bintang IPK 4.0: Golden sparkling star with crown / glossy shine */
function drawBintangIpkIcon(ctx: CanvasRenderingContext2D, time: number) {
  ctx.save();
  const spikes = 5;
  const outerRadius = 18;
  const innerRadius = 8.5;

  // Star geometry
  ctx.beginPath();
  let rot = (Math.PI / 2) * 3;
  let x = 0;
  let y = 0;
  const step = Math.PI / spikes;

  for (let i = 0; i < spikes; i++) {
    x = Math.cos(rot) * outerRadius;
    y = Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = Math.cos(rot) * innerRadius;
    y = Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.closePath();

  // Rich golden star gradient
  const starGrad = ctx.createLinearGradient(0, -18, 0, 18);
  starGrad.addColorStop(0, '#fef08a');
  starGrad.addColorStop(0.5, '#eab308');
  starGrad.addColorStop(1, '#ca8a04');
  ctx.fillStyle = starGrad;
  ctx.fill();

  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Cute face on star
  ctx.fillStyle = '#713f12';
  ctx.beginPath();
  ctx.arc(-4, 0, 1.5, 0, Math.PI * 2);
  ctx.arc(4, 0, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Sparkle cross
  const sparkle = (Math.sin(time * 3) + 1) / 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(-6, -6, 2.5 * sparkle, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ==================== OBSTACLES ====================

export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, groundY: number) {
  if (!obs) return;
  ctx.save();
  const cx = obs.x + obs.width / 2;
  const cy = obs.y + obs.height; // Resting on ground

  // Cast obstacle ground shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, groundY + 2, obs.width / 2.2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(cx, cy);

  switch (obs.kind) {
    case 'GAME_ONLINE':
      drawMabarObstacle(ctx, obs);
      break;
    case 'KASUR':
      drawKasurObstacle(ctx, obs);
      break;
    case 'TIKTOK':
      drawTiktokObstacle(ctx, obs);
      break;
    case 'NONGKRONG':
      drawNongkrongObstacle(ctx, obs);
      break;
  }

  // Draw cute comic warning badge above obstacle
  drawObstacleBadge(ctx, obs.message);

  ctx.restore();
}

/** 🎮 Mabar Game Online ("Lupa Waktu"): Glowing game console gamepad with cords and arcade screen */
function drawMabarObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  ctx.translate(0, -obs.height / 2);

  // Monitor / arcade display in background
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.roundRect(-22, -26, 44, 28, 4);
  ctx.fill();
  ctx.strokeStyle = '#4338ca';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Screen glare and game graphics (health bar & pixel battle)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-18, -23, 36, 21);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-16, -21, 14, 3); // Enemy HP
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(2, -21, 14, 3); // Player HP
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-4, -14, 8, 8); // Game icon

  // Stand
  ctx.fillStyle = '#475569';
  ctx.fillRect(-4, 2, 8, 8);
  ctx.fillRect(-10, 9, 20, 3);

  // Big Gamepad in front
  ctx.fillStyle = '#312e81';
  ctx.beginPath();
  ctx.roundRect(-18, 0, 36, 18, 7);
  ctx.fill();

  // D-pad (cross)
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-12, 6, 8, 3);
  ctx.fillRect(-9.5, 3.5, 3, 8);

  // Action buttons (A, B, X, Y)
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(8, 6, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(12, 9.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(4, 9.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(8, 13, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** 🛌 Kasur Empuk ("Mager!"): Fluffy bed with quilt, pillow, and drifting "Zzz" */
function drawKasurObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  ctx.translate(0, -obs.height / 2);

  // Bed wooden frame
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.roundRect(-28, 4, 56, 14, 3);
  ctx.fill();

  // Bed headboard
  ctx.fillRect(-28, -14, 8, 20);

  // Fluffy mattress
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(-24, -2, 48, 12, 3);
  ctx.fill();

  // Plump cozy pillow
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.roundRect(-22, -10, 14, 10, 4);
  ctx.fill();
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Warm duvet blanket (Pastel Purple / Pink pattern)
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.roundRect(-10, -6, 34, 16, [4, 4, 2, 2]);
  ctx.fill();

  // Blanket polka dots
  ctx.fillStyle = '#e9d5ff';
  [-4, 6, 16].forEach((dx) => {
    ctx.beginPath();
    ctx.arc(dx, 0, 2, 0, Math.PI * 2);
    ctx.arc(dx + 5, 6, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Animated floating "Z z z"
  const t = Date.now() / 300;
  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 10px "Fredoka", sans-serif';
  ctx.fillText('z', -8 + Math.sin(t) * 2, -16);
  ctx.font = 'bold 12px "Fredoka", sans-serif';
  ctx.fillText('Z', 0 + Math.sin(t + 1) * 3, -22);
  ctx.font = 'bold 14px "Fredoka", sans-serif';
  ctx.fillText('Z', 10 + Math.sin(t + 2) * 4, -30);

  ctx.restore();
}

/** 📱 Scroll TikTok / Drakor ("Fokus Pecah!"): Smartphone on stand with video feed & floating hearts */
function drawTiktokObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  ctx.translate(0, -obs.height / 2);

  // Phone body
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.roundRect(-16, -26, 32, 52, 6);
  ctx.fill();
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Phone screen displaying vibrant short video
  const vidGrad = ctx.createLinearGradient(0, -23, 0, 23);
  vidGrad.addColorStop(0, '#0284c7');
  vidGrad.addColorStop(0.6, '#ec4899');
  vidGrad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = vidGrad;
  ctx.beginPath();
  ctx.roundRect(-14, -23, 28, 46, 4);
  ctx.fill();

  // Video play symbol
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.moveTo(-3, -4);
  ctx.lineTo(5, 0);
  ctx.lineTo(-3, 4);
  ctx.closePath();
  ctx.fill();

  // Floating red like hearts
  const heartFloat = Math.sin(Date.now() / 250);
  ctx.fillStyle = '#ef4444';
  drawHeart(ctx, 8, -12 + heartFloat * 3, 4);
  ctx.fillStyle = '#f43f5e';
  drawHeart(ctx, -7, -16 - heartFloat * 2, 3);

  // Camera punch hole
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, -20, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** ☕ Nongkrong Sampai Subuh ("Kesiangan!"): Steaming cup of coffee + late night clock */
function drawNongkrongObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  ctx.translate(0, -obs.height / 2);

  // Coffee cup body
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(-14, -8);
  ctx.lineTo(14, -8);
  ctx.lineTo(11, 16);
  ctx.lineTo(-11, 16);
  ctx.closePath();
  ctx.fill();

  // Cup cardboard sleeve
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(-13, -1);
  ctx.lineTo(13, -1);
  ctx.lineTo(11.5, 9);
  ctx.lineTo(-11.5, 9);
  ctx.closePath();
  ctx.fill();

  // Coffee cup plastic lid
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(-15, -13, 30, 6, 2);
  ctx.fill();

  // Steaming vapors
  const steamOffset = Date.now() / 200;
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-5, -15);
  ctx.quadraticCurveTo(-8 + Math.sin(steamOffset) * 4, -22, -4, -30);
  ctx.moveTo(3, -15);
  ctx.quadraticCurveTo(6 + Math.cos(steamOffset) * 4, -24, 2, -32);
  ctx.stroke();

  // Midnight alarm clock beside cup
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.arc(14, 6, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#be123c';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Clock dial
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(14, 6, 7, 0, Math.PI * 2);
  ctx.fill();

  // Clock hands showing 03:00 (subuh)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(14, 6);
  ctx.lineTo(14, 1.5);
  ctx.moveTo(14, 6);
  ctx.lineTo(18, 6);
  ctx.stroke();

  ctx.restore();
}

/** Draw small comic warning badge above obstacle */
function drawObstacleBadge(ctx: CanvasRenderingContext2D, message: string) {
  ctx.save();
  ctx.translate(0, -68);

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(-36, -10, 72, 20, 10);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Little speech triangle
  ctx.beginPath();
  ctx.moveTo(-4, 10);
  ctx.lineTo(0, 15);
  ctx.lineTo(4, 10);
  ctx.closePath();
  ctx.fill();

  // Badge text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, 0, 0);

  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size / 2, -size, -size * 1.3, size / 3, 0, size * 1.3);
  ctx.bezierCurveTo(size * 1.3, size / 3, size / 2, -size, 0, 0);
  ctx.fill();
  ctx.restore();
}
