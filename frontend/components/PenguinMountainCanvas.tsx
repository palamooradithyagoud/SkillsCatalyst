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
    let cssWidth = canvas.parentElement?.clientWidth || window.innerWidth;
    let cssHeight = canvas.parentElement?.clientHeight || 300;

    // High-DPI screen support for crisp rendering
    const setupCanvasResolution = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const rect = canvas.parentElement.getBoundingClientRect();
      cssWidth = Math.ceil(rect.width || canvas.parentElement.clientWidth || window.innerWidth);
      cssHeight = Math.ceil(rect.height || canvas.parentElement.clientHeight || 300);

      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    setupCanvasResolution();
    window.addEventListener("resize", setupCanvasResolution);

    const resizeObserver = new ResizeObserver(() => {
      setupCanvasResolution();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

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
    const snowCount = 45;
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
        radius: Math.random() * 1.5 + 0.6,
        speedY: Math.random() * 0.7 + 0.25,
        speedX: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.55 + 0.25,
      });
    }

    let time = 0;

    // ── Helper: Draw a Penguin Facing TOWARDS US (Front View, Moving Forward) ──
    const drawForwardPenguin = (
      x: number,
      y: number,
      scale: number,
      animOffset: number = 0,
      headTilt: number = 0
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      const cycle = (time * 2.6 + animOffset);
      const waddleRoll = Math.sin(cycle) * 0.045;
      const bob = Math.abs(Math.sin(cycle)) * 1.6;
      const leftFootStep = Math.max(0, Math.sin(cycle)) * 2.4;
      const rightFootStep = Math.max(0, -Math.sin(cycle)) * 2.4;

      // Contact shadow under feet
      ctx.fillStyle = "rgba(75, 100, 130, 0.42)";
      ctx.beginPath();
      ctx.ellipse(0, 19 + bob * 0.4, 13, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Penguin body waddle transformation
      ctx.translate(0, -bob);
      ctx.rotate(waddleRoll);

      // Feet (facing forward towards us)
      // Left foot
      ctx.fillStyle = "#14161F";
      ctx.beginPath();
      ctx.ellipse(-6, 19 - leftFootStep, 4.5, 2.2, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFAA00";
      ctx.beginPath();
      ctx.ellipse(-6, 19.5 - leftFootStep, 2.2, 1.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right foot
      ctx.fillStyle = "#14161F";
      ctx.beginPath();
      ctx.ellipse(6, 19 - rightFootStep, 4.5, 2.2, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFAA00";
      ctx.beginPath();
      ctx.ellipse(6, 19.5 - rightFootStep, 2.2, 1.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark Back / Body Silhouette (Egg shape)
      const bodyGrad = ctx.createLinearGradient(-12, 0, 12, 0);
      bodyGrad.addColorStop(0, "#12141C");
      bodyGrad.addColorStop(0.5, "#202532");
      bodyGrad.addColorStop(1, "#101219");

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.bezierCurveTo(-14, -20, -15, 2, -12, 17);
      ctx.bezierCurveTo(-8, 20, 8, 20, 12, 17);
      ctx.bezierCurveTo(15, 2, 14, -20, 0, -22);
      ctx.closePath();
      ctx.fill();

      // Left Flipper (flapping at side as it walks towards us)
      const leftWingAngle = Math.sin(cycle) * 0.15 - 0.1;
      ctx.save();
      ctx.translate(-11, -8);
      ctx.rotate(leftWingAngle);
      ctx.fillStyle = "#151822";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-5, 6, -7, 16, -2, 22);
      ctx.bezierCurveTo(1, 16, 2, 8, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Right Flipper
      const rightWingAngle = -Math.sin(cycle) * 0.15 + 0.1;
      ctx.save();
      ctx.translate(11, -8);
      ctx.rotate(rightWingAngle);
      ctx.fillStyle = "#151822";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(5, 6, 7, 16, 2, 22);
      ctx.bezierCurveTo(-1, 16, -2, 8, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Crisp White Belly (facing towards us)
      const bellyGrad = ctx.createLinearGradient(0, -14, 0, 18);
      bellyGrad.addColorStop(0, "#FFFFFF");
      bellyGrad.addColorStop(0.85, "#F4F7FC");
      bellyGrad.addColorStop(1, "#E1E8F2");

      ctx.fillStyle = bellyGrad;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.bezierCurveTo(-9, -12, -9.5, 4, -7.5, 17);
      ctx.bezierCurveTo(-4, 18.5, 4, 18.5, 7.5, 17);
      ctx.bezierCurveTo(9.5, 4, 9, -12, 0, -14);
      ctx.closePath();
      ctx.fill();

      // Head
      ctx.save();
      ctx.translate(0, -22);
      ctx.rotate(headTilt);

      // Head black base
      ctx.fillStyle = "#0E1017";
      ctx.beginPath();
      ctx.ellipse(0, 0, 8.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden Auricular / Neck Patches on both sides
      ctx.fillStyle = "#FFB300";
      ctx.beginPath();
      ctx.ellipse(-6.5, 2, 2.5, 4, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(6.5, 2, 2.5, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Golden Neck Gradient Arc
      const neckArc = ctx.createLinearGradient(-6, 4, 6, 4);
      neckArc.addColorStop(0, "rgba(255, 170, 0, 0.95)");
      neckArc.addColorStop(0.5, "rgba(255, 120, 0, 0.85)");
      neckArc.addColorStop(1, "rgba(255, 170, 0, 0.95)");
      ctx.fillStyle = neckArc;
      ctx.beginPath();
      ctx.ellipse(0, 4.5, 5, 2.2, 0, 0, Math.PI);
      ctx.fill();

      // Cute Eyes (facing us)
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(-3.2, -1.5, 1.8, 2.2, 0, 0, Math.PI * 2);
      ctx.ellipse(3.2, -1.5, 1.8, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0C0E14";
      ctx.beginPath();
      ctx.arc(-3.0, -1.2, 1.1, 0, Math.PI * 2);
      ctx.arc(3.0, -1.2, 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight in eyes
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(-3.4, -1.8, 0.45, 0, Math.PI * 2);
      ctx.arc(2.6, -1.8, 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Orange Beak (centered, facing us)
      ctx.fillStyle = "#FF7A00";
      ctx.beginPath();
      ctx.moveTo(-2.2, 0.2);
      ctx.lineTo(2.2, 0.2);
      ctx.lineTo(0, 4.2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      ctx.restore();
    };

    const render = () => {
      time += 0.018;
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const width = cssWidth;
      const height = cssHeight;
      const isMobile = width < 640;
      const scaleRatio = isMobile ? Math.max(0.72, width / 520) : 1.0;

      ctx.clearRect(0, 0, width, height);

      // ── 1. SKY GRADIENT (Deep Purple into Sunset Peach) ──
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.58);
      sky.addColorStop(0, "#191424");
      sky.addColorStop(0.2, "#2E1C38");
      sky.addColorStop(0.42, "#5C2E4B");
      sky.addColorStop(0.68, "#9C4E65");
      sky.addColorStop(0.85, "#D88077");
      sky.addColorStop(0.96, "#F5B499");
      sky.addColorStop(1, "#FCE2D2");

      ctx.fillStyle = sky;
      ctx.fillRect(-10, -10, width + 30, height + 30);

      // Radiant Sunset Aura / Moon Glow in Upper Right
      const sunX = width * 0.74 + mouseX * 8;
      const sunY = height * 0.16 + mouseY * 5;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, width * 0.42);
      sunGrad.addColorStop(0, "rgba(255, 250, 240, 0.85)");
      sunGrad.addColorStop(0.25, "rgba(255, 215, 185, 0.35)");
      sunGrad.addColorStop(0.6, "rgba(200, 110, 120, 0.12)");
      sunGrad.addColorStop(1, "rgba(25, 20, 36, 0)");

      ctx.fillStyle = sunGrad;
      ctx.fillRect(-10, -10, width + 30, height * 0.65);

      // Subtle Dusk Cloud Bands
      ctx.fillStyle = "rgba(45, 25, 48, 0.32)";
      ctx.beginPath();
      ctx.ellipse(width * 0.22, height * 0.08, width * 0.35, 16 * scaleRatio, 0, 0, Math.PI * 2);
      ctx.ellipse(width * 0.65, height * 0.05, width * 0.28, 12 * scaleRatio, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(235, 150, 130, 0.2)";
      ctx.beginPath();
      ctx.ellipse(sunX - 15, sunY + 22, width * 0.26, 14 * scaleRatio, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. LOW-POLY GEOMETRIC MOUNTAIN RANGE (Matching Reference Art) ──
      const par2X = mouseX * 10;
      const par2Y = mouseY * 6;

      const peakX = width * 0.5 + par2X;
      const peakY = height * 0.16 + par2Y;
      const baseLineY = height * 0.55;

      // ── Background Dark Peaks (Faceted Silhouettes) ──
      ctx.fillStyle = "#1E1A29";
      ctx.beginPath();
      ctx.moveTo(-40, baseLineY);
      ctx.lineTo(width * 0.18 + par2X * 0.5, height * 0.28);
      ctx.lineTo(width * 0.38 + par2X * 0.5, height * 0.25);
      ctx.lineTo(width * 0.68 + par2X * 0.5, height * 0.2);
      ctx.lineTo(width * 0.88 + par2X * 0.5, height * 0.32);
      ctx.lineTo(width + 40, baseLineY);
      ctx.closePath();
      ctx.fill();

      // ── Left Angular Mountain Range ──
      // Peak 1 - Far Left Dark Face
      ctx.fillStyle = "#10131B";
      ctx.beginPath();
      ctx.moveTo(-30, baseLineY);
      ctx.lineTo(-30, height * 0.32);
      ctx.lineTo(width * 0.14 + par2X, height * 0.24);
      ctx.lineTo(width * 0.24 + par2X, height * 0.42);
      ctx.lineTo(width * 0.28 + par2X, baseLineY);
      ctx.closePath();
      ctx.fill();

      // Peak 1 - White Crystal Facet
      ctx.fillStyle = "#E4ECF7";
      ctx.beginPath();
      ctx.moveTo(width * 0.14 + par2X, height * 0.24);
      ctx.lineTo(width * 0.05 + par2X, height * 0.32);
      ctx.lineTo(width * 0.19 + par2X, height * 0.35);
      ctx.lineTo(width * 0.24 + par2X, height * 0.42);
      ctx.closePath();
      ctx.fill();

      // Peak 2 - Left Mid Triangular Facet (Dark)
      ctx.fillStyle = "#1A1E2B";
      ctx.beginPath();
      ctx.moveTo(width * 0.14 + par2X, height * 0.24);
      ctx.lineTo(width * 0.33 + par2X, height * 0.26);
      ctx.lineTo(width * 0.24 + par2X, height * 0.42);
      ctx.closePath();
      ctx.fill();

      // Peak 2 - Geometric White Diamond Shards
      ctx.fillStyle = "#F3F7FD";
      ctx.beginPath();
      ctx.moveTo(width * 0.33 + par2X, height * 0.26);
      ctx.lineTo(width * 0.28 + par2X, height * 0.34);
      ctx.lineTo(width * 0.34 + par2X, height * 0.55);
      ctx.lineTo(width * 0.38 + par2X, height * 0.4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#121520";
      ctx.beginPath();
      ctx.moveTo(width * 0.28 + par2X, height * 0.34);
      ctx.lineTo(width * 0.24 + par2X, height * 0.42);
      ctx.lineTo(width * 0.34 + par2X, height * 0.55);
      ctx.closePath();
      ctx.fill();

      // ── Central Summit Pyramid Peak (Goal Flag at Top) ──
      // Central Summit - Left Slate Blue Icy Facet
      const iceFacetGrad = ctx.createLinearGradient(peakX, peakY, width * 0.42 + par2X, baseLineY);
      iceFacetGrad.addColorStop(0, "#A5BBD6");
      iceFacetGrad.addColorStop(0.5, "#7E98B8");
      iceFacetGrad.addColorStop(1, "#5E7896");

      ctx.fillStyle = iceFacetGrad;
      ctx.beginPath();
      ctx.moveTo(peakX, peakY);
      ctx.lineTo(width * 0.38 + par2X, height * 0.4);
      ctx.lineTo(width * 0.43 + par2X, height * 0.52);
      ctx.lineTo(width * 0.47 + par2X, baseLineY);
      ctx.lineTo(peakX - 6 * scaleRatio, baseLineY);
      ctx.lineTo(peakX, peakY);
      ctx.closePath();
      ctx.fill();

      // Central Summit - Right Lit Peach / Ivory Facet
      const peachLitGrad = ctx.createLinearGradient(peakX, peakY, width * 0.58 + par2X, baseLineY);
      peachLitGrad.addColorStop(0, "#FFF7F0");
      peachLitGrad.addColorStop(0.4, "#FBE0D0");
      peachLitGrad.addColorStop(0.85, "#E8C0AB");
      peachLitGrad.addColorStop(1, "#CFA28C");

      ctx.fillStyle = peachLitGrad;
      ctx.beginPath();
      ctx.moveTo(peakX, peakY);
      ctx.lineTo(peakX - 6 * scaleRatio, baseLineY);
      ctx.lineTo(width * 0.54 + par2X, height * 0.53);
      ctx.lineTo(width * 0.58 + par2X, height * 0.38);
      ctx.lineTo(width * 0.65 + par2X, height * 0.48);
      ctx.lineTo(width * 0.6 + par2X, baseLineY);
      ctx.closePath();
      ctx.fill();

      // Central Shadow Crevasse
      ctx.fillStyle = "#181B26";
      ctx.beginPath();
      ctx.moveTo(peakX + 6 * scaleRatio, height * 0.24);
      ctx.lineTo(width * 0.53 + par2X, height * 0.42);
      ctx.lineTo(width * 0.51 + par2X, height * 0.52);
      ctx.lineTo(width * 0.54 + par2X, height * 0.53);
      ctx.lineTo(width * 0.58 + par2X, height * 0.38);
      ctx.closePath();
      ctx.fill();

      // ── Right Mountain Geometric Facets ──
      // Right Dark Peak Base
      ctx.fillStyle = "#222736";
      ctx.beginPath();
      ctx.moveTo(width * 0.58 + par2X, height * 0.38);
      ctx.lineTo(width * 0.68 + par2X, height * 0.2);
      ctx.lineTo(width * 0.76 + par2X, height * 0.42);
      ctx.lineTo(width * 0.65 + par2X, height * 0.48);
      ctx.closePath();
      ctx.fill();

      // Right Peach Crystal Triangle
      ctx.fillStyle = "#FCE7D8";
      ctx.beginPath();
      ctx.moveTo(width * 0.68 + par2X, height * 0.2);
      ctx.lineTo(width * 0.76 + par2X, height * 0.42);
      ctx.lineTo(width * 0.63 + par2X, height * 0.46);
      ctx.closePath();
      ctx.fill();

      // Right Far Ridge (Dark Navy Facets & Peach Highlights)
      ctx.fillStyle = "#181C28";
      ctx.beginPath();
      ctx.moveTo(width * 0.68 + par2X, height * 0.2);
      ctx.lineTo(width * 0.88 + par2X, height * 0.24);
      ctx.lineTo(width + 30, height * 0.28);
      ctx.lineTo(width + 30, baseLineY);
      ctx.lineTo(width * 0.65 + par2X, baseLineY);
      ctx.closePath();
      ctx.fill();

      // Right Geometric Accordion Highlight Facets
      ctx.fillStyle = "#FBD8C2";
      ctx.beginPath();
      ctx.moveTo(width * 0.88 + par2X, height * 0.24);
      ctx.lineTo(width * 0.82 + par2X, height * 0.34);
      ctx.lineTo(width * 0.94 + par2X, height * 0.32);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#F8ECE2";
      ctx.beginPath();
      ctx.moveTo(width * 0.94 + par2X, height * 0.32);
      ctx.lineTo(width * 0.88 + par2X, height * 0.42);
      ctx.lineTo(width * 0.98 + par2X, height * 0.38);
      ctx.closePath();
      ctx.fill();

      // ── 🚩 SUMMIT GOAL FLAG AT MOUNTAIN APEX ──
      const poleHeight = 28 * scaleRatio;
      const poleTopY = peakY - poleHeight;

      // Slender Flagpole
      ctx.strokeStyle = "#FDE3A7";
      ctx.lineWidth = 1.8 * scaleRatio;
      ctx.beginPath();
      ctx.moveTo(peakX, peakY + 2);
      ctx.lineTo(peakX, poleTopY);
      ctx.stroke();

      // Top Finial Ball
      ctx.fillStyle = "#FFF0BE";
      ctx.beginPath();
      ctx.arc(peakX, poleTopY, 2.2 * scaleRatio, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Neon Pink/Orange Goal Pennant Flag Waving
      const flagWave1 = Math.sin(time * 5.2) * 2.8 * scaleRatio;
      const flagWave2 = Math.cos(time * 5.2 + 1.2) * 3.2 * scaleRatio;
      const flagW = 26 * scaleRatio;

      const flagGrad = ctx.createLinearGradient(peakX, poleTopY, peakX + flagW, poleTopY + 12);
      flagGrad.addColorStop(0, "#FF007F");
      flagGrad.addColorStop(0.5, "#FF3399");
      flagGrad.addColorStop(1, "#FF9E00");

      ctx.fillStyle = flagGrad;
      ctx.beginPath();
      ctx.moveTo(peakX, poleTopY + 1.5);
      ctx.bezierCurveTo(
        peakX + 8 * scaleRatio,
        poleTopY + 2 + flagWave1,
        peakX + 16 * scaleRatio,
        poleTopY + 4 + flagWave2,
        peakX + flagW,
        poleTopY + 6 + flagWave1
      );
      ctx.lineTo(peakX + 16 * scaleRatio, poleTopY + 12 + flagWave2);
      ctx.bezierCurveTo(
        peakX + 10 * scaleRatio,
        poleTopY + 13 + flagWave2,
        peakX + 5 * scaleRatio,
        poleTopY + 11 + flagWave1,
        peakX,
        poleTopY + 13 * scaleRatio
      );
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // ── 3. SNOW PLAINS & FOREGROUND VALLEY ──
      const par3X = mouseX * 16;

      // Base Ice Blue Snow Field
      const snowGrad = ctx.createLinearGradient(0, height * 0.54, 0, height);
      snowGrad.addColorStop(0, "#CCDCEE");
      snowGrad.addColorStop(0.3, "#E2ECF7");
      snowGrad.addColorStop(0.6, "#F5F8FE");
      snowGrad.addColorStop(0.85, "#FFFFFF");
      snowGrad.addColorStop(1, "#FFFFFF");

      ctx.fillStyle = snowGrad;
      ctx.beginPath();
      ctx.moveTo(-10, height * 0.54);
      ctx.bezierCurveTo(width * 0.3, height * 0.53, width * 0.7, height * 0.54, width + 20, height * 0.55);
      ctx.lineTo(width + 20, height + 20);
      ctx.lineTo(-10, height + 20);
      ctx.closePath();
      ctx.fill();

      // Left Ice Depression / Lake (Where group of penguins resides)
      ctx.fillStyle = "rgba(180, 202, 228, 0.55)";
      ctx.beginPath();
      ctx.ellipse(width * 0.17 + par3X * 0.1, height * 0.68, Math.max(width * 0.27, 130 * scaleRatio), 32 * scaleRatio, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right Ice Depression / Lake
      ctx.fillStyle = "rgba(185, 208, 234, 0.45)";
      ctx.beginPath();
      ctx.ellipse(width * 0.86 + par3X * 0.1, height * 0.69, width * 0.24, 26 * scaleRatio, 0, 0, Math.PI * 2);
      ctx.fill();

      // Front Crisp White Snow Slope
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(-10, height * 0.73);
      ctx.bezierCurveTo(width * 0.35, height * 0.71, width * 0.65, height * 0.72, width + 20, height * 0.75);
      ctx.lineTo(width + 20, height + 20);
      ctx.lineTo(-10, height + 20);
      ctx.closePath();
      ctx.fill();

      // ── 4. 👥 GROUP OF PENGUINS (MOVING TOWARDS US / FACING VIEWER) ──
      // Expanded colony with natural depth-layering (back-to-front rendering)
      const groupBaseX = Math.max(45, width * 0.17 + par3X * 0.2);
      const groupBaseY = height * 0.73;
      const gScale = (isMobile ? 0.64 : 0.84) * scaleRatio;

      // ── Back Row Penguins ──
      // 1. Far Left Back Adult
      drawForwardPenguin(groupBaseX - 42 * scaleRatio, groupBaseY - 14 * scaleRatio, gScale * 0.78, 0.6, -0.06);
      // 2. Mid Left Back Adult
      drawForwardPenguin(groupBaseX - 22 * scaleRatio, groupBaseY - 16 * scaleRatio, gScale * 0.84, 1.9, 0.04);
      // 3. Center Back Adult
      drawForwardPenguin(groupBaseX + 6 * scaleRatio, groupBaseY - 17 * scaleRatio, gScale * 0.86, 3.2, -0.03);
      // 4. Right Back Observer
      drawForwardPenguin(groupBaseX + 32 * scaleRatio, groupBaseY - 12 * scaleRatio, gScale * 0.76, 4.5, 0.07);

      // ── Middle Row Penguins ──
      // 5. Left Middle Adult
      drawForwardPenguin(groupBaseX - 32 * scaleRatio, groupBaseY - 2 * scaleRatio, gScale * 0.94, 1.1, -0.04);
      // 6. Center Left Adult
      drawForwardPenguin(groupBaseX - 10 * scaleRatio, groupBaseY - 4 * scaleRatio, gScale * 1.02, 2.5, 0.02);
      // 7. Center Right Adult
      drawForwardPenguin(groupBaseX + 14 * scaleRatio, groupBaseY + 0 * scaleRatio, gScale * 0.96, 3.8, -0.05);
      // 8. Right Middle Adult
      drawForwardPenguin(groupBaseX + 38 * scaleRatio, groupBaseY + 3 * scaleRatio, gScale * 0.88, 5.1, 0.05);

      // ── Front Row (Young & Baby Penguins) ──
      // 9. Front Left Juvenile
      drawForwardPenguin(groupBaseX - 18 * scaleRatio, groupBaseY + 11 * scaleRatio, gScale * 0.82, 0.3, 0.06);
      // 10. Front Center Baby Chick (Adorable small waddler)
      drawForwardPenguin(groupBaseX + 2 * scaleRatio, groupBaseY + 14 * scaleRatio, gScale * 0.66, 2.1, -0.04);
      // 11. Front Right Baby Chick
      drawForwardPenguin(groupBaseX + 24 * scaleRatio, groupBaseY + 15 * scaleRatio, gScale * 0.62, 4.3, 0.05);

      // ── 🚶 3 PENGUINS IN A STRAIGHT LINE WALKING TOWARDS US (IN FRONT OF GROUP) ──
      const lineX = groupBaseX + 2 * scaleRatio;

      // Subtle footprint steps along their straight line path
      for (let s = 0; s < 6; s++) {
        const stepProg = s / 5;
        const footY = groupBaseY + (18 + stepProg * 36) * scaleRatio;
        const footSide = (s % 2 === 0 ? -1 : 1) * 3 * scaleRatio;
        ctx.fillStyle = "rgba(135, 160, 192, 0.28)";
        ctx.beginPath();
        ctx.ellipse(lineX + footSide, footY, 2.4 * scaleRatio, 1.3 * scaleRatio, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Line Penguin 1: Rear of the line (just in front of group)
      drawForwardPenguin(lineX, groupBaseY + 28 * scaleRatio, gScale * 0.86, 0.5, -0.02);

      // Line Penguin 2: Middle of the straight line
      drawForwardPenguin(lineX, groupBaseY + 44 * scaleRatio, gScale * 0.96, 2.0, 0.03);

      // Line Penguin 3: Lead Penguin at the very front marching towards us
      drawForwardPenguin(lineX, groupBaseY + 60 * scaleRatio, gScale * 1.06, 3.5, -0.02);

      // ── 5. 👣 REALISTIC FOOTPRINTS TRAIL (Leading to the Solo Penguin) ──
      const walkCycle = time * 2.0;
      const soloX = width * 0.5 + par3X * 0.15;
      const soloBob = Math.abs(Math.sin(walkCycle)) * 1.6 * scaleRatio;
      const soloY = height * 0.69 - soloBob;

      const steps = 11;
      for (let i = 0; i < steps; i++) {
        const prog = i / steps;
        const ty = height * 0.98 - prog * (height * 0.98 - (height * 0.69) - 10);
        const txOff = (i % 2 === 0 ? -1 : 1) * (2.8 * scaleRatio + prog * 1.8);
        const tx = width * 0.5 + txOff + (1 - prog) * (par3X * 0.06);
        const rx = (2.2 + (1 - prog) * 4.2) * scaleRatio;
        const ry = (1.1 + (1 - prog) * 2.2) * scaleRatio;

        // Footprint shadow depression
        ctx.fillStyle = `rgba(130, 155, 188, ${0.35 + (1 - prog) * 0.45})`;
        ctx.beginPath();
        ctx.ellipse(tx, ty, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Subtle snow rim highlight
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + (1 - prog) * 0.45})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(tx, ty + 0.6, rx * 0.8, ry * 0.5, 0, 0, Math.PI);
        ctx.stroke();
      }

      // ── 6. 🐧 SOLO PENGUIN (MOVING TOWARDS THE GOAL / MOUNTAIN PEAK) ──
      ctx.save();
      ctx.translate(soloX, soloY);
      ctx.scale(scaleRatio, scaleRatio);

      // Waddling roll as it hikes up toward the summit
      const soloWaddleRoll = Math.sin(walkCycle) * 0.035;
      ctx.rotate(soloWaddleRoll);

      // Soft ambient contact shadow under feet
      const soloShadowPulse = 18 + Math.sin(walkCycle) * 1.0;
      const soloShadow = ctx.createRadialGradient(0, 20, 2, 0, 20, soloShadowPulse + 4);
      soloShadow.addColorStop(0, "rgba(75, 98, 128, 0.75)");
      soloShadow.addColorStop(0.5, "rgba(110, 135, 168, 0.35)");
      soloShadow.addColorStop(1, "rgba(195, 218, 245, 0)");

      ctx.fillStyle = soloShadow;
      ctx.beginPath();
      ctx.ellipse(0, 20 + soloBob * 0.4, soloShadowPulse, 6.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // Walking feet stepping upwards (seen from behind)
      const leftLift = Math.max(0, -Math.sin(walkCycle)) * 2.2;
      const rightLift = Math.max(0, Math.sin(walkCycle)) * 2.2;

      // Left foot
      ctx.fillStyle = "#12141C";
      ctx.beginPath();
      ctx.ellipse(-7, 20 - leftLift, 4.2, 2.2, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Right foot
      ctx.fillStyle = "#12141C";
      ctx.beginPath();
      ctx.ellipse(7, 20 - rightLift, 4.2, 2.2, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Tail feathers (pointing back/down)
      ctx.fillStyle = "#0D0E15";
      ctx.beginPath();
      ctx.moveTo(-5, 18);
      ctx.lineTo(5, 18);
      ctx.lineTo(0, 24);
      ctx.closePath();
      ctx.fill();

      // Left Flipper / Wing (swaying with walk toward goal)
      const leftFlippSway = Math.sin(walkCycle) * 1.4;
      ctx.fillStyle = "#141720";
      ctx.beginPath();
      ctx.moveTo(-13, -15);
      ctx.bezierCurveTo(-22 - leftFlippSway, -2, -24 - leftFlippSway, 11, -16, 17);
      ctx.bezierCurveTo(-13, 14, -12, 2, -11, -7);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(160, 185, 215, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Right Flipper / Wing
      const rightFlippSway = -Math.sin(walkCycle) * 1.4;
      ctx.fillStyle = "#151822";
      ctx.beginPath();
      ctx.moveTo(13, -15);
      ctx.bezierCurveTo(22 + rightFlippSway, -2, 24 + rightFlippSway, 11, 16, 17);
      ctx.bezierCurveTo(13, 14, 12, 2, 11, -7);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 205, 175, 0.4)";
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Main Back Torso (Full sleek dark plumage seen from behind)
      const soloBody = ctx.createLinearGradient(-15, 0, 15, 0);
      soloBody.addColorStop(0, "#13161F");
      soloBody.addColorStop(0.3, "#212634");
      soloBody.addColorStop(0.7, "#1A1D27");
      soloBody.addColorStop(1, "#10121A");

      ctx.fillStyle = soloBody;
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.bezierCurveTo(-17, -26, -19, -2, -17, 19);
      ctx.bezierCurveTo(-13, 23, 13, 23, 17, 19);
      ctx.bezierCurveTo(19, -2, 17, -26, 0, -28);
      ctx.closePath();
      ctx.fill();

      // Subtle Center Spine Contour Shadow
      ctx.strokeStyle = "rgba(50, 60, 78, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
      ctx.stroke();

      // Head (Sleek solid black plumage head from behind, tilted towards mountain)
      const headGrad = ctx.createLinearGradient(-10, -32, 10, -32);
      headGrad.addColorStop(0, "#0D0F16");
      headGrad.addColorStop(0.5, "#1C202C");
      headGrad.addColorStop(1, "#0A0C12");

      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(0, -30.5, 10.5, 11.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Delicate ambient rim light on top of head from the sunset sky
      ctx.strokeStyle = "rgba(235, 180, 160, 0.35)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(0, -30.5, 10.5, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();

      ctx.restore();

      // ── 7. FLOATING SNOWFLAKES ──
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
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

