import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { ApiError } from "../services/api";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

import Button from "../shared/ui/Button";
import Input from "../shared/ui/Input";
import PasswordInput from "../shared/ui/PasswordInput";
import FormField from "../shared/ui/FormField";
import Alert from "../shared/ui/Alert";

import "../styles/profile.css";

const profileSchema = z.object({
    name: z.string()
        .trim()
        .min(2, "profile.validation.nameMin"),

    email: z.string()
        .trim()
        .min(1, "profile.validation.emailRequired")
        .email("profile.validation.emailInvalid"),

    currentPassword: z.string()
        .min(1, "profile.validation.currentPasswordRequired"),

    newPassword: z.string()
        .optional()
        .refine(
            (value) =>
                !value ||
                (
                    value.length >= 8 &&
                    /[A-Za-z]/.test(value) &&
                    /[0-9]/.test(value)
                ),
            "profile.validation.newPassword",
        ),

    confirmPassword: z.string().optional(),
}).superRefine((values, context) => {
    if (values.newPassword && !values.confirmPassword) {
        context.addIssue({
            code: "custom",
            message: "profile.validation.confirmPasswordRequired",
            path: ["confirmPassword"],
        });
    }

    if (
        values.newPassword &&
        values.newPassword !== values.confirmPassword
    ) {
        context.addIssue({
            code: "custom",
            message: "profile.validation.passwordMismatch",
            path: ["confirmPassword"],
        });
    }
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, dirtyFields, isSubmitted },
    } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldFocusError: true,
        defaultValues: {
            name: user?.name ?? "",
            email: user?.email ?? "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [user, reset]);

    const hasChanges = Boolean(
        dirtyFields.name ||
        dirtyFields.email ||
        dirtyFields.newPassword
    );

    const translateMessage = (message?: string) => {
        if (!message) return undefined;

        return message.startsWith("profile.")
            ? t(message)
            : message;
    };

    async function onSubmit(values: ProfileValues) {
        if (!hasChanges) return;

        setLoading(true);
        setServerError("");
        setSuccessMessage("");

        try {
            const payload = {
                currentPassword: values.currentPassword,
                ...(dirtyFields.name && {
                    name: values.name.trim(),
                }),
                ...(dirtyFields.email && {
                    email: values.email.trim(),
                }),
                ...(dirtyFields.newPassword && values.newPassword && {
                    newPassword: values.newPassword,
                }),
            };

            const updatedUser = await authService.updateProfile(payload);

            updateUser(updatedUser);

            reset({
                name: updatedUser.name,
                email: updatedUser.email,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setSuccessMessage("profile.success");
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.code === "INVALID_CURRENT_PASSWORD") {
                    setError("currentPassword", {
                        type: "server",
                        message: "profile.server.invalidPassword",
                    });
                } else if (error.code === "EMAIL_TAKEN") {
                    setError("email", {
                        type: "server",
                        message: "profile.server.emailTaken",
                    });
                } else if (error.code === "VALIDATION_ERROR") {
                    let hasFieldErrors = false;

                    for (const [field, message] of Object.entries(error.fieldErrors)) {
                        if (
                            field === "name" ||
                            field === "email" ||
                            field === "currentPassword" ||
                            field === "newPassword"
                        ) {
                            setError(field, {
                                type: "server",
                                message,
                            });

                            hasFieldErrors = true;
                        } else if (field === "_") {
                            setServerError("profile.noChanges");
                            hasFieldErrors = true;
                        }
                    }

                    if (!hasFieldErrors) {
                        setServerError(error.message);
                    }
                } else {
                    setServerError(error.message);
                }
            } else {
                setServerError(
                    error instanceof Error
                        ? error.message
                        : "profile.saveError",
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="profile-page">
            <section className="profile-card">
                <div className="profile-heading">
                    <span className="profile-eyebrow">BOOKS STORE</span>
                    <h1>{t("profile.title")}</h1>
                    <p>{t("profile.description")}</p>
                </div>

                <form className="profile-form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    {isSubmitted && Object.keys(errors).length > 0 && (
                        <Alert
                            variant="error"
                            message={t("profile.checkFields")}
                        />
                    )}

                    {serverError && (
                        <Alert
                            variant="error"
                            message={translateMessage(serverError) || serverError}
                        />
                    )}

                    {successMessage && (
                        <Alert
                            variant="success"
                            message={translateMessage(successMessage) || successMessage}
                        />
                    )}

                    <div className="profile-section">
                        <h2>{t("profile.personalInformation")}</h2>

                        <FormField
                            label={t("profile.name")}
                            htmlFor="profile-name"
                            error={translateMessage(errors.name?.message)}
                        >
                            <Input
                                id="profile-name"
                                autoComplete="name"
                                hasError={Boolean(errors.name)}
                                {...register("name")}
                            />
                        </FormField>

                        <FormField
                            label={t("profile.email")}
                            htmlFor="profile-email"
                            error={translateMessage(errors.email?.message)}
                        >
                            <Input
                                id="profile-email"
                                type="email"
                                autoComplete="email"
                                hasError={Boolean(errors.email)}
                                {...register("email")}
                            />
                        </FormField>
                    </div>

                    <div className="profile-section">
                        <h2>{t("profile.changePassword")}</h2>

                        <p className="profile-hint">
                            {t("profile.passwordHint")}
                        </p>

                        <FormField
                            label={t("profile.currentPassword")}
                            htmlFor="profile-current-password"
                            error={translateMessage(errors.currentPassword?.message)}
                        >
                            <PasswordInput
                                id="profile-current-password"
                                placeholder={t("profile.currentPasswordPlaceholder")}
                                autoComplete="current-password"
                                hasError={Boolean(errors.currentPassword)}
                                {...register("currentPassword")}
                            />
                        </FormField>

                        <FormField
                            label={t("profile.newPassword")}
                            htmlFor="profile-new-password"
                            error={translateMessage(errors.newPassword?.message)}
                        >
                            <PasswordInput
                                id="profile-new-password"
                                placeholder={t("profile.newPasswordPlaceholder")}
                                autoComplete="new-password"
                                hasError={Boolean(errors.newPassword)}
                                {...register("newPassword")}
                            />
                        </FormField>

                        <FormField
                            label={t("profile.confirmNewPassword")}
                            htmlFor="profile-confirm-password"
                            error={translateMessage(errors.confirmPassword?.message)}
                        >
                            <PasswordInput
                                id="profile-confirm-password"
                                placeholder={t("profile.confirmNewPasswordPlaceholder")}
                                autoComplete="new-password"
                                hasError={Boolean(errors.confirmPassword)}
                                {...register("confirmPassword")}
                            />
                        </FormField>
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        className="profile-submit"
                        disabled={!hasChanges || loading}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="button-spinner"
                                    aria-hidden="true"
                                />
                                {t("profile.saving")}
                            </>
                        ) : t("profile.saveChanges")}
                    </Button>
                </form>
            </section>
        </main>
    );
}
