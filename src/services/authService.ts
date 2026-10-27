import { apiRequest, TOKEN_KEY } from "./api";
import type {
    AuthResponse,
    LoginPayload,
    MeResponse,
    RegisterPayload,
    User,
} from "../types/auth";

function saveToken(data: AuthResponse) {
    if (!data.accessToken) {
        throw new Error("სერვერმა ავტორიზაციის ტოკენი არ დააბრუნა.");
    }
    localStorage.setItem(TOKEN_KEY, data.accessToken);
}

export const authService = {
    async login(payload: LoginPayload): Promise<AuthResponse> {
        const data = await apiRequest<AuthResponse>("/auth/login", {
            method: "POST",
            body: payload,
        });
        
        saveToken(data);
        return data;
    },
    
    async register(payload: RegisterPayload): Promise<AuthResponse> {
        const data = await apiRequest<AuthResponse>("/auth/register", {
            method: "POST",
            body: payload,
        });
        
        saveToken(data);
        return data;
    },
    
    async getMe(): Promise<User> {
        const data = await apiRequest<MeResponse | User>("/auth/me", {
            auth: true,
        });
        
        if ("user" in data && data.user) {
            return data.user;
        }
        
        return data as User;
    },
    
    logout() {
        localStorage.removeItem(TOKEN_KEY);
    },
};
