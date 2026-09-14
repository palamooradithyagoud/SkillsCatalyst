"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

export interface iNavItem {
  heading: string;
  href: string;
  subheading?: string;
  imgSrc?: string;
}

export interface iNavLinkProps extends iNavItem {
  setIsActive: (isActive: boolean) => void;
  index: number;
}

export interface iCurvedNavbarProps {
  setIsActive: (isActive: boolean) => void;
  navItems: iNavItem[];
  footer?: React.ReactNode;
}

export interface iHeaderProps {
  navItems?: iNavItem[];
  footer?: React.ReactNode;
}

export const MENU_SLIDE_ANIMATION = {
  initial: { x: "calc(100% + 100px)" },
  enter: { x: "0", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const } },
  exit: {
    x: "calc(100% + 100px)",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const },
  },
};

export const defaultNavItems: iNavItem[] = [
  {
    heading: "Dashboard",
    href: "/dashboard",
    subheading: "Overview & Metrics",
  },
  {
    heading: "Learning",
    href: "/learning",
    subheading: "Courses & Playlists",
  },
  {
    heading: "Roadmaps",
    href: "/roadmaps",
    subheading: "Interactive Career Tracks",
  },
  {
    heading: "Practice",
    href: "/practice",
    subheading: "Placement Prep & Coding",
  },
  {
    heading: "Career",
    href: "/career",
    subheading: "AI Resume & ATS Review",
  },
  {
    heading: "Explore",
    href: "/explore",
    subheading: "Trending Skills & Grants",
  },
  {
    heading: "Analytics",
    href: "/analytics",
    subheading: "Performance & Readiness",
  },
  {
    heading: "Profile",
    href: "/settings",
    subheading: "Account & Preferences",
  },
];

export const CustomFooter: React.FC = () => null;

export const NavLink: React.FC<iNavLinkProps> = ({
  heading,
  href,
  setIsActive,
  index,
}) => {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleClick = () => {
    setIsActive(false);
  };

  return (
    <motion.div
      onClick={handleClick}
      initial="initial"
      whileHover="whileHover"
      className="group relative flex items-center justify-between border-b border-black/15 py-2.5 sm:py-3.5 transition-colors duration-300 uppercase"
    >
      <Link ref={ref} onMouseMove={handleMouseMove} href={href} className="w-full">
        <div className="relative flex items-center">
          <span className="text-black/40 group-hover:text-black transition-colors duration-300 text-lg sm:text-2xl font-light mr-3 sm:mr-4 select-none">
            0{index}.
          </span>
          <div className="flex flex-row gap-1">
            <motion.span
              variants={{
                initial: { x: 0 },
                whileHover: { x: 8 },
              }}
              transition={{
                type: "spring",
                staggerChildren: 0.05,
                delayChildren: 0.1,
              }}
              className="relative z-10 block text-2xl sm:text-3xl md:text-4xl font-light text-black transition-colors duration-300 tracking-tight"
            >
              {heading.split("").map((letter, i) => (
                <motion.span
                  key={i}
                  variants={{
                    initial: { x: 0 },
                    whileHover: { x: 8 },
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="inline-block"
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const Curve: React.FC = () => {
  const [height, setHeight] = useState(800);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHeight(window.innerHeight);
      const handleResize = () => setHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const initialPath = `M100 0 L200 0 L200 ${height} L100 ${height} Q-100 ${height / 2} 100 0`;
  const targetPath = `M100 0 L200 0 L200 ${height} L100 ${height} Q100 ${height / 2} 100 0`;

  const curve: any = {
    initial: { d: initialPath },
    enter: {
      d: targetPath,
      transition: { duration: 1, ease: [0.76, 0, 0.24, 1] as const },
    },
    exit: {
      d: initialPath,
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const },
    },
  };

  return (
    <svg
      className="absolute top-0 -left-[99px] w-[100px] stroke-none h-full pointer-events-none z-40"
      style={{ fill: "#ffffff" }}
    >
      <motion.path
        variants={curve}
        initial="initial"
        animate="enter"
        exit="exit"
      />
    </svg>
  );
};

export const CurvedNavbar: React.FC<iCurvedNavbarProps> = ({
  setIsActive,
  navItems,
  footer,
}) => {
  return (
    <motion.div
      variants={MENU_SLIDE_ANIMATION as any}
      initial="initial"
      animate="enter"
      exit="exit"
      className="h-[100dvh] w-full max-w-sm sm:max-w-md fixed right-0 top-0 z-[70] bg-white shadow-2xl text-black flex flex-col justify-between overflow-y-auto pb-6"
    >
      <div className="min-h-full pt-8 sm:pt-10 flex flex-col justify-between">
        {/* Header & Close Button */}
        <div className="flex flex-col gap-2 px-6 sm:px-10">
          <div className="flex items-center justify-between text-black border-b border-black/20 pb-3 uppercase text-xs tracking-widest font-bold">
            <p>SkillsCatalyst Navigation</p>
            <button
              onClick={() => setIsActive(false)}
              className="p-1 rounded-lg hover:bg-black/5 text-black transition-colors cursor-pointer"
              aria-label="Close Menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="mt-2">
            <div className="w-full">
              {navItems.map((item, index) => (
                <NavLink
                  key={item.href}
                  {...item}
                  setIsActive={setIsActive}
                  index={index + 1}
                />
              ))}
            </div>
          </nav>
        </div>

        {footer || <CustomFooter />}
      </div>
      <Curve />
    </motion.div>
  );
};

const Header: React.FC<iHeaderProps> = ({
  navItems = defaultNavItems,
  footer = <CustomFooter />,
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <>
      <div className="relative">
        <div
          onClick={handleClick}
          className="fixed right-3 top-3 z-50 w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer bg-white/40 backdrop-blur-xl border border-black/10 shadow-xs"
          aria-label="Toggle Menu"
        >
          <div className="relative w-6 h-5 flex flex-col justify-between items-center">
            <span
              className={`block h-0.5 w-6 bg-black transition-transform duration-300 ${isActive ? "rotate-45 translate-y-2" : ""
                }`}
            />
            <span
              className={`block h-0.5 w-6 bg-black transition-opacity duration-300 ${isActive ? "opacity-0" : ""
                }`}
            />
            <span
              className={`block h-0.5 w-6 bg-black transition-transform duration-300 ${isActive ? "-rotate-45 -translate-y-2.5" : ""
                }`}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isActive && (
          <>
            {/* Soft Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsActive(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65]"
            />
            <CurvedNavbar
              setIsActive={setIsActive}
              navItems={navItems}
              footer={footer}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
