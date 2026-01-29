import { useState, useEffect } from "react";
import { Mail, ExternalLink, Plus, Search, Trash2, Edit } from "lucide-react";
import { InfoModal, ConfirmModal } from "../../components/Modal";
import { AgentModal } from "../../components/agents/AgentModal";
import { agentService } from "../../services/index";
import type { Agent } from "../../types/index";

export function AgentsView() {
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

    const [agentModalOpen, setAgentModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const [agents, setAgents] = useState<Agent[]>([]);
    const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        try {
            const data = await agentService.fetchAgents();
            setAgents(data);
        } catch (error) {
            console.error("Failed to load agents:", error);
        } finally {
            setLoading(false);
        }
    };

    const showInfo = (title: string, message: string) => {
        setInfoTitle(title);
        setInfoMessage(message);
        setInfoModalOpen(true);
    };

    const handleCreateClick = () => {
        setCurrentAgent(null);
        setAgentModalOpen(true);
    };

    const handleEditClick = (agent: Agent) => {
        setCurrentAgent(agent);
        setAgentModalOpen(true);
    };

    const handleDeleteClick = (agent: Agent) => {
        setCurrentAgent(agent);
        setConfirmModalOpen(true);
    };

    const handleSaveAgent = async (formData: Partial<Agent>) => {
        try {
            if (currentAgent) {
                const updated = await agentService.updateAgent(currentAgent.id, formData);
                setAgents(agents.map((a: Agent) => a.id === updated.id ? updated : a));
                showInfo("Success", "Agent updated successfully.");
            } else {
                const created = await agentService.createAgent(formData);
                setAgents([created, ...agents]);
                showInfo("Success", "New agent created successfully.");
            }
        } catch (error) {
            showInfo("Error", "Failed to save agent configuration.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!currentAgent) return;
        try {
            await agentService.deleteAgent(currentAgent.id);
            setAgents(agents.filter((a: Agent) => a.id !== currentAgent.id));
            showInfo("Deleted", "Agent has been removed from the platform.");
        } catch (error) {
            showInfo("Error", "Failed to delete agent.");
        }
    };

    const filteredAgents = agents.filter((agent: Agent) =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const handleViewAgent = (agent: Agent) => {
        showInfo("Agent Details", `Viewing ${agent.name}. Email: ${agent.email}, Created: ${new Date(agent.created_at || "").toLocaleDateString()}`);
    };


    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">My Agents</h2>
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        CREATE AGENT
                    </button>
                </div>

                <div className="border border-zinc-800 bg-zinc-900/40 overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search agents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 focus:border-blue-500/50 outline-none pl-10 pr-4 py-2 text-xs w-full transition-colors cursor-text"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase mr-2 whitespace-nowrap">Sort by:</span>
                            <select className="bg-zinc-950 border border-zinc-800 text-[10px] font-mono p-1 outline-none text-zinc-400 cursor-pointer hover:border-zinc-700 transition-colors w-full md:w-auto">
                                <option>DATE CREATED</option>
                                <option>STATUS</option>
                                <option>ALPHABETICAL</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Agent Identity</th>
                                    <th className="px-6 py-4 font-medium">Email Address</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Last Active</th>

                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 font-mono">
                                            Loading agents...
                                        </td>
                                    </tr>
                                ) : filteredAgents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 font-mono">
                                            No agents found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAgents.map((agent: Agent) => (
                                        <tr key={agent.id} className="hover:bg-zinc-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-900 text-blue-400">
                                                        <Mail className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{agent.name}</div>
                                                        <div className="text-[10px] text-zinc-500 font-mono uppercase">Persona Active</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">{agent.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1 h-1 rounded-full animate-pulse ${agent.status === 'Active' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                                                    <span className="font-mono text-xs uppercase tracking-tight">{agent.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-zinc-500">{agent.last_active ? new Date(agent.last_active).toLocaleDateString() : 'Never'}</td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewAgent(agent)}
                                                        className="p-1.5 hover:text-blue-400 transition-colors cursor-pointer"
                                                        title="View agent details"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(agent)}
                                                        className="p-1.5 hover:text-white transition-colors cursor-pointer"
                                                        title="Edit agent"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(agent)}
                                                        className="p-1.5 hover:text-red-400 transition-colors cursor-pointer"
                                                        title="Delete agent"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <InfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title={infoTitle}
                message={infoMessage}
            />

            <AgentModal
                isOpen={agentModalOpen}
                onClose={() => setAgentModalOpen(false)}
                onSave={handleSaveAgent}
                agent={currentAgent}
            />

            <ConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Agent"
                message={`Are you sure you want to permanently delete ${currentAgent?.name}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </>
    );
}
