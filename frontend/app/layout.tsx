import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import QueryProvider from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth";
import { TransitionProvider } from "@/providers/TransitionProvider";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "SkillsCatalyst — Learn Faster. Grow Smarter.",
  description: "Track your progress and get personalized career recommendations powered by AI.",
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
    title: "SkillsCatalyst — Learn Faster. Grow Smarter.",
    description: "Track your progress and get personalized career recommendations powered by AI.",
    images: ["/logo.png"],
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
