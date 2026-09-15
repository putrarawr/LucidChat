"use client";

import { useEffect, useState, useRef } from "react";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { ModelItem } from "@/lib/model-types";
import { ModelLogo } from "@/components/icons/ModelLogos";
import { stripThinkTags } from "@/components/chat/MessageBubble";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: ModelItem;
  userName?: string;
  onSendMessage: (text: string) => Promise<void> | void;
  isLoading?: boolean;
  lastAiMessage?: string;
}

type CallStatus = "greeting" | "listening" | "thinking" | "speaking" | "idle";

export function VoiceCallModal({
  isOpen,
  onClose,
  selectedModel,
  userName,
  onSendMessage,
  isLoading = false,
  lastAiMessage = "",
}: VoiceCallModalProps) {
  const [pulseScale, setPulseScale] = useState(1);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [aiSpeechText, setAiSpeechText] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const hasGreetedRef = useRef(false);
  const prevLoadingRef = useRef(false);

  // Concentric ring animation effect
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.08 : 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Configure distinct Voice Persona based on selected AI Model / Provider
  const getVoiceSettings = () => {
    const provider = selectedModel.provider?.toLowerCase() || "";
    const id = selectedModel.id?.toLowerCase() || "";

    if (id.includes("gemini") || provider === "gemini") {
      return { pitch: 1.15, rate: 1.05 }; // Warm & energetic
    } else if (id.includes("claude") || provider === "anthropic") {
      return { pitch: 0.85, rate: 0.92 }; // Calm & deep
    } else if (id.includes("deepseek")) {
      return { pitch: 1.08, rate: 1.12 }; // Fast & articulate
    } else if (id.includes("qwen") || id.includes("kimi")) {
      return { pitch: 1.12, rate: 1.0 }; // Soft & friendly
    }
    // Default (OpenAI, etc.)
    return { pitch: 1.0, rate: 1.0 };
  };

  // Handle SpeechSynthesis (TTS) with model-specific voice persona
  const speakText = (text: string, onEndCallback?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    if (isSpeakerMuted) {
      if (onEndCallback) onEndCallback();
      return;
    }

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[*#_~`]/g, "")
      .trim();

    if (!cleanText) {
      if (onEndCallback) onEndCallback();
      return;
    }

    setAiSpeechText(cleanText);
    setCallStatus("speaking");

    const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 500));
    utterance.lang = "id-ID";

    const { pitch, rate } = getVoiceSettings();
    utterance.pitch = pitch;
    utterance.rate = rate;

    // Dynamically pick distinct voice from available browser voices if present
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const idVoices = voices.filter((v) => v.lang.includes("id") || v.lang.includes("ID"));
      if (idVoices.length > 0) {
        // Pick voice index based on provider hash
        const providerHash = selectedModel.provider.charCodeAt(0) % idVoices.length;
        utterance.voice = idVoices[providerHash] || idVoices[0];
      }
    }

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handle Speech Recognition (STT)
  const startListening = () => {
    if (typeof window === "undefined") return;

    if (isMicMuted) {
      setCallStatus("idle");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setCallStatus("idle");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setCallStatus("listening");
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((res: any) => res[0].transcript)
          .join("");

        setUserTranscript(transcript);

        if (event.results[0].isFinal) {
          recognition.stop();
          if (transcript.trim()) {
            setCallStatus("thinking");
            onSendMessage(transcript.trim());
          }
        }
      };

      recognition.onerror = () => {
        setCallStatus("idle");
      };

      recognition.onend = () => {
        // Handled via state
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Start listening error:", err);
      setCallStatus("idle");
    }
  };

  // Initial call setup & AI greeting on call start
  useEffect(() => {
    if (isOpen) {
      hasGreetedRef.current = false;
      const nameToUse = userName ? userName.split(" ")[0] : "Kawan";
      const greeting = `Halo ${nameToUse}! Suara Anda terhubung dengan ${selectedModel.display_name}. Silakan bicara.`;

      const timer = setTimeout(() => {
        hasGreetedRef.current = true;
        speakText(greeting, () => {
          startListening();
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      };
    } else {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setCallStatus("idle");
      setUserTranscript("");
      setAiSpeechText("");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedModel.id]);

  // When AI finishes loading response, speak response with dynamic model voice!
  useEffect(() => {
    if (!isOpen) return;

    if (prevLoadingRef.current && !isLoading && lastAiMessage) {
      const cleanResponse = stripThinkTags(lastAiMessage);
      speakText(cleanResponse, () => {
        startListening();
      });
    }

    prevLoadingRef.current = isLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, lastAiMessage, isOpen]);

  if (!isOpen) return null;

  // Ultra-clean status text (No heavy badge bars)
  let statusText = "Ketuk untuk bicara";
  if (callStatus === "listening") {
    statusText = "Mendengarkan...";
  } else if (isLoading || callStatus === "thinking") {
    statusText = "Berpikir...";
  } else if (callStatus === "speaking") {
    statusText = "Berbicara...";
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-[#07070d]/98 backdrop-blur-3xl p-6 sm:p-10 select-none animate-fade-in font-sans">
      {/* Sleek Minimal Header (No Slop Badges) */}
      <div className="w-full max-w-md flex items-center justify-center pt-6 relative z-10">
        <div className="flex items-center gap-2 text-white/70 font-medium text-sm tracking-wide">
          <ModelLogo modelId={selectedModel.id} provider={selectedModel.provider} className="w-4 h-4 opacity-80 shrink-0" />
          <span>{selectedModel.display_name}</span>
        </div>
      </div>

      {/* Center: Glowing Interactive Audio Orb */}
      <div className="flex flex-col items-center justify-center my-auto relative z-10">
        <div className="relative flex items-center justify-center">
          {/* Concentric Pulsing Wave Rings */}
          {(callStatus === "listening" || callStatus === "speaking" || isLoading) && (
            <>
              <div
                className={`absolute rounded-full transition-all duration-1000 ${
                  callStatus === "speaking"
                    ? "w-64 h-64 sm:w-80 sm:h-80 bg-blue-500/10 blur-2xl animate-ping"
                    : callStatus === "listening"
                    ? "w-64 h-64 sm:w-80 sm:h-80 bg-emerald-500/10 blur-2xl animate-ping"
                    : "w-64 h-64 sm:w-80 sm:h-80 bg-purple-500/10 blur-2xl animate-ping"
                }`}
              />
              <div
                className={`absolute rounded-full transition-all duration-700 ${
                  callStatus === "speaking"
                    ? "w-52 h-52 sm:w-64 sm:h-64 bg-cyan-500/15 blur-xl"
                    : callStatus === "listening"
                    ? "w-52 h-52 sm:w-64 sm:h-64 bg-emerald-400/15 blur-xl"
                    : "w-52 h-52 sm:w-64 sm:h-64 bg-amber-500/15 blur-xl"
                }`}
                style={{ transform: `scale(${pulseScale})` }}
              />
            </>
          )}

          {/* Core Central Orb */}
          <button
            type="button"
            onClick={() => {
              if (callStatus !== "listening" && !isLoading && callStatus !== "speaking") {
                startListening();
              }
            }}
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center transition-all duration-500 border shadow-2xl relative z-10 cursor-pointer ${
              callStatus === "speaking"
                ? "bg-gradient-to-br from-blue-600/30 via-cyan-500/20 to-purple-600/30 border-cyan-400/40 shadow-[0_0_60px_rgba(6,182,212,0.35)]"
                : callStatus === "listening"
                ? "bg-gradient-to-br from-emerald-600/30 via-teal-500/20 to-green-600/30 border-emerald-400/40 shadow-[0_0_60px_rgba(16,185,129,0.35)]"
                : isLoading || callStatus === "thinking"
                ? "bg-gradient-to-br from-amber-600/30 via-purple-500/20 to-pink-600/30 border-amber-400/40 shadow-[0_0_60px_rgba(245,158,11,0.35)]"
                : "bg-gradient-to-br from-white/10 via-white/5 to-white/10 border-white/15 shadow-xl hover:scale-105"
            }`}
          >
            <ModelLogo modelId={selectedModel.id} provider={selectedModel.provider} className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          </button>
        </div>

        {/* Minimal Clean Status Indicator */}
        <p className="mt-6 text-xs font-medium tracking-wide text-white/50">{statusText}</p>

        {/* Dynamic Transcript Subtitle Box */}
        <div className="mt-4 max-w-sm sm:max-w-md w-full px-4 text-center">
          {userTranscript && (
            <p className="text-xs sm:text-sm text-emerald-300/90 font-medium line-clamp-2 bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/20 mb-2">
              &quot;{userTranscript}&quot;
            </p>
          )}
          {aiSpeechText && (
            <p className="text-xs sm:text-sm text-white/80 font-normal line-clamp-3 bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/[0.08] shadow-sm">
              {aiSpeechText}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Phone Action Controls Bar */}
      <div className="w-full max-w-sm flex items-center justify-center gap-6 pb-8 relative z-10">
        {/* Mute Mic Button */}
        <button
          type="button"
          onClick={() => {
            setIsMicMuted((prev) => {
              const next = !prev;
              if (next && recognitionRef.current) {
                recognitionRef.current.abort();
                setCallStatus("idle");
              } else if (!next) {
                startListening();
              }
              return next;
            });
          }}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 border shadow-lg ${
            isMicMuted
              ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
              : "bg-white/[0.06] border-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
          title={isMicMuted ? "Nyalakan Mikrofon" : "Matikan Mikrofon"}
        >
          {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* End Call Red Phone Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 border border-red-400/40"
          title="Tutup Panggilan Suara (End Call)"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Speaker Mute/Unmute Button */}
        <button
          type="button"
          onClick={() => {
            setIsSpeakerMuted((prev) => {
              const next = !prev;
              if (next && typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              return next;
            });
          }}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 border shadow-lg ${
            isSpeakerMuted
              ? "bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
              : "bg-white/[0.06] border-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
          title={isSpeakerMuted ? "Nyalakan Suara AI" : "Matikan Suara AI"}
        >
          {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
