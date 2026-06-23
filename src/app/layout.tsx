import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  weight: ["400", "500", "700"],
});

// Resolve the deployed origin so Open Graph / Twitter image URLs are
// absolute. Vercel injects these at build; localhost is the fallback.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "City Sprinters — The fastest Citi Bike riders in New York",
  description:
    "Upload your Citi Bike ride, get verified, and climb the leaderboard of the fastest riders in the city. An unofficial fan project.",
  openGraph: {
    title: "City Sprinters",
    description: "The fastest Citi Bike riders in New York City.",
    type: "website",
    url: "/",
    siteName: "City Sprinters",
  },
  twitter: {
    card: "summary_large_image",
    title: "City Sprinters",
    description: "The fastest Citi Bike riders in New York City.",
  },
};

// Mobile-first: most riders arrive on a phone. Tint the browser
// chrome to match the ground, draw under the notch (viewport-fit),
// and keep pinch-zoom available for accessibility.
export const viewport: Viewport = {
  themeColor: "#eef1f6",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
