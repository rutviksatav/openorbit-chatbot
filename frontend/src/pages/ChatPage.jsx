import {
    useState,
    useEffect,
    useRef
} from "react";

import {
    X,
    User,
    Mail,
    Sun,
    Moon,
    Trash2,
    Save,
    Settings
} from "lucide-react";

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

    getMessages,

    sendMessage,

    streamMessage,

    editMessage,

    deleteLastMessage,

    submitFeedback

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

    const [sending, setSending] = useState(false);
    const eventSourceRef = useRef(null);

    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("openorbit_theme") || "dark";
    });
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");

    useEffect(() => {
        if (showSettingsModal && user) {
            setEditName(user.name || user.email.split('@')[0]);
            setEditEmail(user.email || "");
        }
    }, [showSettingsModal, user]);

    useEffect(() => {
        if (theme === "light") {
            document.documentElement.classList.add("light");
            localStorage.setItem("openorbit_theme", "light");
        } else {
            document.documentElement.classList.remove("light");
            localStorage.setItem("openorbit_theme", "dark");
        }
    }, [theme]);

    // Stop current message stream
    function handleStopMessage() {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        if (activeSession) {
            getMessages(activeSession.id)
                .then(messagesData => {
                    setMessages(messagesData);
                })
                .catch(err => {
                    console.error("Failed to sync messages:", err);
                })
                .finally(() => {
                    setSending(false);
                });
        } else {
            setSending(false);
        }
    }

    // Helper to start the stream
    function startStreaming(sessionId, assistantId) {
        setSending(true);

        const eventSource = streamMessage(
            sessionId,
            (chunk) => {
                setMessages(prev => {
                    const updated = [...prev];
                    const idx = updated.findIndex(m => m.id === assistantId);
                    if (idx === -1) return prev;

                    updated[idx] = {
                        ...updated[idx],
                        content: updated[idx].content + chunk
                    };
                    return updated;
                });
            }
        );

        eventSourceRef.current = eventSource;

        eventSource.onerror = () => {
            eventSource.close();
            if (eventSourceRef.current === eventSource) {
                eventSourceRef.current = null;
            }
            setSending(false);
        };

        eventSource.addEventListener("done", () => {
            eventSource.close();
            if (eventSourceRef.current === eventSource) {
                eventSourceRef.current = null;
            }

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
        });
    }

    // Callback when sending a new message
    async function handleSendMessage(content) {

        if (sending) {
            return;
        }

        let session = activeSession;

        if (!session) {

            session = await createSession();

            setSessions(prev => [
                session,
                ...prev
            ]);

            setActiveSession(session);
        }

        try {

            setSending(true);

            const assistantId =
                `assistant-${Date.now()}`;

            setMessages(prev => [
                ...prev,
                {
                    id: `user-${Date.now()}`,
                    role: "user",
                    content
                },
                {
                    id: assistantId,
                    role: "assistant",
                    content: ""
                }
            ]);

            await sendMessage(
                session.id,
                content
            );

            startStreaming(
                session.id,
                assistantId
            );

        } catch (error) {

            console.error(error);

            setSending(false);
        }
    }

    // Callback when regenerating response
    async function handleRegenerateResponse() {
        if (!activeSession || sending) return;

        try {
            setSending(true);
            await deleteLastMessage(activeSession.id);

            // Sync with backend to remove the last message
            const messagesData = await getMessages(activeSession.id);

            const assistantId = `assistant-${Date.now()}`;
            setMessages([
                ...messagesData,
                {
                    id: assistantId,
                    role: "assistant",
                    content: "",
                    created_at: new Date().toISOString()
                }
            ]);

            startStreaming(activeSession.id, assistantId);
        } catch (error) {
            console.error("Failed to regenerate response:", error);
            setSending(false);
        }
    }

    // Callback when editing a prompt
    async function handleEditPrompt(messageId, newContent) {
        if (!activeSession || sending) return;

        try {
            setSending(true);
            await editMessage(activeSession.id, messageId, newContent);

            // Sync with backend to remove all subsequent messages
            const messagesData = await getMessages(activeSession.id);

            const assistantId = `assistant-${Date.now()}`;
            setMessages([
                ...messagesData,
                {
                    id: assistantId,
                    role: "assistant",
                    content: "",
                    created_at: new Date().toISOString()
                }
            ]);

            startStreaming(activeSession.id, assistantId);
        } catch (error) {
            console.error("Failed to edit prompt:", error);
            setSending(false);
        }
    }

    // Callback when adding feedback (like/dislike)
    async function handleFeedback(messageId, type) {
        if (!activeSession) return;

        try {
            // Optimistically update the UI feedback value
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: type } : m));
            await submitFeedback(activeSession.id, messageId, type);
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            // Revert state on error
            const messagesData = await getMessages(activeSession.id);
            setMessages(messagesData);
        }
    }

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

                const localName = localStorage.getItem("openorbit_profile_name");
                const localEmail = localStorage.getItem("openorbit_profile_email");
                if (localName) data.name = localName;
                if (localEmail) data.email = localEmail;

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

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setSending(false);
        }

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
        if (activeSession && messages.length === 0) {
            return;
        }

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

            }
        }
        catch (error) {
            console.error(
                error
            );
        }
    }

    async function handleDeleteAllChats() {
        const confirmed = window.confirm("Are you sure you want to delete all chats? This cannot be undone.");
        if (!confirmed) return;
        try {
            for (const session of sessions) {
                await deleteSession(session.id);
            }
            const updated = await getSessions();
            setSessions(updated);
            setActiveSession(updated[0] || null);
            setMessages([]);
            setShowSettingsModal(false);
        } catch (error) {
            console.error("Failed to delete all chats:", error);
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
                bg-[var(--bg-primary)]
                flex
                transition-colors
                duration-300
            "
        >
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
                />
            )}

            <Sidebar
                user={user}
                open={sidebarOpen}
                sessions={sessions}
                activeSession={activeSession}
                onSelectSession={setActiveSession}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onOpenSettings={() => setShowSettingsModal(true)}
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

                    activeSessionTitle={activeSession?.title}

                />

                <ChatWindow

                    messages={messages}

                    sending={sending}

                    onSendMessage={handleSendMessage}

                    onEditMessage={handleEditPrompt}

                    onRegenerate={handleRegenerateResponse}

                    onFeedback={handleFeedback}

                    user={user}

                    onRetry={() => {
                        if (messages.length > 0) {
                            const lastMsg = messages[messages.length - 1];
                            if (lastMsg.role === "assistant") {
                                startStreaming(activeSession.id, lastMsg.id);
                            }
                        }
                    }}

                />

                {messages.length > 0 && (
                    <MessageInput
                        sessionId={activeSession?.id}
                        sending={sending}
                        onSendMessage={handleSendMessage}
                        onStopMessage={handleStopMessage}
                    />
                )}

            </div>

            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up text-[var(--text-primary)]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3.5 mb-5">
                            <h3 className="font-display font-semibold text-sm tracking-wide uppercase flex items-center gap-2">
                                <Settings size={14} className="text-cyan-400" />
                                Chatbot Settings
                            </h3>
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="p-1 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-355 transition-colors cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Profile Settings */}
                        <div className="space-y-4">
                            <div>
                                <label className="block font-mono-tech text-[9px] uppercase tracking-wider text-zinc-500 mb-1.5 select-none">
                                    Display Name
                                </label>
                                <div className="relative">
                                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-8.5 pr-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-cyan-500/35 transition"
                                        placeholder="User Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-mono-tech text-[9px] uppercase tracking-wider text-zinc-500 mb-1.5 select-none">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-8.5 pr-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-cyan-500/35 transition"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>

                            {/* Theme Change Toggle */}
                            <div>
                                <label className="block font-mono-tech text-[9px] uppercase tracking-wider text-zinc-550 mb-1.5 select-none">
                                    Interface Theme
                                </label>
                                <button
                                    onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-white/[0.02] text-xs font-medium transition cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        {theme === "dark" ? (
                                            <>
                                                <Moon size={13} className="text-cyan-400" />
                                                <span>Dark Mode</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sun size={13} className="text-amber-500" />
                                                <span>Light Mode</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-[9px] text-zinc-500 uppercase font-mono-tech">Toggle</span>
                                </button>
                            </div>

                            {/* Delete Chats */}
                            <div className="pt-2">
                                <button
                                    onClick={handleDeleteAllChats}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-semibold tracking-wide transition cursor-pointer"
                                >
                                    <Trash2 size={13} />
                                    <span>DELETE ALL CHATS</span>
                                </button>
                            </div>
                        </div>

                        {/* Save Actions */}
                        <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-end gap-2.5">
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-[var(--text-primary)] hover:bg-white/[0.02] transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem("openorbit_profile_name", editName);
                                    localStorage.setItem("openorbit_profile_email", editEmail);
                                    setUser(prev => ({
                                        ...prev,
                                        name: editName,
                                        email: editEmail
                                    }));
                                    setShowSettingsModal(false);
                                }}
                                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs tracking-wide transition cursor-pointer flex items-center gap-1.5 shadow-md"
                            >
                                <Save size={13} />
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatPage;
