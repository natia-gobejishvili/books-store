import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import Input from "./Input";

type PasswordInputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
> & {
    hasError?: boolean;
};

export default function PasswordInput({
    hasError = false,
    ...props
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false);
    
    return (
        <div className="password-input">
            <Input
                {...props}
                type={visible ? "text" : "password"}
                hasError={hasError}
            />

            <button
                type="button"
                className="password-toggle"
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? "დამალე პაროლი" : "აჩვენე პაროლი"}
                aria-pressed={visible}
            >
                {visible ? "დამალვა" : "ჩვენება"}
            </button>
        </div>
    );
}
