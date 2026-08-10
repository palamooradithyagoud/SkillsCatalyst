"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  BookOpen,
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  Bookmark,
  Check,
  Terminal,
  ShieldCheck,
  Zap,
  Tv,
  ChevronLeft,
} from "lucide-react";

export interface SubtopicDetailInfo {
  id: string;
  name: string;
  parentName: string;
  isRecommended?: boolean;
  isAlternative?: boolean;
  isOrderNotStrict?: boolean;
  docUrl?: string;
  desc?: string;
}

interface SubtopicDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subtopic: SubtopicDetailInfo | null;
  isCompleted: boolean;
  onToggleStatus: (subtopicId: string) => void;
}

interface ResourceItem {
  title: string;
  type: string;
  url: string;
  desc: string;
}

// ── YouTube links (exact user-provided) ────────────────────────────────────────
// ONLY these exact links will be used. No fallback to /learning.
const SUBTOPIC_YT_LINKS: Record<string, string> = {
  win:     "https://www.youtube.com/watch?v=Jfvg3CS1X3A",
  suse:    "https://www.youtube.com/watch?v=CZwAgf3f8CM",
  rhel:    "https://www.youtube.com/watch?v=HEBvdSI0wGQ",
  freebsd: "https://www.youtube.com/watch?v=NKHzcXwTdB4",
  openbsd: "https://www.youtube.com/watch?v=uTrOIPIx7pY",
  netbsd:  "https://www.youtube.com/watch?v=2UbPdKdwbzA&t=3s",
};

// ── Documentation-only knowledge database ─────────────────────────────────────
const SUBTOPIC_KNOWLEDGE: Record<
  string,
  {
    summary: string;
    keyConcepts: string[];
    cheatSheet: string;
    useCases: string[];
    resources: ResourceItem[];   // docs only — no YouTube entries here
  }
> = {
  // ── Languages ──────────────────────────────────────────────────────────────
  py: {
    summary:
      "Python is the industry-standard scripting language for DevOps engineers, automated cloud infrastructure management, Boto3 AWS SDK scripts, PyTest test suites, and data pipelines.",
    keyConcepts: [
      "Boto3 AWS SDK & Cloud API Automation",
      "Parsing YAML, JSON, and ENV files",
      "System administration scripts & process automation",
      "PyTest & Virtual Environments (venv / poetry)",
    ],
    cheatSheet: `# Python DevOps Snippet: AWS S3 List Buckets
import boto3

s3 = boto3.client('s3')
response = s3.list_buckets()

for bucket in response['Buckets']:
    print(f"Bucket: {bucket['Name']}")`,
    useCases: ["AWS Automation scripts", "Kubernetes Operators with Kopf", "CLI tool building with Click/Typer"],
    resources: [
      { title: "Python Official Documentation", type: "Docs", url: "https://docs.python.org/3/", desc: "Official language reference and standard library docs" },
      { title: "Boto3 AWS SDK for Python", type: "SDK", url: "https://boto3.amazonaws.com/v1/documentation/api/latest/index.html", desc: "Automate AWS infrastructure using Python" },
      { title: "Python for DevOps Guide", type: "Tutorial", url: "https://realpython.com/python-for-devops/", desc: "Hands-on scripting techniques for systems engineers" },
    ],
  },

  go: {
    summary:
      "Go (Golang) is the foundational language of modern cloud native infrastructure. Docker, Kubernetes, Terraform, Hugo, and Prometheus are built natively in Go due to its fast compilation and static binary distribution.",
    keyConcepts: [
      "Goroutines & Concurrent Channels",
      "Static single binary compilation",
      "Cobra CLI framework for dev tools",
      "Kubernetes client-go & Custom Resource Controllers",
    ],
    cheatSheet: `// Go HTTP Health Check Snippet
package main

import (
\t"fmt"
\t"net/http"
)

func main() {
\tresp, err := http.Get("https://api.github.com/health")
\tif err != nil || resp.StatusCode != 200 {
\t\tfmt.Println("Service Status: DOWN")
\t\treturn
\t}
\tfmt.Println("Service Status: HEALTHY (200 OK)")
}`,
    useCases: ["Microservice APIs", "Docker & K8s ecosystem tools", "High-performance CLI utilities"],
    resources: [
      { title: "Go Language Documentation", type: "Docs", url: "https://go.dev/doc/", desc: "Official Golang documentation and tutorials" },
      { title: "Build K8s Controllers in Go", type: "Guide", url: "https://kubernetes.io/docs/concepts/architecture/controller/", desc: "Learn how Go powers Kubernetes control loops" },
    ],
  },

  // ── DevOps Tools ───────────────────────────────────────────────────────────
  docker: {
    summary:
      "Docker revolutionized application deployment by packaging applications and their dependencies into lightweight, isolated Linux containers that run consistently across any environment.",
    keyConcepts: [
      "Dockerfile & Multi-stage builds",
      "Image layers, caching & minimal base images (Alpine/Distroless)",
      "Docker Compose multi-container orchestration",
      "Container storage volumes & bridge networking",
    ],
    cheatSheet: `# Multi-stage Dockerfile Best Practice
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]`,
    useCases: ["Local development replication", "CI/CD containerized testing", "Microservices container deployment"],
    resources: [
      { title: "Docker Official Reference", type: "Docs", url: "https://docs.docker.com/", desc: "Comprehensive container runtime and CLI documentation" },
      { title: "Docker Container Security", type: "Best Practices", url: "https://docs.docker.com/develop/security-best-practices/", desc: "Hardening container images for production" },
    ],
  },

  tf: {
    summary:
      "Terraform by HashiCorp is the leading open-source Infrastructure as Code (IaC) tool for declaratively provisioning, managing, and versioning cloud infrastructure across AWS, GCP, Azure, and Kubernetes.",
    keyConcepts: [
      "HCL Syntax & Declarative Resource Blocks",
      "Terraform State file management & remote backend locking (S3/DynamoDB)",
      "Reusable Terraform Modules & Variables",
      "Plan & Apply lifecycle execution",
    ],
    cheatSheet: `# Terraform AWS EC2 Instance Block
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "SkillsCatalyst-Production-Server"
    Env  = "production"
  }
}`,
    useCases: ["Automated Cloud Infrastructure Provisioning", "Multi-cloud deployments", "Infrastructure Versioning"],
    resources: [
      { title: "Terraform Official Docs", type: "Docs", url: "https://developer.hashicorp.com/terraform/docs", desc: "HashiCorp Terraform syntax, providers, and modules" },
      { title: "AWS Provider Module Registry", type: "Registry", url: "https://registry.terraform.io/providers/hashicorp/aws/latest/docs", desc: "Official AWS Terraform provider resources" },
    ],
  },

  k8s: {
    summary:
      "Kubernetes is an open-source container orchestration system for automating deployment, scaling, load balancing, and management of containerized applications.",
    keyConcepts: [
      "Pods, Deployments, ReplicaSets & StatefulSets",
      "Services (ClusterIP, NodePort, LoadBalancer) & Ingress Routers",
      "ConfigMaps & Encrypted Secrets",
      "Self-healing & Horizontal Pod Autoscaling (HPA)",
    ],
    cheatSheet: `# Kubernetes Deployment Manifest Snippet
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: myregistry/api:v1.2.0
        ports:
        - containerPort: 8080`,
    useCases: ["Production microservices scheduling", "High availability cloud clusters", "Automated rollouts & rollbacks"],
    resources: [
      { title: "Kubernetes Documentation", type: "Docs", url: "https://kubernetes.io/docs/", desc: "Official production Kubernetes guides and reference" },
      { title: "Kubernetes Interactive Tutorials", type: "Practice", url: "https://kubernetes.io/docs/tutorials/", desc: "Step-by-step hands-on K8s cluster exercises" },
    ],
  },

  // ── Operating Systems ──────────────────────────────────────────────────────
  win: {
    summary:
      "Windows Server and Desktop OS by Microsoft — the dominant enterprise platform for Active Directory, IIS web hosting, PowerShell automation, and WSL2 Linux subsystem integration in DevOps pipelines.",
    keyConcepts: [
      "Active Directory & Group Policy Management",
      "IIS Web Server & Windows Services",
      "PowerShell scripting & automation",
      "WSL2 (Windows Subsystem for Linux) for DevOps",
    ],
    cheatSheet: `# PowerShell: Check service status & restart
Get-Service -Name "W32Time" | Select-Object Status, Name
Restart-Service -Name "W32Time" -Force

# List all running processes sorted by CPU
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, Id`,
    useCases: ["Enterprise Active Directory management", "IIS-hosted .NET application servers", "PowerShell CI/CD automation scripts"],
    resources: [
      { title: "Microsoft Windows Official Site", type: "Official Site", url: "https://www.microsoft.com/en-in/windows/?r=1", desc: "Official Microsoft Windows product page with downloads, features, and support resources." },
      { title: "Microsoft Windows Documentation", type: "Docs", url: "https://learn.microsoft.com/en-us/windows/", desc: "Microsoft Learn official documentation — Windows Server, PowerShell, WSL, and enterprise features." },
    ],
  },

  suse: {
    summary:
      "SUSE Linux Enterprise (SLE) and openSUSE are enterprise-grade Linux distributions featuring the YaST configuration tool, RPM package management, and strong support for SAP and cloud-native workloads.",
    keyConcepts: [
      "YaST (Yet another Setup Tool) — unified system configuration",
      "zypper & RPM package management",
      "openSUSE Leap vs SUSE Linux Enterprise differences",
      "Btrfs filesystem with snapper snapshots",
    ],
    cheatSheet: `# SUSE zypper package management
zypper refresh                    # Refresh repositories
zypper install -y nginx           # Install package
zypper update                     # Update all packages
zypper search <package>           # Search for a package

# YaST text-mode configuration
yast2 network                     # Configure network
yast2 firewall                    # Configure firewall`,
    useCases: ["SAP HANA on-premise workloads", "Enterprise Linux server administration", "SUSE Rancher Kubernetes management"],
    resources: [
      { title: "SUSE Documentation", type: "Docs", url: "https://documentation.suse.com/", desc: "Official SUSE Linux Enterprise and openSUSE product documentation." },
    ],
  },

  rhel: {
    summary:
      "Red Hat Enterprise Linux (RHEL) is the industry-leading enterprise Linux distribution used by Fortune 500 companies, with YUM/DNF package management, SELinux security, and Red Hat certification ecosystem.",
    keyConcepts: [
      "YUM / DNF package management & RPM ecosystem",
      "SELinux (Security-Enhanced Linux) mandatory access control",
      "systemd service management & journalctl logs",
      "Red Hat Subscription Manager (subscription-manager)",
    ],
    cheatSheet: `# RHEL / CentOS / Rocky Linux package management
dnf install -y nginx              # Install package
dnf update                        # Update all packages
dnf search <package>              # Search package
rpm -qa | grep nginx              # List installed RPMs

# SELinux management
getenforce                        # Check SELinux mode
setenforce 0                      # Set permissive (temp)
sestatus                          # Full SELinux status`,
    useCases: ["Enterprise production Linux servers", "Red Hat OpenShift Kubernetes clusters", "RHEL-certified software deployments"],
    resources: [
      { title: "Red Hat Official Documentation", type: "Docs", url: "https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/", desc: "Official Red Hat Enterprise Linux product documentation and administration guides." },
    ],
  },

  freebsd: {
    summary:
      "FreeBSD is a powerful open-source Unix-like OS renowned for its ZFS filesystem, network performance, jails (lightweight containers), and the ports collection — widely used in Netflix, WhatsApp, and PlayStation network infrastructure.",
    keyConcepts: [
      "ZFS filesystem — snapshots, compression & RAID-Z",
      "FreeBSD Jails — lightweight OS-level virtualisation",
      "Ports Collection & pkg package manager",
      "pf (Packet Filter) firewall configuration",
    ],
    cheatSheet: `# FreeBSD package management
pkg update && pkg upgrade         # Update package index
pkg install -y nginx              # Install package
pkg search <name>                 # Search packages

# ZFS snapshot management
zfs snapshot tank/data@backup1    # Create snapshot
zfs list -t snapshot              # List all snapshots
zfs rollback tank/data@backup1    # Rollback snapshot`,
    useCases: ["High-performance network appliances", "ZFS-based NAS storage servers", "Netflix & WhatsApp CDN infrastructure"],
    resources: [
      { title: "FreeBSD Official Handbook", type: "Docs", url: "https://docs.freebsd.org/en/books/handbook/", desc: "The definitive FreeBSD Handbook covering all aspects of the operating system." },
    ],
  },

  openbsd: {
    summary:
      "OpenBSD is a security-focused Unix-like OS and the upstream home of OpenSSH, pf firewall, and LibreSSL. It prioritises correctness, security, and integrated cryptography over all else.",
    keyConcepts: [
      "pf (Packet Filter) — the premier BSD firewall",
      "OpenSSH — originated from OpenBSD project",
      "pledge() & unveil() — security syscall sandboxing",
      "pkg_add package management & ports tree",
    ],
    cheatSheet: `# OpenBSD package management
pkg_add nginx                     # Install package
pkg_info | grep nginx             # List installed
pkg_delete nginx                  # Remove package

# pf firewall basics
pfctl -e                          # Enable pf
pfctl -d                          # Disable pf
pfctl -f /etc/pf.conf             # Reload ruleset
pfctl -sr                         # Show current rules`,
    useCases: ["Secure network gateways & firewalls", "Bastion / jump host servers", "Minimal attack-surface production servers"],
    resources: [
      { title: "OpenBSD Official Documentation", type: "Docs", url: "https://www.openbsd.org/faq/", desc: "Official OpenBSD FAQ and documentation covering installation, networking, and security." },
    ],
  },

  netbsd: {
    summary:
      "NetBSD is the ultra-portable Unix-like OS famous for running on everything from toasters to supercomputers. It excels in embedded systems, research environments, and edge computing due to its clean, well-documented kernel.",
    keyConcepts: [
      "pkgsrc — portable package management across all platforms",
      "Extreme hardware portability (70+ supported architectures)",
      "Rump Kernels — running kernel code in userspace",
      "sysinst — text-based installation system",
    ],
    cheatSheet: `# NetBSD pkgsrc package management
pkgin update                      # Update package list
pkgin install nginx               # Install package
pkgin search <name>               # Search packages
pkgin list                        # List installed packages

# Service management (rc.d)
/etc/rc.d/nginx start             # Start service
/etc/rc.d/nginx stop              # Stop service
/etc/rc.d/nginx status            # Check service status`,
    useCases: ["Embedded & IoT device OS", "Research & academic OS projects", "Portable systems requiring cross-platform support"],
    resources: [
      { title: "NetBSD Official Documentation", type: "Docs", url: "https://www.netbsd.org/docs/", desc: "Official NetBSD documentation — guides, tutorials, and the NetBSD Guide." },
    ],
  },
};

export default function SubtopicDetailDrawer({
  isOpen,
  onClose,
  subtopic,
  isCompleted,
  onToggleStatus,
}: SubtopicDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"about" | "resources">("about");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!subtopic || !mounted) return null;

  // Get the exact YouTube URL for this subtopic (user-provided) — no fallback to /learning
  const ytUrl = SUBTOPIC_YT_LINKS[subtopic.id] ?? null;

  // Build knowledge — use stored entry or generate a minimal default (docs only)
  const knowledgeEntry = SUBTOPIC_KNOWLEDGE[subtopic.id];
  const knowledge = knowledgeEntry ?? {
    summary:
      subtopic.desc ||
      `${subtopic.name} is a key component of the ${subtopic.parentName} domain in modern DevOps and Cloud infrastructure engineering.`,
    keyConcepts: [
      `Core concepts & fundamental architecture of ${subtopic.name}`,
      `Production setup, configuration best practices, and security hardening`,
      `Integration with CI/CD pipelines, container runtimes, and monitoring tools`,
      `Troubleshooting, log analysis, and system diagnostics`,
    ],
    cheatSheet: `# ${subtopic.name} Quick Verification\n${subtopic.name.toLowerCase().replace(/[^a-z0-9]/g, "")} --version`,
    useCases: [
      `Automating ${subtopic.name} within cloud pipelines`,
      `High-availability production deployment setups`,
      `Enterprise monitoring, auditing, and compliance`,
    ],
    resources: [
      {
        title: subtopic.docUrl ? `${subtopic.name} Documentation` : `Official ${subtopic.name} Guide`,
        type: "Official Docs",
        url: subtopic.docUrl || `https://www.google.com/search?q=${encodeURIComponent(subtopic.name + " devops documentation")}`,
        desc: `Official guides, reference manuals, and tutorials for ${subtopic.name}`,
      },
    ],
  };

  const portalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden flex justify-end">
          {/* Darkened Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[10000]"
          />

          {/* Slide-over Panel mounted at document body root */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative z-[10001] w-full sm:w-[540px] md:w-[600px] max-w-full h-full bg-[#0b1329] border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Header with Mobile Back Button & Close Button */}
            <div className="p-3.5 sm:p-5 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Dedicated Mobile Back Button */}
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
                  aria-label="Back to Roadmap"
                >
                  <ChevronLeft className="w-4 h-4 text-emerald-400" />
                  <span>Back</span>
                </button>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                      {subtopic.parentName}
                    </span>
                    {subtopic.isRecommended && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" /> RECOMMENDED
                      </span>
                    )}
                    {subtopic.isAlternative && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ALTERNATIVE
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2 leading-tight">
                    <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                    <span className="truncate">{subtopic.name}</span>
                  </h2>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shrink-0 cursor-pointer shadow-md active:scale-95"
                aria-label="Close subtopic drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Banner */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#080d19] border-b border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              {/* YouTube button */}
              {ytUrl ? (
                <a
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Tv className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="truncate">Watch {subtopic.name} on YouTube</span>
                  <ExternalLink className="w-3 h-3 text-rose-300 shrink-0" />
                </a>
              ) : (
                <div className="hidden sm:block" />
              )}

              {/* Status Toggle Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleStatus(subtopic.id)}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isCompleted
                      ? "bg-amber-400/20 border border-amber-400/60 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]"
                      : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleStatus(subtopic.id)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCompleted
                      ? "bg-emerald-500 border border-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Completed</span>
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-[#070b14] px-4 sm:px-6 pt-2 gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "about"
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>About</span>
              </button>

              <button
                onClick={() => setActiveTab("resources")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "resources"
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Resources & Docs</span>
              </button>
            </div>

            {/* Content Area with Extra Scroll Space at Bottom */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28 sm:pb-8">
              {activeTab === "about" ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0f172a] border border-slate-800/90 space-y-2 shadow-sm">
                    <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Overview
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {knowledge.summary}
                    </p>
                  </div>

                  {/* Key Concepts */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" /> Key Concepts & Learning Pillars
                    </h4>
                    <div className="space-y-2">
                      {knowledge.keyConcepts.map((concept, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#0c1324] border border-slate-800/80 text-xs sm:text-sm font-semibold text-slate-200 flex items-start gap-3 shadow-xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{concept}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cheat Sheet */}
                  {knowledge.cheatSheet && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Actionable Cheat Sheet / Code Example
                      </h4>
                      <pre className="p-4 rounded-xl bg-[#050914] border border-slate-800 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
                        <code>{knowledge.cheatSheet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Use Cases */}
                  {knowledge.useCases && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Production DevOps Use Cases
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {knowledge.useCases.map((useCase, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs font-bold text-purple-200 flex items-center gap-2"
                          >
                            <span>🚀</span>
                            <span>{useCase}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Resources Tab — docs only */
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-cyan-400" /> Official Documentation & References
                  </h4>

                  {knowledge.resources.map((res, rIdx) => (
                    <a
                      key={rIdx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block p-4 rounded-2xl border transition-all space-y-1.5 cursor-pointer bg-[#0c1324] border-slate-800/80 hover:border-cyan-500/50 hover:bg-[#101a30] shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-white group-hover:text-cyan-300">
                          <span>{res.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400 opacity-80 group-hover:opacity-100 shrink-0" />
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shrink-0">
                          {res.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-normal leading-relaxed">
                        {res.desc}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(portalContent, document.body);
}
