import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../node_modules/mapbox-gl/dist/mapbox-gl.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NWS Demo",
  description: "just a demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
