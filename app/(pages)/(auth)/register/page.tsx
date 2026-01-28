"use client";

import { signUp } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../FormInput";
import AuthHeader from "../AuthHeader";

const schema = z.object({
    name: z.string().min(1, "Please enter a name"),
    username: z.string().min(1, "Please enter a username"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Please enter a password"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
    const router = useRouter();
    const [accountAlreadyExists, setAccountAlreadyExists] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (values: FormData) => {
        setAccountAlreadyExists(false);
        const { data, error } = await signUp.email(values);
        if (error) {
            console.log('Registration error:', error);  
            if (error.message) setAccountAlreadyExists(true);
        } else {
            router.push("/");
        }
    };

    return (
        <>
            <AuthHeader current="register" />
            <form className="register-form flex gap-10 flex-col" onSubmit={handleSubmit(onSubmit)}>
                <FormInput
                    label="Name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    error={errors.name?.message}
                    {...register("name")}
                />
                <FormInput
                    label="Username"
                    type="text"
                    placeholder="Hottaker3000"
                    error={errors.username?.message}
                    {...register("username")}
                />
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
                    autoComplete="new-password"
                    placeholder="Password"
                    error={errors.password?.message}
                    {...register("password")}
                />
                {accountAlreadyExists && (
                    <span id="email-error" className="text-red-500">An account with this email already exists</span>
                )}
                <button
                    className="form-field px-4 py-3 rounded-md mt-4 bg-[#AC2C33] hover:bg-red-500 duration-100 transition-all"
                    type="submit"
                    disabled={isSubmitting}
                >
                    Register
                </button>
            </form>
        </>
    );
}
