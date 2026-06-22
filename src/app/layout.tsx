import type { Metadata } from "next";
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
  title: "Citi Sprints — The fastest Citi Bike riders in New York",
  description:
    "Upload your Citi Bike ride, get verified, and climb the leaderboard of the fastest riders in the city. An unofficial fan project.",
  openGraph: {
    title: "Citi Sprints",
    description: "The fastest Citi Bike riders in New York City.",
    type: "website",
    url: "/",
    siteName: "Citi Sprints",
  },
  twitter: {
    card: "summary_large_image",
    title: "Citi Sprints",
    description: "The fastest Citi Bike riders in New York City.",
  },
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
