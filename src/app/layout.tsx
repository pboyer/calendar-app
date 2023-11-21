import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, APP_TITLE } from "./constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-white dark:bg-slate-800 text-black dark:text-white">
          <div className="z-10 w-full max-w-5xl font-mono text-sm">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
