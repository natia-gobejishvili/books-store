import { apiRequest, TOKEN_KEY } from "./api";
import type {
    AuthResponse,
    LoginPayload,
    MeResponse,
    RegisterPayload,
    User,
} from "../types/auth";

type ForgotPasswordPayload = {
    email: string;
};

type VerifyResetCodePayload = {
    email: string;
    code: string;
};

type VerifyResetCodeResponse = {
    resetToken: string;
};

type ResetPasswordPayload = {
    resetToken: string;
    password: string;
};

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
    
    async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
        await apiRequest<unknown>("/auth/forgot-password", {
            method: "POST",
            body: payload,
        });
    },
    
    async verifyResetCode(payload: VerifyResetCodePayload): Promise<VerifyResetCodeResponse> {
        const data = await apiRequest<VerifyResetCodeResponse>("/auth/verify-reset-code", {
            method: "POST",
            body: payload,
        });
    
        if (!data.resetToken) {
            throw new Error("სერვერმა პაროლის აღდგენის ტოკენი არ დააბრუნა.");
        }

        return data;
    },
    
    async resetPassword(payload: ResetPasswordPayload): Promise<void> {
        await apiRequest<unknown>("/auth/reset-password", {
            method: "POST",
            body: payload,
        });
    },

    logout() {
        localStorage.removeItem(TOKEN_KEY);
    },
};
