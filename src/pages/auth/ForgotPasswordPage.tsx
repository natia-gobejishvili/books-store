import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { ApiError } from "../../services/api";
import { authService } from "../../services/authService";

import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";
import PasswordInput from "../../shared/ui/PasswordInput";
import FormField from "../../shared/ui/FormField";
import Alert from "../../shared/ui/Alert";

const emailSchema = z.object({
    email: z.string().trim()
        .min(1, "forgotPassword.validation.emailRequired")
        .email("forgotPassword.validation.emailInvalid"),
});

const codeSchema = z.object({
    code: z.string().trim()
        .min(1, "forgotPassword.validation.codeRequired"),
});

const passwordSchema = z.object({
    password: z.string()
        .min(8, "forgotPassword.validation.passwordMin")
        .regex(/[A-Za-z]/, "forgotPassword.validation.passwordLetter")
        .regex(/[0-9]/, "forgotPassword.validation.passwordNumber"),
    confirmPassword: z.string()
        .min(1, "forgotPassword.validation.confirmPasswordRequired"),
}).refine(
    (values) => values.password === values.confirmPassword,
    {
        message: "forgotPassword.validation.passwordMismatch",
        path: ["confirmPassword"],
    }
);

type EmailValues = z.infer<typeof emailSchema>;
type CodeValues = z.infer<typeof codeSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

type RecoveryStep = "email" | "code" | "password" | "success";

export default function ForgotPasswordPage() {
    const { t } = useTranslation();

    const [step, setStep] = useState<RecoveryStep>("email");
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const translateMessage = (message?: string): string => {
        if (!message) return "";

        return message.startsWith("forgotPassword.")
            ? t(message)
            : message;
    };

    const emailForm = useForm<EmailValues>({
        resolver: zodResolver(emailSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const codeForm = useForm<CodeValues>({
        resolver: zodResolver(codeSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const passwordForm = useForm<PasswordValues>({
        resolver: zodResolver(passwordSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    async function submitEmail(values: EmailValues) {
        setLoading(true);
        setServerError("");
        setSuccessMessage("");

        try {
            await authService.forgotPassword({
                email: values.email.trim(),
            });

            setEmail(values.email.trim());
            setStep("code");
            setSuccessMessage("forgotPassword.messages.codeSent");
        } catch (error) {
            setServerError(
                error instanceof Error
                    ? error.message
                    : "forgotPassword.server.requestError"
            );
        } finally {
            setLoading(false);
        }
    }

    async function submitCode(values: CodeValues) {
        setLoading(true);
        setServerError("");
        setSuccessMessage("");

        try {
            const result = await authService.verifyResetCode({
                email,
                code: values.code.trim(),
            });

            setResetToken(result.resetToken);
            setStep("password");
        } catch (error) {
            if (error instanceof ApiError && error.status === 429) {
                setServerError("forgotPassword.server.tooManyAttempts");
            } else {
                setServerError(
                    error instanceof Error
                        ? error.message
                        : "forgotPassword.server.codeVerificationError"
                );
            }
        } finally {
            setLoading(false);
        }
    }

    async function submitPassword(values: PasswordValues) {
        setLoading(true);
        setServerError("");

        try {
            await authService.resetPassword({
                resetToken,
                password: values.password,
            });

            setStep("success");
            setSuccessMessage("forgotPassword.messages.passwordChanged");
        } catch (error) {
            setServerError(
                error instanceof Error
                    ? error.message
                    : "forgotPassword.server.passwordChangeError"
            );
        } finally {
            setLoading(false);
        }
    }

    function startAgain() {
        setStep("email");
        setEmail("");
        setResetToken("");
        setServerError("");
        setSuccessMessage("");

        emailForm.reset();
        codeForm.reset();
        passwordForm.reset();
    }

    const stepTitles: Record<RecoveryStep, string> = {
        email: t("forgotPassword.steps.emailTitle"),
        code: t("forgotPassword.steps.codeTitle"),
        password: t("forgotPassword.steps.passwordTitle"),
        success: t("forgotPassword.steps.successTitle"),
    };

    return (
        <main className="auth-page">
            <section className="auth-intro">
                <h1>{t("forgotPassword.introTitle")}</h1>
                <p>{t("forgotPassword.introDescription")}</p>

                <ul className="auth-benefits">
                    <li>
                        <span className="benefit-icon">✓</span>
                        {t("forgotPassword.benefits.secure")}
                    </li>
                    <li>
                        <span className="benefit-icon">✓</span>
                        {t("forgotPassword.benefits.newPassword")}
                    </li>
                    <li>
                        <span className="benefit-icon">✓</span>
                        {t("forgotPassword.benefits.return")}
                    </li>
                </ul>
            </section>

            <section className="auth-card" aria-labelledby="forgot-title">
                <h2 className="auth-card__heading" id="forgot-title">
                    {stepTitles[step]}
                </h2>

                <p className="auth-card__description">
                    {step === "email" &&
                        t("forgotPassword.descriptions.email")}

                    {step === "code" &&
                        t("forgotPassword.descriptions.code", { email })}

                    {step === "password" &&
                        t("forgotPassword.descriptions.password")}

                    {step === "success" &&
                        t("forgotPassword.descriptions.success")}
                </p>

                {successMessage && (
                    <Alert
                        variant="success"
                        message={translateMessage(successMessage)}
                    />
                )}

                {serverError && (
                    <Alert
                        variant="error"
                        message={translateMessage(serverError)}
                    />
                )}

                {step === "email" && (
                    <form
                        className="auth-form"
                        onSubmit={emailForm.handleSubmit(submitEmail)}
                        noValidate
                    >
                        <FormField
                            label={t("forgotPassword.email")}
                            htmlFor="forgot-email"
                            error={translateMessage(
                                emailForm.formState.errors.email?.message
                            )}
                        >
                            <Input
                                id="forgot-email"
                                type="email"
                                placeholder="name@example.com"
                                autoComplete="email"
                                hasError={Boolean(emailForm.formState.errors.email)}
                                {...emailForm.register("email")}
                            />
                        </FormField>

                        <Button type="submit" fullWidth disabled={loading}>
                            {loading
                                ? t("forgotPassword.buttons.sending")
                                : t("forgotPassword.buttons.sendCode")}
                        </Button>
                    </form>
                )}

                {step === "code" && (
                    <form
                        className="auth-form"
                        onSubmit={codeForm.handleSubmit(submitCode)}
                        noValidate
                    >
                        <FormField
                            label={t("forgotPassword.code")}
                            htmlFor="reset-code"
                            error={translateMessage(
                                codeForm.formState.errors.code?.message
                            )}
                        >
                            <Input
                                id="reset-code"
                                placeholder={t("forgotPassword.codePlaceholder")}
                                autoComplete="one-time-code"
                                hasError={Boolean(codeForm.formState.errors.code)}
                                {...codeForm.register("code")}
                            />
                        </FormField>

                        <Button type="submit" fullWidth disabled={loading}>
                            {loading
                                ? t("forgotPassword.buttons.verifying")
                                : t("forgotPassword.buttons.verifyCode")}
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            disabled={loading}
                            onClick={startAgain}
                        >
                            {t("forgotPassword.buttons.useAnotherEmail")}
                        </Button>
                    </form>
                )}

                {step === "password" && (
                    <form
                        className="auth-form"
                        onSubmit={passwordForm.handleSubmit(submitPassword)}
                        noValidate
                    >
                        <FormField
                            label={t("forgotPassword.newPassword")}
                            htmlFor="new-password"
                            error={translateMessage(
                                passwordForm.formState.errors.password?.message
                            )}
                        >
                            <PasswordInput
                                id="new-password"
                                placeholder={t("forgotPassword.passwordPlaceholder")}
                                autoComplete="new-password"
                                hasError={Boolean(passwordForm.formState.errors.password)}
                                {...passwordForm.register("password")}
                            />
                        </FormField>

                        <FormField
                            label={t("forgotPassword.confirmPassword")}
                            htmlFor="confirm-new-password"
                            error={translateMessage(
                                passwordForm.formState.errors.confirmPassword?.message
                            )}
                        >
                            <PasswordInput
                                id="confirm-new-password"
                                placeholder={t("forgotPassword.confirmPasswordPlaceholder")}
                                autoComplete="new-password"
                                hasError={Boolean(
                                    passwordForm.formState.errors.confirmPassword
                                )}
                                {...passwordForm.register("confirmPassword")}
                            />
                        </FormField>

                        <Button type="submit" fullWidth disabled={loading}>
                            {loading
                                ? t("forgotPassword.buttons.changing")
                                : t("forgotPassword.buttons.changePassword")}
                        </Button>
                    </form>
                )}

                {step === "success" && (
                    <div className="auth-form">
                        <Button
                            type="button"
                            fullWidth
                            onClick={() => {
                                window.location.assign("/login");
                            }}
                        >
                            {t("forgotPassword.buttons.goToLogin")}
                        </Button>
                    </div>
                )}

                {step !== "success" && (
                    <div className="auth-footer">
                        {t("forgotPassword.rememberPassword")}{" "}
                        <Link to="/login">
                            {t("forgotPassword.login")}
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}