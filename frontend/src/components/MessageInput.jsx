import { useState } from "react";
import { Paperclip, Mic, ArrowUp, Square, ChevronDown } from "lucide-react";

function MessageInput({
    sending,
    onSendMessage,
    onStopMessage,
    mode,
    setMode
}) {
    const [message, setMessage] = useState("");

    function handleStop() {
        onStopMessage();
    }

    async function handleSend() {
        if (!message.trim() || sending) {
            return;
        }

        const userMessage = message;
        setMessage("");

        const textarea = document.querySelector("textarea");
        if (textarea) {
            textarea.style.height = "auto";
        }

        onSendMessage(userMessage, mode);
    }

    return (
        <div className="py-3 px-5 shrink-0 bg-[var(--bg-primary)]/60 backdrop-blur-md transition-colors duration-300">
            <div className="max-w-4xl mx-auto animate-fade-in-up">
                {/* Mode Selector Toggle */}
                <div className="flex items-center gap-3 mb-2.5 pl-2.5">
                    <button
                        type="button"
                        onClick={() => setMode("chat")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-display font-medium tracking-wide uppercase transition cursor-pointer select-none border border-transparent ${
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-display font-medium tracking-wide uppercase transition cursor-pointer select-none border border-transparent ${
                            mode === "research"
                                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-semibold shadow-sm"
                                : "text-zinc-500 hover:text-zinc-350 hover:bg-white/[0.02]"
                        }`}
                    >
                        🌐 Research
                    </button>
                </div>

                <div className="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] hover:border-zinc-500/20 rounded-3xl p-4.5 shadow-[0_20px_50px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-300 focus-within:border-cyan-500/30 focus-within:shadow-[0_0_50px_rgba(6,182,212,0.03),0_0_20px_rgba(6,182,212,0.01),inset_0_1px_0_rgba(255,255,255,0.01)]">
                    <textarea
                        rows={1}
                        value={message}
                        disabled={sending}
                        onChange={(event) => {
                            setMessage(event.target.value);
                            event.target.style.height = "auto";
                            event.target.style.height = `${event.target.scrollHeight}px`;
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
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
                            text-[var(--text-primary)]
                            outline-none
                            placeholder:text-zinc-500
                            disabled:opacity-60
                            resize-none
                            overflow-y-auto
                            min-h-[60px]
                            max-h-[200px]
                            text-[13px]
                            leading-relaxed
                            py-1
                        "
                    />

                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 rounded-xl hover:bg-white/[0.03] text-zinc-500 hover:text-zinc-350 transition-colors border border-transparent hover:border-white/[0.03] cursor-pointer"
                                title="Attach files"
                            >
                                <Paperclip size={15} />
                            </button>
                            <button
                                className="p-2 rounded-xl hover:bg-white/[0.03] text-zinc-500 hover:text-zinc-350 transition-colors border border-transparent hover:border-white/[0.03] cursor-pointer"
                                title="Use Microphone"
                            >
                                <Mic size={14} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Model Selector badge inside Input toolbar */}
                            <div
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[9px] font-mono-tech text-zinc-500 hover:text-zinc-350 font-medium select-none shadow-sm cursor-pointer hover:border-zinc-800 transition-colors"
                                title="Active Model"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.6)]" />
                                <span>LLAMA-3.3</span>
                                <ChevronDown size={9} className="text-zinc-500 mt-0.5" />
                            </div>

                            <button
                                type="button"
                                disabled={!sending && !message.trim()}
                                onClick={sending ? handleStop : handleSend}
                                className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-cyan-500 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 text-black cursor-pointer shadow-md"
                                title={sending ? "Stop Generation" : "Send Message"}
                            >
                                {sending ? (
                                    <Square size={12} className="fill-black text-black stroke-[2.5] pointer-events-none" />
                                ) : (
                                    <ArrowUp size={14} className="stroke-[2.5] pointer-events-none" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageInput;
