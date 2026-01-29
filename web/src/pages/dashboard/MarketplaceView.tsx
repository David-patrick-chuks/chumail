import { useState, useEffect } from "react";
import { Search, MessageSquare, Copy, ExternalLink, Plus, Loader2 } from "lucide-react";
import { templateService } from "../../services/index";
import type { Template } from "../../types/index";


export function MarketplaceView() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Sales", "Marketing", "Outreach", "Support", "Follow-up"];

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await templateService.getPublicTemplates();
            setTemplates(data);
        } catch (error) {
            console.error("Failed to load templates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUseTemplate = async (templateId: string) => {
        try {
            await templateService.useTemplate(templateId);
            // Optionally redirect or show success
            alert("Template added to your collection!");
            loadTemplates(); // Refresh to show updated usage count
        } catch (error) {
            console.error("Failed to use template:", error);
        }
    };

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "All" || t.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Community Marketplace</h2>
                    <p className="text-zinc-500 text-sm mt-1">Discover high-performing email templates shared by the community.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold text-sm transition-all shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4" />
                    SHARE TEMPLATE
                </button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                        type="text"
                        placeholder="Search templates, subjects, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-blue-500/50 outline-none pl-10 pr-4 py-3 text-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all border ${activeCategory === cat
                                ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                                : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest text-center">Loading marketplace repository...</p>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800">
                    <p className="text-zinc-600 font-mono text-sm italic">No matching templates found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                        <div key={template.id} className="group flex flex-col border border-zinc-800 bg-zinc-900/40 hover:border-blue-500/30 transition-all">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="px-2 py-1 bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                                        {template.category}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-500 group-hover:text-blue-400 transition-colors">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-mono">{template.usage_count}</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{template.name}</h3>
                                    <p className="text-[11px] text-zinc-500 font-mono mt-1 line-clamp-1 italic">
                                        {template.subject || "No Subject"}
                                    </p>
                                </div>

                                <div className="bg-zinc-950/50 p-4 border border-zinc-800/50 rounded-sm">
                                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                                        {template.content}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto p-4 border-t border-zinc-800/50 grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleUseTemplate(template.id)}
                                    className="flex items-center justify-center gap-2 py-2 bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 text-zinc-400 hover:text-blue-400 transition-all text-[10px] font-mono uppercase"
                                >
                                    <Copy className="w-3 h-3" />
                                    USE THIS
                                </button>
                                <button className="flex items-center justify-center gap-2 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-zinc-900 transition-all text-[10px] font-mono uppercase">
                                    <ExternalLink className="w-3 h-3" />
                                    PREVIEW
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
