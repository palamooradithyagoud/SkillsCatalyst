"use client";

import React, { useEffect, useRef, useState } from "react";

export interface InteractiveCharacterProps {
  className?: string;
  width?: number;
  height?: number;
}

export function InteractiveCharacter({
  className = "",
  width = 260,
  height = 260,
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Center baseline coordinates
      const cx = width / 2;
      const cy = height / 2 + 18 + jumpY;

      // Organic breathing bob & idle waddle
      const breathBob = Math.sin(time * 2.2) * 2.2;
      const breathScale = 1 + Math.sin(time * 2.2) * 0.018;
      const bodyWaddle = Math.sin(time * 2.2) * 0.025 + currentLookX * 0.08;

      // ── Layer 1: Multi-tier 3D Ambient Contact Shadow ──
      const shadowCompression = Math.max(0.35, 1 - Math.abs(jumpY) / 45);
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
        const footStep = isLeft ? -waddleCycle : waddleCycle;
        const footAngle = (isLeft ? -0.18 : 0.18) + currentLookX * 0.08;

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

      // ── Layer 4: 3D Articulated Flippers (Wings React to Cursor) ──
      const drawWing = (isLeft: boolean) => {
        const wingBaseX = isLeft ? -33 : 33;
        const excitedFlutter = excitedWaddle > 0 ? Math.sin(time * 20) * 0.4 : 0;
        const proximityWave = mouseProximity * (isLeft ? -currentLookX : currentLookX) * 0.22;
        const idleWave = Math.sin(time * 2.2 + (isLeft ? 0 : Math.PI)) * 0.06;

        const wingAngle =
          (isLeft ? -0.2 : 0.2) +
          currentLookX * 0.12 +
          excitedFlutter +
          proximityWave +
          idleWave;

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

      // ── Layer 7: Articulated 3D Head Group (Follows Cursor Vector) ──
      const headX = currentLookX * 11;
      const headY = -38 + currentLookY * 6;
      const headTilt = curiosityTilt + currentLookX * 0.14;

      ctx.save();
      ctx.translate(headX, headY);
      ctx.rotate(headTilt);

      // ── Layer 8: Expressive Realistic Eyes ──
      const eyeSpacing = 13.5;
      const eyeY = -3;
      const eyeRadius = 7.5;
      const eyeScaleY = isBlinking ? Math.max(0.06, 1 - Math.sin(blinkProgress)) : 1;

      const drawExpressiveEye = (isLeft: boolean) => {
        const eyeX = (isLeft ? -eyeSpacing : eyeSpacing) + currentLookX * 3;

        ctx.save();
        ctx.translate(eyeX, eyeY);
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
          // Pupil tracking across spherical surface
          const pupilLimitX = 3.6;
          const pupilLimitY = 3.2;
          const pupilX = currentLookX * pupilLimitX;
          const pupilY = currentLookY * pupilLimitY;

          // Pupil dilation increases slightly when close to cursor
          const pupilRadius = 3.8 + mouseProximity * 0.6;

          // Iris / Deep Pupil Gradient
          const irisGrad = ctx.createRadialGradient(pupilX - 0.5, pupilY - 0.5, 0.5, pupilX, pupilY, pupilRadius);
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

      // ── Layer 9: Realistic 3D Emperor Beak (Mandible Shading & Glint) ──
      const beakCenterX = currentLookX * 4;
      const beakCenterY = 4 + currentLookY * 3;

      ctx.save();
      ctx.translate(beakCenterX, beakCenterY);

      // Dynamic Beak 3D Perspective Tilt
      const beakTilt = currentLookX * 0.12;
      ctx.rotate(beakTilt);

      // Upper Mandible (Sleek dark gunmetal horn)
      const upperBeakGrad = ctx.createLinearGradient(0, -6, 0, 4);
      upperBeakGrad.addColorStop(0, "#27223D");
      upperBeakGrad.addColorStop(0.5, "#1B172E");
      upperBeakGrad.addColorStop(1, "#0E0B1A");

      ctx.fillStyle = upperBeakGrad;
      ctx.beginPath();
      ctx.moveTo(-7.5, -2);
      ctx.quadraticCurveTo(0, -6, 7.5, -2);
      ctx.quadraticCurveTo(5, 7, 0, 13);
      ctx.quadraticCurveTo(-5, 7, -7.5, -2);
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

      // ── Layer 10: Soft Rosy Cheeks when Happy or Hovered ──
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
  }, [width, height, isHappy]);

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
