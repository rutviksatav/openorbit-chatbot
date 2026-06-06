import ReactMarkdown
    from "react-markdown";

import {

    useEffect,

    useRef

} from "react";

function ChatWindow({

    messages

}) {


    const bottomRef =
        useRef(null);


    useEffect(() => {

        // bottomRef.current?.scrollIntoView();

    }, [messages]);


    if (

        messages?.length > 0

    ) {

        return (

            <div

                className="
                    flex-1
                    overflow-y-auto
                    px-6
                    py-8
                "
            >

                <div

                    className="
                        max-w-5xl
                        mx-auto
                        space-y-6
                    "
                >

                    {

                        messages.map(

                            (message) => (

                                <div

                                    key={message.id}

                                    className={`
                                        flex

                                        ${
                                            message.role
                                            === "user"

                                                ? "justify-end"

                                                : "justify-start w-full"
                                        }
                                    `}
                                >

                                    {

                                        message.role === "user"

                                            ? (

                                                <div

                                                    className="
                                                        max-w-[70%]
                                                        px-5
                                                        py-3
                                                        rounded-3xl
                                                        bg-cyan-500
                                                        text-black
                                                        shadow-lg
                                                    "
                                                >

                                                    {message.content}

                                                </div>

                                            )

                                            : (

                                                <div

                                                    className="
                                                        w-full
                                                        flex
                                                        gap-4
                                                        items-start
                                                    "
                                                >

                                                    <div

                                                        className="
                                                            w-8
                                                            h-8
                                                            rounded-xl
                                                            bg-cyan-500/15
                                                            border
                                                            border-cyan-500/50
                                                            flex
                                                            items-center
                                                            justify-center
                                                            shrink-0
                                                        "
                                                    >

                                                        <div

                                                            className="
                                                                w-3
                                                                h-3
                                                                rounded-full
                                                                border
                                                                border-cyan-400
                                                            "
                                                        />

                                                    </div>

                                                    <div

                                                        className="
                                                            flex-1
                                                            max-w-3xl
                                                        "
                                                    >

                                                        <div

                                                            className="
                                                                text-sm
                                                                text-zinc-500
                                                                mb-3
                                                                font-medium
                                                            "
                                                        >

                                                            OpenOrbit

                                                        </div>

                                                        <div

                                                            className="
                                                                text-zinc-200
                                                                leading-8

                                                                [&_h1]:text-3xl
                                                                [&_h1]:font-bold
                                                                [&_h1]:mb-4

                                                                [&_h2]:text-2xl
                                                                [&_h2]:font-semibold
                                                                [&_h2]:mb-3

                                                                [&_h3]:text-xl
                                                                [&_h3]:font-semibold

                                                                [&_p]:mb-4

                                                                [&_ul]:list-disc
                                                                [&_ul]:pl-6

                                                                [&_ol]:list-decimal
                                                                [&_ol]:pl-6

                                                                [&_li]:mb-2

                                                                [&_strong]:text-white

                                                                [&_code]:text-cyan-400
                                                                [&_code]:bg-zinc-900
                                                                [&_code]:px-1
                                                                [&_code]:rounded

                                                                [&_pre]:bg-zinc-900
                                                                [&_pre]:border
                                                                [&_pre]:border-zinc-800
                                                                [&_pre]:rounded-xl
                                                                [&_pre]:p-4
                                                                [&_pre]:overflow-x-auto
                                                            "
                                                        >

                                                            <div>

                                                        

                                                                {message.content}

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                    }

                                </div>
                            )
                        )
                    }

                    <div

                        ref={bottomRef}

                    />

                </div>

            </div>
        );
    }


    return (

        <div

            className="
                flex-1
                flex
                items-center
                justify-center
                px-6
            "
        >

            <div

                className="
                    max-w-xl
                    w-full
                "
            >

                <div

                    className="
                        text-center
                    "
                >

                    <h1

                        className="
                            text-3xl
                            font-semibold
                            tracking-tight
                            text-white
                        "
                    >

                        What are we building today?

                    </h1>

                    <p

                        className="
                            mt-4
                            text-lg
                            text-zinc-500
                        "
                    >

                        Your AI engineering workspace is ready.

                    </p>

                </div>

            </div>

        </div>
    );
}

export default ChatWindow;
