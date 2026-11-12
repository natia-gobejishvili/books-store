import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { ApiError } from "../../services/api";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";
import PasswordInput from "../../shared/ui/PasswordInput";
import FormField from "../../shared/ui/FormField";
import Alert from "../../shared/ui/Alert";

const registerSchema = z.object({
    name: z.string().trim()
        .min(2, "register.validation.nameMin"),
    email: z.string().trim()
        .min(1, "register.validation.emailRequired")
        .email("register.validation.emailInvalid"),
    password: z.string()
        .min(8, "register.validation.passwordMin")
        .regex(/[A-Za-z]/, "register.validation.passwordLetter")
        .regex(/[0-9]/, "register.validation.passwordNumber"),
    confirmPassword: z.string()
        .min(1, "register.validation.confirmPasswordRequired"),
}).refine(
    (values) => values.password === values.confirmPassword,
    {
        message: "register.validation.passwordMismatch",
        path: ["confirmPassword"],
    }
);

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const { t } = useTranslation();

    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const translateMessage = (message?: string) => {
        if (!message) return "";

        return message.startsWith("register.")
            ? t(message)
            : message;
    };

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitted },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldFocusError: true,
    });

    async function onSubmit(values: RegisterValues) {
        setLoading(true);
        setServerError("");

        try {
            const { confirmPassword, ...payload } = values;

            await authService.register(payload);
            await refreshUser();

            navigate("/catalog", { replace: true });
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.code === "EMAIL_TAKEN") {
                    setError("email", {
                        type: "server",
                        message: "register.server.emailTaken",
                    });
                } else {
                    let hasFieldErrors = false;

                    for (const [field, message] of Object.entries(error.fieldErrors)) {
                        if (
                            field === "name" ||
                            field === "email" ||
                            field === "password" ||
                            field === "confirmPassword"
                        ) {
                            setError(field, {
                                type: "server",
                                message,
                            });
                            hasFieldErrors = true;
                        }
                    }

                    if (!hasFieldErrors) {
                        setServerError(error.message);
                    }
                }
            } else {
                setServerError(
                    error instanceof Error
                        ? error.message
                        : "register.server.genericError"
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-intro">
                <h1>{t("register.introTitle")}</h1>
                <p>{t("register.introDescription")}</p>

                <ul className="auth-benefits">
                    <li>
                        <span className="benefit-icon">✓</span>
                        {t("register.benefits.discover")}
                    </li>
                    <li>
                        <span className="benefit-icon">✓</span>
                        {t("register.benefits.orders")}
                    </li>
                    <li>
                        <span className="benefit-icon">✓</span>
                        {t("register.benefits.profile")}
                    </li>
                </ul>
            </section>

            <section className="auth-card" aria-labelledby="register-title">
                <h2 className="auth-card__heading" id="register-title">
                    {t("register.title")}
                </h2>

                <p className="auth-card__description">
                    {t("register.description")}
                </p>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    {isSubmitted && Object.keys(errors).length > 0 && (
                        <Alert
                            variant="error"
                            message={t("register.checkFields")}
                        />
                    )}

                    {serverError && (
                        <Alert
                            variant="error"
                            message={translateMessage(serverError)}
                        />
                    )}

                    <FormField
                        label={t("register.name")}
                        htmlFor="register-name"
                        error={translateMessage(errors.name?.message)}
                    >
                        <Input
                            id="register-name"
                            placeholder={t("register.namePlaceholder")}
                            autoComplete="name"
                            hasError={Boolean(errors.name)}
                            {...register("name")}
                        />
                    </FormField>

                    <FormField
                        label={t("register.email")}
                        htmlFor="register-email"
                        error={translateMessage(errors.email?.message)}
                    >
                        <Input
                            id="register-email"
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            hasError={Boolean(errors.email)}
                            {...register("email")}
                        />
                    </FormField>

                    <FormField
                        label={t("register.password")}
                        htmlFor="register-password"
                        error={translateMessage(errors.password?.message)}
                    >
                        <PasswordInput
                            id="register-password"
                            placeholder={t("register.passwordPlaceholder")}
                            autoComplete="new-password"
                            hasError={Boolean(errors.password)}
                            {...register("password")}
                        />
                    </FormField>

                    <FormField
                        label={t("register.confirmPassword")}
                        htmlFor="register-confirm-password"
                        error={translateMessage(errors.confirmPassword?.message)}
                    >
                        <PasswordInput
                            id="register-confirm-password"
                            placeholder={t("register.confirmPasswordPlaceholder")}
                            autoComplete="new-password"
                            hasError={Boolean(errors.confirmPassword)}
                            {...register("confirmPassword")}
                        />
                    </FormField>

                    <Button
                        type="submit"
                        fullWidth
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="button-spinner"
                                    aria-hidden="true"
                                />
                                {t("register.submitting")}
                            </>
                        ) : (
                            t("register.submit")
                        )}
                    </Button>
                </form>

                <div className="auth-footer">
                    {t("register.haveAccount")}{" "}
                    <Link to="/login">{t("register.login")}</Link>
                </div>
            </section>
        </main>
    );
}