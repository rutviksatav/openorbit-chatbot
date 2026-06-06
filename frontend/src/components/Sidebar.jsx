import {

    Plus,

    Search,

    MessageSquare,

    Trash2

} from "lucide-react";

function Sidebar({

    user,

    open,

    sessions,

    activeSession,

    onSelectSession,

    onNewChat,

    onDeleteChat

}){

    return (

        <aside

            className={`

                ${
                    open

                        ? "w-72"

                        : "w-16"
                }

                h-screen
                bg-[#111111]
                border-r
                border-zinc-800
                flex
                flex-col
                transition-all
                duration-300
            `}
        >

            <div

                className="
                    px-5
                    py-5
                "
            >

                <div

                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    <div

                        className="
                            w-9
                            h-9
                            rounded-xl
                            bg-cyan-500/15
                            border
                            border-cyan-500/50
                            flex
                            items-center
                            justify-center
                        "
                    >

                        <div

                            className="
                                w-4
                                h-4
                                rounded-full
                                border
                                border-cyan-400
                            "
                        />

                    </div>

                    {

                        open && (

                            <span

                                className="
                                    text-xl
                                    font-semibold
                                    text-zinc-100
                                "
                            >

                                OpenOrbit

                            </span>
                        )
                    }

                </div>

            </div>


            <div

                className="
                    px-3
                    space-y-2
                "
            >

                <button

                    onClick={onNewChat}

                    className={`
                        w-full
                        flex
                        items-center
                        ${open ? "justify-start" : "justify-center"}
                        gap-3
                        px-3
                        py-3
                        rounded-xl
                        text-zinc-100
                        hover:bg-zinc-900
                        transition
                    `}
                >

                    <Plus size={18} />

                    {

                        open && (

                            <span>

                                New Chat

                            </span>

                        )
                    }

                </button>


                <button

                    className={`
                        w-full
                        flex
                        items-center
                        ${open ? "justify-start" : "justify-center"}
                        gap-3
                        px-3
                        py-3
                        rounded-xl
                        text-zinc-100
                        hover:bg-zinc-900
                        transition
                    `}
                >

                    <Search size={18} />

                    {

                        open && (

                            <span>

                                Search Chat

                            </span>

                        )
                    }

                </button>

            </div>


            <div

                className="
                    mt-8
                    px-4
                "
            >

                <p

                    className="
                        text-xs
                        uppercase
                        tracking-wider
                        text-zinc-500
                    "
                >

                    {

                        open && (

                            <span>

                                Recent

                            </span>

                        )
                    }

                </p>

            </div>


            <div

                className="
                    mt-3
                    flex-1
                    overflow-y-auto
                    px-2
                "
            >

                {

                    sessions?.map(

                        (session) => (

                            <div

                                key={session.id}

                                className="
                                    group
                                    relative
                                "
                            >

                                <button

                                    onClick={() =>

                                        onSelectSession(
                                            session
                                        )
                                    }

                                    className={`
                                        w-full
                                        flex
                                        items-center

                                        ${
                                            open

                                                ? "justify-start"

                                                : "justify-center"
                                        }

                                        gap-3
                                        px-3
                                        py-3
                                        rounded-xl

                                        ${
                                            activeSession?.id
                                            === session.id

                                                ? "bg-zinc-900 text-white"

                                                : "text-zinc-400 hover:bg-zinc-900"
                                        }

                                        transition
                                    `}
                                >

                                    <MessageSquare
                                        size={16}
                                    />

                                    {

                                        open && (

                                            <span

                                                className="
                                                    truncate
                                                    pr-8
                                                "
                                            >

                                                {session.title}

                                            </span>

                                        )
                                    }

                                </button>

                                {

                                    open && (

                                        <button

                                            onClick={(event) => {

                                                event.stopPropagation();

                                                const confirmed =

                                                    window.confirm(

                                                        "Delete this chat?"

                                                    );

                                                if (

                                                    confirmed

                                                ) {

                                                    console.log(
                                                        "DELETE CLICKED",
                                                        session.id
                                                    );

                                                    onDeleteChat(
                                                        session.id
                                                    );
                                                }
                                            }}

                                            className="
                                                absolute
                                                right-2
                                                top-1/2
                                                -translate-y-1/2

                                                opacity-0
                                                group-hover:opacity-100

                                                p-1.5
                                                rounded-lg

                                                hover:bg-red-500/20

                                                transition
                                            "
                                        >

                                            <Trash2

                                                size={14}

                                                className="
                                                    text-zinc-500
                                                    hover:text-red-400
                                                "
                                            />

                                        </button>
                                    )
                                }

                            </div>
                        )
                    )
                }

            </div>


            <div

                className="
                    border-t
                    border-zinc-800
                    p-4
                "
            >

                {

                    open && (

                        <div

                            className="
                                text-sm
                                text-zinc-400
                                truncate
                            "
                        >

                            {user?.email}

                        </div>
                    )
                }

            </div>

        </aside>
    );
}

export default Sidebar;
