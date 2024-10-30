import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Toaster } from "@/components/ui/toaster";

import { getConfig } from "./config";
import { Providers } from "./providers";
import Navbar from "@/components/navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ChainPlay",
  description: "Support your favorite Games with ChainPlay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get("cookie")
  );
  return (
    <html className="dark" lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers initialState={initialState}>
          <Navbar />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
