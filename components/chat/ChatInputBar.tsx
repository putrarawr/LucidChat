import { useState, useRef, useEffect } from "react";
import { ArrowUp, ChevronDown, Sparkles, Brain, Globe, X, Paperclip, Mic, MicOff, FileText, Image as ImageIcon, Wand2, CheckCircle2, Search, Code2, PenTool, Check, Layers, Cpu, Swords, Headphones, Loader2 } from "lucide-react";
import { DEFAULT_MODELS, ModelItem } from "@/lib/model-types";
import { LUCID_MODES, LucidMode } from "@/lib/lucid-modes";
import { playClickSound, playSendSound } from "@/lib/sound";
import { ModelLogo, GeminiLogo, OpenAILogo, ClaudeLogo, DeepSeekLogo, KimiLogo, QwenLogo, LlamaLogo } from "@/components/icons/ModelLogos";

export interface AttachmentFile {
  id: string;
  name: string;
  type: "image" | "file";
  content: string; // Base64 data URL for images, raw text for code/txt files/PDF/Excel
  mimeType?: string;
  isScanned?: boolean;
  isParsing?: boolean;
}

const BRAND_CATEGORIES = [
  {
    tag: "gemini",
    title: "GOOGLE GEMINI",
    icon: GeminiLogo,
    items: DEFAULT_MODELS.filter((m) => m.id.includes("gemini") || m.provider === "gemini"),
  },
  {
    tag: "openai",
    title: "OPENAI GPT",
    icon: OpenAILogo,
    items: DEFAULT_MODELS.filter(
      (m) => (m.id.includes("gpt") || m.id.includes("o3") || m.provider === "openai") && m.id !== "web-crawler-agent"
    ),
  },
  {
    tag: "kimi",
    title: "MOONSHOT KIMI",
    icon: KimiLogo,
    items: DEFAULT_MODELS.filter((m) => m.id.includes("kimi") || m.id.includes("moonshot") || m.provider === "kimi"),
  },
  {
    tag: "claude",
    title: "ANTHROPIC CLAUDE",
    icon: ClaudeLogo,
    items: DEFAULT_MODELS.filter((m) => m.id.includes("claude") || m.provider === "claude"),
  },
  {
    tag: "deepseek",
    title: "DEEPSEEK AI",
    icon: DeepSeekLogo,
    items: DEFAULT_MODELS.filter((m) => m.id.includes("deepseek") || m.provider === "deepseek"),
  },
  {
    tag: "qwen",
    title: "QWEN (ALIBABA)",
    icon: QwenLogo,
    items: DEFAULT_MODELS.filter((m) => m.id.includes("qwen")),
  },
  {
    tag: "llama",
    title: "META LLAMA",
    icon: LlamaLogo,
    items: DEFAULT_MODELS.filter((m) => m.id.includes("llama")),
  },
  {
    tag: "specialized",
    title: "AGENTS & OTHER ENGINES",
    icon: Globe,
    items: DEFAULT_MODELS.filter(
      (m) =>
        m.id === "web-crawler-agent" ||
        m.id.includes("nvidia") ||
        (!m.id.includes("gemini") &&
          !m.id.includes("gpt") &&
          !m.id.includes("o3") &&
          !m.id.includes("claude") &&
          !m.id.includes("deepseek") &&
          !m.id.includes("kimi") &&
          !m.id.includes("moonshot") &&
          !m.id.includes("qwen") &&
          !m.id.includes("llama") &&
          m.provider !== "gemini" &&
          m.provider !== "openai" &&
          m.provider !== "claude" &&
          m.provider !== "deepseek" &&
          m.provider !== "kimi")
    ),
  },
];

const SLASH_COMMANDS = [
  {
    cmd: "/image",
    title: "Generasi Gambar AI",
    desc: "Buat lukisan & ilustrasi visual AI resolusi tinggi",
    template: "/image ",
  },
  {
    cmd: "/draw",
    title: "Lukis Seni AI",
    desc: "Buat karya seni AI berdasarkan imajinasi prompt Anda",
    template: "/draw ",
  },
  {
    cmd: "/code",
    title: "Buatkan Komponen Web",
    desc: "Minta AI merancang komponen UI HTML/CSS/JS interaktif",
    template: "Buatkan komponen web HTML/CSS/JS interaktif untuk ",
  },
  {
    cmd: "/diagram",
    title: "Buatkan Diagram Mermaid",
    desc: "Rancang flowchart / diagram urutan dengan Mermaid.js",
    template: "Buatkan diagram flowchart menggunakan format kode ```mermaid (Mermaid.js) untuk alur ",
  },
  {
    cmd: "/fix",
    title: "Debug & Perbaiki Kode",
    desc: "Analisis bug dan berikan perbaikan kode yang bersih",
    template: "Analisis dan perbaiki bug atau error pada kode berikut:\n```\n\n```",
  },
  {
    cmd: "/summarize",
    title: "Ringkas Teks & Dokumen",
    desc: "Buat poin-poin ikhtisar penting dari dokumen panjang",
    template: "Ringkas teks berikut menjadi poin-poin utama yang jelas dan padat:\n",
  },
  {
    cmd: "/explain",
    title: "Jelaskan Konsep",
    desc: "Jelaskan topik secara sederhana dan beri contoh nyata",
    template: "Jelaskan konsep ini secara sederhana dan beri contoh nyata: ",
  },
  {
    cmd: "/web",
    title: "Cari Berita Terkini",
    desc: "Aktifkan crawler web real-time untuk berita terkini",
    template: "Cari berita dan informasi terkini di web tentang ",
    enableWeb: true,
  },
];

interface ChatInputBarProps {
  onSendMessage: (text: string, attachments?: AttachmentFile[], enableWebSearch?: boolean) => void;
  isLoading?: boolean;
  selectedModel: ModelItem;
  onSelectModel: (model: ModelItem) => void;
  selectedLucidMode?: LucidMode | null;
  onSelectLucidMode?: (mode: LucidMode | null) => void;
  isArenaMode?: boolean;
  onToggleArenaMode?: () => void;
  isHandsFreeMode?: boolean;
  onToggleHandsFreeMode?: () => void;
}

export function ChatInputBar({
  onSendMessage,
  isLoading,
  selectedModel,
  onSelectModel,
  selectedLucidMode = null,
  onSelectLucidMode,
  isArenaMode = false,
  onToggleArenaMode,
  isHandsFreeMode = false,
  onToggleHandsFreeMode,
}: ChatInputBarProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<"combo" | "single">("single");
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isSlashOpen, setIsSlashOpen] = useState(false);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const slashRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasAutoWebSearchRef = useRef(false);

  // Toggle model dropdown & ensure default open tab is always "Model Spesifik" (Tab Kiri)
  const handleToggleModelOpen = () => {
    setIsModelOpen((prev) => {
      const next = !prev;
      if (next) {
        setPickerTab("single");
        setModelSearchQuery("");
      }
      return next;
    });
  };

  // Derive slash query and filter commands in real-time
  const slashQuery = input.startsWith("/") ? input.slice(1).toLowerCase().trim() : "";
  const filteredSlashCommands = SLASH_COMMANDS.filter((item) => {
    if (!slashQuery) return true;
    const cmdWithoutSlash = item.cmd.replace("/", "").toLowerCase();
    return (
      cmdWithoutSlash.includes(slashQuery) ||
      item.cmd.toLowerCase().includes(slashQuery) ||
      item.title.toLowerCase().includes(slashQuery) ||
      item.desc.toLowerCase().includes(slashQuery)
    );
  });

  // Reset slash command index when query changes
  useEffect(() => {
    setSlashSelectedIndex(0);
  }, [input]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Close dropdown & slash menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelOpen(false);
      }
      if (slashRef.current && !slashRef.current.contains(e.target as Node)) {
        setIsSlashOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Web Speech API Integration for Voice STT Input
  const handleToggleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Fitur Speech-to-Text tidak didukung pada browser Anda. Gunakan Google Chrome atau Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Prompt Auto-Enhancer API call
  const handleEnhancePrompt = async () => {
    if (!input.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const enhancedText = `Tolong perjelas dan jawab secara komprehensif, terstruktur, dan mendalam pertanyaan berikut:\n\n"${input.trim()}"`;
      setInput(enhancedText);
    } catch {
      // Fallback silent
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle File Upload (Supports Image, PDF, Excel .xlsx/.csv, Word .docx, Code, Text)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(async (file) => {
      const isImage = file.type.startsWith("image/");
      const fileId = `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const content = evt.target?.result as string;
          setAttachments((prev) => [
            ...prev,
            {
              id: fileId,
              name: file.name,
              type: "image",
              content,
              mimeType: file.type,
              isScanned: true,
              isParsing: false,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        // Document parsing (PDF, Excel, Word, Text, Code)
        // Add loading placeholder chip
        setAttachments((prev) => [
          ...prev,
          {
            id: fileId,
            name: file.name,
            type: "file",
            content: "",
            mimeType: file.type,
            isScanned: false,
            isParsing: true,
          },
        ]);

        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/parse-file", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (data.success && data.content) {
            setAttachments((prev) =>
              prev.map((att) =>
                att.id === fileId
                  ? {
                      ...att,
                      content: data.content,
                      isScanned: true,
                      isParsing: false,
                    }
                  : att
              )
            );
          } else {
            throw new Error(data.error || "Gagal memproses dokumen");
          }
        } catch (err: unknown) {
          console.error("Document parse error:", err);
          // Fallback reading as text if client-side fallback works
          const reader = new FileReader();
          reader.onload = (evt) => {
            const content = evt.target?.result as string;
            setAttachments((prev) =>
              prev.map((att) =>
                att.id === fileId
                  ? {
                      ...att,
                      content: content || "Gagal membaca isi file.",
                      isScanned: true,
                      isParsing: false,
                    }
                  : att
              )
            );
          };
          reader.readAsText(file);
        }
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    playClickSound();
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSelectSlashCommand = (cmdItem: typeof SLASH_COMMANDS[0]) => {
    playClickSound();
    setInput(cmdItem.template);
    if (cmdItem.enableWeb) {
      setIsWebSearchEnabled(true);
    }
    setIsSlashOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    playSendSound();
    setIsSlashOpen(false);
    onSendMessage(input.trim(), attachments, isWebSearchEnabled);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleSelectCombo = (mode: LucidMode) => {
    playClickSound();
    if (onSelectLucidMode) {
      onSelectLucidMode(mode);
    }
    if (mode.defaultModelId) {
      const targetModel = DEFAULT_MODELS.find((m) => m.id === mode.defaultModelId);
      if (targetModel) {
        onSelectModel(targetModel);
      }
    }
    if (mode.forceWebSearch) {
      setIsWebSearchEnabled(true);
      wasAutoWebSearchRef.current = true;
    } else if (wasAutoWebSearchRef.current) {
      setIsWebSearchEnabled(false);
      wasAutoWebSearchRef.current = false;
    }
    setIsModelOpen(false);
  };

  const renderModeIcon = (iconName: string) => {
    switch (iconName) {
      case "Code2":
        return <Code2 className="w-4 h-4" />;
      case "Globe":
        return <Globe className="w-4 h-4" />;
      case "Brain":
        return <Brain className="w-4 h-4" />;
      case "PenTool":
        return <PenTool className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSlashOpen && filteredSlashCommands.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev + 1) % filteredSlashCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev - 1 + filteredSlashCommands.length) % filteredSlashCommands.length);
        return;
      }
      if ((e.key === "Enter" || e.key === "Tab") && !e.shiftKey) {
        e.preventDefault();
        const selectedCmd = filteredSlashCommands[slashSelectedIndex] || filteredSlashCommands[0];
        if (selectedCmd) {
          handleSelectSlashCommand(selectedCmd);
          return;
        }
      }
      if (e.key === "Escape") {
        setIsSlashOpen(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-1.5 sm:px-4">
      {/* Quick Slash Commands Menu — opens upward with real-time filtering & arrow navigation */}
      {isSlashOpen && filteredSlashCommands.length > 0 && (
        <div
          ref={slashRef}
          className="absolute bottom-full left-2 right-2 sm:left-4 sm:right-4 mb-2 bg-[#121216] border border-white/15 py-2 z-50 animate-slide-up divide-y divide-white/10 max-h-72 overflow-y-auto shadow-2xl rounded-2xl"
        >
          <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 pb-2 text-[10px] font-semibold text-white/50 tracking-wider uppercase">
            <span>⚡ Prompt Cepat / Slash Commands</span>
            <button
              type="button"
              onClick={() => setIsSlashOpen(false)}
              className="p-0.5 rounded text-white/40 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="p-1 space-y-0.5">
            {filteredSlashCommands.map((item, idx) => {
              const isSelected = idx === slashSelectedIndex;
              return (
                <button
                  key={item.cmd}
                  type="button"
                  onClick={() => handleSelectSlashCommand(item)}
                  onMouseEnter={() => setSlashSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all duration-150 ${
                    isSelected
                      ? "bg-white/20 text-white shadow-sm border border-white/20"
                      : "hover:bg-white/[0.10] text-white/80 hover:text-white"
                  } group`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold ${
                      isSelected ? "bg-white/30 text-white" : "bg-white/10 text-white group-hover:bg-white/20"
                    }`}>
                      {item.cmd}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium text-white/90 text-[12px]">{item.title}</span>
                      <span className="text-[10px] text-white/40">{item.desc}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Model & Lucid Combo Selector Dropdown — opens upward */}
      {isModelOpen && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-[#121216] border border-white/15 divide-y divide-white/10 max-h-[75vh] md:max-h-[420px] overflow-y-auto shadow-2xl rounded-2xl z-50 animate-slide-up w-full"
        >
          {/* Header with 2 Tabs: Kiri = Model Spesifik, Kanan = Lucid Combo */}
          <div className="p-2.5 sm:p-3 border-b border-white/10 space-y-2.5 sm:space-y-3 sticky top-0 bg-[#121216] backdrop-blur-xl z-10">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-white/80" />
                <span className="text-xs font-semibold text-white tracking-wide">Pilih Model & Preset AI</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModelOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2 Tab Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-medium">
              <button
                type="button"
                onClick={() => setPickerTab("single")}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  pickerTab === "single"
                    ? "bg-white/20 text-white shadow-sm font-semibold border border-white/20"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-white/80" />
                <span>Model Spesifik</span>
              </button>
              <button
                type="button"
                onClick={() => setPickerTab("combo")}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  pickerTab === "combo"
                    ? "bg-white/20 text-white shadow-sm font-semibold border border-white/20"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
                <span>Lucid Combo</span>
              </button>
            </div>

            {/* Search Input for Single Model Tab */}
            {pickerTab === "single" && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={modelSearchQuery}
                  onChange={(e) => setModelSearchQuery(e.target.value)}
                  placeholder="Cari model AI (Gemini, Kimi, GPT-4o, Claude, DeepSeek...)..."
                  className="w-full bg-white/[0.07] border border-white/15 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:border-white/30 transition-all"
                  autoFocus
                />
                {modelSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setModelSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TAB 2: LUCID COMBO (ALL-IN-ONE & SPECIALIZED MODES) */}
          {pickerTab === "combo" ? (
            <div className="p-2.5 sm:p-3 space-y-2 sm:space-y-2.5">
              <div className="px-1 text-[10px] sm:text-[11px] text-white/40">
                Mode Lucid Combo menggabungkan model AI terbaik, instruksi spesialis, dan fitur crawler otomatis.
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {LUCID_MODES.map((mode) => {
                  const isSelected = selectedLucidMode?.id === mode.id;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => handleSelectCombo(mode)}
                      className={`group p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-start justify-between gap-2.5 sm:gap-3 ${
                        isSelected
                          ? "bg-white/15 border-white/40 shadow-md"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-white/10 border border-white/15 text-white shrink-0 shadow-sm mt-0.5">
                          {renderModeIcon(mode.icon)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <h4 className="text-xs font-semibold text-white truncate">{mode.name}</h4>
                            <span className="text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-white/60 font-mono">
                              {mode.subtitle}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-white/50 mt-1 leading-relaxed line-clamp-2">{mode.description}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="p-1 rounded-full bg-white text-black shrink-0 mt-0.5 shadow-md">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TAB 1: SINGLE MODEL LIST */
            <div className="py-2">
              {BRAND_CATEGORIES.every((cat) => {
                const matched = cat.items.filter((m) => {
                  if (!modelSearchQuery.trim()) return true;
                  const q = modelSearchQuery.toLowerCase().trim();
                  return (
                    m.display_name.toLowerCase().includes(q) ||
                    m.id.toLowerCase().includes(q) ||
                    m.provider.toLowerCase().includes(q) ||
                    m.capability_tags.some((t) => t.toLowerCase().includes(q))
                  );
                });
                return matched.length === 0;
              }) && modelSearchQuery.trim() ? (
                <div className="px-4 py-6 text-center text-xs text-white/40">
                  Model AI tidak ditemukan untuk &quot;{modelSearchQuery}&quot;
                </div>
              ) : (
                BRAND_CATEGORIES.map((cat) => {
                  const matchedItems = cat.items.filter((m) => {
                    if (!modelSearchQuery.trim()) return true;
                    const q = modelSearchQuery.toLowerCase().trim();
                    return (
                      m.display_name.toLowerCase().includes(q) ||
                      m.id.toLowerCase().includes(q) ||
                      m.provider.toLowerCase().includes(q) ||
                      m.capability_tags.some((t) => t.toLowerCase().includes(q))
                    );
                  });

                  if (matchedItems.length === 0) return null;
                  const CategoryIcon = cat.icon || Sparkles;

                  return (
                    <div key={cat.tag} className="py-2 first:pt-0 last:pb-0 border-b border-white/[0.06] last:border-b-0">
                      <div className="px-3 sm:px-4 py-1.5 flex items-center gap-2 text-[10px] font-bold tracking-[0.12em] text-white/40 uppercase">
                        <CategoryIcon className="w-3.5 h-3.5 text-white/60" />
                        <span>{cat.title}</span>
                      </div>
                      <div className="space-y-1 px-2 mt-0.5">
                        {matchedItems.map((m) => {
                          const isSelected = !selectedLucidMode && m.id === selectedModel.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                onSelectModel(m);
                                if (onSelectLucidMode) {
                                  onSelectLucidMode(null);
                                }
                                if (wasAutoWebSearchRef.current) {
                                  setIsWebSearchEnabled(false);
                                  wasAutoWebSearchRef.current = false;
                                }
                                setIsModelOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-[13px] flex items-center justify-between transition-all duration-200 ${
                                isSelected
                                  ? "bg-white/15 text-white font-semibold border border-white/20 shadow-sm"
                                  : "text-white/70 hover:text-white hover:bg-white/[0.06]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`p-1.5 rounded-lg border shrink-0 shadow-sm transition-colors flex items-center justify-center ${
                                  isSelected
                                    ? "bg-white/20 border-white/30"
                                    : "bg-white/[0.08] border-white/10"
                                }`}>
                                  <ModelLogo modelId={m.id} provider={m.provider} className="w-4 h-4" />
                                </div>
                                <span className="truncate">{m.display_name}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                {m.is_free && (
                                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.06] font-mono">
                                    Free
                                  </span>
                                )}
                                {isSelected && (
                                  <div className="p-1 rounded-full bg-white text-black shrink-0 shadow-md">
                                    <Check className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Input Container */}
      <form onSubmit={handleSubmit} className="glass-input-container">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.xlsx,.xls,.docx,.csv,.txt,.md,.js,.ts,.tsx,.json,.py,.html,.css"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attachment Chips Bar */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 sm:px-4 pt-3 relative z-10">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.08] border border-white/[0.12] text-xs text-white/80 max-w-[240px]"
              >
                {a.type === "image" ? (
                  <ImageIcon className="w-3.5 h-3.5 text-white/60 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-white/60 shrink-0" />
                )}
                <span className="truncate text-[11px] font-medium">{a.name}</span>
                {a.isParsing ? (
                  <span className="flex items-center gap-1 text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>Parsing...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded-full shrink-0" title="File/Gambar Ter-Scan">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Scan</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  className="p-0.5 rounded-md hover:bg-white/20 text-white/40 hover:text-white transition-colors ml-auto shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea Row */}
        <div className="flex items-end gap-2 px-3 sm:px-4 pt-3 pb-1 relative z-10">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              setInput(val);
              if (val.startsWith("/")) {
                setIsSlashOpen(true);
              } else {
                setIsSlashOpen(false);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tanyakan sesuatu atau ketik '/' untuk perintah AI..."
            rows={1}
            className="w-full bg-transparent text-white text-sm placeholder-white/30 outline-none resize-none min-h-[38px] max-h-[160px] py-1.5 scrollbar-thin"
          />
        </div>

        {/* Bottom Action Row: Attach + Voice + Prompt Enhancer + Web Search + Model Selector + Send */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 px-2.5 sm:px-3 pb-2.5 pt-0.5 relative z-10">
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/[0.10] text-white/50 hover:text-white transition-all duration-200"
              title="Lampirkan Gambar atau File Teks/Kode (Auto-Scan)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                isListening
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                  : "hover:bg-white/[0.10] text-white/50 hover:text-white"
              }`}
              title={isListening ? "Hentikan perekaman suara" : "Gunakan Perekam Suara (Speech-to-Text)"}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
            </button>



            {/* Prompt Auto-Enhancer Magic Wand Button */}
            {input.trim() && (
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 hover:bg-white/20 text-[10px] sm:text-[11px] font-medium transition-all duration-200 shadow-sm"
                title="Sempurnakan & Perjelas Prompt Secara Otomatis dengan AI"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? "animate-spin" : ""}`} />
                <span>{isEnhancing ? "Enhancing..." : "Enhance"}</span>
              </button>
            )}

            {/* Web Search Toggle Button */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsWebSearchEnabled((prev) => !prev);
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-medium transition-all duration-200 ${
                isWebSearchEnabled
                  ? "bg-white/20 text-white border border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                  : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/80"
              }`}
              title={isWebSearchEnabled ? "Pencarian Web Terkini Aktif" : "Aktifkan Pencarian Web & Crawling Berita Terkini"}
            >
              <Globe className={`w-3.5 h-3.5 ${isWebSearchEnabled ? "text-white animate-pulse" : "text-white/40"}`} />
              <span className="hidden xs:inline sm:inline">Cari Web</span>
            </button>

            {/* Mode Arena Button */}
            {onToggleArenaMode && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onToggleArenaMode();
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all duration-200 ${
                  isArenaMode
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/80"
                }`}
                title={isArenaMode ? "Mode Arena Aktif (Bandingkan 2 AI Side-by-Side)" : "Aktifkan Mode Arena Bandingkan 2 AI"}
              >
                <Swords className={`w-3.5 h-3.5 ${isArenaMode ? "text-amber-400 animate-pulse" : "text-white/40"}`} />
                <span className="hidden xs:inline sm:inline">{isArenaMode ? "Mode Arena (Aktif)" : "Mode Arena"}</span>
              </button>
            )}

            {/* Unified Model & Lucid Combo Trigger Chip */}
            <button
              type="button"
              onClick={handleToggleModelOpen}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.10] hover:border-white/[0.16] text-[10px] sm:text-xs text-white transition-all duration-200 ml-0.5 sm:ml-1 shadow-sm max-w-[170px] sm:max-w-[240px]"
            >
              {selectedLucidMode ? (
                renderModeIcon(selectedLucidMode.icon)
              ) : (
                <ModelLogo modelId={selectedModel.id} provider={selectedModel.provider} className="w-3.5 h-3.5 text-white/90 shrink-0" />
              )}
              <span className="truncate font-medium text-[10px] sm:text-[11px]">
                {selectedLucidMode ? selectedLucidMode.name : selectedModel.display_name}
              </span>
              <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-200 shrink-0 ${isModelOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Hands-Free Voice Call Button (Placed to the left of Send/Enter) */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              if (onToggleHandsFreeMode) {
                onToggleHandsFreeMode();
              }
            }}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
              isHandsFreeMode
                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-[0_0_18px_rgba(16,185,129,0.4)] animate-pulse"
                : "bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-white/[0.12] hover:text-white"
            }`}
            title={isHandsFreeMode ? "Tutup Panggilan Suara AI" : "Mulai Panggilan Suara Hands-Free"}
          >
            <Headphones className={`w-4 h-4 ${isHandsFreeMode ? "text-emerald-400" : ""}`} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-250 shrink-0 ${
              (input.trim() || attachments.length > 0) && !isLoading
                ? "bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.35)] hover:shadow-[0_0_24px_rgba(255,255,255,0.45)] hover:scale-105 active:scale-95"
                : "bg-white/[0.06] text-white/25 border border-white/[0.06] cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex gap-0.5 items-center">
                <span className="typing-dot" style={{ width: 3, height: 3 }} />
                <span className="typing-dot" style={{ width: 3, height: 3 }} />
                <span className="typing-dot" style={{ width: 3, height: 3 }} />
              </div>
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
