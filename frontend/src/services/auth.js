import { apiFetch } from "./api";

export async function login(email, password) {
    const response = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error("Invalid credentials");
    }

    return response.json();
}

export async function signup(email, password) {
    const response = await apiFetch("/signup", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Signup failed");
    }

    return response.json();
}

export async function getCurrentUser() {
    const response = await apiFetch("/me");

    if (!response.ok) {
        throw new Error("Unauthorized");
    }

    return response.json();
}
