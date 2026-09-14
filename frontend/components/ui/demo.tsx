"use client";

import React from "react";
import { Home, User, Briefcase, FileText } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import Header from "@/components/ui/curved-menu";

export function NavBarDemo() {
  const navItems = [
    { name: "Home", url: "#", icon: Home },
    { name: "About", url: "#", icon: User },
    { name: "Projects", url: "#", icon: Briefcase },
    { name: "Resume", url: "#", icon: FileText },
  ];

  return <NavBar items={navItems} />;
}

export function DemoOne() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="text-white h-screen text-7xl text-center flex justify-center items-center">
        hello<span className="italic">!</span>
      </div>
    </div>
  );
}

export default DemoOne;
