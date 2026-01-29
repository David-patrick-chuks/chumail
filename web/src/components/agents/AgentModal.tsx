import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import type { Agent } from "../../types/index";
import { Eye, EyeOff, Mail, Key } from "lucide-react";

interface AgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (agent: Partial<Agent>) => Promise<void>;
    agent?: Agent | null;
}

export function AgentModal({ isOpen, onClose, onSave, agent }: AgentModalProps) {
    const [formData, setFormData] = useState<Partial<Agent>>({
        name: "",
        email: "",
        app_password: "",
        persona_prompt: "",
        status: "Active"
    });
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (agent) {
            setFormData({
                name: agent.name,
                email: agent.email,
                app_password: agent.app_password,
                persona_prompt: agent.persona_prompt || "",
                status: agent.status
            });
        } else {
            setFormData({
                name: "",
                email: "",
                app_password: "",
                persona_prompt: "",
                status: "Active"
            });
        }
    }, [agent, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={agent ? "Edit Agent Persona" : "Create New Email Agent"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">Agent Identity Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Sales Outreach Pro"
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Email Address
                            </label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@gmail.com"
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none px-4 py-2 text-sm transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                                <Key className="w-3 h-3" /> App Password
                            </label>
                            <div className="relative">
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={formData.app_password}
                                    onChange={(e) => setFormData({ ...formData, app_password: e.target.value })}
                                    placeholder="•••• •••• •••• ••••"
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none pl-4 pr-10 py-2 text-sm transition-all font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Persona Prompt (AI Brain)</label>
                    <textarea
                        required
                        value={formData.persona_prompt}
                        onChange={(e) => setFormData({ ...formData, persona_prompt: e.target.value })}
                        placeholder="Define your agent's tone, style, and goal. e.g. 'You are a friendly but professional sales agent focusing on high-ticket B2B software...'"
                        className="w-full h-40 bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none p-4 text-sm resize-none transition-all font-mono"
                    />
                    <p className="text-[10px] text-zinc-600 italic">This defines how the agent writes emails and handles replies.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-zinc-800 text-zinc-400 hover:text-white transition-all font-mono text-xs uppercase"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold transition-all font-mono text-xs uppercase disabled:opacity-50 min-w-32"
                    >
                        {saving ? "Verifying..." : (agent ? "Update Agent" : "Verify & Create")}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
