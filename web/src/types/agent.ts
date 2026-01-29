export interface Agent {
    id: string;
    name: string;
    email: string;
    app_password: string;
    persona_prompt: string;
    status: string;
    created_at?: string;
    last_active?: string;
}
