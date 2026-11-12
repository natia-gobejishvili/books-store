import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

const loginSchema = z.object({
    email: z.string().trim()
        .min(1, "login.validation.emailRequired")
        .email("login.validation.emailInvalid"),
    password: z.string()
        .min(1, "login.validation.passwordRequired"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshUser } = useAuth();
    const { t } = useTranslation();

    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const translateMessage = (message?: string): string => {
        if (!message) return "";

        return message.startsWith("login.")
            ? t(message)
            : message;
    };

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitted },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldFocusError: true,
    });

    async function onSubmit(values: LoginValues) {
        setLoading(true);
        setServerError("");

        try {
            await authService.login(values);
            await refreshUser();

            const state = location.state as {
                from?: { pathname?: string };
            } | null;

            navigate(state?.from?.pathname || "/catalog", {
                replace: true,
            });
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.code === "INVALID_CREDENTIALS") {
                    setServerError("login.server.invalidCredentials");
                } else {
                    let hasFieldErrors = false;

                    for (const [field, message] of Object.entries(error.fieldErrors)) {
                        if (field === "email" || field === "password") {
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
                        : "login.server.genericError"
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-intro">
                <h1>{t("login.introTitle")}</h1>
                <p>{t("login.introDescription")}</p>

                <ul className="auth-benefits">
                    <li>
                        <span className="benefit-icon">✓</span>
                        {t("login.benefits.discover")}
                    </li>
                    <li>
                        <span className="benefit-icon">✓</span>
                        {t("login.benefits.orders")}
                    </li>
                    <li>
                        <span className="benefit-icon">✓</span>
                        {t("login.benefits.save")}
                    </li>
                </ul>
            </section>

            <section className="auth-card" aria-labelledby="login-title">
                <h2 className="auth-card__heading" id="login-title">
                    {t("login.title")}
                </h2>

                <p className="auth-card__description">
                    {t("login.description")}
                </p>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    {isSubmitted && Object.keys(errors).length > 0 && (
                        <Alert
                            variant="error"
                            message={t("login.checkFields")}
                        />
                    )}

                    {serverError && (
                        <Alert
                            variant="error"
                            message={translateMessage(serverError)}
                        />
                    )}

                    <FormField
                        label={t("login.email")}
                        htmlFor="login-email"
                        error={translateMessage(errors.email?.message)}
                    >
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            hasError={Boolean(errors.email)}
                            {...register("email")}
                        />
                    </FormField>

                    <FormField
                        label={t("login.password")}
                        htmlFor="login-password"
                        error={translateMessage(errors.password?.message)}
                    >
                        <PasswordInput
                            id="login-password"
                            placeholder={t("login.passwordPlaceholder")}
                            autoComplete="current-password"
                            hasError={Boolean(errors.password)}
                            {...register("password")}
                        />
                    </FormField>

                    <div className="auth-links auth-links--single">
                        <Link to="/forgot-password">
                            {t("login.forgotPassword")}
                        </Link>
                    </div>

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
                                {t("login.submitting")}
                            </>
                        ) : (
                            t("login.submit")
                        )}
                    </Button>
                </form>

                <div className="auth-footer">
                    {t("login.noAccount")}{" "}
                    <Link to="/register">{t("login.register")}</Link>
                </div>
            </section>
        </main>
    );
}