import Link from "next/link";

const AuthHeader = ({
    current
} : {current: "login" | "register"}) => {
    return (
        <div className="mb-8">
            <div className=" text-[12px]">{current === "login" ? "Log in" : "Register"}</div>
            <span className="mt-1 opacity-50">
                {current === "login" ? "Don't have an account ?" : "Already have an account ?"}
                <Link
                    href={current === "login" ? "/register" : "/login"}
                    className="text-blue-500 ml-1 hover:underline">
                    {current === "login" ? "Register" : "Log in"}
                </Link>
            </span>
        </div>
    );
}

export default AuthHeader;
