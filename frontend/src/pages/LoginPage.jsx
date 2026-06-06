import AuthCard from "../components/AuthCard";

import InputField from "../components/InputField";

import PrimaryButton from "../components/PrimaryButton";

import { useState } from "react";

import { useNavigate }
    from "react-router-dom";

import { login }
    from "../services/auth";

function LoginPage() {

    const [email, setEmail] =
    useState("");

    const [password, setPassword] =
    useState("");

    const [loading, setLoading] =
    useState(false);

    const [error, setError] =
        useState("");

    const navigate =
        useNavigate();



    async function handleLogin() {

        try {

            setLoading(true);

            setError("");

            const data =
                await login(

                    email,

                    password
                );

            localStorage.setItem(

                "token",

                data.access_token
            );

            navigate("/chat");

        }

        catch (err) {

            setError(
                err.message
            );
        }

        finally {

            setLoading(false);
        }
    }

    return (

        <div

            className="
                min-h-screen
                flex
                items-center
                justify-center
                bg-slate-950
                px-4
            "
        >

            <AuthCard>

                <div className="space-y-6">

                    <div>

                        <h1
                            className="
                                text-4xl
                                font-bold
                                text-white
                            "
                        >

                            OpenOrbit 🚀

                        </h1>

                        <p
                            className="
                                mt-2
                                text-slate-400
                            "
                        >

                            AI Workspace Platform

                        </p>

                    </div>


                    <InputField

                        label="Email"

                        type="email"

                        placeholder="Enter email"

                        value={email}

                        onChange={(event) =>
                            setEmail(
                                event.target.value
                            )
                        }
                     />

                    <InputField

                        label="Password"

                        type="password"

                        placeholder="Enter password"

                        value={password}

                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                     />

                     {
                        error && (

                            <div

                                className="
                                    text-red-400
                                    text-sm
                                "
                            >

                                {error}

                            </div>
                        )
                    }

                    <PrimaryButton

                        onClick={handleLogin}

                    >

                        {
                            loading
                                ? "Signing In..."
                                : "Sign In"
                        }

                    </PrimaryButton>

                </div>

            </AuthCard>

        </div>
    );
}

export default LoginPage;
