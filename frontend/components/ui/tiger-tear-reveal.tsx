"use client"

import * as React from "react"

/**
 * TigerTearReveal (SkillsCatalyst Explorer Penguin Edition)
 *
 * Smooth scroll-triggered paper tear reveal:
 * As you scroll down to this section, the paper tears cleanly open automatically
 * with an ultra-satisfying fluid motion—no wrestling with trapped scrollbars!
 *
 * Behind the torn halves, our Explorer Penguin rises atop the mountain summit,
 * springs its eyes open, and tracks your cursor wherever you move.
 * Click to make it squint with delight, or scroll back up to close it.
 */

export interface TigerTearRevealProps {
  /** The big word that gets torn. */
  word?: string
  /** Small line above the word. Empty hides it. */
  tagline?: string
  /** Word colour. */
  ink?: string
  /** Paper colour, the sheet that tears. */
  paper?: string
  /** Tagline colour. */
  taglineColor?: string
  /** Iris colour. */
  eyeColor?: string
  /** Feathers / plumage base colour. */
  furColor?: string
  /** Font stack for the word. */
  fontFamily?: string
  /** Height of the section. */
  height?: string
  /** Show the interactive hint / button. */
  hint?: boolean
  /** Extra root class names. */
  className?: string
  /** Controlled progress (0 = closed, 1 = fully torn). */
  progress?: number
}

// #region Math & geometry
export type Pt = [number, number]

export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const clamp01 = (x: number) => (x <= 0 ? 0 : x > 1 ? 1 : x)

export function smooth(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export function easeOutBack(t: number) {
  const c = 1.70158
  const u = clamp01(t) - 1
  return 1 + (c + 1) * u * u * u + c * u * u
}

export function stages(p: number) {
  return {
    crack: smooth(0.02, 0.18, p),
    open: smooth(0.12, 0.68, p),
    rise: smooth(0.18, 0.78, p),
    pop: smooth(0.52, 0.88, p),
    shake: smooth(0.12, 0.22, p) * (1 - smooth(0.25, 0.38, p)),
  }
}

export function tearLine(seed = 11, from = -800, to = 1800, step = 9, cx = 500, cy = 300, angle = -5.5): Pt[] {
  const r = rng(seed)
  const slope = Math.tan((angle * Math.PI) / 180)
  const out: Pt[] = []
  for (let x = from; x <= to; x += step) {
    const fibre = (r() - 0.5) * 5.5
    const tooth = r() < 0.1 ? (r() - 0.5) * 26 : 0
    const wander = Math.sin(x * 0.019 + seed) * 11 + Math.sin(x * 0.053 + seed * 2) * 5
    out.push([x, cy + (x - cx) * slope + wander + fibre + tooth])
  }
  return out
}

/** Generous, dramatic opening motion so the whole penguin is visible */
export function pieceMotion(open: number) {
  return {
    top: { dx: -18 * open, dy: -185 * open, rot: -3.8 * open },
    bottom: { dx: 20 * open, dy: 180 * open, rot: 3.2 * open },
  }
}

export function fibreWidths(n: number, open: number, seed = 5) {
  const r = rng(seed)
  const k = Math.min(1, open * 4)
  return Array.from({ length: n }, (_, i) => k * (2.8 + 6.5 * (0.5 + 0.5 * Math.sin(i * 0.37 + seed)) * (0.6 + r() * 0.8)))
}
// #endregion

const VIEW_W = 1000
const CX = 500
const CY = 300
const FAR = 4000
const FRAME = "0 0 1000 600"

const PENGUIN_EYES: Pt[] = [
  [-88, -24],
  [88, -28],
]

const d = (pts: Pt[], close = true) =>
  "M" + pts.map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join("L") + (close ? "Z" : "")

function buildFibres() {
  const r = rng(71)
  let s = ""
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * Math.PI * 2 + r() * 0.08
    const r0 = 10 + r() * 3
    const r1 = 30 + r() * 4
    s += "M" + (Math.cos(a) * r0).toFixed(1) + " " + (Math.sin(a) * r0).toFixed(1) + "L" + (Math.cos(a) * r1).toFixed(1) + " " + (Math.sin(a) * r1).toFixed(1)
  }
  return s
}

function buildFeathers() {
  const r = rng(41)
  const tones = ["", "", ""]
  for (let i = 0; i < 1600; i++) {
    const x = (r() - 0.5) * 1300
    const y = (r() - 0.5) * 440
    const a = Math.atan2(y - 50, x) + (r() - 0.5) * 0.45
    const l = 7 + r() * 11
    const seg = "M" + x.toFixed(1) + " " + y.toFixed(1) + "l" + (Math.cos(a) * l).toFixed(1) + " " + (Math.sin(a) * l).toFixed(1)
    tones[r() < 0.5 ? 0 : r() < 0.75 ? 1 : 2] += seg
  }
  return tones
}

const PENGUIN_EYE_SHAPE = "M-64 6 C-42 -36 32 -44 68 -4 C36 36 -28 44 -64 6Z"

// ---------------------------------------------------------------- Penguin Scene

const PenguinSummitScene = React.memo(function PenguinSummitScene({
  id,
  plumage,
}: {
  id: string
  plumage: string
}) {
  const feathers = React.useMemo(buildFeathers, [])

  return (
    <g>
      {/* 1. Alpine Twilight Sunset Sky */}
      <rect x={-2600} y={-440} width={5200} height={880} fill={"url(#" + id + "-sky)"} />
      <rect x={-2600} y={-440} width={5200} height={880} fill={"url(#" + id + "-sunset-glow)"} opacity={0.9} />

      {/* Mountain Silhouettes */}
      <polygon
        points="-1200,360 -750,-50 -400,220 -120,-120 220,170 580,-150 920,210 1350,-30 1800,360"
        fill="#1a0d2e"
        opacity={0.7}
      />
      <polygon
        points="-1400,420 -820,70 -520,300 -220,30 140,250 490,0 820,280 1200,50 1600,420"
        fill="#100720"
      />
      {/* Snowy Summit Glimmers */}
      <polygon points="-120,-120 -150,-70 -80,-65" fill="#ffffff" opacity={0.5} />
      <polygon points="580,-150 550,-100 615,-95" fill="#ffffff" opacity={0.5} />

      {/* 2. Penguin Torso & Body */}
      <ellipse cx={0} cy={220} rx={440} ry={270} fill={plumage} />
      {/* Silky White Chest Bib */}
      <path
        d="M-140 110 C-150 230 -115 360 0 380 C115 360 150 230 140 110 C105 70 55 55 0 55 C-55 55 -105 70 -140 110Z"
        fill="#ffffff"
      />
      <ellipse cx={0} cy={230} rx={100} ry={115} fill="#f8fafc" opacity={0.92} />

      {/* 3. Golden Emperor Auroral Flashes */}
      <path
        d="M-160 40 C-200 90 -185 180 -135 215 C-120 165 -125 95 -145 45Z"
        fill={"url(#" + id + "-aurora-left)"}
      />
      <path
        d="M160 40 C200 90 185 180 135 215 C120 165 125 95 145 45Z"
        fill={"url(#" + id + "-aurora-right)"}
      />

      {/* 4. Penguin Head */}
      <path
        d="M-170 65 C-180 -55 -135 -170 0 -180 C135 -170 180 -55 170 65 C150 140 85 180 0 180 C-85 180 -150 140 -170 65Z"
        fill={plumage}
      />

      {/* Down Feathers */}
      <path d={feathers[0]} stroke="#1e293b" strokeWidth={1.3} opacity={0.35} strokeLinecap="round" />
      <path d={feathers[1]} stroke="#f59e0b" strokeWidth={1.1} opacity={0.3} strokeLinecap="round" />
      <path d={feathers[2]} stroke="#ffffff" strokeWidth={1} opacity={0.25} strokeLinecap="round" />

      {/* 5. Explorer Mountaineer Goggles */}
      <g transform="translate(0, -100)">
        <path d="M-180 14 C-105 -5 105 -5 180 14" stroke="#2b170c" strokeWidth={14} strokeLinecap="round" fill="none" />
        <path d="M-180 14 C-105 -5 105 -5 180 14" stroke="#452312" strokeWidth={8} strokeLinecap="round" fill="none" />
        {/* Left lens */}
        <circle cx={-70} cy={0} r={40} fill="#27150a" stroke="#d97706" strokeWidth={7} />
        <circle cx={-70} cy={0} r={33} fill="#0f172a" opacity={0.9} />
        <ellipse cx={-80} cy={-10} rx={19} ry={8} fill="#ffffff" opacity={0.28} transform="rotate(-25 -80 -10)" />
        {/* Right lens */}
        <circle cx={70} cy={0} r={40} fill="#27150a" stroke="#d97706" strokeWidth={7} />
        <circle cx={70} cy={0} r={33} fill="#0f172a" opacity={0.9} />
        <ellipse cx={60} cy={-10} rx={19} ry={8} fill="#ffffff" opacity={0.28} transform="rotate(-25 60 -10)" />
        {/* Bridge */}
        <rect x={-15} y={-6} width={30} height={12} rx={4} fill="#f59e0b" stroke="#78350f" strokeWidth={2} />
      </g>

      {/* 6. Sculpted Tangerine Beak */}
      <g transform="translate(0, 32)">
        <ellipse cx={0} cy={12} rx={36} ry={14} fill="#020617" opacity={0.65} />
        <path
          d="M-38 0 C-24 28 -8 70 0 80 C8 70 24 28 38 0 C25 -8 -25 -8 -38 0Z"
          fill={"url(#" + id + "-beak)"}
        />
        <path d="M0 0 L0 76" stroke="#fef08a" strokeWidth={3.4} strokeLinecap="round" opacity={0.88} />
        <path d="M-24 18 C-10 42 10 42 24 18" fill="#c2410c" opacity={0.92} />
      </g>
    </g>
  )
})

function PenguinEye({
  id,
  x,
  y,
  flip,
  look,
  blink,
  pupil,
  scale,
  fibres,
}: {
  id: string
  x: number
  y: number
  flip: boolean
  look: Pt
  blink: number
  pupil: number
  scale: number
  fibres: string
}) {
  const clip = id + (flip ? "-pcl" : "-pcr")
  const lx = look[0] * (flip ? -1 : 1)

  return (
    <g transform={"translate(" + x + " " + y + ") scale(" + (flip ? -scale : scale) + " " + scale + ")"}>
      <clipPath id={clip}>
        <path d={PENGUIN_EYE_SHAPE} />
      </clipPath>

      <path d={PENGUIN_EYE_SHAPE} fill="#090d16" stroke="#090d16" strokeWidth={11} strokeLinejoin="round" />
      <path d="M-66 4 C-72 14 -80 22 -84 32 C-76 24 -68 16 -60 12Z" fill="#090d16" />

      <g clipPath={"url(#" + clip + ")"}>
        <ellipse cx={0} cy={0} rx={68} ry={46} fill="#1e293b" />

        <g transform={"translate(" + (lx * 14).toFixed(2) + " " + (3 + look[1] * 8).toFixed(2) + ")"}>
          <circle r={36} fill={"url(#" + id + "-iris)"} />
          <path d={fibres} stroke="#78350f" strokeWidth={1.1} opacity={0.42} />
          <circle r={36} fill="none" stroke="#451a03" strokeWidth={3} opacity={0.8} />

          <circle r={13.5 * pupil} fill="#050811" />

          {/* Eye reflections */}
          <ellipse cx={-11} cy={-12} rx={7.5} ry={5.5} fill="#ffffff" opacity={0.95} />
          <circle cx={9} cy={10} r={2.8} fill="#ffffff" opacity={0.7} />
        </g>

        {/* Eyelid shadow & moving eyelid */}
        <ellipse cx={0} cy={-42} rx={76} ry={30} fill={"url(#" + id + "-lid)"} />
        <g transform={"translate(0 " + (-56 + blink * 68).toFixed(2) + ")"}>
          <rect x={-80} y={-72} width={160} height={72} fill="#0f172a" />
          <path d="M-80 0 H80" stroke="#020617" strokeWidth={7.5} />
        </g>
      </g>
    </g>
  )
}

// ---------------------------------------------------------------- Paper halves

const CURLS: Record<"top" | "bottom", [number, number, number][]> = {
  top: [
    [300, 48, 32],
    [575, 34, 22],
    [790, 56, 36],
  ],
  bottom: [
    [205, 54, 34],
    [470, 36, 24],
    [690, 44, 30],
  ],
}

function Half({
  id,
  side,
  line,
  open,
  children,
}: {
  id: string
  side: "top" | "bottom"
  line: Pt[]
  open: number
  children: React.ReactNode
}) {
  const up = side === "top"
  const m = pieceMotion(open)[side]
  const shape = up
    ? [[line[0][0], -FAR] as Pt, [line[line.length - 1][0], -FAR] as Pt, ...[...line].reverse()]
    : [...line, [line[line.length - 1][0], FAR] as Pt, [line[0][0], FAR] as Pt]
  const widths = fibreWidths(line.length, open, up ? 5 : 8)

  const core = line.concat(line.map(([x, y], i) => [x, y + (up ? -widths[i] : widths[i])] as Pt).reverse())
  const curls = CURLS[side].map(([cx, hw, depth]) => {
    const pts = line.filter(([x]) => Math.abs(x - cx) <= hw)
    const back = pts.map(([x, y]) => {
      const s = Math.cos(((x - cx) / hw) * (Math.PI / 2))
      return [x + (up ? 7 : -7) * s * open, y + (up ? 1 : -1) * depth * s * s * Math.min(1, open * 2.5)] as Pt
    })
    return d(pts.concat(back.reverse()))
  })

  const transform =
    "translate(" + m.dx.toFixed(2) + " " + m.dy.toFixed(2) + ") rotate(" + m.rot.toFixed(3) + " " + CX + " " + CY + ")"
  const clip = id + "-" + side

  return (
    <g transform={transform}>
      {open > 0 ? (
        <path
          d={d(line, false)}
          fill="none"
          stroke="#000000"
          strokeOpacity={0.5 * Math.min(1, open * 3)}
          strokeWidth={24}
          transform={"translate(0 " + (up ? 12 : -12) + ")"}
          filter={"url(#" + id + "-soft)"}
        />
      ) : null}
      <clipPath id={clip}>
        <path d={d(shape)} />
      </clipPath>
      <g clipPath={"url(#" + clip + ")"}>{children}</g>
      {open > 0 ? (
        <>
          <path d={d(core)} fill="#ffffff" />
          {curls.map((c, i) => (
            <path key={i} d={c} fill={"url(#" + id + "-curl-" + side + ")"} stroke="#ffffff" strokeWidth={1} />
          ))}
        </>
      ) : null}
    </g>
  )
}

// ---------------------------------------------------------------- Main Export

export function TigerTearReveal({
  word = "CATALYST",
  tagline = "ACCELERATE YOUR CAREER · SKILLSCATALYST",
  ink = "#683594",
  paper = "#f2f1ee",
  taglineColor = "#4b5563",
  eyeColor = "#f59e0b",
  furColor = "#0f172a",
  fontFamily = '"Anton", Impact, "Bebas Neue", "Oswald", "Arial Narrow", "Arial Black", sans-serif',
  height = "85vh",
  hint = true,
  className = "",
  progress: controlledProgress,
}: TigerTearRevealProps) {
  const rootRef = React.useRef<HTMLElement | null>(null)
  const id = "ptr" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const fibres = React.useMemo(buildFibres, [])
  const line = React.useMemo(() => tearLine(), [])

  // Auto-tear state: tears open smoothly as soon as you scroll into view!
  const [animProgress, setAnimProgress] = React.useState(controlledProgress ?? 0)
  const [isTorn, setIsTorn] = React.useState(false)

  const [look, setLook] = React.useState<Pt>([0, 0])
  const [blink, setBlink] = React.useState(0)
  const [squint, setSquint] = React.useState(0)

  const pointer = React.useRef<{ x: number; y: number } | null>(null)
  const squintAt = React.useRef(-1e9)
  const rafRef = React.useRef(0)

  // Trigger smooth automatic tear when scrolled into view
  React.useEffect(() => {
    if (controlledProgress !== undefined) {
      setAnimProgress(controlledProgress)
      return
    }

    const root = rootRef.current
    if (!root) return

    let tearAnimRaf = 0

    const observer = new IntersectionObserver(
      ([entry]) => {
        // As soon as the user scrolls down to this section:
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          if (!isTorn) {
            setIsTorn(true)
            // Trigger ultra-smooth, satisfying tear animation
            let startTime: number | null = null
            const duration = 1100

            function step(timestamp: number) {
              if (!startTime) startTime = timestamp
              const elapsed = timestamp - startTime
              const p = Math.min(1, elapsed / duration)
              // Smooth ease-out curve
              const eased = 1 - Math.pow(1 - p, 3)
              setAnimProgress(eased)
              if (p < 1) {
                tearAnimRaf = requestAnimationFrame(step)
              }
            }
            tearAnimRaf = requestAnimationFrame(step)
          }
        } else if (entry.boundingClientRect.top > window.innerHeight * 0.85) {
          // If user scrolls all the way back up above it, reset smoothly so it tears again when scrolled down!
          setIsTorn(false)
          setAnimProgress(0)
        }
      },
      { threshold: [0.15, 0.4] }
    )

    observer.observe(root)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(tearAnimRaf)
    }
  }, [controlledProgress, isTorn])

  // Mouse tracking and blinking loop
  React.useEffect(() => {
    let idle: Pt = [0, 0]
    let nextIdle = 0
    let nextBlink = performance.now() + 2000
    let curLook: Pt = [0, 0]

    function loop(now: number) {
      const root = rootRef.current
      if (root) {
        let want: Pt
        if (pointer.current) {
          const rect = root.getBoundingClientRect()
          want = [
            Math.max(-1, Math.min(1, (pointer.current.x - rect.left - rect.width / 2) / (rect.width * 0.35))),
            Math.max(-1, Math.min(1, (pointer.current.y - rect.top - rect.height * 0.5) / (rect.height * 0.35))),
          ]
        } else {
          if (now > nextIdle) {
            const g = rng(Math.floor(now))
            idle = [(g() - 0.5) * 1.3, (g() - 0.5) * 0.75]
            nextIdle = now + 1400 + g() * 1600
          }
          want = idle
        }
        curLook = [curLook[0] + (want[0] - curLook[0]) * 0.16, curLook[1] + (want[1] - curLook[1]) * 0.16]
        setLook(curLook)

        let b = 0
        const since = now - nextBlink
        if (since > 0) b = since < 90 ? since / 90 : since < 200 ? 1 - (since - 90) / 110 : 0
        if (since > 200) nextBlink = now + 2600 + Math.random() * 3000
        setBlink(b)

        const sq = Math.max(0, 1 - (now - squintAt.current) / 900)
        setSquint(sq)
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const currentP = controlledProgress ?? animProgress
  const s = stages(currentP)
  const pop = easeOutBack(s.pop)
  const eyeScale = 0.9 + 0.1 * pop
  const pupil = 1.25 - 0.45 * s.pop + 0.35 * squint
  const curBlink = Math.max(1 - clamp01(pop), blink, squint * 0.45)
  const rise = (1 - s.rise) * 120
  const shake = Math.sin(currentP * 900) * 5 * s.shake
  const crackReach = s.crack * 620
  const crack = line.filter(([x]) => Math.abs(x - CX) <= crackReach)

  const penguinTransform =
    "translate(" + CX + " " + (CY + rise).toFixed(2) + ") rotate(-5.5) scale(" + (1.28 - 0.04 * s.rise).toFixed(4) + ")"

  const sheet = (
    <>
      <rect x={-FAR} y={-FAR} width={FAR * 2 + VIEW_W} height={FAR * 2} fill={paper} />
      {tagline ? (
        <text
          x={CX}
          y={140}
          textAnchor="middle"
          fill={taglineColor}
          style={{ font: '700 26px "Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: "0.38em" }}
        >
          {tagline}
        </text>
      ) : null}
      <text
        x={CX}
        y={375}
        textAnchor="middle"
        textLength={860}
        lengthAdjust="spacingAndGlyphs"
        fill={ink}
        style={{ fontFamily, fontSize: 215, fontWeight: 800, letterSpacing: 0 }}
      >
        {word}
      </text>
    </>
  )

  const toggleTear = () => {
    const target = currentP > 0.5 ? 0 : 1
    let startTime: number | null = null
    const duration = 900
    const startP = currentP

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const fraction = Math.min(1, elapsed / duration)
      const eased = fraction < 0.5 ? 2 * fraction * fraction : 1 - Math.pow(-2 * fraction + 2, 2) / 2
      setAnimProgress(startP + (target - startP) * eased)
      if (fraction < 1) {
        requestAnimationFrame(step)
      } else {
        setIsTorn(target === 1)
      }
    }
    requestAnimationFrame(step)
  }

  return (
    <section
      ref={rootRef}
      className={"relative w-full " + className}
      style={{
        height,
        background: paper,
        overflow: "hidden",
      }}
      onPointerMove={(e) => (pointer.current = { x: e.clientX, y: e.clientY })}
      onPointerLeave={() => (pointer.current = null)}
      onPointerDown={() => s.pop > 0.4 && (squintAt.current = performance.now())}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox={FRAME}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={(tagline ? tagline + ". " : "") + word + ", torn in two revealing the SkillsCatalyst Explorer Penguin."}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <linearGradient id={id + "-sky"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a0e1a" />
              <stop offset="35%" stopColor="#1a0d2e" />
              <stop offset="70%" stopColor="#3d1245" />
              <stop offset="100%" stopColor="#d96638" />
            </linearGradient>

            <radialGradient id={id + "-sunset-glow"} cx="0.5" cy="0.82" r="0.6">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.88" />
              <stop offset="45%" stopColor="#ec4899" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1a0d2e" stopOpacity="0" />
            </radialGradient>

            <linearGradient id={id + "-aurora-left"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={id + "-aurora-right"} x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
            </linearGradient>

            <linearGradient id={id + "-beak"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <radialGradient id={id + "-iris"}>
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="35%" stopColor={eyeColor} />
              <stop offset="78%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>

            <linearGradient id={id + "-lid"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.75" />
              <stop offset="1" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            <linearGradient id={id + "-curl-top"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d9d4cb" />
            </linearGradient>
            <linearGradient id={id + "-curl-bottom"} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d9d4cb" />
            </linearGradient>

            <filter id={id + "-soft"} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>

            <filter id={id + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={"translate(" + shake.toFixed(2) + " " + (shake * 0.4).toFixed(2) + ")"}>
            {/* The Explorer Penguin revealed behind the torn sheet */}
            {s.open > 0 ? (
              <g transform={penguinTransform}>
                <PenguinSummitScene id={id} plumage={furColor} />
                <g filter={s.pop > 0.02 ? "url(#" + id + "-glow)" : undefined}>
                  {PENGUIN_EYES.map(([x, y], i) => (
                    <PenguinEye
                      key={i}
                      id={id}
                      x={x}
                      y={y}
                      flip={i === 0}
                      look={look}
                      blink={curBlink}
                      pupil={pupil}
                      scale={eyeScale}
                      fibres={fibres}
                    />
                  ))}
                </g>
              </g>
            ) : null}

            {/* Torn Paper Halves */}
            {s.open > 0 ? (
              <>
                <Half id={id} side="top" line={line} open={s.open}>
                  {sheet}
                </Half>
                <Half id={id} side="bottom" line={line} open={s.open}>
                  {sheet}
                </Half>
              </>
            ) : (
              sheet
            )}

            {/* Pre-tear crack line */}
            {s.crack > 0 && s.open < 0.15 && crack.length > 1 ? (
              <path
                d={d(crack, false)}
                fill="none"
                stroke="#1e0f08"
                strokeWidth={2.4}
                strokeLinejoin="bevel"
                opacity={1 - s.open / 0.15}
              />
            ) : null}
          </g>
        </svg>

        {/* Interactive Tear / Close pill button & hint */}
        {hint && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
            <button
              type="button"
              onClick={toggleTear}
              className="px-4 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-semibold text-slate-800 shadow-md backdrop-blur-sm border border-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {currentP > 0.5 ? "Close Poster" : "Tear Poster"}
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500 hidden sm:inline-block">
              {currentP > 0.5 ? "Click or move cursor to interact" : "Scroll down to tear"}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

export const PenguinTearReveal = TigerTearReveal
export default TigerTearReveal
