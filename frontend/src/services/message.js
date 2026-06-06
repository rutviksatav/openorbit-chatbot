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
