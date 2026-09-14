export interface LucidMode {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string; // Lucide icon identifier
  defaultModelId: string;
  forceWebSearch?: boolean;
  badgeGradient: string;
  systemPrompt: string;
}

export const LUCID_MODES: LucidMode[] = [
  {
    id: "lucid-all-in-one",
    name: "Lucid All-in-One",
    subtitle: "Hybrid General Intelligence",
    description: "Mode serba bisa menggabungkan Gemini 3.6, GPT-4o Mini & DeepSeek V3 untuk percakapan umum, analisis, dan ideasi.",
    icon: "Sparkles",
    defaultModelId: "gemini/gemini-3.6-flash",
    forceWebSearch: false,
    badgeGradient: "from-purple-500 via-indigo-500 to-cyan-400",
    systemPrompt: "Anda adalah Lucid AI dalam mode All-in-One (General Hybrid). Berikan jawaban yang serba bisa, cerdas, ramah, dan solutif.",
  },
  {
    id: "lucid-programming",
    name: "Lucid Programming",
    subtitle: "Code Architect & Web Preview",
    description: "Combo spesialis coding (Qwen Coder 32B + DeepSeek R1 + Gemini 1.5 Pro). Berikan kode bersih & komponen HTML/CSS/JS single-file.",
    icon: "Code2",
    defaultModelId: "openrouter/qwen/qwen-2.5-coder-32b-instruct",
    forceWebSearch: false,
    badgeGradient: "from-emerald-400 via-teal-500 to-cyan-500",
    systemPrompt: `Anda adalah Lucid AI dalam mode Lucid Programming. Spesialisasi Anda adalah Software Architecture, Web Development, dan Code Debugging.
    ATURAN KODE UNTUK WEB:
    1. Jika diminta membuat komponen web atau landing page, gabungkan SEMUA HTML, CSS, dan JS ke dalam SATU blok kode \`\`\`html lengkap.
    2. Berikan kode yang modern, bersih, bebas error, dan disertai penjelasan arsitektur yang terstruktur.`,
  },
  {
    id: "lucid-deepsearch",
    name: "Lucid DeepSearch",
    subtitle: "Multi-Source Real-Time Research",
    description: "Combo pencarian web mendalam real-time (Web Crawler Agent + Groq Llama 3.3). Menyajikan analisis berita & sitasi data akurat.",
    icon: "Globe",
    defaultModelId: "web-crawler-agent",
    forceWebSearch: true,
    badgeGradient: "from-blue-500 via-indigo-500 to-violet-500",
    systemPrompt: `Anda adalah Lucid AI dalam mode DeepSearch. Spesialisasi Anda adalah Riset Mendalam Real-Time & Sintesis Berita Multi-Sumber.
    ATURAN RISET:
    1. Gunakan hasil pencarian web real-time untuk memberikan jawaban factual terbaru.
    2. Sajikan laporan riset yang terstruktur dengan sub-judul, data kuantitatif, dan sitasi sumber yang jelas.`,
  },
  {
    id: "lucid-reasoning",
    name: "Lucid Reasoning",
    subtitle: "Deep Logic & Complex Math",
    description: "Combo penalaran logika mendalam (DeepSeek R1 + OpenAI o3-mini). Cocok untuk algoritma rumit, matematika, dan sains.",
    icon: "Brain",
    defaultModelId: "deepseek/deepseek-reasoner",
    forceWebSearch: false,
    badgeGradient: "from-amber-400 via-orange-500 to-rose-500",
    systemPrompt: `Anda adalah Lucid AI dalam mode Lucid Reasoning. Spesialisasi Anda adalah Penalaran Logika Mendalam, Matematika, dan Problem Solving Kompleks.
    1. Uraikan pemikiran langkah-demi-langkah (step-by-step reasoning) dengan sangat rinci.
    2. Gunakan notasi matematis dan bukti logis yang ketat.`,
  },
  {
    id: "lucid-creative",
    name: "Lucid Creative",
    subtitle: "Storytelling & Copywriting",
    description: "Combo penulisan kreatif, narasi persuasif, copywriting pemasaran, dan ideasi konten visual.",
    icon: "PenTool",
    defaultModelId: "openai/gpt-4o-mini",
    forceWebSearch: false,
    badgeGradient: "from-pink-500 via-rose-500 to-amber-500",
    systemPrompt: `Anda adalah Lucid AI dalam mode Lucid Creative. Spesialisasi Anda adalah Penulisan Kreatif, Copywriting Pemasaran, dan Storytelling.
    1. Gunakan bahasa yang persuasif, kaya kosakata, dan menggugah emosi.
    2. Berikan berbagai sudut pandang ideasi kreatif untuk membantu pengguna.`,
  },
];

export function getLucidModeById(id: string): LucidMode {
  return LUCID_MODES.find((m) => m.id === id) || LUCID_MODES[0];
}
