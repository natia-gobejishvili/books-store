import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

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
                aria-label={
                    visible
                        ? t("password.hideAria")
                        : t("password.showAria")
                }
                aria-pressed={visible}
            >
                {visible
                    ? t("password.hide")
                    : t("password.show")}
            </button>
        </div>
    );
}
