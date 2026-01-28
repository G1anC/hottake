import { forwardRef, InputHTMLAttributes } from "react";

type FormInputProps = {
    label: string;
    error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, className = "", ...props }, ref) => (
        <div className="flex flex-col gap-2 text-sm">
            {label}
            <input
                ref={ref}
                className={
                    `form-field outline-none focus:ring-1 ${error ? "ring-red-500" : "ring-white/10"} px-4 py-3 rounded-md text-sm bg-white/5` +
                    className
                }
                {...props}
            />
            {error && <span className="text-red-500">{error}</span>}
        </div>
    )
);
FormInput.displayName = "FormInput";

export default FormInput;
