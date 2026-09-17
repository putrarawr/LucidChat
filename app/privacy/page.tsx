import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - LucidChat AI",
  description: "Kebijakan Privasi dan Perlindungan Data Pengguna LucidChat AI",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans py-16 px-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-10 relative z-10">
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Perlindungan Data & Privasi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Kebijakan Privasi
          </h1>
          <p className="text-xs text-zinc-400 font-mono">Terakhir Diperbarui: 15 September 2026</p>
        </div>

        <hr className="border-white/10" />

        {/* Content */}
        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Informasi yang Kami Kumpulkan</h2>
            <p>
              LucidChat mengumpulkan informasi terbatas yang diperlukan untuk mengoperasikan platform AI multi-model kami secara aman:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
              <li><strong className="text-zinc-200">Informasi Akun:</strong> Alamat email, nama tampilan, dan foto profil yang disediakan saat Anda mendaftar melalui email atau penyedia OAuth (Google / GitHub).</li>
              <li><strong className="text-zinc-200">Riwayat Percakapan:</strong> Pesan teks, berkas dokumen yang diunggah, dan prompt yang dikirimkan ke model AI untuk keperluan sesi chat Anda.</li>
              <li><strong className="text-zinc-200">Data Penggunaan Teknis:</strong> Alamat IP, tipe peramban, dan log sesi yang digunakan untuk keamanan dan pembatasan laju (*rate limiting*).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Penggunaan Informasi</h2>
            <p>Informasi Anda digunakan secara eksklusif untuk:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
              <li>Menyediakan layanan inferensi AI dari berbagai model terintegrasi (Gemini, OpenAI, Claude, DeepSeek, dll).</li>
              <li>Menyimpan riwayat percakapan secara pribadi dalam basis data aman berteknologi Row Level Security (RLS).</li>
              <li>Mencegah penyalahgunaan sistem dan memastikan keamanan infrastruktur platform.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Keamanan & Keheningan Data</h2>
            <p>
              Kami mengimplementasikan enkripsi HTTPS standar industri, autentikasi aman via Supabase Auth, serta kontrol akses data ketat. Kami tidak pernah menjual atau membagikan data pribadi Anda kepada pihak ketiga untuk kepentingan iklan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Hak Pengguna</h2>
            <p>
              Anda berhak menghapus riwayat percakapan atau menghapus akun Anda kapan saja melalui antarmuka LucidChat.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Hubungi Kami & Lapor Bug</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, ingin melaporkan kendala teknis (bug), atau memberikan saran fitur, silakan hubungi pengembang langsung di{" "}
              <a href="mailto:putrarawr18@gmail.com" className="text-white underline font-mono hover:text-amber-300 transition-colors">
                putrarawr18@gmail.com
              </a>{" "}
              atau berkontribusi via repository GitHub kami di{" "}
              <a
                href="https://github.com/putrarawr/LucidChat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline font-mono hover:text-amber-300 transition-colors"
              >
                github.com/putrarawr/LucidChat
              </a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-white/10 text-xs text-zinc-500 flex justify-between items-center">
          <span>LucidChat AI &copy; 2026</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/putrarawr/LucidChat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub Repo
            </a>
            <Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
