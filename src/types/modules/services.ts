export interface SubscriberTemplate {
    result: string;
}

export interface CheckConfigResponse {
    result: 'valid' | 'invalid';
    errors: string | null;
    warnings: string | null;
}