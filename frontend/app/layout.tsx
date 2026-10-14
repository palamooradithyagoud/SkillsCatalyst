import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import QueryProvider from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth";
import { TransitionProvider } from "@/providers/TransitionProvider";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://skillscatalyst.in"),
  title: {
    default: "SkillsCatalyst — Targeted Career Roadmaps & Placement Prep",
    template: "%s | SkillsCatalyst",
  },
  description:
    "Pick a career goal. Get the exact roadmap. Practise until you're interview-ready — with an AI mentor checking your code and resume. Built by students at Vardhaman College of Engineering, Hyderabad.",
  keywords: [
    "SkillsCatalyst",
    "Placement preparation",
    "DSA sheet",
    "Tech interview questions",
    "AI mock interview",
    "ATS resume review",
    "Vardhaman College of Engineering",
    "Career roadmaps",
  ],
  authors: [{ name: "SkillsCatalyst Team" }],
  creator: "SkillsCatalyst",
  publisher: "SkillsCatalyst",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://skillscatalyst.in",
    siteName: "SkillsCatalyst",
    title: "SkillsCatalyst — Targeted Career Roadmaps & Placement Prep",
    description:
      "Pick a career goal. Get the exact roadmap. Practise until you're interview-ready — with an AI mentor checking your code and resume.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SkillsCatalyst — Placement Preparation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillsCatalyst — Targeted Career Roadmaps & Placement Prep",
    description:
      "Pick a career goal. Get the exact roadmap. Practise until you're interview-ready.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <QueryProvider>
            <TransitionProvider>
              <AuthProvider>
                <AppShell>{children}</AppShell>
              </AuthProvider>
            </TransitionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
