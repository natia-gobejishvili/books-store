const API_BASE_URL = import.meta.env.VITE_API_URL;

export const TOKEN_KEY = "books-store-access-token";
export type ApiErrorBody = {
    message?: string;
    code?: string;
    errors?: Record<string, string>;
};

export class ApiError extends Error {
    status: number;
    code: string;
    fieldErrors: Record<string, string>;
    
    constructor(
        message: string,
        status: number,
        code = "UNKNOWN_ERROR",
        fieldErrors: Record<string, string> = {},
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.fieldErrors = fieldErrors;
    }
}

type RequestOptions = {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    auth?: boolean;
};

export async function apiRequest<T>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const { method = "GET", body, auth = false } = options;
    const headers: Record<string, string> = {
        Accept: "application/json",
    };
    
    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    
    if (auth) {
        const token = localStorage.getItem(TOKEN_KEY);
        
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }
    
    let response: Response;
    
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(
            "სერვერთან დაკავშირება ვერ მოხერხდა. შეამოწმე ინტერნეტი და სცადე თავიდან.",
            0,
            "NETWORK_ERROR",
        );
    }
    
    const text = await response.text();
    
    let data: unknown;
    
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }
    
    if (!response.ok) {
        const errorBody =
            data && typeof data === "object"
                ? (data as ApiErrorBody)
                : {};
        
        const code = errorBody.code ?? "UNKNOWN_ERROR";
        
        if (response.status === 401 && code === "TOKEN_EXPIRED") {
            localStorage.removeItem(TOKEN_KEY);
            window.dispatchEvent(new Event("auth:expired"));
        }
        
        throw new ApiError(
            errorBody.message ?? "მოთხოვნის შესრულება ვერ მოხერხდა.",
            response.status,
            code,
            errorBody.errors ?? {},
        );
    }
    
    return data as T;
}
