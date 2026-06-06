const API_URL =
    "http://127.0.0.1:8000";


export async function apiFetch(

    endpoint,

    options = {}

) {

    const token =
        localStorage.getItem(
            "token"
        );


    const response =
        await fetch(

            `${API_URL}${endpoint}`,

            {

                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    ...(token && {

                        Authorization:
                            `Bearer ${token}`
                    }),

                    ...(options.headers || {})
                }
            }
        );

    return response;
}
