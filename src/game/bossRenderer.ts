import { Boss, Projectile } from '../types';

/**
 * 2D Final Boss Renderer: "Dosen Penguji" & Projectiles.
 * Renders the lecturer, their attack animations, floating exam questions, and thesis manuscripts.
 */

export function drawBoss(
  ctx: CanvasRenderingContext2D,
  boss: Boss,
  groundY: number
) {
  if (!boss) return;
  ctx.save();

  // If hit, flash red or white
  const isHit = boss.hitTimer > 0;
  if (isHit && Math.floor(boss.hitTimer * 20) % 2 === 0) {
    ctx.filter = 'brightness(1.5) sepia(1) hue-rotate(-50deg)';
  }

  const cx = boss.x + boss.width / 2;
  const cy = boss.y + boss.height;

  // Boss ground shadow scales with altitude
  const distFromGround = Math.max(0, groundY - cy);
  const altitudeScale = Math.max(0.25, 1 - distFromGround / 320);
  ctx.fillStyle = `rgba(15, 23, 42, ${0.35 * altitudeScale})`;
  ctx.beginPath();
  ctx.ellipse(cx, groundY + 4, (boss.width / 2) * altitudeScale, 6 * altitudeScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // If floating above ground, render subtle aura platform under feet
  if (distFromGround > 25) {
    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 28, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  ctx.translate(cx, cy);

  // If hit, flinch / recoil backwards
  if (isHit) {
    ctx.translate(14, 0);
  }

  // If dodging, show evasive wind blur afterimage
  if (boss.state === 'dodging') {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(-15, -45, 25, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Subtle floating hover or walking bob
  const bobY = Math.sin(Date.now() / 250) * 4;
  ctx.translate(0, bobY);

  // 1. Legs
  ctx.fillStyle = '#1e293b'; // Formal dark trousers
  ctx.fillRect(-12, -26, 9, 26);
  ctx.fillRect(3, -26, 9, 26);

  // Formal leather shoes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-14, -4, 13, 6, 2);
  ctx.roundRect(1, -4, 13, 6, 2);
  ctx.fill();

  // 2. Torso (Batik pattern / formal blazer with tie)
  ctx.fillStyle = '#78350f'; // Warm batik tone
  ctx.beginPath();
  ctx.roundRect(-20, -62, 40, 38, 5);
  ctx.fill();

  // Batik geometric diamond motifs
  ctx.fillStyle = '#b45309';
  for (let by = -56; by < -30; by += 8) {
    for (let bx = -14; bx < 16; bx += 8) {
      ctx.fillRect(bx, by, 3, 3);
    }
  }

  // White inner shirt & Red tie
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-6, -62);
  ctx.lineTo(0, -48);
  ctx.lineTo(6, -62);
  ctx.closePath();
  ctx.fill();

  // Red necktie
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(-3, -60);
  ctx.lineTo(3, -60);
  ctx.lineTo(2, -42);
  ctx.lineTo(0, -38);
  ctx.lineTo(-2, -42);
  ctx.closePath();
  ctx.fill();

  // ID Card Lanyard
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-10, -62);
  ctx.lineTo(0, -44);
  ctx.lineTo(10, -62);
  ctx.stroke();

  // ID Card badge
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(-5, -44, 10, 12, 1.5);
  ctx.fill();
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-4, -42, 8, 3);

  // 3. Arms & Clipboard
  // Left arm holding examination clipboard
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.roundRect(-24, -58, 8, 22, 3);
  ctx.fill();

  // Clipboard
  ctx.save();
  ctx.translate(-26, -46);
  ctx.rotate(0.2);
  ctx.fillStyle = '#b45309'; // Brown board
  ctx.beginPath();
  ctx.roundRect(-6, -14, 18, 26, 2);
  ctx.fill();
  // White paper sheet on clipboard
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-4, -12, 14, 22);
  // Red pen checkmarks on paper
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-1, -8);
  ctx.lineTo(1, -6);
  ctx.lineTo(4, -10);
  ctx.moveTo(-1, -2);
  ctx.lineTo(1, 0);
  ctx.lineTo(4, -4);
  ctx.stroke();
  ctx.restore();

  // Right arm pointing or holding red revision pen
  ctx.save();
  ctx.translate(18, -56);
  if (boss.state === 'throwing') {
    ctx.rotate(-0.8); // Reel forward
  } else {
    ctx.rotate(0.3);
  }
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.roundRect(-3, 0, 7, 20, 3);
  ctx.fill();

  // Red revision pen in hand
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 18, 4, 12);
  ctx.restore();

  // 4. Head & Face
  drawBossHead(ctx, isHit, boss);

  // 5. Boss Title & HP Bar floating above head
  drawBossHpBar(ctx, boss);

  ctx.restore();
}

/** Lecturer Head with spectacles, neat hair, mustache / stern expression */
function drawBossHead(ctx: CanvasRenderingContext2D, isHit: boolean, boss: Boss) {
  ctx.save();
  ctx.translate(0, -78);

  // Neck
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(-5, 6, 10, 10);

  // Face
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair (Neat parted graying dark hair)
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(0, -4, 17, Math.PI * 1.1, Math.PI * 2.1);
  ctx.lineTo(16, 2);
  ctx.lineTo(14, -8);
  ctx.lineTo(0, -18);
  ctx.lineTo(-14, -8);
  ctx.lineTo(-16, 2);
  ctx.closePath();
  ctx.fill();

  // Distinguished sideburns
  ctx.fillRect(-17, -4, 4, 12);
  ctx.fillRect(13, -4, 4, 12);

  if (isHit) {
    // Shocked expression with sweat drop
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    // Spiral dizzy eyes
    ctx.beginPath();
    ctx.arc(-7, -2, 3, 0, Math.PI * 2);
    ctx.arc(7, -2, 3, 0, Math.PI * 2);
    ctx.stroke();

    // Sweat drop
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(14, -14, 3, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Open surprised mouth
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.ellipse(0, 8, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Sharp professor glasses with shine
    const glassY = -2;
    [-7, 7].forEach((gx) => {
      // Frame
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.roundRect(gx - 5, glassY - 4, 10, 8, 2);
      ctx.fill();
      ctx.stroke();

      // Sharp pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(gx, glassY, 2, 0, Math.PI * 2);
      ctx.fill();

      // Glass lens glare
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(gx - 3, glassY - 2);
      ctx.lineTo(gx + 2, glassY + 2);
      ctx.stroke();
    });

    // Spectacles bridge
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2, glassY);
    ctx.lineTo(2, glassY);
    ctx.stroke();

    // Stern bushy eyebrows
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-11, glassY - 7);
    ctx.lineTo(-3, glassY - 5);
    ctx.moveTo(11, glassY - 7);
    ctx.lineTo(3, glassY - 5);
    ctx.stroke();

    // Distinguished mustache
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(-8, 5);
    ctx.quadraticCurveTo(0, 2, 8, 5);
    ctx.quadraticCurveTo(0, 9, -8, 5);
    ctx.fill();

    // Stern mouth
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, 9);
    ctx.lineTo(4, 9);
    ctx.stroke();
  }

  ctx.restore();
}

/** Boss Name & Health Bar floating above boss */
function drawBossHpBar(ctx: CanvasRenderingContext2D, boss: Boss) {
  ctx.save();
  ctx.translate(0, -112);

  // Name Tag
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-60, -16, 120, 20, 4);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DOSEN PENGUJI', 0, -6);

  // 5 Hearts for HP (requested: "DOSEN PENGUJI ❤️❤️❤️❤️❤️")
  const heartSpacing = 16;
  const startX = -((boss.maxHp - 1) * heartSpacing) / 2;

  for (let i = 0; i < boss.maxHp; i++) {
    const hx = startX + i * heartSpacing;
    const isFilled = i < boss.hp;
    drawBossHeart(ctx, hx, 12, 6, isFilled);
  }

  ctx.restore();
}

function drawBossHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  filled: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = filled ? '#ef4444' : '#1e293b';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size / 2, -size, -size * 1.3, size / 3, 0, size * 1.3);
  ctx.bezierCurveTo(size * 1.3, size / 3, size / 2, -size, 0, 0);
  ctx.fill();

  if (filled) {
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    // Depleted heart outline
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Cross-slash mark over depleted heart
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.3);
    ctx.lineTo(size * 0.5, size * 0.5);
    ctx.moveTo(size * 0.5, -size * 0.3);
    ctx.lineTo(-size * 0.5, size * 0.5);
    ctx.stroke();
  }

  ctx.restore();
}

// ==================== PROJECTILES ====================

export function drawProjectile(ctx: CanvasRenderingContext2D, proj: Projectile) {
  if (!proj) return;
  ctx.save();
  const cx = proj.x + proj.width / 2;
  const cy = proj.y + proj.height / 2;

  ctx.translate(cx, cy);
  ctx.rotate(proj.rotation);

  if (proj.type === 'SKRIPSI_PLAYER') {
    // Player's weapon: Thick bound hardcover thesis book (Navy blue / Maroon cover with golden embossed title)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(-proj.width / 2, -proj.height / 2, proj.width, proj.height, 3);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // White paper block edge
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(proj.width / 2 - 5, -proj.height / 2 + 2, 4, proj.height - 4);

    // Embossed gold text "SKRIPSI"
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 8px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SKRIPSI', -2, 0);
  } else if (proj.type === 'REVISI_BOSS') {
    // Boss attack: Flying white paper marked "REVISI!" in red ink
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-proj.width / 2, -proj.height / 2, proj.width, proj.height, 2);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Big red stamp text
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('REVISI!', 0, 0);
  } else if (proj.type === 'QUESTION_BOSS') {
    // Boss attack: Floating sharp question dialogue bubbles
    // “KENAPA KAMU MEMILIH METODE INI?”, “SUMBER DATA DARI MANA?”, “KENAPA HASILNYA SEPERTI INI?”
    ctx.fillStyle = '#fee2e2';
    ctx.beginPath();
    ctx.roundRect(-proj.width / 2, -proj.height / 2, proj.width, proj.height, 6);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Red warning question text
    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(proj.text || 'SUMBER DATA?', 0, 0);
  }

  ctx.restore();
}
