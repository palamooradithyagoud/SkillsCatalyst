"use client";

import React, { useEffect, useRef, useState } from "react";

export interface InteractiveCharacterProps {
  className?: string;
  width?: number;
  height?: number;
  outfit?: "none" | "scholar" | "headphones" | "glasses" | "scarf";
  mood?: "normal" | "happy" | "angry" | "disappointed" | "dance";
}

export function InteractiveCharacter({
  className = "",
  width = 260,
  height = 260,
  outfit = "none",
  mood = "normal",
}: InteractiveCharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHappy, setIsHappy] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Mouse tracking & physics
    let targetLookX = 0;
    let targetLookY = 0;
    let currentLookX = 0;
    let currentLookY = 0;
    let lookVelocityX = 0;
    let lookVelocityY = 0;

    // Cursor proximity & speed
    let mouseProximity = 0; // 0 (far) to 1 (very close)
    let mouseSpeed = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let lastMouseTime = performance.now();

    // Natural Blinking
    let isBlinking = false;
    let nextBlinkTime = performance.now() + 2200;
    let blinkProgress = 0;

    // Curiosity & Micro-twitches
    let curiosityTilt = 0;
    let targetCuriosityTilt = 0;
    let nextCuriosityChange = performance.now() + 1800;

    // Jump & Interaction physics
    let jumpY = 0;
    let jumpVy = 0;
    let isJumping = false;
    let excitedWaddle = 0;

    // Setup high-DPI canvas
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rawDx = e.clientX - centerX;
      const rawDy = e.clientY - centerY;
      const dist = Math.hypot(rawDx, rawDy);

      // Mouse speed tracking
      const now = performance.now();
      const dt = Math.max(1, now - lastMouseTime);
      const moveDist = Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY);
      mouseSpeed = Math.min(1, (moveDist / dt) * 0.8);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      lastMouseTime = now;

      // Proximity (1 when within 140px, scaling down to 0 at 450px)
      mouseProximity = Math.max(0, Math.min(1, 1 - (dist - 90) / 360));

      // Tight, responsive angle mapping across the hero card
      // Using a tighter divisor (~200px) so the penguin visibly turns and tracks
      targetLookX = Math.max(-1, Math.min(1, rawDx / 200));
      targetLookY = Math.max(-1, Math.min(1, rawDy / 160));
    };

    const handleClick = () => {
      if (!isJumping) {
        isJumping = true;
        jumpVy = -8.5;
        excitedWaddle = 1;
        isBlinking = true;
        blinkProgress = 0;
        targetCuriosityTilt = (Math.random() - 0.5) * 0.4;
        setTimeout(() => {
          excitedWaddle = 0;
        }, 1100);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    const render = () => {
      time += 0.032;

      // Spring-damped look tracking for organic realism
      const springStiffness = 0.12;
      const springDamping = 0.78;

      const ax = (targetLookX - currentLookX) * springStiffness;
      const ay = (targetLookY - currentLookY) * springStiffness;
      lookVelocityX = (lookVelocityX + ax) * springDamping;
      lookVelocityY = (lookVelocityY + ay) * springDamping;
      currentLookX += lookVelocityX;
      currentLookY += lookVelocityY;

      // Natural idle curiosity head tilting
      const now = performance.now();
      if (now >= nextCuriosityChange) {
        targetCuriosityTilt = (Math.random() - 0.5) * 0.22 + currentLookX * 0.15;
        nextCuriosityChange = now + 2000 + Math.random() * 2500;
      }
      curiosityTilt += (targetCuriosityTilt - curiosityTilt) * 0.06;

      // Jump Physics
      if (isJumping) {
        jumpY += jumpVy;
        jumpVy += 0.52; // gravity
        if (jumpY >= 0) {
          jumpY = 0;
          jumpVy = 0;
          isJumping = false;
        }
      }

      // Natural Blinking Cycle
      if (!isBlinking && now >= nextBlinkTime) {
        isBlinking = true;
        blinkProgress = 0;
      }
      if (isBlinking) {
        blinkProgress += 0.17;
        if (blinkProgress >= Math.PI) {
          isBlinking = false;
          nextBlinkTime = now + 2400 + Math.random() * 3200;
        }
      }

      // Responsive scale factor based on reference dimension (170px for bold, prominent character size)
      const baseDim = 170;
      const scale = Math.min(width / baseDim, height / baseDim);
      const cx = width / (2 * scale);

      const isAngryOrSad = mood === "angry" || mood === "disappointed";
      const isDancing = mood === "dance";

      // Precise wall-clock time in seconds for microsecond-perfect synchronization among all canvases
      const nowSec = now / 1000;
      // 4-beat synchronized hook step dance groove (~128 BPM)
      const dancePhase = nowSec * 4.4;
      const danceBounce = -Math.abs(Math.sin(dancePhase)) * 8.5;
      const danceSway = Math.sin(dancePhase * 0.5) * 0.13;

      const effectiveJumpY = isDancing ? danceBounce : jumpY;
      const cy = height / (2 * scale) + 4 + effectiveJumpY + (isAngryOrSad ? 2.5 : 0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr * scale, dpr * scale);

      // Organic breathing & posture (Smooth & pleasant: no jitter or seizure-like vibrations)
      let breathBob = 0;
      let breathScale = 1;
      let bodyWaddle = 0;

      if (isDancing) {
        breathBob = Math.sin(dancePhase) * 1.5;
        breathScale = 1 + Math.sin(dancePhase) * 0.02;
        bodyWaddle = danceSway;
      } else if (isAngryOrSad) {
        // Slow, heavy, disappointed sigh (smooth and subtle, no jitter!)
        breathBob = Math.sin(time * 2.2) * 1.8;
        breathScale = 1 + Math.sin(time * 2.2) * 0.015;
        bodyWaddle = currentLookX * 0.04 + Math.sin(time * 1.5) * 0.015;
      } else {
        breathBob = Math.sin(time * 2.2) * 2.2;
        breathScale = 1 + Math.sin(time * 2.2) * 0.018;
        bodyWaddle = Math.sin(time * 2.2) * 0.025 + currentLookX * 0.08;
      }

      // ── Layer 1: Multi-tier 3D Ambient Contact Shadow ──
      const shadowCompression = Math.max(0.35, 1 - Math.abs(effectiveJumpY) / 45);
      const shadowWidth = 52 * shadowCompression;
      const shadowHeight = 14 * shadowCompression;

      // Deep core shadow
      const coreShadow = ctx.createRadialGradient(cx, cy + 54, 2, cx, cy + 54, shadowWidth * 0.65);
      coreShadow.addColorStop(0, "rgba(8, 4, 22, 0.7)");
      coreShadow.addColorStop(1, "rgba(8, 4, 22, 0)");
      ctx.fillStyle = coreShadow;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 54, shadowWidth * 0.65, shadowHeight * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft purple ambient blur shadow
      const softShadow = ctx.createRadialGradient(cx, cy + 54, 10, cx, cy + 54, shadowWidth);
      softShadow.addColorStop(0, "rgba(124, 58, 237, 0.35)");
      softShadow.addColorStop(0.6, "rgba(79, 70, 229, 0.15)");
      softShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = softShadow;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 54, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Main Body 3D Root Group ──
      ctx.save();
      ctx.translate(cx, cy + breathBob);
      ctx.rotate(bodyWaddle);
      ctx.scale(breathScale, breathScale);

      // ── Layer 2: 3D Anatomical Feet (Forward perspective with claws) ──
      const waddleCycle = excitedWaddle > 0 ? Math.sin(time * 16) * 3.5 : 0;
      const drawFoot = (isLeft: boolean) => {
        const footX = isLeft ? -20 : 20;
        let footStep = isLeft ? -waddleCycle : waddleCycle;
        if (isDancing) {
          // Synchronized stepping in rhythm with the sway
          footStep = isLeft
            ? Math.max(0, Math.sin(dancePhase * 0.5)) * 4.5
            : Math.max(0, -Math.sin(dancePhase * 0.5)) * 4.5;
        }
        const footAngle = (isLeft ? -0.18 : 0.18) + (isDancing ? danceSway * 0.4 : currentLookX * 0.08);

        ctx.save();
        ctx.translate(footX, 51 - footStep);
        ctx.rotate(footAngle);

        // Foot shadow under toes
        ctx.fillStyle = "rgba(10, 5, 20, 0.4)";
        ctx.beginPath();
        ctx.ellipse(0, 2, 13, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D Toe Pad Gradient
        const footGrad = ctx.createLinearGradient(0, -6, 0, 6);
        footGrad.addColorStop(0, "#F59E0B");
        footGrad.addColorStop(0.7, "#D97706");
        footGrad.addColorStop(1, "#B45309");

        ctx.fillStyle = footGrad;
        // Central pad
        ctx.beginPath();
        ctx.ellipse(0, 0, 11.5, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3 Distinct Webbed Toes
        [-6, 0, 6].forEach((toeOffset) => {
          ctx.fillStyle = "#FBBF24";
          ctx.beginPath();
          ctx.arc(toeOffset, 4, 3.2, 0, Math.PI * 2);
          ctx.fill();

          // Tiny dark claw tip
          ctx.fillStyle = "#1E1B4B";
          ctx.beginPath();
          ctx.arc(toeOffset, 6.5, 1.1, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      };

      drawFoot(true);
      drawFoot(false);

      // ── Layer 3: Velvet Midnight Penguin Body (Volumetric 3D Shading) ──
      // Dynamic lighting direction based on mouse position
      const lightX = -30 + currentLookX * 25;
      const lightY = -50 + currentLookY * 20;

      const bodyGrad = ctx.createRadialGradient(lightX, lightY, 15, 0, 0, 75);
      bodyGrad.addColorStop(0, "#2D2654");
      bodyGrad.addColorStop(0.25, "#1F1A3D");
      bodyGrad.addColorStop(0.65, "#130F26");
      bodyGrad.addColorStop(1, "#0A0716");

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(0, -58);
      // Realistic Emperor penguin pear silhouette
      ctx.bezierCurveTo(-42, -54, -46, 12, -35, 48);
      ctx.bezierCurveTo(-24, 56, 24, 56, 35, 48);
      ctx.bezierCurveTo(46, 12, 42, -54, 0, -58);
      ctx.closePath();
      ctx.fill();

      // Specular Rim Light along body contour (Cyan/Violet Aurora Rim)
      ctx.lineWidth = 2.2;
      const rimGrad = ctx.createLinearGradient(-40, 0, 40, 0);
      rimGrad.addColorStop(0, "rgba(168, 85, 247, 0.55)");
      rimGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.2)");
      rimGrad.addColorStop(1, "rgba(168, 85, 247, 0.55)");
      ctx.strokeStyle = rimGrad;
      ctx.stroke();

      // ── Layer 4: 3D Articulated Flippers (Wings React to Cursor & Dance) ──
      const drawWing = (isLeft: boolean) => {
        const wingBaseX = isLeft ? -33 : 33;
        const excitedFlutter = excitedWaddle > 0 ? Math.sin(time * 20) * 0.4 : 0;
        const proximityWave = mouseProximity * (isLeft ? -currentLookX : currentLookX) * 0.22;
        const idleWave = Math.sin(time * 2.2 + (isLeft ? 0 : Math.PI)) * 0.06;

        let wingAngle = 0;
        if (isDancing) {
          // Energetic 4-beat synchronized hook step wing choreography
          // Sway left -> left wing pumps up high, right grooves at hip
          // Sway right -> right wing pumps up high, left grooves at hip
          const swayDirection = Math.sin(dancePhase * 0.5);
          if (isLeft) {
            wingAngle = -0.3 + swayDirection * 0.55 + Math.sin(dancePhase) * 0.12;
          } else {
            wingAngle = 0.3 + swayDirection * 0.55 - Math.sin(dancePhase) * 0.12;
          }
        } else if (isAngryOrSad) {
          // Cute, defiant arms-on-hips / wings-tucked-akimbo stance with gentle breathing (NO jitter)
          wingAngle = isLeft
            ? -0.42 + Math.sin(time * 2.2) * 0.03
            : 0.42 - Math.sin(time * 2.2) * 0.03;
        } else {
          wingAngle =
            (isLeft ? -0.2 : 0.2) +
            currentLookX * 0.12 +
            excitedFlutter +
            proximityWave +
            idleWave;
        }

        ctx.save();
        ctx.translate(wingBaseX, -6);
        ctx.rotate(wingAngle);

        // Wing 3D Gradient
        const wingGrad = ctx.createLinearGradient(isLeft ? -12 : 12, 0, isLeft ? 6 : -6, 38);
        wingGrad.addColorStop(0, "#28224C");
        wingGrad.addColorStop(0.5, "#181432");
        wingGrad.addColorStop(1, "#0A0716");

        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          isLeft ? -16 : 16, 12,
          isLeft ? -18 : 18, 30,
          isLeft ? -7 : 7, 42
        );
        ctx.bezierCurveTo(
          isLeft ? -1 : 1, 28,
          isLeft ? 4 : -4, 14,
          0, 0
        );
        ctx.closePath();
        ctx.fill();

        // Inner white flipper edge (Natural Emperor penguin anatomy)
        ctx.strokeStyle = "rgba(241, 245, 249, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          isLeft ? 4 : -4, 14,
          isLeft ? -1 : 1, 28,
          isLeft ? -7 : 7, 42
        );
        ctx.stroke();

        ctx.restore();
      };

      drawWing(true);
      drawWing(false);

      // ── Layer 5: Emperor Auricular Neck Patches (Vibrant Golden Glow) ──
      // Dynamic shift with perspective
      const neckShiftX = currentLookX * 5;

      const drawAuricularPatch = (isLeft: boolean) => {
        const patchX = (isLeft ? -22 : 22) + neckShiftX * 0.7;
        const patchY = -30 + currentLookY * 2;
        const tilt = isLeft ? -0.32 : 0.32;

        const patchGrad = ctx.createRadialGradient(patchX, patchY, 2, patchX, patchY, 13);
        patchGrad.addColorStop(0, "#FBBF24");
        patchGrad.addColorStop(0.5, "#F59E0B");
        patchGrad.addColorStop(0.85, "#EA580C");
        patchGrad.addColorStop(1, "rgba(234, 88, 12, 0)");

        ctx.fillStyle = patchGrad;
        ctx.beginPath();
        ctx.ellipse(patchX, patchY, 8, 14, tilt, 0, Math.PI * 2);
        ctx.fill();
      };

      drawAuricularPatch(true);
      drawAuricularPatch(false);

      // Golden Neck Crescent Band
      const neckArc = ctx.createLinearGradient(-18 + neckShiftX, -20, 18 + neckShiftX, -20);
      neckArc.addColorStop(0, "rgba(245, 158, 11, 0.95)");
      neckArc.addColorStop(0.5, "rgba(249, 115, 22, 0.9)");
      neckArc.addColorStop(1, "rgba(245, 158, 11, 0.95)");
      ctx.fillStyle = neckArc;
      ctx.beginPath();
      ctx.ellipse(neckShiftX, -20, 15, 7, 0, 0, Math.PI);
      ctx.fill();

      // ── Layer 6: Silky Snowy Belly (With 3D Curvature Perspective) ──
      const bellyX = currentLookX * 6;
      const bellyY = -24;

      const bellyGrad = ctx.createRadialGradient(
        bellyX - 6 + currentLookX * 8,
        bellyY + 10,
        10,
        bellyX,
        bellyY + 30,
        45
      );
      bellyGrad.addColorStop(0, "#FFFFFF");
      bellyGrad.addColorStop(0.7, "#F1F5F9");
      bellyGrad.addColorStop(0.9, "#E2E8F0");
      bellyGrad.addColorStop(1, "#CBD5E1");

      ctx.fillStyle = bellyGrad;
      ctx.beginPath();
      ctx.moveTo(bellyX, -24);
      ctx.bezierCurveTo(-26 + bellyX * 0.7, -18, -30 + bellyX * 0.4, 18, -22 + bellyX * 0.3, 46);
      ctx.bezierCurveTo(-12, 53, 12, 53, 22 + bellyX * 0.3, 46);
      ctx.bezierCurveTo(30 + bellyX * 0.4, 18, 26 + bellyX * 0.7, -18, bellyX, -24);
      ctx.closePath();
      ctx.fill();

      // Soft belly feather shading under chin
      const chinShadow = ctx.createLinearGradient(0, -24, 0, -14);
      chinShadow.addColorStop(0, "rgba(15, 23, 42, 0.2)");
      chinShadow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = chinShadow;
      ctx.beginPath();
      ctx.ellipse(bellyX, -21, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Outfit: Neck Accessories (Follows Body Space) ──
      if (outfit === "scholar") {
        // Crimson Silk Bow Tie with Gold Knot
        const bowX = currentLookX * 6;
        const bowY = -18;
        ctx.save();
        ctx.translate(bowX, bowY);
        ctx.rotate(currentLookX * 0.08);

        const bowGrad = ctx.createLinearGradient(-15, -7, 15, 7);
        bowGrad.addColorStop(0, "#EF4444");
        bowGrad.addColorStop(0.5, "#DC2626");
        bowGrad.addColorStop(1, "#B91C1C");
        ctx.fillStyle = bowGrad;

        // Left wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-13, -7);
        ctx.lineTo(-11, 7);
        ctx.closePath();
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(13, -7);
        ctx.lineTo(11, 7);
        ctx.closePath();
        ctx.fill();

        // Central Gold knot
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.ellipse(0, 0, 3.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (outfit === "headphones" || outfit === "scarf") {
        // Cozy Sky-Blue & Yellow Striped Winter Scarf
        const scarfX = currentLookX * 6;
        const scarfY = -17;
        ctx.save();
        ctx.translate(scarfX, scarfY);
        ctx.rotate(currentLookX * 0.05);

        // Main collar wrap loop
        const scarfGrad = ctx.createLinearGradient(-24, 0, 24, 0);
        scarfGrad.addColorStop(0, "#0284C7");
        scarfGrad.addColorStop(0.3, "#0EA5E9");
        scarfGrad.addColorStop(0.7, "#38BDF8");
        scarfGrad.addColorStop(1, "#0284C7");

        ctx.fillStyle = scarfGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 23, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Yellow Accent Stripes on collar
        ctx.strokeStyle = "#FDE047";
        ctx.lineWidth = 2.5;
        [-12, -4, 4, 12].forEach((stripeX) => {
          ctx.beginPath();
          ctx.moveTo(stripeX, -5);
          ctx.lineTo(stripeX + 2, 5);
          ctx.stroke();
        });

        // Hanging Scarf Tail (Sways gently with time & motion)
        const tailSway = Math.sin(time * 2.5) * 3 + currentLookX * 4;
        ctx.save();
        ctx.translate(7, 2);
        ctx.rotate(0.12 + tailSway * 0.03);

        ctx.fillStyle = "#0284C7";
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(8, 0);
        ctx.lineTo(6, 26);
        ctx.lineTo(-4, 26);
        ctx.closePath();
        ctx.fill();

        // Tail yellow stripes
        ctx.strokeStyle = "#FDE047";
        ctx.lineWidth = 2.2;
        [8, 16].forEach((stripeY) => {
          ctx.beginPath();
          ctx.moveTo(-4.5, stripeY);
          ctx.lineTo(6.5, stripeY);
          ctx.stroke();
        });

        // Scarf Fringe Tassels
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.2;
        for (let fx = -3; fx <= 5; fx += 2) {
          ctx.beginPath();
          ctx.moveTo(fx, 26);
          ctx.lineTo(fx, 31);
          ctx.stroke();
        }
        ctx.restore();

        ctx.restore();
      }

      // ── Layer 7: Articulated 3D Head Group (Follows Cursor Vector & Rhythmic Groove) ──
      let headTilt = 0;
      let headX = 0;
      let headY = 0;

      if (isDancing) {
        headTilt = Math.sin(dancePhase * 0.5) * 0.12 + Math.sin(dancePhase) * 0.04;
        headX = Math.sin(dancePhase * 0.5) * 4;
        headY = -38 + Math.sin(dancePhase) * 1.5;
      } else if (isAngryOrSad) {
        // Slow, clear, disapproving "tsk-tsk" head shake (gentle & rhythmic, no rapid twitch)
        const angryShake = Math.sin(time * 3.4) * 0.08;
        headTilt = curiosityTilt * 0.5 + currentLookX * 0.08 + angryShake;
        headX = currentLookX * 8;
        headY = -36 + currentLookY * 4;
      } else {
        headTilt = curiosityTilt + currentLookX * 0.14;
        headX = currentLookX * 11;
        headY = -38 + currentLookY * 6;
      }

      ctx.save();
      ctx.translate(headX, headY);
      ctx.rotate(headTilt);

      // ── Layer 8: Expressive Realistic Eyes (Dancing Smile / Skeptical Glare / Natural Look) ──
      const eyeSpacing = 13.5;
      const eyeY = -3;
      const eyeRadius = 7.5;
      const eyeScaleY = isAngryOrSad
        ? 0.55
        : isBlinking
        ? Math.max(0.06, 1 - Math.sin(blinkProgress))
        : 1;

      const drawExpressiveEye = (isLeft: boolean) => {
        const eyeX =
          (isLeft ? -eyeSpacing : eyeSpacing) +
          (isDancing ? Math.sin(dancePhase * 0.5) * 1.5 : currentLookX * 3);

        ctx.save();
        ctx.translate(eyeX, eyeY);

        if (isDancing) {
          // Cheerful dancing happy eye crescents (^ ^)
          ctx.strokeStyle = "#0F172A";
          ctx.lineWidth = 2.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(0, 1.5, eyeRadius * 0.85, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();

          // Cute twinkle glint above crescent
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(isLeft ? -2 : 2, -3, 1.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
          return;
        }

        ctx.scale(1, eyeScaleY);

        // Eye Socket Ambient Occlusion
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(0, 0.5, eyeRadius + 1.2, (eyeRadius + 1.2) * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sclera (White base with 3D spherical gradient)
        const scleraGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, eyeRadius);
        scleraGrad.addColorStop(0, "#FFFFFF");
        scleraGrad.addColorStop(0.85, "#F8FAFC");
        scleraGrad.addColorStop(1, "#E2E8F0");

        ctx.fillStyle = scleraGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, eyeRadius, eyeRadius * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = "#0F172A";
        ctx.stroke();

        // If eyes are open enough, render pupils & reflections
        if (!isBlinking || eyeScaleY > 0.35) {
          // Pupil tracking across spherical surface (skeptical glance if angry)
          const pupilLimitX = 3.6;
          const pupilLimitY = 3.2;
          const pupilX = isAngryOrSad
            ? currentLookX * 2.2 + (isLeft ? 0.8 : -0.8)
            : currentLookX * pupilLimitX;
          const pupilY = isAngryOrSad ? -1.0 : currentLookY * pupilLimitY;

          const pupilRadius = 3.8 + mouseProximity * 0.6;

          // Iris / Deep Pupil Gradient
          const irisGrad = ctx.createRadialGradient(
            pupilX - 0.5,
            pupilY - 0.5,
            0.5,
            pupilX,
            pupilY,
            pupilRadius
          );
          irisGrad.addColorStop(0, "#1E1B4B");
          irisGrad.addColorStop(0.65, "#0F172A");
          irisGrad.addColorStop(1, "#020617");

          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.arc(pupilX, pupilY, pupilRadius, 0, Math.PI * 2);
          ctx.fill();

          // Primary Specular Catchlight (Glint)
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(pupilX - 1.4, pupilY - 1.4, 1.45, 0, Math.PI * 2);
          ctx.fill();

          // Secondary Soft Glint (Brings character alive!)
          ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
          ctx.beginPath();
          ctx.arc(pupilX + 1.5, pupilY + 1.5, 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Subtle upper eyelid shadow over the eye
          ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
          ctx.beginPath();
          ctx.arc(0, -eyeRadius * 0.4, eyeRadius * 0.95, 0, Math.PI);
          ctx.fill();
        }

        ctx.restore();
      };

      drawExpressiveEye(true);
      drawExpressiveEye(false);

      // ── Angry / Disappointed Furrowed Eyebrows ──
      if (isAngryOrSad) {
        ctx.strokeStyle = "#0A0718";
        ctx.lineWidth = 3.2;
        ctx.lineCap = "round";

        // Left Eyebrow (slants aggressively down toward beak)
        ctx.beginPath();
        ctx.moveTo(-21 + currentLookX * 2, -13);
        ctx.lineTo(-6 + currentLookX * 2, -6.5);
        ctx.stroke();

        // Right Eyebrow (slants aggressively down toward beak)
        ctx.beginPath();
        ctx.moveTo(21 + currentLookX * 2, -13);
        ctx.lineTo(6 + currentLookX * 2, -6.5);
        ctx.stroke();
      }

      // ── Layer 9: Realistic 3D Emperor Beak (Mandible Shading & Glint) ──
      const beakCenterX = isDancing ? Math.sin(dancePhase * 0.5) * 2 : currentLookX * 4;
      const beakCenterY = 4 + (isDancing ? Math.sin(dancePhase) * 1 : currentLookY * 3);

      ctx.save();
      ctx.translate(beakCenterX, beakCenterY);

      // Dynamic Beak 3D Perspective Tilt
      const beakTilt = isDancing ? Math.sin(dancePhase * 0.5) * 0.1 : currentLookX * 0.12;
      ctx.rotate(beakTilt);

      // Upper Mandible (Sleek dark gunmetal horn, smiling if dancing, downturned if angry)
      const upperBeakGrad = ctx.createLinearGradient(0, -6, 0, 4);
      upperBeakGrad.addColorStop(0, "#27223D");
      upperBeakGrad.addColorStop(0.5, "#1B172E");
      upperBeakGrad.addColorStop(1, "#0E0B1A");

      ctx.fillStyle = upperBeakGrad;
      ctx.beginPath();
      if (isDancing) {
        // Happy open smiling / singing beak
        ctx.moveTo(-7.5, -1);
        ctx.quadraticCurveTo(0, -5, 7.5, -1);
        ctx.quadraticCurveTo(4, 9, 0, 15);
        ctx.quadraticCurveTo(-4, 9, -7.5, -1);
      } else if (isAngryOrSad) {
        // Disappointed downturned pouty frown
        ctx.moveTo(-7.5, 3);
        ctx.quadraticCurveTo(0, -2, 7.5, 3);
        ctx.quadraticCurveTo(4, 13, 0, 15);
        ctx.quadraticCurveTo(-4, 13, -7.5, 3);
      } else {
        ctx.moveTo(-7.5, -2);
        ctx.quadraticCurveTo(0, -6, 7.5, -2);
        ctx.quadraticCurveTo(5, 7, 0, 13);
        ctx.quadraticCurveTo(-5, 7, -7.5, -2);
      }
      ctx.closePath();
      ctx.fill();

      // Lower Mandible Emperor Penguin Orange-Coral Stripe
      const mandibleStripe = ctx.createLinearGradient(-6, 2, 6, 8);
      mandibleStripe.addColorStop(0, "#F59E0B");
      mandibleStripe.addColorStop(0.4, "#F97316");
      mandibleStripe.addColorStop(1, "#EA580C");

      ctx.fillStyle = mandibleStripe;
      ctx.beginPath();
      ctx.moveTo(-5.5, 1);
      ctx.lineTo(0, 11);
      ctx.lineTo(5.5, 1);
      ctx.quadraticCurveTo(0, 3, -5.5, 1);
      ctx.closePath();
      ctx.fill();

      // Sharp Specular Glint along upper beak ridge
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-1, -3);
      ctx.quadraticCurveTo(0, 3, 0, 9);
      ctx.stroke();

      ctx.restore(); // Beak restore

      // ── Layer 10: Rosy or Angry Cheeks & Steam ──
      if (isDancing) {
        // Vibrant celebration pink blush
        ctx.fillStyle = "rgba(244, 114, 182, 0.7)";
        ctx.beginPath();
        ctx.ellipse(-19, 2, 6, 3.5, -0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(19, 2, 6, 3.5, 0.12, 0, Math.PI * 2);
        ctx.fill();
      } else if (isAngryOrSad) {
        // Hot flustered red cheeks
        ctx.fillStyle = "rgba(239, 68, 68, 0.65)";
        ctx.beginPath();
        ctx.ellipse(-19, 2, 6.5, 3.8, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(19, 2, 6.5, 3.8, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Smooth gentle steam puffs floating slowly (no rapid flicker)
        const steamProgress = (time * 1.4) % 1;
        const puffAlpha = Math.max(0, 0.7 - steamProgress * 0.7);
        ctx.fillStyle = `rgba(255, 255, 255, ${puffAlpha})`;
        ctx.beginPath();
        ctx.arc(-22 - steamProgress * 6, -20 - steamProgress * 12, 2.5 + steamProgress * 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(22 + steamProgress * 6, -20 - steamProgress * 12, 2.5 + steamProgress * 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const blushIntensity = isHappy || excitedWaddle > 0 ? 0.5 : mouseProximity * 0.28;
        if (blushIntensity > 0.05) {
          ctx.fillStyle = `rgba(244, 114, 182, ${blushIntensity})`;
          ctx.beginPath();
          ctx.ellipse(-19, 2, 5.5, 3.2, -0.12, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(19, 2, 5.5, 3.2, 0.12, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Outfit: Head Accessories (Follows Head Group Rotation & Perspective) ──
      if (outfit === "scholar") {
        // ── 1. Snug Mortarboard Graduation Cap ──
        ctx.save();
        // 3D perspective shift with look vector
        const capX = currentLookX * 2;
        const capY = -23;
        ctx.translate(capX, capY);
        ctx.rotate(-0.05 + currentLookX * 0.06);

        // A. Snug Fabric Skullcap (wraps around the head dome)
        const capDomeGrad = ctx.createLinearGradient(0, 0, 0, 12);
        capDomeGrad.addColorStop(0, "#1E1B4B");
        capDomeGrad.addColorStop(0.6, "#130F30");
        capDomeGrad.addColorStop(1, "#0A0718");
        ctx.fillStyle = capDomeGrad;
        ctx.beginPath();
        ctx.moveTo(-21, 10);
        ctx.bezierCurveTo(-22, 2, -15, -3, 0, -3);
        ctx.bezierCurveTo(15, -3, 22, 2, 21, 10);
        ctx.quadraticCurveTo(0, 13, -21, 10);
        ctx.closePath();
        ctx.fill();

        // Golden Embroidered Forehead Rim
        ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-21, 10);
        ctx.quadraticCurveTo(0, 13, 21, 10);
        ctx.stroke();

        // B. Mortarboard Board 3D Thickness (Under-edge bevel for depth)
        const boardY = -3;
        const boardTilt = currentLookX * 0.03;
        ctx.save();
        ctx.translate(0, boardY);
        ctx.rotate(boardTilt);

        // Board Thickness / Bottom Edge
        ctx.fillStyle = "#0D0A1E";
        ctx.beginPath();
        ctx.moveTo(-27, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(27, 0);
        ctx.lineTo(27, 2.5);
        ctx.lineTo(0, 12.5);
        ctx.lineTo(-27, 2.5);
        ctx.closePath();
        ctx.fill();

        // Board Top Diamond Surface
        const boardGrad = ctx.createLinearGradient(-27, -9, 27, 9);
        boardGrad.addColorStop(0, "#312E81");
        boardGrad.addColorStop(0.35, "#25215A");
        boardGrad.addColorStop(0.7, "#1B1740");
        boardGrad.addColorStop(1, "#100C28");
        ctx.fillStyle = boardGrad;
        ctx.beginPath();
        ctx.moveTo(0, -9.5);
        ctx.lineTo(27, 0);
        ctx.lineTo(0, 9.5);
        ctx.lineTo(-27, 0);
        ctx.closePath();
        ctx.fill();

        // Board Edge Highlight
        ctx.strokeStyle = "rgba(129, 140, 248, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // C. Central Golden Button
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // D. Hanging Golden Braided Tassel
        const tasselSway = Math.sin(time * 3) * 3.5 + currentLookX * 5;
        // Ribbon across the board
        ctx.strokeStyle = "#FBBF24";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(10, 2, 20 + tasselSway * 0.3, 5);
        ctx.stroke();

        // Hanging Tassel Cord
        ctx.beginPath();
        ctx.moveTo(20 + tasselSway * 0.3, 5);
        ctx.quadraticCurveTo(22 + tasselSway * 0.6, 12, 22 + tasselSway, 21);
        ctx.stroke();

        // Tassel Ring
        ctx.fillStyle = "#D97706";
        ctx.beginPath();
        ctx.arc(22 + tasselSway, 21.5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tassel Fringe Brush
        const brushGrad = ctx.createLinearGradient(0, 22, 0, 31);
        brushGrad.addColorStop(0, "#F59E0B");
        brushGrad.addColorStop(1, "#D97706");
        ctx.fillStyle = brushGrad;
        ctx.beginPath();
        ctx.moveTo(20 + tasselSway, 22);
        ctx.lineTo(24 + tasselSway, 22);
        ctx.lineTo(26 + tasselSway, 31);
        ctx.lineTo(18 + tasselSway, 31);
        ctx.closePath();
        ctx.fill();

        ctx.restore(); // board restore
        ctx.restore(); // cap restore

        // ── 2. Developer Round Wireframe Glasses (Snug Fit Over Eyes) ──
        const glassY = eyeY;
        const glassRadius = eyeRadius + 1.8;
        const leftGlassX = -eyeSpacing + currentLookX * 3;
        const rightGlassX = eyeSpacing + currentLookX * 3;

        ctx.strokeStyle = "#F59E0B"; // Warm Gold Wireframes
        ctx.lineWidth = 1.7;

        // Left Rim
        ctx.beginPath();
        ctx.arc(leftGlassX, glassY, glassRadius, 0, Math.PI * 2);
        ctx.stroke();
        // Left Lens Glint
        ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
        ctx.beginPath();
        ctx.arc(leftGlassX - 2.2, glassY - 2.2, glassRadius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Right Rim
        ctx.beginPath();
        ctx.arc(rightGlassX, glassY, glassRadius, 0, Math.PI * 2);
        ctx.stroke();
        // Right Lens Glint
        ctx.beginPath();
        ctx.arc(rightGlassX - 2.2, glassY - 2.2, glassRadius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Nose Bridge Arcing over Beak
        ctx.beginPath();
        ctx.moveTo(leftGlassX + glassRadius, glassY - 0.5);
        ctx.quadraticCurveTo(0, glassY - 3.5, rightGlassX - glassRadius, glassY - 0.5);
        ctx.stroke();

        // Frame Temples
        ctx.beginPath();
        ctx.moveTo(leftGlassX - glassRadius, glassY);
        ctx.lineTo(leftGlassX - glassRadius - 7, glassY - 2.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightGlassX + glassRadius, glassY);
        ctx.lineTo(rightGlassX + glassRadius + 7, glassY - 2.5);
        ctx.stroke();
      } else if (outfit === "headphones") {
        // ── Ergonomic Over-Ear DJ Headphones (Snug Clamped Fit) ──
        ctx.save();

        // 1. Headband Assembly (Follows Crown Curvature)
        // A. Inner Cushion (Black leatherette resting on feathers)
        ctx.strokeStyle = "#0F172A";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-28, -10);
        ctx.bezierCurveTo(-27, -24, -14, -26.5, 0, -26.5);
        ctx.bezierCurveTo(14, -26.5, 27, -24, 28, -10);
        ctx.stroke();

        // B. Outer Metallic Headband Spring (Vibrant Purple)
        const bandGrad = ctx.createLinearGradient(-28, 0, 28, 0);
        bandGrad.addColorStop(0, "#6D28D9");
        bandGrad.addColorStop(0.3, "#8B5CF6");
        bandGrad.addColorStop(0.7, "#A855F7");
        bandGrad.addColorStop(1, "#6D28D9");
        ctx.strokeStyle = bandGrad;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-29, -11);
        ctx.bezierCurveTo(-28, -26, -14, -28.5, 0, -28.5);
        ctx.bezierCurveTo(14, -28.5, 28, -26, 29, -11);
        ctx.stroke();

        // C. Left and Right Ear Cups (Snug against cheek/temple at x = ±28, y = -6)
        const drawEarCup = (isLeft: boolean) => {
          const cupBaseX = isLeft ? -28.5 : 28.5;
          const cupBaseY = -6;
          // Perspective scale: cup facing viewer gets slightly larger
          const persScale = isLeft ? 1 - currentLookX * 0.12 : 1 + currentLookX * 0.12;
          const cupTilt = (isLeft ? -0.16 : 0.16) + currentLookX * 0.08;

          ctx.save();
          ctx.translate(cupBaseX, cupBaseY);
          ctx.rotate(cupTilt);
          ctx.scale(persScale, persScale);

          // 1. Metallic Slider Yoke (Connects headband to cup)
          ctx.strokeStyle = "#94A3B8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(0, -1);
          ctx.stroke();
          // Gimbal pivot circle
          ctx.fillStyle = "#CBD5E1";
          ctx.beginPath();
          ctx.arc(0, -1, 2, 0, Math.PI * 2);
          ctx.fill();

          // 2. Memory Foam Ear Cushion (Clamped against penguin head)
          const cushionGrad = ctx.createLinearGradient(isLeft ? -4 : 4, -8, isLeft ? 3 : -3, 8);
          cushionGrad.addColorStop(0, "#1E1B4B");
          cushionGrad.addColorStop(0.6, "#0F172A");
          cushionGrad.addColorStop(1, "#020617");
          ctx.fillStyle = cushionGrad;
          ctx.beginPath();
          ctx.ellipse(isLeft ? 2 : -2, 2, 5.5, 13.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // 3. Ear Cup Outer Shell (Curved Capsule)
          const shellGrad = ctx.createRadialGradient(
            isLeft ? -2 : 2,
            0,
            1,
            isLeft ? -1 : 1,
            2,
            11
          );
          shellGrad.addColorStop(0, "#C084FC");
          shellGrad.addColorStop(0.4, "#9333EA");
          shellGrad.addColorStop(0.85, "#6B21A8");
          shellGrad.addColorStop(1, "#3B0764");
          ctx.fillStyle = shellGrad;
          ctx.beginPath();
          ctx.ellipse(isLeft ? -2.5 : 2.5, 2, 6.5, 12.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Outer Chamfer Rim
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // 4. Glowing Neon Center Ring & Logo Plate (Red if angry, Gold if dancing, Cyan if normal)
          ctx.strokeStyle = isAngryOrSad ? "#EF4444" : isDancing ? "#F59E0B" : "#38BDF8";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.ellipse(isLeft ? -2.5 : 2.5, 2, 3.8, 7.5, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Center metallic badge
          ctx.fillStyle = "#1E1B4B";
          ctx.beginPath();
          ctx.ellipse(isLeft ? -2.5 : 2.5, 2, 2.5, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Specular glint
          ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
          ctx.beginPath();
          ctx.arc(isLeft ? -3.5 : 1.5, -0.5, 1.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        };

        drawEarCup(true);
        drawEarCup(false);

        ctx.restore();
      }

      ctx.restore(); // Head group restore
      ctx.restore(); // Main body restore
      ctx.restore(); // High-DPI restore

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [width, height, isHappy, outfit, mood]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center cursor-pointer select-none group transition-transform duration-300 hover:scale-105 active:scale-95 ${className}`}
      onClick={() => {
        setIsHappy(true);
        setTimeout(() => setIsHappy(false), 1000);
      }}
      title="Click me to play!"
    >
      <canvas ref={canvasRef} className="block pointer-events-auto" />
    </div>
  );
}

export default InteractiveCharacter;
