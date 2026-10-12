import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lucidchat-ai.vercel.app";

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
    google: [
      "7uQGS3EmRA64Z8Wly73Zs7ZAOJpFzXN-dJFt51009Mo",
      "C76-Ymp8Dk4TtuLp2h09HPvgGbVQV5Do6ngnVOo8CJs",
    ],
  },
};


const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "LucidChat AI",
  "url": siteUrl,
  "description": "Platform AI Chatbot Multi-Model terdepan dengan dukungan Gemini 3.6 Flash, Kimi AI, GPT-4o, Claude 3.7 Sonnet, DeepSeek V3/R1, AI Image Generator, Voice-to-Text, Prompt Library, dan Web Search Crawler Real-Time.",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "All",
  "inLanguage": "id-ID",
  "featureList": [
    "Multi-Model AI Chat (Gemini 3.6 Flash, OpenAI GPT-4o, Claude 3.7 Sonnet, DeepSeek R1, Kimi Moonshot)",
    "Real-Time Web Search Crawler",
    "AI Image Generator & Canvas Editor",
    "Voice-to-Text Speech Recognition",
    "Curated Prompt Library",
    "Document Parsing & Chat with File",
    "Stop Generation Abort Controller",
    "User Context Memory Persona"
  ],
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Apakah LucidChat gratis untuk digunakan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya, LucidChat dapat digunakan 100% gratis dengan kuota harian server yang selalu diperbarui setiap hari. Pengguna juga dapat memasukkan API Key pribadi (BYOK) untuk akses chat tanpa batas kuota."
      }
    },
    {
      "@type": "Question",
      "name": "Model AI apa saja yang didukung oleh LucidChat?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "LucidChat mendukung lebih dari 15 model kecerdasan buatan terdepan di dunia, termasuk Google Gemini 3.6 Flash, OpenAI GPT-4o, Claude 3.7 Sonnet, DeepSeek V3 & R1, Qwen 2.5 Coder, Kimi Moonshot, dan Llama 3.3 70B."
      }
    },
    {
      "@type": "Question",
      "name": "Bagaimana cara bypass batas rate limit atau kuota di LucidChat?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Gunakan fitur Bring Your Own Key (BYOK) di menu Settings. Anda bisa mendapatkan API Key gratis 100% tanpa kartu kredit dari Google AI Studio (aistudio.google.com/app/apikey) atau Groq Cloud (console.groq.com/keys)."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah LucidChat mendukung live code execution dan web search?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya, LucidChat dilengkapi dengan fitur Live Code Artifact Preview untuk menjalankan kode HTML/React/Tailwind langsung di browser, serta Web Search Crawler real-time untuk jawaban terkini."
      }
    }
  ]
};

import { I18nProvider } from "@/lib/i18n/I18nContext";
import { Analytics } from "@vercel/analytics/next";

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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#090a0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LucidChat" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="google-site-verification" content="7uQGS3EmRA64Z8Wly73Zs7ZAOJpFzXN-dJFt51009Mo" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--surface-0)] text-white select-none overflow-x-hidden font-sans">
        <I18nProvider>{children}</I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
