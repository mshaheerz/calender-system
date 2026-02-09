import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/lib/calendar/theme";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calendar & Scheduling System",
  description:
    "Production-ready calendar and scheduling components with multiple view variants",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('calendar-theme');
                  if (!mode) {
                    var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                    mode = supportDarkMode ? 'dark' : 'light';
                    // Default to dark for this app since the layout uses it as default
                    if (!mode) mode = 'dark';
                  }
                  if (mode === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultMode="dark">{children}</ThemeProvider>
      </body>
    </html>
  );
}
