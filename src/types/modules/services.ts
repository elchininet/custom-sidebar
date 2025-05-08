export interface SubscriberTemplate {
    result: string;
}

export interface CheckConfigResponse {
    result: 'valid' | 'invalid';
    errors: string | null;
    warnings: string | null;
}

export interface EntityState {
    entity_id: string;
    last_changed: string;
    last_reported: string;
    last_updated: string;
    state: string;
}