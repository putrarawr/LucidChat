import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LucidChat",
  description: "Platform AI Chatbot Multi-Model dengan Desain Liquid Glass Monochrome",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: "google32c848f3e7e7b9ea",
  },
};

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
        <meta name="google-site-verification" content="google32c848f3e7e7b9ea" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--surface-0)] text-white select-none overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
