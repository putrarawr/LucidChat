import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service - LucidChat AI",
  description: "Syarat dan Ketentuan Penggunaan Layanan LucidChat AI",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans py-16 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-10 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-zinc-300">
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>Syarat & Ketentuan</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-zinc-400 font-mono">Terakhir Diperbarui: 15 September 2026</p>
        </div>

        <hr className="border-white/10" />

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses atau menggunakan LucidChat AI Platform, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan kami.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Penggunaan Layanan yang Diizinkan</h2>
            <p>
              Anda setuju untuk menggunakan LucidChat hanya untuk tujuan yang sah menurut hukum dan tidak akan menggunakan platform untuk menghasilkan konten ilegal, berbahaya, atau melanggar hak cipta pihak lain.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Penafian Tanggung Jawab AI</h2>
            <p>
              Hasil yang diberikan oleh model AI dapat mengandung ketidakakuratan. Pengguna bertanggung jawab penuh atas verifikasi informasi sebelum menggunakannya untuk keputusan penting.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Kontak & Lapor Bug</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Untuk pertanyaan, saran fitur, atau laporan masalah teknis (bug), Anda dapat menghubungi pengembang di{" "}
              <a href="mailto:putrarawr18@gmail.com" className="text-white underline font-mono hover:text-amber-300 transition-colors">
                putrarawr18@gmail.com
              </a>{" "}
              atau berkontribusi langsung pada repository open-source kami di{" "}
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
            <Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
