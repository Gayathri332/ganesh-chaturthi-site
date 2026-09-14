import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import MusicPlayer from "@/components/MusicPlayer";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Ganpati Bappa Morya — Happy Ganesh Chaturthi",
  description:
    "An interactive Ganesh Chaturthi greeting — browse Bappa's gallery and ask about Ganapati.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="font-body antialiased">
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
