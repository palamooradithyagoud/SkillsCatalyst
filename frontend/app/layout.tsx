import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import QueryProvider from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth";
import { TransitionProvider } from "@/providers/TransitionProvider";

export const metadata: Metadata = {
  title: "SkillsCatalyst — Learn Faster. Grow Smarter.",
  description: "Track your progress and get personalized career recommendations powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased flex flex-col md:flex-row min-h-screen" suppressHydrationWarning>
        <QueryProvider>
          <TransitionProvider>
            <AuthProvider>
              <AppShell>{children}</AppShell>
            </AuthProvider>
          </TransitionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
