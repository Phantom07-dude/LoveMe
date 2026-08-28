import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoveMe — Your private space for two",
  description: "Questions, memories, deep thoughts and games for two people.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
