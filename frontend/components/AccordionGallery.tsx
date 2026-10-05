'use client';

import { useRef, useEffect, useState, useCallback, CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { gsap } from 'gsap';

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

const DEFAULT_ITEMS: AccordionGalleryItem[] = [
  { image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
  { image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
  { image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
  { image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
  { image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' }
];

const LOCAL_FALLBACKS = [
  '/images/career/resume_review.jpg',
  '/images/career/quantitative_aptitude.jpg',
  '/images/career/logical_reasoning.jpg',
  '/images/career/verbal_ability.jpg',
  '/images/career/ai_interviews.jpg',
];

const AccordionGallery = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 0,
  accentColor = '#ffffff',
  overlayColor = '#101523',
  textColor = '#ffffff',
  height = 185,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  className = ''
}: AccordionGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);

  const vertical = orientation === 'vertical';
  const count = items.length;
  const isSingle = count === 1;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));
  const [imgFallbacks, setImgFallbacks] = useState<Record<number, string>>({});

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const overlayBg = `linear-gradient(180deg, transparent 45%, color-mix(in srgb, ${overlayColor} 78%, transparent) 100%), color-mix(in srgb, ${overlayColor} calc(var(--ag-dim, 0.35) * 100%), transparent)`;

  const applyLayout = useCallback(
    (animate: boolean) => {
      if (isSingle) return;
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              '--ag-gray': gray,
              '--ag-dim': isActive ? 0 : 0.35,
              duration: dur,
              ease
            },
            0
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
          } else {
            tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [
      isSingle,
      active,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced
    ]
  );

  useEffect(() => {
    if (isSingle) {
      const media = mediaRefs.current[0];
      const bar = barRefs.current[0];
      const text = textRefs.current[0];
      if (media) {
        gsap.set(media, {
          x: 0,
          y: 0,
          scale: 1,
          '--ag-gray': grayscale ? 1 : 0,
          '--ag-dim': 0.35,
        });
      }
      if (bar && text) {
        gsap.set([bar, text], {
          opacity: 0.85,
          x: 0,
        });
      }
    }
  }, [isSingle, grayscale]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  const handleSingleMouseMove = (e: MouseEvent) => {
    if (!isSingle) return;
    const el = panelRefs.current[0];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotY = x * tilt * 2;
    const rotX = -y * tilt * 2;
    const shiftX = x * parallax * 15;
    const shiftY = y * parallax * 15;
    
    gsap.to(el, {
      rotateX: rotX,
      rotateY: rotY,
      scale: 1.05,
      y: -6,
      zIndex: 20,
      duration: 0.15,
      ease: 'power2.out',
    });
    const media = mediaRefs.current[0];
    if (media) {
      gsap.to(media, {
        x: shiftX,
        y: shiftY,
        scale: 1.06,
        '--ag-gray': 0,
        '--ag-dim': 0,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  };

  const handleSingleMouseEnter = () => {
    if (!isSingle) return;
    const el = panelRefs.current[0];
    const media = mediaRefs.current[0];
    const bar = barRefs.current[0];
    const text = textRefs.current[0];
    if (el) {
      gsap.to(el, {
        scale: 1.05,
        y: -6,
        zIndex: 20,
        boxShadow: '0 20px 35px -8px rgba(0,0,0,0.7), 0 0 25px rgba(125,38,205,0.3)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
    if (media) {
      gsap.to(media, {
        scale: 1.06,
        '--ag-gray': 0,
        '--ag-dim': 0,
        duration: 0.35,
        ease: 'power2.out',
      });
    }
    if (showLabels && bar && text) {
      gsap.to([bar, text], {
        opacity: 1,
        x: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleSingleMouseLeave = () => {
    if (!isSingle) return;
    const el = panelRefs.current[0];
    const media = mediaRefs.current[0];
    const bar = barRefs.current[0];
    const text = textRefs.current[0];
    if (el) {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        y: 0,
        zIndex: 1,
        boxShadow: '0 10px 30px -18px rgba(0,0,0,0.8)',
        duration: 0.4,
        ease: 'power2.out',
      });
    }
    if (media) {
      gsap.to(media, {
        x: 0,
        y: 0,
        scale: 1,
        '--ag-gray': grayscale ? 1 : 0,
        '--ag-dim': 0.35,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
    if (showLabels && bar && text) {
      gsap.to([bar, text], {
        opacity: 0.85,
        x: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleEnter = (i: number) => {
    if (trigger === 'hover') setActive(i);
  };

  const handleClick = (i: number, e: MouseEvent) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`flex ${vertical ? 'flex-col' : 'flex-row'} w-full max-w-full [perspective:1400px] ${className}`}
      style={{
        gap: `${gap}px`,
        height: isSingle ? '100%' : vertical ? `${Math.round(height * 1.6)}px` : `${height}px`,
        minHeight: `${height}px`,
      }}
      role="list"
      aria-label="Image accordion gallery"
    >
      {items.map((item, i) => {
        const isActive = isSingle ? true : i === active;
        const Tag = (item.link ? 'a' : 'div') as 'a';
        const displayImg = imgFallbacks[i] || item.image;
        return (
          <Tag
            key={i}
            ref={(el: HTMLElement | null) => {
              panelRefs.current[i] = el;
            }}
            className="group relative block min-w-0 min-h-0 w-full h-full flex-[1_1_0] cursor-pointer overflow-hidden bg-[#101523] no-underline outline-none [transform-style:preserve-3d] [transform-origin:center] [box-shadow:0_10px_30px_-18px_rgba(0,0,0,0.8)] focus-visible:[box-shadow:0_0_0_2px_var(--ag-accent),0_10px_30px_-18px_rgba(0,0,0,0.8)] border border-white/10"
            style={
              {
                borderRadius: `${radius}px`,
                '--ag-accent': accentColor,
                willChange: 'flex-grow, transform'
              } as CSSProperties
            }
            href={item.link || undefined}
            onClick={e => handleClick(i, e)}
            onMouseEnter={() => {
              if (isSingle) handleSingleMouseEnter();
              else handleEnter(i);
            }}
            onMouseLeave={() => {
              if (isSingle) handleSingleMouseLeave();
            }}
            onMouseMove={e => {
              if (isSingle) handleSingleMouseMove(e);
            }}
            onFocus={() => setActive(i)}
            onKeyDown={e => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            <span className="absolute inset-0 overflow-hidden [border-radius:inherit]">
              <span
                ref={(el: HTMLElement | null) => {
                  mediaRefs.current[i] = el;
                }}
                className={`absolute ${isSingle ? 'inset-0 w-full h-full' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} [filter:grayscale(var(--ag-gray,1))]`}
                style={{
                  width: isSingle ? '100%' : vertical ? '100%' : 'var(--ag-media-size, 320px)',
                  height: isSingle ? '100%' : vertical ? 'var(--ag-media-size, 320px)' : '100%',
                  willChange: 'transform, filter'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImg}
                  alt={item.alt || item.label || ''}
                  draggable={false}
                  onError={() => {
                    const fallback = LOCAL_FALLBACKS[i % LOCAL_FALLBACKS.length];
                    if (displayImg !== fallback) {
                      setImgFallbacks(prev => ({ ...prev, [i]: fallback }));
                    }
                  }}
                  className="block h-full w-full select-none object-cover [-webkit-user-drag:none]"
                />
              </span>
              <span
                className="pointer-events-none absolute inset-0"
                style={{ background: overlayBg }}
                aria-hidden="true"
              />
            </span>
            {showLabels && (
              <span
                className="pointer-events-none absolute bottom-3 left-3 right-3 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 z-[2] flex items-center gap-2"
                aria-hidden="true"
              >
                <span
                  ref={(el: HTMLElement | null) => {
                    barRefs.current[i] = el;
                  }}
                  className="h-[18px] w-[3px] flex-none rounded-[3px] opacity-80"
                  style={{
                    background: accentColor,
                    boxShadow: `0 0 12px color-mix(in srgb, ${accentColor} 60%, transparent)`
                  }}
                />
                <span
                  ref={(el: HTMLElement | null) => {
                    textRefs.current[i] = el;
                  }}
                  className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold tracking-[0.01em] opacity-85 [text-shadow:0_2px_14px_rgba(0,0,0,0.8)]"
                  style={{ color: textColor }}
                >
                  {item.label}
                </span>
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
