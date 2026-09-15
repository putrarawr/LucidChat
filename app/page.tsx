"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import {
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
  Wand2,
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Search,
  Image as ImageIcon,
  Mic,
  Share2,
} from "lucide-react";
import {
  GeminiLogo,
  OpenAILogo,
  ClaudeLogo,
  DeepSeekLogo,
  KimiLogo,
  QwenLogo,
  LlamaLogo,
} from "@/components/icons/ModelLogos";

// Dynamically import Three.js scene (client-only, no SSR)
const HeroScene = dynamic(() => import("@/components/landing/HeroScene"), {
  ssr: false,
});

// ─── Animated Counter ───
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const duration = 2000;
          const startTime = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            start = Math.floor(eased * target);
            setCount(start);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

// ─── Scroll-Reveal Wrapper ───
function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── GSAP Horizontal Scroll Section ───
function HorizontalScrollFeatures() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gsapInstance: typeof import("gsap") | null = null;
    let scrollTriggerInstance: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;

    const init = async () => {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      gsapInstance = gsapModule;
      scrollTriggerInstance = scrollTriggerModule.ScrollTrigger;
      gsapInstance.gsap.registerPlugin(scrollTriggerInstance);

      if (!trackRef.current || !containerRef.current) return;

      const totalWidth = trackRef.current.scrollWidth - window.innerWidth;

      gsapInstance.gsap.to(trackRef.current, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${totalWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });
    };

    init();

    return () => {
      if (scrollTriggerInstance) {
        scrollTriggerInstance.getAll().forEach((t) => t.kill());
      }
    };
  }, []);

  const features = [
    {
      icon: Layers,
      title: "Multi-Model Ensemble",
      desc: "Pindah antar Gemini, GPT-4o, Claude, DeepSeek, Qwen, Kimi, dan Llama dengan satu klik. Setiap model punya keunggulan masing-masing.",
      gradient: "from-blue-500/20 to-purple-500/20",
      accent: "text-blue-400",
    },
    {
      icon: Headphones,
      title: "Hands-Free Voice Call",
      desc: "Berbicara langsung dengan AI seperti menelepon. Tersedia sapaan personal dan intonasi berbeda per model.",
      gradient: "from-emerald-500/20 to-teal-500/20",
      accent: "text-emerald-400",
    },
    {
      icon: FileText,
      title: "Drag & Drop Scanner",
      desc: "Seret file PDF, Excel, Word, CSV, kode, atau foto langsung ke chat. AI memindai dan mengekstrak isi dokumen secara otomatis.",
      gradient: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-400",
    },
    {
      icon: Globe,
      title: "Deep Web Search",
      desc: "Riset berita terkini, analisis link sosial media (YouTube, TikTok, X), dan web crawling real-time dengan sitasi sumber.",
      gradient: "from-cyan-500/20 to-blue-500/20",
      accent: "text-cyan-400",
    },
    {
      icon: Swords,
      title: "Arena Mode",
      desc: "Kirim satu prompt ke 2 model berbeda sekaligus. Bandingkan jawaban side-by-side untuk memilih AI terbaik.",
      gradient: "from-red-500/20 to-pink-500/20",
      accent: "text-red-400",
    },
    {
      icon: Code2,
      title: "Live Code Artifacts",
      desc: "AI menghasilkan komponen HTML/CSS/JS yang langsung bisa di-preview secara interaktif. Termasuk Mermaid.js diagrams.",
      gradient: "from-violet-500/20 to-purple-500/20",
      accent: "text-violet-400",
    },
    {
      icon: Search,
      title: "Smart Enhance Prompt",
      desc: "Optimalkan prompt Anda secara otomatis. AI meningkatkan kejelasan dan detail prompt sebelum mengirimnya.",
      gradient: "from-rose-500/20 to-amber-500/20",
      accent: "text-rose-400",
    },
    {
      icon: Share2,
      title: "Share Conversations",
      desc: "Bagikan percakapan menarik via link publik. Orang lain bisa melihat dialog AI Anda tanpa perlu login.",
      gradient: "from-teal-500/20 to-emerald-500/20",
      accent: "text-teal-400",
    },
  ];

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-[#07070d]">
      <div ref={trackRef} className="flex items-stretch gap-6 px-8 py-8" style={{ width: "fit-content" }}>
        {/* Intro Card */}
        <div className="w-[400px] shrink-0 flex flex-col justify-center pr-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Fitur yang Membuat<br />Produktivitas Tanpa Batas
          </h2>
          <p className="mt-4 text-sm text-white/40 leading-relaxed max-w-sm">
            Geser untuk menjelajahi semua kemampuan LucidChat AI Platform.
          </p>
          <div className="mt-6 flex items-center gap-2 text-white/30 text-xs">
            <ArrowRight className="w-4 h-4 animate-pulse" />
            <span>Scroll untuk melihat lebih banyak</span>
          </div>
        </div>

        {/* Feature Cards */}
        {features.map(({ icon: Icon, title, desc, gradient, accent }, idx) => (
          <div
            key={idx}
            className={`w-[340px] shrink-0 p-7 rounded-3xl bg-gradient-to-br ${gradient} border border-white/[0.08] hover:border-white/20 transition-all duration-500 space-y-5 group backdrop-blur-sm`}
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center ${accent} group-hover:scale-110 transition-transform duration-500`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-[13px] text-white/50 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Interactive Demo Section ───
function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      icon: MessageSquare,
      label: "Multi-Model Chat",
      prompt: "Jelaskan perbedaan arsitektur Transformer dan Mamba",
      response:
        "Transformer menggunakan mekanisme self-attention yang memproses seluruh sekuens secara paralel dengan kompleksitas O(n2), sementara Mamba (Structured State Space Model) memproses sekuens secara linear O(n) menggunakan selective state spaces yang membuat inferensi lebih efisien untuk konteks panjang...",
      model: "Gemini 3.6 Flash",
      ModelLogo: GeminiLogo,
    },
    {
      icon: ImageIcon,
      label: "Scan Dokumen",
      prompt: "Analisis invoice PT Maju Jaya.pdf yang baru saya upload",
      response:
        "Dokumen berhasil dipindai. Ini adalah invoice #INV-2026-0847 dari PT Maju Jaya tertanggal 12 September 2026 dengan total Rp 24.750.000 untuk 3 item: Server Maintenance (Rp 15.000.000), Cloud Hosting 6 bulan (Rp 7.250.000), dan SSL Certificate (Rp 2.500.000). Status: Belum Dibayar.",
      model: "Claude 3.7 Sonnet",
      ModelLogo: ClaudeLogo,
    },
    {
      icon: Mic,
      label: "Voice Call AI",
      prompt: '[Hands-Free Mode] "Hai, tolong jelaskan quantum computing"',
      response:
        '"Halo! Quantum computing menggunakan qubit yang bisa berada di state 0 dan 1 secara bersamaan berkat superposisi. Ini memungkinkan komputasi paralel masif yang jauh lebih cepat untuk masalah tertentu seperti kriptografi dan simulasi molekular..."',
      model: "GPT-4o",
      ModelLogo: OpenAILogo,
    },
    {
      icon: Globe,
      label: "Web Search",
      prompt: "Apa berita teknologi AI terbesar minggu ini?",
      response:
        "Berdasarkan pencarian web terkini: 1) Google DeepMind merilis Gemini 3.6 dengan kemampuan reasoning yang melampaui GPT-5 di beberapa benchmark. 2) Anthropic mengumumkan Claude 4 untuk enterprise. 3) NVIDIA meluncurkan GPU Blackwell Ultra dengan performa AI training 3x lebih cepat. [Sumber: TechCrunch, The Verge, Reuters]",
      model: "DeepSeek R1",
      ModelLogo: DeepSeekLogo,
    },
  ];

  const active = tabs[activeTab];

  return (
    <section id="demo" className="py-28 px-6 max-w-6xl mx-auto">
      <ScrollReveal>
        <div className="text-center space-y-3 mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Lihat Langsung Aksinya
          </h2>
          <p className="text-sm text-white/40 leading-relaxed">
            Klik tab di bawah untuk melihat berbagai kemampuan LucidChat secara interaktif.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                  activeTab === idx
                    ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Demo Card */}
        <div className="relative rounded-3xl bg-[#0c0c14]/90 border border-white/[0.1] p-6 sm:p-8 backdrop-blur-2xl overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />

          {/* Model Tag */}
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <active.ModelLogo className="w-4 h-4" />
            <span className="text-xs text-white/50 font-medium">{active.model}</span>
          </div>

          {/* Conversation */}
          <div className="space-y-5 relative z-10">
            {/* User */}
            <div className="flex justify-end">
              <div
                key={`user-${activeTab}`}
                className="bg-white/[0.08] text-white text-[13px] px-5 py-3.5 rounded-2xl max-w-lg border border-white/[0.1] leading-relaxed animate-glass-appear"
              >
                {active.prompt}
              </div>
            </div>
            {/* AI */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white/60" />
              </div>
              <div
                key={`ai-${activeTab}`}
                className="bg-white/[0.03] text-white/80 text-[13px] px-5 py-3.5 rounded-2xl max-w-xl border border-white/[0.06] leading-relaxed animate-glass-appear"
              >
                {active.response}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// ─── MAIN LANDING PAGE ───
// ═══════════════════════════════════════════════════════════
export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP fade-in for hero text on mount
  useEffect(() => {
    const init = async () => {
      const { gsap } = await import("gsap");
      gsap.fromTo(
        ".hero-title",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.3 }
      );
      gsap.fromTo(
        ".hero-subtitle",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.6 }
      );
      gsap.fromTo(
        ".hero-cta",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.9 }
      );
      gsap.fromTo(
        ".hero-scroll-hint",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 1.3 }
      );
    };
    init();
  }, []);

  const providers = [
    { Logo: GeminiLogo, name: "Gemini" },
    { Logo: OpenAILogo, name: "OpenAI" },
    { Logo: ClaudeLogo, name: "Claude" },
    { Logo: DeepSeekLogo, name: "DeepSeek" },
    { Logo: KimiLogo, name: "Kimi AI" },
    { Logo: QwenLogo, name: "Qwen" },
    { Logo: LlamaLogo, name: "Llama" },
  ];

  return (
    <div className="min-h-screen bg-[#07070d] text-white font-sans selection:bg-white/20 selection:text-white relative overflow-hidden">
      {/* ═══ FLOATING NAVBAR ═══ */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl transition-all duration-500 ${
          isScrolled
            ? "top-3 bg-[#0c0c14]/90 backdrop-blur-2xl border border-white/[0.12] shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
            : "bg-[#0c0c14]/40 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        } rounded-2xl`}
      >
        <div className="px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              <img src="/logo.png" alt="LucidChat" className="w-full h-full object-cover rounded-lg" />
            </div>
            <span className="text-base font-bold tracking-tight text-white hidden sm:inline">
              LucidChat
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[13px] text-white/50 font-medium">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#model" className="hover:text-white transition-colors">Model AI</a>
            <a href="#stats" className="hover:text-white transition-colors">Statistik</a>
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/login" className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all duration-200">
              Masuk
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              Daftar Gratis
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden px-5 pb-4 pt-1 border-t border-white/[0.08] space-y-2">
            <a href="#fitur" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-white/60 hover:text-white">Fitur</a>
            <a href="#demo" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-white/60 hover:text-white">Demo</a>
            <a href="#model" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-white/60 hover:text-white">Model AI</a>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1 py-2.5 text-center rounded-xl text-xs font-medium text-white/70 bg-white/[0.06] border border-white/10">Masuk</Link>
              <Link href="/register" className="flex-1 py-2.5 text-center rounded-xl text-xs font-semibold bg-white text-black">Daftar</Link>
            </div>
          </div>
        )}
      </header>

      {/* ═══ HERO SECTION with THREE.JS ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Three.js Background */}
        <HeroScene />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07070d]/40 via-transparent to-[#07070d] z-[1] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white opacity-0">
            Satu Platform,{" "}
            <span className="bg-gradient-to-r from-white via-white/70 to-white/40 bg-clip-text text-transparent">
              Semua Kecerdasan
            </span>
          </h1>

          <p className="hero-subtitle text-base sm:text-lg text-white/40 leading-relaxed max-w-2xl mx-auto opacity-0">
            Akses 15+ model AI terkemuka dunia, panggilan suara hands-free, pemindaian dokumen, dan riset web real-time dalam antarmuka liquid glass yang elegan.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 opacity-0">
            <Link
              href="/register"
              className="group w-full sm:w-auto px-9 py-4 rounded-2xl bg-white text-black font-bold text-sm shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5"
            >
              <span>Mulai Gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white font-medium text-sm transition-all duration-300 flex items-center justify-center"
            >
              Lihat Demo
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hero-scroll-hint absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0">
          <span className="text-[11px] text-white/30 tracking-wider uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 text-white/30 animate-bounce" />
        </div>
      </section>

      {/* ═══ PROVIDER LOGOS MARQUEE ═══ */}
      <section id="model" className="py-14 border-y border-white/[0.06] bg-white/[0.005] overflow-hidden">
        <ScrollReveal>
          <p className="text-center text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-8">
            Ditenagai oleh Provider AI Terkemuka
          </p>
        </ScrollReveal>
        {/* Infinite marquee */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#07070d] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#07070d] to-transparent z-10 pointer-events-none" />
          <div className="marquee-track flex items-center gap-8">
            {[...providers, ...providers, ...providers].map(({ Logo, name }, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300 group shrink-0"
              >
                <Logo className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="text-[12px] font-semibold text-white/50 group-hover:text-white/90 transition-colors whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HORIZONTAL SCROLL FEATURES (GSAP) ═══ */}
      <section id="fitur">
        <HorizontalScrollFeatures />
      </section>

      {/* ═══ INTERACTIVE DEMO ═══ */}
      <InteractiveDemo />

      {/* ═══ STATS SECTION ═══ */}
      <section id="stats" className="py-24 px-6 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: 15, suffix: "+", label: "Model AI Tersedia" },
                { value: 100, suffix: "%", label: "Gratis Digunakan" },
                { value: 8, suffix: "+", label: "Format Dokumen" },
                { value: 24, suffix: "/7", label: "Akses Kapan Saja" },
              ].map(({ value, suffix, label }, idx) => (
                <div
                  key={idx}
                  className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 group"
                >
                  <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2 group-hover:scale-105 transition-transform">
                    <AnimatedCounter target={value} suffix={suffix} />
                  </div>
                  <p className="text-xs text-white/40 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-28 px-6 max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Tiga Langkah Sederhana
            </h2>
            <p className="text-sm text-white/40 max-w-xl mx-auto">
              Tidak perlu instalasi, konfigurasi API key, atau setup yang rumit.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Daftar Gratis",
              desc: "Buat akun dalam hitungan detik menggunakan email atau Google. Tanpa kartu kredit.",
              color: "from-blue-500/10 to-blue-500/5",
            },
            {
              step: "02",
              title: "Pilih Model AI",
              desc: "Pilih dari 15+ model AI terkemuka atau gunakan mode Lucid All-in-One untuk routing otomatis.",
              color: "from-purple-500/10 to-purple-500/5",
            },
            {
              step: "03",
              title: "Mulai Percakapan",
              desc: "Ketik, bicara, atau unggah dokumen. AI siap membantu Anda dalam bahasa apa saja.",
              color: "from-emerald-500/10 to-emerald-500/5",
            },
          ].map(({ step, title, desc, color }, idx) => (
            <ScrollReveal key={idx} delay={idx * 150}>
              <div className={`relative p-8 rounded-3xl bg-gradient-to-b ${color} border border-white/[0.08] hover:border-white/[0.16] transition-all duration-500 group h-full`}>
                <span className="text-5xl font-black text-white/[0.06] absolute top-4 right-6 group-hover:text-white/[0.1] transition-colors">
                  {step}
                </span>
                <div className="relative z-10 space-y-3 pt-8">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="text-[13px] text-white/45 leading-relaxed">{desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ WHY LUCIDCHAT ═══ */}
      <section id="keunggulan" className="py-24 px-6 max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="bg-gradient-to-br from-[#0e0e18] via-[#090912] to-[#0e0e18] border border-white/[0.08] rounded-3xl p-8 sm:p-14 space-y-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-white/[0.015] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-white/[0.01] blur-[100px] rounded-full pointer-events-none" />

            <div className="space-y-3 max-w-xl relative z-10">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Mengapa LucidChat?
              </h2>
              <p className="text-sm text-white/40 leading-relaxed">
                Platform AI generasi baru yang dirancang untuk memberdayakan kreativitas dan produktivitas Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {[
                { icon: ShieldCheck, text: "Privasi & Keamanan Data dengan RLS", color: "text-emerald-400/80" },
                { icon: Zap, text: "Respons Real-time Tanpa Delay", color: "text-amber-400/80" },
                { icon: Cpu, text: "Tanpa Setup API Key atau Konfigurasi", color: "text-cyan-400/80" },
                { icon: Wand2, text: "Liquid Glass Interface yang Premium", color: "text-purple-400/80" },
                { icon: Layers, text: "Multi-Model Switching Instan", color: "text-blue-400/80" },
                { icon: Globe, text: "Riset Web & Analisis Link Otomatis", color: "text-rose-400/80" },
              ].map(({ icon: Icon, text, color }, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group"
                >
                  <Icon className={`w-5 h-5 ${color} shrink-0 group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-medium text-white/75 group-hover:text-white transition-colors">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="py-28 px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
        <ScrollReveal>
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Siap Mengakselerasi<br />Produktivitas Anda?
            </h2>
            <p className="text-sm text-white/40 max-w-xl mx-auto leading-relaxed">
              Bergabung sekarang dan rasakan kekuatan multi-model AI dalam satu platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl bg-white text-black font-bold text-sm shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <span>Daftar Gratis Sekarang</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white font-medium text-sm transition-all duration-300"
              >
                Sudah Punya Akun
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-10 border-t border-white/[0.06] text-xs text-white/30">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center p-0.5 overflow-hidden">
              <img src="/logo.png" alt="LucidChat" className="w-full h-full object-cover rounded" />
            </div>
            <span className="font-medium text-white/50">LucidChat AI &copy; 2026</span>
          </div>
          <div className="flex items-center gap-6 text-white/40">
            <Link href="/chat" className="hover:text-white transition-colors">Chat Studio</Link>
            <Link href="/login" className="hover:text-white transition-colors">Masuk</Link>
            <Link href="/register" className="hover:text-white transition-colors">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
