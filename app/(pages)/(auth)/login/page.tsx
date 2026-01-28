"use client";

import { signIn } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link"
import FormInput from "../FormInput";
import AuthHeader from "../AuthHeader";

const schema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Please enter a password"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const router = useRouter();
    const [loginError, setLoginError] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (values: FormData) => {
        setLoginError(false);
        const { data, error } = await signIn.email({
            email: values.email,
            password: values.password,
        });
        if (error) {
            setLoginError(true);
        } else {
            router.push("/");
        }
    };

    return (
        <>
            <AuthHeader current="login" />
            <form className="register-form flex gap-10 flex-col" onSubmit={handleSubmit(onSubmit)}>
                <FormInput
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@gmail.com"
                    error={errors.email?.message}
                    {...register("email")}
                />
                <FormInput
                    label="Password"
                    type="password"
                    placeholder="Password"
                    error={errors.password?.message}
                    {...register("password")}
                />
                {loginError && (
                    <span className="text-red-500">Invalid email or password</span>
                )}
                <button
                    className="form-field px-4 py-3 rounded-md mt-4 bg-[#AC2C33] hover:bg-red-500 duration-100 transition-all"
                    type="submit"
                    disabled={isSubmitting}
                >
                    Login
                </button>
            </form>
        </>
    );
}
