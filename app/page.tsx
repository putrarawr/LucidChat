"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Cpu,
  Layers,
  Headphones,
  FileText,
  Swords,
  Code2,
  CheckCircle2,
  MessageSquare,
  Wand2,
} from "lucide-react";
import { GeminiLogo, OpenAILogo, ClaudeLogo, DeepSeekLogo, KimiLogo, QwenLogo, LlamaLogo } from "@/components/icons/ModelLogos";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-white font-sans selection:bg-white/20 selection:text-white relative overflow-hidden">
      {/* Soft Ambient Background Lighting Glows (No AI Slop) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-blue-600/10 via-purple-600/05 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[500px] bg-emerald-600/05 blur-[150px] pointer-events-none rounded-full" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#07070d]/80 border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
              <img src="/logo.png" alt="LucidChat" className="w-full h-full object-cover rounded-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
              LucidChat
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/60 font-medium">
            <a href="#fitur" className="hover:text-white transition-colors">
              Fitur Unggulan
            </a>
            <a href="#model" className="hover:text-white transition-colors">
              Model AI
            </a>
            <a href="#keunggulan" className="hover:text-white transition-colors">
              Keunggulan
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all duration-200"
            >
              Masuk
            </Link>
            <Link
              href="/chat"
              className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
            >
              <span>Coba Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-5xl mx-auto text-center space-y-8 z-10">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
            Kecerdasan Buatan Tanpa Batas dalam Satu Platform
          </h1>
          <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-2xl mx-auto font-normal">
            Akses 15+ model AI terkemuka, panggilan suara hands-free, pemindaian dokumen otomatis, dan riset web real-time — dalam antarmuka cairan kaca yang elegan.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/chat"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5"
          >
            <span>Mulai Percakapan Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#fitur"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center"
          >
            Jelajahi Fitur
          </a>
        </div>

        {/* Interactive Mock Interface Preview */}
        <div className="pt-12">
          <div className="relative rounded-3xl bg-[#0c0c14]/90 border border-white/15 p-4 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-left overflow-hidden">
            {/* Window Top Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-medium text-white/40 font-mono">LucidChat AI Studio</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/50">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10">
                  <GeminiLogo className="w-3.5 h-3.5" />
                  <span>Gemini 3.6 Flash</span>
                </span>
              </div>
            </div>

            {/* Chat Body Mock */}
            <div className="py-6 space-y-4">
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-white/10 text-white text-xs px-4 py-3 rounded-2xl max-w-sm border border-white/15">
                  Analisis dokumen laporan ini dan buatkan komponen UI web interaktif dalam HTML/CSS/JS.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/[0.04] text-white/90 text-xs px-4 py-3 rounded-2xl max-w-md border border-white/[0.08] space-y-2">
                  <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Dokumen Berhasil Dipindai & Dianalisis
                  </p>
                  <p className="text-white/70">
                    Berikut adalah komponen UI web interaktif yang telah dirancang lengkap dalam satu blok kode HTML/CSS/JS:
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/50 font-mono text-[11px] text-cyan-300 border border-white/10 flex items-center justify-between">
                    <span>```html &lt;div class=&quot;dashboard-card&quot;&gt;...&lt;/div&gt;</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Live Preview</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar Mock */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/70">
                  Auto-Scan Doc: Active
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Voice Persona Ready
                </span>
              </div>
              <span className="hidden sm:inline">Tekan &apos;/&apos; untuk perintah AI cepat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Model Providers Showcase Grid */}
      <section id="model" className="py-16 border-y border-white/[0.08] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-8">
          <p className="text-xs font-semibold tracking-widest text-white/40 uppercase">
            Ditenagai oleh Provider AI Terkemuka Dunia
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 items-center justify-center opacity-80">
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 transition-all">
              <GeminiLogo className="w-5 h-5" />
              <span className="text-xs font-semibold text-white/80">Gemini</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 transition-all">
              <OpenAILogo className="w-5 h-5" />
              <span className="text-xs font-semibold text-white/80">OpenAI</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 transition-all">
              <ClaudeLogo className="w-5 h-5" />
              <span className="text-xs font-semibold text-white/80">Claude</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 transition-all">
              <DeepSeekLogo className="w-5 h-5" />
              <span className="text-xs font-semibold text-white/80">DeepSeek</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 transition-all">
              <KimiLogo className="w-5 h-5" />
              <span className="text-xs font-semibold text-white/80">Kimi AI</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 transition-all">
              <QwenLogo className="w-5 h-5" />
              <span className="text-xs font-semibold text-white/80">Qwen</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 transition-all">
              <LlamaLogo className="w-5 h-5" />
              <span className="text-xs font-semibold text-white/80">Llama</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid (Tanpa Badge Bar Slop) */}
      <section id="fitur" className="py-24 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Fitur Canggih untuk Produktivitas Tanpa Batas
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            Setiap fitur dirancang secara teliti dengan fokus pada kecepatan, estetika visual, dan kemudahan pengguna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Multi-Model AI Ensemble */}
          <div className="p-7 rounded-3xl bg-[#0c0c14] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Model AI Ensemble</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Beralih secara instan antara Gemini 3.6 Flash, GPT-4o, Claude 3.7, DeepSeek R1, dan Qwen Coder dalam satu percakapan.
            </p>
          </div>

          {/* Card 2: Hands-Free Voice Call */}
          <div className="p-7 rounded-3xl bg-[#0c0c14] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Panggilan Suara Hands-Free</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Simulasi percakapan telepon lisan real-time dengan sapaan nama pengguna dan karakter intonasi suara sesuai provider AI.
            </p>
          </div>

          {/* Card 3: Auto-Scan Dokumen & Foto */}
          <div className="p-7 rounded-3xl bg-[#0c0c14] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Pemindaian Dokumen &amp; Foto</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Unggah file PDF, Excel, Word, CSV, Kode, atau Foto via Drag &amp; Drop. AI memindai dan mengekstrak teks secara otomatis.
            </p>
          </div>

          {/* Card 4: DeepSearch Real-Time */}
          <div className="p-7 rounded-3xl bg-[#0c0c14] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Riset Web &amp; Analisis Link</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Penelusuran web berita terkini real-time serta pemrosesan tautan media sosial (TikTok, YouTube, Twitter/X) beserta sitasi.
            </p>
          </div>

          {/* Card 5: Mode Arena Side-by-Side */}
          <div className="p-7 rounded-3xl bg-[#0c0c14] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Mode Arena Comparison</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Bandingkan kualitas respons dari 2 model AI sekaligus secara side-by-side dalam satu tampilan interaktif.
            </p>
          </div>

          {/* Card 6: Artefak Kode & Mermaid Diagram */}
          <div className="p-7 rounded-3xl bg-[#0c0c14] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Artefak Web &amp; Mermaid Diagram</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Pratinjau langsung komponen HTML/CSS/JS interaktif di panel terpisah serta visualisasi flowchart Mermaid.js.
            </p>
          </div>
        </div>
      </section>

      {/* Keunggulan Section */}
      <section id="keunggulan" className="py-20 px-6 max-w-5xl mx-auto border-t border-white/[0.08]">
        <div className="bg-gradient-to-br from-[#0e0e18] via-[#090912] to-[#0e0e18] border border-white/15 rounded-3xl p-8 sm:p-12 space-y-8 relative overflow-hidden shadow-2xl">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Mengapa Memilih LucidChat AI?
            </h2>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
              Dirancang khusus untuk produktivitas profesional dengan fokus kebebasan memilih kecerdasan AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-white/90">Privasi &amp; Keamanan Data Terjaga</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-white/90">Kecepatan Respons Tinggi</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-white/90">Tanpa Perlu Setup Rumit</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <Wand2 className="w-5 h-5 text-purple-400 shrink-0" />
              <span className="text-xs font-semibold text-white/90">Antarmuka Cairan Kaca Modern</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Siap Mengakselerasi Produktivitas Anda?
        </h2>
        <p className="text-xs sm:text-sm text-white/50 max-w-xl mx-auto leading-relaxed">
          Mulai percakapan dengan AI pilihan Anda dalam hitungan detik secara gratis.
        </p>
        <div className="pt-2">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>Mulai Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.08] text-center text-xs text-white/40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center p-0.5">
              <img src="/logo.png" alt="LucidChat" className="w-full h-full object-cover rounded" />
            </div>
            <span className="font-medium text-white/70">LucidChat AI &copy; 2026</span>
          </div>
          <div className="flex items-center gap-6 text-white/50">
            <Link href="/chat" className="hover:text-white transition-colors">
              Chat Studio
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
