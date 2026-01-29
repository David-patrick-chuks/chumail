import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Bot,
    Activity,
    Settings,
    LogOut,
    User,
    X,
    Search,
    ShoppingBag,
    Rocket,
    Shield
} from "lucide-react";



import { useEffect, useState } from "react";

interface SidebarProps {

    onLogout: () => void;
    onMobileClose?: () => void;
}

export function Sidebar({ onLogout, onMobileClose }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveTab = () => {
        const path = location.pathname.split('/')[2];
        return path || 'overview';
    };

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('chumail_user');
        if (user) {
            const parsed = JSON.parse(user);
            setIsAdmin(parsed.role === 'admin');
        }
    }, []);

    const handleNavigate = (path: string) => {

        navigate(path);
        if (onMobileClose) onMobileClose();
    };

    return (
        <aside className="w-[280px] lg:w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col flex-shrink-0 h-full">
            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleNavigate('/dashboard/overview')}>
                        <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center">
                            <Bot className="w-5 h-5 text-zinc-900" />
                        </div>
                        <span className="font-bold tracking-tight text-xl">ChuMail</span>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onMobileClose}
                        className="lg:hidden p-1 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="space-y-1">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Overview"
                        active={getActiveTab() === "overview"}
                        onClick={() => handleNavigate('/dashboard/overview')}
                    />
                    <SidebarItem
                        icon={Bot}
                        label="My Agents"
                        active={getActiveTab() === "agents"}
                        onClick={() => handleNavigate('/dashboard/agents')}
                    />
                    <SidebarItem
                        icon={Search}
                        label="Email Scraper"
                        active={getActiveTab() === "scraper"}
                        onClick={() => handleNavigate('/dashboard/scraper')}
                    />
                    <SidebarItem
                        icon={ShoppingBag}
                        label="Marketplace"
                        active={getActiveTab() === "marketplace"}
                        onClick={() => handleNavigate('/dashboard/marketplace')}
                    />
                    <SidebarItem
                        icon={Rocket}
                        label="Campaigns"
                        active={getActiveTab() === "campaigns"}
                        onClick={() => handleNavigate('/dashboard/campaigns')}
                    />
                    <SidebarItem
                        icon={Activity}
                        label="Analytics"
                        active={getActiveTab() === "analytics"}
                        onClick={() => handleNavigate('/dashboard/analytics')}
                    />


                    <SidebarItem
                        icon={User}
                        label="Profile"
                        active={getActiveTab() === "profile"}
                        onClick={() => handleNavigate('/dashboard/profile')}
                    />
                    <SidebarItem
                        icon={Settings}
                        label="Settings"
                        active={getActiveTab() === "settings"}
                        onClick={() => handleNavigate('/dashboard/settings')}
                    />

                    {isAdmin && (
                        <div className="pt-4 mt-4 border-t border-zinc-900/50">
                            <SidebarItem
                                icon={Shield}
                                label="Admin Board"
                                active={getActiveTab() === "admin"}
                                onClick={() => handleNavigate('/dashboard/admin')}
                            />
                        </div>
                    )}
                </nav>


            </div>

            <div className="mt-auto p-4 border-t border-zinc-900">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-2 w-full text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all font-mono text-sm cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    LOGOUT
                </button>
            </div>
        </aside>
    );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-2.5 w-full transition-all group relative cursor-pointer ${active
                ? "bg-blue-500/10 text-blue-400 border-l border-blue-500"
                : "text-zinc-500 hover:text-blue-400 hover:bg-blue-500/5"
                }`}
        >
            <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "group-hover:text-blue-400"}`} />
            <span className="font-mono text-sm tracking-tight">{label.toUpperCase()}</span>
        </button>
    );
}
