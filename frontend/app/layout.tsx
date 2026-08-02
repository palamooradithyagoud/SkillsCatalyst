import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import QueryProvider from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth";

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
          <AuthProvider>
            {/* Subtle ambient orbs in background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[120px]" />
              <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-cyan-600/5 blur-[100px]" />
            </div>
            <Sidebar />
            <MobileNav />
            <main className="relative z-10 flex-1 p-4 sm:p-6 md:p-8 lg:p-10 pb-24 md:pb-8 overflow-y-auto">
              {children}
            </main>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
