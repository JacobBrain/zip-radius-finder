import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZIP Radius Finder",
  description: "Find ZIP codes within a radius of a center ZIP code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
