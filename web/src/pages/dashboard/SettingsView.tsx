import { useState, useEffect } from "react";
import { Shield, Key, Bell, Loader2 } from "lucide-react";
import { InfoModal } from "../../components/Modal";
import { authService } from "../../services/index";

export function SettingsView() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        logInteractions: true,
        anonymizeData: false,
        humanInLoop: true,
        emailSummaries: true,
        slackAlerts: false
    });

    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoMessage, setInfoMessage] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const profile = await authService.getProfile();
            if (profile.preferences && Object.keys(profile.preferences).length > 0) {
                setPreferences(prev => ({ ...prev, ...profile.preferences }));
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const showInfo = (message: string) => {
        setInfoMessage(message);
        setInfoModalOpen(true);
    };

    const handleUpdateKey = (keyType: string) => {
        showInfo(`Update ${keyType} key is managed via environment variables for maximum security.`);
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await authService.updateProfile({ preferences });
            showInfo("Settings synchronized with neural profile successfully.");
        } catch (error) {
            showInfo("Failed to synchronize settings.");
        } finally {
            setSaving(false);
        }
    };

    const togglePref = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) return <div className="p-8 font-mono text-zinc-500 uppercase tracking-widest">Accessing preference layer...</div>;

    return (
        <>
            <div className="max-w-4xl space-y-12">
                <div>
                    <h2 className="text-xl font-bold mb-2">Settings</h2>
                    <p className="text-zinc-500 text-sm">Manage your platform configuration, security and team access.</p>
                </div>

                <div className="space-y-6">
                    <SettingsSection
                        icon={Key}
                        title="API Credentials"
                        desc="Configuration for Gemini 3 and platform integration keys."
                    >
                        <div className="space-y-4 p-4 bg-zinc-950/30 border border-zinc-800/50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm font-bold text-white">Gemini 3 API Key</div>
                                    <div className="text-[10px] font-mono text-zinc-500">Used for all agent reasoning tasks</div>
                                </div>
                                <button
                                    onClick={() => handleUpdateKey('Gemini 3')}
                                    className="px-4 py-1.5 border border-blue-500/50 text-blue-500 text-[10px] font-mono hover:bg-blue-500/5 cursor-pointer transition-all"
                                >
                                    UPDATE KEY
                                </button>
                            </div>
                            <div className="h-px bg-zinc-800" />
                            <div className="flex justify-between items-center opacity-50">
                                <div>
                                    <div className="text-sm font-bold text-white">Supabase / PGVector</div>
                                    <div className="text-[10px] font-mono text-zinc-500">Managed vector storage for RAG training</div>
                                </div>
                                <button
                                    className="px-4 py-1.5 border border-zinc-700 text-zinc-500 text-[10px] font-mono cursor-not-allowed"
                                >
                                    MANAGED
                                </button>
                            </div>
                        </div>
                    </SettingsSection>

                    <SettingsSection
                        icon={Shield}
                        title="Security & Privacy"
                        desc="Control how your data is handled and agent boundaries."
                    >
                        <div className="space-y-4">
                            <ToggleOption label="Log all agent interactions" enabled={preferences.logInteractions} onToggle={() => togglePref('logInteractions')} />
                            <ToggleOption label="Anonymize sensitive data (PII)" enabled={preferences.anonymizeData} onToggle={() => togglePref('anonymizeData')} />
                            <ToggleOption label="Force human-in-the-loop for deployments" enabled={preferences.humanInLoop} onToggle={() => togglePref('humanInLoop')} />
                        </div>
                    </SettingsSection>

                    <SettingsSection
                        icon={Bell}
                        title="Notifications"
                        desc="Stay updated on agent tasks and system alerts."
                    >
                        <div className="space-y-4">
                            <ToggleOption label="Email summaries for daily tasks" enabled={preferences.emailSummaries} onToggle={() => togglePref('emailSummaries')} />
                            <ToggleOption label="Slack alerts for system errors" enabled={preferences.slackAlerts} onToggle={() => togglePref('slackAlerts')} />
                        </div>
                    </SettingsSection>

                    <div className="pt-8 border-t border-zinc-900 flex justify-end gap-4">
                        <button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="px-8 py-3 bg-blue-500 text-zinc-900 font-bold font-mono text-xs hover:bg-blue-400 transition-all uppercase cursor-pointer flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>

            <InfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title="Settings"
                message={infoMessage}
            />
        </>
    );
}

function SettingsSection({ icon: Icon, title, desc, children }: any) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8 border-b border-zinc-900/50 last:border-0">
            <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-blue-400">
                        <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-white">{title}</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-mono uppercase tracking-tight">{desc}</p>
            </div>
            <div className="lg:col-span-2">
                {children}
            </div>
        </div>
    );
}

function ToggleOption({ label, enabled = false, onToggle }: { label: string, enabled?: boolean, onToggle: () => void }) {
    return (
        <div className="flex justify-between items-center p-4 border border-zinc-800/50 bg-zinc-950/30">
            <span className="text-sm text-zinc-400">{label}</span>
            <div
                onClick={onToggle}
                className={`w-10 h-5 relative cursor-pointer transition-colors ${enabled ? 'bg-blue-500/20' : 'bg-zinc-800'}`}
            >
                <div className={`absolute top-1 w-3 h-3 transition-all ${enabled ? 'right-1 bg-blue-500' : 'left-1 bg-zinc-500'}`} />
            </div>
        </div>
    );
}
