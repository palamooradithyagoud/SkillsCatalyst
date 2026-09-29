"use client";

import { motion, useSpring } from "framer-motion";
import React, { FC, ReactElement, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

export interface SmoothCursorProps {
  cursor?: ReactElement;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
    restDelta: number;
  };
  containerRef?: React.RefObject<HTMLElement | null>;
}

const DefaultCursorSVG: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={50}
      height={54}
      viewBox="0 0 50 54"
      fill="none"
      style={{ scale: 0.6 }}
      className="drop-shadow-[0_4px_16px_rgba(168,85,247,0.35)]"
    >
      <g filter="url(#filter0_d_91_7928)">
        <path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill="#0c071d"
        />
        <path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke="#C084FC"
          strokeWidth={2.4}
        />
      </g>
      <defs>
        <filter
          id="filter0_d_91_7928"
          x={0.602397}
          y={0.952444}
          width={49.0584}
          height={52.428}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={2.25825} />
          <feGaussianBlur stdDeviation={2.25825} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_91_7928"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_91_7928"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export function SmoothCursor({
  cursor = <DefaultCursorSVG />,
  springConfig = {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  },
  containerRef,
}: SmoothCursorProps) {
  const [mounted, setMounted] = useState(false);
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });
  const velocity = useRef<Position>({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);
  const hasPositioned = useRef(false);

  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, {
    ...springConfig,
    damping: 60,
    stiffness: 300,
  });
  const scale = useSpring(containerRef ? 0 : 1, {
    ...springConfig,
    stiffness: 500,
    damping: 35,
  });
  const opacity = useSpring(containerRef ? 0 : 1, {
    damping: 30,
    stiffness: 350,
  });

  useEffect(() => {
    setMounted(true);
    let moveTimeout: NodeJS.Timeout;
    const hasContainer = !!containerRef;

    const updateVelocity = (currentPos: Position) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        };
      }

      lastUpdateTime.current = currentTime;
      lastMousePos.current = currentPos;
    };

    const isInsideContainer = (clientX: number, clientY: number) => {
      if (!containerRef?.current) return true;
      const rect = containerRef.current.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    };

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = { x: e.clientX, y: e.clientY };
      const inside = isInsideContainer(currentPos.x, currentPos.y);

      if (hasContainer) {
        if (!inside) {
          scale.set(0);
          opacity.set(0);
          if (containerRef?.current) {
            containerRef.current.style.cursor = "";
            containerRef.current.removeAttribute("data-smooth-cursor-active");
          }
          return;
        } else {
          opacity.set(1);
          if (containerRef?.current) {
            containerRef.current.style.cursor = "none";
            containerRef.current.setAttribute("data-smooth-cursor-active", "true");
          }
        }
      }

      if (!hasPositioned.current) {
        cursorX.jump(currentPos.x);
        cursorY.jump(currentPos.y);
        hasPositioned.current = true;
      } else {
        cursorX.set(currentPos.x);
        cursorY.set(currentPos.y);
      }

      updateVelocity(currentPos);

      const speed = Math.sqrt(
        Math.pow(velocity.current.x, 2) + Math.pow(velocity.current.y, 2)
      );

      if (speed > 0.08) {
        const currentAngle =
          Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) +
          90;

        let angleDiff = currentAngle - previousAngle.current;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        accumulatedRotation.current += angleDiff;
        rotation.set(accumulatedRotation.current);
        previousAngle.current = currentAngle;

        scale.set(0.95);

        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
          scale.set(1);
        }, 150);
      } else {
        scale.set(1);
      }
    };

    let rafId: number;
    const throttledMouseMove = (e: MouseEvent) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        handleMouseMove(e);
        rafId = 0;
      });
    };

    const handleMouseLeave = () => {
      if (hasContainer) {
        scale.set(0);
        opacity.set(0);
        if (containerRef?.current) {
          containerRef.current.style.cursor = "";
          containerRef.current.removeAttribute("data-smooth-cursor-active");
        }
      }
    };

    if (!hasContainer) {
      document.body.style.cursor = "none";
      scale.set(1);
      opacity.set(1);
    }

    const containerEl = containerRef?.current;
    if (containerEl) {
      containerEl.addEventListener("mouseleave", handleMouseLeave);
    }

    window.addEventListener("mousemove", throttledMouseMove);

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      if (containerEl) {
        containerEl.removeEventListener("mouseleave", handleMouseLeave);
        containerEl.style.cursor = "";
        containerEl.removeAttribute("data-smooth-cursor-active");
      }
      clearTimeout(moveTimeout);
      if (rafId) cancelAnimationFrame(rafId);
      if (!hasContainer) {
        document.body.style.cursor = "auto";
      }
    };
  }, [containerRef, cursorX, cursorY, rotation, scale, opacity]);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        [data-smooth-cursor-active="true"],
        [data-smooth-cursor-active="true"] * {
          cursor: none !important;
        }
      `}</style>
      <motion.div
        style={{
          position: "fixed",
          left: cursorX,
          top: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          rotate: rotation,
          scale: scale,
          opacity: opacity,
          zIndex: 99999,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        {cursor}
      </motion.div>
    </>
  );
}

export default SmoothCursor;
