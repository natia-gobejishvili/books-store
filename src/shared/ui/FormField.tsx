import type { ReactNode } from "react";

type FormFieldProps = {
    label: string;
    htmlFor: string;
    error?: string;
    children: ReactNode;
};

export default function FormField({
    label,
    htmlFor,
    error,
    children,
}: FormFieldProps) {
    return (
        <div className="form-field">
            <label className="form-label" htmlFor={htmlFor}>
                {label}
            </label>
            
            {children}
            
            {error && (
                <p className="field-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
