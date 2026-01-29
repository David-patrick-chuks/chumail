import { useState, useEffect } from 'react';
import {
    Users,
    Bot,
    Rocket,
    Activity,
    Shield,
    Trash2,
    UserPlus,
    UserMinus,
    AlertCircle,
    Loader2,
    RefreshCw
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { socketService } from '../../services/socketService';
import { authService } from '../../services/authService';

interface PlatformStats {
    users: number;
    agents: number;
    campaigns: number;
    leads: number;
    messages: number;
}

interface UserSummary {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'user';
    agent_count: number;
    campaign_count: number;
    updated_at: string;
}

export function AdminDashboard() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [telemetry, setTelemetry] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsData, usersData] = await Promise.all([
                apiClient.get<PlatformStats>('/admin/stats'),
                apiClient.get<UserSummary[]>('/admin/users')
            ]);
            setStats(statsData);
            setUsers(usersData);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Socket integration
        const setupSocket = async () => {
            const user = await authService.getCurrentUser();
            if (user?.id) {
                socketService.emit('ADMIN_JOIN', user.id);

                const cleanupSync = socketService.on('ADMIN_SYNC_SUCCESS', () => {
                    console.log('[ADMIN] Command Center Synced');
                });

                const cleanupLog = socketService.on('ADMIN_LOG_EVENT', (data: any) => {
                    setTelemetry(prev => [data, ...prev].slice(0, 50));
                });

                const cleanupStats = socketService.on('ADMIN_STATS_UPDATE', (data: any) => {
                    setStats(prev => ({ ...prev, ...data }));
                });

                return () => {
                    cleanupSync?.();
                    cleanupLog?.();
                    cleanupStats?.();
                };
            }
        };

        const cleanupPromise = setupSocket();
        return () => {
            cleanupPromise.then(cleanup => cleanup?.());
        };
    }, []);

    const handleToggleRole = async (userId: string, currentRole: string) => {
        try {
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            await apiClient.patch('/admin/users/role', { userId, role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
        } catch (err: any) {
            alert('Failed to update role: ' + err.message);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
        try {
            await apiClient.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err: any) {
            alert('Failed to delete user: ' + err.message);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Accessing_Encrypted_Link...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">PLATFORM_COMMAND_CENTER</h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Authorized Personnel Only</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 border border-zinc-800 hover:border-blue-500/50 text-zinc-500 hover:text-blue-400 transition-all active:rotate-180"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-tight">{error}</span>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total Users', value: stats?.users || 0, icon: Users },
                    { label: 'AI Agents', value: stats?.agents || 0, icon: Bot },
                    { label: 'Campaigns', value: stats?.campaigns || 0, icon: Rocket },
                    { label: 'Leads Found', value: stats?.leads || 0, icon: Activity },
                    { label: 'Total Logs', value: stats?.messages || 0, icon: Shield },
                ].map((stat, idx) => (
                    <div key={idx} className="p-6 border border-zinc-800 bg-zinc-900/40 backdrop-blur space-y-3 group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center justify-between">
                            <stat.icon className="w-4 h-4 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                            <div className="text-[10px] font-mono text-zinc-600">ID_0{idx + 1}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold tracking-tighter text-white">{stat.value}</div>
                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* User Management Table */}
            <div className="border border-zinc-800 bg-zinc-950/50">
                <div className="p-4 border-b border-zinc-900 bg-zinc-900/20 font-mono text-[10px] text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Active_Profiles_Grid</span>
                    <span>Total: {users.length}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-900">
                                <th className="p-4 text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.2em]">User_Handle</th>
                                <th className="p-4 text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.2em]">Contact</th>
                                <th className="p-4 text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.2em]">Role</th>
                                <th className="p-4 text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.2em]">Assets</th>
                                <th className="p-4 text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/50 font-mono">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-900/10 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-zinc-200">{user.full_name || 'Anonymous'}</span>
                                            <span className="text-[9px] text-zinc-600 uppercase truncate w-32">{user.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs text-zinc-400">{user.email}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${user.role === 'admin'
                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            : 'bg-zinc-800 text-zinc-500'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-zinc-600 uppercase">Agents</span>
                                                <span className="text-xs text-zinc-300 font-bold">{user.agent_count}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-zinc-600 uppercase">Campaigns</span>
                                                <span className="text-xs text-zinc-300 font-bold">{user.campaign_count}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleToggleRole(user.id, user.role)}
                                                className={`p-1.5 border transition-all ${user.role === 'admin'
                                                    ? 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-white'
                                                    : 'border-blue-500/20 text-blue-400 hover:bg-blue-500/10'
                                                    }`}
                                                title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                            >
                                                {user.role === 'admin' ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-1.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                                                title="Delete Profile"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Activity Stream Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 border border-zinc-800 bg-zinc-900/20 space-y-4">
                    <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3 h-3 text-blue-500" />
                        Live_Platform_Telemetry
                    </h3>
                    <div className="space-y-3">
                        {telemetry.length === 0 ? (
                            <div className="animate-pulse flex items-center gap-2 text-[9px] font-mono text-zinc-700 uppercase italic">
                                Waiting for incoming signals...
                            </div>
                        ) : (
                            telemetry.map((log, i) => (
                                <div key={i} className="flex items-center gap-3 text-[10px] font-mono text-zinc-600 animate-in slide-in-from-left-2 duration-300">
                                    <span className="text-blue-500/50">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                                    <span className={`uppercase ${log.type === 'error' ? 'text-red-500/50' : 'text-zinc-400'}`}>[{log.action}]</span>
                                    <span className="truncate">{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>

                </div>

                <div className="p-6 border border-zinc-800 bg-zinc-900/20 space-y-4">
                    <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        Server_Health_Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[8px] text-zinc-600 uppercase">CPU_Load</span>
                            <div className="h-1 bg-zinc-800 overflow-hidden">
                                <div className="h-full bg-blue-500 w-[12%]" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] text-zinc-600 uppercase">RAM_Usage</span>
                            <div className="h-1 bg-zinc-800 overflow-hidden">
                                <div className="h-full bg-blue-500 w-[45%]" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] text-zinc-600 uppercase">Socket_Connections</span>
                            <div className="text-xs font-bold text-blue-400">08 ACTIVE</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] text-zinc-600 uppercase">DB_Latency</span>
                            <div className="text-xs font-bold text-green-400">14ms</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
