export type User = {
    id?: string;
    name: string;
    email: string;
};

export type AuthResponse = {
    accessToken: string;
    user?: User;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
};

export type MeResponse = {
    user: User;
};
