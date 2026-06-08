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
    Settings,
    LogOut
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import {
    getCurrentUser,
    login,
    signup
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
    const navigate = useNavigate();

    const [user, setUser] =
        useState(null);
    const [isGuest, setIsGuest] =
        useState(false);

    const [sessions, setSessions] =
        useState([]);

    const [activeSession, setActiveSession] =
        useState(null);

    const [messages, setMessages] =
        useState([]);



    const [sending, setSending] = useState(false);
    const eventSourceRef = useRef(null);

    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("openorbit_theme") || "dark";
    });
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [appName, setAppName] = useState(() => {
        return localStorage.getItem("openorbit_app_name") || "OpenOrbit";
    });
    const [editAppName, setEditAppName] = useState("");


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

                    if (chunk.startsWith("__status__:")) {
                        updated[idx] = {
                            ...updated[idx],
                            status: chunk.substring(11)
                        };
                    } else {
                        updated[idx] = {
                            ...updated[idx],
                            status: null,
                            content: updated[idx].content + chunk
                        };
                    }
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
        if (!user || (isGuest && messages.length >= 2)) {
            setShowAuthModal(true);
            return;
        }

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
                    content,
                    mode: "chat"
                },
                {
                    id: assistantId,
                    role: "assistant",
                    content: ""
                }
            ]);

            await sendMessage(
                session.id,
                content,
                "chat"
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
        if (!user || isGuest) {
            setShowAuthModal(true);
            return;
        }
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
        if (!user || isGuest) {
            setShowAuthModal(true);
            return;
        }
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
        if (!user || isGuest) {
            setShowAuthModal(true);
            return;
        }
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
                let token = localStorage.getItem("token");
                let guestFlag = localStorage.getItem("is_guest") === "true";

                if (!token) {
                    const guestEmail = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}@openorbit.ai`;
                    const guestPassword = "GuestPassword123!";
                    
                    try {
                        await signup(guestEmail, guestPassword);
                        const loginData = await login(guestEmail, guestPassword);
                        token = loginData.access_token;
                        localStorage.setItem("token", token);
                        localStorage.setItem("is_guest", "true");
                        guestFlag = true;
                    } catch (e) {
                        console.error("Failed to create guest session silently:", e);
                    }
                }

                if (token) {
                    const data = await getCurrentUser();
                    const localName = localStorage.getItem("openorbit_profile_name");
                    const localEmail = localStorage.getItem("openorbit_profile_email");
                    if (localName) data.name = localName;
                    if (localEmail) data.email = localEmail;

                    setUser(data);
                    setIsGuest(guestFlag);

                    if (!guestFlag) {
                        const sessionData = await getSessions();
                        setSessions(sessionData);
                    } else {
                        setSessions([]);
                    }
                }

                // Start on new chat welcome page immediately on load
                setActiveSession(null);

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
        if (!user || isGuest) {
            setShowAuthModal(true);
            return;
        }
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
        if (!user || isGuest) {
            setShowAuthModal(true);
            return;
        }

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
        if (!user || isGuest) {
            setShowAuthModal(true);
            return;
        }
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

    function handleOpenSettings() {
        if (user) {
            setEditName(user.name || user.email.split('@')[0]);
            setEditEmail(user.email || "");
            setEditAppName(appName);
        }
        setShowSettingsModal(true);
    }

    function handleLogoutTrigger() {
        setShowLogoutConfirmModal(true);
    }

    function confirmLogout() {
        setShowLogoutConfirmModal(false);
        setShowSettingsModal(false);
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("openorbit_profile_name");
            localStorage.removeItem("openorbit_profile_email");
            setUser(null);
            setSessions([]);
            setActiveSession(null);
            setMessages([]);
            setIsLoggingOut(false);
            navigate("/");
        }, 1200);
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

                Loading {appName}...

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
                isGuest={isGuest}
                open={sidebarOpen}
                sessions={sessions}
                activeSession={activeSession}
                onSelectSession={setActiveSession}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onOpenSettings={handleOpenSettings}
                onLogout={handleLogoutTrigger}
                appName={appName}
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

                    isGuest={isGuest}

                    onRetry={() => {
                        if (messages.length > 0) {
                            const lastMsg = messages[messages.length - 1];
                            if (lastMsg.role === "assistant") {
                                startStreaming(activeSession.id, lastMsg.id);
                            }
                        }
                    }}
                    appName={appName}

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
                                    Application Name
                                </label>
                                <div className="relative">
                                    <Settings size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={editAppName}
                                        onChange={(e) => setEditAppName(e.target.value)}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-8.5 pr-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-cyan-500/35 transition"
                                        placeholder="OpenOrbit"
                                    />
                                </div>
                            </div>

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

                            {/* Log Out */}
                            <div className="pt-2">
                                <button
                                    onClick={handleLogoutTrigger}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-500/20 bg-zinc-500/[0.04] hover:bg-zinc-500/10 text-zinc-400 hover:text-zinc-300 text-xs font-semibold tracking-wide transition cursor-pointer"
                                >
                                    <LogOut size={13} />
                                    <span>LOG OUT</span>
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
                                    localStorage.setItem("openorbit_app_name", editAppName);
                                    setAppName(editAppName);
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

            {/* Premium Logout Confirmation Modal */}
            {showLogoutConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up text-[var(--text-primary)]">
                        {/* Title and Icon */}
                        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3.5 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                                <LogOut size={18} />
                            </div>
                            <div>
                                <h3 className="font-display font-semibold text-sm tracking-wide uppercase">
                                    Confirm Log Out
                                </h3>
                                <p className="text-[9px] font-mono-tech uppercase tracking-wider text-zinc-500 mt-0.5">
                                    Secure Session Termination
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                Are you sure you want to log out of <strong>{appName}</strong>?
                            </p>
                            <p className="text-[10px] text-zinc-500 leading-normal">
                                Your active chat sessions, custom settings, and preferences will be securely saved, and your local authorization credentials will be deleted.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-end gap-2.5">
                            <button
                                onClick={() => setShowLogoutConfirmModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-[var(--text-primary)] hover:bg-white/[0.02] border border-transparent hover:border-[var(--border-color)] transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-black font-semibold text-xs tracking-wide transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-red-500/10"
                            >
                                <LogOut size={13} />
                                Confirm Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Immersive Logout Transition Overlay */}
            {isLoggingOut && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center animate-fade-in">
                    <div className="flex flex-col items-center gap-6 text-center max-w-sm px-4">
                        {/* Branding Icon Container with Pulse */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
                                <div className="w-7 h-7 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                            </div>
                            <div className="absolute -inset-1 rounded-2xl bg-cyan-400/20 blur-sm opacity-50 animate-pulse pointer-events-none" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-base font-display font-semibold text-zinc-150 uppercase tracking-widest select-none">
                                Securing Workspace
                            </h2>
                            <p className="text-xs text-zinc-500 font-mono-tech uppercase tracking-wider animate-pulse">
                                Clearing local credentials...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Auth Gate Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)]/90 border border-[var(--border-color)] rounded-3xl p-7 max-w-sm w-full shadow-2xl animate-fade-in-up text-[var(--text-primary)] relative overflow-hidden backdrop-blur-xl">
                        {/* Glow Background inside modal */}
                        <div className="absolute top-0 right-0 w-[150px] h-[150px] rounded-full bg-cyan-500/[0.05] blur-[30px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[150px] h-[150px] rounded-full bg-indigo-500/[0.05] blur-[30px] pointer-events-none" />

                        {/* Close Button */}
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute right-4.5 top-4.5 p-1.5 rounded-lg hover:bg-white/[0.08] hover:text-white text-zinc-500 transition-all duration-300 hover:rotate-90 cursor-pointer border-0 bg-transparent outline-none"
                        >
                            <X size={15} />
                        </button>

                        <div className="flex flex-col items-center text-center mt-3">
                            {/* Animated Pulsing Neon Orbit Icon (Live Spinning squircle-and-circle logo) */}
                            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                                {/* Ambient glow behind */}
                                <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-md animate-pulse" />
                                
                                {/* Outer squircle rotating live */}
                                <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/50 flex items-center justify-center animate-[spin_8s_linear_infinite] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                    {/* Inner circle pulsing and counter-rotating */}
                                    <div className="w-7 h-7 rounded-full border border-cyan-400 animate-pulse bg-cyan-500/5 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-ping" />
                                        <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-display font-bold text-lg tracking-wide uppercase text-[var(--text-primary)]">
                                Unlock OpenOrbit
                            </h3>
                            <p className="text-[9px] font-mono-tech uppercase tracking-widest text-cyan-400 font-semibold mt-1">
                                Secure Authentication Required
                            </p>

                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-4 mb-6">
                                Sign up or log in to create chats, persist your conversation history, customize workspace settings, and access full AI capabilities.
                            </p>

                            <div className="w-full flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setShowAuthModal(false);
                                        localStorage.removeItem("token");
                                        localStorage.removeItem("is_guest");
                                        setUser(null);
                                        setIsGuest(false);
                                        navigate("/login");
                                    }}
                                    className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-450 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 text-black font-semibold text-xs tracking-wider transition-all duration-300 uppercase cursor-pointer"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAuthModal(false);
                                        localStorage.removeItem("token");
                                        localStorage.removeItem("is_guest");
                                        setUser(null);
                                        setIsGuest(false);
                                        navigate("/signup");
                                    }}
                                    className="w-full py-3 px-4 rounded-xl border border-[var(--border-color)] bg-transparent hover:border-cyan-500/50 hover:bg-cyan-500/[0.02] hover:text-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] active:scale-95 text-[var(--text-primary)] font-semibold text-xs tracking-wider transition-all duration-300 uppercase cursor-pointer"
                                >
                                    Create Free Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatPage;
