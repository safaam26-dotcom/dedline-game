import { Player } from '../types';

/**
 * Procedural 2D cute anime-style Mahasiswi Character Renderer.
 * Renders multi-frame running cycle, articulated legs & arms, hair physics,
 * jump/fall kinematics, throw animation, hit state, and graduation attire.
 */

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  player: Player,
  groundY: number
) {
  if (!player) return;
  ctx.save();

  // If hit and invincible, flash opacity
  if (player.hitTimer > 0) {
    const flash = Math.floor(player.hitTimer * 15) % 2 === 0;
    if (flash) {
      ctx.globalAlpha = 0.4;
    }
  }

  const { x, y, width, height, state, runCycle, hairOffset } = player;

  // Center coordinate of character base
  const cx = x + width / 2;
  const cy = y + height; // Feet level

  // Shadow on ground when close to ground
  const distToGround = Math.max(0, groundY - cy);
  const shadowScale = Math.max(0.3, 1 - distToGround / 240);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, groundY + 4, (width / 2.2) * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw character relative to anchor cx, cy
  ctx.translate(cx, cy);

  // Slight tilt while running forward
  let bodyTilt = 0.08;
  let bobY = 0;

  if (state === 'running') {
    bodyTilt = 0.1;
    // Bouncing bobbing motion while running
    bobY = -Math.abs(Math.sin(runCycle * 2)) * 5;
  } else if (state === 'jumping') {
    bodyTilt = 0.15;
    bobY = -2;
  } else if (state === 'falling') {
    bodyTilt = 0.04;
    bobY = 0;
  } else if (state === 'graduated') {
    bodyTilt = 0;
    bobY = -Math.sin(Date.now() / 250) * 3;
  }

  ctx.translate(0, bobY);
  ctx.rotate(bodyTilt);

  // Determine limb angles based on state & run cycle
  // Left and Right legs (cycle 0 to 2*PI)
  let legLeftAngle = 0;
  let legRightAngle = 0;
  let kneeLeftAngle = 0;
  let kneeRightAngle = 0;

  let armLeftAngle = 0;
  let armRightAngle = 0;

  if (state === 'running') {
    const cycle = runCycle;
    legLeftAngle = Math.sin(cycle) * 0.75;
    legRightAngle = Math.sin(cycle + Math.PI) * 0.75;

    // Natural knee bending on back-step
    kneeLeftAngle = Math.max(0, Math.sin(cycle - 0.5) * 0.85);
    kneeRightAngle = Math.max(0, Math.sin(cycle + Math.PI - 0.5) * 0.85);

    armLeftAngle = -Math.sin(cycle) * 0.7;
    armRightAngle = -Math.sin(cycle + Math.PI) * 0.7;
  } else if (state === 'jumping') {
    legLeftAngle = -0.55;
    legRightAngle = 0.45;
    kneeLeftAngle = 0.8;
    kneeRightAngle = 0.6;
    armLeftAngle = -0.9;
    armRightAngle = 0.7;
  } else if (state === 'falling') {
    legLeftAngle = -0.2;
    legRightAngle = 0.3;
    kneeLeftAngle = 0.3;
    kneeRightAngle = 0.2;
    armLeftAngle = -0.4;
    armRightAngle = -0.3;
  } else if (state === 'graduated') {
    legLeftAngle = 0;
    legRightAngle = 0;
    armLeftAngle = -0.2;
    armRightAngle = -1.2; // Waving diploma in air!
  }

  if (player.throwAnimationTimer > 0) {
    // Override right arm when throwing skripsi
    armRightAngle = 0.9 - player.throwAnimationTimer * 4;
  }

  const isGraduated = state === 'graduated';

  // 1. Back Arm (Left Arm)
  drawArm(ctx, -12, -44, armLeftAngle, '#38bdf8', '#fbcfe8', isGraduated);

  // 2. Back Leg (Left Leg)
  drawLeg(ctx, -6, -26, legLeftAngle, kneeLeftAngle, '#0284c7', '#ffffff', '#e11d48');

  // 3. Hair Back / Ponytail (sways backward dynamically)
  drawBackHair(ctx, hairOffset, state, isGraduated);

  // 4. Torso & Clothes
  drawTorso(ctx, isGraduated);

  // 5. Front Leg (Right Leg)
  drawLeg(ctx, 6, -26, legRightAngle, kneeRightAngle, '#0369a1', '#ffffff', '#e11d48');

  // 6. Cute Head & Face
  drawHeadAndFace(ctx, player, isGraduated);

  // 7. Front Arm (Right Arm)
  drawArm(ctx, 12, -44, armRightAngle, '#38bdf8', '#fbcfe8', isGraduated, isGraduated);

  // 8. Graduation Cap if graduated
  if (isGraduated) {
    drawGraduationCap(ctx);
  }

  ctx.restore();
}

/**
 * Draw articulated human-proportioned leg with hip, knee, and trendy sneaker shoe.
 */
function drawLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  hipAngle: number,
  kneeAngle: number,
  pantsColor: string,
  sockColor: string,
  shoeColor: string
) {
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(hipAngle);

  // Thigh (Pants / denim)
  ctx.fillStyle = pantsColor;
  ctx.beginPath();
  ctx.roundRect(-4.5, 0, 9, 16, 4);
  ctx.fill();

  // Knee translation
  ctx.translate(0, 14);
  ctx.rotate(kneeAngle);

  // Calf / Sock
  ctx.fillStyle = sockColor;
  ctx.beginPath();
  ctx.roundRect(-3.5, 0, 7, 13, 3);
  ctx.fill();

  // Sneaker Shoe
  ctx.translate(0, 12);
  ctx.fillStyle = shoeColor;
  ctx.beginPath();
  // Shoe body
  ctx.roundRect(-4, -2, 13, 7, [3, 4, 2, 2]);
  ctx.fill();

  // White rubber sole & toe cap
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-4, 3, 14, 3);
  ctx.beginPath();
  ctx.arc(8, 2, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw articulated arm with cute sweater sleeve, hand, and optional diploma in victory.
 */
function drawArm(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  angle: number,
  sleeveColor: string,
  skinColor: string,
  isGraduated: boolean,
  holdsDiploma: boolean = false
) {
  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  ctx.rotate(angle);

  // Sleeve / Gown
  ctx.fillStyle = isGraduated ? '#1e293b' : sleeveColor;
  ctx.beginPath();
  ctx.roundRect(-4, 0, 8, 16, 4);
  ctx.fill();

  if (isGraduated) {
    // Yellow cuff accent on graduation gown
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-4, 13, 8, 3);
  }

  // Forearm & Cute Hand
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.roundRect(-3, 15, 6, 8, 3);
  ctx.fill();

  // If holding graduation diploma
  if (holdsDiploma) {
    ctx.save();
    ctx.translate(1, 20);
    ctx.rotate(-0.5);

    // Rolled diploma scroll
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(-5, -12, 10, 22, 3);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Red ribbon in center
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-5.5, -2, 11, 4);

    // Ribbon tails
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(4, 8);
    ctx.lineTo(-2, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Cute bouncing ponytail hair with fluid motion trailing behind running character.
 */
function drawBackHair(
  ctx: CanvasRenderingContext2D,
  hairOffset: number,
  state: string,
  isGraduated: boolean
) {
  ctx.save();
  ctx.translate(isGraduated ? -4 : -8, -55);

  let sway = hairOffset;
  if (state === 'jumping') sway += 12;
  if (state === 'falling') sway += 20;

  // Dark brown shiny hair
  ctx.fillStyle = '#451a03';

  // Hair tie / scrunchie
  ctx.beginPath();
  ctx.arc(-2, 4, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ec4899';
  ctx.fill();

  // Ponytail flow
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(-2, 4);
  ctx.bezierCurveTo(-18 - sway, 0, -26 - sway, 16, -16 - sway * 0.7, 34);
  ctx.bezierCurveTo(-10 - sway * 0.5, 26, -6, 16, 0, 6);
  ctx.closePath();
  ctx.fill();

  // Hair highlight shine
  ctx.fillStyle = 'rgba(253, 230, 138, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-10 - sway * 0.6, 12, 3, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Torso: College jacket / hoodie with tote bag, or graduation robe.
 */
function drawTorso(ctx: CanvasRenderingContext2D, isGraduated: boolean) {
  ctx.save();
  ctx.translate(0, -48);

  if (isGraduated) {
    // Black graduation gown
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.lineTo(13, 0);
    ctx.lineTo(16, 26);
    ctx.lineTo(-16, 26);
    ctx.closePath();
    ctx.fill();

    // Golden yellow academic sash (samir wisuda)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-4, 22);
    ctx.lineTo(4, 22);
    ctx.lineTo(8, 0);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, 16);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();

    // University medallion medal
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 24, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    // Cute modern college sweater/hoodie (light sky blue)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(-12, 0, 24, 24, 6);
    ctx.fill();

    // White shirt collar under sweater
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(0, 5);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fill();

    // Hoodie pocket pouch
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.roundRect(-7, 13, 14, 9, 3);
    ctx.fill();

    // Canvas Tote bag strap across shoulder
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-11, 2);
    ctx.lineTo(9, 22);
    ctx.stroke();

    // Tote bag on side
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(4, 16, 12, 12, 3);
    ctx.fill();

    // Small book / binder peeking out from tote bag
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(7, 13, 8, 4);
  }

  ctx.restore();
}

/**
 * Cute anime-style head with expressive eyes, cute bangs, and blush.
 */
function drawHeadAndFace(
  ctx: CanvasRenderingContext2D,
  player: Player,
  isGraduated: boolean
) {
  ctx.save();
  ctx.translate(0, -60);

  // Neck
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(-4, 8, 8, 6);

  // Face base
  ctx.fillStyle = '#ffedd5';
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soft cheeks blush
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-9, 3, 3.5, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(9, 3, 3.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes and expression
  if (player.hitTimer > 0) {
    // Hurt/shocked expression: (> <)
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Left eye (>)
    ctx.moveTo(-8, -2);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 2);
    // Right eye (<)
    ctx.moveTo(8, -2);
    ctx.lineTo(4, 0);
    ctx.lineTo(8, 2);
    ctx.stroke();

    // Shocked little mouth (O)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(0, 6, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Happy, bright, focused eyes
    const eyeOffsetX = 4.5;
    const eyeY = -1;

    // Left and right eye pupils
    [-eyeOffsetX, eyeOffsetX].forEach((ex) => {
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 3, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Big shine highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - 1, eyeY - 1.5, 1.4, 0, Math.PI * 2);
      ctx.arc(ex + 1, eyeY + 1.5, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Eyelashes
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(ex, eyeY - 2, 3.6, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    });

    // Eyebrows
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.quadraticCurveTo(-5, -10, -2, -8);
    ctx.moveTo(2, -8);
    ctx.quadraticCurveTo(5, -10, 8, -8);
    ctx.stroke();

    // Cute cheerful smile mouth
    ctx.strokeStyle = '#e11d48';
    ctx.fillStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (isGraduated) {
      // Big open smile for victory!
      ctx.arc(0, 4, 4, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.arc(0, 4, 3, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }
  }

  // Hair Bangs (Cute modern bob fringe)
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(-16, -2);
  ctx.bezierCurveTo(-15, -16, -6, -20, 0, -20);
  ctx.bezierCurveTo(6, -20, 15, -16, 16, -2);
  ctx.lineTo(13, -3);
  ctx.lineTo(8, -8);
  ctx.lineTo(4, -4);
  ctx.lineTo(0, -9);
  ctx.lineTo(-4, -4);
  ctx.lineTo(-8, -8);
  ctx.lineTo(-13, -3);
  ctx.closePath();
  ctx.fill();

  // Side hair strands framing face
  ctx.beginPath();
  ctx.roundRect(-16, -4, 4.5, 15, 2);
  ctx.roundRect(12, -4, 4.5, 15, 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Graduation Cap (Topi Toga) with dangling yellow tassel for victory!
 */
function drawGraduationCap(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.translate(0, -78);

  // Mortarboard skull cap base
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(0, 2, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Diamond mortarboard top plate
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(24, 0);
  ctx.lineTo(0, 7);
  ctx.lineTo(-24, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Gold center button
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Gold swinging tassel string
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(12, 4, 15, 14);
  ctx.stroke();

  // Tassel tip
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.roundRect(13, 13, 4, 8, 2);
  ctx.fill();

  ctx.restore();
}
