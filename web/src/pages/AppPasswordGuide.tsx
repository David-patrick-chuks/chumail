import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Key, CheckCircle, ExternalLink } from "lucide-react";

export function AppPasswordGuide() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-500/30">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
            <div className="fixed inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative max-w-4xl mx-auto px-6 py-12 md:py-20">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-colors mb-12 font-mono text-xs uppercase tracking-widest cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Terminal
                </button>

                {/* Header */}
                <div className="space-y-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border border-blue-500/30 bg-blue-500/5 text-blue-400 text-[10px] font-mono uppercase tracking-widest">
                        <Shield className="w-3 h-3" />
                        Security Protocol
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                        Configuring Google <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">App Passwords</span>
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-2xl font-mono uppercase text-sm tracking-tight">
                        To enable ChuMail agents to send emails securely, you must generate a dedicated 16-character App Password.
                    </p>
                </div>

                {/* Video Section */}
                <div className="border border-zinc-800 bg-zinc-900/40 p-1 mb-16 shadow-2xl">
                    <div className="aspect-video bg-zinc-950 flex items-center justify-center relative group">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/wniM7sU0bmU"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            Visual walkthrough
                        </span>
                        <a
                            href="https://youtu.be/wniM7sU0bmU"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-blue-400 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Steps Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <Key className="w-5 h-5 text-blue-500" />
                            Step-by-Step Guide
                        </h2>

                        <div className="space-y-4">
                            {[
                                { step: "01", title: "Enable 2FA", desc: "Ensure 2-Step Verification is active on your Google Account." },
                                { step: "02", title: "Access Security", desc: "Navigate to your Google Account -> Security -> 2-Step Verification." },
                                { step: "03", title: "App Passwords", desc: "Scroll to the bottom and select 'App Passwords'." },
                                { step: "04", title: "Generate Code", desc: "Select 'Other' (Custom name), type 'ChuMail', and click Create." }
                            ].map((item, idx) => (
                                <div key={idx} className="p-4 border border-zinc-800 bg-zinc-900/20 hover:border-blue-500/30 transition-all group">
                                    <div className="flex gap-4">
                                        <span className="text-blue-500 font-mono text-xs font-bold pt-1">{item.step}</span>
                                        <div>
                                            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.title}</h3>
                                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                            Why is this required?
                        </h2>
                        <div className="p-6 border border-zinc-800 bg-zinc-900/40 space-y-4">
                            <p className="text-sm text-zinc-400 leading-relaxed font-mono">
                                Google restricts direct SMTP access for third-party apps to protect your main password.
                            </p>
                            <ul className="space-y-3 text-xs text-zinc-500 font-mono">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">&gt;&gt;</span>
                                    <span>You never share your actual Google password with ChuMail.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">&gt;&gt;</span>
                                    <span>You can revoke access instantly from your Google Security console.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">&gt;&gt;</span>
                                    <span>Provides high-level encryption for automated outreach.</span>
                                </li>

                            </ul>
                            <div className="pt-4">
                                <a
                                    href="https://myaccount.google.com/apppasswords"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold text-[10px] font-mono transition-all uppercase"
                                >
                                    Open App Passwords
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="border-t border-zinc-900 pt-8 text-center">
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                        ChuMail Security Protocol // End of Instruction
                    </p>
                </div>
            </div>
        </div>
    );
}
