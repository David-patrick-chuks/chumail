export interface Campaign {
    id: string;
    user_id: string;
    agent_id: string;
    name: string;
    status: 'Draft' | 'InProgress' | 'Completed' | 'Paused' | 'Failed';
    total_leads: number;
    sent_leads: number;
    created_at: string;
}

export interface Lead {
    id: string;
    campaign_id: string;
    email: string;
    first_name?: string;
    role?: string;
    status: 'Pending' | 'Sent' | 'Failed';
    personalized_content?: string;
    error_message?: string;
    sent_at?: string;
}
