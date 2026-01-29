import { useState, useEffect } from "react";
import { Rocket, Plus, Play, MoreHorizontal, CheckCircle2, AlertCircle, Clock, Loader2, Users } from "lucide-react";
import { campaignService, agentService, socketService } from "../../services/index";
import type { Campaign, Agent } from "../../types/index";


export function CampaignsView() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = socketService.on('CAMPAIGN_PROGRESS', (data: any) => {
            setCampaigns(prev => prev.map(c => {
                if (c.id === data.campaignId) {
                    return {
                        ...c,
                        status: data.status as any,
                        sent_leads: data.sentCount ?? c.sent_leads
                    };
                }
                return c;
            }));
        });

        return () => unsubscribe();
    }, []);


    // New Campaign Form State
    const [newCampaign, setNewCampaign] = useState({
        name: "",
        agent_id: "",
        leads: "" // CSV or JSON input for now
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [campData, agentData] = await Promise.all([
                campaignService.getCampaigns(),
                agentService.fetchAgents()
            ]);
            setCampaigns(campData);
            setAgents(agentData);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Parse leads from textarea (assuming simple email per line for now)
            const leadList = newCampaign.leads.split('\n').filter(l => l.includes('@')).map(email => ({ email: email.trim() }));

            await campaignService.createCampaign({
                name: newCampaign.name,
                agent_id: newCampaign.agent_id,
                leads: leadList
            });
            setModalOpen(false);
            setNewCampaign({ name: "", agent_id: "", leads: "" });
            loadData();
        } catch (error) {
            alert("Failed to create campaign");
        }
    };

    const handleStartCampaign = async (id: string) => {
        try {
            await campaignService.startCampaign(id);
            loadData();
            alert("Campaign broadcast initiated!");
        } catch (error) {
            alert("Failed to start campaign");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
            case 'InProgress': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
            case 'Failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
            case 'Draft': return <Clock className="w-4 h-4 text-zinc-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Email Campaigns</h2>
                    <p className="text-zinc-500 text-sm mt-1">Manage and monitor your automated outreach blasts.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-4 h-4" />
                    NEW CAMPAIGN
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-zinc-800 bg-zinc-900/40 p-6">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Total Campaigns</div>
                    <div className="text-3xl font-bold">{campaigns.length}</div>
                </div>
                <div className="border border-zinc-800 bg-zinc-900/40 p-6">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Active Blasts</div>
                    <div className="text-3xl font-bold text-blue-400">{campaigns.filter(c => c.status === 'InProgress').length}</div>
                </div>
                <div className="border border-zinc-800 bg-zinc-900/40 p-6">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Success Rate</div>
                    <div className="text-3xl font-bold">98.2%</div>
                </div>
            </div>

            {/* Campaign Table */}
            <div className="border border-zinc-800 bg-zinc-900/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-900/20">
                                <th className="px-6 py-4 font-medium">Campaign Description</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Progress</th>
                                <th className="px-6 py-4 font-medium">Created</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">
                                        Loading campaigns...
                                    </td>
                                </tr>
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 font-mono text-xs italic">
                                        No campaigns created yet. Start your first blast above.
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map(campaign => (
                                    <tr key={campaign.id} className="hover:bg-zinc-800/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-950 text-blue-500">
                                                    <Rocket className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{campaign.name}</div>
                                                    <div className="text-[10px] text-zinc-500 font-mono uppercase flex items-center gap-1">
                                                        <Users className="w-3 h-3" /> {campaign.total_leads} Leads
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(campaign.status)}
                                                <span className="text-xs font-mono uppercase tracking-tight">{campaign.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-32">
                                                <div className="flex justify-between text-[9px] font-mono text-zinc-500 mb-1">
                                                    <span>{Math.round((campaign.sent_leads / campaign.total_leads) * 100 || 0)}%</span>
                                                    <span>{campaign.sent_leads}/{campaign.total_leads}</span>
                                                </div>
                                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all duration-500"
                                                        style={{ width: `${(campaign.sent_leads / campaign.total_leads) * 100 || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-mono text-zinc-500">
                                            {new Date(campaign.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {campaign.status === 'Draft' ? (
                                                <button
                                                    onClick={() => handleStartCampaign(campaign.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-zinc-900 transition-all text-[10px] font-mono uppercase font-bold"
                                                >
                                                    <Play className="w-3 h-3" />
                                                    START
                                                </button>
                                            ) : (
                                                <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* NEW CAMPAIGN MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Launch New Blast</h3>
                            <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase">Campaign Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newCampaign.name}
                                    onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    placeholder="e.g. Q1 Product Outreach"
                                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-blue-500/50 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase">Select Sending Agent</label>
                                <select
                                    required
                                    value={newCampaign.agent_id}
                                    onChange={e => setNewCampaign({ ...newCampaign, agent_id: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:border-blue-500/50 outline-none"
                                >
                                    <option value="">Choose an Agent...</option>
                                    {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase">Import Leads (One Email per line)</label>
                                <textarea
                                    required
                                    value={newCampaign.leads}
                                    onChange={e => setNewCampaign({ ...newCampaign, leads: e.target.value })}
                                    placeholder="john@example.com&#10;sarah@company.com"
                                    className="w-full h-40 bg-zinc-950 border border-zinc-800 p-3 text-xs font-mono focus:border-blue-500/50 outline-none resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-6 py-2 text-zinc-500 font-mono text-xs uppercase hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold font-mono text-xs uppercase shadow-lg shadow-blue-500/20"
                                >
                                    PROCEED TO DRAFT
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
