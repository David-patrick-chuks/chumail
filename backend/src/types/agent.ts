export interface Agent {
    id: string;
    user_id: string;
    name: string;
    email: string;
    app_password: string;
    persona_prompt: string;
    status: string;
    created_at?: Date;
    last_active?: Date;
}
