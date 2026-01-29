import {
  Shield,
  Bot,
  Zap,
  Cpu,
  Globe,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Persona Engine",
    description:
      "Craft distinct personalities for each email agent. Tailor tone, style, and expertise to match your brand's outreach strategy.",
  },
  {
    icon: Zap,
    title: "Smart Scraper",
    description:
      "Automatically discover leads from any URL. AI identifies names and roles from context, building your pipeline in seconds.",
  },
  {
    icon: Globe,
    title: "Marketplace Discovery",
    description:
      "Access a community-driven repository of high-converting email templates. Use, share, and track proven outreach strategies.",
  },
  {
    icon: Cpu,
    title: "Hyper-Personalization",
    description:
      "Gemini-powered generation creates a unique, context-aware message for every single lead in your campaign blast.",
  },
  {
    icon: MessageSquare,
    title: "Industrial Studio",
    description:
      "A high-performance interface designed for scale. Monitor progress, manage agents, and track campaign status in real-time.",
  },
  {
    icon: Shield,
    title: "SMTP Security",
    description:
      "Secure, encrypted credential handling for all your sending identities. Professional-grade outreach with peace of mind.",
  },
];


export function Features() {
  return (
    <section id="features" className="relative py-24 border-t border-zinc-800">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Everything you need to build your AI workforce
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            ChuMail is built to be powerful yet simple. Create agents that understand your world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="relative p-6 bg-zinc-950 hover:bg-zinc-900/80 transition-colors group"
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-transparent group-hover:border-blue-500/50 transition-colors" />
              <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-transparent group-hover:border-blue-500/50 transition-colors" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs text-zinc-600 font-mono">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
