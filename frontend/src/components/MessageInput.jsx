import {

    Paperclip,

    Mic,

    ArrowUp,

    LoaderCircle

} from "lucide-react";

import {

    useState

} from "react";

import { flushSync } from "react-dom";

import {

    sendMessage,

    streamMessage,

    getMessages

} from "../services/message";


function MessageInput({

    sessionId,

    setMessages

}) {

    const [message, setMessage] =
        useState("");

    const [sending, setSending] =
        useState(false);


    async function handleSend() {

        if (

            !message.trim()

            ||

            sending

        ) {

            return;
        }

        const userMessage =
            message;
        setMessage("");

        try {

            setSending(true);

            const assistantId =
    `assistant-${Date.now()}`;

            setMessages(

                prev => [

                    ...prev,

                    {

                        id: `user-${Date.now()}`,

                        role: "user",

                        content: userMessage
                    },

                    {

                        id: assistantId,

                        role: "assistant",

                        content: ""
                    }
                ]
            );

            console.time("POST");

            await sendMessage(
                sessionId,
                userMessage
            );

            console.timeEnd("POST");

            console.time("STREAM_START");



            const eventSource =

                streamMessage(

                    sessionId,

                    (chunk) => {
                        console.timeEnd(
                            "STREAM_START"
                        );

                        console.log(
                            "CHUNK RECEIVED:",
                            chunk
                        );

                        setMessages(

                            prev => {

                                const updated = [...prev];

                                const assistantIndex =

                                    updated.findIndex(

                                        message =>

                                            message.id === assistantId
                                    );

                                if (

                                    assistantIndex === -1

                                ) {

                                    return prev;
                                }

                                updated[
                                    assistantIndex
                                ] = {

                                    ...updated[
                                        assistantIndex
                                    ],

                                    content:

                                        updated[
                                            assistantIndex
                                        ].content + chunk
                                };
                                console.log(
                                    "UPDATED CONTENT:",
                                    updated[
                                        assistantIndex
                                    ].content
                                );

                                return updated;
                            }
                        );
                    }
                );

            eventSource.onerror = () => {

                console.error(
                    "STREAM ERROR"
                );

                eventSource.close();

                setSending(false);
            };

            eventSource.addEventListener(

                "done",

                () => {

                    console.log(
                        "STREAM FINISHED"
                    );

                    eventSource.close();

                    // Sync messages with the database to get real message IDs
                    getMessages(sessionId)
                        .then(messagesData => {
                            setMessages(messagesData);
                        })
                        .catch(err => {
                            console.error("Failed to sync messages:", err);
                        })
                        .finally(() => {
                            setSending(false);
                        });
                }
            );

        }

        catch (error) {

            console.error(
                error
            );

            setSending(false);
        }

    }


    return (

        <div

            className="
                p-5
            "
        >

            <div

                className="
                    max-w-4xl
                    mx-auto
                "
            >

                <div

                    className="
                        bg-[#18181B]
                        border
                        border-zinc-800
                        rounded-3xl
                        px-5
                        py-4
                        shadow-xl
                    "
                >

                    <textarea

                        rows={1}

                        value={message}

                        disabled={sending}

                        onChange={(event) => {

                            setMessage(
                                event.target.value
                            );

                            event.target.style.height =
                                "auto";

                            event.target.style.height =
                                `${event.target.scrollHeight}px`;
                        }}

                        onKeyDown={(event) => {

                            if (

                                event.key === "Enter"

                                &&

                                !event.shiftKey

                            ) {

                                event.preventDefault();

                                handleSend();
                            }
                        }}

                        placeholder={

                            sending

                                ? "OpenOrbit is thinking..."

                                : "Ask OpenOrbit anything..."
                        }

                        className="
                            w-full
                            bg-transparent
                            text-white
                            outline-none
                            placeholder:text-zinc-500
                            disabled:opacity-60

                            resize-none
                            overflow-hidden

                            min-h-[28px]
                            max-h-[220px]
                        "
                    />


                    <div

                        className="
                            mt-4
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <div

                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <button

                                className="
                                    p-2
                                    rounded-xl
                                    hover:bg-zinc-800
                                    transition
                                "
                            >

                                <Paperclip

                                    size={18}

                                    className="
                                        text-zinc-400
                                    "
                                />

                            </button>


                            <button

                                className="
                                    p-2
                                    rounded-xl
                                    hover:bg-zinc-800
                                    transition
                                "
                            >

                                <Mic

                                    size={18}

                                    className="
                                        text-zinc-400
                                    "
                                />

                            </button>

                        </div>


                        <button

                            disabled={sending}

                            onClick={
                                handleSend
                            }

                            className="
                                w-10
                                h-10
                                rounded-xl
                                bg-cyan-500
                                hover:bg-cyan-400
                                disabled:opacity-60
                                flex
                                items-center
                                justify-center
                                transition
                            "
                        >

                            {

                                sending

                                    ? (

                                        <LoaderCircle

                                            size={18}

                                            className="
                                                animate-spin
                                                text-black
                                            "
                                        />

                                    )

                                    : (

                                        <ArrowUp

                                            size={18}

                                            className="
                                                text-black
                                            "
                                        />

                                    )
                            }

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default MessageInput;
