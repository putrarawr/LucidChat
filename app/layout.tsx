import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucidchat.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LucidChat - Platform AI Chatbot Multi-Model & Web Crawler Indonesia",
    template: "%s | LucidChat AI",
  },
  description: "LucidChat adalah platform AI Chatbot Next-Gen Indonesia dengan dukungan Gemini 3.6 Flash, Kimi AI, GPT-4o, Claude 3.7 Sonnet, DeepSeek V3, AI Image Generator, dan Web Crawler Real-Time.",
  keywords: [
    "LucidChat",
    "AI Chatbot Indonesia",
    "Gemini 3.6 Flash",
    "Kimi AI",
    "Moonshot AI",
    "OpenAI GPT-4o",
    "Claude 3.7 Sonnet",
    "DeepSeek V3",
    "DeepSeek R1",
    "AI Image Generator",
    "Web Crawler AI",
    "Platform AI Multi-Model",
    "AI Indonesia",
    "Chatbot AI Gratis",
  ],
  authors: [{ name: "LucidChat Team", url: siteUrl }],
  creator: "LucidChat",
  publisher: "LucidChat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "id-ID": siteUrl,
      "en-US": siteUrl,
    },
  },
  openGraph: {
    title: "LucidChat - Platform AI Chatbot Multi-Model & Web Crawler",
    description: "Nikmati akses ke Gemini 3.6 Flash, Kimi AI, GPT-4o, Claude 3.7, DeepSeek R1, AI Image Generator, dan Web Search Real-Time dalam satu interface Liquid Glass modern.",
    url: siteUrl,
    siteName: "LucidChat",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "LucidChat AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LucidChat - Platform AI Chatbot Multi-Model & Web Crawler",
    description: "Akses model AI terbaik seperti Gemini 3.6 Flash, Kimi AI, GPT-4o, dan Claude 3.7 Sonnet secara instan.",
    images: ["/logo.png"],
    creator: "@lucidchat",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "C76-Ymp8Dk4TtuLp2h09HPvgGbVQV5Do6ngnVOo8CJs",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "LucidChat AI",
  "url": siteUrl,
  "description": "Platform AI Chatbot Multi-Model dengan Gemini 3.6 Flash, Kimi AI, GPT-4o, Claude 3.7 Sonnet, DeepSeek V3, AI Image Generator & Real-Time Web Crawler.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All",
  "inLanguage": "id-ID",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "LucidChat Indonesia",
    "url": siteUrl
  }
};

import { I18nProvider } from "@/lib/i18n/I18nContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark h-full antialiased">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="google-site-verification" content="C76-Ymp8Dk4TtuLp2h09HPvgGbVQV5Do6ngnVOo8CJs" />
        
        {/* GEO-Targeting Metadata */}
        <meta name="geo.region" content="ID-JK" />
        <meta name="geo.placename" content="Jakarta, Indonesia" />
        <meta name="geo.position" content="-6.2088;106.8456" />
        <meta name="ICBM" content="-6.2088, 106.8456" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--surface-0)] text-white select-none overflow-x-hidden font-sans">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
