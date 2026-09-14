import { useState, useRef, useEffect } from "react";
import { ArrowUp, ChevronDown, Sparkles, Code, Brain, Globe, Laptop, Zap, X, Paperclip, Mic, MicOff, FileText, Image as ImageIcon, Wand2, CheckCircle2, Search, Code2, PenTool, Check, Layers, Cpu } from "lucide-react";
import { DEFAULT_MODELS, ModelItem } from "@/lib/model-types";
import { LUCID_MODES, LucidMode } from "@/lib/lucid-modes";
import { playClickSound, playSendSound } from "@/lib/sound";

export interface AttachmentFile {
  id: string;
  name: string;
  type: "image" | "file";
  content: string; // Base64 data URL for images, raw text for code/txt files
  mimeType?: string;
  isScanned?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  fast: Zap,
  routine: Zap,
  coding: Code,
  agentic: Sparkles,
  reasoning: Brain,
  multilingual: Globe,
  local: Laptop,
};

const CATEGORIES = [
  { tag: "agentic", title: "WEB CRAWLER & SEARCH AGENT", items: DEFAULT_MODELS.filter((m) => m.id === "web-crawler-agent") },
  { tag: "fast", title: "FAST & ROUTINE", items: DEFAULT_MODELS.filter((m) => m.capability_tags.includes("fast") && m.id !== "web-crawler-agent") },
  { tag: "coding", title: "CODING & AGENTIC", items: DEFAULT_MODELS.filter((m) => m.capability_tags.includes("coding")) },
  { tag: "reasoning", title: "DEEP REASONING", items: DEFAULT_MODELS.filter((m) => m.capability_tags.includes("reasoning")) },
  { tag: "multilingual", title: "MULTILINGUAL", items: DEFAULT_MODELS.filter((m) => m.capability_tags.includes("multilingual") && m.id !== "web-crawler-agent") },
  { tag: "local", title: "LOCAL ENGINE", items: DEFAULT_MODELS.filter((m) => m.capability_tags.includes("local")) },
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
    title: "Rangkum Poin Utama",
    desc: "Rangkum teks panjang menjadi poin-poin penting",
    template: "Rangkum poin-poin utama dari teks berikut dalam Bahasa Indonesia:\n",
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
  selectedLucidMode?: LucidMode;
  onSelectLucidMode?: (mode: LucidMode) => void;
}

export function ChatInputBar({
  onSendMessage,
  isLoading,
  selectedModel,
  onSelectModel,
  selectedLucidMode = LUCID_MODES[0],
  onSelectLucidMode,
}: ChatInputBarProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<"combo" | "single">("combo");
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
    if (isListening) {
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung Voice Input (Speech Recognition).");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
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
    playClickSound();
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setInput(data.enhancedPrompt);
      }
    } catch (err) {
      console.warn("Enhance prompt error:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();

      if (isImage) {
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            setAttachments((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                name: file.name,
                type: "image",
                content: result,
                mimeType: file.type,
                isScanned: true,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            setAttachments((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                name: file.name,
                type: "file",
                content: result,
                mimeType: file.type,
                isScanned: true,
              },
            ]);
          }
        };
        reader.readAsText(file);
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
    <div className="relative w-full max-w-4xl mx-auto px-2 md:px-4">
      {/* Quick Slash Commands Menu — opens upward with real-time filtering & arrow navigation */}
      {isSlashOpen && filteredSlashCommands.length > 0 && (
        <div
          ref={slashRef}
          className="absolute bottom-full left-4 right-4 mb-2 liquid-glass-elevated py-2 z-50 animate-slide-up border border-white/[0.12] divide-y divide-white/[0.06] max-h-72 overflow-y-auto shadow-2xl"
          style={{ borderRadius: "20px" }}
        >
          <div className="flex items-center justify-between px-4 py-1.5 pb-2 text-[10px] font-semibold text-white/50 tracking-wider uppercase">
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
          className="absolute bottom-full left-0 right-0 mb-2 bg-[#121216] border border-white/15 divide-y divide-white/10 max-h-[420px] overflow-y-auto shadow-2xl rounded-2xl z-50 animate-slide-up"
        >
          {/* Header with 2 Tabs: Kiri = Model Spesifik, Kanan = Lucid Combo */}
          <div className="p-3 border-b border-white/10 space-y-3 sticky top-0 bg-[#121216] backdrop-blur-xl z-10">
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
            <div className="p-3 space-y-2.5">
              <div className="px-1 text-[11px] text-white/40">
                Mode Lucid Combo menggabungkan model AI terbaik, instruksi spesialis, dan fitur crawler otomatis.
              </div>
              <div className="space-y-2">
                {LUCID_MODES.map((mode) => {
                  const isSelected = selectedLucidMode?.id === mode.id;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => handleSelectCombo(mode)}
                      className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-white/15 border-white/40 shadow-md"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/10 border border-white/15 text-white shrink-0 shadow-sm">
                          {renderModeIcon(mode.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold text-white">{mode.name}</h4>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-white/60 font-mono">
                              {mode.subtitle}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{mode.description}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="p-1 rounded-full bg-white text-black shrink-0 mt-0.5 shadow-md">
                          <Check className="w-3.5 h-3.5" />
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
              {CATEGORIES.every((cat) => {
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
                CATEGORIES.map((cat) => {
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
                  const Icon = CATEGORY_ICONS[cat.tag] || Sparkles;

                  return (
                    <div key={cat.tag} className="py-1.5 first:pt-0 last:pb-0">
                      <div className="px-4 py-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-white/30 uppercase">
                        <Icon className="w-3 h-3" />
                        <span>{cat.title}</span>
                      </div>
                      <div className="space-y-0.5 px-2">
                        {matchedItems.map((m) => {
                          const isSelected = m.id === selectedModel.id && pickerTab === "single";
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                onSelectModel(m);
                                setIsModelOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all duration-200 ${
                                isSelected
                                  ? "bg-white/15 text-white font-medium border border-white/20 shadow-sm"
                                  : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] shrink-0" />
                                )}
                                <span className="truncate">{m.display_name}</span>
                              </div>
                              {m.is_free && (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.06] ml-2 shrink-0">
                                  Free
                                </span>
                              )}
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
          accept="image/*,.txt,.md,.js,.ts,.tsx,.json,.py,.csv,.html,.css"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attachment Chips Bar */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 relative z-10">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.08] border border-white/[0.12] text-xs text-white/80 max-w-[220px]"
              >
                {a.type === "image" ? (
                  <ImageIcon className="w-3.5 h-3.5 text-white/60 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-white/60 shrink-0" />
                )}
                <span className="truncate text-[11px] font-medium">{a.name}</span>
                <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded-full shrink-0" title="File/Gambar Ter-Scan">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Scan</span>
                </span>
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
        <div className="flex items-end gap-2 px-4 pt-3 pb-1 relative z-10">
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
        <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5 relative z-10">
          <div className="flex items-center gap-1.5">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-white/[0.10] text-white/50 hover:text-white transition-all duration-200"
              title="Lampirkan Gambar atau File Teks/Kode (Auto-Scan)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2 rounded-full transition-all duration-200 ${
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
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 hover:bg-white/20 text-[11px] font-medium transition-all duration-200 shadow-sm"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 ${
                isWebSearchEnabled
                  ? "bg-white/20 text-white border border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                  : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/80"
              }`}
              title={isWebSearchEnabled ? "Pencarian Web Terkini Aktif" : "Aktifkan Pencarian Web & Crawling Berita Terkini"}
            >
              <Globe className={`w-3.5 h-3.5 ${isWebSearchEnabled ? "text-white animate-pulse" : "text-white/40"}`} />
              <span className="hidden sm:inline">Cari Web</span>
            </button>

            {/* Unified Model & Lucid Combo Trigger Chip */}
            <button
              type="button"
              onClick={() => setIsModelOpen(!isModelOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.10] hover:border-white/[0.16] text-xs text-white transition-all duration-200 ml-1 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
              <span className="max-w-[140px] md:max-w-[180px] truncate font-medium text-[11px]">
                {selectedLucidMode && selectedLucidMode.name !== "Lucid All-in-One" ? selectedLucidMode.name : selectedModel.display_name}
              </span>
              <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-200 ${isModelOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-250 ${
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
