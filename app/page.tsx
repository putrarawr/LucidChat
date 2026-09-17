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
  CheckCircle2,
  Mail,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";
import { FloatingLanguagePicker } from "@/components/ui/FloatingLanguagePicker";
import { playClickSound } from "@/lib/sound";
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
        transform: visible ? "translateY(0) scale(1)" : "translateY(35px) scale(0.98)",
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── NON-BOXY INTERACTIVE FEATURE HUB ───
function InteractiveFeatureHub() {
  const { lang, t } = useI18n();
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const features = [
    {
      id: "multi-model",
      icon: Layers,
      title: "Multi-Model Ensemble",
      tagline: lang === "id" ? "Satu Antarmuka, Belasan Otak AI Terunggul" : "One Interface, Dozens of Leading AI Engines",
      desc: lang === "id"
        ? "Beralih dengan mulus antara Gemini 3.6, GPT-4o, Claude 3.7, DeepSeek R1, Qwen, Kimi, dan Llama dalam sekejap tanpa kehilangan histori percakapan."
        : "Seamlessly switch between Gemini 3.6, GPT-4o, Claude 3.7, DeepSeek R1, Qwen, Kimi, and Llama instantly without losing conversation history.",
      details: lang === "id"
        ? ["Routing Otomatis", "Model Side-by-Side Comparison", "Konteks Panjang hingga 2M Tokens"]
        : ["Smart Auto-Routing", "Side-by-Side Model Comparison", "Long Context up to 2M Tokens"],
      demoType: "models",
    },
    {
      id: "voice",
      icon: Headphones,
      title: "Hands-Free Voice Call",
      tagline: lang === "id" ? "Percakapan Suara Real-Time Alami" : "Natural Real-Time Voice Conversation",
      desc: lang === "id"
        ? "Berbicara langsung dengan AI layaknya panggilan suara telepon. Dilengkapi intonasi ekspresif, sapaan personal, dan transliterasi otomatis."
        : "Speak directly with AI like a phone call. Equipped with expressive intonation, personalized greetings, and automatic transliteration.",
      details: ["Low-Latency Audio Stream", "Multi-Language Support", "Noise Cancellation Integrated"],
      demoType: "voice",
    },
    {
      id: "scanner",
      icon: FileText,
      title: "Drag & Drop Scanner",
      tagline: lang === "id" ? "Ekstraksi & Analisis Dokumen Otomatis" : "Automatic Document Extraction & Analysis",
      desc: lang === "id"
        ? "Tarik file PDF, Excel, Word, CSV, foto dokumen, atau source code. AI akan secara otomatis memindai, merangkum, dan menganalisis seluruh data."
        : "Drag & drop PDF, Excel, Word, CSV, document photos, or code files. AI automatically scans, summarizes, and analyzes your data.",
      details: lang === "id"
        ? ["Support 10+ Format File", "OCR Pemindaian Gambar", "Struktur Tabel & Formula Excel"]
        : ["Supports 10+ File Formats", "Image OCR Scanning", "Excel Table & Formula Extraction"],
      demoType: "scanner",
    },
    {
      id: "search",
      icon: Globe,
      title: "Deep Web Search",
      tagline: lang === "id" ? "Riset Web & Media Sosial Real-Time" : "Real-Time Web & Social Media Research",
      desc: lang === "id"
        ? "Menelusuri informasi terkini di internet, menganalisis link YouTube/TikTok/X, dan menyajikan jawaban lengkap beserta rujukan sumber terverifikasi."
        : "Crawl up-to-date web info, analyze YouTube/TikTok/X links, and present comprehensive answers with verified citations.",
      details: lang === "id"
        ? ["Sitasi Sumber Live", "Analisis Video & Post", "Pencarian Berita Terkini"]
        : ["Live Source Citations", "Video & Social Post Analysis", "Latest News Crawling"],
      demoType: "search",
    },
    {
      id: "arena",
      icon: Swords,
      title: "Arena Mode Dual-AI",
      tagline: lang === "id" ? "Adu Jawaban Side-by-Side" : "Side-by-Side AI Response Comparison",
      desc: lang === "id"
        ? "Kirim satu prompt secara bersamaan ke dua model AI berbeda. Evaluasi mana yang memberikan solusi paling presisi dan elegan untuk kebutuhan Anda."
        : "Send one prompt simultaneously to two different AI models. Evaluate which model delivers the most precise solution for your needs.",
      details: ["Simultaneous Dual Response", "Side-by-Side UI", "Model Benchmark Instant"],
      demoType: "arena",
    },
    {
      id: "code",
      icon: Code2,
      title: "Live Artifacts & Diagram",
      tagline: lang === "id" ? "Render Kode & Visualisasi Diagram" : "Code Rendering & Diagram Visualization",
      desc: lang === "id"
        ? "AI menghasilkan komponen web interaktif (HTML/CSS/JS) serta diagram alur Mermaid.js yang langsung dipreview di kanvas artifact."
        : "AI generates interactive web components (HTML/CSS/JS) and Mermaid.js flowcharts rendered directly in live artifact preview canvas.",
      details: ["Interactive Live Preview", "Mermaid.js Flowchart", "Code Export & Copy"],
      demoType: "code",
    },
  ];

  const active = features[activeFeatureIndex];

  return (
    <section id="fitur" className="py-28 px-6 max-w-6xl mx-auto">
      <ScrollReveal>
        <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
          <span className="text-[11px] font-semibold tracking-[0.25em] text-zinc-400 uppercase">
            {t("landing.featuresTitle", "CORE CAPABILITIES")}
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t("landing.featuresHeading", "Fluid Design. Unlimited Power.")}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t("landing.featuresSub", "Select a feature below to interactively explore LucidChat's intelligence architecture.")}
          </p>
        </div>
      </ScrollReveal>

      {/* Non-Boxy Floating Pill Selector */}
      <ScrollReveal delay={150}>
        <div className="flex flex-wrap justify-center items-center gap-3 mb-12">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            const isSelected = activeFeatureIndex === idx;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveFeatureIndex(idx)}
                className={`group flex items-center gap-2.5 px-5 py-3 rounded-full text-xs font-medium transition-all duration-400 cursor-pointer ${
                  isSelected
                    ? "bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.25)] scale-105"
                    : "bg-white/[0.03] text-zinc-400 border border-white/10 hover:bg-white/[0.07] hover:text-white hover:border-white/20"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 ${isSelected ? "scale-110 text-black" : "text-zinc-400 group-hover:text-white"}`} />
                <span>{feat.title}</span>
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Main Organic Showcase Canvas */}
      <ScrollReveal delay={250}>
        <div className="relative rounded-[36px] bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent border border-white/15 p-8 sm:p-12 backdrop-blur-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          {/* Ambient white halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-zinc-300">
                <active.icon className="w-3.5 h-3.5 text-white" />
                <span>{active.title}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                {active.tagline}
              </h3>

              <p className="text-sm text-zinc-400 leading-relaxed">
                {active.desc}
              </p>

              <div className="space-y-3 pt-2">
                {active.details.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive Preview Panel */}
            <div className="lg:col-span-7 rounded-2xl bg-[#09090e]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-inner">
              {/* Dynamic Feature Preview Graphic based on active type */}
              {active.demoType === "models" && (
                <div className="space-y-4">
                  <div className="text-xs text-zinc-400 font-medium">Model Active Routing</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { Logo: GeminiLogo, name: "Gemini 3.6", state: "Active" },
                      { Logo: OpenAILogo, name: "GPT-4o", state: "Ready" },
                      { Logo: ClaudeLogo, name: "Claude 3.7", state: "Ready" },
                      { Logo: DeepSeekLogo, name: "DeepSeek R1", state: "Ready" },
                      { Logo: QwenLogo, name: "Qwen 2.5", state: "Ready" },
                      { Logo: LlamaLogo, name: "Llama 3.3", state: "Ready" },
                    ].map((m, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                          i === 0
                            ? "bg-white/[0.1] border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            : "bg-white/[0.02] border-white/[0.06] text-zinc-400"
                        }`}
                      >
                        <m.Logo className="w-5 h-5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-white">{m.name}</div>
                          <div className="text-[10px] text-zinc-500">{m.state}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {active.demoType === "voice" && (
                <div className="py-6 space-y-6 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center animate-pulse-glow">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  {/* Waveform visualization */}
                  <div className="flex items-center justify-center gap-1.5 h-12">
                    {[40, 75, 30, 90, 50, 85, 45, 95, 60, 30, 70, 40].map((h, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 bg-white/80 rounded-full animate-pulse"
                        style={{
                          height: `${h}%`,
                          animationDelay: `${idx * 0.1}s`,
                          animationDuration: "1.2s",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 italic">
                    &ldquo;Halo! Saya siap mendengarkan. Ada yang ingin didiskusikan?&rdquo;
                  </p>
                </div>
              )}

              {active.demoType === "scanner" && (
                <div className="p-6 rounded-xl border border-dashed border-white/20 bg-white/[0.02] text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">Invoice_Agustus_2026.pdf</p>
                    <p className="text-[11px] text-zinc-500">Document Scanned • 2.4 MB • 4 Halaman</p>
                  </div>
                  <div className="bg-white/[0.05] p-3 rounded-lg text-left text-xs text-zinc-300 font-mono space-y-1 border border-white/[0.06]">
                    <div>[AI Extract] Total Tagihan: Rp 18.500.000</div>
                    <div>[AI Extract] Due Date: 30 September 2026</div>
                    <div>[AI Extract] Vendor: PT Digital Nusantara</div>
                  </div>
                </div>
              )}

              {active.demoType === "search" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white">
                    <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>Perkembangan arsitektur AI terbaru minggu ini</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-zinc-300 space-y-1">
                      <div className="font-semibold text-white">DeepMind Announces Gemini 3.6 Architecture</div>
                      <div className="text-zinc-500 text-[11px]">Riset web terverifikasi dari techcrunch.com</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-zinc-300 space-y-1">
                      <div className="font-semibold text-white">Analysis: Linear Attention vs Transformer</div>
                      <div className="text-zinc-500 text-[11px]">Sitasi sumber dari arxiv.org</div>
                    </div>
                  </div>
                </div>
              )}

              {active.demoType === "arena" && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Gemini 3.6</span>
                      <span className="text-[10px] text-zinc-400">0.4s</span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">Solusi komprehensif dengan langkah matematis terstruktur...</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Claude 3.7</span>
                      <span className="text-[10px] text-zinc-400">0.5s</span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">Pendekatan intuitif dengan penjelasan naratif mendalam...</p>
                  </div>
                </div>
              )}

              {active.demoType === "code" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.04] text-zinc-400 text-[11px]">
                    <span>Artifact Preview: diagram.mermaid</span>
                    <span>Live Render</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-zinc-300 space-y-2">
                    <div className="text-white font-bold">graph TD</div>
                    <div className="pl-4 text-zinc-400">A[User Input] --&gt; B&#123;AI Model Router&#125;</div>
                    <div className="pl-4 text-zinc-400">B --&gt;|Reasoning| C[DeepSeek R1]</div>
                    <div className="pl-4 text-zinc-400">B --&gt;|Vision| D[Gemini 3.6]</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

// ─── INTERACTIVE DEMO SECTION ───
function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      icon: MessageSquare,
      label: "Multi-Model Chat",
      prompt: "Jelaskan perbedaan arsitektur Transformer dan Mamba dalam komputasi AI",
      response:
        "Transformer mengandalkan mekanisme self-attention dengan kompleksitas komputasi O(n²), ideal untuk pemrosesan konteks tinggi secara paralel. Sementara Mamba (Structured State Space Model) memproses urutan data secara linier O(n) menggunakan selective state spaces, menghasilkan efisiensi memori luar biasa pada inferensi konteks panjang.",
      model: "Gemini 3.6 Flash",
      ModelLogo: GeminiLogo,
    },
    {
      icon: ImageIcon,
      label: "Scan Dokumen",
      prompt: "Tolong rangkum isi berkas Laporan_Keuangan_Q3.pdf ini",
      response:
        "Dokumen berhasil dipindai. Pendapatan bersih naik 34% YoY menjadi Rp 4.2 Miliar, dipicu oleh pertumbuhan segmen SaaS enterprise. Beban operasional terkendali di Rp 1.1 Miliar.",
      model: "Claude 3.7 Sonnet",
      ModelLogo: ClaudeLogo,
    },
    {
      icon: Mic,
      label: "Voice Call AI",
      prompt: '[Hands-Free Call] "Bagaimana cara kerja quantum computing secara ringkas?"',
      response:
        '"Halo! Komputasi kuantum menggunakan qubit yang dapat berada dalam superposisi state 0 dan 1 sekaligus. Ini memungkinkan komputasi paralel masif untuk menyelesaikan kalkulasi kompleks dalam hitungan detik."',
      model: "GPT-4o",
      ModelLogo: OpenAILogo,
    },
    {
      icon: Globe,
      label: "Web Search",
      prompt: "Apa rilis model AI paling mutakhir minggu ini?",
      response:
        "Berdasarkan riset web real-time: Google merilis Gemini 3.6 Flash dengan peningkatan kecepatan inferensi 40%, Anthropic meluncurkan fitur Claude Artifacts 2.0, dan DeepSeek R1 mendominasi benchmark open-weight.",
      model: "DeepSeek R1",
      ModelLogo: DeepSeekLogo,
    },
  ];

  const active = tabs[activeTab];

  return (
    <section id="demo" className="py-28 px-6 max-w-5xl mx-auto">
      <ScrollReveal>
        <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
          <span className="text-[11px] font-semibold tracking-[0.25em] text-zinc-400 uppercase">
            SIMULASI LANGSUNG
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Pengalaman Real-Time
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Eksplorasi antarmuka percakapan LucidChat secara langsung melalui modul di bawah.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={150}>
        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                  activeTab === idx
                    ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    : "bg-white/[0.03] text-zinc-400 border border-white/10 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Demo Glass Panel */}
        <div className="relative rounded-[32px] bg-[#0a0a10]/95 border border-white/15 p-6 sm:p-10 backdrop-blur-2xl overflow-hidden shadow-2xl">
          {/* Subtle Ambient light */}
          <div className="absolute top-0 right-1/4 w-[350px] h-[180px] bg-white/[0.02] blur-[90px] rounded-full pointer-events-none" />

          {/* Model Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2.5">
              <active.ModelLogo className="w-4 h-4" />
              <span className="text-xs text-zinc-300 font-semibold">{active.model}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] text-zinc-500 font-mono">ONLINE</span>
            </div>
          </div>

          {/* Dialogue */}
          <div className="space-y-6 relative z-10">
            {/* User Message */}
            <div className="flex justify-end">
              <div
                key={`user-${activeTab}`}
                className="bg-white/10 text-white text-xs sm:text-[13px] px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-lg border border-white/15 leading-relaxed animate-glass-appear shadow-sm"
              >
                {active.prompt}
              </div>
            </div>
            {/* AI Response */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div
                key={`ai-${activeTab}`}
                className="bg-white/[0.03] text-zinc-200 text-xs sm:text-[13px] px-5 py-3.5 rounded-2xl rounded-tl-sm max-w-xl border border-white/10 leading-relaxed animate-glass-appear"
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
  const { lang, t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP initial text reveal
  useEffect(() => {
    const init = async () => {
      const { gsap } = await import("gsap");
      gsap.fromTo(
        ".hero-title",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(
        ".hero-subtitle",
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.5 }
      );
      gsap.fromTo(
        ".hero-cta",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.8 }
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
    <div className="min-h-screen bg-[#050508] text-white font-sans selection:bg-white/20 selection:text-white relative overflow-hidden">
      {/* ═══ FLOATING NAVBAR ═══ */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl transition-all duration-500 ${
          isScrolled
            ? "top-3 bg-[#08080e]/90 backdrop-blur-2xl border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
            : "bg-[#08080e]/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        } rounded-full`}
      >
        <div className="px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              <img src="/logo.png" alt="LucidChat" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="text-base font-bold tracking-tight text-white hidden sm:inline">
              LucidChat
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13px] text-zinc-400 font-medium">
            <a href="#fitur" className="hover:text-white transition-colors">{t("landing.navFeatures", "Fitur")}</a>
            <a href="#demo" className="hover:text-white transition-colors">{t("landing.navDemo", "Demo")}</a>
            <a href="#model" className="hover:text-white transition-colors">{t("landing.navModels", "Model AI")}</a>
            <a href="#keunggulan" className="hover:text-white transition-colors">{t("landing.navAdvantages", "Keunggulan")}</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Floating Circle Multi-Language Picker */}
            <FloatingLanguagePicker variant="floating" />

            <Link
              href="/login"
              className="px-4 py-2 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {t("landing.navSignIn", "Masuk")}
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {t("landing.navRegister", "Daftar Gratis")}
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden px-6 pb-5 pt-2 border-t border-white/10 space-y-3 rounded-b-3xl bg-[#08080e]/95 backdrop-blur-2xl">
            {/* Language Switcher on Mobile */}
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-xs text-zinc-400 font-medium">Language</span>
              <FloatingLanguagePicker variant="compact" />
            </div>

            <a href="#fitur" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-zinc-300 hover:text-white">{t("landing.navFeatures", "Fitur")}</a>
            <a href="#demo" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-zinc-300 hover:text-white">{t("landing.navDemo", "Demo")}</a>
            <a href="#model" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-zinc-300 hover:text-white">{t("landing.navModels", "Model AI")}</a>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1 py-2.5 text-center rounded-full text-xs font-medium text-white bg-white/10 border border-white/15">{t("landing.navSignIn", "Masuk")}</Link>
              <Link href="/register" className="flex-1 py-2.5 text-center rounded-full text-xs font-semibold bg-white text-black">{t("landing.navRegister", "Daftar")}</Link>
            </div>
          </div>
        )}
      </header>

      {/* ═══ HERO SECTION with THREE.JS ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Three.js Background */}
        <HeroScene />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/40 via-transparent to-[#050508] z-[1] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <div className="hero-subtitle inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/15 text-[11px] font-semibold text-zinc-300 tracking-wider uppercase opacity-0 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{t("landing.heroBadge", "PLATFORM MULTI-MODEL AI GENERASI BARU")}</span>
          </div>

          <h1 className="hero-title text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] text-white opacity-0">
            {t("landing.heroTitle", "Satu Studio. Kapabilitas AI Tanpa Batas.")}
          </h1>

          <p className="hero-subtitle text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto opacity-0">
            {t("landing.heroSubtitle", "Akses Gemini 3.6 Flash, OpenAI GPT-4o, Claude 3.7 Sonnet, DeepSeek R1, Kimi AI, Qwen, dan Llama 3.3 dalam satu antarmuka Liquid Glass modern.")}
          </p>

          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 opacity-0">
            <Link
              href="/register"
              className="group w-full sm:w-auto px-9 py-4 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_50px_rgba(255,255,255,0.25)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5"
            >
              <span>{t("landing.startFree", "Mulai Gratis")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-white/[0.04] border border-white/15 hover:bg-white/[0.08] text-white font-medium text-sm transition-all duration-300 flex items-center justify-center backdrop-blur-md"
            >
              {t("landing.exploreModels", "Jelajahi Model AI")}
            </a>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 opacity-60">
          <span className="text-[10px] text-zinc-400 tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 text-zinc-400 animate-bounce" />
        </div>
      </section>

      {/* ═══ PROVIDER MARQUEE ═══ */}
      <section id="model" className="py-14 border-y border-white/10 bg-white/[0.008] overflow-hidden">
        <ScrollReveal>
          <p className="text-center text-[11px] font-semibold tracking-[0.25em] text-zinc-500 uppercase mb-8">
            {t("landing.poweredBy", "POWERED BY THE WORLD'S BEST AI MODELS")}
          </p>
        </ScrollReveal>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050508] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050508] to-transparent z-10 pointer-events-none" />
          <div className="marquee-track flex items-center gap-8">
            {[...providers, ...providers, ...providers].map(({ Logo, name }, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 group shrink-0"
              >
                <Logo className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NON-BOXY INTERACTIVE FEATURE HUB ═══ */}
      <InteractiveFeatureHub />

      {/* ═══ INTERACTIVE DEMO ═══ */}
      <InteractiveDemo />

      {/* ═══ MINIMALIST OPEN STATS BAR ═══ */}
      <section className="py-20 border-y border-white/10 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal>
            <div className="flex flex-wrap items-center justify-around gap-8 text-center">
              {[
                { value: 15, suffix: "+", label: t("landing.statModels", "Integrated AI Models") },
                { value: 100, suffix: "%", label: t("landing.statFree", "Free Access Without API Key") },
                { value: 8, suffix: "+", label: t("landing.statFormats", "Supported File Formats") },
                { value: 24, suffix: "/7", label: t("landing.statUptime", "Real-Time Availability") },
              ].map(({ value, suffix, label }, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    <AnimatedCounter target={value} suffix={suffix} />
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ ORBITAL TIMELINE / HOW IT WORKS ═══ */}
      <section className="py-28 px-6 max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-20 space-y-4">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-zinc-400 uppercase">
              {t("landing.workflowTitle", "WORKFLOW")}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {t("landing.workflowHeading", "Seamless Simplicity")}
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              {t("landing.workflowSub", "Start interacting with cutting-edge AI in just 3 instant steps.")}
            </p>
          </div>
        </ScrollReveal>

        {/* Non-boxy circular timeline nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {[
            {
              step: "01",
              title: t("landing.step1Title", "Create Account"),
              desc: t("landing.step1Desc", "Instant registration using email or Google account. No credit card required."),
            },
            {
              step: "02",
              title: t("landing.step2Title", "Choose AI Engine"),
              desc: t("landing.step2Desc", "Select a specific AI model or use Auto-Routing for optimal performance."),
            },
            {
              step: "03",
              title: t("landing.step3Title", "Start Collaboration"),
              desc: t("landing.step3Desc", "Type text, upload documents, or speak directly with AI in hands-free voice mode."),
            },
          ].map(({ step, title, desc }, idx) => (
            <ScrollReveal key={idx} delay={idx * 150}>
              <div className="flex flex-col items-center text-center space-y-5 group">
                <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/20 flex items-center justify-center text-lg font-bold text-white shadow-[0_0_25px_rgba(255,255,255,0.08)] group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-400">
                  {step}
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ WHY LUCIDCHAT (ASYMMETRIC ORGANIC SHOWCASE) ═══ */}
      <section id="keunggulan" className="py-24 px-6 max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="rounded-[36px] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/15 p-8 sm:p-14 space-y-10 relative overflow-hidden backdrop-blur-2xl">
            <div className="space-y-4 max-w-xl">
              <span className="text-[11px] font-semibold tracking-[0.25em] text-zinc-400 uppercase">
                {t("landing.advTitle", "KEY ADVANTAGES")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {t("landing.advHeading", "Why Choose LucidChat?")}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {t("landing.advSub", "Crafted with high aesthetic standards and uncompromised flexibility.")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, title: lang === "id" ? "Keamanan RLS" : "RLS Security", desc: lang === "id" ? "Data dan riwayat percakapan terlindungi enkripsi tingkat tinggi." : "Data and chat history protected with enterprise-grade encryption." },
                { icon: Zap, title: lang === "id" ? "Respons Kilat" : "Lightning Response", desc: lang === "id" ? "Inferensi ultra-fast tanpa antrean dengan latensi rendah." : "Ultra-fast inference without queues and ultra-low latency." },
                { icon: Cpu, title: lang === "id" ? "Tanpa API Key" : "No API Key Needed", desc: lang === "id" ? "Langsung gunakan semua model tanpa perlu membeli kredit API terpisah." : "Use all AI models directly without purchasing separate API keys." },
                { icon: Wand2, title: lang === "id" ? "Estetika Liquid Glass" : "Liquid Glass Aesthetics", desc: lang === "id" ? "Antarmuka obsidian glass yang menawan dan nyaman di mata." : "Stunning obsidian glass interface tailored for eye comfort." },
                { icon: Layers, title: lang === "id" ? "Multi-Model Switching" : "Multi-Model Switching", desc: lang === "id" ? "Beralih model kapan saja di tengah-tengah sesi percakapan." : "Switch AI engines anytime in the middle of ongoing sessions." },
                { icon: Globe, title: lang === "id" ? "Web Crawling Live" : "Live Web Crawling", desc: lang === "id" ? "Informasi tepercaya dari pencarian internet dan media sosial." : "Trusted real-time info crawled from web and social media." },
              ].map(({ icon: Icon, title, desc }, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 group space-y-3"
                >
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="py-28 px-6 text-center relative">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t("landing.ctaTitle", "Ready to Accelerate Your Productivity?")}
            </h2>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              {t("landing.ctaSubtitle", "Join now and experience collective AI intelligence in one unified hub.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_50px_rgba(255,255,255,0.25)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <span>{t("landing.ctaRegister", "Register Free Now")}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white/[0.04] border border-white/15 hover:bg-white/[0.08] text-white font-medium text-sm transition-all duration-300"
              >
                {t("landing.ctaLogin", "Already Have Account")}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-10 border-t border-white/10 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="LucidChat" className="w-full h-full object-cover" />
              </div>
              <span className="font-medium text-zinc-400">LucidChat AI &copy; 2026</span>
            </div>
            <span className="hidden sm:inline text-white/10">•</span>
            <span className="text-zinc-500 text-[11px]">Created with ⚡ by Putra</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-zinc-400">
            <a
              href="https://github.com/putrarawr/LucidChat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub Repo</span>
            </a>
            <a
              href="mailto:putrarawr18@gmail.com"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{t("footer.reportBug", "Report Bug / Feedback")}</span>
            </a>
            <Link href="/chat" className="hover:text-white transition-colors">{t("nav.globalChat", "Global Chat Studio")}</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">{t("nav.privacy", "Privacy Policy")}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t("nav.terms", "Terms of Service")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
