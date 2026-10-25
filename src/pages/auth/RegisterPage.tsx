
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

const registerSchema = z.object({
    name: z.string().trim()
        .min(2, "სახელი მინიმუმ 2 სიმბოლოს უნდა შეიცავდეს"),
    email: z.string().trim().min(1, "ელფოსტა სავალდებულოა")
        .email("შეიყვანე სწორი ელფოსტის მისამართი"),
    password: z.string()
        .min(8, "პაროლი მინიმუმ 8 სიმბოლოსგან უნდა შედგებოდეს")
        .regex(/[A-Za-z]/, "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ლათინურ ასოს")
        .regex(/[0-9]/, "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს"),
    confirmPassword: z.string().min(1, "გაიმეორე პაროლი"),
}).refine(
    (values) => values.password === values.confirmPassword,
    {
        message: "პაროლები ერთმანეთს არ ემთხვევა",
        path: ["confirmPassword"],
    }
);

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitted },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldFocusError: true,
    });
    
    async function onSubmit(values: RegisterValues) {
        setLoading(true);
        
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            const { confirmPassword, ...formValues } = values;
            console.log("Register form values:", formValues);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <main className="auth-page">
            <section className="auth-intro">
                <span className="auth-eyebrow">BOOKS STORE</span>
                <h1>ყოველი წიგნი ახალი სამყაროა.</h1>
                <p>შექმენი ანგარიში და დაიწყე შენი შემდეგი ლიტერატურული თავგადასავალი.</p>
                
                <ul className="auth-benefits">
                    <li><span className="benefit-icon">✓</span> აღმოაჩინე ახალი ავტორები</li>
                    <li><span className="benefit-icon">✓</span> მარტივად მართე შეკვეთები</li>
                    <li><span className="benefit-icon">✓</span> ისარგებლე პირადი პროფილით</li>
                </ul>
            </section>
            
            <section className="auth-card" aria-labelledby="register-title">
                <h2 className="auth-card__heading" id="register-title">შექმენი ანგარიში</h2>
                <p className="auth-card__description">შეავსე ველები და შემოუერთდი ჩვენს მკითხველებს.</p>
                
                <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {isSubmitted && Object.keys(errors).length > 0 && (
                        <Alert
                            variant="error"
                            message="გთხოვ, შეამოწმე მონიშნული ველები."
                        />
                    )}
                    
                    <FormField label="სახელი" htmlFor="register-name" error={errors.name?.message}>
                        <Input
                            id="register-name"
                            placeholder="შენი სახელი"
                            autoComplete="name"
                            hasError={Boolean(errors.name)}
                            {...register("name")}
                        />
                    </FormField>
                    
                    <FormField label="ელფოსტა" htmlFor="register-email" error={errors.email?.message}>
                        <Input 
                            id="register-email"
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            hasError={Boolean(errors.email)}
                            {...register("email")}
                        />
                    </FormField>
                    
                    <FormField label="პაროლი" htmlFor="register-password" error={errors.password?.message}>
                        <PasswordInput
                            id="register-password"
                            placeholder="მინიმუმ 8 სიმბოლო"
                            autoComplete="new-password"
                            hasError={Boolean(errors.password)}
                            {...register("password")}
                        />
                    </FormField>
                    
                    <FormField
                        label="გაიმეორე პაროლი"
                        htmlFor="register-confirm-password"
                        error={errors.confirmPassword?.message}
                    >
                        <PasswordInput
                            id="register-confirm-password"
                            placeholder="გაიმეორე პაროლი"
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
                                <span className="button-spinner" aria-hidden="true" />
                                მოწმდება...
                            </>
                        ) : "ანგარიშის შექმნა"}
                    </Button>
                </form>
                
                <div className="auth-footer">
                    უკვე გაქვს ანგარიში?{" "}
                    <Link to="/login">შესვლა</Link>
                </div>
            </section>
        </main>
    );
}
