"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  Code2,
  PenTool,
  GraduationCap,
  Briefcase,
  X,
  Copy,
  Check,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { playClickSound } from "@/lib/sound";

export interface PromptTemplate {
  id: string;
  title: string;
  desc: string;
  category: "code" | "writing" | "academic" | "productivity";
  prompt: string;
  badge?: string;
}

const CURATED_PROMPTS: PromptTemplate[] = [
  // ─── CODING & ARSITEKTUR ──────────────────────────────────────────
  {
    id: "code-review",
    title: "Senior Code Review & Security Audit",
    desc: "Periksa kode Anda terhadap bug tersembunyi, celah keamanan, dan anti-pattern.",
    category: "code",
    badge: "Populer",
    prompt: `Bertindaklah sebagai Staff Software Engineer & Security Auditor. Tolong lakukan review mendalam terhadap kode berikut:
1. Temukan potensi bug atau edge-case yang terlewat.
2. Analisis celah keamanan (OWASP, sanitasi input, injection, memory leak).
3. Berikan rekomendasi refactoring kode yang lebih bersih, type-safe, dan efisien.

Berikut kodenya:
\`\`\`
[Masukkan kode Anda di sini]
\`\`\``,
  },
  {
    id: "clean-refactor",
    title: "Refactor to Clean Architecture",
    desc: "Ubah kode spaghetti menjadi modular dengan Separation of Concerns.",
    category: "code",
    prompt: `Tolong refactor potongan kode berikut agar mengikuti prinsip Clean Architecture & SOLID:
- Pisahkan logika bisnis dari UI / I/O.
- Terapkan type-safety ketat dan error handling yang terarah.
- Sederhanakan fungsi yang terlalu panjang menjadi modul-modul kecil.

Kode:
\`\`\`
[Masukkan kode Anda di sini]
\`\`\``,
  },
  {
    id: "sql-optimizer",
    title: "SQL Schema & Query Optimizer",
    desc: "Rancang skema database relational atau optimasi kueri lambat.",
    category: "code",
    prompt: `Saya memiliki kebutuhan database untuk sistem [sebutkan fitur, misal: e-commerce / multi-tenant SaaS]. 
Tolong buatkan:
1. Skema tabel PostgreSQL lengkap (Primary Key, Foreign Keys, Indexes, Constraints).
2. Optimasi kueri untuk menghindari N+1 query.
3. RLS (Row Level Security) jika relevan.`,
  },
  {
    id: "debug-error",
    title: "Root-Cause Debugger",
    desc: "Temukan akar masalah dari stack trace atau error log yang membingungkan.",
    category: "code",
    prompt: `Aplikasi saya mengalami error berikut saat runtime:
\`\`\`
[Tempelkan pesan error / stack trace di sini]
\`\`\`
Tolong jelaskan:
1. Apa akar penyebab (root-cause) dari error ini?
2. Di bagian mana kesalahan terjadi?
3. Langkah perbaikan kode langkah-demi-langkah beserta solusinya.`,
  },

  // ─── PENULISAN & COPYWRITING ──────────────────────────────────────
  {
    id: "anti-slop-rewrite",
    title: "Anti-Slop Content Rewriter",
    desc: "Tulis ulang teks agar terdengar natural, tegas, dan bebas dari klise AI.",
    category: "writing",
    badge: "Efektif",
    prompt: `Tolong tulis ulang draf tulisan berikut dengan standar editorial tinggi:
- HILANGKAN semua kata klise AI (seperti "tapestry", "delve", "game-changer", "beacon", "in today's fast-paced world").
- Gunakan bahasa Indonesia yang luwes, segar, dan berbobot.
- Variasikan panjang kalimat agar enak dibaca.

Draf tulisan:
"..."`,
  },
  {
    id: "hook-generator",
    title: "Viral Social Media Hook",
    desc: "Buat 5 variasi kalimat pembuka (hook) yang menarik perhatian audiens.",
    category: "writing",
    prompt: `Saya ingin membuat postingan tentang topik: [sebutkan topik Anda].
Tolong buatkan 5 variasi kalimat pembuka (hook) yang memikat dengan psikologi berbeda:
1. Contrarian (melawan mitos umum)
2. Story-driven (bercerita)
3. Data-backed (fakta mengejutkan)
4. Question / FOMO (pertanyaan menantang)
5. Direct Value (manfaat instan)`,
  },
  {
    id: "cold-pitch-email",
    title: "High-Converting Cold Email",
    desc: "Surat penawaran profesional, padat, dan tidak bertele-tele.",
    category: "writing",
    prompt: `Tolong buatkan template cold email profesional untuk menawarkan [produk/layanan Anda] kepada [target klien/posisi].
Ketentuan:
- Maksimal 120 kata.
- Langsung ke inti masalah (pain point) yang dialami prospek.
- Call to Action (CTA) rendah gesekan (misal: "Apakah 10 menit minggu ini cocok untuk bertukar pikiran?").`,
  },

  // ─── AKADEMIK & RISET ─────────────────────────────────────────────
  {
    id: "eli5-concept",
    title: "Jelaskan Konsep Seperti ke Anak 10 Tahun (ELI5)",
    desc: "Sederhanakan konsep fisika, matematika, atau sistem rumit dengan analogi.",
    category: "academic",
    badge: "Favorit",
    prompt: `Tolong jelaskan konsep [masukkan topik rumit, misal: Transformer Neural Networks / Quantum Computing / Event Loop] dengan cara yang paling mudah dipahami:
1. Gunakan analogi dunia nyata sederhana yang akrab bagi orang awam.
2. Hindari jargon rumit tanpa penjelasan.
3. Rangkum inti mekanismenya dalam 3 poin kunci.`,
  },
  {
    id: "paper-summarizer",
    title: "Executive Research Summarizer",
    desc: "Ekstrak intisari makalah ilmiah, metodologi, dan implikasinya.",
    category: "academic",
    prompt: `Berikut adalah teks abstrak atau isi jurnal penelitian:
"..."

Tolong buatkan ringkasan analitis terstruktur:
1. Research Question (Pertanyaan riset utama).
2. Metodologi yang digunakan.
3. Temuan Kunci & Data Kuantitatif.
4. Keterbatasan Penelitian (Limitations) & Implikasi Nyata.`,
  },
  {
    id: "critical-debate",
    title: "Devil's Advocate & Stress Testing Ide",
    desc: "Uji argumen atau rencana bisnis Anda dari sudut pandang kontra yang kritis.",
    category: "academic",
    prompt: `Saya memiliki hipotesis / rencana berikut:
"[Jelaskan ide atau argumen Anda]"

Bertindaklah sebagai Devil's Advocate (penentang kritis). Tolong serang ide saya dengan:
1. 3 celah logika atau asumsi tersembunyi yang berisiko salah.
2. Skenario terburuk (worst-case failure modes).
3. Argumen tandingan terkuat yang mungkin diajukan oleh kritikus.`,
  },

  // ─── KARIR & PRODUKTIVITAS ────────────────────────────────────────
  {
    id: "interview-sim",
    title: "Simulasi Wawancara Kerja Interaktif",
    desc: "Latihan interview teknis atau HR untuk posisi impian Anda.",
    category: "productivity",
    badge: "Interaktif",
    prompt: `Bertindaklah sebagai Senior Hiring Manager untuk posisi [sebutkan posisi, misal: Fullstack Developer / Data Analyst].
Aturan simulasi:
1. Ajukan pertanyaan SATU PER SATU. Tunggu jawaban saya sebelum memberikan pertanyaan berikutnya.
2. Setelah saya menjawab, berikan feedback singkat (apa yang bagus & apa yang bisa ditingkatkan), lalu ajukan pertanyaan berikutnya.
3. Mulailah dengan memperkenalkan diri dan mengajukan pertanyaan pertama!`,
  },
  {
    id: "meeting-action-items",
    title: "Ekstrak Notula Rapat & Action Items",
    desc: "Ubah catatan rapat yang berantakan menjadi tugas dan PIC yang terstruktur.",
    category: "productivity",
    prompt: `Berikut adalah catatan kasar dari rapat kami:
"..."

Tolong rapikan menjadi format notula eksekutif:
1. Keputusan Utama yang Telah Disepakati.
2. Action Items (Tugas, Penanggung Jawab / PIC, dan Estimasi Target).
3. Poin Terbuka (Open Questions) yang Perlu Dibahas di Rapat Berikutnya.`,
  },
];

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export function PromptLibraryModal({
  isOpen,
  onClose,
  onSelectPrompt,
}: PromptLibraryModalProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "code" | "writing" | "academic" | "productivity">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "Semua Kategori", icon: Sparkles },
    { id: "code", label: "Coding & Tech", icon: Code2 },
    { id: "writing", label: "Writing & Copy", icon: PenTool },
    { id: "academic", label: "Riset & Belajar", icon: GraduationCap },
    { id: "productivity", label: "Karir & Bisnis", icon: Briefcase },
  ] as const;

  const filteredPrompts = useMemo(() => {
    return CURATED_PROMPTS.filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    playClickSound();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleUsePrompt = (promptText: string) => {
    playClickSound();
    onSelectPrompt(promptText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[85vh] bg-[#0c0d14] border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Prompt Library & Curated Templates
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/60">
                  {filteredPrompts.length} templates
                </span>
              </h2>
              <p className="text-xs text-white/50">
                Pilih template prompt profesional siap pakai untuk hasil inferensi AI yang tajam dan terstruktur.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 border-b border-white/[0.06] bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
            {categories.map((c) => {
              const IconComp = c.icon;
              const isActive = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    playClickSound();
                    setActiveCategory(c.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-white text-black shadow-md"
                      : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/[0.06]"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari template prompt..."
              className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>

        {/* Prompt Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Sparkles className="w-8 h-8 text-white/20 mb-2" />
              <p className="text-xs text-white/40">Tidak ada template prompt yang cocok dengan pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrompts.map((item) => (
                <div
                  key={item.id}
                  className="p-4.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04] transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] text-[10.5px] font-mono text-white/70 line-clamp-3 select-none">
                      {item.prompt}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.prompt)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-[11px] font-medium transition-all"
                      title="Salin template"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUsePrompt(item.prompt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 text-[11px] font-bold shadow-sm transition-all"
                    >
                      <span>Gunakan Prompt</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
