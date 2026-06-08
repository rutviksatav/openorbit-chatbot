import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, login } from "../services/auth";  // ✅ import login too

function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const appName = localStorage.getItem("openorbit_app_name") || "OpenOrbit";

    async function handleSignup() {
        setError("");

        if (!email || !password || !confirm) {
            setError("All fields are required.");
            return;
        }

        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            // Step 1: Create the account
            await signup(email, password);

            // Step 2: Auto login with same credentials
            const data = await login(email, password);

            // Step 3: Save token
            localStorage.setItem("token", data.access_token);

            // Step 4: Go straight to chat
            navigate("/");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{ background: "#080c14" }}
        >
            {/* Grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(0,210,190,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,190,0.025) 1px, transparent 1px)",
                    backgroundSize: "48px 48px"
                }}
            />

            {/* Glow blobs */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: 500, height: 500, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,210,190,0.055) 0%, transparent 70%)",
                    top: -120, left: -100
                }}
            />
            <div
                className="absolute pointer-events-none"
                style={{
                    width: 300, height: 300, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,180,220,0.04) 0%, transparent 70%)",
                    bottom: -80, right: -60
                }}
            />

            <AuthCard>
                <div className="space-y-6">

                    {/* Logo + Brand */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-3">
                            <div
                                className="flex items-center justify-center rounded-xl flex-shrink-0"
                                style={{
                                    width: 36, height: 36,
                                    background: "rgba(0,210,190,0.1)",
                                    border: "1px solid rgba(0,210,190,0.25)"
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <circle cx="10" cy="10" r="3" fill="#00b8a0"/>
                                    <ellipse cx="10" cy="10" rx="8.5" ry="4.5" stroke="#00b8a0" strokeWidth="1.2" fill="none" transform="rotate(-30 10 10)" opacity="0.6"/>
                                    <ellipse cx="10" cy="10" rx="8.5" ry="4.5" stroke="#00b8a0" strokeWidth="1.2" fill="none" transform="rotate(30 10 10)" opacity="0.35"/>
                                </svg>
                            </div>
                            <span
                                className="text-xl font-bold tracking-widest uppercase"
                                style={{ color: "#f0f4f8", letterSpacing: "0.08em" }}
                            >
                                {appName}
                            </span>
                        </div>

                        <div style={{ width: 32, height: 1, background: "rgba(0,210,190,0.3)", marginBottom: "0.75rem" }} />

                        <p
                            className="text-xs uppercase tracking-widest"
                            style={{ color: "rgba(120,145,165,0.75)", fontFamily: "monospace" }}
                        >
                            Create your account
                        </p>
                    </div>

                    {/* Fields */}
                    <InputField
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        icon="✉"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <InputField
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        icon="🔒"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <InputField
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        value={confirm}
                        icon="🔒"
                        onChange={(e) => setConfirm(e.target.value)}
                    />

                    {/* Error */}
                    {error && (
                        <div
                            className="text-xs rounded-xl px-3 py-2.5"
                            style={{
                                color: "rgba(255,100,100,0.85)",
                                background: "rgba(255,80,80,0.06)",
                                border: "1px solid rgba(255,80,80,0.15)",
                                fontFamily: "monospace"
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <PrimaryButton onClick={handleSignup}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </PrimaryButton>

                    {/* Link to Login */}
                    <p className="text-center text-xs" style={{ color: "rgba(100,130,150,0.6)" }}>
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold transition-colors"
                            style={{ color: "#00b8a0" }}
                        >
                            Sign In
                        </Link>
                    </p>

                    {/* Footer */}
                    <div
                        className="text-center pt-4"
                        style={{
                            borderTop: "1px solid rgba(255,255,255,0.04)",
                            fontFamily: "monospace",
                            fontSize: "0.58rem",
                            letterSpacing: "0.1em",
                            color: "rgba(80,110,130,0.5)",
                            textTransform: "uppercase"
                        }}
                    >
                        <span style={{
                            display: "inline-block", width: 5, height: 5,
                            borderRadius: "50%", background: "#00b8a0",
                            marginRight: 5, verticalAlign: "middle"
                        }} />
                        Secure · Encrypted · AI-Powered
                    </div>

                </div>
            </AuthCard>
        </div>
    );
}

export default SignupPage;
