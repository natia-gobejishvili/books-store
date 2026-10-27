import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { ApiError } from "../../services/api";
import { authService } from "../../services/authService";

import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";
import PasswordInput from "../../shared/ui/PasswordInput";
import FormField from "../../shared/ui/FormField";
import Alert from "../../shared/ui/Alert";

const emailSchema = z.object({
    email: z.string().trim()
        .min(1, "ელფოსტა სავალდებულოა")
        .email("შეიყვანე სწორი ელფოსტის მისამართი"),
});

const codeSchema = z.object({
    code: z.string().trim().min(1, "შეიყვანე აღდგენის კოდი"),
});

const passwordSchema = z.object({
    password: z.string()
        .min(8, "პაროლი მინიმუმ 8 სიმბოლოსგან უნდა შედგებოდეს")
        .regex(/[A-Za-z]/, "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ლათინურ ასოს")
        .regex(/[0-9]/, "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს"),
    confirmPassword: z.string().min(1, "გაიმეორე ახალი პაროლი"),
}).refine(
    (values) => values.password === values.confirmPassword,
    {
        message: "პაროლები ერთმანეთს არ ემთხვევა",
        path: ["confirmPassword"],
    }
);

type EmailValues = z.infer<typeof emailSchema>;
type CodeValues = z.infer<typeof codeSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

type RecoveryStep = "email" | "code" | "password" | "success";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<RecoveryStep>("email");
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    
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
            setSuccessMessage("თუ ამ ელფოსტაზე ანგარიში არსებობს, აღდგენის კოდი გამოგზავნილია.");
        } catch (error) {
            setServerError(
                error instanceof Error
                    ? error.message
                    : "მოთხოვნა ვერ შესრულდა. სცადე თავიდან."
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
                setServerError("არასწორი მცდელობების ლიმიტი ამოიწურა. მიჰყევი შეტყობინებაში მოცემულ ინსტრუქციას.");
            } else {
                setServerError(
                    error instanceof Error
                        ? error.message
                        : "კოდის დადასტურება ვერ მოხერხდა."
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
            setSuccessMessage("პაროლი წარმატებით შეიცვალა. ახლა შეგიძლია შეხვიდე.");
        } catch (error) {
            setServerError(
                error instanceof Error
                    ? error.message
                    : "პაროლის შეცვლა ვერ მოხერხდა. სცადე თავიდან."
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
    
    return (
        <main className="auth-page">
            <section className="auth-intro">
                <span className="auth-eyebrow">BOOKS STORE</span>
                <h1>დაუბრუნდი შენს საყვარელ ისტორიებს.</h1>
                <p>აღადგინე ანგარიშზე წვდომა და განაგრძე კითხვა იქიდან, სადაც შეჩერდი.</p>

                <ul className="auth-benefits">
                    <li><span className="benefit-icon">✓</span> უსაფრთხო აღდგენის პროცესი</li>
                    <li><span className="benefit-icon">✓</span> ახალი პაროლის დაყენება</li>
                    <li><span className="benefit-icon">✓</span> სწრაფად დაბრუნება ანგარიშში</li>
                </ul>
            </section>

            <section className="auth-card" aria-labelledby="forgot-title">
                <h2 className="auth-card__heading" id="forgot-title">
                    {step === "email" && "პაროლის აღდგენა"}
                    {step === "code" && "შეიყვანე აღდგენის კოდი"}
                    {step === "password" && "დააყენე ახალი პაროლი"}
                    {step === "success" && "პაროლი შეიცვალა"}
                </h2>

                <p className="auth-card__description">
                    {step === "email" && "შეიყვანე ანგარიშთან დაკავშირებული ელფოსტა."}
                    {step === "code" && `აღდგენის კოდი შეიყვანე ელფოსტისთვის: ${email}`}
                    {step === "password" && "შექმენი ახალი, უსაფრთხო პაროლი."}
                    {step === "success" && "შენი ანგარიშის პაროლი განახლებულია."}
                </p>
                
                {successMessage && (
                    <Alert variant="success" message={successMessage} />
                )}

                {serverError && (
                    <Alert variant="error" message={serverError} />
                )}

                {step === "email" && (
                    <form
                        className="auth-form"
                        onSubmit={emailForm.handleSubmit(submitEmail)}
                        noValidate
                    >
                        <FormField
                            label="ელფოსტა"
                            htmlFor="forgot-email"
                            error={emailForm.formState.errors.email?.message}
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
                            {loading ? "იგზავნება..." : "აღდგენის კოდის მიღება"}
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
                            label="აღდგენის კოდი"
                            htmlFor="reset-code"
                            error={codeForm.formState.errors.code?.message}
                        >
                            <Input
                                id="reset-code"
                                placeholder="შეიყვანე მიღებული კოდი"
                                autoComplete="one-time-code"
                                hasError={Boolean(codeForm.formState.errors.code)}
                                {...codeForm.register("code")}
                            />
                        </FormField>
                        
                        <Button type="submit" fullWidth disabled={loading}>
                            {loading ? "მოწმდება..." : "კოდის დადასტურება"}
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            disabled={loading}
                            onClick={startAgain}
                        >
                            სხვა ელფოსტის გამოყენება
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
                            label="ახალი პაროლი"
                            htmlFor="new-password"
                            error={passwordForm.formState.errors.password?.message}
                        >
                            <PasswordInput
                                id="new-password"
                                placeholder="მინიმუმ 8 სიმბოლო"
                                autoComplete="new-password"
                                hasError={Boolean(passwordForm.formState.errors.password)}
                                {...passwordForm.register("password")}
                            />
                        </FormField>

                        <FormField
                            label="გაიმეორე ახალი პაროლი"
                            htmlFor="confirm-new-password"
                            error={passwordForm.formState.errors.confirmPassword?.message}
                        >
                            <PasswordInput
                                id="confirm-new-password"
                                placeholder="გაიმეორე ახალი პაროლი"
                                autoComplete="new-password"
                                hasError={Boolean(
                                passwordForm.formState.errors.confirmPassword
                                )}
                                {...passwordForm.register("confirmPassword")}
                            />
                        </FormField>

                        <Button type="submit" fullWidth disabled={loading}>
                            {loading ? "იცვლება..." : "პაროლის შეცვლა"}
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
                            შესვლის გვერდზე გადასვლა
                        </Button>
                    </div>
                )}

                {step !== "success" && (
                    <div className="auth-footer">
                        გახსოვს პაროლი? <Link to="/login">შესვლა</Link>
                    </div>
                )}
            </section>
        </main>
    );
}