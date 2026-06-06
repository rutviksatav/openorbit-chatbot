import { apiFetch }
    from "./api";


export async function getMessages(

    sessionId

) {

    const response =
        await apiFetch(

            `/sessions/${sessionId}/messages`
        );

    if (!response.ok) {

        throw new Error(
            "Failed to load messages"
        );
    }

    return response.json();
}


export async function sendMessage(

    sessionId,

    content

) {

    const response =
        await apiFetch(

            `/sessions/${sessionId}/messages`,

            {

                method: "POST",

                body: JSON.stringify({

                    content
                })
            }
        );

    if (!response.ok) {

        throw new Error(
            "Failed to send message"
        );
    }

    return response.json();
}


export function streamMessage(

    sessionId,

    onChunk

) {

    const token =
        localStorage.getItem(
            "token"
        );

    const eventSource =
        new EventSource(

            `http://127.0.0.1:8000/sessions/${sessionId}/stream?token=${token}`

        );

    eventSource.onmessage =
        (event) => {

            console.log(
                "STREAM:",
                event.data
            );

            onChunk(
                event.data
            );
        };

    eventSource.onerror =
        () => {

            eventSource.close();
        };

    return eventSource;
}

export async function editMessage(sessionId, messageId, content) {
    const response = await apiFetch(
        `/sessions/${sessionId}/messages/${messageId}`,
        {
            method: "PUT",
            body: JSON.stringify({ content })
        }
    );
    if (!response.ok) {
        throw new Error("Failed to edit message");
    }
    return response.json();
}

export async function deleteLastMessage(sessionId) {
    const response = await apiFetch(
        `/sessions/${sessionId}/messages/last`,
        {
            method: "DELETE"
        }
    );
    if (!response.ok) {
        throw new Error("Failed to delete last message");
    }
    return response.json();
}

export async function submitFeedback(sessionId, messageId, feedback) {
    const response = await apiFetch(
        `/sessions/${sessionId}/messages/${messageId}/feedback`,
        {
            method: "POST",
            body: JSON.stringify({ feedback })
        }
    );
    if (!response.ok) {
        throw new Error("Failed to submit feedback");
    }
    return response.json();
}

