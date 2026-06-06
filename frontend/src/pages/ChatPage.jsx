import {

    useState,

    useEffect

} from "react";

import {

    getCurrentUser

} from "../services/auth";

import Sidebar
    from "../components/Sidebar";

import Header
    from "../components/Header";

import ChatWindow
    from "../components/ChatWindow";

import MessageInput
    from "../components/MessageInput";

import {

    getSessions,

    createSession,

    deleteSession

} from "../services/session";

import {

    getMessages

} from "../services/message";


function ChatPage() {

    const [user, setUser] =
        useState(null);

    const [sessions, setSessions] =
        useState([]);

    const [activeSession, setActiveSession] =
        useState(null);

    const [messages, setMessages] =
        useState([]);
    console.log(
        "CHAT PAGE MESSAGES:",
        messages
    );

    const [loading, setLoading] =
        useState(true);

    const [sidebarOpen, setSidebarOpen] =
        useState(true);


    useEffect(() => {

        async function loadUser() {

            try {

                const data =
                    await getCurrentUser();

                setUser(data);

                const sessionData =
                    await getSessions();

                setSessions(
                    sessionData
                );

                if (

                    sessionData.length > 0

                ) {

                    setActiveSession(

                        sessionData[0]

                    );
                }

            }

            catch (err) {

                console.error(err);
            }

            finally {

                setLoading(false);
            }
        }

        loadUser();

    }, []);


    useEffect(() => {

        async function loadMessages() {

            if (!activeSession) {

                return;
            }

            try {

                const messagesData =
                    await getMessages(

                        activeSession.id

                    );

                setMessages(
                    messagesData
                );

            }

            catch (error) {

                console.error(
                    error
                );
            }
        }

        loadMessages();

    }, [activeSession]);


    async function handleNewChat() {

        try {

            const session =

                await createSession();

            const updatedSessions =

                await getSessions();

            setSessions(
                updatedSessions
            );

            setActiveSession(
                session
            );

            setMessages([]);

        }

        catch (error) {

            console.error(
                error
            );
        }
    }


    async function handleDeleteChat(

        sessionId

    ) {

        try {

            await deleteSession(
                sessionId
            );

            const updated =
                await getSessions();

            setSessions(
                updated
            );

            if (

                activeSession?.id
                === sessionId

            ) {

                setActiveSession(

                    updated[0] || null

                );

                setMessages([]);
            }

        }

        catch (error) {

            console.error(
                error
            );
        }
    }


    if (loading) {

        return (

            <div

                className="
                    h-screen
                    bg-[#09090B]
                    text-white
                    flex
                    items-center
                    justify-center
                "
            >

                Loading OpenOrbit...

            </div>
        );
    }


    return (

        <div

            className="
                h-screen
                bg-[#09090B]
                flex
            "
        >

            <Sidebar

                user={user}

                open={sidebarOpen}

                sessions={sessions}

                activeSession={activeSession}

                onSelectSession={

                    setActiveSession

                }

                onNewChat={

                    handleNewChat

                }

                onDeleteChat={

                    handleDeleteChat

                }

            />

            <div

                className="
                    flex-1
                    flex
                    flex-col
                "
            >

                <Header

                    onToggleSidebar={() =>

                        setSidebarOpen(
                            !sidebarOpen
                        )

                    }

                />

                <ChatWindow

                    messages={messages}

                />

                <MessageInput

                    sessionId={
                        activeSession?.id
                    }

                    setMessages={
                        setMessages
                    }

                />

            </div>

        </div>
    );
}

export default ChatPage;
