import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout.js";
import { OverviewView } from "./dashboard/OverviewView";
import { AgentsView } from "./dashboard/AgentsView";
import { ScraperView } from "./dashboard/ScraperView";
import { MarketplaceView } from "./dashboard/MarketplaceView";
import { CampaignsView } from "./dashboard/CampaignsView";
import { AnalyticsView } from "./dashboard/AnalyticsView";


import { SettingsView } from "./dashboard/SettingsView";
import { ProfileView } from "./dashboard/ProfileView";
import { AdminDashboard } from "./dashboard/AdminDashboard";
import { useState, useEffect } from "react";

function AdminGuard({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('chumail_user');
        if (user) {
            const parsed = JSON.parse(user);
            setIsAdmin(parsed.role === 'admin');
        } else {
            setIsAdmin(false);
        }
    }, []);

    if (isAdmin === null) return null; // Or a loader
    if (!isAdmin) return <Navigate to="/dashboard/overview" replace />;

    return <>{children}</>;
}





interface DashboardProps {
    onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
    return (
        <DashboardLayout onLogout={onLogout}>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
                <Route path="/overview" element={<OverviewView />} />

                <Route path="/agents" element={<AgentsView />} />
                <Route path="/scraper" element={<ScraperView />} />
                <Route path="/marketplace" element={<MarketplaceView />} />
                <Route path="/campaigns" element={<CampaignsView />} />
                <Route path="/analytics" element={<AnalyticsView />} />




                <Route path="/settings" element={<SettingsView />} />
                <Route path="/profile" element={<ProfileView />} />
                <Route path="/admin" element={
                    <AdminGuard>
                        <AdminDashboard />
                    </AdminGuard>
                } />
            </Routes>
        </DashboardLayout>
    );
}
