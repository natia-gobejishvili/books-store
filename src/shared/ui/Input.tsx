import {
    forwardRef,
    type InputHTMLAttributes,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    hasError?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
    function Input({ hasError = false, className = "", ...props }, ref) {
        return (
            <input
                ref={ref}
                className={`ui-input ${hasError ? "ui-input--error" : ""} ${className}`.trim()}
                aria-invalid={hasError || undefined}
                {...props}
            />
        );
    }
);

export default Input;
