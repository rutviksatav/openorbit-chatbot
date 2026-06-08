import { useState } from "react";
import {
    Plus,
    Search,
    MessageSquare,
    Trash2,
    X,
    ChevronDown,
    ChevronRight,
    Settings,
    LogOut
} from "lucide-react";

function Sidebar({
    user,
    open,
    sessions,
    activeSession,
    onSelectSession,
    onNewChat,
    onDeleteChat,
    onToggleSidebar,
    onOpenSettings,
    onLogout,
    appName
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getSortedSessions = () => {
        // Filter sessions by query
        const filtered = sessions ? [...sessions].filter(session =>
            session.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) : [];

        // Sort all chats in descending order of created_at (newest first)
        filtered.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });

        return filtered;
    };

    const sortedSessions = getSortedSessions();
    const totalCount = sortedSessions.length;

    function renderSessionList(list) {
        return list.map((session) => (
            <div
                key={session.id}
                className="group relative px-0.5 py-0.5"
            >
                <button
                    onClick={() => onSelectSession(session)}
                    title={session.title}
                    className={`
                        w-full
                        flex
                        items-center
                        ${open ? "justify-start" : "justify-center"}
                        gap-3
                        px-3
                        py-2.5
                        rounded-xl
                        transition-all
                        duration-150
                        ${
                            activeSession?.id === session.id
                                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm font-medium"
                                : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/60 hover:text-[var(--text-primary)] border border-transparent"
                        }
                    `}
                >
                    <MessageSquare
                        size={15}
                        className={activeSession?.id === session.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}
                    />

                    {open && (
                        <span className="truncate pr-8 text-[13px]">
                            {session.title}
                        </span>
                    )}
                </button>

                {open && (
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            const confirmed = window.confirm("Delete this chat?");
                            if (confirmed) {
                                onDeleteChat(session.id);
                            }
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 transition-all duration-150"
                    >
                        <Trash2
                            size={13}
                            className="text-zinc-500 hover:text-red-400"
                        />
                    </button>
                )}
            </div>
        ));
    }

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50
                md:relative md:inset-auto md:z-30
                ${open ? "w-64 translate-x-0" : "w-16 -translate-x-full md:translate-x-0"}
                h-screen
                bg-[var(--bg-secondary)]
                border-r border-[var(--border-color)]
                flex
                flex-col
                transition-all
                duration-300
            `}
        >
            {/* Logo */}
            <div className="px-5 py-5 shrink-0 flex items-center justify-between">
                <button
                    onClick={onNewChat}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity text-left bg-transparent border-0 p-0 outline-none"
                >
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/55 flex items-center justify-center shrink-0">
                        <div className="w-3.5 h-3.5 rounded-full border border-cyan-400" />
                    </div>
                    {open && (
                        <span className="font-display text-sm font-semibold text-[var(--text-primary)] tracking-widest select-none uppercase">
                            {appName || "OpenOrbit"}
                        </span>
                    )}
                </button>
                {/* Mobile Drawer Close Button */}
                {open && onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className="md:hidden p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Close sidebar"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Sticky Actions */}
            <div className="px-3 space-y-2 shrink-0">
                <button
                    onClick={onNewChat}
                    className={`
                        w-full
                        flex
                        items-center
                        ${open ? "justify-start pl-3" : "justify-center"}
                        gap-3
                        px-3
                        py-2.5
                        rounded-xl
                        bg-[var(--bg-primary)]/80
                        text-[var(--text-primary)]
                        border border-[var(--border-color)]
                        hover:bg-[var(--bg-primary)]
                        transition-all
                        duration-200
                        font-medium
                        text-sm
                    `}
                >
                    <Plus size={18} className="text-cyan-400" />
                    {open && <span>New Chat</span>}
                </button>

                {open ? (
                    <div className="relative">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search chats..."
                            className="w-full bg-[var(--bg-primary)] rounded-xl pl-9 pr-8 py-2 text-[13px] text-[var(--text-primary)] placeholder:text-zinc-500 border border-[var(--border-color)] outline-none focus:ring-1 focus:ring-cyan-500/10 transition-all duration-200"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={onToggleSidebar}
                        className="w-full flex items-center justify-center py-2.5 rounded-xl text-zinc-450 hover:bg-zinc-800/60 transition-all duration-200"
                        title="Search chats"
                    >
                        <Search size={18} />
                    </button>
                )}
            </div>

            {/* Section Header */}
            {open && (
                <div className="mt-6 px-5 shrink-0 select-none flex items-center justify-between">
                    <p className="font-mono-tech text-[9px] uppercase tracking-[0.15em] text-zinc-500">
                        {searchQuery ? `Search Results (${totalCount})` : `Recent (${totalCount})`}
                    </p>
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 rounded hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-350 transition-colors cursor-pointer"
                        title={isCollapsed ? "Expand list" : "Collapse list"}
                    >
                        {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                    </button>
                </div>
            )}

            {/* Scrollable list */}
            <div className="mt-3 flex-1 overflow-y-auto px-2 space-y-0.5">
                {!isCollapsed && renderSessionList(sortedSessions)}
                
                {!isCollapsed && open && totalCount === 0 && (
                    <div className="text-xs text-zinc-500 text-center py-10 select-none font-medium">
                        No chats found
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 shrink-0 bg-[var(--bg-primary)]/40 border-t border-[var(--border-color)] flex items-center justify-between">
                {open && user ? (
                    <div className="w-full flex items-center justify-between">
                        <div className="flex flex-col min-w-0 pr-1">
                            <span className="text-[10px] text-[var(--text-primary)] font-semibold truncate font-mono-tech select-none">
                                {user.name || user.email.split('@')[0]}
                            </span>
                            <span className="text-[8px] text-[var(--text-secondary)] truncate font-mono-tech select-none mt-0.5">
                                {user.email}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onOpenSettings}
                                className="p-1.5 rounded-lg hover:bg-white/[0.04] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                                title="Settings"
                            >
                                <Settings size={14} />
                            </button>
                            <button
                                onClick={onLogout}
                                className="p-1.5 rounded-lg hover:bg-white/[0.04] text-[var(--text-secondary)] hover:text-red-400 transition-colors cursor-pointer"
                                title="Log Out"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center gap-2">
                        <button
                            onClick={onOpenSettings}
                            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="Settings"
                        >
                            <Settings size={14} />
                        </button>
                        <button
                            onClick={onLogout}
                            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-[var(--text-secondary)] hover:text-red-400 transition-colors cursor-pointer"
                            title="Log Out"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
