"use client";

import React, { useEffect, useRef } from "react";

interface PenguinMountainCanvasProps {
  className?: string;
}

export default function PenguinMountainCanvas({ className = "" }: PenguinMountainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let cssWidth = canvas.parentElement?.clientWidth || 600;
    let cssHeight = canvas.parentElement?.clientHeight || 700;

    // High-DPI screen support for crisp rendering
    const setupCanvasResolution = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      cssWidth = canvas.parentElement.clientWidth;
      cssHeight = canvas.parentElement.clientHeight;

      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    setupCanvasResolution();
    window.addEventListener("resize", setupCanvasResolution);

    // Mouse / Touch tracking for subtle parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / cssWidth - 0.5) * 2;
      targetMouseY = ((e.clientY - rect.top) / cssHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Snow particle system
    const snowCount = 50;
    const snowflakes: Array<{
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < snowCount; i++) {
      snowflakes.push({
        x: Math.random() * cssWidth,
        y: Math.random() * cssHeight,
        radius: Math.random() * 1.6 + 0.6,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.6 + 0.25,
      });
    }

    let time = 0;

    // Helper to draw a spectator penguin on the left side
    const drawSpectatorPenguin = (
      x: number,
      y: number,
      scale: number,
      facingAngle: number,
      isCheering: boolean = false
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Contact shadow
      ctx.fillStyle = "rgba(90, 115, 145, 0.55)";
      ctx.beginPath();
      ctx.ellipse(0, 18, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.rotate(facingAngle);

      // Back plumage
      const bodyGrad = ctx.createLinearGradient(-10, 0, 10, 0);
      bodyGrad.addColorStop(0, "#161922");
      bodyGrad.addColorStop(0.5, "#222733");
      bodyGrad.addColorStop(1, "#12141C");

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.bezierCurveTo(-14, -22, -15, 0, -12, 16);
      ctx.bezierCurveTo(-8, 20, 8, 20, 12, 16);
      ctx.bezierCurveTo(15, 0, 14, -22, 0, -24);
      ctx.closePath();
      ctx.fill();

      // White chest/belly in 3/4 view
      ctx.fillStyle = "#F2F6FC";
      ctx.beginPath();
      ctx.moveTo(2, -16);
      ctx.bezierCurveTo(8, -10, 10, 2, 7, 14);
      ctx.bezierCurveTo(4, 16, 0, 16, 0, 12);
      ctx.bezierCurveTo(2, 4, 1, -8, 2, -16);
      ctx.closePath();
      ctx.fill();

      // Golden auricular neck patch
      ctx.fillStyle = "#FFAA00";
      ctx.beginPath();
      ctx.ellipse(4, -18, 3.5, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = "#101218";
      ctx.beginPath();
      ctx.ellipse(2, -26, 8, 9, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Beak pointing toward center
      ctx.fillStyle = "#FF8A00";
      ctx.beginPath();
      ctx.moveTo(7, -26);
      ctx.lineTo(15, -25);
      ctx.lineTo(8, -23);
      ctx.closePath();
      ctx.fill();

      // Flipper
      const wingWave = isCheering ? Math.sin(time * 3.5) * 0.35 : 0;
      ctx.fillStyle = "#181A24";
      ctx.beginPath();
      if (isCheering) {
        ctx.moveTo(-6, -14);
        ctx.bezierCurveTo(-18, -25 + wingWave * 15, -16, -35 + wingWave * 15, -8, -20);
      } else {
        ctx.moveTo(-6, -14);
        ctx.bezierCurveTo(-16, -2, -15, 10, -8, 14);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      time += 0.02;
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const width = cssWidth;
      const height = cssHeight;
      const isMobile = width < 640;
      const scaleRatio = isMobile ? Math.max(0.72, width / 520) : 1.0;

      ctx.clearRect(0, 0, width, height);

      // ── 1. SKY GRADIENT (Sunset into Dusk) ──
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.65);
      sky.addColorStop(0, "#1F1B2C");
      sky.addColorStop(0.2, "#3E2A47");
      sky.addColorStop(0.45, "#7A435E");
      sky.addColorStop(0.7, "#BF6A6F");
      sky.addColorStop(0.88, "#E69B82");
      sky.addColorStop(1, "#FAD0B0");

      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Golden Sunset Aura Behind Mountain Peak
      const sunX = width * 0.74 + mouseX * 10;
      const sunY = height * 0.18 + mouseY * 6;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, width * 0.65);
      sunGrad.addColorStop(0, "rgba(255, 248, 235, 0.9)");
      sunGrad.addColorStop(0.2, "rgba(255, 205, 165, 0.45)");
      sunGrad.addColorStop(0.5, "rgba(191, 106, 111, 0.15)");
      sunGrad.addColorStop(1, "rgba(31, 27, 44, 0)");

      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height * 0.7);

      // Twilight Cloud Streaks
      ctx.fillStyle = "rgba(42, 28, 48, 0.35)";
      ctx.beginPath();
      ctx.ellipse(width * 0.25, height * 0.09, width * 0.45, 24 * scaleRatio, 0, 0, Math.PI * 2);
      ctx.ellipse(width * 0.8, height * 0.06, width * 0.35, 20 * scaleRatio, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(230, 155, 130, 0.22)";
      ctx.beginPath();
      ctx.ellipse(sunX - 25, sunY + 20, width * 0.32, 18 * scaleRatio, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. DISTANT SILHOUETTE PEAKS ──
      const par1X = mouseX * 5;
      const par1Y = mouseY * 3;

      ctx.fillStyle = "#4A3B54";
      ctx.beginPath();
      ctx.moveTo(-50, height * 0.55);
      const bgPeaks = [
        [0, 0.48],
        [0.12, 0.36],
        [0.24, 0.42],
        [0.4, 0.25],
        [0.55, 0.34],
        [0.68, 0.2],
        [0.82, 0.32],
        [0.95, 0.24],
        [1.1, 0.55],
      ];
      for (let i = 0; i < bgPeaks.length; i++) {
        ctx.lineTo(bgPeaks[i][0] * width + par1X, bgPeaks[i][1] * height + par1Y);
      }
      ctx.lineTo(width + 50, height * 0.65);
      ctx.lineTo(-50, height * 0.65);
      ctx.closePath();
      ctx.fill();

      // ── 3. MIDGROUND HIGH-FIDELITY MOUNTAINS ──
      const par2X = mouseX * 12;
      const par2Y = mouseY * 7;

      // Central Tall Peak
      const peakX = width * 0.5 + par2X;
      const peakY = height * 0.16 + par2Y;
      const peakBaseY = height * 0.64;

      // Left Shadow Face
      ctx.fillStyle = "#181B26";
      ctx.beginPath();
      ctx.moveTo(peakX, peakY);
      ctx.lineTo(width * 0.33 + par2X, height * 0.46);
      ctx.lineTo(width * 0.27 + par2X, height * 0.56);
      ctx.lineTo(width * 0.48 + par2X, peakBaseY);
      ctx.closePath();
      ctx.fill();

      // Right Sunlit Snow Face
      const litGrad = ctx.createLinearGradient(peakX, peakY, width * 0.68, peakBaseY);
      litGrad.addColorStop(0, "#FFF9F2");
      litGrad.addColorStop(0.4, "#FEDDC7");
      litGrad.addColorStop(0.8, "#D0DCED");
      litGrad.addColorStop(1, "#ADC1DE");

      ctx.fillStyle = litGrad;
      ctx.beginPath();
      ctx.moveTo(peakX, peakY);
      ctx.lineTo(width * 0.48 + par2X, peakBaseY);
      ctx.lineTo(width * 0.66 + par2X, height * 0.54);
      ctx.lineTo(width * 0.7 + par2X, height * 0.4);
      ctx.closePath();
      ctx.fill();

      // Detailed Snow Crags on Shadow Face
      ctx.fillStyle = "#8FA8CD";
      ctx.beginPath();
      ctx.moveTo(peakX, peakY);
      ctx.lineTo(peakX - 10 * scaleRatio, height * 0.25);
      ctx.lineTo(peakX - 4 * scaleRatio, height * 0.3);
      ctx.lineTo(peakX - 22 * scaleRatio, height * 0.39);
      ctx.lineTo(peakX - 14 * scaleRatio, height * 0.44);
      ctx.lineTo(peakX - 32 * scaleRatio, height * 0.52);
      ctx.lineTo(width * 0.33 + par2X, height * 0.46);
      ctx.closePath();
      ctx.fill();

      // Dark Rock Ridges on Lit Face
      ctx.fillStyle = "#26293A";
      ctx.beginPath();
      ctx.moveTo(peakX + 8 * scaleRatio, height * 0.24);
      ctx.lineTo(peakX + 20 * scaleRatio, height * 0.28);
      ctx.lineTo(peakX + 14 * scaleRatio, height * 0.33);
      ctx.lineTo(peakX + 34 * scaleRatio, height * 0.41);
      ctx.lineTo(peakX + 24 * scaleRatio, height * 0.45);
      ctx.lineTo(peakX + 46 * scaleRatio, height * 0.52);
      ctx.lineTo(width * 0.48 + par2X, peakBaseY);
      ctx.closePath();
      ctx.fill();

      // ── 🚩 SUMMIT FLAG ON THE MOUNTAIN PEAK ──
      const poleHeight = 26 * scaleRatio;
      const poleTopY = peakY - poleHeight;

      // Golden Flagpole
      ctx.strokeStyle = "#F6C774";
      ctx.lineWidth = 2 * scaleRatio;
      ctx.beginPath();
      ctx.moveTo(peakX, peakY + 2);
      ctx.lineTo(peakX, poleTopY);
      ctx.stroke();

      // Golden Peak Finial Ball
      ctx.fillStyle = "#FFE29A";
      ctx.beginPath();
      ctx.arc(peakX, poleTopY, 2.2 * scaleRatio, 0, Math.PI * 2);
      ctx.fill();

      // Waving Red/Hot-Pink Summit Flag Pennant
      const flagWave1 = Math.sin(time * 5.5) * 2.5 * scaleRatio;
      const flagWave2 = Math.cos(time * 5.5 + 1.2) * 3 * scaleRatio;
      const flagW = 24 * scaleRatio;

      const flagGrad = ctx.createLinearGradient(peakX, poleTopY, peakX + flagW, poleTopY + 12);
      flagGrad.addColorStop(0, "#EA008A");
      flagGrad.addColorStop(0.5, "#FF2E93");
      flagGrad.addColorStop(1, "#FFB703");

      ctx.fillStyle = flagGrad;
      ctx.beginPath();
      ctx.moveTo(peakX, poleTopY + 2);
      ctx.bezierCurveTo(
        peakX + 8 * scaleRatio,
        poleTopY + 2 + flagWave1,
        peakX + 16 * scaleRatio,
        poleTopY + 4 + flagWave2,
        peakX + flagW,
        poleTopY + 6 + flagWave1
      );
      ctx.lineTo(peakX + 18 * scaleRatio, poleTopY + 12 + flagWave2);
      ctx.bezierCurveTo(
        peakX + 13 * scaleRatio,
        poleTopY + 13 + flagWave2,
        peakX + 7 * scaleRatio,
        poleTopY + 11 + flagWave1,
        peakX,
        poleTopY + 14 * scaleRatio
      );
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Left Flanking Mountain Range
      ctx.fillStyle = "#141620";
      ctx.beginPath();
      ctx.moveTo(-30, height * 0.62);
      ctx.lineTo(-20, height * 0.32);
      ctx.lineTo(width * 0.12 + par2X, height * 0.24);
      ctx.lineTo(width * 0.22 + par2X, height * 0.34);
      ctx.lineTo(width * 0.33 + par2X, height * 0.26);
      ctx.lineTo(width * 0.44 + par2X, height * 0.52);
      ctx.lineTo(-30, height * 0.68);
      ctx.closePath();
      ctx.fill();

      // Left Snow Highlights
      ctx.fillStyle = "#E4EDF8";
      ctx.beginPath();
      ctx.moveTo(width * 0.12 + par2X, height * 0.24);
      ctx.lineTo(width * 0.05 + par2X, height * 0.32);
      ctx.lineTo(width * 0.14 + par2X, height * 0.3);
      ctx.lineTo(width * 0.22 + par2X, height * 0.34);
      ctx.lineTo(width * 0.17 + par2X, height * 0.4);
      ctx.lineTo(width * 0.33 + par2X, height * 0.26);
      ctx.lineTo(width * 0.26 + par2X, height * 0.44);
      ctx.lineTo(width * 0.38 + par2X, height * 0.4);
      ctx.lineTo(width * 0.34 + par2X, height * 0.55);
      ctx.closePath();
      ctx.fill();

      // Right Mountain Face
      ctx.fillStyle = "#1E2232";
      ctx.beginPath();
      ctx.moveTo(width + 30, height * 0.62);
      ctx.lineTo(width + 30, height * 0.14);
      ctx.lineTo(width * 0.88 + par2X, height * 0.2);
      ctx.lineTo(width * 0.76 + par2X, height * 0.3);
      ctx.lineTo(width * 0.68 + par2X, height * 0.26);
      ctx.lineTo(width * 0.56 + par2X, height * 0.52);
      ctx.lineTo(width + 30, height * 0.68);
      ctx.closePath();
      ctx.fill();

      // Right Sunset Snow Highlights
      const rightLit = ctx.createLinearGradient(width * 0.68, height * 0.2, width, height * 0.5);
      rightLit.addColorStop(0, "#FFF7EE");
      rightLit.addColorStop(0.5, "#FDD4BD");
      rightLit.addColorStop(1, "#B4C8E2");

      ctx.fillStyle = rightLit;
      ctx.beginPath();
      ctx.moveTo(width + 30, height * 0.14);
      ctx.lineTo(width * 0.94 + par2X, height * 0.26);
      ctx.lineTo(width * 0.88 + par2X, height * 0.2);
      ctx.lineTo(width * 0.83 + par2X, height * 0.36);
      ctx.lineTo(width * 0.76 + par2X, height * 0.3);
      ctx.lineTo(width * 0.71 + par2X, height * 0.42);
      ctx.lineTo(width * 0.68 + par2X, height * 0.26);
      ctx.lineTo(width * 0.62 + par2X, height * 0.46);
      ctx.closePath();
      ctx.fill();

      // Soft Valley Mist
      const mist = ctx.createLinearGradient(0, height * 0.45, 0, height * 0.64);
      mist.addColorStop(0, "rgba(230, 238, 250, 0)");
      mist.addColorStop(0.5, "rgba(240, 220, 230, 0.35)");
      mist.addColorStop(1, "rgba(245, 248, 255, 0.85)");

      ctx.fillStyle = mist;
      ctx.fillRect(0, height * 0.45, width, height * 0.22);

      // ── 4. FOREGROUND SNOW VALLEY ──
      const par3X = mouseX * 18;

      const snowGrad = ctx.createLinearGradient(0, height * 0.56, 0, height);
      snowGrad.addColorStop(0, "#D6E2F2");
      snowGrad.addColorStop(0.35, "#E7EFF9");
      snowGrad.addColorStop(0.65, "#F5F8FE");
      snowGrad.addColorStop(0.85, "#FFFFFF");
      snowGrad.addColorStop(1, "#FFFFFF");

      ctx.fillStyle = snowGrad;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.56);
      ctx.bezierCurveTo(width * 0.3, height * 0.54, width * 0.7, height * 0.55, width, height * 0.57);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Left Snow Dune Shadow
      ctx.fillStyle = "rgba(165, 185, 215, 0.45)";
      ctx.beginPath();
      ctx.moveTo(0, height * 0.62);
      ctx.bezierCurveTo(width * 0.32, height * 0.6, width * 0.48, height * 0.7, 0, height * 0.76);
      ctx.closePath();
      ctx.fill();

      // Right Snow Dune Shadow
      ctx.fillStyle = "rgba(175, 195, 222, 0.4)";
      ctx.beginPath();
      ctx.moveTo(width, height * 0.64);
      ctx.bezierCurveTo(width * 0.68, height * 0.62, width * 0.52, height * 0.72, width, height * 0.8);
      ctx.closePath();
      ctx.fill();

      // Front Pure White Snow Blanket (Ensures bottom transition is clean white)
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(0, height * 0.74);
      ctx.bezierCurveTo(width * 0.4, height * 0.7, width * 0.65, height * 0.71, width, height * 0.76);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // ── 👥 GROUP OF SPECTATOR PENGUINS (Exclusively on the Left Side Below) ──
      const leftBaseX = Math.max(25, width * 0.16 + par3X * 0.2);
      const leftBaseY = height * 0.72;
      const pScale = (isMobile ? 0.65 : 0.85) * scaleRatio;

      // Penguin 1: Senior Adult Observer
      drawSpectatorPenguin(leftBaseX, leftBaseY - 2, pScale * 1.0, 0.14, false);

      // Penguin 2: Attentive Adult Observer
      drawSpectatorPenguin(leftBaseX + 18 * scaleRatio, leftBaseY + 4, pScale * 0.95, 0.19, false);

      // Penguin 3: Cheering Adult waving flipper
      drawSpectatorPenguin(leftBaseX + 36 * scaleRatio, leftBaseY + 9, pScale * 0.88, 0.24, true);

      // Penguin 4: Curious Young Penguin
      drawSpectatorPenguin(leftBaseX + 52 * scaleRatio, leftBaseY + 14, pScale * 0.7, 0.28, false);

      // Penguin 5: Cute Little Baby Penguin waving
      drawSpectatorPenguin(leftBaseX + 10 * scaleRatio, leftBaseY + 13, pScale * 0.62, 0.18, true);

      // ── 5. REALISTIC PENGUIN FOOTPRINTS TRAIL ──
      const walkCycle = time * 1.8;
      const pengX = width * 0.5 + par3X * 0.2;
      const stepBob = Math.abs(Math.sin(walkCycle)) * 1.6 * scaleRatio;
      const pengY = height * 0.7 - stepBob;

      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const prog = i / steps;
        const ty = height * 0.98 - prog * (height * 0.98 - (height * 0.7) - 12);
        const txOff = (i % 2 === 0 ? -1 : 1) * (3 * scaleRatio + prog * 2);
        const tx = width * 0.5 + txOff + (1 - prog) * (par3X * 0.08);
        const rx = (2.2 + (1 - prog) * 4.5) * scaleRatio;
        const ry = (1.2 + (1 - prog) * 2.4) * scaleRatio;

        // Shadow indent
        ctx.fillStyle = `rgba(125, 150, 185, ${0.4 + (1 - prog) * 0.45})`;
        ctx.beginPath();
        ctx.ellipse(tx, ty, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snow rim highlight
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + (1 - prog) * 0.5})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(tx, ty + 0.8, rx * 0.8, ry * 0.6, 0, 0, Math.PI);
        ctx.stroke();
      }

      // ── 6. REALISTIC ACTIVE WALKING PENGUIN ──
      ctx.save();
      ctx.translate(pengX, pengY);
      ctx.scale(scaleRatio, scaleRatio);

      // Gentle Lifelike Waddling Sway
      const waddleRoll = Math.sin(walkCycle) * 0.028;
      ctx.rotate(waddleRoll);

      // Soft Contact Shadow
      const shadowPulse = 20 + Math.sin(walkCycle) * 1.2;
      const shadow = ctx.createRadialGradient(0, 22, 2, 0, 22, shadowPulse + 6);
      shadow.addColorStop(0, "rgba(80, 102, 132, 0.85)");
      shadow.addColorStop(0.5, "rgba(120, 145, 175, 0.4)");
      shadow.addColorStop(1, "rgba(200, 220, 245, 0)");

      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.ellipse(0, 22 + stepBob * 0.5, shadowPulse, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Walking Alternating Feet
      const leftFootLift = Math.max(0, -Math.sin(walkCycle)) * 2.2;
      const rightFootLift = Math.max(0, Math.sin(walkCycle)) * 2.2;

      // Left Dark Foot
      ctx.fillStyle = "#161820";
      ctx.beginPath();
      ctx.ellipse(-7, 21 - leftFootLift, 4.5, 2.5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Right Dark Foot
      ctx.fillStyle = "#161820";
      ctx.beginPath();
      ctx.ellipse(7, 21 - rightFootLift, 4.5, 2.5, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Tail Feathers
      ctx.fillStyle = "#101218";
      ctx.beginPath();
      ctx.moveTo(-5, 19);
      ctx.lineTo(5, 19);
      ctx.lineTo(0, 25);
      ctx.closePath();
      ctx.fill();

      // Left Flipper / Wing
      const leftWingSway = Math.sin(walkCycle) * 1.4;
      ctx.fillStyle = "#14161E";
      ctx.beginPath();
      ctx.moveTo(-14, -16);
      ctx.bezierCurveTo(-24 - leftWingSway, -2, -26 - leftWingSway, 12, -18, 18);
      ctx.bezierCurveTo(-14, 15, -13, 2, -12, -8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(175, 200, 230, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Right Flipper / Wing
      const rightWingSway = -Math.sin(walkCycle) * 1.4;
      ctx.fillStyle = "#161822";
      ctx.beginPath();
      ctx.moveTo(14, -16);
      ctx.bezierCurveTo(24 + rightWingSway, -2, 26 + rightWingSway, 12, 18, 18);
      ctx.bezierCurveTo(14, 15, 13, 2, 12, -8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 205, 175, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Main Torso
      const body = ctx.createLinearGradient(-16, 0, 16, 0);
      body.addColorStop(0, "#1A1D26");
      body.addColorStop(0.3, "#222733");
      body.addColorStop(0.7, "#1B1F28");
      body.addColorStop(1, "#12141C");

      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(0, -29);
      ctx.bezierCurveTo(-18, -27, -20, -2, -18, 20);
      ctx.bezierCurveTo(-14, 24, 14, 24, 18, 20);
      ctx.bezierCurveTo(20, -2, 18, -27, 0, -29);
      ctx.closePath();
      ctx.fill();

      // Spine Highlight
      ctx.strokeStyle = "rgba(55, 65, 82, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
      ctx.stroke();

      // Head Silhouette
      ctx.fillStyle = "#101218";
      ctx.beginPath();
      ctx.ellipse(0, -32, 11, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden Auricular Neck Collar
      const collar = ctx.createLinearGradient(-9, -27, 9, -27);
      collar.addColorStop(0, "#FFA500");
      collar.addColorStop(0.5, "#FF5500");
      collar.addColorStop(1, "#FFC000");

      ctx.fillStyle = collar;
      ctx.beginPath();
      ctx.ellipse(0, -25, 7.5, 3.2, 0, 0, Math.PI);
      ctx.fill();

      // Golden Auricular Ear Cheek Patches
      ctx.fillStyle = "rgba(255, 185, 35, 0.8)";
      ctx.beginPath();
      ctx.ellipse(-9, -33, 2.2, 4, -0.3, 0, Math.PI * 2);
      ctx.ellipse(9, -33, 2.2, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ── 7. FLOATING SNOW PARTICLES ──
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < snowflakes.length; i++) {
        const flake = snowflakes[i];
        flake.y += flake.speedY;
        flake.x += flake.speedX + Math.sin(time + i) * 0.25;

        if (flake.y > height) {
          flake.y = -10;
          flake.x = Math.random() * width;
        }
        if (flake.x > width) flake.x = 0;
        if (flake.x < 0) flake.x = width;

        ctx.globalAlpha = flake.opacity;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius * scaleRatio, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", setupCanvasResolution);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
