import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";
import FormField from "../../shared/ui/FormField";
import Alert from "../../shared/ui/Alert";

const forgotPasswordSchema = z.object({
    email: z.string().trim()
        .min(1, "ელფოსტა სავალდებულოა")
        .email("შეიყვანე სწორი ელფოსტის მისამართი"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitted },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldFocusError: true,
    });
    
    async function onSubmit(values: ForgotPasswordValues) {
        setLoading(true);
        
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            console.log("Password recovery requested:", values.email);
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <main className="auth-page">
            <section className="auth-intro">
                <span className="auth-eyebrow">BOOKS STORE</span>
                <h1>ყოველთვის შეგიძლია დაბრუნება.</h1>
                <p>თუ პაროლი დაგავიწყდა, არ ინერვიულო. რამდენიმე მარტივი ნაბიჯით შეძლებ ანგარიშზე წვდომის აღდგენას.</p>
            </section>
            
            <section className="auth-card" aria-labelledby="forgot-title">
                {!submitted ? (
                    <>
                        <h2 className="auth-card__heading" id="forgot-title">პაროლის აღდგენა</h2>
                        <p className="auth-card__description">შეიყვანე ანგარიშთან დაკავშირებული ელფოსტა.</p>
                        
                        <form
                            className="auth-form"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                        >
                            {isSubmitted && Object.keys(errors).length > 0 && (
                                <Alert
                                    variant="error"
                                    message="გთხოვ, შეამოწმე ელფოსტის მისამართი."
                                />
                            )}
                            
                            <FormField
                                label="ელფოსტა"
                                htmlFor="forgot-email"
                                error={errors.email?.message}
                            >
                                <Input
                                    id="forgot-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    autoComplete="email"
                                    hasError={Boolean(errors.email)}
                                    {...register("email")}
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
                                        <span className="button-spinner" aria-hidden="true" />
                                        იგზავნება...
                                    </>
                                ) : "აღდგენის მოთხოვნა"}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="auth-success" aria-live="polite">
                        <div className="success-icon" aria-hidden="true">✓</div>
                        <h2 className="auth-card__heading">შეამოწმე ელფოსტა</h2>
                        <Alert
                            variant="success"
                            message="თუ ამ ელფოსტაზე ანგარიში არსებობს, გამოგიგზავნეთ აღდგენის ბმული."
                        />
                        <p className="auth-card__description">თუ წერილი არ ჩანს, შეამოწმე სპამის საქაღალდეც.</p>
                    </div>
                )}
                
                <div className="auth-footer">
                    <Link to="/login">← დაბრუნება შესვლაზე</Link>
                </div>
            </section>
        </main>
    );
}
