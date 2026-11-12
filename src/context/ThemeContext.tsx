import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
    themeMode: ThemeMode;
    resolvedTheme: "light" | "dark";
    setThemeMode: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): ThemeMode => {
    try {
        const savedTheme = localStorage.getItem("theme");

        if (
            savedTheme === "light" ||
            savedTheme === "dark" ||
            savedTheme === "system"
        ) {
            return savedTheme;
        }
    } catch {
        // თუ localStorage მიუწვდომელია, გამოვიყენებთ system რეჟიმს.
    }

    return "system";
};

const getSystemTheme = (): "light" | "dark" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialTheme);

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
        () => {
            const savedTheme = getInitialTheme();

            return savedTheme === "system"
                ? getSystemTheme()
                : savedTheme;
        }
    );

    const setThemeMode = (theme: ThemeMode) => {
        try {
            localStorage.setItem("theme", theme);
        } catch {
            // თემა მიმდინარე სესიაშიც იმუშავებს.
        }

        setThemeModeState(theme);
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        const applyTheme = () => {
            const actualTheme =
                themeMode === "system"
                    ? (mediaQuery.matches ? "dark" : "light")
                    : themeMode;

            setResolvedTheme(actualTheme);

            document.documentElement.setAttribute(
                "data-theme",
                actualTheme
            );

            document.documentElement.setAttribute(
                "data-theme-mode",
                themeMode
            );

            const themeColor = document.querySelector(
                'meta[name="theme-color"]'
            );

            themeColor?.setAttribute(
                "content",
                actualTheme === "dark" ? "#11121a" : "#f7f7fb"
            );
        };

        applyTheme();

        if (themeMode === "system") {
            mediaQuery.addEventListener("change", applyTheme);
        }

        return () => {
            mediaQuery.removeEventListener("change", applyTheme);
        };
    }, [themeMode]);

    return (
        <ThemeContext.Provider
            value={{ themeMode, resolvedTheme, setThemeMode }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return context;
}
