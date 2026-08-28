import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow – Smart Task Prioritization System",
  description:
    "TaskFlow helps employees manage multiple tasks efficiently by calculating a Smart Priority Score based on priority, deadlines, and estimated completion time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
