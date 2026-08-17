"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Trophy,
  Sparkles,
  Mountain,
  ArrowLeft,
  GraduationCap,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  Zap,
  Star,
  BookOpen,
  Compass,
  Flame,
  MousePointerClick,
  Layers,
} from "lucide-react";

export interface CheckpointItem {
  id: string;
  index: number;
  title: string;
  subtitle?: string;
  isCompleted: boolean;
  isCurrentTarget: boolean;
  nodesCount: number;
  completedNodesCount: number;
}

export interface SubtopicGroup {
  groupName?: string;
  topics: {
    id: string;
    name: string;
    isRecommended?: boolean;
    isAlternative?: boolean;
    isOrderNotStrict?: boolean;
    docUrl?: string;
    desc?: string;
  }[];
}

export interface NodeTreeBranches {
  description: string;
  groups: SubtopicGroup[];
}

export interface PenguinRoadmapMountainExpeditionProps {
  roadmapTitle: string;
  roadmapId: string;
  category: "skill" | "career";
  ratings?: string;
  salary?: string;
  checkpoints: CheckpointItem[];
  progressPct: number;
  isEnrolled: boolean;
  onEnroll: () => void;
  onBack: () => void;
  onToggleCheckpoint: (checkpoint: CheckpointItem) => void;
  onToggleSubtopic: (subtopicId: string, nodeName: string) => void;
  completedSubtopics: Record<string, boolean>;
  getSubtopicsForNode: (nodeName: string, roadmapId?: string) => NodeTreeBranches;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Snowflake {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  size: number;
  alpha: number;
}

export default function PenguinRoadmapMountainExpedition({
  roadmapTitle,
  roadmapId,
  category,
  checkpoints,
  progressPct,
  isEnrolled,
  onEnroll,
  onBack,
  onToggleCheckpoint,
  onToggleSubtopic,
  completedSubtopics,
  getSubtopicsForNode,
}: PenguinRoadmapMountainExpeditionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const totalCheckpoints = checkpoints.length || 1;
  const completedCount = checkpoints.filter((c) => c.isCompleted).length;
  const currentTargetIndex = Math.min(completedCount, totalCheckpoints - 1);

  const [activeViewIndex, setActiveViewIndex] = useState<number>(currentTargetIndex);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalCheckpoint, setModalCheckpoint] = useState<CheckpointItem | null>(null);

  // Sync active view index when current target changes
  useEffect(() => {
    setActiveViewIndex(currentTargetIndex);
  }, [currentTargetIndex]);

  // Responsive node spacing
  const getNodeSpacing = (width: number) => (width < 640 ? 240 : 360);

  // Penguin Animation & Physics State
  const penguinStateRef = useRef({
    worldX: currentTargetIndex * 360,
    targetWorldX: currentTargetIndex * 360,
    worldY: 330,
    isWalking: false,
    facingRight: true,
    walkFrame: 0,
    jumpY: 0,
    jumpVy: 0,
    isJumping: false,
    squashY: 1,
    squashX: 1,
    lastFootstepStep: 0,
  });

  const cameraXRef = useRef(currentTargetIndex * 360);
  const particlesRef = useRef<Particle[]>([]);
  const snowflakesRef = useRef<Snowflake[]>([]);

  // Update target position when active target index or view changes
  useEffect(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 900;
    const spacing = getNodeSpacing(width);
    const targetX = currentTargetIndex * spacing;
    if (Math.abs(penguinStateRef.current.targetWorldX - targetX) > 1) {
      penguinStateRef.current.targetWorldX = targetX;
      penguinStateRef.current.isWalking = true;
      penguinStateRef.current.facingRight = targetX >= penguinStateRef.current.worldX;
    }
  }, [currentTargetIndex]);

  // Jump camera to specific checkpoint when clicked from All Stations strip
  const handleJumpToStation = (cp: CheckpointItem) => {
    setActiveViewIndex(cp.index);
    setModalCheckpoint(cp);
    setIsModalOpen(true);
  };

  // Handle completing checkpoint & triggering cartoon walk to next node
  const handleCompleteCurrent = useCallback(
    (cp: CheckpointItem) => {
      onToggleCheckpoint(cp);

      // Create burst of victory star & confetti particles
      for (let i = 0; i < 28; i++) {
        const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5);
        const speed = Math.random() * 5 + 3.5;
        particlesRef.current.push({
          x: penguinStateRef.current.worldX,
          y: penguinStateRef.current.worldY - 38,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          size: Math.random() * 6 + 3,
          color: i % 3 === 0 ? "#FDE047" : i % 3 === 1 ? "#34D399" : "#38BDF8",
          alpha: 1,
          life: 0,
          maxLife: 50,
        });
      }

      // Celebratory Joy Jump
      penguinStateRef.current.jumpVy = -8.0;
      penguinStateRef.current.isJumping = true;

      // Close modal
      setIsModalOpen(false);
    },
    [onToggleCheckpoint]
  );

  // Subtopics data for the currently inspected checkpoint in modal
  const activeSubtopicsData = useMemo(() => {
    if (!modalCheckpoint) return null;
    return getSubtopicsForNode(modalCheckpoint.title, roadmapId);
  }, [modalCheckpoint, roadmapId, getSubtopicsForNode]);

  // Check if all subtopics for current modal checkpoint are done
  const areAllModalSubtopicsDone = useMemo(() => {
    if (!activeSubtopicsData) return false;
    const allTopics = activeSubtopicsData.groups.flatMap((g) => g.topics);
    if (allTopics.length === 0) return false;
    return allTopics.every((t) => !!completedSubtopics[t.id]);
  }, [activeSubtopicsData, completedSubtopics]);

  // Main 60fps Side-View Cartoon Canvas Game Loop with Click Hit-Testing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let cssWidth = canvas.parentElement?.clientWidth || 900;
    let cssHeight = cssWidth < 640 ? 360 : 450;

    // Initialize snowflakes
    if (snowflakesRef.current.length === 0) {
      snowflakesRef.current = Array.from({ length: 35 }).map(() => ({
        x: Math.random() * cssWidth,
        y: Math.random() * cssHeight,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: Math.random() * 0.4 - 0.2,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.6 + 0.3,
      }));
    }

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = canvas.parentElement.clientWidth || 900;
      const isMobile = cssWidth < 640;
      cssHeight = isMobile ? 360 : 450;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = `${cssHeight}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Responsive helper functions
    const getSpacing = () => (cssWidth < 640 ? 240 : 360);
    const getBaseY = () => (cssWidth < 640 ? 275 : 330);

    // Terrain ground elevation function (undulating cartoon alpine slope)
    const getGroundY = (wx: number) => {
      const spacing = getSpacing();
      const baseY = getBaseY();
      const slopeRise = (wx / (totalCheckpoints * spacing || 1)) * 95;
      const hillWave = Math.sin(wx * 0.006) * 14 + Math.cos(wx * 0.014) * 8;
      return baseY - slopeRise + hillWave;
    };

    // Canvas click handler: Click on ANY topic milestone across the entire world
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const camX = cameraXRef.current;
      const screenCenterX = cssWidth * 0.5;
      const spacing = getSpacing();

      for (let idx = 0; idx < totalCheckpoints; idx++) {
        const cp = checkpoints[idx];
        const wx = idx * spacing;
        const wy = getGroundY(wx);
        const sx = wx - camX + screenCenterX;

        // Hit box covering the milestone pole, stage, and banner
        const hitRadius = cssWidth < 640 ? 75 : 95;
        const hitLeft = sx - hitRadius;
        const hitRight = sx + hitRadius;
        const hitTop = wy - 115;
        const hitBottom = wy + 20;

        if (clickX >= hitLeft && clickX <= hitRight && clickY >= hitTop && clickY <= hitBottom) {
          setActiveViewIndex(idx);
          setModalCheckpoint(cp);
          setIsModalOpen(true);
          break;
        }
      }
    };

    canvas.addEventListener("click", handleCanvasClick);

    // High-polish cartoon side-view penguin walk cycle
    const drawCartoonPenguin = (
      px: number,
      py: number,
      facingRight: boolean,
      walkCycle: number,
      isWalking: boolean,
      jumpOffset: number,
      squashX: number,
      squashY: number
    ) => {
      ctx.save();
      ctx.translate(px, py + jumpOffset);
      if (!facingRight) ctx.scale(-1, 1);
      const isMobile = cssWidth < 640;
      const scale = isMobile ? 0.85 : 1.0;
      ctx.scale(squashX * scale, squashY * scale);

      // Natural contrapposto animation curves
      const stepSin = isWalking ? Math.sin(walkCycle * 14) : 0;
      const stepCos = isWalking ? Math.cos(walkCycle * 14) : 0;
      const bodyWaddle = isWalking ? stepSin * 0.09 : Math.sin(walkCycle * 2) * 0.02;
      const breathe = Math.sin(walkCycle * 3.5) * 1.5;

      ctx.rotate(bodyWaddle);

      // Contact Ground Shadow with elastic squash
      ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
      ctx.beginPath();
      const shadowW = Math.max(10, 18 - Math.abs(jumpOffset) * 0.25);
      ctx.ellipse(0, 8 - jumpOffset * 0.15, shadowW, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Back Leg & Webbed Foot
      ctx.save();
      const backLegHipX = -5;
      const backLegHipY = 2;
      const backLegAngle = isWalking ? -stepSin * 0.55 : 0;
      const backLegLift = isWalking ? Math.max(0, -stepCos) * 4 : 0;

      ctx.translate(backLegHipX, backLegHipY);
      ctx.rotate(backLegAngle);
      ctx.fillStyle = "#EA580C";
      ctx.beginPath();
      ctx.roundRect(-4, -backLegLift, 11, 6, 3);
      ctx.fill();
      ctx.restore();

      // Emerald Alpine Rucksack
      ctx.fillStyle = "#059669";
      ctx.beginPath();
      ctx.roundRect(-17, -21 + breathe, 10, 18, 4);
      ctx.fill();
      ctx.strokeStyle = "#34D399";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Golden Sleeping Roll
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.roundRect(-16, -25 + breathe, 8, 4.5, 2);
      ctx.fill();

      // Torso Outer Body
      ctx.fillStyle = "#0F172A";
      ctx.beginPath();
      ctx.moveTo(-8, -25 + breathe);
      ctx.bezierCurveTo(-15, -21, -15, 3, -6, 7);
      ctx.bezierCurveTo(0, 9, 9, 9, 12, 5);
      ctx.bezierCurveTo(16, -4, 15, -23, 6, -27 + breathe);
      ctx.closePath();
      ctx.fill();

      // Pearlescent White Belly
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(3, -21 + breathe);
      ctx.bezierCurveTo(12, -17, 13, -1, 10, 5);
      ctx.bezierCurveTo(4, 7, -1, 6, -1, -3);
      ctx.bezierCurveTo(-1, -15, 1, -20, 3, -21 + breathe);
      ctx.closePath();
      ctx.fill();

      // Cartoon Eye
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(6.5, -21 + breathe, 4.5, 5.5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0F172A";
      ctx.beginPath();
      ctx.arc(8, -21 + breathe, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(8.8, -22.5 + breathe, 1.2, 0, Math.PI * 2);
      ctx.arc(7.2, -19.5 + breathe, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Orange Beak
      ctx.fillStyle = "#F97316";
      ctx.beginPath();
      ctx.moveTo(10, -19 + breathe);
      ctx.lineTo(20, -16 + breathe);
      ctx.lineTo(10, -13 + breathe);
      ctx.closePath();
      ctx.fill();

      // Crimson Scarf
      ctx.fillStyle = "#DC2626";
      ctx.beginPath();
      ctx.roundRect(-4, -16 + breathe, 14, 5.5, 2.5);
      ctx.fill();

      const scarfWave = isWalking ? Math.sin(walkCycle * 14) * 4 : Math.sin(walkCycle * 3) * 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, -14 + breathe);
      ctx.lineTo(-14, -11 + breathe + scarfWave);
      ctx.lineTo(-13, -5 + breathe + scarfWave);
      ctx.lineTo(-4, -10 + breathe);
      ctx.closePath();
      ctx.fill();

      // Front Flipper Wing
      const flipperAngle = isWalking ? -stepSin * 0.6 : Math.sin(walkCycle * 2) * 0.12;
      ctx.save();
      ctx.translate(1, -11 + breathe);
      ctx.rotate(flipperAngle);
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.roundRect(-3, 0, 6.5, 16, 3.5);
      ctx.fill();
      ctx.restore();

      // Front Leg & Foot
      ctx.save();
      const frontLegHipX = 2;
      const frontLegHipY = 4;
      const frontLegAngle = isWalking ? stepSin * 0.55 : 0;
      const frontLegLift = isWalking ? Math.max(0, stepCos) * 4 : 0;

      ctx.translate(frontLegHipX, frontLegHipY);
      ctx.rotate(frontLegAngle);
      ctx.fillStyle = "#F97316";
      ctx.beginPath();
      ctx.roundRect(-3, -frontLegLift, 12, 6, 3);
      ctx.fill();
      ctx.restore();

      // Cyan Beanie Hat
      ctx.fillStyle = "#0284C7";
      ctx.beginPath();
      ctx.arc(4.5, -27 + breathe, 8.5, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#38BDF8";
      ctx.beginPath();
      ctx.roundRect(-4.5, -28 + breathe, 18, 3.5, 1.5);
      ctx.fill();

      // Yellow Pom-Pom
      const pomPomSway = isWalking ? -stepSin * 2.5 : 0;
      ctx.fillStyle = "#FDE047";
      ctx.beginPath();
      ctx.arc(4.5 + pomPomSway, -36 + breathe, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const pState = penguinStateRef.current;
      const spacing = getSpacing();

      // 1. Update Penguin Walking Animation & Physics
      const targetWorldX = currentTargetIndex * spacing;
      pState.targetWorldX = targetWorldX;

      const dx = pState.targetWorldX - pState.worldX;
      if (Math.abs(dx) > 2) {
        const speed = 180 * dt;
        pState.worldX += Math.sign(dx) * Math.min(speed, Math.abs(dx));
        pState.isWalking = true;
        pState.facingRight = dx > 0;
        pState.walkFrame += dt * 1.6;

        // Footstep impact puff
        const currentStepPhase = Math.sin(pState.walkFrame * 14);
        if (
          (currentStepPhase > 0.8 && pState.lastFootstepStep <= 0.8) ||
          (currentStepPhase < -0.8 && pState.lastFootstepStep >= -0.8)
        ) {
          particlesRef.current.push({
            x: pState.worldX + (Math.random() - 0.5) * 8,
            y: getGroundY(pState.worldX) + 6,
            vx: (Math.random() - 0.5) * 2 - (pState.facingRight ? 1.5 : -1.5),
            vy: -Math.random() * 2 - 0.5,
            size: Math.random() * 3.5 + 2,
            color: "#E2E8F0",
            alpha: 0.85,
            life: 0,
            maxLife: 22,
          });
        }
        pState.lastFootstepStep = currentStepPhase;
      } else {
        pState.worldX = pState.targetWorldX;
        pState.isWalking = false;
        pState.walkFrame += dt * 0.7;
      }

      // Jump Physics
      if (pState.isJumping) {
        pState.jumpY += pState.jumpVy;
        pState.jumpVy += 20 * dt;
        if (pState.jumpY >= 0) {
          pState.jumpY = 0;
          pState.jumpVy = 0;
          pState.isJumping = false;
        }
      }

      pState.worldY = getGroundY(pState.worldX);

      // 2. Smooth Camera Tracking
      const targetCamX = pState.worldX;
      cameraXRef.current += (targetCamX - cameraXRef.current) * 0.085;
      const camX = cameraXRef.current;
      const screenCenterX = cssWidth * 0.5;

      // 3. Clear Screen
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // ── Layer 1: Bright Blue Sky & Sun ──
      const skyGrad = ctx.createLinearGradient(0, 0, 0, cssHeight);
      skyGrad.addColorStop(0, "#7DD3FC");
      skyGrad.addColorStop(0.45, "#BAE6FD");
      skyGrad.addColorStop(0.85, "#E0F2FE");
      skyGrad.addColorStop(1, "#F0F9FF");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // Radiant Cartoon Sun with Halo
      ctx.fillStyle = "rgba(254, 240, 138, 0.4)";
      ctx.beginPath();
      ctx.arc(cssWidth * 0.84, 75, 54, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FDE047";
      ctx.beginPath();
      ctx.arc(cssWidth * 0.84, 75, 40, 0, Math.PI * 2);
      ctx.fill();

      // Floating Parallax Clouds
      const cloudOffset = ((time * 0.012 - camX * 0.08) % (cssWidth + 240)) - 120;
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(cloudOffset, 80, 28, 0, Math.PI * 2);
      ctx.arc(cloudOffset + 26, 70, 36, 0, Math.PI * 2);
      ctx.arc(cloudOffset + 58, 80, 26, 0, Math.PI * 2);
      ctx.fill();

      // ── Layer 2: Distant Snow Mountain Peaks (Parallax 0.22) ──
      ctx.fillStyle = "#CBD5E1";
      ctx.beginPath();
      ctx.moveTo(-100, cssHeight);
      for (let i = -3; i < totalCheckpoints + 8; i++) {
        const peakWorldX = i * 260 - camX * 0.22;
        ctx.lineTo(peakWorldX, 150 + (i % 2) * 45);
        ctx.lineTo(peakWorldX + 130, 245);
      }
      ctx.lineTo(cssWidth + 100, cssHeight);
      ctx.closePath();
      ctx.fill();

      // Snowcaps on Background Peaks
      ctx.fillStyle = "#FFFFFF";
      for (let i = -3; i < totalCheckpoints + 8; i++) {
        const peakWorldX = i * 260 - camX * 0.22;
        const peakY = 150 + (i % 2) * 45;
        ctx.beginPath();
        ctx.moveTo(peakWorldX, peakY);
        ctx.lineTo(peakWorldX - 38, peakY + 48);
        ctx.lineTo(peakWorldX + 38, peakY + 48);
        ctx.closePath();
        ctx.fill();
      }

      // ── Layer 3: Midground Snowy Pine Trees (Parallax 0.55) ──
      for (let i = -4; i < totalCheckpoints * 3 + 6; i++) {
        const treeWorldX = i * 125;
        const screenTreeX = treeWorldX - camX * 0.55 + screenCenterX * 0.55;
        if (screenTreeX < -60 || screenTreeX > cssWidth + 60) continue;

        const baseY = getBaseY();
        const treeBaseY = baseY - 20 - (treeWorldX / (totalCheckpoints * spacing || 1)) * 55;

        // Pine Tree Body
        ctx.fillStyle = "#0D9488";
        ctx.beginPath();
        ctx.moveTo(screenTreeX, treeBaseY - 58);
        ctx.lineTo(screenTreeX - 20, treeBaseY);
        ctx.lineTo(screenTreeX + 20, treeBaseY);
        ctx.closePath();
        ctx.fill();

        // Snow layer on Pine Branches
        ctx.fillStyle = "#F8FAFC";
        ctx.beginPath();
        ctx.moveTo(screenTreeX, treeBaseY - 58);
        ctx.lineTo(screenTreeX - 12, treeBaseY - 36);
        ctx.lineTo(screenTreeX + 12, treeBaseY - 36);
        ctx.closePath();
        ctx.fill();
      }

      // ── Layer 4: Foreground Snowy Mountain Ground ──
      ctx.fillStyle = "#F8FAFC";
      ctx.beginPath();
      const startScreenX = -50;
      const endScreenX = cssWidth + 50;

      ctx.moveTo(startScreenX, cssHeight);
      for (let sx = startScreenX; sx <= endScreenX; sx += 15) {
        const wx = sx + camX - screenCenterX;
        const gy = getGroundY(wx);
        ctx.lineTo(sx, gy);
      }
      ctx.lineTo(endScreenX, cssHeight);
      ctx.closePath();
      ctx.fill();

      // Crisp White Snow Ridge Highlight
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      for (let sx = startScreenX; sx <= endScreenX; sx += 15) {
        const wx = sx + camX - screenCenterX;
        const gy = getGroundY(wx);
        if (sx === startScreenX) ctx.moveTo(sx, gy);
        else ctx.lineTo(sx, gy);
      }
      ctx.stroke();

      // ── Layer 5: ALL CHECKPOINT NODES IN THE WORLD (From Station 1 to N) ──
      checkpoints.forEach((cp, idx) => {
        const wx = idx * spacing;
        const wy = getGroundY(wx);
        const sx = wx - camX + screenCenterX;

        // View culling: only draw nodes that are near the visible screen viewport
        if (sx < -140 || sx > cssWidth + 140) return;

        const isCurrent = idx === currentTargetIndex;
        const isDone = cp.isCompleted;
        const isNext = idx === currentTargetIndex + 1;

        ctx.save();
        ctx.translate(sx, wy);

        // Landmark Stage / Ice Pedestal
        ctx.fillStyle = isDone ? "#D1FAE5" : isCurrent ? "#FEF3C7" : "#F1F5F9";
        ctx.strokeStyle = isDone ? "#10B981" : isCurrent ? "#F59E0B" : "#CBD5E1";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-26, -4, 52, 12, 5);
        ctx.fill();
        ctx.stroke();

        // Milestone Pole
        ctx.strokeStyle = "#78350F";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(0, -68);
        ctx.stroke();

        // Milestone Signboard Flag
        if (idx === totalCheckpoints - 1) {
          // Final Summit Pennant
          ctx.fillStyle = "#EF4444";
          ctx.beginPath();
          ctx.moveTo(0, -68);
          ctx.lineTo(34, -56);
          ctx.lineTo(0, -44);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 9.5px sans-serif";
          ctx.fillText("SUMMIT", 5, -53);
        } else {
          ctx.fillStyle = isDone ? "#059669" : isCurrent ? "#D97706" : "#64748B";
          ctx.beginPath();
          ctx.roundRect(-2, -67, 40, 23, 4.5);
          ctx.fill();
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(isDone ? "✓ DONE" : `CP ${idx + 1}`, 18, -52);
        }

        // Circular Node Beacon on the ground
        ctx.fillStyle = isDone ? "#10B981" : isCurrent ? "#F59E0B" : "#64748B";
        ctx.beginPath();
        ctx.arc(0, -4, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 9.5px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(isDone ? "✓" : `${idx + 1}`, 0, -3.5);

        // Clickable Topic Title Banner
        const isMobile = cssWidth < 640;
        const maxChar = isMobile ? 16 : 22;
        const bannerTitle = cp.title.length > maxChar ? cp.title.slice(0, maxChar - 1) + "…" : cp.title;
        ctx.font = `bold ${isMobile ? "10px" : "11.5px"} sans-serif`;
        const titleW = ctx.measureText(bannerTitle).width;

        ctx.fillStyle = isCurrent ? "#0F172A" : isDone ? "#065F46" : "#334155";
        ctx.beginPath();
        ctx.roundRect(-titleW / 2 - 10, -98, titleW + 20, 24, 12);
        ctx.fill();
        ctx.strokeStyle = isCurrent ? "#FBBF24" : isDone ? "#34D399" : "#CBD5E1";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(bannerTitle, 0, -86);

        // Click Hint Icon badge
        if (isCurrent) {
          ctx.fillStyle = "#F59E0B";
          ctx.font = "bold 8.5px sans-serif";
          ctx.fillText("👆 CLICK FOR QUEST", 0, -106);
        } else if (isNext) {
          ctx.fillStyle = "#64748B";
          ctx.font = "bold 8.5px sans-serif";
          ctx.fillText("🔒 NEXT UP", 0, -106);
        }

        ctx.restore();
      });

      // ── Layer 6: Draw Cartoon Penguin Character ──
      const screenPenguinX = pState.worldX - camX + screenCenterX;
      const screenPenguinY = pState.worldY;

      drawCartoonPenguin(
        screenPenguinX,
        screenPenguinY,
        pState.facingRight,
        pState.walkFrame,
        pState.isWalking,
        pState.jumpY,
        pState.squashX,
        pState.squashY
      );

      // ── Layer 7: Animated Floating Snowflakes ──
      ctx.fillStyle = "#FFFFFF";
      for (const flake of snowflakesRef.current) {
        flake.y += flake.speedY;
        flake.x += flake.speedX;

        if (flake.y > cssHeight) {
          flake.y = -10;
          flake.x = Math.random() * cssWidth;
        }
        if (flake.x > cssWidth) flake.x = 0;
        if (flake.x < 0) flake.x = cssWidth;

        ctx.globalAlpha = flake.alpha;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // ── Layer 8: Active Star & Snow Footstep Particles ──
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;
        pt.alpha = 1 - pt.life / pt.maxLife;

        const screenPtX = pt.x - camX + screenCenterX;

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.beginPath();
        ctx.arc(screenPtX, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();

        if (pt.life >= pt.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleCanvasClick);
      cancelAnimationFrame(animId);
    };
  }, [checkpoints, totalCheckpoints, currentTargetIndex]);

  const currentCp = checkpoints[currentTargetIndex] || checkpoints[0];

  return (
    <div className="w-full min-h-screen bg-transparent text-slate-900 select-none pb-20">
      {/* ── Top Game Status Bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {roadmapTitle}
                </h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                  Station {currentTargetIndex + 1}/{totalCheckpoints}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {totalCheckpoints} Total Stations • Complete subtopics to hike the Penguin forward!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* XP Counter */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{completedCount * 100} XP</span>
            </div>

            {/* Progress Gauge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs">
              <Mountain className="w-4 h-4 text-emerald-600" />
              <span>{progressPct}% Mastered</span>
            </div>

            {/* Enroll Button */}
            <button
              type="button"
              onClick={onEnroll}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isEnrolled
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
              }`}
            >
              {isEnrolled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Enrolled</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Enroll</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Side-View Cartoon Game Canvas (Click any topic directly to inspect) ── */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-2 sm:mt-6">
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-sky-100 border border-slate-200/80 shadow-xs cursor-pointer group">
          <canvas ref={canvasRef} className="w-full block select-none" />

          {/* Click to inspect topic overlay badge */}
          <div className="hidden sm:flex absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-xs border border-slate-200/80 text-[11px] font-bold text-slate-700 items-center gap-1.5 shadow-xs pointer-events-none">
            <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
            <span>Click any topic milestone to open quest</span>
          </div>

          {/* Summit Mastered Banner */}
          <AnimatePresence>
            {progressPct === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 z-20 whitespace-nowrap"
              >
                <Trophy className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-200 animate-bounce" />
                <span>SUMMIT CONQUERED! 100% MASTERED</span>
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-200" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── All Stations / World Journey Map (All topics displayed) ── */}
        <div className="mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                All Stations ({completedCount}/{totalCheckpoints} Completed)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              Click any station to view subtopics
            </span>
          </div>

          {/* Horizontal scrollable station pills for ALL topics */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {checkpoints.map((cp) => {
              const isCurrent = cp.index === currentTargetIndex;
              const isDone = cp.isCompleted;

              return (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => handleJumpToStation(cp)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                    isDone
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                      : isCurrent
                      ? "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/40"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-amber-500 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    {isDone ? "✓" : cp.index + 1}
                  </div>
                  <span className="truncate max-w-[140px]">{cp.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Mission Controller Strip (Responsive for Mobile) ── */}
        <div className="mt-3 sm:mt-4 p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-xs">
          {/* Active Station Info */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-black text-sm sm:text-base shadow-xs shrink-0">
              {currentTargetIndex + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5 truncate">
                <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Active Objective • Station {currentTargetIndex + 1} of {totalCheckpoints}</span>
              </div>
              <h2 className="text-sm sm:text-lg font-black text-slate-900 truncate">
                {currentCp?.title || "Summit"}
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            {/* Open Subtopics Quest Modal */}
            <button
              type="button"
              onClick={() => {
                setModalCheckpoint(currentCp);
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Inspect Subtopics</span>
            </button>

            {/* Complete & Hike Walk to Next Checkpoint */}
            <button
              type="button"
              onClick={() => handleCompleteCurrent(currentCp)}
              className={`w-full sm:w-auto justify-center px-5 sm:px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                currentCp.isCompleted
                  ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
              }`}
            >
              {currentCp.isCompleted ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Completed (Advance ➔)</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Complete & Hike Forward 🐧 ➔</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Subtopics Quest Modal Overlay ── */}
      <AnimatePresence>
        {isModalOpen && modalCheckpoint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="flex-1 absolute inset-0 cursor-pointer" onClick={() => setIsModalOpen(false)} />

            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 text-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-extrabold uppercase border border-emerald-300">
                      Station {modalCheckpoint.index + 1}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Altitude: ~{Math.round(1200 + (modalCheckpoint.index / totalCheckpoints) * (8848 - 1200)).toLocaleString()}m
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {modalCheckpoint.title}
                  </h2>
                  {modalCheckpoint.subtitle && (
                    <p className="text-xs text-slate-500">{modalCheckpoint.subtitle}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Subtopics Checklist Content */}
              <div className="space-y-5">
                {activeSubtopicsData?.description && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium leading-relaxed">
                    💡 {activeSubtopicsData.description}
                  </div>
                )}

                <div className="space-y-4">
                  {activeSubtopicsData?.groups?.map((grp, gIdx) => (
                    <div key={gIdx} className="space-y-2.5">
                      {grp.groupName && (
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{grp.groupName}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        {grp.topics.map((topic) => {
                          const isSubDone = !!completedSubtopics[topic.id];

                          return (
                            <div
                              key={topic.id}
                              onClick={() => {
                                onToggleSubtopic(topic.id, modalCheckpoint.title);
                              }}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSubDone
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                                  : "bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-800"
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-slate-900">
                                    {topic.name}
                                  </span>
                                  {topic.isRecommended && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                                      Core
                                    </span>
                                  )}
                                </div>
                                {topic.desc && (
                                  <p className="text-[10px] text-slate-500 line-clamp-1">{topic.desc}</p>
                                )}
                              </div>

                              {/* Toggle Checkbox */}
                              <div
                                className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isSubDone
                                    ? "bg-emerald-600 text-white font-black"
                                    : "bg-white border-2 border-slate-300 text-transparent"
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {areAllModalSubtopicsDone || modalCheckpoint.isCompleted
                    ? "✓ All subtopics done! Ready to advance."
                    : "Check off exercises to master this station."}
                </span>

                <button
                  type="button"
                  onClick={() => handleCompleteCurrent(modalCheckpoint)}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                    areAllModalSubtopicsDone || modalCheckpoint.isCompleted
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 scale-105"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Complete & Hike Forward 🐧 ➔</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
