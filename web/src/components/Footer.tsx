import { SiGithub } from "react-icons/si";


export function Footer() {
  return (
    <footer className="relative py-12 border-t border-zinc-800">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-blue-500 flex items-center justify-center text-blue-400 font-mono text-sm">
              C
            </div>

            <span className="text-xl font-semibold text-white font-mono">
              ChuMail
            </span>

          </div>

          <div className="flex items-center gap-6">
            <a
              href="/guide/google-app-password"
              className="text-xs font-mono text-zinc-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
            >
              Setup Guide
            </a>
            <a
              href="https://github.com/chumail-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-blue-500/50 transition-colors"
            >
              <SiGithub className="w-4 h-4" />
            </a>
          </div>


        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
          <p className="font-mono">
            © {new Date().getFullYear()} ChuMail — AI Outreach & Email Agent Platform
          </p>
          <p>
            Scaling human outreach with intelligence
            <span className="text-blue-500 ml-1">_</span>
          </p>

        </div>
      </div>
    </footer>
  );
}
