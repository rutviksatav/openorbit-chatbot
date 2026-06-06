import { apiFetch }
    from "./api";


export async function getSessions() {

    const response =
        await apiFetch(
            "/sessions"
        );

    if (!response.ok) {

        throw new Error(
            "Failed to load sessions"
        );
    }

    return response.json();
}


export async function createSession() {

    const response =
        await apiFetch(

            "/sessions",

            {

                method: "POST",

                body: JSON.stringify({

                    title: "New Chat"
                })
            }
        );

    if (!response.ok) {

        throw new Error(
            "Failed to create session"
        );
    }

    return response.json();
}

export async function deleteSession(

    sessionId

) {

    const response =
        await apiFetch(

            `/sessions/${sessionId}`,

            {

                method: "DELETE"
            }
        );

    if (!response.ok) {

        throw new Error(
            "Failed to delete session"
        );
    }

    return response.json();
}
