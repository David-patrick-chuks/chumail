import { Check, X } from "lucide-react";

export function Security() {
  return (
    <section className="relative py-24 border-t border-zinc-800 bg-zinc-900/30">
      <div className="absolute left-0 right-0 top-24 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      <div className="absolute left-0 right-0 bottom-24 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tighter">
            Hardened & Private
          </h2>
          <p className="mt-4 text-xs font-mono text-zinc-500 max-w-2xl mx-auto uppercase tracking-widest">
            Encryption at rest. Isolation in execution. No telemetry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-zinc-700">
          <div className="relative bg-zinc-950 p-6 border-l-2 border-l-blue-500">
            <div className="absolute -top-px -right-px w-4 h-4 border-r border-t border-blue-500/50" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border border-blue-500/50 flex items-center justify-center">
                <Check className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-blue-400">
                Safety & Privacy
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Your SMTP credentials are encrypted and isolated",
                "Isolated memory execution for AI personas",
                "Automatic protection against harmful email content",
                "Detailed logs of every outreach interaction",
                "Granular control over agent response boundaries",
                "Secure, audited OAuth & App Password handling",
              ].map((item) => (

                <li key={item} className="flex items-start gap-3 text-zinc-300">
                  <Check className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative bg-zinc-950 p-6 border-l-2 border-l-zinc-600">
            <div className="absolute -top-px -right-px w-4 h-4 border-r border-t border-zinc-600/50" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border border-zinc-600 flex items-center justify-center">
                <X className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-300">
                Current Status
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                "Stability: Core Engine is Live",
                "Standard Gmail/Private SMTP rate limits",
                "Experimental hyper-personalization loops",
                "Agent-side objection handling constraints",
              ].map((item) => (

                <li key={item} className="flex items-start gap-3 text-zinc-400">
                  <X className="w-4 h-4 text-zinc-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative mt-12 border border-zinc-800 bg-zinc-950">
          <div className="absolute -top-px -left-px w-4 h-4 border-l border-t border-blue-500/50" />
          <div className="absolute -top-px -right-px w-4 h-4 border-r border-t border-blue-500/50" />
          <div className="absolute -bottom-px -left-px w-4 h-4 border-l border-b border-blue-500/50" />
          <div className="absolute -bottom-px -right-px w-4 h-4 border-r border-b border-blue-500/50" />

          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900">
            <h3 className="text-lg font-semibold text-white font-mono uppercase tracking-widest">
              System Specs
            </h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-800">
            <div className="bg-zinc-950 p-4">
              <div className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-widest">
                AI Intelligence
              </div>
              <div className="text-zinc-200 font-mono text-sm">Gemini 1.5 Flash</div>
            </div>
            <div className="bg-zinc-950 p-4">
              <div className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-widest">
                Mail Engine
              </div>
              <div className="text-zinc-200 font-mono text-sm">SMTP Cluster</div>
            </div>
            <div className="bg-zinc-950 p-4">
              <div className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-widest">
                Verification
              </div>
              <div className="text-zinc-200 font-mono text-sm">High-Entropy Logs</div>
            </div>
            <div className="bg-zinc-950 p-4">
              <div className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-widest">
                Outreach
              </div>
              <div className="text-zinc-200 font-mono text-sm">Global Discovery</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
