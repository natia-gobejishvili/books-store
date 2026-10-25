import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: "primary" | "secondary";
    fullWidth?: boolean;
};

export default function Button({
    children,
    variant = "primary",
    fullWidth = false,
    className = "",
    type = "button",
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`ui-button ui-button--${variant} ${
                fullWidth ? "ui-button--full" : ""
            } ${className}`.trim()}
            {...props}
        >
            {children}
        </button>
    );
}
