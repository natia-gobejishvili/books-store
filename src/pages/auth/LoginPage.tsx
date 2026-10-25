import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";
import PasswordInput from "../../shared/ui/PasswordInput";
import FormField from "../../shared/ui/FormField";
import Alert from "../../shared/ui/Alert";

const loginSchema = z.object({
    email: z.string().trim().min(1, "ელფოსტა სავალდებულოა")
    .email("შეიყვანე სწორი ელფოსტის მისამართი"),
    password: z.string().min(1, "პაროლი სავალდებულოა"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitted },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldFocusError: true,
    });
    
    async function onSubmit(values: LoginValues) {
        setLoading(true);
        
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            console.log("Login form values:", values);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <main className="auth-page">
            <section className="auth-intro">
                <span className="auth-eyebrow">BOOKS STORE</span>
                <h1>შენი შემდეგი საყვარელი წიგნი იწყება აქ.</h1>
                <p>შედი შენს ანგარიშში, აღმოაჩინე ახალი ისტორიები და განაგრძე კითხვა იქიდან, სადაც შეჩერდი.</p>
                
                <ul className="auth-benefits">
                    <li><span className="benefit-icon">✓</span> აღმოაჩინე საინტერესო წიგნები</li>
                    <li><span className="benefit-icon">✓</span> მართე შენი შეკვეთები</li>
                    <li><span className="benefit-icon">✓</span> შეინახე სასურველი არჩევანი</li>
                </ul>
            </section>
            
            <section className="auth-card" aria-labelledby="login-title">
                <h2 className="auth-card__heading" id="login-title">კეთილი იყოს შენი დაბრუნება!</h2>
                <p className="auth-card__description">შეიყვანე შენი მონაცემები ანგარიშში შესასვლელად.</p>
                
                <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {isSubmitted && Object.keys(errors).length > 0 && (
                        <Alert
                            variant="error"
                            message="გთხოვ, შეამოწმე მონიშნული ველები."
                        />
                    )}
                    
                    <FormField
                        label="ელფოსტა"
                        htmlFor="login-email"
                        error={errors.email?.message}
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
                        label="პაროლი"
                        htmlFor="login-password"
                        error={errors.password?.message}
                    >
                        <PasswordInput
                            id="login-password"
                            placeholder="შეიყვანე პაროლი"
                            autoComplete="current-password"
                            hasError={Boolean(errors.password)}
                            {...register("password")}
                        />
                    </FormField>
                    
                    <div className="auth-links auth-links--single">
                        <Link to="/forgot-password">დაგავიწყდა პაროლი?</Link>
                    </div>
                    
                    <Button
                        type="submit"
                        fullWidth
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="button-spinner" aria-hidden="true" />
                                მოწმდება...
                            </>
                        ) : "შესვლა"}
                    </Button>
                </form>
                
                <div className="auth-footer">
                    ჯერ არ გაქვს ანგარიში?{" "}
                    <Link to="/register">შექმენი ანგარიში</Link>
                </div>
            </section>
        </main>
    );
}
