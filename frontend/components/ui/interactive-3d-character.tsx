"use client";

import React, { useEffect, useRef, useState } from "react";

export interface InteractiveCharacterProps {
  className?: string;
  width?: number;
  height?: number;
}

export function InteractiveCharacter({
  className = "",
  width = 240,
  height = 240,
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

    // Mouse tracking state
    let targetLookX = 0;
    let targetLookY = 0;
    let currentLookX = 0;
    let currentLookY = 0;

    // Blink state
    let isBlinking = false;
    let nextBlinkTime = Date.now() + 2500;
    let blinkProgress = 0;

    // Jump / interaction state
    let jumpY = 0;
    let jumpVy = 0;
    let isJumping = false;
    let happyWaddle = 0;

    // Resolution setup
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (e.clientX - centerX) / (window.innerWidth * 0.5);
      const dy = (e.clientY - centerY) / (window.innerHeight * 0.5);

      targetLookX = Math.max(-1, Math.min(1, dx));
      targetLookY = Math.max(-1, Math.min(1, dy));
    };

    const handleClick = () => {
      if (!isJumping) {
        isJumping = true;
        jumpVy = -6;
        happyWaddle = 1;
        isBlinking = true;
        blinkProgress = 0;
        setTimeout(() => {
          happyWaddle = 0;
        }, 800);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    const render = () => {
      time += 0.035;

      // Smooth lerp look coordinates
      currentLookX += (targetLookX - currentLookX) * 0.08;
      currentLookY += (targetLookY - currentLookY) * 0.08;

      // Handle Jump Physics
      if (isJumping) {
        jumpY += jumpVy;
        jumpVy += 0.45;
        if (jumpY >= 0) {
          jumpY = 0;
          jumpVy = 0;
          isJumping = false;
        }
      }

      // Handle Blinking
      const now = Date.now();
      if (!isBlinking && now >= nextBlinkTime) {
        isBlinking = true;
        blinkProgress = 0;
      }
      if (isBlinking) {
        blinkProgress += 0.15;
        if (blinkProgress >= Math.PI) {
          isBlinking = false;
          nextBlinkTime = now + 2500 + Math.random() * 3000;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Center base coordinates
      const cx = width / 2;
      const cy = height / 2 + 15 + jumpY;

      // Breathing bob & idle tilt
      const breathBob = Math.sin(time * 2) * 2;
      const breathScale = 1 + Math.sin(time * 2) * 0.015;
      const idleTilt = currentLookX * 0.12 + Math.sin(time * 1.5) * 0.03;

      // ── Layer 1: Contact Shadow ──
      const shadowScale = Math.max(0.4, 1 - Math.abs(jumpY) / 40);
      const shadowGrad = ctx.createRadialGradient(cx, cy + 50, 2, cx, cy + 50, 42 * shadowScale);
      shadowGrad.addColorStop(0, "rgba(10, 5, 25, 0.55)");
      shadowGrad.addColorStop(0.5, "rgba(80, 40, 160, 0.25)");
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 50, 40 * shadowScale, 11 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Main Penguin Transformation Group ──
      ctx.save();
      ctx.translate(cx, cy + breathBob);
      ctx.rotate(idleTilt);
      ctx.scale(breathScale, breathScale);

      // ── Layer 2: Feet (Cute bright orange pads) ──
      const footCycle = happyWaddle > 0 ? Math.sin(time * 15) * 3 : 0;

      // Left foot
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.ellipse(-18, 48 - footCycle, 11, 6, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#D97706";
      ctx.beginPath();
      ctx.ellipse(-18, 46 - footCycle, 8, 3.5, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Right foot
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.ellipse(18, 48 + footCycle, 11, 6, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#D97706";
      ctx.beginPath();
      ctx.ellipse(18, 46 + footCycle, 8, 3.5, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // ── Layer 3: Back Torso (Sleek dark gradient body) ──
      const bodyGrad = ctx.createLinearGradient(-35, -45, 35, 45);
      bodyGrad.addColorStop(0, "#1F1A3A");
      bodyGrad.addColorStop(0.35, "#15122B");
      bodyGrad.addColorStop(0.8, "#0B0818");
      bodyGrad.addColorStop(1, "#070510");

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(0, -52);
      // Top round head to wide egg belly
      ctx.bezierCurveTo(-38, -50, -42, 10, -32, 44);
      ctx.bezierCurveTo(-22, 52, 22, 52, 32, 44);
      ctx.bezierCurveTo(42, 10, 38, -50, 0, -52);
      ctx.closePath();
      ctx.fill();

      // Outer rim ambient light glow (Purple/Violet rim light)
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = "rgba(168, 85, 247, 0.35)";
      ctx.stroke();

      // ── Layer 4: Flippers (Wings) with dynamic flap ──
      const wingFlap = happyWaddle > 0 ? Math.sin(time * 18) * 0.4 : Math.sin(time * 1.5) * 0.06;
      const leftWingTilt = -0.15 + currentLookX * 0.1 - wingFlap;
      const rightWingTilt = 0.15 + currentLookX * 0.1 + wingFlap;

      // Left Wing
      ctx.save();
      ctx.translate(-30, -5);
      ctx.rotate(leftWingTilt);
      const leftWingGrad = ctx.createLinearGradient(-10, 0, 10, 30);
      leftWingGrad.addColorStop(0, "#1F1A3A");
      leftWingGrad.addColorStop(1, "#0D091D");
      ctx.fillStyle = leftWingGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-14, 10, -16, 28, -6, 38);
      ctx.bezierCurveTo(-1, 26, 3, 14, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Right Wing
      ctx.save();
      ctx.translate(30, -5);
      ctx.rotate(rightWingTilt);
      const rightWingGrad = ctx.createLinearGradient(10, 0, -10, 30);
      rightWingGrad.addColorStop(0, "#1F1A3A");
      rightWingGrad.addColorStop(1, "#0D091D");
      ctx.fillStyle = rightWingGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(14, 10, 16, 28, 6, 38);
      ctx.bezierCurveTo(1, 26, -3, 14, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ── Layer 5: Golden Emperor Penguin Neck Patches ──
      const goldPatchLeft = ctx.createLinearGradient(-26, -32, -12, -18);
      goldPatchLeft.addColorStop(0, "#F59E0B");
      goldPatchLeft.addColorStop(1, "#D97706");
      ctx.fillStyle = goldPatchLeft;
      ctx.beginPath();
      ctx.ellipse(-20, -25, 6.5, 11, -0.35, 0, Math.PI * 2);
      ctx.fill();

      const goldPatchRight = ctx.createLinearGradient(12, -18, 26, -32);
      goldPatchRight.addColorStop(0, "#D97706");
      goldPatchRight.addColorStop(1, "#F59E0B");
      ctx.fillStyle = goldPatchRight;
      ctx.beginPath();
      ctx.ellipse(20, -25, 6.5, 11, 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Golden Neck Arc
      const neckArc = ctx.createLinearGradient(-15, -16, 15, -16);
      neckArc.addColorStop(0, "rgba(245, 158, 11, 0.9)");
      neckArc.addColorStop(0.5, "rgba(234, 88, 12, 0.85)");
      neckArc.addColorStop(1, "rgba(245, 158, 11, 0.9)");
      ctx.fillStyle = neckArc;
      ctx.beginPath();
      ctx.ellipse(0, -16, 13, 6, 0, 0, Math.PI);
      ctx.fill();

      // ── Layer 6: Crisp White Plush Belly ──
      const bellyShiftX = currentLookX * 4;
      const bellyGrad = ctx.createLinearGradient(0, -20, 0, 42);
      bellyGrad.addColorStop(0, "#FFFFFF");
      bellyGrad.addColorStop(0.65, "#F8FAFC");
      bellyGrad.addColorStop(1, "#E2E8F0");

      ctx.fillStyle = bellyGrad;
      ctx.beginPath();
      ctx.moveTo(bellyShiftX, -22);
      ctx.bezierCurveTo(-22 + bellyShiftX * 0.7, -18, -25 + bellyShiftX * 0.5, 16, -19 + bellyShiftX * 0.3, 42);
      ctx.bezierCurveTo(-11, 48, 11, 48, 19 + bellyShiftX * 0.3, 42);
      ctx.bezierCurveTo(25 + bellyShiftX * 0.5, 16, 22 + bellyShiftX * 0.7, -18, bellyShiftX, -22);
      ctx.closePath();
      ctx.fill();

      // Soft Belly Shadow
      ctx.fillStyle = "rgba(148, 163, 184, 0.15)";
      ctx.beginPath();
      ctx.ellipse(bellyShiftX, 36, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Layer 7: Face & Interactive Eye Tracking ──
      const faceShiftX = currentLookX * 7;
      const faceShiftY = currentLookY * 4;

      const eyeRadius = 6.2;
      const pupilRadius = 3.2;
      const eyeSpacing = 11;
      const eyeY = -34 + faceShiftY;

      // Blink height factor
      const eyeScaleY = isBlinking ? Math.max(0.08, 1 - Math.sin(blinkProgress)) : 1;

      // Draw Left Eye
      const leftEyeX = -eyeSpacing + faceShiftX;
      ctx.save();
      ctx.translate(leftEyeX, eyeY);
      ctx.scale(1, eyeScaleY);

      // Sclera (White)
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeRadius, eyeRadius * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "#1E1B4B";
      ctx.stroke();

      if (!isBlinking || eyeScaleY > 0.4) {
        // Pupil (Follows Cursor Vector)
        const pupilOffsetX = currentLookX * 2.8;
        const pupilOffsetY = currentLookY * 2.4;
        ctx.fillStyle = "#0F172A";
        ctx.beginPath();
        ctx.arc(pupilOffsetX, pupilOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // Eye Catchlight Sparkle (Cute anime reflection)
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(pupilOffsetX - 1.1, pupilOffsetY - 1.1, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pupilOffsetX + 1.2, pupilOffsetY + 1.2, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Draw Right Eye
      const rightEyeX = eyeSpacing + faceShiftX;
      ctx.save();
      ctx.translate(rightEyeX, eyeY);
      ctx.scale(1, eyeScaleY);

      // Sclera (White)
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeRadius, eyeRadius * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "#1E1B4B";
      ctx.stroke();

      if (!isBlinking || eyeScaleY > 0.4) {
        // Pupil (Follows Cursor Vector)
        const pupilOffsetX = currentLookX * 2.8;
        const pupilOffsetY = currentLookY * 2.4;
        ctx.fillStyle = "#0F172A";
        ctx.beginPath();
        ctx.arc(pupilOffsetX, pupilOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // Eye Catchlight Sparkle
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(pupilOffsetX - 1.1, pupilOffsetY - 1.1, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pupilOffsetX + 1.2, pupilOffsetY + 1.2, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ── Layer 8: Penguin Beak (Smooth 3D Triangular Cone) ──
      const beakX = faceShiftX;
      const beakY = -27 + faceShiftY;

      // Top Beak Upper Shade
      const beakGrad = ctx.createLinearGradient(beakX, beakY - 3, beakX, beakY + 7);
      beakGrad.addColorStop(0, "#F59E0B");
      beakGrad.addColorStop(0.7, "#EA580C");
      beakGrad.addColorStop(1, "#C2410C");

      ctx.fillStyle = beakGrad;
      ctx.beginPath();
      ctx.moveTo(beakX - 5.5, beakY);
      ctx.quadraticCurveTo(beakX, beakY - 4, beakX + 5.5, beakY);
      ctx.lineTo(beakX, beakY + 9);
      ctx.closePath();
      ctx.fill();

      // Soft Beak Highlight
      ctx.fillStyle = "rgba(254, 240, 138, 0.45)";
      ctx.beginPath();
      ctx.moveTo(beakX - 3.5, beakY);
      ctx.lineTo(beakX, beakY - 2.5);
      ctx.lineTo(beakX + 1.5, beakY + 3);
      ctx.closePath();
      ctx.fill();

      // Cute Blush Cheeks on interaction
      const blushOpacity = isHappy || happyWaddle > 0 ? 0.45 : 0.15;
      ctx.fillStyle = `rgba(244, 114, 182, ${blushOpacity})`;
      ctx.beginPath();
      ctx.ellipse(-18 + faceShiftX, -23 + faceShiftY, 4.5, 2.5, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(18 + faceShiftX, -23 + faceShiftY, 4.5, 2.5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Main penguin group restore
      ctx.restore(); // High-dpi scale restore

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
      className={`relative flex items-center justify-center cursor-pointer select-none group ${className}`}
      onClick={() => {
        setIsHappy(true);
        setTimeout(() => setIsHappy(false), 900);
      }}
      title="Click me to waddle!"
    >
      <canvas ref={canvasRef} className="block pointer-events-auto" />
    </div>
  );
}

export default InteractiveCharacter;
