"use client";

import { useEffect, useState, useRef } from "react";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Sparkles, Activity } from "lucide-react";
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

  // Handle SpeechSynthesis (TTS)
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
    utterance.rate = 1.0;

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
        // If ended without transcript and still in call, stay idle or retry
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
      const greeting = `Halo ${nameToUse}! Suara Anda terhubung. Silakan bicara, saya mendengarkan.`;

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
  }, [isOpen]);

  // When AI finishes loading response, speak response and listen again!
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

  // Status message
  let statusText = "Ketuk mikrofon untuk bicara";
  let statusBadge = "bg-white/10 text-white/70";
  if (callStatus === "listening") {
    statusText = "Mendengarkan suara Anda...";
    statusBadge = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse";
  } else if (isLoading || callStatus === "thinking") {
    statusText = "AI sedang berpikir...";
    statusBadge = "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse";
  } else if (callStatus === "speaking") {
    statusText = "AI sedang berbicara...";
    statusBadge = "bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse";
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-[#06060a]/95 backdrop-blur-3xl p-6 sm:p-10 select-none animate-fade-in font-sans">
      {/* Top Bar: Model info & Status */}
      <div className="w-full max-w-md flex flex-col items-center gap-3 pt-4 relative z-10">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 shadow-lg">
          <ModelLogo modelId={selectedModel.id} provider={selectedModel.provider} className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold text-white tracking-wide">{selectedModel.display_name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase font-mono tracking-wider">
            Voice Call
          </span>
        </div>

        {/* Live Call Status Badge */}
        <div className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all ${statusBadge}`}>
          <Activity className="w-3.5 h-3.5" />
          <span>{statusText}</span>
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
                    ? "w-64 h-64 sm:w-80 sm:h-80 bg-blue-500/15 blur-2xl animate-ping"
                    : callStatus === "listening"
                    ? "w-64 h-64 sm:w-80 sm:h-80 bg-emerald-500/15 blur-2xl animate-ping"
                    : "w-64 h-64 sm:w-80 sm:h-80 bg-purple-500/15 blur-2xl animate-ping"
                }`}
              />
              <div
                className={`absolute rounded-full transition-all duration-700 ${
                  callStatus === "speaking"
                    ? "w-52 h-52 sm:w-64 sm:h-64 bg-cyan-500/20 blur-xl"
                    : callStatus === "listening"
                    ? "w-52 h-52 sm:w-64 sm:h-64 bg-emerald-400/20 blur-xl"
                    : "w-52 h-52 sm:w-64 sm:h-64 bg-amber-500/20 blur-xl"
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
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-2xl relative z-10 cursor-pointer ${
              callStatus === "speaking"
                ? "bg-gradient-to-br from-blue-600/40 via-cyan-500/30 to-purple-600/40 border-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.4)]"
                : callStatus === "listening"
                ? "bg-gradient-to-br from-emerald-600/40 via-teal-500/30 to-green-600/40 border-emerald-400/50 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                : isLoading || callStatus === "thinking"
                ? "bg-gradient-to-br from-amber-600/40 via-purple-500/30 to-pink-600/40 border-amber-400/50 shadow-[0_0_50px_rgba(245,158,11,0.4)]"
                : "bg-gradient-to-br from-white/10 via-white/5 to-white/10 border-white/20 shadow-xl hover:scale-105"
            }`}
          >
            <ModelLogo modelId={selectedModel.id} provider={selectedModel.provider} className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          </button>
        </div>

        {/* Dynamic Transcript Subtitle Box */}
        <div className="mt-8 max-w-sm sm:max-w-md w-full px-4 text-center">
          {userTranscript && (
            <p className="text-xs sm:text-sm text-emerald-300/90 font-medium line-clamp-2 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/20 mb-2">
              &quot;{userTranscript}&quot;
            </p>
          )}
          {aiSpeechText && (
            <p className="text-xs sm:text-sm text-white/80 font-normal line-clamp-3 bg-white/[0.05] px-3.5 py-2 rounded-xl border border-white/10 shadow-sm">
              {aiSpeechText}
            </p>
          )}
          {!userTranscript && !aiSpeechText && (
            <p className="text-xs text-white/40 italic flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Bicara langsung secara alami. AI akan merespons dengan suara.</span>
            </p>
          )}
        </div>
      </div>

      {/* Bottom Phone Action Controls Bar */}
      <div className="w-full max-w-sm flex items-center justify-center gap-6 pb-6 relative z-10">
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
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 border shadow-lg ${
            isMicMuted
              ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
              : "bg-white/10 border-white/15 text-white/80 hover:bg-white/20 hover:text-white"
          }`}
          title={isMicMuted ? "Nyalakan Mikrofon" : "Matikan Mikrofon"}
        >
          {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call Red Phone Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 border border-red-400/40"
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
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 border shadow-lg ${
            isSpeakerMuted
              ? "bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
              : "bg-white/10 border-white/15 text-white/80 hover:bg-white/20 hover:text-white"
          }`}
          title={isSpeakerMuted ? "Nyalakan Suara AI" : "Matikan Suara AI"}
        >
          {isSpeakerMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
