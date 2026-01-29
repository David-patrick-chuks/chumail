import { useState, useEffect } from "react";
import { Search, Globe, Mail, User, Briefcase, Loader2, Download, AlertCircle } from "lucide-react";
import { scraperService, socketService } from "../../services/index";

interface Lead {
    email: string;
    name: string | null;
    role: string | null;
    source: string;
}

export function ScraperView() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = socketService.on('SCRAPE_STATUS', (data: any) => {
            if (data.status === 'InProgress') {
                setLoading(true);
                setStatusMessage(data.message);
            } else if (data.status === 'Completed') {
                setLoading(false);
                setStatusMessage(`Discovery complete: ${data.leadsCount} leads found.`);
            }
        });

        return () => unsubscribe();
    }, []);


    const handleScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setLeads([]);

        try {
            const results = await scraperService.scrape(url);
            setLeads(results);
            if (results.length === 0) {
                setError("No emails found on this website.");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to scrape the website. Please check the URL.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Email Scraper</h2>
                    <p className="text-zinc-500 text-sm mt-1">Extract and AI-enrich leads from any website URL.</p>
                </div>
                {leads.length > 0 && (
                    <button className="flex items-center gap-2 px-4 py-2 border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-xs font-mono hover:bg-zinc-800 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        EXPORT CSV
                    </button>
                )}
            </div>

            {/* Scrape Input Box */}
            <div className="border border-zinc-800 bg-zinc-900/40 p-1">
                <form onSubmit={handleScrape} className="flex flex-col md:flex-row gap-1">
                    <div className="relative flex-1">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                            <Globe className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full bg-zinc-950 border-none outline-none pl-12 pr-4 py-4 text-sm font-mono focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                    <button
                        disabled={loading || !url}
                        className="bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:bg-zinc-800 text-zinc-900 font-bold px-8 py-4 transition-all flex items-center justify-center gap-2 min-w-[160px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                SCRAPING...
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                START DISCOVERY
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Results Section */}
            {error && (
                <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="border border-zinc-800 bg-zinc-900/40 min-h-[400px]">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                    <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        Discovered Leads ({leads.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-900/20">
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Person</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {leads.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-zinc-600 font-mono text-xs italic">
                                        Enter a URL above to begin lead discovery...
                                    </td>
                                </tr>
                            )}
                            {loading && leads.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-zinc-500 font-mono text-xs">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                            <span>{statusMessage || "Analyzing website structure and extracting emails..."}</span>
                                        </div>
                                    </td>

                                </tr>
                            )}
                            {leads.map((lead, idx) => (
                                <tr key={idx} className="hover:bg-zinc-800/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-950 text-zinc-500 group-hover:text-blue-400 transition-colors">
                                                <Mail className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="font-medium text-white">{lead.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <User className="w-3.5 h-3.5 text-zinc-600" />
                                            <span className="text-sm">{lead.name || "Unknown"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Briefcase className="w-3.5 h-3.5 text-zinc-600" />
                                            <span className="text-sm">{lead.role || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-mono text-zinc-500 truncate max-w-[200px]" title={lead.source}>
                                            {lead.source.replace(/https?:\/\//, '')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
