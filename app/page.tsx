"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
  Wand2,
  Menu,
  X,
} from "lucide-react";
import { GeminiLogo, OpenAILogo, ClaudeLogo, DeepSeekLogo, KimiLogo, QwenLogo, LlamaLogo } from "@/components/icons/ModelLogos";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#07070d] text-white font-sans selection:bg-white/20 selection:text-white relative overflow-hidden">
      {/* Soft Ambient Background Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-blue-600/10 via-purple-600/05 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[500px] bg-emerald-600/05 blur-[150px] pointer-events-none rounded-full" />

      {/* ===== FLOATING NAVBAR ===== */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl transition-all duration-500 ${
          isScrolled
            ? "top-3 bg-[#0c0c14]/85 backdrop-blur-2xl border border-white/[0.12] shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
            : "bg-[#0c0c14]/50 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
        } rounded-2xl`}
      >
        <div className="px-5 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              <img src="/logo.png" alt="LucidChat" className="w-full h-full object-cover rounded-lg" />
            </div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-white/90 transition-colors hidden sm:inline">
              LucidChat
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] text-white/50 font-medium">
            <a href="#fitur" className="hover:text-white transition-colors duration-200">
              Fitur
            </a>
            <a href="#model" className="hover:text-white transition-colors duration-200">
              Model AI
            </a>
            <a href="#keunggulan" className="hover:text-white transition-colors duration-200">
              Keunggulan
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all duration-200"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-5 pb-4 pt-1 border-t border-white/[0.08] space-y-2 animate-glass-appear">
            <a href="#fitur" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-white/60 hover:text-white transition-colors">
              Fitur
            </a>
            <a href="#model" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-white/60 hover:text-white transition-colors">
              Model AI
            </a>
            <a href="#keunggulan" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-white/60 hover:text-white transition-colors">
              Keunggulan
            </a>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1 py-2.5 text-center rounded-xl text-xs font-medium text-white/70 bg-white/[0.06] border border-white/10">
                Masuk
              </Link>
              <Link href="/register" className="flex-1 py-2.5 text-center rounded-xl text-xs font-semibold bg-white text-black">
                Daftar
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-36 pb-24 px-6 max-w-5xl mx-auto text-center space-y-8 z-10">
        <div className="space-y-5 max-w-3xl mx-auto">
          {/* Subtle Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/50 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-white/40" />
            <span>Platform AI Multi-Model Generasi Terbaru</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
            Satu Platform,{" "}
            <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">
              Semua Kecerdasan
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/45 leading-relaxed max-w-2xl mx-auto font-normal">
            Akses 15+ model AI terkemuka, panggilan suara hands-free, pemindaian dokumen, dan riset web real-time dalam satu antarmuka liquid glass yang elegan.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/chat"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-black font-bold text-sm shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:shadow-[0_0_50px_rgba(255,255,255,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5"
          >
            <span>Mulai Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#fitur"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white font-medium text-sm transition-all duration-300 flex items-center justify-center"
          >
            Jelajahi Fitur
          </a>
        </div>

        {/* Interactive Preview Card */}
        <div className="pt-10">
          <div className="relative rounded-3xl bg-[#0c0c14]/90 border border-white/[0.12] p-5 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-left overflow-hidden">
            {/* Ambient Glow Inside Card */}
            <div className="absolute top-0 left-1/3 w-[300px] h-[200px] bg-white/[0.03] blur-[80px] rounded-full pointer-events-none" />

            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-2.5 text-[11px] font-medium text-white/30">LucidChat Studio</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] text-white/50">
                  <GeminiLogo className="w-3.5 h-3.5" />
                  <span>Gemini 3.6 Flash</span>
                </span>
              </div>
            </div>

            {/* Chat Conversation Mock */}
            <div className="py-5 space-y-4 relative z-10">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-white/[0.08] text-white text-[12px] sm:text-[13px] px-4 py-3 rounded-2xl max-w-sm border border-white/[0.1] leading-relaxed">
                  Analisis dokumen laporan ini dan buatkan ringkasan interaktif beserta visualisasi data.
                </div>
              </div>
              {/* AI Response */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white/70" />
                </div>
                <div className="bg-white/[0.03] text-white/85 text-[12px] sm:text-[13px] px-4 py-3 rounded-2xl max-w-md border border-white/[0.06] space-y-2 leading-relaxed">
                  <p className="font-semibold text-emerald-400/90 flex items-center gap-1.5 text-[12px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Dokumen Berhasil Dipindai & Dianalisis
                  </p>
                  <p className="text-white/60">
                    Berikut ringkasan interaktif dan visualisasi data yang telah dirancang:
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/40 font-mono text-[10px] text-cyan-300/80 border border-white/[0.06] flex items-center justify-between">
                    <span className="truncate">{"<Dashboard data={summary} chart='bar' />"}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300/70 shrink-0 ml-2">Preview</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/30 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50">
                  Multi-Model Ready
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/15 text-emerald-400/70">
                  Hands-Free Mode
                </span>
              </div>
              <span className="hidden sm:inline text-white/25">15+ Model AI Tersedia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Model Providers Grid */}
      <section id="model" className="py-16 border-y border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-8">
          <p className="text-[11px] font-semibold tracking-widest text-white/35 uppercase">
            Ditenagai oleh Provider AI Terkemuka
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 items-center justify-center">
            {[
              { Logo: GeminiLogo, name: "Gemini" },
              { Logo: OpenAILogo, name: "OpenAI" },
              { Logo: ClaudeLogo, name: "Claude" },
              { Logo: DeepSeekLogo, name: "DeepSeek" },
              { Logo: KimiLogo, name: "Kimi AI" },
              { Logo: QwenLogo, name: "Qwen" },
              { Logo: LlamaLogo, name: "Llama" },
            ].map(({ Logo, name }) => (
              <div
                key={name}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300 group"
              >
                <Logo className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-[11px] font-semibold text-white/60 group-hover:text-white/90 transition-colors">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fitur" className="py-24 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Fitur Canggih untuk Produktivitas Tanpa Batas
          </h2>
          <p className="text-sm text-white/40 leading-relaxed">
            Dirancang dengan fokus pada kecepatan, estetika, dan kemudahan pengguna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Layers,
              title: "Multi-Model AI Ensemble",
              desc: "Beralih instan antara Gemini, GPT-4o, Claude, DeepSeek, Qwen, dan lainnya dalam satu percakapan.",
            },
            {
              icon: Headphones,
              title: "Panggilan Suara Hands-Free",
              desc: "Simulasi percakapan lisan real-time dengan sapaan personal dan intonasi suara sesuai provider AI.",
            },
            {
              icon: FileText,
              title: "Pemindaian Dokumen & Foto",
              desc: "Unggah PDF, Excel, Word, CSV, Kode, atau Foto via Drag & Drop. AI memindai dan mengekstrak teks otomatis.",
            },
            {
              icon: Globe,
              title: "Riset Web & Analisis Link",
              desc: "Penelusuran web berita terkini real-time serta pemrosesan tautan media sosial beserta sitasi.",
            },
            {
              icon: Swords,
              title: "Mode Arena Comparison",
              desc: "Bandingkan kualitas respons dari 2 model AI sekaligus secara side-by-side dalam satu tampilan.",
            },
            {
              icon: Code2,
              title: "Artefak Web & Mermaid Diagram",
              desc: "Pratinjau langsung komponen HTML/CSS/JS interaktif dan visualisasi flowchart Mermaid.js.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-[#0c0c14]/80 border border-white/[0.08] hover:border-white/[0.16] transition-all duration-300 space-y-3.5 group"
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-[12px] text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why LucidChat */}
      <section id="keunggulan" className="py-20 px-6 max-w-5xl mx-auto border-t border-white/[0.06]">
        <div className="bg-gradient-to-br from-[#0e0e18] via-[#090912] to-[#0e0e18] border border-white/[0.1] rounded-3xl p-8 sm:p-12 space-y-8 relative overflow-hidden shadow-2xl">
          {/* Inner Glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />

          <div className="space-y-3 max-w-xl relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Mengapa Memilih LucidChat?
            </h2>
            <p className="text-xs sm:text-sm text-white/40 leading-relaxed">
              Dirancang khusus untuk produktivitas profesional dengan kebebasan memilih kecerdasan AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            {[
              { icon: ShieldCheck, text: "Privasi & Keamanan Data Terjaga", color: "text-emerald-400/80" },
              { icon: Zap, text: "Kecepatan Respons Tinggi", color: "text-amber-400/80" },
              { icon: Cpu, text: "Tanpa Perlu Setup Rumit", color: "text-cyan-400/80" },
              { icon: Wand2, text: "Antarmuka Liquid Glass Modern", color: "text-purple-400/80" },
            ].map(({ icon: Icon, text, color }) => (
              <div
                key={text}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
              >
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <span className="text-xs font-medium text-white/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Siap Mengakselerasi Produktivitas?
        </h2>
        <p className="text-xs sm:text-sm text-white/40 max-w-xl mx-auto leading-relaxed">
          Mulai percakapan dengan AI pilihan Anda dalam hitungan detik.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white text-black font-bold text-sm shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:shadow-[0_0_50px_rgba(255,255,255,0.45)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>Daftar Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white font-medium text-sm transition-all duration-300"
          >
            Sudah Punya Akun
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.06] text-center text-xs text-white/30">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center p-0.5 overflow-hidden">
              <img src="/logo.png" alt="LucidChat" className="w-full h-full object-cover rounded" />
            </div>
            <span className="font-medium text-white/50">LucidChat AI &copy; 2026</span>
          </div>
          <div className="flex items-center gap-6 text-white/40">
            <Link href="/chat" className="hover:text-white transition-colors">
              Chat Studio
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Daftar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
