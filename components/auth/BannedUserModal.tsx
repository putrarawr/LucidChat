"use client";

import { useState } from "react";
import { ShieldAlert, Mail, Copy, Check, ExternalLink, X, AlertTriangle } from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface BannedUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  email?: string;
}

export default function BannedUserModal({
  isOpen,
  onClose,
  reason,
  email,
}: BannedUserModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const developerEmail = "putrarawr18@gmail.com";
  const developerGithub = "https://github.com/putrarawr";
  const effectiveReason = reason?.trim() || "Pelanggaran terhadap ketentuan layanan platform atau aktivitas tidak wajar.";

  const mailtoSubject = encodeURIComponent("Permohonan Unban Akun LucidChat");
  const mailtoBody = encodeURIComponent(
    `Halo Developer Septiyan Bintang,\n\nSaya ingin mengajukan permohonan pembukaan blokir (unban) untuk akun LucidChat saya:\n- Email Akun: ${email || "..."}\n- Alasan Blokir Tertera: ${effectiveReason}\n- Penjelasan/Permohonan: ...\n\nTerima kasih!`
  );
  const mailtoUrl = `mailto:${developerEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg liquid-glass-elevated border border-red-500/30 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-scale-up text-left overflow-hidden">
        {/* Subtle red background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-500/15 border border-red-500/30 text-red-400 mb-1">
              Akun Dinonaktifkan
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Anda Telah Di-ban oleh Developer
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
          Akses Anda ke platform LucidChat telah ditangguhkan oleh administrator sistem. Anda tidak dapat melakukan percakapan atau mengakses fitur akun.
        </p>

        {/* Reason Card */}
        <div className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 text-xs sm:text-sm space-y-1">
          <div className="flex items-center gap-1.5 text-red-400 font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alasan Pemblokiran:</span>
          </div>
          <div className="text-white/90 pl-5 font-mono text-xs break-words">
            &ldquo;{effectiveReason}&rdquo;
          </div>
        </div>

        {/* Appeal Section */}
        <div className="space-y-3 mb-6">
          <p className="text-xs text-white/60">
            Jika Anda merasa ini adalah kekeliruan atau ingin mengajukan permohonan pembukaan blokir (unban), silakan hubungi langsung developer melalui kanal berikut:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Email Contact Card */}
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-red-500/30 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Mail className="w-4 h-4 text-rose-400" />
                  <span>Email Developer</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 rounded text-white/40 hover:text-white transition-colors"
                  title="Salin Email"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[11px] font-mono text-white/70 truncate">
                {developerEmail}
              </div>
              <a
                href={mailtoUrl}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 text-xs font-medium transition-colors"
              >
                <span>Kirim Banding</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* GitHub Contact Card */}
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <GithubIcon className="w-4 h-4 text-white/80" />
                <span>GitHub Developer</span>
              </div>
              <div className="text-[11px] font-mono text-white/70 truncate">
                github.com/putrarawr
              </div>
              <a
                href={developerGithub}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-medium transition-colors"
              >
                <span>Buka GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 hover:text-white text-xs sm:text-sm font-medium transition-colors"
          >
            Tutup & Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
