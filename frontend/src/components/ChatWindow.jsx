import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import {
    Copy,
    Check,
    RotateCcw,
    ThumbsUp,
    ThumbsDown,
    Pencil,
    X,
    CheckSquare,
    RefreshCw,
    ChevronDown,
    Paperclip,
    Mic,
    ArrowUp
} from "lucide-react";

function ChatWindow({
    messages,
    sending,
    onSendMessage,
    onEditMessage,
    onRegenerate,
    onFeedback,
    onRetry,
    user,
    appName,
    mode,
    setMode
}) {
    const bottomRef = useRef(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState("");
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [welcomeMessage, setWelcomeMessage] = useState("");

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function handleCopy(messageId, text) {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(messageId);
        setTimeout(() => {
            setCopiedMessageId(null);
        }, 2000);
    }

    function formatTime(isoString) {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return "";
        }
    }

    if (messages?.length > 0) {
        return (
            <div className="flex-1 overflow-y-auto px-6 py-8 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
                <div className="max-w-5xl mx-auto space-y-6">
                    {messages.map((message, index) => {
                        const isLast = index === messages.length - 1;
                        const isUser = message.role === "user";

                        // Avatar Grouping check:
                        // Show avatar for assistant message only if the previous message was not an assistant message
                        const showAvatar = !isUser && (index === 0 || messages[index - 1].role !== "assistant");

                        if (isUser) {
                            const isEditing = editingMessageId === message.id;

                            return (
                                <div key={message.id} className="flex justify-end w-full group animate-fade-in-up">
                                    {isEditing ? (
                                        <div className="w-full max-w-[80%] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 shadow-xl flex flex-col gap-3">
                                            <textarea
                                                className="w-full bg-transparent text-[var(--text-primary)] outline-none resize-none min-h-[60px] text-[14px]"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                            />
                                            <div className="flex justify-end gap-2 text-xs">
                                                <button
                                                    onClick={() => setEditingMessageId(null)}
                                                    className="px-3 py-1.5 rounded-xl hover:bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer flex items-center gap-1"
                                                >
                                                    <X size={13} />
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onEditMessage(message.id, editText);
                                                        setEditingMessageId(null);
                                                    }}
                                                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition cursor-pointer flex items-center gap-1"
                                                >
                                                    <CheckSquare size={13} />
                                                    Save & Submit
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-w-[85%] flex flex-col items-end">
                                            <div className="px-4.5 py-2.5 rounded-3xl bg-cyan-500 text-black shadow-lg break-words w-full text-[15px] leading-relaxed">
                                                {message.content}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500 pr-2 select-none font-mono-tech">
                                                <span>{formatTime(message.created_at)}</span>
                                                <div className="flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={() => handleCopy(message.id, message.content)}
                                                        className="hover:text-[var(--text-primary)] transition duration-150 active:scale-95 cursor-pointer"
                                                        title="Copy message"
                                                    >
                                                        {copiedMessageId === message.id ? <Check size={11} className="text-green-500 animate-pulse" /> : <Copy size={11} />}
                                                    </button>
                                                    {!sending && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingMessageId(message.id);
                                                                setEditText(message.content);
                                                            }}
                                                            className="hover:text-[var(--text-primary)] transition duration-150 active:scale-95 cursor-pointer"
                                                            title="Edit message"
                                                        >
                                                            <Pencil size={11} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        } else {
                            // Assistant message
                            const isEmptyResponse = !message.content || message.content.trim() === "";

                            return (
                                <div key={message.id} className="flex justify-start w-full group animate-fade-in-up">
                                    <div className="w-full flex gap-3.5 items-start">
                                        {/* Avatar placement */}
                                        <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/50 flex items-center justify-center shrink-0">
                                            {showAvatar ? (
                                                <div className="w-3 h-3 rounded-full border border-cyan-400" />
                                            ) : (
                                                // Spacer to keep layout intact while hiding duplicate avatars
                                                <div className="w-3 h-3 opacity-0" />
                                            )}
                                        </div>

                                        <div className="flex-1 max-w-5xl">
                                            {showAvatar && (
                                                <div className="text-sm text-[var(--text-secondary)] mb-1 font-semibold select-none font-display">
                                                    {appName || "OpenOrbit"}
                                                </div>
                                            )}
                                            <div className="text-[var(--text-primary)] leading-8 markdown-content [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_strong]:text-[var(--text-primary)] [&_strong]:font-bold [&_code]:text-cyan-500 [&_code]:bg-[var(--bg-secondary)] [&_code]:border [&_code]:border-[var(--border-color)] [&_code]:px-1 [&_code]:rounded [&_pre]:bg-[var(--bg-secondary)] [&_pre]:border [&_pre]:border-[var(--border-color)] [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto text-[15px]">
                                                {isEmptyResponse ? (
                                                    <div className="flex items-center gap-2 text-zinc-500 italic text-sm py-1">
                                                        {message.status ? (
                                                            <span className="flex items-center gap-2 text-cyan-400 italic text-xs font-mono-tech select-none animate-pulse">
                                                                <RefreshCw size={11} className="animate-spin text-cyan-400" />
                                                                {message.status}
                                                            </span>
                                                        ) : sending && isLast ? (
                                                            <>
                                                                <RefreshCw size={13} className="animate-spin text-cyan-500" />
                                                                {appName || "OpenOrbit"} is typing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Generation failed or empty response.
                                                                {isLast && (
                                                                    <button
                                                                        onClick={onRetry}
                                                                        className="ml-2 font-semibold text-cyan-400 hover:text-cyan-300 transition not-italic flex items-center gap-1"
                                                                    >
                                                                        <RotateCcw size={12} /> Retry
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <ReactMarkdown>
                                                        {message.content + (sending && isLast ? " ▋" : "")}
                                                    </ReactMarkdown>
                                                )}
                                            </div>

                                            {/* Source Cards */}
                                            {message.sources && message.sources.length > 0 && (
                                                <div className="mt-3.5 mb-2 border-t border-[var(--border-color)]/40 pt-3.5 animate-fade-in-up">
                                                    <div className="font-mono-tech text-[9px] uppercase tracking-wider text-zinc-500 mb-2 select-none">
                                                        Sources
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {message.sources.map((src, sIdx) => (
                                                            <a
                                                                key={sIdx}
                                                                href={src.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[11px] text-cyan-400 hover:text-cyan-300 hover:bg-white/[0.02] hover:border-cyan-500/20 transition duration-150 select-none shadow-sm cursor-pointer"
                                                            >
                                                                <span className="text-[10px] text-zinc-500">🔗</span>
                                                                <span className="font-medium truncate max-w-[150px]">{src.title || src.domain}</span>
                                                                <span className="text-[9px] font-mono-tech text-zinc-500 uppercase tracking-tight ml-1">{src.domain}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {!isEmptyResponse && (
                                                (sending && isLast) ? null : (
                                                    <div className="flex items-center gap-3.5 mt-2.5 text-[11px] text-zinc-500">
                                                        <span>{formatTime(message.created_at)}</span>
                                                        <button
                                                            onClick={() => handleCopy(message.id, message.content)}
                                                            className="hover:text-zinc-300 transition duration-150 active:scale-95"
                                                            title="Copy response"
                                                        >
                                                            {copiedMessageId === message.id ? <Check size={12} className="text-green-500 animate-pulse" /> : <Copy size={12} />}
                                                        </button>
                                                        <button
                                                            onClick={() => onFeedback(message.id, message.feedback === "like" ? null : "like")}
                                                            className="hover:text-zinc-300 transition duration-200 active:scale-90 hover:scale-110"
                                                            title="Like response"
                                                        >
                                                            <ThumbsUp size={12} className={message.feedback === "like" ? "text-cyan-400 fill-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.4)]" : ""} />
                                                        </button>
                                                        <button
                                                            onClick={() => onFeedback(message.id, message.feedback === "dislike" ? null : "dislike")}
                                                            className="hover:text-zinc-300 transition duration-200 active:scale-90 hover:scale-110"
                                                            title="Dislike response"
                                                        >
                                                            <ThumbsDown size={12} className={message.feedback === "dislike" ? "text-red-500 fill-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]" : ""} />
                                                        </button>
                                                        {isLast && !sending && (
                                                            <button
                                                                onClick={onRegenerate}
                                                                className="hover:text-zinc-300 transition duration-150 active:scale-95 flex items-center gap-1"
                                                                title="Regenerate response"
                                                            >
                                                                <RotateCcw size={12} />
                                                                Regenerate
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                    <div ref={bottomRef} />
                </div>
            </div>
        );
    }

    // Welcoming empty state with Perplexity/Claude-like interface
    const greetingObj = (() => {
        const hr = new Date().getHours();
        if (hr < 12) return { text: "Good Morning", emoji: "🌅" };
        if (hr < 17) return { text: "Good Afternoon", emoji: "☀️" };
        return { text: "Good Evening", emoji: "🌙" };
    })();

    const firstName = (() => {
        if (!user?.email) return "Rutvik";
        const part = user.email.split("@")[0];
        if (part.toLowerCase().startsWith("rutvik")) {
            return "Rutvik";
        }
        const name = part.split(/[.0-9]/)[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    })();


    function handleWelcomeSend() {
        if (!welcomeMessage.trim()) return;
        const msg = welcomeMessage;
        setWelcomeMessage("");
        onSendMessage(msg, mode);
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 bg-[var(--bg-primary)] h-full relative overflow-hidden bg-cyber-grid transition-colors duration-300">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.02] blur-[120px] pointer-events-none" />

            <div className="max-w-2xl w-full flex flex-col items-center select-none relative z-10">
                {/* Greeting Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="font-display text-2xl md:text-3xl font-light tracking-wide text-[var(--text-primary)] select-none mb-1.5 flex items-center justify-center gap-2.5">
                        <span>{greetingObj.emoji}</span>
                        <span className="bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
                            {greetingObj.text}, {firstName}
                        </span>
                    </div>
                    <h1 className="font-mono-tech text-[10px] tracking-widest text-zinc-500 font-medium select-none uppercase">
                        What can I help with today?
                    </h1>
                </div>

                {/* Mode Selector Toggle */}
                <div className="flex items-center gap-3 mb-4.5 pl-2.5">
                    <button
                        type="button"
                        onClick={() => setMode("chat")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-display font-medium tracking-wide uppercase transition cursor-pointer select-none border border-transparent ${
                            mode === "chat"
                                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-semibold"
                                : "text-zinc-500 hover:text-zinc-350 hover:bg-white/[0.02]"
                        }`}
                    >
                        💬 Chat
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("research")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-display font-medium tracking-wide uppercase transition cursor-pointer select-none border border-transparent ${
                            mode === "research"
                                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-semibold shadow-sm"
                                : "text-zinc-500 hover:text-zinc-350 hover:bg-white/[0.02]"
                        }`}
                    >
                        🌐 Research
                    </button>
                </div>

                {/* Hero Input Box */}
                <div className="w-full bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] hover:border-zinc-500/20 rounded-3xl p-4.5 flex flex-col justify-between min-h-[140px] shadow-[0_20px_50px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-300 focus-within:border-cyan-500/30 focus-within:shadow-[0_0_50px_rgba(6,182,212,0.03),0_0_20px_rgba(6,182,212,0.01),inset_0_1px_0_rgba(255,255,255,0.01)]">
                    <textarea
                        rows={2}
                        value={welcomeMessage}
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleWelcomeSend();
                            }
                        }}
                        placeholder="Ask anything about code, research, writing or ideas..."
                        className="w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-zinc-500 resize-none overflow-y-auto text-[13px] leading-relaxed py-1 min-h-[60px]"
                    />

                    {/* Bottom Toolbar */}
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 rounded-xl hover:bg-white/[0.03] text-zinc-500 hover:text-zinc-350 transition-colors border border-transparent hover:border-white/[0.03]"
                                title="Attach files"
                            >
                                <Paperclip size={15} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Model Selector badge inside Input toolbar */}
                            <div
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[9px] font-mono-tech text-zinc-500 hover:text-zinc-350 font-medium select-none shadow-sm cursor-pointer hover:border-zinc-800 transition-colors"
                                title="Active Model"
                            >
                                <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.6)]" />
                                <span>LLAMA-3.3</span>
                                <ChevronDown size={9} className="text-zinc-500 mt-0.5" />
                            </div>

                            <button
                                className="p-2 rounded-xl hover:bg-white/[0.03] text-zinc-500 hover:text-zinc-350 transition-colors border border-transparent hover:border-white/[0.03]"
                                title="Use Microphone"
                            >
                                <Mic size={14} />
                            </button>

                            <button
                                type="button"
                                disabled={!welcomeMessage.trim()}
                                onClick={handleWelcomeSend}
                                className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-cyan-500 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 text-black cursor-pointer shadow-md"
                                title="Send Message"
                            >
                                <ArrowUp size={14} className="stroke-[2.5] pointer-events-none" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;
