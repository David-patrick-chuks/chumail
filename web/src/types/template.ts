export interface Template {
    id: string;
    user_id: string;
    name: string;
    subject?: string;
    content: string;
    category: string;
    usage_count: number;
    is_public: boolean;
    created_at?: string;
}
