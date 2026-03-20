export interface CurrentUser {
    userId: string;
    email: string;
    name?: string;
    role?: string;
    provider?: string;
}